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
exports.getCryptosSwap = exports.getBalance = exports.getCryptos = void 0;
const postgres_1 = __importDefault(require("../config/postgres"));
const utils_1 = require("../helpers/utils");
const btc_services_1 = require("../services/btc.services");
const eth_services_1 = require("../services/eth.services");
const near_services_1 = require("../services/near.services");
const tron_services_1 = require("../services/tron.services");
const bsc_services_1 = require("../services/bsc.services");
const user_entity_1 = require("../entities/user.entity");
const addresses_entity_1 = require("../entities/addresses.entity");
const balances_entity_1 = require("../entities/balances.entity");
const NETWORK = process.env.NETWORK;
const getCryptos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const cryptocurrencys = yield conexion.query("select * from backend_cryptocurrency");
        const cryptos = [];
        for (let cryptocurrency of cryptocurrencys.rows) {
            const tokens = yield conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
            cryptocurrency.tokens = tokens.rows;
            cryptos.push(cryptocurrency);
        }
        res.send(cryptos);
    }
    catch (error) {
        // console.log(error)
        res.status(400).send();
    }
});
exports.getCryptos = getCryptos;
const getCryptosSwap = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const cryptocurrencys = yield conexion.query("select * from backend_cryptocurrency where swap=true");
        const cryptos = [];
        for (let cryptocurrency of cryptocurrencys.rows) {
            const tokens = yield conexion.query("select * from backend_token where cryptocurrency_id = $1", [cryptocurrency.id]);
            cryptocurrency.tokens = tokens.rows;
            cryptos.push(cryptocurrency);
        }
        res.send(cryptos);
    }
    catch (error) {
        // console.log(error)
        res.status(400).send();
    }
});
exports.getCryptosSwap = getCryptosSwap;
const getBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const addresses = yield addresses_entity_1.Address.find({
            where: { user: { defix_id: defixId } },
        });
        if (addresses.length === 0)
            return res.status(404).send();
        const cryptos = yield (0, utils_1.getCryptosFn)();
        const balances = [];
        for (let crypto of cryptos) {
            const balanceCrypto = {
                coin: crypto.coin,
                blockchain: crypto.blockchain,
                icon: crypto.icon,
                balance: 0,
                tokens: [],
            };
            const addressItem = addresses.find((element) => element.name === crypto.coin);
            if (!addressItem)
                return res.status(404).send();
            const address = addressItem.address || "";
            switch (crypto.coin) {
                case "BTC": {
                    if (NETWORK === "mainnet") {
                        balanceCrypto.balance = yield (0, btc_services_1.getBalanceBTC)(address);
                    }
                    else {
                        balanceCrypto.balance = yield (0, btc_services_1.getBalanceBTC_Cypher)(address);
                    }
                    break;
                }
                case "ETH": {
                    balanceCrypto.balance = yield (0, eth_services_1.getBalanceETH)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                            icon: token.icon,
                        };
                        itemToken.balance = yield (0, eth_services_1.getBalanceTokenETH)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                case "NEAR": {
                    balanceCrypto.balance = yield (0, near_services_1.getBalanceNEAR)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                            icon: token.icon,
                        };
                        itemToken.balance = yield (0, near_services_1.getBalanceTokenNEAR)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                case "BNB": {
                    if (!address) {
                        balanceCrypto.balance = 0;
                        break;
                    }
                    balanceCrypto.balance = yield (0, bsc_services_1.getBalanceBNB)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                            icon: token.icon,
                        };
                        itemToken.balance = yield (0, bsc_services_1.getBalanceTokenBSC)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                case "TRX": {
                    if (!address) {
                        balanceCrypto.balance = 0;
                        break;
                    }
                    balanceCrypto.balance = yield (0, tron_services_1.getBalanceTRON)(address);
                    for (let token of crypto.tokens) {
                        const itemToken = {
                            coin: token.coin,
                            balance: 0,
                            icon: token.icon,
                        };
                        itemToken.balance = yield (0, tron_services_1.getBalanceTokenTRON)(address, token.contract, token.decimals);
                        balanceCrypto.tokens.push(itemToken);
                    }
                    break;
                }
                default: {
                    //statements;
                    break;
                }
            }
            balances.push(balanceCrypto);
        }
        res.send(balances);
        balanceDataBaseFn(defixId, balances);
    }
    catch (error) {
        res.status(404).send();
    }
});
exports.getBalance = getBalance;
// UTILS
const balanceDataBaseFn = (defixId, balances) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        for (let balance of balances) {
            const balanceItem = yield balances_entity_1.Balances.findOneBy({
                user: { defix_id: defixId },
                blockchain: balance.blockchain,
                coin: balance.coin,
            });
            if (!balanceItem) {
                yield balances_entity_1.Balances.create({
                    user: user,
                    blockchain: balance.blockchain,
                    coin: balance.coin,
                    balance: balance.balance,
                }).save();
            }
            else {
                const update = yield balances_entity_1.Balances.findOneBy({
                    user: { defix_id: defixId },
                    blockchain: balance.blockchain,
                    coin: balance.coin,
                });
                if (!update)
                    break;
                update.balance = balance.balance;
                update.save();
            }
            for (let token of balance.tokens) {
                const balanceToken = yield balances_entity_1.Balances.findOneBy({
                    user: { id: user.id },
                    blockchain: balance.blockchain,
                    coin: token.coin,
                });
                if (!balanceToken) {
                    yield balances_entity_1.Balances.create({
                        user: user,
                        blockchain: balance.blockchain,
                        coin: token.coin,
                        balance: token.balance,
                    }).save();
                }
                else {
                    const update = yield balances_entity_1.Balances.findOneBy({
                        user: { defix_id: defixId },
                        blockchain: balance.blockchain,
                        coin: token.coin,
                    });
                    if (!update)
                        break;
                    update.balance = token.balance;
                    update.save();
                }
            }
        }
    }
    catch (error) {
        console.log(error);
    }
});
