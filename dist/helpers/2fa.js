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
exports.validation2FA = void 0;
const _2fa_controller_1 = require("../controllers/2fa.controller");
const validation2FA = (defixId, code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const status = yield (0, _2fa_controller_1.status2faFn)(defixId);
        if (!status)
            return true;
        if (!code)
            return false;
        const validate = yield (0, _2fa_controller_1.validarCode2fa)(code, defixId);
        if (!validate)
            return false;
        return true;
    }
    catch (error) {
        console.log(error);
        return false;
    }
});
exports.validation2FA = validation2FA;
