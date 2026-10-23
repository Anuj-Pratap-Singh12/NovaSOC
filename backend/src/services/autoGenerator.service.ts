import axios from "axios";
import vpnCidrs from "../data/vpn_list.json";
import { randomIpFromCidr } from "../utils/randomVpnIp";

const ingestUrl = () =>
  `http://localhost:${process.env.PORT || 4000}/api/ingest`;

// --------------------------------------------------
//  Attack Templates
// --------------------------------------------------
const attackSamples = [
  {
    event_type: "xss",
    payload: "<script>alert('XSS')</script>",
    category: "Cross Site Scripting",
    severity: "Medium",
    score: 70,
  },
  {
    event_type: "sql_injection",
    payload: "admin' OR '1'='1' -- DROP TABLE users; --",
    category: "SQL Injection",
    severity: "High",
    score: 92,
  },
  {
    event_type: "bruteforce",
    payload: "Failed login attempt",
    category: "Brute Force",
    severity: "High",
    score: 95,
  },
  {
    event_type: "recon_low",
    payload: "-",
    category: "Reconnaissance",
    severity: "Low",
    score: 15,
  },
  {
    event_type: "port_scan_low",
    payload: "-",
    category: "Port Scan",
    severity: "Low",
    score: 10,
  },
];

// --------------------------------------------------
//  Generate an IP
//  - 30% chance: Real VPN IP (from CIDRs)
//  - 70% chance: Normal random IP
// --------------------------------------------------
function randomIP() {
  // Pick a VPN CIDR and generate an IP inside it
  if (Math.random() < 0.3) {
    const cidr = vpnCidrs[Math.floor(Math.random() * vpnCidrs.length)];
    return randomIpFromCidr(cidr);
  }

  // Generate normal random IP
  return `${r()}.${r()}.${r()}.${r()}`;
  function r() {
    return Math.floor(Math.random() * 255);
  }
}

// --------------------------------------------------
//  Random usernames
// --------------------------------------------------
const usernames = ["John Doe", "Alexander", "Marie", "Nova"];

function randomUsername() {
  return usernames[Math.floor(Math.random() * usernames.length)];
}

// --------------------------------------------------
//  LOG GENERATOR
// --------------------------------------------------
export async function generateRandomLog() {
  const attack = attackSamples[Math.floor(Math.random() * attackSamples.length)];

  // Normalize attack type for UI display
  const normalizedAttackType =
    attack.event_type === "bruteforce"
      ? "Bruteforce"
      : attack.event_type === "sql_injection"
      ? "Malware"
      : attack.event_type === "xss"
      ? "Malware"
      : attack.event_type.includes("port_scan")
      ? "Recon"
      : attack.event_type.includes("recon")
      ? "Recon"
      : "Recon";

  const ip = randomIP();

  const log = {
    timestamp: new Date(),
    src_ip: ip,
    username: randomUsername(),

    payload: attack.payload,
    event_type: attack.event_type,
    category: attack.category,

    severity: attack.severity,
    threat_score: attack.score,

    failed_logins: Math.floor(Math.random() * 10),
    // up to 600 MB so the 500 MB exfiltration rule can actually fire
    bytes_sent: Math.floor(Math.random() * 600_000_000),

    scan_ports: Math.floor(Math.random() * 40),
    connections_per_min: Math.floor(Math.random() * 500),

    // ML-related fields
    ddos_score: Math.random(),
    vpn_prob: Math.random(),
    ml_predicted: null,

    attack_type: normalizedAttackType,
  };

  console.log("🔥 AUTO-LOG GENERATED:", log.event_type, log.src_ip);

  await axios.post(ingestUrl(), log);
}
