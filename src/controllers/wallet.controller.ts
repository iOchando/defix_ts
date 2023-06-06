import { Request, Response } from "express";
import { validateDefixId, validateEmail, getCryptosFn } from "../helpers/utils";
import { encrypt, decrypt } from "../helpers/crypto";
import { generateMnemonic } from "bip39";

import {
  createWalletBTC,
  isAddressBTC,
  validatePkBTC,
} from "../services/btc.services";
import {
  createWalletETH,
  isAddressETH,
  validatePkETH,
} from "../services/eth.services";
import {
  createWalletNEAR,
  getIdNear,
  importWalletNEAR,
  isAddressNEAR,
  validatePkNEAR,
} from "../services/near.services";
import {
  createWalletTRON,
  isAddressTRON,
  validatePkTRON,
} from "../services/tron.services";
import {
  createWalletBNB,
  isAddressBNB,
  validatePkBSC,
} from "../services/bsc.services";

import { Wallet } from "../interfaces/wallet.interface";
import { Credential } from "../interfaces/credential.interface";
import { EnviarPhraseCorreo } from "../helpers/mail";

import { User } from "../entities/user.entity";
import { Address } from "../entities/addresses.entity";

const generateMnemonicAPI = async (req: Request, res: Response) => {
  try {
    const { defixId } = req.body;

    if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
      return res.status(400).send();

    const DefixId = defixId.toLowerCase();

    const resp: boolean = await validateDefixId(DefixId);

    if (resp) return res.status(400).send();

    const mnemonic = await generateMnemonic();

    res.send({ mnemonic: mnemonic });
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const encryptAPI = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) return res.status(400).send();

    const resp = encrypt(text);

    if (!resp) return res.status(400).send();

    res.send(resp);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const createWallet = async (req: Request, res: Response) => {
  try {
    const { defixId, seedPhrase, email } = req.body;
    const mnemonic = decrypt(seedPhrase);

    if (
      !defixId ||
      !defixId.includes(".defix3") ||
      defixId.includes(" ") ||
      !mnemonic
    )
      return res.status(400).send();

    const DefixId = defixId.toLowerCase();

    const exists: boolean = await validateDefixId(defixId.toLowerCase());

    if (!exists) {
      const credentials: Array<Credential> = [];

      credentials.push(await createWalletBTC(mnemonic));
      credentials.push(await createWalletETH(mnemonic));
      credentials.push(await createWalletNEAR(mnemonic));
      credentials.push(await createWalletTRON(mnemonic));
      credentials.push(await createWalletBNB(mnemonic));

      const wallet: Wallet = {
        defixId: DefixId,
        credentials: credentials,
      };

      const nearId = await getIdNear(mnemonic);

      const save = await saveUser(nearId, wallet);

      if (save) {
        if (await validateEmail(email)) {
          EnviarPhraseCorreo(mnemonic, DefixId, email);
          console.log("envia correo");
        }
        return res.send(wallet);
      }
      return res.status(400).send();
    } else {
      return res.status(405).send();
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const importWallet = async (req: Request, res: Response) => {
  try {
    const { seedPhrase } = req.body;

    const mnemonic = decrypt(seedPhrase);

    if (!mnemonic) return res.status(400).send();

    const nearId = await getIdNear(mnemonic);

    const user = await User.findOneBy({ import_id: nearId });

    if (!user) return res.status(400).send();

    const defixId = user.defix_id.toLowerCase();

    const addressNear = await Address.findOneBy({
      user: { defix_id: user.defix_id },
      name: "NEAR",
    });

    if (!addressNear) return res.status(400).send();

    const nearAddress = addressNear.address;

    const credentials: Array<Credential> = [];

    credentials.push(await createWalletBTC(mnemonic));
    credentials.push(await createWalletETH(mnemonic));
    credentials.push(await importWalletNEAR(nearAddress, mnemonic));
    credentials.push(await createWalletTRON(mnemonic));
    credentials.push(await createWalletBNB(mnemonic));

    const wallet: Wallet = {
      defixId: defixId,
      credentials: credentials,
    };

    const addressTRON = await Address.findOneBy({
      user: { defix_id: user.defix_id },
      name: "TRX",
    });

    // Crypto news

    if (!addressTRON) {
      const addresstron = credentials.find((element) => element.name === "TRX");
      if (addresstron) {
        const address = new Address();
        address.user = user;
        address.name = "TRX";
        address.address = addresstron.address;
        await address.save();
      }
    }

    const addressBNB = await Address.findOneBy({
      user: { defix_id: user.defix_id },
      name: "BNB",
    });

    if (!addressBNB) {
      const addressbnb = credentials.find((element) => element.name === "BNB");
      if (addressbnb) {
        const address = new Address();
        address.user = user;
        address.name = "BNB";
        address.address = addressbnb.address;
        await address.save();
      }
    }
    // End

    await User.update({ defix_id: user.defix_id }, { close_sessions: false });

    res.send(wallet);
  } catch (error) {
    res.status(400).send();
  }
};

const importFromMnemonic = async (req: Request, res: Response) => {
  try {
    const { defixId, seedPhrase } = req.body;

    const mnemonic = decrypt(seedPhrase);

    if (
      !defixId ||
      !defixId.includes(".defix3") ||
      defixId.includes(" ") ||
      !mnemonic
    )
      return res.status(400).send();

    const DefixId = defixId.toLowerCase();

    const exists: boolean = await validateDefixId(defixId.toLowerCase());

    if (!exists) {
      const credentials: Array<Credential> = [];

      credentials.push(await createWalletBTC(mnemonic));
      credentials.push(await createWalletETH(mnemonic));
      credentials.push(await createWalletNEAR(mnemonic));
      credentials.push(await createWalletTRON(mnemonic));
      credentials.push(await createWalletBNB(mnemonic));

      const wallet: Wallet = {
        defixId: DefixId,
        credentials: credentials,
      };

      const nearId = await getIdNear(mnemonic);

      const save = await saveUser(nearId, wallet);

      if (save) {
        return res.send(wallet);
      }
      return res.status(400).send();
    }
    res.status(405).send();
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const validatePK = async (privateKey: string, blockchain: string) => {
  try {
    if (!privateKey || !blockchain) return false;

    let credential;

    if (blockchain === "BTC") {
      credential = await validatePkBTC(privateKey);
    } else if (blockchain === "ETH") {
      credential = await validatePkETH(privateKey);
    } else if (blockchain === "BNB") {
      credential = await validatePkBSC(privateKey);
    } else if (blockchain === "TRX") {
      credential = await validatePkTRON(privateKey);
    } else if (blockchain === "NEAR") {
      if (privateKey.includes("ed25519:")) {
        credential = await validatePkNEAR(privateKey);
      }
    }
    if (!credential) return false;
    return credential;
  } catch (error) {
    return false;
  }
};

const importFromPK = async (req: Request, res: Response) => {
  try {
    const { pkEncrypt } = req.body;

    const privateKey = decrypt(pkEncrypt);

    if (!privateKey) return res.status(400).send();

    const cryptos = await getCryptosFn();

    const credentials: Credential[] = [];

    for (let crypto of cryptos) {
      const validate = await validatePK(privateKey, crypto.coin);
      if (validate) {
        credentials.push(validate as Credential);
      }
    }

    if (credentials.length === 0) return res.status(400).send;

    const wallet: Wallet = {
      defixId: credentials[0].address,
      credentials: credentials,
    };

    res.send(wallet);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({ select: ["defix_id", "id"] });
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
};

// UTILS

const validateAddress = async (req: Request, res: Response) => {
  try {
    const { address, coin } = req.body;
    if (!address || !coin) return res.status(400).send();

    if (coin === "BTC") {
      return res.send(await isAddressBTC(address));
    } else if (coin === "NEAR") {
      return res.send(await isAddressNEAR(address));
    } else if (coin === "ETH") {
      return res.send(await isAddressETH(address));
    } else if (coin === "BNB") {
      return res.send(await isAddressBNB(address));
    } else if (coin === "TRX") {
      return res.send(await isAddressTRON(address));
    }
    res.status(400).send();
  } catch (error) {
    res.status(400).send({ error: error });
  }
};

const saveUser = async (nearId: string, wallet: Wallet) => {
  try {
    const user = new User();

    user.defix_id = wallet.defixId;
    user.import_id = nearId;

    const resUser = await user.save();
    if (!resUser) return false;

    for (let credential of wallet.credentials) {
      const address = new Address();
      address.user = user;
      address.name = credential.name;
      address.address = credential.address;
      await address.save();
    }

    if (resUser) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};

const validateDefixIdAPI = async (req: Request, res: Response) => {
  try {
    const { defixId } = req.body;

    if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
      return res.status(400).send();

    const resp: boolean = await validateDefixId(defixId.toLowerCase());

    res.send(resp);
  } catch (err) {
    console.log(err);
    res.status(500).send({ err });
  }
};

export {
  encryptAPI,
  generateMnemonicAPI,
  createWallet,
  validateDefixIdAPI,
  importWallet,
  importFromMnemonic,
  validateAddress,
  getUsers,
  importFromPK,
};
