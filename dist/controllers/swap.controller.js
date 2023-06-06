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
exports.swapTron = exports.swapToken = exports.swapPreview = void 0;
const eth_services_1 = require("../services/eth.services");
const bsc_services_1 = require("../services/bsc.services");
const crypto_1 = require("../helpers/crypto");
const _2fa_1 = require("../helpers/2fa");
const mail_1 = require("../helpers/mail");
const utils_1 = require("../helpers/utils");
const near_services_1 = require("../services/near.services");
function swapPreview(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromCoin, toCoin, amount, blockchain, address } = req.body;
            let swapResult;
            if (!fromCoin || !toCoin || !amount || !blockchain)
                return res.status(400).send();
            if (blockchain === "ETH") {
                swapResult = yield (0, eth_services_1.swapPreviewETH)(fromCoin, toCoin, amount, blockchain);
                console.log(swapResult);
            }
            else if (blockchain === "BNB") {
                swapResult = yield (0, bsc_services_1.swapPreviewBNB)(fromCoin, toCoin, amount, blockchain);
            }
            else if (blockchain === "NEAR") {
                swapResult = yield (0, near_services_1.swapPreviewNEAR)(fromCoin, toCoin, amount, blockchain, address);
            }
            else {
                swapResult = false;
            }
            if (!swapResult)
                return res.status(400).send();
            return res.send(swapResult);
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
exports.swapPreview = swapPreview;
function swapToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { fromDefix, fromCoin, toCoin, pkEncrypt, priceRoute, blockchain, code, } = req.body;
            const privateKey = (0, crypto_1.decrypt)(pkEncrypt);
            if (!fromCoin ||
                !toCoin ||
                !fromDefix ||
                !priceRoute ||
                !privateKey ||
                !blockchain)
                return res.status(400).send();
            if (!(yield (0, _2fa_1.validation2FA)(fromDefix, code)))
                return res.status(401).send();
            let swapHash;
            if (blockchain === "ETH") {
                swapHash = yield (0, eth_services_1.swapTokenETH)(blockchain, privateKey, priceRoute);
            }
            else if (blockchain === "BNB") {
                swapHash = yield (0, bsc_services_1.swapTokenBSC)(blockchain, privateKey, priceRoute);
            }
            else if (blockchain === "NEAR") {
                const address = yield (0, utils_1.getAddressUser)(fromDefix, blockchain);
                if (address) {
                    swapHash = yield (0, near_services_1.swapTokenNEAR)(blockchain, privateKey, priceRoute, address);
                }
                else {
                    swapHash = false;
                }
            }
            else {
                swapHash = false;
            }
            if (!swapHash)
                return res.status(500).send();
            const resSend = yield (0, mail_1.getEmailFlagFN)(fromDefix, "DEX");
            const item = {
                user: fromDefix,
                montoA: swapHash.srcAmount,
                monedaA: fromCoin,
                montoB: swapHash.destAmount,
                monedaB: toCoin,
            };
            (0, mail_1.EnvioCorreo)(resSend, null, "swap", item);
            let coin = fromCoin + "/" + toCoin;
            console.log(swapHash);
            const transaction = yield (0, utils_1.saveTransaction)(fromDefix, fromDefix, coin, blockchain, swapHash.srcAmount, swapHash.address, swapHash.address, swapHash.transactionHash, "DEX");
            console.log(transaction);
            return res.send(transaction);
        }
        catch (error) {
            console.log(error);
            return res.status(500).send();
        }
    });
}
exports.swapToken = swapToken;
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
function swapTron(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputTokenAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"; // USDT
            const outputTokenAddress = "TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8"; // USDC
            // Crear una instancia del contrato inteligente del intercambio (DEX)
            console.log("HOLA");
            tronWeb.setAddress("TSwPWGzz3tmzwUT6eDusX3tEkAcvxie9kz");
            const dexAddress = "TSwPWGzz3tmzwUT6eDusX3tEkAcvxie9kz";
            const dexContract = yield tronWeb.contract().at(dexAddress);
            console.log("DEX", dexContract);
            // Especificar los parámetros para la transacción de intercambio
            const inputAmount = 1000; // Cantidad de tokens de entrada a intercambiar
            const minOutputAmount = 900; // Cantidad mínima de tokens de salida esperados
            const userAddress = "TCNYe4DjnoBQkScqYKa2wRPpjpgwMzwEaC"; // Dirección de la billetera del usuario
            const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // Fecha de caducidad de la transacción (10 minutos)
            // Llamar a la función de intercambio del contrato inteligente
            yield dexContract.swap(inputTokenAddress, outputTokenAddress, inputAmount, minOutputAmount, userAddress, { from: userAddress });
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.swapTron = swapTron;
