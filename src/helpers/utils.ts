import dbConnect from "../config/postgres";
import { getIdNear } from "../services/near.services";
import { Pool } from "pg";
import axios from "axios";
import { User } from "../entities/user.entity";
import { Address } from "../entities/addresses.entity";
import { Transaction } from "../entities/transaction.entity";

const NETWORK = process.env.NETWORK;

async function saveTransaction(
  fromDefix: string,
  toDefix: string,
  coin: string,
  blockchain: string,
  amount: number,
  fromAddress: string,
  toAddress: string,
  hash: string,
  tipo: string
) {
  try {
    const date = new Date();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = String(date.getFullYear());

    const transaction = new Transaction();

    transaction.from_defix = fromDefix;
    transaction.from_address = fromAddress;
    transaction.to_defix = toDefix;
    transaction.to_address = toAddress;
    transaction.coin = coin;
    transaction.blockchain = blockchain;
    transaction.value = amount;
    transaction.hash = hash;
    transaction.tipo = tipo;
    transaction.date_year = year;
    transaction.date_month = month;

    const response = await transaction
      .save()
      .then((resp) => {
        return resp;
      })
      .catch(() => {
        return false;
      });
    return response;
  } catch (error) {
    return false;
  }
}

async function getAddressUser(defixId: string, blockchain: string) {
  try {
    const address = await Address.findOneBy({
      user: { defix_id: defixId },
      name: blockchain,
    });

    if (!address) return false;

    return address.address;
  } catch (error) {
    return false;
  }
}

const validateDefixId = async (defixId: string) => {
  try {
    const user = await User.findOneBy({ defix_id: defixId });

    if (!user) return false;

    return true;
  } catch (err) {
    return false;
  }
};

const validateMnemonicDefix = async (defixId: string, mnemonic: string) => {
  try {
    const user = await User.findOneBy({ defix_id: defixId });
    if (!user) return false;

    const id = await getIdNear(mnemonic);

    if (user.import_id === id) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
};

const validateEmail = (email: string) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
};

function CONFIG(keyStores: any) {
  switch (NETWORK) {
    case "mainnet":
      return {
        networkId: "mainnet",
        nodeUrl: "https://rpc.mainnet.near.org",
        keyStore: keyStores,
        walletUrl: "https://wallet.near.org",
        helperUrl: "https://helper.mainnet.near.org",
        explorerUrl: "https://explorer.mainnet.near.org",
      };
    case "testnet":
      return {
        networkId: "testnet",
        keyStore: keyStores,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        helperUrl: "https://helper.testnet.near.org",
        explorerUrl: "https://explorer.testnet.near.org",
      };
    default:
      throw new Error(`Unconfigured environment '${NETWORK}'`);
  }
}

function ADDRESS_VAULT(coin: string) {
  switch (coin) {
    case "BTC":
      return process.env.VAULT_BTC;
    case "NEAR":
      return process.env.VAULT_NEAR;
    case "ETH":
      return process.env.VAULT_ETH;
    case "TRX":
      return process.env.VAULT_TRON;
    case "BNB":
      return process.env.VAULT_BNB;
    default:
      throw new Error(`Unconfigured environment '${coin}'`);
  }
}

async function GET_COMISION(coin: string) {
  try {
    const url = process.env.URL_DJANGO + "api/v1/get-comision/" + coin;
    const result = axios
      .get(url)
      .then(function (response) {
        return response.data;
      })
      .catch(function (xhr) {
        return false;
      });
    return result;
  } catch (error) {
    return false;
  }
}

const getCryptosFn = async () => {
  try {
    const conexion = await dbConnect();
    const cryptocurrencys = await conexion.query(
      "select * from backend_cryptocurrency"
    );

    const cryptos = [];

    for (let cryptocurrency of cryptocurrencys.rows) {
      const tokens = await conexion.query(
        "select * from backend_token where cryptocurrency_id = $1",
        [cryptocurrency.id]
      );
      cryptocurrency.tokens = tokens.rows;
      cryptos.push(cryptocurrency);
    }

    return cryptos;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export {
  saveTransaction,
  getAddressUser,
  validateDefixId,
  CONFIG,
  validateMnemonicDefix,
  validateEmail,
  GET_COMISION,
  ADDRESS_VAULT,
  getCryptosFn,
};
