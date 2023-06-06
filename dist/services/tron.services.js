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
exports.validatePkTRON = exports.transactionTokenTRON = exports.transactionTRON = exports.getBalanceTokenTRON = exports.getBalanceTRON = exports.isAddressTRON = exports.createWalletTRON = void 0;
const utils_1 = require("../helpers/utils");
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
const createWalletTRON = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield tronWeb.fromMnemonic(mnemonic);
    let privateKey;
    if (account.privateKey.indexOf("0x") === 0) {
        privateKey = account.privateKey.slice(2);
    }
    else {
        privateKey = account.privateKey;
    }
    const credential = {
        name: "TRX",
        address: account.address,
        privateKey: privateKey,
    };
    return credential;
});
exports.createWalletTRON = createWalletTRON;
const isAddressTRON = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const is_address = yield tronWeb.isAddress(address);
    return is_address;
});
exports.isAddressTRON = isAddressTRON;
const validatePkTRON = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const address = tronWeb.address.fromPrivateKey(privateKey);
        if (!address)
            return false;
        const credential = {
            name: "TRX",
            address: address,
            privateKey: privateKey,
        };
        return credential;
    }
    catch (error) {
        return false;
    }
});
exports.validatePkTRON = validatePkTRON;
const getBalanceTRON = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let balanceTotal = 0;
        const balance = yield tronWeb.trx.getBalance(address);
        if (balance) {
            let value = Math.pow(10, 6);
            balanceTotal = balance / value;
            if (!balanceTotal) {
                balanceTotal = 0;
            }
            return balanceTotal;
        }
        else {
            return balanceTotal;
        }
    }
    catch (error) {
        return 0;
    }
});
exports.getBalanceTRON = getBalanceTRON;
const getBalanceTokenTRON = (address, srcContract, decimals) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        tronWeb.setAddress(srcContract);
        const contract = yield tronWeb.contract().at(srcContract);
        const balance = yield contract.balanceOf(address).call();
        let balanceTotal = 0;
        if (balance) {
            let value = Math.pow(10, decimals);
            balanceTotal = balance / value;
            if (!balanceTotal) {
                balanceTotal = 0;
            }
            return balanceTotal;
        }
        else {
            return balanceTotal;
        }
    }
    catch (error) {
        return 0;
    }
});
exports.getBalanceTokenTRON = getBalanceTokenTRON;
function transactionTRON(fromAddress, privateKey, toAddress, coin, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceTRON(fromAddress);
            if (balance < amount) {
                console.log("Error: No tienes suficientes fondos para realizar la transferencia");
                return false;
            }
            tronWeb.setAddress(fromAddress);
            let value = Math.pow(10, 6);
            let srcAmount = parseInt(String(amount * value));
            const tx = yield tronWeb.transactionBuilder
                .sendTrx(toAddress, srcAmount)
                .then(function (response) {
                return response;
            })
                .catch(function (error) {
                return false;
            });
            if (!tx)
                return false;
            const signedTxn = yield tronWeb.trx
                .sign(tx, privateKey)
                .then(function (response) {
                return response;
            })
                .catch(function (error) {
                return false;
            });
            if (!signedTxn.signature) {
                return false;
            }
            const resp_comision = yield (0, utils_1.GET_COMISION)(coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(coin);
            const comision = resp_comision.transfer / 100;
            var for_vault = amount * comision;
            let srcAmountVault;
            if (for_vault !== 0 && vault_address) {
                srcAmountVault = parseInt(String(for_vault * value));
                payCommissionTRON(fromAddress, privateKey, vault_address, srcAmountVault);
            }
            const result = yield tronWeb.trx.sendRawTransaction(signedTxn);
            if (result.txid) {
                return result.txid;
            }
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.transactionTRON = transactionTRON;
function transactionTokenTRON(fromAddress, privateKey, toAddress, amount, srcToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceTokenTRON(fromAddress, srcToken.contract, srcToken.decimals);
            if (balance < amount) {
                console.log("Error: No tienes suficientes fondos para realizar la transferencia");
                return false;
            }
            tronWeb.setAddress(fromAddress);
            let value = Math.pow(10, srcToken.decimals);
            let srcAmount = parseInt(String(amount * value));
            const contract = yield tronWeb.contract().at(srcToken.contract);
            const transaction = yield contract.transfer(toAddress, srcAmount).send({
                callValue: 0,
                shouldPollResponse: true,
                privateKey: privateKey,
            });
            console.log("TRANSACTION: ", transaction);
            return false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.transactionTokenTRON = transactionTokenTRON;
function payCommissionTRON(fromAddress, privateKey, toAddress, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            tronWeb.setAddress(fromAddress);
            const tx = yield tronWeb.transactionBuilder
                .sendTrx(toAddress, amount)
                .then(function (response) {
                return response;
            })
                .catch(function (error) {
                return false;
            });
            if (tx) {
                const signedTxn = yield tronWeb.trx
                    .sign(tx, privateKey)
                    .then(function (response) {
                    return response;
                })
                    .catch(function (error) {
                    return false;
                });
                yield tronWeb.trx.sendRawTransaction(signedTxn);
            }
        }
        catch (error) {
            return false;
        }
    });
}
