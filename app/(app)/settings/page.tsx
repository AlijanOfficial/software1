"use client";
import { useEffect, useState } from "react";
import { browser } from "@/lib/browser";
import { btn, card, input } from "@/components/ui";

const FIELDS = [["business_name", "Your business name"], ["sender_name", "Your name (shown as sender)"], ["reply_to", "Reply-to email"], ["postal_address", "Postal address (required in every outreach email by anti-spam laws)"], ["offer", "What you offer (the AI uses this to write emails)"]] as const;
export default function Settings() {
  const [v, setV] = useState<Record<string, string>>({ business_name: "", sender_name: "", reply_to: "", postal_address: "", offer: "" }), [msg, setMsg] = useState("");
  useEffect(() => { browser().from("settings").select("*").maybeSingle().then(({ data }) => { if (data) setV(x => ({ ...x, ...data })); }); }, []);
  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const { business_name, sender_name, reply_to, postal_address, offer } = v;
    const r = await fetch("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_name, sender_name, reply_to, postal_address, offer }) });
    setMsg(r.ok ? "Saved." : "Could not save. Check the fields.");
  }
  return (
    <div className="max-w-2xl space-y-5"><h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={save} className={card + " space-y-4"}>
        {FIELDS.map(([k, l]) => <label key={k} className="block text-xs font-semibold uppercase text-slate-500">{l}{k === "offer" ? <textarea className={input + " mt-1 normal-case"} rows={3} value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} /> : <input className={input + " mt-1 normal-case"} value={v[k]} onChange={e => setV({ ...v, [k]: e.target.value })} />}</label>)}
        <button className={btn}>Save settings</button>{msg && <span className="ml-3 text-sm font-medium text-teal-700">{msg}</span>}
      </form>
    </div>
  );
}
