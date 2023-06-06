// eslint-disable-next-line @typescript-eslint/no-var-requires
import { ethers, Wallet } from "ethers";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { Credential } from "../interfaces/credential.interface";
import axios from "axios";
import { ADDRESS_VAULT, GET_COMISION } from "../helpers/utils";
import { constructSimpleSDK, OptimalRate } from "@paraswap/sdk";
import abi from "../helpers/abi.json";
import dbConnect from "../config/postgres";

const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`
  )
);

const NETWORK = process.env.NETWORK;
const ETHERSCAN = process.env.ETHERSCAN;

const createWalletETH = async (mnemonic: string) => {
  const provider = new ethers.providers.EtherscanProvider(ETHERSCAN);
  const wallet = ethers.Wallet.fromMnemonic(mnemonic);

  const credential: Credential = {
    name: "ETH",
    address: wallet.address,
    privateKey: wallet.privateKey,
  };

  return credential;
};

const isAddressETH = async (address: string) => {
  const is_address = await web3.utils.isAddress(address);
  return is_address;
};

const validatePkETH = async (privateKey: string) => {
  try {
    const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
    const credential: Credential = {
      name: "ETH",
      address: wallet.address,
      privateKey: privateKey,
    };

    return credential;
  } catch (error) {
    return false;
  }
};

const getBalanceETH = async (address: string) => {
  try {
    const item = { coin: "ETH", balance: 0 };
    let balance = await web3.eth.getBalance(address);

    let balanceTotal = 0;

    if (balance) {
      let value = Math.pow(10, 18);
      balanceTotal = Number(balance) / value;
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

const getBalanceTokenETH = async (
  address: string,
  srcContract: string,
  decimals: number
) => {
  try {
    let contract = new web3.eth.Contract(abi as AbiItem[], srcContract);

    const balance = await contract.methods.balanceOf(address).call();

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

async function transactionETH(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  coin: string,
  amount: number
) {
  try {
    const balance = await getBalanceETH(fromAddress);
    if (balance < amount) {
      console.log(
        "Error: No tienes suficientes fondos para realizar la transferencia"
      );
      return false;
    }

    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000;
    const nonce = await web3.eth.getTransactionCount(fromAddress);

    const rawTransaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      nonce: nonce,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(
      rawTransaction,
      privateKey
    );

    if (!signedTransaction.rawTransaction) return false;

    const transactionHash = await web3.eth.sendSignedTransaction(
      signedTransaction.rawTransaction
    );

    const response = await axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6"
    );
    let wei = response.data.result.SafeGasPrice;
    let fee = Number(web3.utils.fromWei(String(21000 * wei), "gwei"));

    const resp_comision = await GET_COMISION(coin);
    const vault_address = await ADDRESS_VAULT(coin);

    const comision = resp_comision.transfer / 100;

    let amount_vault = Number((fee * comision).toFixed(18));

    console.log(amount_vault, vault_address);

    if (amount_vault !== 0 && vault_address) {
      await payCommissionETH(
        fromAddress,
        privateKey,
        vault_address,
        amount_vault
      );
    }

    if (!transactionHash.transactionHash) return false;

    return transactionHash.transactionHash as string;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function transactionTokenETH(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  amount: number,
  srcToken: any
) {
  try {
    const balance = await getBalanceTokenETH(
      fromAddress,
      srcToken.contract,
      srcToken.decimals
    );
    if (balance && balance < amount) {
      console.log(
        "Error: No tienes suficientes fondos para realizar la transferencia"
      );
      return false;
    }

    const provider = new ethers.providers.InfuraProvider(
      ETHEREUM_NETWORK,
      INFURA_PROJECT_ID
    );

    const minABI = abi;

    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);

    console.log("SIGNER", srcToken);

    const contract = new ethers.Contract(srcToken.contract, minABI, signer);
    let value = Math.pow(10, srcToken.decimals);
    let srcAmount = amount * value;

    const tx = await contract.transfer(toAddress, String(srcAmount));

    const response = await axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6"
    );
    let wei = response.data.result.SafeGasPrice;
    let fee = Number(web3.utils.fromWei(String(55000 * wei), "gwei"));

    const resp_comision = await GET_COMISION(srcToken.coin);
    const vault_address = await ADDRESS_VAULT(srcToken.coin);

    const comision = resp_comision.transfer / 100;

    let amount_vault = Number((fee * comision).toFixed(18));

    if (amount_vault !== 0 && vault_address) {
      await payCommissionETH(
        fromAddress,
        privateKey,
        vault_address,
        amount_vault
      );
    }

    if (tx.hash) {
      return tx.hash as string;
    }
    return false;
  } catch (error) {
    console.log("error", error);
    return false;
  }
}

async function payCommissionETH(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  amount: number
) {
  try {
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 21000;
    const nonce = await web3.eth.getTransactionCount(fromAddress);

    const rawTransaction = {
      from: fromAddress,
      to: toAddress,
      value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
      gasPrice: web3.utils.toHex(gasPrice),
      gasLimit: web3.utils.toHex(gasLimit),
      nonce: nonce,
    };

    const signedTransaction = await web3.eth.accounts.signTransaction(
      rawTransaction,
      privateKey
    );

    if (!signedTransaction.rawTransaction) return false;

    await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
  } catch (error) {
    return false;
  }
}

const swapPreviewETH = async (
  fromCoin: string,
  toCoin: string,
  amount: number,
  blockchain: string
) => {
  try {
    const paraSwap = constructSimpleSDK({ chainId: 1, axios });

    const fromToken: any = await getTokenContractSwap(fromCoin, blockchain);
    const toToken: any = await getTokenContractSwap(toCoin, blockchain);

    if (!fromToken || !toToken) return false;

    let value = Math.pow(10, fromToken.decimals);
    const srcAmount = amount * value;

    const priceRoute: OptimalRate = await paraSwap.swap.getRate({
      srcToken: fromToken.contract,
      destToken: toToken.contract,
      amount: String(srcAmount),
    });

    const response = await axios.get(
      "https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6"
    );
    let wei = response.data.result.SafeGasPrice;

    const comision = await GET_COMISION(blockchain);

    let feeTransfer = "0";
    let porcentFee = 0;

    if (comision.swap) {
      porcentFee = comision.swap / 100;
      if (comision.swap && fromCoin === "ETH") {
        feeTransfer = web3.utils.fromWei(String(21000 * wei), "gwei");
      } else {
        feeTransfer = web3.utils.fromWei(String(55000 * wei), "gwei");
      }
    }
    const feeGas = web3.utils.fromWei(
      String(Number(priceRoute.gasCost) * wei),
      "gwei"
    );

    const srcFee = String(Number(feeTransfer) + Number(feeGas));

    let feeDefix = String(Number(srcFee) * porcentFee);

    const dataSwap = {
      exchange: priceRoute.bestRoute[0].swaps[0].swapExchanges[0].exchange,
      fromAmount: priceRoute.srcAmount,
      fromDecimals: fromToken.decimals,
      toAmount: priceRoute.destAmount,
      toDecimals: toToken.decimals,
      fee: srcFee,
      feeDefix: feeDefix,
      feeTotal: String(Number(srcFee) + Number(feeDefix)),
    };

    return { dataSwap, priceRoute };
  } catch (error) {
    console.log(error);
    return false;
  }
};

async function swapTokenETH(
  blockchain: string,
  privateKey: string,
  priceRoute: OptimalRate
) {
  try {
    const paraSwap = constructSimpleSDK({ chainId: 1, axios });
    const signer = web3.eth.accounts.privateKeyToAccount(privateKey);

    const txParams = await paraSwap.swap.buildTx({
      srcToken: priceRoute.srcToken,
      destToken: priceRoute.destToken,
      srcAmount: priceRoute.srcAmount,
      destAmount: priceRoute.destAmount,
      priceRoute: priceRoute,
      userAddress: signer.address,
    });

    const txSigned = await signer.signTransaction(txParams);

    if (!txSigned.rawTransaction) return false;

    console.log(txSigned);
    const result = await web3.eth.sendSignedTransaction(
      txSigned.rawTransaction
    );

    const transactionHash = result.transactionHash;

    if (!transactionHash) return false;

    const resp_comision = await GET_COMISION(blockchain);
    const vault_address = await ADDRESS_VAULT(blockchain);

    const comision = resp_comision.swap / 100;

    let amount_vault = Number(priceRoute.gasCostUSD) * comision;

    if (amount_vault !== 0 && vault_address) {
      await payCommissionETH(
        signer.address,
        privateKey,
        vault_address,
        amount_vault
      );
    }

    return { transactionHash: transactionHash, address: signer.address };
  } catch (error) {
    console.log(error);
    return false;
  }
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
      if (token === "ETH") {
        return {
          decimals: 18,
          contract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        };
      }
      return false;
    }
    return response.rows[0];
  } catch (error) {
    return false;
  }
};

export {
  swapTokenETH,
  swapPreviewETH,
  createWalletETH,
  isAddressETH,
  getBalanceETH,
  getBalanceTokenETH,
  transactionETH,
  transactionTokenETH,
  validatePkETH,
};
