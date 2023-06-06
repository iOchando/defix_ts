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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCryptosFn = exports.ADDRESS_VAULT = exports.GET_COMISION = exports.validateEmail = exports.validateMnemonicDefix = exports.CONFIG = exports.validateDefixId = exports.getAddressUser = exports.saveTransaction = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const near_services_1 = require("../services/near.services");
const axios_1 = __importDefault(require("axios"));
const user_entity_1 = require("../entities/user.entity");
const addresses_entity_1 = require("../entities/addresses.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const NETWORK = process.env.NETWORK;
function saveTransaction(fromDefix, toDefix, coin, blockchain, amount, fromAddress, toAddress, hash, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const date = new Date();
            const month = ("0" + (date.getMonth() + 1)).slice(-2);
            const year = String(date.getFullYear());
            const transaction = new transaction_entity_1.Transaction();
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
            const response = yield transaction
                .save()
                .then((resp) => {
                return resp;
            })
                .catch(() => {
                return false;
            });
            return response;
        }
        catch (error) {
            return false;
        }
    });
}
exports.saveTransaction = saveTransaction;
function getAddressUser(defixId, blockchain) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const address = yield addresses_entity_1.Address.findOneBy({
                user: { defix_id: defixId },
                name: blockchain,
            });
            if (!address)
                return false;
            return address.address;
        }
        catch (error) {
            return false;
        }
    });
}
exports.getAddressUser = getAddressUser;
const validateDefixId = (defixId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        return true;
    }
    catch (err) {
        return false;
    }
});
exports.validateDefixId = validateDefixId;
const validateMnemonicDefix = (defixId, mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        const id = yield (0, near_services_1.getIdNear)(mnemonic);
        if (user.import_id === id) {
            return true;
        }
        return false;
    }
    catch (err) {
        return false;
    }
});
exports.validateMnemonicDefix = validateMnemonicDefix;
const validateEmail = (email) => {
    const regex = /\S+@\S+\.\S+/;
    return regex.test(email);
};
exports.validateEmail = validateEmail;
function CONFIG(keyStores) {
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
exports.CONFIG = CONFIG;
function ADDRESS_VAULT(coin) {
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
exports.ADDRESS_VAULT = ADDRESS_VAULT;
function GET_COMISION(coin) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const url = process.env.URL_DJANGO + "api/v1/get-comision/" + coin;
            const result = axios_1.default
                .get(url)
                .then(function (response) {
                return response.data;
            })
                .catch(function (xhr) {
                return false;
            });
            return result;
        }
        catch (error) {
            return false;
        }
    });
}
exports.GET_COMISION = GET_COMISION;
const getCryptosFn = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const cryptocurrencys = yield conexion.query("select * from backend_cryptocurrency");
        const cryptos = [];
        for (let cryptocurrency of cryptocurrencys.rows) {
            const tokens = yield conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
            cryptocurrency.tokens = tokens.rows;
            cryptos.push(cryptocurrency);
        }
        return cryptos;
    }
    catch (error) {
        console.log(error);
        return [];
    }
});
exports.getCryptosFn = getCryptosFn;
