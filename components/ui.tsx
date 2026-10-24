export const btn = "inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-slate-300";
export const btn2 = "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-500 hover:text-teal-700 disabled:opacity-50";
export const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200";
export const card = "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
const TONE: Record<string, string> = {
  new: "bg-slate-100 text-slate-600", qualified: "bg-amber-100 text-amber-800", rejected: "bg-slate-100 text-slate-500", approved: "bg-teal-100 text-teal-800",
  contacted: "bg-sky-100 text-sky-800", replied: "bg-violet-100 text-violet-800", meeting: "bg-emerald-100 text-emerald-800", unsubscribed: "bg-red-100 text-red-700",
  sent: "bg-sky-100 text-sky-800", draft: "bg-slate-100 text-slate-600", failed: "bg-red-100 text-red-700", booked: "bg-emerald-100 text-emerald-800",
};
export const Badge = ({ s }: { s: string }) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE[s] || TONE.new}`}>{s}</span>;
export const Score = ({ n }: { n: number | null }) => n == null ? <span className="text-slate-400">–</span> : <span className={`font-bold ${n < 50 ? "text-red-600" : n < 70 ? "text-amber-600" : "text-emerald-600"}`}>{n}</span>;
export const when = (d: string) => new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
