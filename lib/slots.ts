/** Meeting slots: next 7 days, Mon-Fri, 10:00-16:00 Pakistan time (UTC+5). Change here to suit you. */
export function allSlots(): string[] {
  const out: string[] = [], n = new Date();
  for (let d = 1; d <= 7; d++) {
    const t = Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + d);
    const wd = new Date(t + 5 * 3600e3).getUTCDay();
    if (wd === 0 || wd === 6) continue;
    for (let h = 10; h <= 16; h++) out.push(new Date(t + (h - 5) * 3600e3).toISOString());
  }
  return out;
}
export const fmt = (iso: string) => new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Karachi", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
