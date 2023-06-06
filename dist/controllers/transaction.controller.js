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
exports.deleteFrequent = exports.getFrequent = exports.getTransactionHistory = exports.transaction = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const crypto_1 = require("../helpers/crypto");
const btc_services_1 = require("../services/btc.services");
const eth_services_1 = require("../services/eth.services");
const near_services_1 = require("../services/near.services");
const tron_services_1 = require("../services/tron.services");
const bsc_services_1 = require("../services/bsc.services");
const mail_1 = require("../helpers/mail");
const frequent_entity_1 = require("../entities/frequent.entity");
const user_entity_1 = require("../entities/user.entity");
const transaction_entity_1 = require("../entities/transaction.entity");
const _2fa_1 = require("../helpers/2fa");
function transaction(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromDefix, pkEncrypt, toDefix, coin, amount, blockchain, code } = req.body;
            let transactionHash, fromAddress, toAddress, tipoEnvio;
            const privateKey = (0, crypto_1.decrypt)(pkEncrypt);
            if (!fromDefix ||
                !privateKey ||
                !toDefix ||
                !coin ||
                !amount ||
                !blockchain)
                return res.status(400).send();
            if (fromDefix.includes(".defix3")) {
                fromAddress = yield (0, utils_1.getAddressUser)(fromDefix, blockchain);
            }
            else {
                fromAddress = fromDefix;
            }
            if (toDefix.includes(".defix3")) {
                toAddress = yield (0, utils_1.getAddressUser)(toDefix, blockchain);
                tipoEnvio = "user";
            }
            else {
                toAddress = toDefix;
                tipoEnvio = "wallet";
            }
            if (!fromAddress || !toAddress)
                return res.status(400).send();
            const srcContract = yield getTokenContract(coin, blockchain);
            if (!(yield (0, _2fa_1.validation2FA)(fromDefix, code)))
                return res.status(401).send();
            if (blockchain === "BTC") {
                transactionHash = yield (0, btc_services_1.transactionBTC)(fromAddress, privateKey, toAddress, coin, amount);
            }
            else if (blockchain === "NEAR") {
                transactionHash = yield (0, near_services_1.transactionNEAR)(fromAddress, privateKey, toAddress, coin, amount);
            }
            else if (blockchain === "ETH") {
                if (coin == "ETH" && !srcContract) {
                    transactionHash = yield (0, eth_services_1.transactionETH)(fromAddress, privateKey, toAddress, coin, amount);
                }
                else {
                    transactionHash = yield (0, eth_services_1.transactionTokenETH)(fromAddress, privateKey, toAddress, amount, srcContract);
                }
            }
            else if (blockchain === "TRX") {
                if (coin == "TRX" && !srcContract) {
                    transactionHash = yield (0, tron_services_1.transactionTRON)(fromAddress, privateKey, toAddress, coin, amount);
                }
                else {
                    transactionHash = yield (0, tron_services_1.transactionTokenTRON)(fromAddress, privateKey, toAddress, amount, srcContract);
                }
            }
            else if (blockchain === "BNB") {
                if (coin == "BNB" && !srcContract) {
                    transactionHash = yield (0, bsc_services_1.transactionBNB)(fromAddress, privateKey, toAddress, coin, amount);
                }
                else {
                    transactionHash = yield (0, bsc_services_1.transactionTokenBNB)(fromAddress, privateKey, toAddress, amount, srcContract);
                }
            }
            else {
                transactionHash = false;
            }
            if (!transactionHash)
                return res.status(500).send();
            const resSend = yield (0, mail_1.getEmailFlagFN)(fromDefix, "SEND");
            const resReceive = yield (0, mail_1.getEmailFlagFN)(toDefix, "RECEIVE");
            const item = {
                monto: amount,
                moneda: coin,
                receptor: toDefix,
                emisor: fromDefix,
                tipoEnvio: tipoEnvio,
            };
            (0, mail_1.EnvioCorreo)(resSend, resReceive, "envio", item);
            const transaction = yield (0, utils_1.saveTransaction)(fromDefix, toDefix, coin, blockchain, amount, fromAddress, toAddress, transactionHash, "TRANSFER");
            yield saveFrequent(fromDefix, toDefix);
            return res.send(transaction);
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
exports.transaction = transaction;
function saveFrequent(defixId, frequentUser) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userFrequent = yield frequent_entity_1.Frequent.findOneBy({
                user: { defix_id: defixId },
                frequent_user: frequentUser,
            });
            if (userFrequent)
                return false;
            const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
            if (!user)
                return false;
            const frequent = new frequent_entity_1.Frequent();
            frequent.user = user;
            frequent.frequent_user = frequentUser;
            frequent.save();
            return true;
        }
        catch (error) {
            return false;
        }
    });
}
function getFrequent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { defixId } = req.body;
            const frequents = yield frequent_entity_1.Frequent.find({
                where: { user: { defix_id: defixId } },
            });
            res.send(frequents);
        }
        catch (error) {
            return false;
        }
    });
}
exports.getFrequent = getFrequent;
function deleteFrequent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id_frequent } = req.body;
            const result = yield frequent_entity_1.Frequent.delete({ id: id_frequent });
            if (result.affected === 0)
                return res.status(404).send();
            return res.status(204).send();
        }
        catch (error) {
            res.status(404).json(error);
        }
    });
}
exports.deleteFrequent = deleteFrequent;
const getTransactionHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, coin, blockchain, date_year, date_month, tipo } = req.body;
        const transactions = yield (yield transaction_entity_1.Transaction.find({
            where: {
                coin: coin ? coin : undefined,
                blockchain: blockchain ? blockchain : undefined,
                date_year: date_year ? date_year : undefined,
                date_month: date_month ? date_month : undefined,
                tipo: tipo ? tipo : undefined,
            },
        })).filter(function (element) {
            return element.from_defix === defixId || element.to_defix === defixId;
        });
        res.send(transactions);
        // const conexion = await dbConnect()
        // const resultados = await conexion.query("select * \
        //                                           from transactions where \
        //                                           ((from_defix = $1 or to_defix = $1) or ('%' = $1 or '%' = $1))\
        //                                           and (coin = $2 or '%' = $2)\
        //                                           and (date_year = $3 or '%' = $3)\
        //                                           and (date_month = $4 or '%' = $4)\
        //                                           and (tipo = $5 or '%' = $5)\
        //                                           ", [defixId, coin, date_year, date_month, tipo])
        // res.json(resultados.rows)
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.getTransactionHistory = getTransactionHistory;
const getTokenContract = (token, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2", [token, blockchain]);
        if (response.rows.length === 0)
            return false;
        console.log(response.rows);
        return response.rows[0];
    }
    catch (error) {
        return false;
    }
});
