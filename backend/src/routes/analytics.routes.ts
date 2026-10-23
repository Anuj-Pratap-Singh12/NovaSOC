import { Router } from "express";
import Log from "../models/Log";
import Incident from "../models/Incident";
import BlockedIP from "../models/BlockedIP";

const router = Router();

/* 1️⃣ SUMMARY */
router.get("/summary", async (req, res) => {
  try {
    const active = await Log.countDocuments();
    const open = await Incident.countDocuments({ status: "Open" });
    const blocked = await BlockedIP.countDocuments(); // ⭐ NEW
    const resolved = await Incident.countDocuments({ status: "Resolved" }); // OPTIONAL

    return res.json({
      stats: { active, open, blocked, resolved }
    });
  } catch (e) {
    res.status(500).json({ error: "Summary fetch failed" });
  }
});



router.get("/trend-multi", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: 1 }).lean();

    if (!logs.length) return res.json({ data: [] });

    const grouped: any = {};

    logs.forEach((log) => {
      const ts = log.timestamp || log.createdAt;
      const time = new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const type = log.attack_type || "Recon"; // fallback

      if (!grouped[time]) {
        grouped[time] = { time, Bruteforce: 0, Malware: 0, Recon: 0 };
      }

      if (type === "Bruteforce") grouped[time].Bruteforce++;
      else if (type === "Malware") grouped[time].Malware++;
      else grouped[time].Recon++;
    });

    return res.json({ data: Object.values(grouped) });

  } catch (err) {
    console.error("Trend Multi Error:", err);
    return res.status(500).json({ error: "Trend multi error" });
  }
});





/* 2️⃣ TIME SERIES — total logs per minute (last 20 minutes that had activity) */
router.get("/time-series", async (req, res) => {
  try {
    const rows = await Log.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%dT%H:%M:00Z", date: { $ifNull: ["$timestamp", "$createdAt"] } } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 20 },
      { $sort: { _id: 1 } },
    ]);

    const data = rows.map((r) => ({
      time: new Date(r._id).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      value: r.value,
    }));

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: "Timeseries error" });
  }
});

/* 3️⃣ SEVERITY Donut */
router.get("/severity", async (req, res) => {
  try {
    const sev = await Incident.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } }
    ]);

    return res.json({
      data: sev.map((s) => ({
        name: s._id,
        value: s.count
      }))
    });
  } catch (e) {
    res.status(500).json({ error: "Severity fetch failed" });
  }
});

/* 4️⃣ CATEGORIES Radar */
router.get("/categories", async (req, res) => {
  try {
    const categories = await Incident.aggregate([
      { $group: { _id: "$rule.name", count: { $sum: 1 } } }
    ]);

    const data = categories.map((c) => ({
      category: c._id,
      value: c.count
    }));

    res.json({ data });
  } catch (e) {
    res.status(500).json({ error: "Categories error" });
  }
});

router.get("/top-ips", async (req, res) => {
  try {
    const attackers = await Log.aggregate([
      { $group: { _id: "$src_ip", attempts: { $sum: 1 } } },
      { $sort: { attempts: -1 } },
      { $limit: 10 }
    ]);

    const data = attackers.map(a => ({
      ip: a._id,
      attempts: a.attempts,
      region: "Unknown"
    }));

    res.json({ data });
  } catch (err) {
    console.error("TOP IP Error:", err);
    res.status(500).json({ error: "Top IP fetch failed" });
  }
});



/* 6️⃣ HIGH RISK IPs */
router.get("/high-risk", async (req, res) => {
  try {
    const risky = await Log.find({ threat_score: { $gte: 80 } })
      .sort({ threat_score: -1 })
      .limit(10);

    res.json({
      data: risky.map((r) => ({
        ip: r.src_ip,
        score: r.threat_score,
        time: r.timestamp
      }))
    });
  } catch (e) {
    res.status(500).json({ error: "High-risk error" });
  }
});

export default router;
