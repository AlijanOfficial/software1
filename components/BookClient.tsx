"use client";
import { useState } from "react";
import { btn } from "./ui";

export default function BookClient({ token, slots }: { token: string; slots: { iso: string; label: string }[] }) {
  const [pick, setPick] = useState(""), [msg, setMsg] = useState(""), [done, setDone] = useState(false), [busy, setBusy] = useState(false);
  async function book() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/book", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, slot: pick }) });
    const j = await r.json().catch(() => ({})); setBusy(false);
    if (r.ok) setDone(true); else setMsg(j.error || "Could not book. Please try again.");
  }
  if (done) return <div className="rounded-2xl bg-teal-50 p-8 text-center"><div className="text-4xl">✓</div><h2 className="mt-2 text-xl font-bold text-teal-800">You are booked</h2><p className="text-slate-600">We will see you then. You can close this page.</p></div>;
  return (
    <div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{slots.map(s => <button key={s.iso} onClick={() => setPick(s.iso)} className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${pick === s.iso ? "border-teal-600 bg-teal-600 text-white shadow" : "border-slate-200 bg-white hover:border-teal-500"}`}>{s.label}</button>)}</div>
      {msg && <p className="mt-3 text-sm font-medium text-red-600">{msg}</p>}
      <button className={btn + " mt-5 w-full !py-3"} disabled={!pick || busy} onClick={book}>{busy ? "Booking…" : "Confirm this time"}</button>
    </div>
  );
}
