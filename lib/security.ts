import dns from "node:dns/promises";
import net from "node:net";
import crypto from "node:crypto";

/** True for private, loopback, link-local, metadata and other non-public addresses (blocks SSRF). */
export function isPrivateIp(ip: string): boolean {
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (net.isIPv6(ip)) { const l = ip.toLowerCase(); return l === "::1" || l === "::" || l.startsWith("fc") || l.startsWith("fd") || l.startsWith("fe80"); }
  const [a, b] = ip.split(".").map(Number);
  return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || (a === 198 && (b === 18 || b === 19)) || a >= 224;
}
export async function assertPublicUrl(raw: string): Promise<URL> {
  const u = new URL(raw);
  if (!/^https?:$/.test(u.protocol) || u.username || u.password) throw new Error("blocked");
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new Error("blocked");
  const ips = net.isIP(host) ? [host] : (await dns.lookup(host, { all: true })).map(r => r.address);
  if (!ips.length || ips.some(isPrivateIp)) throw new Error("blocked");
  return u;
}
/** Fetch a public web page safely: re-checks every redirect, 8s timeout, 1.5 MB cap. */
export async function safeFetch(raw: string, hops = 3): Promise<{ html: string; url: string; ms: number; bytes: number }> {
  let url = (await assertPublicUrl(raw)).toString();
  const t0 = Date.now();
  for (let i = 0; i <= hops; i++) {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8000), headers: { "User-Agent": "LeadPilotBot/1.0 (website review)", Accept: "text/html" } });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) { url = (await assertPublicUrl(new URL(res.headers.get("location")!, url).toString())).toString(); continue; }
    if (!res.ok || !(res.headers.get("content-type") || "").includes("text/html")) throw new Error("not html");
    const reader = res.body!.getReader(); const chunks: Uint8Array[] = []; let bytes = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; bytes += value.length; chunks.push(value); if (bytes > 1_500_000) { await reader.cancel(); break; } }
    return { html: Buffer.concat(chunks).toString("utf8"), url, ms: Date.now() - t0, bytes };
  }
  throw new Error("too many redirects");
}
const sign = (s: string) => crypto.createHmac("sha256", process.env.LINK_SECRET!).update(s).digest("base64url");
export const unsubToken = (uid: string, email: string) => sign(`unsub:${uid}:${email.toLowerCase()}`);
export const okToken = (uid: string, email: string, t: string) => { const a = Buffer.from(unsubToken(uid, email)), b = Buffer.from(t); return a.length === b.length && crypto.timingSafeEqual(a, b); };
export const newToken = () => crypto.randomBytes(24).toString("hex");
