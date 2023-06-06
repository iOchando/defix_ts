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
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
const sdk_1 = require("@paraswap/sdk");
const buildLimitOrderFn = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Building");
        const account = "0x1DcfE2e21dD2a7a80d97b6cc3628240f87CFee46";
        const fetcher = (0, sdk_1.constructAxiosFetcher)(axios_1.default);
        // provider must have write access to account
        // this would usually be wallet provider (Metamask)
        const provider = ethers_1.ethers.getDefaultProvider(1);
        const contractCaller = (0, sdk_1.constructEthersContractCaller)({
            ethersProviderOrSigner: provider,
            EthersContract: ethers_1.ethers.Contract,
        }, account);
        // type BuildLimitOrderFunctions
        // & SignLimitOrderFunctions
        // & PostLimitOrderFunctions
        const paraSwapLimitOrderSDK = (0, sdk_1.constructPartialSDK)({
            chainId: 1,
            fetcher,
            contractCaller,
        }, sdk_1.constructBuildLimitOrder, sdk_1.constructSignLimitOrder, sdk_1.constructPostLimitOrder);
        console.log(paraSwapLimitOrderSDK);
        const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const HEX = "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39";
        const orderInput = {
            nonce: 1,
            expiry: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
            makerAsset: DAI,
            takerAsset: HEX,
            makerAmount: (1e18).toString(10),
            takerAmount: (8e18).toString(10),
            maker: account,
        };
        console.log(orderInput);
        const signableOrderData = yield paraSwapLimitOrderSDK.buildLimitOrder(orderInput);
        console.log(JSON.stringify(signableOrderData));
        console.log("MAKN");
        const signature = yield paraSwapLimitOrderSDK.signLimitOrder(signableOrderData);
        console.log("SALIO");
        const orderToPostToApi = Object.assign(Object.assign({}, signableOrderData.data), { signature });
        const newOrder = yield paraSwapLimitOrderSDK.postLimitOrder(orderToPostToApi);
        console.log(newOrder);
    }
    catch (error) {
        console.log(error);
        console.log("Error funcion 1");
    }
});
buildLimitOrderFn();
