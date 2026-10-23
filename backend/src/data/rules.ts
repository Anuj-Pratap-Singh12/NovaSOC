import vpnList from "./vpn_list.json";   // ⭐ REAL VPN IP LIST

export const rules = [
  {
    id: 1,
    name: "Multiple Failed Logins",
    field: "failed_logins",
    op: ">",
    value: 5,
    severity: "High",
    attack: "Brute Force",
  },

  {
    id: 2,
    name: "SQL Injection Pattern",
    field: "payload",
    op: "regex",
    value: "(\\bSELECT\\b|\\bUNION\\b|--)",
    severity: "High",
    attack: "SQL Injection",
  },

  {
    id: 3,
    name: "XSS Attempt",
    field: "payload",
    op: "regex",
    value: "(<script|onerror=|<img)",
    severity: "Medium",
    attack: "XSS",
  },

  {
    id: 4,
    name: "Port Scan Behavior",
    field: "scan_ports",
    op: ">",
    value: 10,
    severity: "Medium",
    attack: "Port Scan",
  },

  {
    id: 5,
    name: "Large Data Transfer",
    field: "bytes_sent",
    op: ">",
    value: 500000000, // 500 MB+
    severity: "High",
    attack: "Data Exfiltration",
  },

  // ⭐ REAL VPN DETECTION RULE ⭐
  {
  id: 6,
  name: "VPN Detected (CIDR Match)",
  field: "vpn_score",
  op: ">",
  value: 79, // listed VPN ranges score 80–99 (was 99, which could never match)
  severity: "Medium",
  attack: "VPN Activity"
},
  {
    id: 7,
    name: "Privilege Escalation Event",
    field: "event_type",
    op: "==",
    value: "privilege_escalation",
    severity: "High",
    attack: "Privilege Escalation",
  },

  {
    id: 8,
    name: "Threat Score High",
    field: "threat_score",
    op: ">",
    value: 80,
    severity: "High",
    attack: "General Threat",
  },

  {
    id: 9,
    name: "Low Severity Activity",
    field: "severity",
    op: "==",
    value: "Low",
    severity: "Low",
    attack: "Low Risk Activity",
  },

  // ⭐ DDoS Detection
  {
    id: 10,
    name: "Possible DDoS Activity",
    field: "connections_per_min",
    op: ">",
    value: 200,
    severity: "High",
    attack: "DDoS",
  },
  {
  id: 11,
  name: "ML Detected VPN",
  field: "vpn_score",
  op: ">",
  value: 70,
  severity: "Low",
  attack: "ML VPN Suspicion"
},

  {
  id: 12,
  name: "High VPN Likelihood",
  field: "vpn_score",
  op: ">",
  value: 85,        // Only consider >85% risky
  severity: "Medium",
  attack: "VPN Likely"
}

];
