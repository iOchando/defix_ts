"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const routes_1 = require("./routes");
const postgres_1 = __importDefault(require("./config/postgres"));
const data_source_1 = __importDefault(require("./config/data.source"));
const socket_io_1 = require("socket.io");
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const fs = require("fs");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./docs/swagger"));
const process_1 = require("./process");
const node_cache_1 = __importDefault(require("node-cache"));
const nodeCache = new node_cache_1.default();
const PORT = Number(process.env.POST) || 3000;
const app = (0, express_1.default)();
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v2", routes_1.router);
app.use("/swagger", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
(0, postgres_1.default)().then(() => console.log("Conexion DB Ready"));
data_source_1.default.initialize().then(() => console.log("Conexion ORM Ready"));
let server;
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
    const privateKey = fs.readFileSync("/etc/letsencrypt/live/defix3.com/privkey.pem", "utf8");
    const certificate = fs.readFileSync("/etc/letsencrypt/live/defix3.com/cert.pem", "utf8");
    const ca = fs.readFileSync("/etc/letsencrypt/live/defix3.com/chain.pem", "utf8");
    const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca,
    };
    server = https.createServer(credentials, app);
    console.log("htpps");
}
else {
    server = http.createServer(app);
    console.log("htpp");
}
server.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`));
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
    },
});
(0, process_1.startProcess)(io, nodeCache);
io.on("connection", (socket) => {
    console.log("User APP " + socket.id + " connected");
    if (nodeCache.has("getRanking")) {
        const data = nodeCache.get("getRanking");
        io.emit("getRanking", data);
    }
});
