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
exports.getBalanceTokenNEAR = exports.validatePkNEAR = exports.swapTokenNEAR = exports.getBalanceNEAR = exports.isAddressNEAR = exports.importWalletNEAR = exports.getIdNear = exports.createWalletNEAR = exports.transactionNEAR = exports.swapPreviewNEAR = void 0;
const near_api_js_1 = require("near-api-js");
const axios_1 = __importDefault(require("axios"));
const nearSEED = require("near-seed-phrase");
const utils_1 = require("../helpers/utils");
const bn_js_1 = __importDefault(require("bn.js"));
const postgres_1 = __importDefault(require("../config/postgres"));
const ref_sdk_1 = require("@ref-finance/ref-sdk");
const transaction_1 = require("near-api-js/lib/transaction");
const utils_2 = require("near-api-js/lib/utils");
const NETWORK = process.env.NETWORK || "testnet";
const ETHERSCAN = process.env.ETHERSCAN;
let NEAR;
if (process.env.NEAR_ENV === "testnet") {
    NEAR = "testnet";
}
else {
    NEAR = "near";
}
const createWalletNEAR = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const keyPair = near_api_js_1.KeyPair.fromString(walletSeed.secretKey);
    const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString("hex");
    const credential = {
        name: "NEAR",
        address: implicitAccountId,
        privateKey: walletSeed.secretKey,
    };
    return credential;
});
exports.createWalletNEAR = createWalletNEAR;
const importWalletNEAR = (nearId, mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const credential = {
        name: "NEAR",
        address: nearId,
        privateKey: walletSeed.secretKey,
    };
    return credential;
});
exports.importWalletNEAR = importWalletNEAR;
const getIdNear = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const walletSeed = yield nearSEED.parseSeedPhrase(mnemonic);
    const split = String(walletSeed.publicKey).split(":");
    const id = String(split[1]);
    return id;
});
exports.getIdNear = getIdNear;
const isAddressNEAR = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
    const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
    const account = new near_api_js_1.Account(near.connection, address);
    const is_address = yield account
        .state()
        .then((response) => {
        return true;
    })
        .catch((error) => {
        return false;
    });
    return is_address;
});
exports.isAddressNEAR = isAddressNEAR;
const validatePkNEAR = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyPair = near_api_js_1.KeyPair.fromString(privateKey);
        const implicitAccountId = Buffer.from(keyPair.getPublicKey().data).toString("hex");
        const credential = {
            name: "NEAR",
            address: implicitAccountId,
            privateKey: privateKey,
        };
        return credential;
    }
    catch (error) {
        return false;
    }
});
exports.validatePkNEAR = validatePkNEAR;
const getBalanceNEAR = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield validateNearId(address);
        let balanceTotal = 0;
        if (response) {
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, address);
            const balanceAccount = yield account.state();
            const valueStorage = Math.pow(10, 19);
            const valueYocto = Math.pow(10, 24);
            const storage = (balanceAccount.storage_usage * valueStorage) / valueYocto;
            balanceTotal =
                Number(balanceAccount.amount) / valueYocto - storage - 0.05;
            if (balanceTotal === null || balanceTotal < 0) {
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
exports.getBalanceNEAR = getBalanceNEAR;
const getBalanceTokenNEAR = (address, srcContract, decimals) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(address, decimals, srcContract);
        const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
        const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
        const account = new near_api_js_1.Account(near.connection, address);
        // const contract: any = new Contract(account, srcContract, {
        //   changeMethods: [],
        //   viewMethods: ["ft_balance_of"],
        // });
        // console.log(contract);
        const balance = yield account.viewFunction({
            contractId: srcContract,
            methodName: "ft_balance_of",
            args: { account_id: address },
        });
        // const balance = contract.ft_balance_of({ account_id: address });
        if (!balance)
            return 0;
        return balance / Math.pow(10, decimals);
    }
    catch (error) {
        return 0;
    }
});
exports.getBalanceTokenNEAR = getBalanceTokenNEAR;
function transactionNEAR(fromAddress, privateKey, toAddress, coin, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance_user = yield getBalanceNEAR(fromAddress);
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const keyPair = near_api_js_1.KeyPair.fromString(privateKey);
            keyStore.setKey(NETWORK, fromAddress, keyPair);
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, fromAddress);
            const resp_comision = yield (0, utils_1.GET_COMISION)(coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(coin);
            const nearPrice = yield axios_1.default.get("https://nearblocks.io/api/near-price");
            const for_vault = resp_comision.transfer / nearPrice.data.usd;
            const amountInYocto = near_api_js_1.utils.format.parseNearAmount(String(amount));
            const for_vaultYocto = near_api_js_1.utils.format.parseNearAmount(String(for_vault));
            if (balance_user < amount + for_vault)
                return false;
            if (!amountInYocto)
                return false;
            const response = yield account.sendMoney(toAddress, new bn_js_1.default(amountInYocto));
            if (for_vaultYocto !== "0" && vault_address && for_vaultYocto) {
                yield account.sendMoney(vault_address, new bn_js_1.default(for_vaultYocto));
            }
            if (!response.transaction.hash)
                return false;
            return response.transaction.hash;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.transactionNEAR = transactionNEAR;
const swapPreviewNEAR = (fromCoin, toCoin, amount, blockchain, address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fromToken = yield getTokenContractSwap(fromCoin, blockchain);
        const toToken = yield getTokenContractSwap(toCoin, blockchain);
        const tokenIn = fromToken.contract;
        const tokenOut = toToken.contract;
        console.log(tokenIn, tokenOut);
        const tokensMetadata = yield (0, ref_sdk_1.ftGetTokensMetadata)([tokenIn, tokenOut]);
        const simplePools = (yield (0, ref_sdk_1.fetchAllPools)()).simplePools.filter((pool) => {
            return pool.tokenIds[0] === tokenIn && pool.tokenIds[1] === tokenOut;
        });
        const swapAlls = yield (0, ref_sdk_1.estimateSwap)({
            tokenIn: tokensMetadata[tokenIn],
            tokenOut: tokensMetadata[tokenOut],
            amountIn: String(amount),
            simplePools: simplePools,
            options: { enableSmartRouting: true },
        });
        const transactionsRef = yield (0, ref_sdk_1.instantSwap)({
            tokenIn: tokensMetadata[tokenIn],
            tokenOut: tokensMetadata[tokenOut],
            amountIn: String(amount),
            swapTodos: swapAlls,
            slippageTolerance: 0.01,
            AccountId: address,
        });
        const transaction = transactionsRef.find((element) => element.functionCalls[0].methodName === "ft_transfer_call");
        if (!transaction)
            return false;
        const transfer = transaction.functionCalls[0].args;
        const data = JSON.parse(transfer.msg);
        const comision = yield (0, utils_1.GET_COMISION)(blockchain);
        const nearPrice = yield axios_1.default.get("https://nearblocks.io/api/near-price");
        let feeTransfer = "0";
        let porcentFee = 0;
        console.log(comision);
        if (comision.swap) {
            porcentFee = comision.swap / 100;
        }
        let feeDefix = String(Number(amount) * porcentFee);
        const dataSwap = {
            exchange: "Ref Finance" + data.actions[0].pool_id,
            fromAmount: data.actions[0].amount_in,
            fromDecimals: tokensMetadata[tokenIn].decimals,
            toAmount: data.actions[0].min_amount_out,
            toDecimals: tokensMetadata[tokenOut].decimals,
            fee: String(porcentFee),
            feeDefix: feeDefix,
            feeTotal: String(Number(feeDefix)),
        };
        return { dataSwap, priceRoute: transactionsRef };
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.swapPreviewNEAR = swapPreviewNEAR;
function swapTokenNEAR(blockchain, privateKey, priceRoute, address) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const transaction = priceRoute.find((element) => element.functionCalls[0].methodName === "ft_transfer_call");
            if (!transaction)
                return false;
            const transfer = transaction.functionCalls[0].args;
            const data = JSON.parse(transfer.msg);
            const tokensMetadata = yield (0, ref_sdk_1.ftGetTokensMetadata)([
                data.actions[0].token_in,
                data.actions[0].token_out,
            ]);
            const tokenIn = tokensMetadata[data.actions[0].token_in];
            const tokenOut = tokensMetadata[data.actions[0].token_out];
            const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
            const keyPair = near_api_js_1.KeyPair.fromString(privateKey);
            keyStore.setKey(process.env.NEAR_ENV, address, keyPair);
            const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
            const account = new near_api_js_1.Account(near.connection, address);
            let nearTransactions = [];
            if (data.actions[0].token_in.includes("wrap.")) {
                const trx = yield createTransactionFn(data.actions[0].token_in, [
                    yield (0, transaction_1.functionCall)("near_deposit", {}, new bn_js_1.default("300000000000000"), new bn_js_1.default(data.actions[0].amount_in)),
                ], address, near);
                nearTransactions.push(trx);
            }
            const trxs = yield Promise.all(priceRoute.map((tx) => __awaiter(this, void 0, void 0, function* () {
                return yield createTransactionFn(tx.receiverId, tx.functionCalls.map((fc) => {
                    return (0, transaction_1.functionCall)(fc.methodName, fc.args, fc.gas, new bn_js_1.default(String(near_api_js_1.utils.format.parseNearAmount(fc.amount))));
                }), address, near);
            })));
            nearTransactions = nearTransactions.concat(trxs);
            if (data.actions[0].token_out.includes("wrap.")) {
                const trx = yield createTransactionFn(data.actions[0].token_out, [
                    yield (0, transaction_1.functionCall)("near_withdraw", { amount: data.actions[0].min_amount_out }, new bn_js_1.default("300000000000000"), new bn_js_1.default("1")),
                ], address, near);
                nearTransactions.push(trx);
            }
            let resultSwap;
            for (let trx of nearTransactions) {
                console.log("ENTRA");
                console.log(trx.actions[0].functionCall.methodName);
                const result = yield account.signAndSendTransaction(trx);
                console.log(result);
                if (trx.actions[0].functionCall.methodName === "ft_transfer_call") {
                    resultSwap = result;
                }
            }
            if (!resultSwap.transaction.hash)
                return false;
            const transactionHash = resultSwap.transaction.hash;
            if (!transactionHash)
                return false;
            const resp_comision = yield (0, utils_1.GET_COMISION)(blockchain);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(blockchain);
            const comision = resp_comision.swap / 100;
            let amount_vault = String(Number(data.actions[0].min_amount_out / Math.pow(10, 24)) * comision);
            const amountYocto = near_api_js_1.utils.format.parseNearAmount(amount_vault);
            if (amount_vault && vault_address && amountYocto) {
                yield account.sendMoney(vault_address, // receiver account
                new bn_js_1.default(amountYocto) // amount in yoctoNEAR
                );
            }
            const srcAmount = String(Number(data.actions[0].amount_in) / Math.pow(10, tokenIn.decimals));
            const destAmount = String(Number(data.actions[0].amount_out) / Math.pow(10, tokenOut.decimals));
            return {
                transactionHash: transactionHash,
                address: address,
                srcAmount,
                destAmount,
            };
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.swapTokenNEAR = swapTokenNEAR;
function createTransactionFn(receiverId, actions, userAddress, near) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const walletConnection = new near_api_js_1.WalletConnection(near, null);
        const wallet = new near_api_js_1.ConnectedWalletAccount(walletConnection, near.connection, userAddress);
        if (!wallet || !near) {
            throw new Error(`No active wallet or NEAR connection.`);
        }
        const localKey = yield (near === null || near === void 0 ? void 0 : near.connection.signer.getPublicKey(userAddress, near.connection.networkId));
        const accessKey = yield wallet.accessKeyForTransaction(receiverId, actions, localKey);
        if (!accessKey) {
            throw new Error(`Cannot find matching key for transaction sent to ${receiverId}`);
        }
        const block = yield (near === null || near === void 0 ? void 0 : near.connection.provider.block({
            finality: "final",
        }));
        if (!block) {
            throw new Error(`Cannot find block for transaction sent to ${receiverId}`);
        }
        const blockHash = near_api_js_1.utils.serialize.base_decode((_a = block === null || block === void 0 ? void 0 : block.header) === null || _a === void 0 ? void 0 : _a.hash);
        //const blockHash = nearAPI.utils.serialize.base_decode(accessKey.block_hash);
        const publicKey = utils_2.PublicKey.from(accessKey.public_key);
        //const nonce = accessKey.access_key.nonce + nonceOffset
        const nonce = ++accessKey.access_key.nonce;
        return (0, transaction_1.createTransaction)(userAddress, publicKey, receiverId, nonce, actions, blockHash);
    });
}
const getTokenContractSwap = (token, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("SELECT *\
      FROM backend_token a\
      inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
      where a.coin = $1 and b.coin = $2", [token, blockchain]);
        if (response.rows.length === 0) {
            if (token === "NEAR") {
                console.log("ENTRO");
                return {
                    decimals: 24,
                    contract: "wrap.testnet",
                };
            }
            return false;
        }
        return response.rows[0];
    }
    catch (error) {
        return false;
    }
});
const validateNearId = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const keyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
        const near = new near_api_js_1.Near((0, utils_1.CONFIG)(keyStore));
        const account = new near_api_js_1.Account(near.connection, address);
        const response = yield account
            .state()
            .then((response) => {
            return true;
        })
            .catch((error) => {
            return false;
        });
        return response;
    }
    catch (error) {
        return false;
    }
});
