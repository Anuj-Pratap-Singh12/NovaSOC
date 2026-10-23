import { ipInCidr } from "./cidrCheck";
import vpnCidrsRaw from "../data/vpn_list.json";

// vpn_list.json is a simple array of strings → CIDR ranges
const vpnCidrs: string[] = vpnCidrsRaw as any;

// Cache for fast repeated lookups
const vpnCache = new Map<string, boolean>();
const MAX_CACHE = 50_000;

/**
 * Returns TRUE if an IP belongs to any VPN CIDR
 */
export function isVPNCached(ip: string): boolean {
  // 1️⃣ Return cached result
  if (vpnCache.has(ip)) {
    return vpnCache.get(ip)!;
  }

  // 2️⃣ Scan CIDR ranges
  const isVpn = vpnCidrs.some(cidr => ipInCidr(ip, cidr));

  // 3️⃣ Cache for O(1) future lookups (bounded so memory can't grow forever)
  if (vpnCache.size >= MAX_CACHE) {
    vpnCache.delete(vpnCache.keys().next().value); // evict oldest entry
  }
  vpnCache.set(ip, isVpn);
  return isVpn;
}

/**
 * Provider detection disabled → industry standard for simple VPN flag
 */
export function detectVpnProvider(ip: string): string | null {
  return null;
}
