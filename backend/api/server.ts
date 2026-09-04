/**
 * MPLAD SENTINEL — Phase 9A Standalone REST API Server
 * Lightweight, native Node.js 24 TypeScript HTTP Server.
 *
 * Exposes canonical SQLite dataset records and Phase 8 explainable anomaly intelligence.
 */

import http from "node:http";
import { handleRequest } from "./router.ts";

export function createServer(): http.Server {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((err) => {
      // Emergency catch-all to guarantee server stability
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An internal server error occurred while processing the request.",
          },
          meta: {
            timestamp: new Date().toISOString(),
          },
        }));
      }
    });
  });
}

export function startServer(port = parseInt(process.env.PORT || "4000", 10)): Promise<http.Server> {
  const server = createServer();

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`=========================================`);
      console.log(`MPLAD SENTINEL — REST API Server`);
      console.log(`Port:              ${port}`);
      console.log(`Endpoint:          http://localhost:${port}/api/health`);
      console.log(`CORS Allowed:      ${process.env.CORS_ORIGIN || "http://localhost:3000, http://localhost:3005"}`);
      console.log(`Responsible AI:    Anomaly signal does not equal fraud.`);
      console.log(`                   Physical verification & human investigation required.`);
      console.log(`=========================================`);
      resolve(server);
    });
  });
}

// Start server if executed directly via Node.js
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("backend/api/server.ts")) {
  startServer();
}
