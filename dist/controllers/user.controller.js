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
exports.getEmailData = exports.setEmailData = exports.closeAllSessions = exports.getCloseAllSesions = void 0;
const utils_1 = require("../helpers/utils");
const _2fa_controller_1 = require("./2fa.controller");
const crypto_1 = require("../helpers/crypto");
const user_entity_1 = require("../entities/user.entity");
const data_source_1 = __importDefault(require("../config/data.source"));
const setEmailData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId } = req.body;
    const DefixId = defixId.toLowerCase();
    (0, _2fa_controller_1.status2faFn)(DefixId).then((respStatus) => {
        switch (respStatus) {
            case true:
                {
                    const { code } = req.body;
                    (0, _2fa_controller_1.validarCode2fa)(code, DefixId).then((respValidacion) => {
                        console.log(respValidacion);
                        switch (respValidacion) {
                            case true: {
                                return EjecutarsetEmailData(req, res);
                            }
                            case false:
                                {
                                    res.json({ respuesta: "code" });
                                }
                                break;
                            default:
                                res
                                    .status(500)
                                    .json({ respuesta: "Error interno del sistema" });
                                break;
                        }
                    });
                }
                break;
            case false: {
                return EjecutarsetEmailData(req, res);
            }
            default:
                res.status(500).json({ respuesta: "Error interno del sistema" });
                break;
        }
    });
});
exports.setEmailData = setEmailData;
function EjecutarsetEmailData(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { defixId, seedPhrase, email, flag_send, flag_receive, flag_dex, flag_fiat, name, last_name, legal_document, type_document, } = req.body;
            const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
            if (!mnemonic)
                return res.status(400).send();
            const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
            if (!user)
                return res.status(400).send();
            const response = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
            if (legal_document == !null) {
                if (type_document == !"v" && type_document == !"j") {
                    return res.status(400).send({ response: "Error tipo de documento" });
                }
            }
            if (!response)
                return res.status(400).send();
            yield user_entity_1.User.update({ defix_id: user.defix_id }, {
                email: email,
                name: name,
                lastname: last_name,
                legal_document: legal_document,
                type_document: type_document,
                flag_send: flag_send,
                flag_receive: flag_receive,
                flag_dex: flag_dex,
                flag_fiat: flag_fiat,
            });
            res.status(200).send();
        }
        catch (error) {
            return res.status(500).send();
        }
    });
}
const getEmailData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const userData = yield data_source_1.default
            .createQueryBuilder(user_entity_1.User, "user")
            .select([
            "user.defix_id",
            "user.email",
            "user.flag_send",
            "user.flag_receive",
            "user.flag_dex",
            "user.flag_fiat",
            "user.name",
            "user.lastname",
            "user.legal_document",
            "user.type_document",
            "user.dosfa",
        ])
            .where("user.defix_id = :defixId", { defixId: defixId })
            .getOne();
        if (!userData)
            return res.status(400).send();
        res.send(userData);
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.getEmailData = getEmailData;
const closeAllSessions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase } = req.body;
        const DefixId = defixId.toLowerCase();
        const user = yield user_entity_1.User.findOneBy({ defix_id: DefixId });
        if (!user)
            return res.status(400).send();
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const response = yield (0, utils_1.validateMnemonicDefix)(DefixId, mnemonic);
        console.log(response);
        if (!response)
            return res.status(404).send();
        const result = yield user_entity_1.User.update({ defix_id: defixId }, { close_sessions: true });
        res.send(result);
    }
    catch (error) {
        console.log(error);
        return res.status(500).send();
    }
});
exports.closeAllSessions = closeAllSessions;
const getCloseAllSesions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId } = req.body;
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId.toLowerCase() });
        if (!user)
            return res.status(400).send();
        res.send(user.close_sessions);
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.getCloseAllSesions = getCloseAllSesions;
