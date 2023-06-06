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
const process = require("process");
const ProcessFn = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=tron%2Cbitcoin%2Cethereum%2Ctether%2Cbinancecoin%2Cwrapped-bitcoin%2Cusdc-coin%2Cdai&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=1h%2C24h%2C7d");
        if (response.data) {
            console.log("EMIT");
            if (response.data.length > 0) {
                // console.log(response.data[0]);
                process.send(response.data);
            }
        }
    }
    catch (error) {
        // console.log("err")
    }
});
const startProcess = () => {
    ProcessFn();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        ProcessFn();
    }), 60000);
};
startProcess();
