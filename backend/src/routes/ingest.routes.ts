import { Router } from "express";
import Log from "../models/Log";
import { processLog } from "../services/ruleEngine.service";
import { isValidIp } from "../utils/firewall";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const log = req.body;

    if (!log || typeof log !== "object" || Array.isArray(log)) {
      return res.status(400).json({ success: false, error: "Body must be a JSON object" });
    }
    // src_ip feeds the blocklist and the OS firewall, so it must be a real IP.
    if (!isValidIp(log.src_ip)) {
      return res.status(400).json({ success: false, error: "src_ip must be a valid IPv4 or IPv6 address" });
    }

    console.log("🔥 LOG RECEIVED from", log.src_ip);

    // 1️⃣ Save log to MongoDB
    const savedLog = await Log.create(log);

    // 2️⃣ Run rule engine on log
    const incidents = await processLog(savedLog);

    return res.json({
      success: true,
      message: "Log ingested and processed",
      log: savedLog,
      incidentsCreated: incidents.length,
      incidents,
    });
  } catch (err: any) {
    console.error("❌ Error in /api/ingest:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
