import { rules } from "../data/rules";
import Incident from "../models/Incident";
import BlockedIP from "../models/BlockedIP";
import { getIo } from "../sockets/socket";
import { blockIP } from "../utils/firewall";

// ⭐ VPN detection (score + provider)
import { computeVpnScore } from "../utils/vpnScore";

// VPN rules flag suspicious-but-often-legitimate traffic: never auto-block on them.
const isVpnRule = (r: any) => /vpn/i.test(r.attack);

// ---------------------------------------------------
// PROCESS A SINGLE LOG
// ---------------------------------------------------
export async function processLog(log: any) {
  const incidents: any[] = [];

  console.log("🔍 Running rule engine on:", log.src_ip);

  // ⭐ Get VPN Score + Provider from detection system
  const { score: vpn_score, provider: vpn_provider } = computeVpnScore(log.src_ip);

  // Plain object of the log plus derived fields, so rules can test vpn_score
  // (previously the score was never on the log, so VPN rules could not fire).
  const fields = {
    ...(typeof log.toObject === "function" ? log.toObject() : log),
    vpn_score,
  };

  const ip = log.src_ip;
  let ipBlocked = !!(await BlockedIP.exists({ ip }));

  for (const r of rules) {
    if (!matchesRule(fields, r)) continue;

    console.log("⚠️ Rule matched:", r.name);

    // ---------------------------------------------------
    // CREATE INCIDENT
    // ---------------------------------------------------
    const incident = await Incident.create({
      log: log._id,

      rule: {
        id: r.id,
        name: r.name,
        field: r.field,
        op: r.op,
        value: r.value,
        severity: r.severity,
        attack: r.attack,
      },

      severity: r.severity,
      attack: r.attack,
      target: "Web Server",
      status: "Open",
      analyst: "",

      // ⭐ VPN fields
      vpn_score,
      vpn_provider,

      isBlocked: ipBlocked,
    });

    // ---------------------------------------------------
    // AUTO-BLOCK LOGIC
    // Only block HIGH + CRITICAL, never on VPN rules
    // ---------------------------------------------------
    const shouldBlock =
      (r.severity === "High" || r.severity === "Critical") && !isVpnRule(r);

    if (shouldBlock && !ipBlocked) {
      try {
        const blockEntry = await BlockedIP.create({
          ip,
          reason: r.name,
          threat_score: log.threat_score ?? 0,
          incident_id: incident._id,
          auto_blocked: true,
        });
        ipBlocked = true;
        await Incident.updateOne({ _id: incident._id }, { isBlocked: true });
        incident.isBlocked = true;

        console.log(`🛑 BLOCKED ${ip} | Reason: ${r.name}`);

        const fw = await blockIP(ip);
        if (fw.ok) console.log("✅ Firewall rule added:", ip);
        else console.warn("⚠️ Firewall not updated:", fw.err);

        getIo().emit("ip_blocked", blockEntry);
      } catch (err: any) {
        // 11000 = duplicate key: another request blocked this IP first.
        if (err?.code === 11000) ipBlocked = true;
        else throw err;
      }
    }

    // Realtime: push to UI with the log attached, so the live feed can show it
    const payload = { ...incident.toObject(), log: fields };
    incidents.push(payload);
    getIo().emit("new_incident", payload);
  }

  console.log("🟢 Incidents created:", incidents.length);
  return incidents;
}

// ---------------------------------------------------
// PROCESS MULTIPLE LOGS
// ---------------------------------------------------
export async function evaluateAll(logs: any[]) {
  const out: any[] = [];
  for (const l of logs) {
    out.push(...(await processLog(l)));
  }
  return out;
}

// ---------------------------------------------------
// RULE CHECKER
// ---------------------------------------------------
export function matchesRule(log: any, rule: any) {
  const value = log[rule.field];

  switch (rule.op) {
    case ">":
      return typeof value === "number" && value > rule.value;
    case "==":
      return value === rule.value;
    case "in":
      return Array.isArray(rule.value) && rule.value.includes(value);
    case "regex":
      return value != null && new RegExp(rule.value, "i").test(String(value));
    default:
      return false;
  }
}
