import { ADDRESS_VAULT, GET_COMISION } from "../helpers/utils";
const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;

const TRON_PRO_API_KEY = process.env.TRON_PRO_API_KEY;

const FULL_NODE = process.env.FULL_NODE;
const SOLIDITY_NODE = process.env.SOLIDITY_NODE;
const EVENT_SERVER = process.env.EVENT_SERVER;

const fullNode = new HttpProvider(FULL_NODE);
const solidityNode = new HttpProvider(SOLIDITY_NODE);
const eventServer = new HttpProvider(EVENT_SERVER);

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer);
tronWeb.setHeader({ "TRON-PRO-API-KEY": TRON_PRO_API_KEY });

import { Credential } from "../interfaces/credential.interface";

const createWalletTRON = async (mnemonic: string) => {
  const account = await tronWeb.fromMnemonic(mnemonic);
  let privateKey;

  if (account.privateKey.indexOf("0x") === 0) {
    privateKey = account.privateKey.slice(2);
  } else {
    privateKey = account.privateKey;
  }

  const credential: Credential = {
    name: "TRX",
    address: account.address,
    privateKey: privateKey,
  };

  return credential;
};

const isAddressTRON = async (address: string) => {
  const is_address: boolean = await tronWeb.isAddress(address);
  return is_address;
};

const validatePkTRON = async (privateKey: string) => {
  try {
    const address = tronWeb.address.fromPrivateKey(privateKey);

    if (!address) return false;

    const credential: Credential = {
      name: "TRX",
      address: address,
      privateKey: privateKey,
    };

    return credential;
  } catch (error) {
    return false;
  }
};

const getBalanceTRON = async (address: string) => {
  try {
    let balanceTotal = 0;
    const balance = await tronWeb.trx.getBalance(address);
    if (balance) {
      let value = Math.pow(10, 6);
      balanceTotal = balance / value;
      if (!balanceTotal) {
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

const getBalanceTokenTRON = async (
  address: string,
  srcContract: string,
  decimals: number
) => {
  try {
    tronWeb.setAddress(srcContract);
    const contract = await tronWeb.contract().at(srcContract);

    const balance = await contract.balanceOf(address).call();

    let balanceTotal = 0;

    if (balance) {
      let value = Math.pow(10, decimals);
      balanceTotal = balance / value;
      if (!balanceTotal) {
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

async function transactionTRON(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  coin: string,
  amount: number
) {
  try {
    const balance = await getBalanceTRON(fromAddress);
    if (balance < amount) {
      console.log(
        "Error: No tienes suficientes fondos para realizar la transferencia"
      );
      return false;
    }

    tronWeb.setAddress(fromAddress);

    let value = Math.pow(10, 6);
    let srcAmount = parseInt(String(amount * value));

    const tx = await tronWeb.transactionBuilder
      .sendTrx(toAddress, srcAmount)
      .then(function (response: any) {
        return response;
      })
      .catch(function (error: any) {
        return false;
      });

    if (!tx) return false;

    const signedTxn = await tronWeb.trx
      .sign(tx, privateKey)
      .then(function (response: any) {
        return response;
      })
      .catch(function (error: any) {
        return false;
      });

    if (!signedTxn.signature) {
      return false;
    }

    const resp_comision = await GET_COMISION(coin);
    const vault_address = await ADDRESS_VAULT(coin);

    const comision = resp_comision.transfer / 100;

    var for_vault = amount * comision;
    let srcAmountVault;

    if (for_vault !== 0 && vault_address) {
      srcAmountVault = parseInt(String(for_vault * value));
      payCommissionTRON(fromAddress, privateKey, vault_address, srcAmountVault);
    }

    const result = await tronWeb.trx.sendRawTransaction(signedTxn);

    if (result.txid) {
      return result.txid as string;
    }
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function transactionTokenTRON(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  amount: number,
  srcToken: any
) {
  try {
    const balance = await getBalanceTokenTRON(
      fromAddress,
      srcToken.contract,
      srcToken.decimals
    );
    if (balance < amount) {
      console.log(
        "Error: No tienes suficientes fondos para realizar la transferencia"
      );
      return false;
    }
    tronWeb.setAddress(fromAddress);

    let value = Math.pow(10, srcToken.decimals);
    let srcAmount = parseInt(String(amount * value));

    const contract = await tronWeb.contract().at(srcToken.contract);

    const transaction = await contract.transfer(toAddress, srcAmount).send({
      callValue: 0,
      shouldPollResponse: true,
      privateKey: privateKey,
    });

    console.log("TRANSACTION: ", transaction);

    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function payCommissionTRON(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  amount: number
) {
  try {
    tronWeb.setAddress(fromAddress);
    const tx = await tronWeb.transactionBuilder
      .sendTrx(toAddress, amount)
      .then(function (response: any) {
        return response;
      })
      .catch(function (error: any) {
        return false;
      });

    if (tx) {
      const signedTxn = await tronWeb.trx
        .sign(tx, privateKey)
        .then(function (response: any) {
          return response;
        })
        .catch(function (error: any) {
          return false;
        });
      await tronWeb.trx.sendRawTransaction(signedTxn);
    }
  } catch (error) {
    return false;
  }
}

export {
  createWalletTRON,
  isAddressTRON,
  getBalanceTRON,
  getBalanceTokenTRON,
  transactionTRON,
  transactionTokenTRON,
  validatePkTRON,
};
