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
const checkAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.headers.authorization);
        if (!req.headers.authorization) {
            return res.status(404).send();
        }
        const token = req.headers.authorization.split(" ").pop();
        if (token === process.env.KEY_DJANGO) {
            next();
        }
        else {
            return res.status(404).send();
        }
    }
    catch (e) {
        return res.status(404).send();
    }
});
module.exports = checkAuth;
