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
exports.validatePkETH = exports.transactionTokenETH = exports.transactionETH = exports.getBalanceTokenETH = exports.getBalanceETH = exports.isAddressETH = exports.createWalletETH = exports.swapPreviewETH = exports.swapTokenETH = void 0;
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ethers_1 = require("ethers");
const web3_1 = __importDefault(require("web3"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../helpers/utils");
const sdk_1 = require("@paraswap/sdk");
const abi_json_1 = __importDefault(require("../helpers/abi.json"));
const postgres_1 = __importDefault(require("../config/postgres"));
const ETHEREUM_NETWORK = process.env.ETHEREUM_NETWORK;
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const web3 = new web3_1.default(new web3_1.default.providers.HttpProvider(`https://${ETHEREUM_NETWORK}.infura.io/v3/${INFURA_PROJECT_ID}`));
const NETWORK = process.env.NETWORK;
const ETHERSCAN = process.env.ETHERSCAN;
const createWalletETH = (mnemonic) => __awaiter(void 0, void 0, void 0, function* () {
    const provider = new ethers_1.ethers.providers.EtherscanProvider(ETHERSCAN);
    const wallet = ethers_1.ethers.Wallet.fromMnemonic(mnemonic);
    const credential = {
        name: "ETH",
        address: wallet.address,
        privateKey: wallet.privateKey,
    };
    return credential;
});
exports.createWalletETH = createWalletETH;
const isAddressETH = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const is_address = yield web3.utils.isAddress(address);
    return is_address;
});
exports.isAddressETH = isAddressETH;
const validatePkETH = (privateKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = web3.eth.accounts.privateKeyToAccount(privateKey);
        const credential = {
            name: "ETH",
            address: wallet.address,
            privateKey: privateKey,
        };
        return credential;
    }
    catch (error) {
        return false;
    }
});
exports.validatePkETH = validatePkETH;
const getBalanceETH = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = { coin: "ETH", balance: 0 };
        let balance = yield web3.eth.getBalance(address);
        let balanceTotal = 0;
        if (balance) {
            let value = Math.pow(10, 18);
            balanceTotal = Number(balance) / value;
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
exports.getBalanceETH = getBalanceETH;
const getBalanceTokenETH = (address, srcContract, decimals) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let contract = new web3.eth.Contract(abi_json_1.default, srcContract);
        const balance = yield contract.methods.balanceOf(address).call();
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
exports.getBalanceTokenETH = getBalanceTokenETH;
function transactionETH(fromAddress, privateKey, toAddress, coin, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceETH(fromAddress);
            if (balance < amount) {
                console.log("Error: No tienes suficientes fondos para realizar la transferencia");
                return false;
            }
            const gasPrice = yield web3.eth.getGasPrice();
            const gasLimit = 21000;
            const nonce = yield web3.eth.getTransactionCount(fromAddress);
            const rawTransaction = {
                from: fromAddress,
                to: toAddress,
                value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(gasLimit),
                nonce: nonce,
            };
            const signedTransaction = yield web3.eth.accounts.signTransaction(rawTransaction, privateKey);
            if (!signedTransaction.rawTransaction)
                return false;
            const transactionHash = yield web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
            const response = yield axios_1.default.get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6");
            let wei = response.data.result.SafeGasPrice;
            let fee = Number(web3.utils.fromWei(String(21000 * wei), "gwei"));
            const resp_comision = yield (0, utils_1.GET_COMISION)(coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(coin);
            const comision = resp_comision.transfer / 100;
            let amount_vault = Number((fee * comision).toFixed(18));
            console.log(amount_vault, vault_address);
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionETH(fromAddress, privateKey, vault_address, amount_vault);
            }
            if (!transactionHash.transactionHash)
                return false;
            return transactionHash.transactionHash;
        }
        catch (error) {
            console.error(error);
            return false;
        }
    });
}
exports.transactionETH = transactionETH;
function transactionTokenETH(fromAddress, privateKey, toAddress, amount, srcToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const balance = yield getBalanceTokenETH(fromAddress, srcToken.contract, srcToken.decimals);
            if (balance && balance < amount) {
                console.log("Error: No tienes suficientes fondos para realizar la transferencia");
                return false;
            }
            const provider = new ethers_1.ethers.providers.InfuraProvider(ETHEREUM_NETWORK, INFURA_PROJECT_ID);
            const minABI = abi_json_1.default;
            const wallet = new ethers_1.ethers.Wallet(privateKey);
            const signer = wallet.connect(provider);
            console.log("SIGNER", srcToken);
            const contract = new ethers_1.ethers.Contract(srcToken.contract, minABI, signer);
            let value = Math.pow(10, srcToken.decimals);
            let srcAmount = amount * value;
            const tx = yield contract.transfer(toAddress, String(srcAmount));
            const response = yield axios_1.default.get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6");
            let wei = response.data.result.SafeGasPrice;
            let fee = Number(web3.utils.fromWei(String(55000 * wei), "gwei"));
            const resp_comision = yield (0, utils_1.GET_COMISION)(srcToken.coin);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(srcToken.coin);
            const comision = resp_comision.transfer / 100;
            let amount_vault = Number((fee * comision).toFixed(18));
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionETH(fromAddress, privateKey, vault_address, amount_vault);
            }
            if (tx.hash) {
                return tx.hash;
            }
            return false;
        }
        catch (error) {
            console.log("error", error);
            return false;
        }
    });
}
exports.transactionTokenETH = transactionTokenETH;
function payCommissionETH(fromAddress, privateKey, toAddress, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const gasPrice = yield web3.eth.getGasPrice();
            const gasLimit = 21000;
            const nonce = yield web3.eth.getTransactionCount(fromAddress);
            const rawTransaction = {
                from: fromAddress,
                to: toAddress,
                value: web3.utils.toHex(web3.utils.toWei(amount.toString(), "ether")),
                gasPrice: web3.utils.toHex(gasPrice),
                gasLimit: web3.utils.toHex(gasLimit),
                nonce: nonce,
            };
            const signedTransaction = yield web3.eth.accounts.signTransaction(rawTransaction, privateKey);
            if (!signedTransaction.rawTransaction)
                return false;
            yield web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
        }
        catch (error) {
            return false;
        }
    });
}
const swapPreviewETH = (fromCoin, toCoin, amount, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paraSwap = (0, sdk_1.constructSimpleSDK)({ chainId: 1, axios: axios_1.default });
        const fromToken = yield getTokenContractSwap(fromCoin, blockchain);
        const toToken = yield getTokenContractSwap(toCoin, blockchain);
        if (!fromToken || !toToken)
            return false;
        let value = Math.pow(10, fromToken.decimals);
        const srcAmount = amount * value;
        const priceRoute = yield paraSwap.swap.getRate({
            srcToken: fromToken.contract,
            destToken: toToken.contract,
            amount: String(srcAmount),
        });
        const response = yield axios_1.default.get("https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=ZAXW568KING2VVBGAMBU7399KH7NBB8QX6");
        let wei = response.data.result.SafeGasPrice;
        const comision = yield (0, utils_1.GET_COMISION)(blockchain);
        let feeTransfer = "0";
        let porcentFee = 0;
        if (comision.swap) {
            porcentFee = comision.swap / 100;
            if (comision.swap && fromCoin === "ETH") {
                feeTransfer = web3.utils.fromWei(String(21000 * wei), "gwei");
            }
            else {
                feeTransfer = web3.utils.fromWei(String(55000 * wei), "gwei");
            }
        }
        const feeGas = web3.utils.fromWei(String(Number(priceRoute.gasCost) * wei), "gwei");
        const srcFee = String(Number(feeTransfer) + Number(feeGas));
        let feeDefix = String(Number(srcFee) * porcentFee);
        const dataSwap = {
            exchange: priceRoute.bestRoute[0].swaps[0].swapExchanges[0].exchange,
            fromAmount: priceRoute.srcAmount,
            fromDecimals: fromToken.decimals,
            toAmount: priceRoute.destAmount,
            toDecimals: toToken.decimals,
            fee: srcFee,
            feeDefix: feeDefix,
            feeTotal: String(Number(srcFee) + Number(feeDefix)),
        };
        return { dataSwap, priceRoute };
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.swapPreviewETH = swapPreviewETH;
function swapTokenETH(blockchain, privateKey, priceRoute) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paraSwap = (0, sdk_1.constructSimpleSDK)({ chainId: 1, axios: axios_1.default });
            const signer = web3.eth.accounts.privateKeyToAccount(privateKey);
            const txParams = yield paraSwap.swap.buildTx({
                srcToken: priceRoute.srcToken,
                destToken: priceRoute.destToken,
                srcAmount: priceRoute.srcAmount,
                destAmount: priceRoute.destAmount,
                priceRoute: priceRoute,
                userAddress: signer.address,
            });
            const txSigned = yield signer.signTransaction(txParams);
            if (!txSigned.rawTransaction)
                return false;
            console.log(txSigned);
            const result = yield web3.eth.sendSignedTransaction(txSigned.rawTransaction);
            const transactionHash = result.transactionHash;
            if (!transactionHash)
                return false;
            const resp_comision = yield (0, utils_1.GET_COMISION)(blockchain);
            const vault_address = yield (0, utils_1.ADDRESS_VAULT)(blockchain);
            const comision = resp_comision.swap / 100;
            let amount_vault = Number(priceRoute.gasCostUSD) * comision;
            if (amount_vault !== 0 && vault_address) {
                yield payCommissionETH(signer.address, privateKey, vault_address, amount_vault);
            }
            return { transactionHash: transactionHash, address: signer.address };
        }
        catch (error) {
            console.log(error);
            return false;
        }
    });
}
exports.swapTokenETH = swapTokenETH;
const getTokenContractSwap = (token, blockchain) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conexion = yield (0, postgres_1.default)();
        const response = yield conexion.query("SELECT *\
                                          FROM backend_token a\
                                          inner join backend_cryptocurrency b on b.id = a.cryptocurrency_id\
                                          where a.coin = $1 and b.coin = $2", [token, blockchain]);
        if (response.rows.length === 0) {
            if (token === "ETH") {
                return {
                    decimals: 18,
                    contract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
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
