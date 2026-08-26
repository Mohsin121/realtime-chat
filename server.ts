import "dotenv/config";

import { createServer } from "node:http";
import next from "next";
import { initializeSocket } from "@/server/socket";


const dev = process.env.NODE_ENV !== "production";

const hostname = "localhost";
const port = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = next({
    dev,
    hostname,
    port,
  });

  const handle = app.getRequestHandler();

  await app.prepare();

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  // Initialize Socket.IO on the SAME HTTP server
  initializeSocket(httpServer);

  httpServer.listen(port, () => {
    console.log(
      `> Next.js + Socket.IO running at http://${hostname}:${port}`
    );
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});