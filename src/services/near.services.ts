import {
  KeyPair,
  keyStores,
  Near,
  Account,
  utils,
  ConnectedWalletAccount,
  WalletConnection,
  Contract,
} from "near-api-js";
import axios from "axios";
const nearSEED = require("near-seed-phrase");
import { Credential } from "../interfaces/credential.interface";
import { CONFIG, GET_COMISION, ADDRESS_VAULT } from "../helpers/utils";
import { BufferN } from "bitcoinjs-lib/src/types";
import BN from "bn.js";
import dbConnect from "../config/postgres";
import ref from "@ref-finance/ref-sdk";
import {
  ftGetTokensMetadata,
  fetchAllPools,
  estimateSwap,
  instantSwap,
} from "@ref-finance/ref-sdk";
import {
  Action,
  createTransaction,
  functionCall,
} from "near-api-js/lib/transaction";
import { PublicKey } from "near-api-js/lib/utils";
import e from "express";

const NETWORK = process.env.NETWORK || "testnet";
const ETHERSCAN = process.env.ETHERSCAN;

let NEAR: string;

if (process.env.NEAR_ENV === "testnet") {
  NEAR = "testnet";
} else {
  NEAR = "near";
}

const createWalletNEAR = async (mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const keyPair = KeyPair.fromString(walletSeed.secretKey);
  const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString(
    "hex"
  );

  const credential: Credential = {
    name: "NEAR",
    address: implicitAccountId,
    privateKey: walletSeed.secretKey,
  };

  return credential;
};

const importWalletNEAR = async (nearId: string, mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const credential: Credential = {
    name: "NEAR",
    address: nearId,
    privateKey: walletSeed.secretKey,
  };

  return credential;
};

const getIdNear = async (mnemonic: string) => {
  const walletSeed = await nearSEED.parseSeedPhrase(mnemonic);
  const split = String(walletSeed.publicKey).split(":");
  const id = String(split[1]);
  return id;
};

const isAddressNEAR = async (address: string) => {
  const keyStore = new keyStores.InMemoryKeyStore();
  const near = new Near(CONFIG(keyStore));
  const account = new Account(near.connection, address);
  const is_address = await account
    .state()
    .then((response) => {
      return true;
    })
    .catch((error) => {
      return false;
    });
  return is_address;
};

const validatePkNEAR = async (privateKey: string) => {
  try {
    const keyPair = KeyPair.fromString(privateKey);
    const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString(
      "hex"
    );

    const credential: Credential = {
      name: "NEAR",
      address: implicitAccountId,
      privateKey: privateKey,
    };

    return credential;
  } catch (error) {
    return false;
  }
};

const getBalanceNEAR = async (address: string) => {
  try {
    const response: boolean = await validateNearId(address);

    let balanceTotal = 0;

    if (response) {
      const keyStore = new keyStores.InMemoryKeyStore();
      const near = new Near(CONFIG(keyStore));

      const account = new Account(near.connection, address);

      const balanceAccount = await account.state();
      const valueStorage = Math.pow(10, 19);
      const valueYocto = Math.pow(10, 24);
      const storage =
        (balanceAccount.storage_usage * valueStorage) / valueYocto;
      balanceTotal =
        Number(balanceAccount.amount) / valueYocto - storage - 0.05;
      if (balanceTotal === null || balanceTotal < 0) {
        balanceTotal = 0;
      }
      return balanceTotal;
    } else {
      return balanceTotal;
    }
  } catch (error) {
    return 0;
  }
};

const getBalanceTokenNEAR = async (
  address: string,
  srcContract: string,
  decimals: number
) => {
  try {
    console.log(address, decimals, srcContract);
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = new Near(CONFIG(keyStore));

    const account = new Account(near.connection, address);

    // const contract: any = new Contract(account, srcContract, {
    //   changeMethods: [],
    //   viewMethods: ["ft_balance_of"],
    // });

    // console.log(contract);

    const balance = await account.viewFunction({
      contractId: srcContract,
      methodName: "ft_balance_of",
      args: { account_id: address },
    });

    // const balance = contract.ft_balance_of({ account_id: address });

    if (!balance) return 0;

    return balance / Math.pow(10, decimals);
  } catch (error) {
    return 0;
  }
};

async function transactionNEAR(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  coin: string,
  amount: number
) {
  try {
    const balance_user = await getBalanceNEAR(fromAddress);

    const keyStore = new keyStores.InMemoryKeyStore();

    const keyPair = KeyPair.fromString(privateKey);
    keyStore.setKey(NETWORK, fromAddress, keyPair);

    const near = new Near(CONFIG(keyStore));

    const account = new Account(near.connection, fromAddress);

    const resp_comision = await GET_COMISION(coin);
    const vault_address = await ADDRESS_VAULT(coin);

    const nearPrice = await axios.get("https://nearblocks.io/api/near-price");

    const for_vault = resp_comision.transfer / nearPrice.data.usd;

    const amountInYocto = utils.format.parseNearAmount(String(amount));

    const for_vaultYocto = utils.format.parseNearAmount(String(for_vault));

    if (balance_user < amount + for_vault) return false;

    if (!amountInYocto) return false;

    const response = await account.sendMoney(toAddress, new BN(amountInYocto));

    if (for_vaultYocto !== "0" && vault_address && for_vaultYocto) {
      await account.sendMoney(vault_address, new BN(for_vaultYocto));
    }

    if (!response.transaction.hash) return false;

    return response.transaction.hash as string;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const swapPreviewNEAR = async (
  fromCoin: string,
  toCoin: string,
  amount: number,
  blockchain: string,
  address: string
) => {
  try {
    const fromToken: any = await getTokenContractSwap(fromCoin, blockchain);
    const toToken: any = await getTokenContractSwap(toCoin, blockchain);

    const tokenIn = fromToken.contract;
    const tokenOut = toToken.contract;

    console.log(tokenIn, tokenOut);

    const tokensMetadata = await ftGetTokensMetadata([tokenIn, tokenOut]);

    const simplePools = (await fetchAllPools()).simplePools.filter((pool) => {
      return pool.tokenIds[0] === tokenIn && pool.tokenIds[1] === tokenOut;
    });

    const swapAlls = await estimateSwap({
      tokenIn: tokensMetadata[tokenIn],
      tokenOut: tokensMetadata[tokenOut],
      amountIn: String(amount),
      simplePools: simplePools,
      options: { enableSmartRouting: true },
    });

    const transactionsRef = await instantSwap({
      tokenIn: tokensMetadata[tokenIn],
      tokenOut: tokensMetadata[tokenOut],
      amountIn: String(amount),
      swapTodos: swapAlls,
      slippageTolerance: 0.01,
      AccountId: address,
    });

    const transaction = transactionsRef.find(
      (element) => element.functionCalls[0].methodName === "ft_transfer_call"
    );

    if (!transaction) return false;

    const transfer: any = transaction.functionCalls[0].args;
    const data = JSON.parse(transfer.msg);

    const comision = await GET_COMISION(blockchain);

    const nearPrice = await axios.get("https://nearblocks.io/api/near-price");

    let feeTransfer = "0";
    let porcentFee = 0;

    console.log(comision);

    if (comision.swap) {
      porcentFee = comision.swap / 100;
    }

    let feeDefix = String(Number(amount) * porcentFee);

    const dataSwap = {
      exchange: "Ref Finance" + data.actions[0].pool_id,
      fromAmount: data.actions[0].amount_in,
      fromDecimals: tokensMetadata[tokenIn].decimals,
      toAmount: data.actions[0].min_amount_out,
      toDecimals: tokensMetadata[tokenOut].decimals,
      fee: String(porcentFee),
      feeDefix: feeDefix,
      feeTotal: String(Number(feeDefix)),
    };

    return { dataSwap, priceRoute: transactionsRef };
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function swapTokenNEAR(
  blockchain: string,
  privateKey: string,
  priceRoute: any,
  address: string
) {
  try {
    const transaction = priceRoute.find(
      (element: any) =>
        element.functionCalls[0].methodName === "ft_transfer_call"
    );

    if (!transaction) return false;

    const transfer: any = transaction.functionCalls[0].args;
    const data = JSON.parse(transfer.msg);

    const tokensMetadata = await ftGetTokensMetadata([
      data.actions[0].token_in,
      data.actions[0].token_out,
    ]);

    const tokenIn = tokensMetadata[data.actions[0].token_in];
    const tokenOut = tokensMetadata[data.actions[0].token_out];

    const keyStore = new keyStores.InMemoryKeyStore();

    const keyPair = KeyPair.fromString(privateKey);
    keyStore.setKey(process.env.NEAR_ENV!, address, keyPair);
    const near = new Near(CONFIG(keyStore));

    const account = new Account(near.connection, address);

    let nearTransactions = [];

    if (data.actions[0].token_in.includes("wrap.")) {
      const trx = await createTransactionFn(
        data.actions[0].token_in,
        [
          await functionCall(
            "near_deposit",
            {},
            new BN("300000000000000"),
            new BN(data.actions[0].amount_in)
          ),
        ],
        address,
        near
      );

      nearTransactions.push(trx);
    }

    const trxs = await Promise.all(
      priceRoute.map(async (tx: any) => {
        return await createTransactionFn(
          tx.receiverId,
          tx.functionCalls.map((fc: any) => {
            return functionCall(
              fc.methodName,
              fc.args,
              fc.gas,
              new BN(String(utils.format.parseNearAmount(fc.amount)))
            );
          }),
          address,
          near
        );
      })
    );

    nearTransactions = nearTransactions.concat(trxs);

    if (data.actions[0].token_out.includes("wrap.")) {
      const trx = await createTransactionFn(
        data.actions[0].token_out,
        [
          await functionCall(
            "near_withdraw",
            { amount: data.actions[0].min_amount_out },
            new BN("300000000000000"),
            new BN("1")
          ),
        ],
        address,
        near
      );

      nearTransactions.push(trx);
    }
    let resultSwap: any;
    for (let trx of nearTransactions) {
      console.log("ENTRA");
      console.log(trx.actions[0].functionCall.methodName);
      const result = await account.signAndSendTransaction(trx);
      console.log(result);

      if (trx.actions[0].functionCall.methodName === "ft_transfer_call") {
        resultSwap = result;
      }
    }

    if (!resultSwap.transaction.hash) return false;

    const transactionHash = resultSwap.transaction.hash;

    if (!transactionHash) return false;

    const resp_comision = await GET_COMISION(blockchain);
    const vault_address = await ADDRESS_VAULT(blockchain);

    const comision = resp_comision.swap / 100;

    let amount_vault = String(
      Number(data.actions[0].min_amount_out / Math.pow(10, 24)) * comision
    );
    const amountYocto = utils.format.parseNearAmount(amount_vault);

    if (amount_vault && vault_address && amountYocto) {
      await account.sendMoney(
        vault_address, // receiver account
        new BN(amountYocto) // amount in yoctoNEAR
      );
    }

    const srcAmount = String(
      Number(data.actions[0].amount_in) / Math.pow(10, tokenIn.decimals)
    );
    const destAmount = String(
      Number(data.actions[0].amount_out) / Math.pow(10, tokenOut.decimals)
    );

    return {
      transactionHash: transactionHash,
      address: address,
      srcAmount,
      destAmount,
    };
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function createTransactionFn(
  receiverId: string,
  actions: Action[],
  userAddress: string,
  near: Near
) {
  const walletConnection = new WalletConnection(near, null);
  const wallet = new ConnectedWalletAccount(
    walletConnection,
    near.connection,
    userAddress
  );

  if (!wallet || !near) {
    throw new Error(`No active wallet or NEAR connection.`);
  }

  const localKey = await near?.connection.signer.getPublicKey(
    userAddress,
    near.connection.networkId
  );

  const accessKey = await wallet.accessKeyForTransaction(
    receiverId,
    actions,
    localKey
  );

  if (!accessKey) {
    throw new Error(
      `Cannot find matching key for transaction sent to ${receiverId}`
    );
  }

  const block = await near?.connection.provider.block({
    finality: "final",
  });

  if (!block) {
    throw new Error(`Cannot find block for transaction sent to ${receiverId}`);
  }

  const blockHash = utils.serialize.base_decode(block?.header?.hash);
  //const blockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);

  const publicKey = PublicKey.from(accessKey.public_key);
  //const nonce = accessKey.access_key.nonce + nonceOffset
  const nonce = ++accessKey.access_key.nonce;

  return createTransaction(
    userAddress,
    publicKey,
    receiverId,
    nonce,
    actions,
    blockHash
  );
}

const getTokenContractSwap = async (token: string, blockchain: string) => {
  try {
    const conexion = await dbConnect();
    const response = await conexion.query(
      "SELECT *\
      FROM backend_token a\
      inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
      where a.coin = $1 and b.coin = $2",
      [token, blockchain]
    );

    if (response.rows.length === 0) {
      if (token === "NEAR") {
        console.log("ENTRO");
        return {
          decimals: 24,
          contract: "wrap.testnet",
        };
      }
      return false;
    }
    return response.rows[0];
  } catch (error) {
    return false;
  }
};

const validateNearId = async (address: string) => {
  try {
    const keyStore = new keyStores.InMemoryKeyStore();
    const near = new Near(CONFIG(keyStore));
    const account = new Account(near.connection, address);
    const response = await account
      .state()
      .then((response) => {
        return true;
      })
      .catch((error) => {
        return false;
      });
    return response;
  } catch (error) {
    return false;
  }
};

export {
  swapPreviewNEAR,
  transactionNEAR,
  createWalletNEAR,
  getIdNear,
  importWalletNEAR,
  isAddressNEAR,
  getBalanceNEAR,
  swapTokenNEAR,
  validatePkNEAR,
  getBalanceTokenNEAR,
};
