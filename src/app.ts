import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { router } from "./routes";
import dbConnect from "./config/postgres";
import AppDataSource from "./config/data.source";
import { Server, Socket } from "socket.io";
import * as http from "http";
import * as https from "https";
const fs = require("fs");
import swaggerUi, { serve } from "swagger-ui-express";
import swaggerSetup from "./docs/swagger";

import { startProcess } from "./process";
import NodeCache from "node-cache";
const nodeCache = new NodeCache();

const PORT = Number(process.env.POST) || 3000;
const app = express();

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

app.use("/api/v2", router);
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSetup));

dbConnect().then(() => console.log("Conexion DB Ready"));

AppDataSource.initialize().then(() => console.log("Conexion ORM Ready"));

let server;
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/defix3.com/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/defix3.com/cert.pem",
    "utf8"
  );
  const ca = fs.readFileSync(
    "/etc/letsencrypt/live/defix3.com/chain.pem",
    "utf8"
  );

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
  };
  server = https.createServer(credentials, app);
  console.log("htpps");
} else {
  server = http.createServer(app);
  console.log("htpp");
}

server.listen(PORT, () => console.log(`Listo por el puerto ${PORT}`));

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

startProcess(io, nodeCache);

io.on("connection", (socket: Socket) => {
  console.log("User APP " + socket.id + " connected");

  if (nodeCache.has("getRanking")) {
    const data = nodeCache.get("getRanking");
    io.emit("getRanking", data);
  }
});
