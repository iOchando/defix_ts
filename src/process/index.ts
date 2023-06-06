import { fork } from "child_process";
import { readdirSync } from "fs";
import { Server, Socket, ServerOptions } from "socket.io";
import serialize from "serialize-javascript";
import * as http from "http";
import NodeCache from "node-cache";

const PATH_ROUTER = `${__dirname}`;

const cleanFileName = (fileName: string) => {
  let file;
  if (fileName.includes(".ts")) {
    file = fileName.split(".ts").shift();
  } else {
    file = fileName.split(".js").shift();
  }
  return file;
};

const Process = (routeDemon: string, io: Server, nodeCache: NodeCache) => {
  console.log("Starting demon...");
  const demon = fork(routeDemon);

  demon.on("message", (message) => {
    io.emit("getRanking", message);

    nodeCache.set("getRanking", message);
  });

  demon.on("exit", () => {
    console.log("Demon died. Restarting demon " + routeDemon);
    Process(routeDemon, io, nodeCache);
  });
};

const startProcess = (io: Server, nodeCache: NodeCache) => {
  readdirSync(PATH_ROUTER).filter((fileName) => {
    const cleanName = cleanFileName(fileName);
    if (cleanName !== "index") {
      Process(PATH_ROUTER + "/" + cleanName, io, nodeCache);
    }
  });
};

export { startProcess };
