"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importFromPK = exports.getUsers = exports.validateAddress = exports.importFromMnemonic = exports.importWallet = exports.validateDefixIdAPI = exports.createWallet = exports.generateMnemonicAPI = exports.encryptAPI = void 0;
const utils_1 = require("../helpers/utils");
const crypto_1 = require("../helpers/crypto");
const bip39_1 = require("bip39");
const btc_services_1 = require("../services/btc.services");
const eth_services_1 = require("../services/eth.services");
const near_services_1 = require("../services/near.services");
const tron_services_1 = require("../services/tron.services");
const bsc_services_1 = require("../services/bsc.services");
const mail_1 = require("../helpers/mail");
const user_entity_1 = require("../entities/user.entity");
const addresses_entity_1 = require("../entities/addresses.entity");
const generateMnemonicAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
            return res.status(400).send();
        const DefixId = defixId.toLowerCase();
        const resp = yield (0, utils_1.validateDefixId)(DefixId);
        if (resp)
            return res.status(400).send();
        const mnemonic = yield (0, bip39_1.generateMnemonic)();
        res.send({ mnemonic: mnemonic });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.generateMnemonicAPI = generateMnemonicAPI;
const encryptAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        if (!text)
            return res.status(400).send();
        const resp = (0, crypto_1.encrypt)(text);
        if (!resp)
            return res.status(400).send();
        res.send(resp);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.encryptAPI = encryptAPI;
const createWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase, email } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!defixId ||
            !defixId.includes(".defix3") ||
            defixId.includes(" ") ||
            !mnemonic)
            return res.status(400).send();
        const DefixId = defixId.toLowerCase();
        const exists = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        if (!exists) {
            const credentials = [];
            credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
            credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
            credentials.push(yield (0, near_services_1.createWalletNEAR)(mnemonic));
            credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
            credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
            const wallet = {
                defixId: DefixId,
                credentials: credentials,
            };
            const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
            const save = yield saveUser(nearId, wallet);
            if (save) {
                if (yield (0, utils_1.validateEmail)(email)) {
                    (0, mail_1.EnviarPhraseCorreo)(mnemonic, DefixId, email);
                    console.log("envia correo");
                }
                return res.send(wallet);
            }
            return res.status(400).send();
        }
        else {
            return res.status(405).send();
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.createWallet = createWallet;
const importWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { seedPhrase } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
        const user = yield user_entity_1.User.findOneBy({ import_id: nearId });
        if (!user)
            return res.status(400).send();
        const defixId = user.defix_id.toLowerCase();
        const addressNear = yield addresses_entity_1.Address.findOneBy({
            user: { defix_id: user.defix_id },
            name: "NEAR",
        });
        if (!addressNear)
            return res.status(400).send();
        const nearAddress = addressNear.address;
        const credentials = [];
        credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
        credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
        credentials.push(yield (0, near_services_1.importWalletNEAR)(nearAddress, mnemonic));
        credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
        credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
        const wallet = {
            defixId: defixId,
            credentials: credentials,
        };
        const addressTRON = yield addresses_entity_1.Address.findOneBy({
            user: { defix_id: user.defix_id },
            name: "TRX",
        });
        // Crypto news
        if (!addressTRON) {
            const addresstron = credentials.find((element) => element.name === "TRX");
            if (addresstron) {
                const address = new addresses_entity_1.Address();
                address.user = user;
                address.name = "TRX";
                address.address = addresstron.address;
                yield address.save();
            }
        }
        const addressBNB = yield addresses_entity_1.Address.findOneBy({
            user: { defix_id: user.defix_id },
            name: "BNB",
        });
        if (!addressBNB) {
            const addressbnb = credentials.find((element) => element.name === "BNB");
            if (addressbnb) {
                const address = new addresses_entity_1.Address();
                address.user = user;
                address.name = "BNB";
                address.address = addressbnb.address;
                yield address.save();
            }
        }
        // End
        yield user_entity_1.User.update({ defix_id: user.defix_id }, { close_sessions: false });
        res.send(wallet);
    }
    catch (error) {
        res.status(400).send();
    }
});
exports.importWallet = importWallet;
const importFromMnemonic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase } = req.body;
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!defixId ||
            !defixId.includes(".defix3") ||
            defixId.includes(" ") ||
            !mnemonic)
            return res.status(400).send();
        const DefixId = defixId.toLowerCase();
        const exists = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        if (!exists) {
            const credentials = [];
            credentials.push(yield (0, btc_services_1.createWalletBTC)(mnemonic));
            credentials.push(yield (0, eth_services_1.createWalletETH)(mnemonic));
            credentials.push(yield (0, near_services_1.createWalletNEAR)(mnemonic));
            credentials.push(yield (0, tron_services_1.createWalletTRON)(mnemonic));
            credentials.push(yield (0, bsc_services_1.createWalletBNB)(mnemonic));
            const wallet = {
                defixId: DefixId,
                credentials: credentials,
            };
            const nearId = yield (0, near_services_1.getIdNear)(mnemonic);
            const save = yield saveUser(nearId, wallet);
            if (save) {
                return res.send(wallet);
            }
            return res.status(400).send();
        }
        res.status(405).send();
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.importFromMnemonic = importFromMnemonic;
const validatePK = (privateKey, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!privateKey || !blockchain)
            return false;
        let credential;
        if (blockchain === "BTC") {
            credential = yield (0, btc_services_1.validatePkBTC)(privateKey);
        }
        else if (blockchain === "ETH") {
            credential = yield (0, eth_services_1.validatePkETH)(privateKey);
        }
        else if (blockchain === "BNB") {
            credential = yield (0, bsc_services_1.validatePkBSC)(privateKey);
        }
        else if (blockchain === "TRX") {
            credential = yield (0, tron_services_1.validatePkTRON)(privateKey);
        }
        else if (blockchain === "NEAR") {
            if (privateKey.includes("ed25519:")) {
                credential = yield (0, near_services_1.validatePkNEAR)(privateKey);
            }
        }
        if (!credential)
            return false;
        return credential;
    }
    catch (error) {
        return false;
    }
});
const importFromPK = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pkEncrypt } = req.body;
        const privateKey = (0, crypto_1.decrypt)(pkEncrypt);
        if (!privateKey)
            return res.status(400).send();
        const cryptos = yield (0, utils_1.getCryptosFn)();
        const credentials = [];
        for (let crypto of cryptos) {
            const validate = yield validatePK(privateKey, crypto.coin);
            if (validate) {
                credentials.push(validate);
            }
        }
        if (credentials.length === 0)
            return res.status(400).send;
        const wallet = {
            defixId: credentials[0].address,
            credentials: credentials,
        };
        res.send(wallet);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.importFromPK = importFromPK;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_entity_1.User.find({ select: ["defix_id", "id"] });
        res.send(users);
    }
    catch (error) {
        res.status(400).send(error);
    }
});
exports.getUsers = getUsers;
// UTILS
const validateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address, coin } = req.body;
        if (!address || !coin)
            return res.status(400).send();
        if (coin === "BTC") {
            return res.send(yield (0, btc_services_1.isAddressBTC)(address));
        }
        else if (coin === "NEAR") {
            return res.send(yield (0, near_services_1.isAddressNEAR)(address));
        }
        else if (coin === "ETH") {
            return res.send(yield (0, eth_services_1.isAddressETH)(address));
        }
        else if (coin === "BNB") {
            return res.send(yield (0, bsc_services_1.isAddressBNB)(address));
        }
        else if (coin === "TRX") {
            return res.send(yield (0, tron_services_1.isAddressTRON)(address));
        }
        res.status(400).send();
    }
    catch (error) {
        res.status(400).send({ error: error });
    }
});
exports.validateAddress = validateAddress;
const saveUser = (nearId, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = new user_entity_1.User();
        user.defix_id = wallet.defixId;
        user.import_id = nearId;
        const resUser = yield user.save();
        if (!resUser)
            return false;
        for (let credential of wallet.credentials) {
            const address = new addresses_entity_1.Address();
            address.user = user;
            address.name = credential.name;
            address.address = credential.address;
            yield address.save();
        }
        if (resUser)
            return true;
        return false;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
const validateDefixIdAPI = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        if (!defixId || !defixId.includes(".defix3") || defixId.includes(" "))
            return res.status(400).send();
        const resp = yield (0, utils_1.validateDefixId)(defixId.toLowerCase());
        res.send(resp);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err });
    }
});
exports.validateDefixIdAPI = validateDefixIdAPI;
