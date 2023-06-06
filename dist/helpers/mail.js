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
exports.EnviarPhraseCorreo = exports.getEmailFlagFN = exports.EnvioCorreo = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const nodemailer_express_handlebars_1 = __importDefault(require("nodemailer-express-handlebars"));
const user_entity_1 = require("../entities/user.entity");
function EnvioCorreo(from, to, type, data) {
    return __awaiter(this, void 0, void 0, function* () {
        var transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.PASS_MAIL,
            },
        });
        let from_admin = process.env.USER_MAIL;
        // point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path_1.default.resolve("./src/views_email/"),
                defaultLayout: false,
            },
            viewPath: path_1.default.resolve("./src/views_email/"),
        };
        // use a template file with nodemailer
        transporter.use("compile", (0, nodemailer_express_handlebars_1.default)(handlebarOptions));
        switch (type) {
            case "envio":
                {
                    if (from != null) {
                        // Envio al emisor
                        let tipoEnvio = "";
                        switch (data.tipoEnvio) {
                            case "user":
                                tipoEnvio = "al usuario";
                                break;
                            case "wallet":
                                tipoEnvio = "a la siguiente dirección";
                                break;
                        }
                        if (tipoEnvio != "") {
                            const mailOptionsFrom = {
                                from: from_admin,
                                to: from,
                                subject: "Envio de fondos",
                                template: "EnvioFondos",
                                context: {
                                    monto: data.monto,
                                    moneda: data.moneda,
                                    receptor: data.receptor,
                                    emisor: data.emisor,
                                    tipoEnvio: tipoEnvio,
                                },
                            };
                            transporter.sendMail(mailOptionsFrom, function (error, info) {
                                return true;
                            });
                        }
                    }
                    if (to != null) {
                        // Envio al receptor
                        const mailOptionsTo = {
                            from: from_admin,
                            to: to,
                            subject: "Ha recibido fondos",
                            template: "RecepcionFondos",
                            context: {
                                monto: data.monto,
                                moneda: data.moneda,
                                receptor: data.receptor,
                                emisor: data.emisor,
                            },
                        };
                        transporter.sendMail(mailOptionsTo, function (error, info) {
                            return true;
                        });
                    }
                }
                break;
            case "swap":
                {
                    var mailOptions = {
                        from: from_admin,
                        to: from,
                        subject: "Notificacion de swap",
                        template: "swap",
                        context: {
                            user: data.user,
                            montoA: data.montoA,
                            monedaA: data.monedaA,
                            montoB: data.montoB,
                            monedaB: data.monedaB,
                        },
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        return true;
                    });
                }
                break;
        }
    });
}
exports.EnvioCorreo = EnvioCorreo;
function getEmailFlagFN(defixId, tipo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield user_entity_1.User.find({
                where: { defix_id: defixId },
                select: [
                    "defix_id",
                    "id",
                    "email",
                    "flag_send",
                    "flag_receive",
                    "flag_dex",
                    "flag_fiat",
                ],
            });
            if (users.length > 0) {
                if (tipo === "SEND") {
                    if (users[0].flag_send) {
                        return users[0].email;
                    }
                    else {
                        return false;
                    }
                }
                else if (tipo === "RECEIVE") {
                    if (users[0].flag_receive) {
                        return users[0].email;
                    }
                    else {
                        return false;
                    }
                }
            }
            return false;
        }
        catch (error) {
            return false;
        }
    });
}
exports.getEmailFlagFN = getEmailFlagFN;
function EnviarPhraseCorreo(phrase, userdefix, to) {
    return __awaiter(this, void 0, void 0, function* () {
        var transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.USER_MAIL,
                pass: process.env.PASS_MAIL,
            },
        });
        let from = process.env.USER_MAIL;
        // point to the template folder
        const handlebarOptions = {
            viewEngine: {
                partialsDir: path_1.default.resolve("./src/views_email/"),
                defaultLayout: false,
            },
            viewPath: path_1.default.resolve("./src/views_email/"),
        };
        // use a template file with nodemailer
        transporter.use("compile", (0, nodemailer_express_handlebars_1.default)(handlebarOptions));
        const mailOptions = {
            from: from,
            to: to,
            subject: "Phrase secreta para recuperacion de cuenta deFix3",
            template: "phraseEmail",
            context: {
                userdefix: userdefix,
                phrase: phrase,
            },
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("--------------------------------------------");
                console.log(error);
                console.log("--------------------------------------------");
            }
            else {
                console.log("Email sent: " + info.response);
            }
        });
    });
}
exports.EnviarPhraseCorreo = EnviarPhraseCorreo;
