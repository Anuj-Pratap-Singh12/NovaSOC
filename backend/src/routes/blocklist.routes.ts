import { Router } from "express";
import BlockedIP from "../models/BlockedIP";
import { unblockIP, isValidIp } from "../utils/firewall";
import { getIo } from "../sockets/socket";

const router = Router();

// GET ALL BLOCKED IPs
router.get("/", async (req, res) => {
  try {
    const list = await BlockedIP.find().sort({ createdAt: -1 });
    res.json({ blocked: list });
  } catch (err: any) {
    res.status(500).json({ error: "Blocklist fetch failed" });
  }
});

// UNBLOCK an IP
router.post("/unblock/:ip", async (req, res) => {
  const ip = req.params.ip;
  if (!isValidIp(ip)) {
    return res.status(400).json({ success: false, msg: "Invalid IP address" });
  }

  try {
    const removed = await BlockedIP.findOneAndDelete({ ip });
    if (!removed) return res.json({ success: false, msg: "IP not in blocklist" });

    const fw = await unblockIP(ip);
    getIo().emit("ip_unblocked", { ip });

    res.json({ success: true, firewall: fw });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
