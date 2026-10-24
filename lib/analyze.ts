import { safeFetch } from "./security";

export type Analysis = { score: number; issues: string[]; email: string | null };
const SOCIAL = /(facebook|instagram|linktr\.ee|wa\.me|tiktok|youtube)\./i;

export async function analyzeSite(website: string | null): Promise<Analysis> {
  if (!website) return { score: 0, issues: ["No website found for this business"], email: null };
  if (SOCIAL.test(website)) return { score: 15, issues: ["The only online presence is a social media page, not a real website"], email: null };
  try {
    const { html, url, ms, bytes } = await safeFetch(website);
    const issues: string[] = []; let score = 100;
    const bad = (pts: number, msg: string) => { score -= pts; issues.push(msg); };
    if (!url.startsWith("https:")) bad(20, "Website is not secure (no HTTPS)");
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || "";
    if (title.length < 10) bad(10, "Missing or very short page title (hurts Google ranking)");
    if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(html)) bad(10, "No meta description (weak search results snippet)");
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) bad(15, "Not mobile friendly (no viewport setting)");
    if (!/<h1[\s>]/i.test(html)) bad(5, "No main heading (H1) on the home page");
    const imgs = html.match(/<img\b[^>]*>/gi) || [];
    if (imgs.filter(i => !/\balt=/i.test(i)).length > 3) bad(5, "Several images have no alt text");
    if (ms > 3000) bad(10, `Slow to load (${(ms / 1000).toFixed(1)}s to fetch the page)`);
    if (bytes > 1_000_000) bad(5, "Very heavy home page (over 1 MB of HTML)");
    if (!/tel:|mailto:|<form\b/i.test(html)) bad(10, "No clear way to contact or book online");
    if (!/application\/ld\+json/i.test(html)) { score -= 5; issues.push("No local business schema markup"); }
    const emails = (html.match(/[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}/gi) || []).filter(e => !/\.(png|jpe?g|gif|svg|webp)$/i.test(e));
    return { score: Math.max(0, score), issues, email: emails[0]?.toLowerCase() || null };
  } catch {
    return { score: 20, issues: ["Website could not be reached or loads incorrectly"], email: null };
  }
}
