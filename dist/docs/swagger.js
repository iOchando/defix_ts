"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const PATH_ROUTER = `${__dirname}`;
const cleanFileName = (fileName) => {
    let file;
    if (fileName.includes(".ts")) {
        file = fileName.split(".ts").shift();
    }
    else {
        file = fileName.split(".js").shift();
    }
    return file;
};
const cleanName = cleanFileName(__filename);
const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "Defix3 - Api V2",
        description: "End Points for Defix3 API V2",
        contact: {
            email: "juanochando00@gmail.com",
        },
        version: "2.0.0",
    },
    servers: [
        {
            url: "https://defix3.com:3072/api/v2/",
        },
        {
            url: "http://localhost:3080/api/v2/",
        },
    ],
    tags: [
        {
            name: "Wallet",
            description: "EndPoints asociados a la creacion y funciones basicas de las wallets.",
        },
        {
            name: "User",
            description: "EndPoints asociados a la configuracion del perfil de los usuarios.",
        },
        {
            name: "Subscribe",
            description: "EndPoint para guardar correo de usuario que quiera recibir notificaciones de Defix3",
        },
        {
            name: "Balance",
            description: "EndPoints asociados al balance y Cryptomonedas",
        },
        {
            name: "2FA",
            description: "EndPoints asociados al 2FA.",
        },
        {
            name: "Transaction",
            description: "EndPoints asociados a las transacciones.",
        },
        {
            name: "Swap",
            description: "EndPoints asociados a al Swap. Solo ETH y BSC",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
            },
        },
    },
};
const swaggerOptions = {
    swaggerDefinition,
    apis: [path_1.default.join(__dirname, "../routes/*")],
};
exports.default = (0, swagger_jsdoc_1.default)(swaggerOptions);
