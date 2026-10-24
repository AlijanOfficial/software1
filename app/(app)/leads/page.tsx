"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { browser } from "@/lib/browser";
import { Badge, Score, btn, btn2, card, input } from "@/components/ui";

const FILTERS = ["all", "qualified", "approved", "contacted", "replied", "meeting", "rejected"];
export default function Leads() {
  const [rows, setRows] = useState<any[]>([]), [f, setF] = useState("all"), [q, setQ] = useState(""), [max, setMax] = useState(20), [busy, setBusy] = useState(""), [err, setErr] = useState("");
  const load = useCallback(async () => { const { data } = await browser().from("leads").select("id,name,address,website,score,status,email,phone").order("created_at", { ascending: false }).limit(500); setRows(data || []); }, []);
  useEffect(() => { load(); }, [load]);
  const post = (url: string, body: any) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  async function search(e: React.FormEvent) {
    e.preventDefault(); setErr(""); setBusy("Searching Google…");
    const r = await post("/api/search", { query: q, max }), j = await r.json();
    if (!r.ok) { setErr(j.error || "Search failed"); setBusy(""); return; }
    const ids: string[] = j.ids;
    for (let i = 0; i < ids.length; i += 5) { setBusy(`Reviewing websites ${Math.min(i + 5, ids.length)} / ${ids.length}…`); await post("/api/analyze", { ids: ids.slice(i, i + 5) }); }
    setBusy(""); load();
  }
  async function setStatus(id: string, status: string) { await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); load(); }
  const shown = rows.filter(r => f === "all" || r.status === f);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Leads</h1>
      <form onSubmit={search} className={card + " flex flex-wrap items-end gap-3"}>
        <label className="min-w-[240px] flex-1 text-xs font-semibold uppercase text-slate-500">Search query<input className={input + " mt-1 normal-case"} value={q} onChange={e => setQ(e.target.value)} placeholder="e.g. dental clinics in Hyderabad" required minLength={3} /></label>
        <label className="w-28 text-xs font-semibold uppercase text-slate-500">Max results<input className={input + " mt-1"} type="number" min={1} max={60} value={max} onChange={e => setMax(+e.target.value)} /></label>
        <button className={btn} disabled={!!busy}><Search size={16} />Find leads</button>
      </form>
      {busy && <p className="text-sm font-medium text-teal-700">{busy}</p>}{err && <p className="text-sm font-medium text-red-600">{err}</p>}
      <div className="flex flex-wrap gap-2">{FILTERS.map(x => <button key={x} onClick={() => setF(x)} className={`rounded-full px-3 py-1 text-sm font-medium ${f === x ? "bg-teal-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{x}</button>)}</div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Business", "Website", "Score", "Status", ""].map(h => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {shown.map(r => <tr key={r.id}>
              <td className="px-4 py-3"><div className="font-semibold">{r.name}</div><div className="text-xs text-slate-500">{r.address}</div></td>
              <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{r.website || <span className="text-red-600">No website</span>}</td>
              <td className="px-4 py-3"><Score n={r.score} /></td><td className="px-4 py-3"><Badge s={r.status} /></td>
              <td className="px-4 py-3"><div className="flex justify-end gap-2">
                {r.status === "qualified" && <button className={btn2} onClick={() => setStatus(r.id, "approved")}>Approve</button>}
                {r.status === "qualified" && <button className={btn2} onClick={() => setStatus(r.id, "rejected")}>Reject</button>}
                <Link className={btn2} href={`/leads/${r.id}`}>Open</Link></div></td>
            </tr>)}
            {!shown.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-500">No leads yet. Run a search above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
