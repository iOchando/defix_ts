import ecfacory, {
  TinySecp256k1Interface,
  ECPairAPI,
  ECPairFactory,
} from "ecpair";
import { networks, payments, script } from "bitcoinjs-lib";
import { mnemonicToSeedSync } from "bip39";
const WAValidator = require("wallet-address-validator");
import axios from "axios";
import BIP32Factory from "bip32";
import * as ecc from "tiny-secp256k1";
import { BIP32Interface } from "bip32";
const bip32 = BIP32Factory(ecc);
import crypto from "crypto";
import { Credential } from "../interfaces/credential.interface";
import { ADDRESS_VAULT, GET_COMISION } from "../helpers/utils";

const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

const NETWORK = process.env.NETWORK;

const createWalletBTC = async (mnemonic: string) => {
  // try {
  let network;
  let path;
  if (NETWORK === "mainnet") {
    network = networks.bitcoin; //use networks.testnet networks.bitcoin for testnet
    path = `m/49'/0'/0'/0`; // Use m/49'/1'/0'/0 for testnet mainnet `m/49'/0'/0'/0
  } else {
    network = networks.testnet;
    path = `m/49'/1/0'/0`;
  }

  const seed = mnemonicToSeedSync(mnemonic);

  const root: BIP32Interface = bip32.fromSeed(seed, network);

  const account = root.derivePath(path);

  const node = account.derive(0).derive(0);

  const btcAddress = payments.p2pkh({
    pubkey: node.publicKey,
    network: network,
  }).address;

  const credential: Credential = {
    name: "BTC",
    address: btcAddress || "",
    privateKey: node.toWIF(),
  };

  return credential;
};

const isAddressBTC = async (address: string) => {
  const is_address: boolean = WAValidator.validate(address, "BTC");
  return is_address;
};

const validatePkBTC = async (privateKey: string) => {
  try {
    let network;
    let path;
    if (NETWORK === "mainnet") {
      network = networks.bitcoin; //use networks.testnet networks.bitcoin for testnet
      path = `m/49'/0'/0'/0`; // Use m/49'/1'/0'/0 for testnet mainnet `m/49'/0'/0'/0
    } else {
      network = networks.testnet; //use networks.testnet networks.bitcoin for testnet;
      path = `m/49'/1/0'/0`;
    }

    const keyPair = ECPair.fromWIF(privateKey, network);
    if (!keyPair.privateKey) return false;

    const chainCode = Buffer.alloc(32);
    const root: BIP32Interface = bip32.fromPrivateKey(
      keyPair.privateKey,
      chainCode
    );

    const { address } = payments.p2pkh({
      pubkey: root.publicKey,
      network: network,
    });

    if (!address) return false;

    const credential: Credential = {
      name: "BTC",
      address: address,
      privateKey: keyPair.toWIF(),
    };

    return credential;
  } catch (error) {
    return false;
  }
};

const getBalanceBTC = async (address: string) => {
  try {
    const method = "get";
    const url = "https://blockchain.info/q/addressbalance/" + address;

    const balance = await axios[method](url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(async (response) => {
        if (response.data || response.data === 0) {
          const satoshi = response.data;
          const value_satoshi = 100000000;
          const balance = satoshi / value_satoshi || 0;
          return balance;
        }
        const item = await getBalanceBTC_Cypher(address);
        return item;
      })
      .catch(async (error) => {
        const item = await getBalanceBTC_Cypher(address);
        return item;
      });
    return balance;
  } catch (error) {
    console.error(error);
    const item = await getBalanceBTC_Cypher(address);
    return item;
  }
};

const getBalanceBTC_Cypher = async (address: string) => {
  try {
    const method = "get";
    const url =
      "https://api.blockcypher.com/v1/btc/" +
      process.env.BLOCKCYPHER +
      "/addrs/" +
      address +
      "/balance?token=" +
      "efe763283ba84fef88d23412be0c5970";

    const balance = await axios[method](url, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.data) {
          const satoshi = response.data.balance;
          const value_satoshi = 100000000;
          return satoshi / value_satoshi || 0;
        }
        return 0;
      })
      .catch((error) => {
        return 0;
      });
    return balance;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

async function transactionBTC(
  fromAddress: string,
  privateKey: string,
  toAddress: string,
  coin: string,
  amount: number
) {
  try {
    let network;
    if (NETWORK === "mainnet") {
      network = networks.bitcoin; //use networks.testnet networks.bitcoin for testnet
    } else {
      network = networks.testnet; //use networks.testnet networks.bitcoin for testnet
    }

    console.log("HOLAAA");

    const resp_comision = await GET_COMISION(coin);
    const vault_address = await ADDRESS_VAULT(coin);

    const comision = resp_comision.transfer / 100;

    var for_vault = amount * comision;

    //var amount_final = amount - for_vault

    const value_satoshi = 100000000;
    const amountSatoshi = amount * value_satoshi;
    const vaultSatoshi = parseInt(String(for_vault * value_satoshi));

    var keys = ECPair.fromWIF(privateKey, network);

    var data;

    if (vaultSatoshi !== 0) {
      data = {
        inputs: [
          {
            addresses: [fromAddress],
          },
        ],
        outputs: [
          {
            addresses: [toAddress],
            value: parseInt(String(amountSatoshi)),
          },
          {
            addresses: [vault_address],
            value: parseInt(String(vaultSatoshi)),
          },
        ],
      };
    } else {
      data = {
        inputs: [
          {
            addresses: [fromAddress],
          },
        ],
        outputs: [
          {
            addresses: [toAddress],
            value: parseInt(String(amountSatoshi)),
          },
        ],
      };
    }
    var config = {
      method: "post",
      url:
        "https://api.blockcypher.com/v1/btc/" +
        process.env.BLOCKCYPHER +
        "/txs/new",
      headers: {
        "Content-Type": "application/json",
      },
      data: data,
    };

    let txHash = null;

    await axios(config)
      .then(async function (tmptx) {
        console.log("hola");
        console.log(tmptx.data);
        tmptx.data.pubkeys = [];
        tmptx.data.signatures = tmptx.data.tosign.map(function (
          tosign: any,
          n: any
        ) {
          tmptx.data.pubkeys.push(keys.publicKey.toString("hex"));
          return script.signature
            .encode(keys.sign(Buffer.from(tosign, "hex")), 0x01)
            .toString("hex")
            .slice(0, -2);
        });

        console.log("AQUI");

        const result = axios
          .post(
            "https://api.blockcypher.com/v1/btc/" +
              process.env.BLOCKCYPHER +
              "/txs/send",
            tmptx.data
          )
          .then(function (finaltx) {
            txHash = finaltx.data.tx.hash;
            console.log("hash", finaltx.data.tx.hash);
            return true;
          })
          .catch(function (xhr) {
            console.log("error");
            return false;
          });
        return result;
      })
      .catch(function (error) {
        console.log("error axios", error);
        return false;
      });

    if (txHash) return txHash as string;

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export {
  createWalletBTC,
  isAddressBTC,
  getBalanceBTC,
  getBalanceBTC_Cypher,
  transactionBTC,
  validatePkBTC,
};
