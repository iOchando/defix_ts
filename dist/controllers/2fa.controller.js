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
exports.status2faFn = exports.validarCode2fa = exports.status2fa = exports.desactivar2fa = exports.activar2fa = exports.generar2fa = void 0;
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const utils_1 = require("../helpers/utils");
const crypto_1 = require("../helpers/crypto");
const user_entity_1 = require("../entities/user.entity");
const generar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase } = req.body;
        if (!defixId || !seedPhrase)
            return res.status(400).send();
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const validate = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
        if (!validate)
            return res.status(400).send();
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return res.status(400).send();
        switch (user.dosfa) {
            case true:
                {
                    res.status(400).json({ respuesta: "dosfa" });
                }
                break;
            case false:
                {
                    if (!user.secret) {
                        const secret = otplib_1.authenticator.generateSecret();
                        yield user_entity_1.User.update({ defix_id: user.defix_id }, { secret: secret })
                            .then(() => {
                            let codigo = otplib_1.authenticator.keyuri(defixId, "Defix3 App", secret);
                            qrcode_1.default.toDataURL(codigo, (err, url) => {
                                if (err) {
                                    throw err;
                                }
                                res.json({ qr: url, codigo: secret });
                            });
                        })
                            .catch(() => {
                            res
                                .status(500)
                                .json({ respuesta: "error en la base de datos" });
                        });
                    }
                    else {
                        let codigo = otplib_1.authenticator.keyuri(defixId, "Defix3 App", user.secret);
                        qrcode_1.default.toDataURL(codigo, (err, url) => {
                            if (err) {
                                throw err;
                            }
                            res.json({ qr: url, codigo: user.secret });
                        });
                    }
                }
                break;
            default:
                res.status(500).json({ respuesta: "error en el campo dosfa" });
                break;
        }
    }
    catch (error) {
        return res.status(500).json({ respuesta: error });
    }
});
exports.generar2fa = generar2fa;
const activar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { defixId, seedPhrase, code } = req.body;
        if (!defixId || !seedPhrase || !code)
            return res.status(400).send();
        const mnemonic = (0, crypto_1.decrypt)(seedPhrase);
        if (!mnemonic)
            return res.status(400).send();
        const response = yield (0, utils_1.validateMnemonicDefix)(defixId, mnemonic);
        if (!response)
            return res.status(400).send();
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return res.status(400).send();
        if (!user.secret)
            return res.status(400).send({ respuesta: "secret" });
        const auth = otplib_1.authenticator.check(code.toString(), user.secret);
        if (!auth)
            return res.status(400).send({ respuesta: "code" });
        yield user_entity_1.User.update({ defix_id: user.defix_id }, { dosfa: true })
            .then(() => {
            return res.send({ respuesta: "ok" });
        })
            .catch(() => {
            return res.status(500).json({ respuesta: "error en la base de datos" });
        });
    }
    catch (error) {
        return res.status(500).send();
    }
});
exports.activar2fa = activar2fa;
const desactivar2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId, code } = req.body;
    if (!defixId || !code)
        return res.status(400).send();
    yield validarCode2fa(code, defixId).then((result) => __awaiter(void 0, void 0, void 0, function* () {
        switch (result) {
            case true:
                {
                    // const conexion = await dbConnect();
                    // const resultados = await conexion.query("select dosfa, secret from users where defix_id = $1", [defixId]);
                    const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
                    if (!user)
                        return res.status(400).send();
                    if (user.dosfa) {
                        yield user_entity_1.User.update({ defix_id: user.defix_id }, { dosfa: false, secret: undefined })
                            .then(() => {
                            res.json({ respuesta: "ok" });
                        })
                            .catch(() => {
                            res
                                .status(500)
                                .json({ respuesta: "error en la base de datos" });
                        });
                    }
                    else {
                        res.json({ respuesta: "ok" });
                    }
                }
                break;
            case false:
                {
                    res.status(400).json({ respuesta: "code" });
                }
                break;
            default:
                res.status(500).json({ respuesta: "error inesperado" });
                break;
        }
    }));
});
exports.desactivar2fa = desactivar2fa;
const status2fa = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { defixId } = req.body;
    yield status2faFn(defixId)
        .then((result) => {
        res.send(result);
    })
        .catch((err) => {
        res.status(404).send({ error: err });
    });
});
exports.status2fa = status2fa;
// UTILS
function validarCode2fa(code, defixId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        const auth = otplib_1.authenticator.check(String(code), user.secret);
        return auth;
    });
}
exports.validarCode2fa = validarCode2fa;
function status2faFn(defixId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield user_entity_1.User.findOneBy({ defix_id: defixId });
        if (!user)
            return false;
        return user.dosfa;
    });
}
exports.status2faFn = status2faFn;
