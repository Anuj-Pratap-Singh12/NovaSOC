import { execFile } from "child_process";
import ipaddr from "ipaddr.js";

type FirewallResult = { ok: boolean; err?: string };

// Only real IP addresses ever reach the OS firewall.
export function isValidIp(ip: unknown): ip is string {
  return typeof ip === "string" && ipaddr.isValid(ip);
}

// execFile passes arguments directly to netsh with no shell in between,
// so an attacker-controlled string can never be run as a command.
function runNetsh(args: string[]): Promise<FirewallResult> {
  return new Promise((resolve) => {
    execFile("netsh", args, (err) => {
      if (err) return resolve({ ok: false, err: err.message });
      resolve({ ok: true });
    });
  });
}

function unsupported(): FirewallResult {
  return {
    ok: false,
    err: `OS firewall integration only supports Windows (running on ${process.platform}); IP recorded in blocklist only`,
  };
}

// ---------------------------
// BLOCK IP
// ---------------------------
export async function blockIP(ip: string): Promise<FirewallResult> {
  if (!isValidIp(ip)) return { ok: false, err: `Invalid IP: ${ip}` };
  if (process.platform !== "win32") return unsupported();

  console.log("🔥 Adding firewall block for", ip);
  return runNetsh([
    "advfirewall", "firewall", "add", "rule",
    `name=NovaSOC_Block_${ip}`, "dir=in", "action=block", `remoteip=${ip}`,
  ]);
}

// ---------------------------
// UNBLOCK IP
// ---------------------------
export async function unblockIP(ip: string): Promise<FirewallResult> {
  if (!isValidIp(ip)) return { ok: false, err: `Invalid IP: ${ip}` };
  if (process.platform !== "win32") return unsupported();

  console.log("🧹 Removing firewall block for", ip);
  return runNetsh([
    "advfirewall", "firewall", "delete", "rule", `name=NovaSOC_Block_${ip}`,
  ]);
}
