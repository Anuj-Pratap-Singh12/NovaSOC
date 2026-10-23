import { Router } from "express";
import Log from "../models/Log";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).lean();
    
    // Map database fields to frontend-friendly names
    const mappedLogs = logs.map((log: any) => ({
      _id: log._id,
      timestamp: log.timestamp,
      source: log.event_type || "System",
      category: log.category || "Unknown",
      sourceIP: log.src_ip,
      target: "Server",
      message: log.payload || `${log.event_type} attack detected`,
      action: log.severity === "High" ? "Blocked" : "Logged",
      severity: log.severity || "Low",
      // Keep original fields too
      ...log
    }));
    
    return res.json({ logs: mappedLogs });
  } catch (err: any) {
    console.error("GET /api/logs ERROR:", err);
    return res.status(500).json({ error: "Failed to fetch logs" });
  }
});

export default router;
