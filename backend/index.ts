// backend/index.ts — the single entry point for the NovaSOC API.
// (Previously the project had two entry points, index.ts and src/server.ts,
//  each missing half of the routes. They are merged here.)
import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";

import connectDB from "./config/db";
import { initSocket } from "./src/sockets/socket";
import { generateRandomLog } from "./src/services/autoGenerator.service";

import authRoutes from "./Routes/authRoutes";
import analystRoutes from "./Routes/analystRoutes";
import ingestRoutes from "./src/routes/ingest.routes";
import logsRoutes from "./src/routes/logs.routes";
import incidentsRoutes from "./src/routes/incidents.routes";
import analyticsRoutes from "./src/routes/analytics.routes";
import blocklistRoutes from "./src/routes/blocklist.routes";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/", (_req, res) => {
  res.send("NovaSOC backend running");
});

app.use("/api/auth", authRoutes); // POST /login
app.use("/api/analysts", analystRoutes); // GET/POST/DELETE analysts (JWT)
app.use("/api/ingest", ingestRoutes); // POST a log → rule engine
app.use("/api/logs", logsRoutes); // GET logs
app.use("/api/incidents", incidentsRoutes); // GET/PATCH incidents
app.use("/api/analytics", analyticsRoutes); // dashboard metrics
app.use("/api/blocklist", blocklistRoutes); // blocked IPs + unblock

// Socket.IO must share the raw HTTP server to handle the WebSocket upgrade.
const server = http.createServer(app);
initSocket(server);

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  await connectDB(); // exits the process if MongoDB is unreachable
  server.listen(PORT, () => {
    console.log(`🚀 NovaSOC backend listening on port ${PORT}`);
  });

  // Synthetic attack generator. Set AUTO_LOG_INTERVAL=0 to turn it off.
  const interval = Number(process.env.AUTO_LOG_INTERVAL ?? 600000);
  if (interval > 0) {
    setInterval(() => {
      generateRandomLog().catch((err) =>
        console.warn("⚠️ Auto-generator failed:", err.message)
      );
    }, interval);
    console.log(`🧪 Auto log generator: one log every ${interval} ms`);
  }
}

start();
