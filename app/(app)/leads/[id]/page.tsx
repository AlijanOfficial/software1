"use client";
import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Mail, Send, Sparkles } from "lucide-react";
import { browser } from "@/lib/browser";
import { Badge, Score, btn, btn2, card, input, when } from "@/components/ui";

export default function Lead({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lead, setLead] = useState<any>(null), [emails, setEmails] = useState<any[]>([]), [replies, setReplies] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null), [reply, setReply] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(""), [link, setLink] = useState("");
  const load = useCallback(async () => {
    const sb = browser();
    const [l, e, r] = await Promise.all([sb.from("leads").select("*").eq("id", id).single(), sb.from("emails").select("*").eq("lead_id", id).order("created_at", { ascending: false }), sb.from("replies").select("*").eq("lead_id", id).order("created_at", { ascending: false })]);
    setLead(l.data); setEmails(e.data || []); setReplies(r.data || []);
    setDraft((d: any) => d || (e.data || []).find((x: any) => x.status === "draft") || null);
  }, [id]);
  useEffect(() => { load(); }, [load]);
  async function call(label: string, url: string, method: string, body?: any) {
    setBusy(label); setMsg("");
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({})); setBusy("");
    if (!r.ok) { setMsg(j.error || "Failed"); return null; }
    return j;
  }
  if (!lead) return <p className="text-slate-500">Loading…</p>;
  const issues: string[] = lead.issues || [];
  return (
    <div className="space-y-5">
      <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-teal-700"><ArrowLeft size={14} />All leads</Link>
      <div className={card + " flex flex-wrap items-start justify-between gap-4"}>
        <div><h1 className="text-2xl font-bold">{lead.name}</h1><p className="text-sm text-slate-500">{lead.address}</p><p className="mt-1 text-sm">{lead.phone} {lead.email && <>· {lead.email}</>}</p><p className="text-sm text-slate-500">{lead.website || "No website"}</p></div>
        <div className="text-right"><Badge s={lead.status} /><div className="mt-2 text-xs text-slate-500">Website score</div><div className="text-3xl"><Score n={lead.score} /></div></div>
      </div>
      <div className={card}><h2 className="mb-2 font-bold">Website review</h2>{issues.length ? <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{issues.map(i => <li key={i}>{i}</li>)}</ul> : <p className="text-sm text-slate-500">No issues recorded.</p>}</div>
      {msg && <p className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{msg}</p>}
      <div className={card + " space-y-3"}>
        <h2 className="font-bold">Outreach</h2>
        <div className="flex flex-wrap gap-2">
          {["qualified", "rejected"].includes(lead.status) && <button className={btn} onClick={async () => { if (await call("a", `/api/leads/${id}`, "PATCH", { status: "approved" })) load(); }}>Approve for outreach</button>}
          {lead.status === "approved" && <button className={btn2} disabled={!!busy} onClick={async () => { const j = await call("d", `/api/leads/${id}/draft`, "POST"); if (j) { setDraft(j.email); load(); } }}><Sparkles size={16} />{busy === "d" ? "Writing…" : "Write email with AI"}</button>}
          <button className={btn2} onClick={async () => { const j = await call("b", `/api/leads/${id}/booking`, "POST"); if (j) setLink(j.url); }}><CalendarPlus size={16} />Create booking link</button>
        </div>
        {link && <div className="rounded-lg bg-teal-50 p-3 text-sm"><b>Booking link:</b> <span className="break-all">{link}</span> <button className="ml-2 underline" onClick={() => navigator.clipboard.writeText(link)}>Copy</button></div>}
        {draft && draft.status === "draft" && lead.status === "approved" && <div className="space-y-2 rounded-xl border border-slate-200 p-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Review and edit before sending to {lead.email || "(no email found)"}</p>
          <input className={input} value={draft.subject} onChange={e => setDraft({ ...draft, subject: e.target.value })} />
          <textarea className={input} rows={8} value={draft.body} onChange={e => setDraft({ ...draft, body: e.target.value })} />
          <button className={btn} disabled={!!busy || !lead.email} onClick={async () => { if (!confirm(`Send this email to ${lead.email}?`)) return; if (await call("s", `/api/leads/${id}/send`, "POST", { emailId: draft.id, subject: draft.subject, body: draft.body })) { setDraft(null); load(); } }}><Send size={16} />{busy === "s" ? "Sending…" : "Send email"}</button>
          <p className="text-xs text-slate-500">An unsubscribe link and your postal address are added automatically.</p>
        </div>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className={card}><h2 className="mb-2 flex items-center gap-2 font-bold"><Mail size={16} />Emails</h2>{emails.map(e => <div key={e.id} className="border-b border-slate-100 py-2 text-sm last:border-0"><div className="flex justify-between"><b>{e.subject}</b><Badge s={e.status} /></div><div className="text-xs text-slate-500">{when(e.sent_at || e.created_at)}</div></div>)}{!emails.length && <p className="text-sm text-slate-500">Nothing yet.</p>}</div>
        <div className={card}><h2 className="mb-2 font-bold">Replies</h2>
          {replies.map(r => <div key={r.id} className="border-b border-slate-100 py-2 text-sm last:border-0"><div className="flex justify-between"><b>{r.classification}</b><span className="text-xs text-slate-500">{when(r.created_at)}</span></div><p className="text-slate-600">{r.summary}</p></div>)}
          <textarea className={input + " mt-2"} rows={3} placeholder="Paste the reply you received…" value={reply} onChange={e => setReply(e.target.value)} />
          <button className={btn2 + " mt-2"} disabled={!!busy || reply.length < 2} onClick={async () => { const j = await call("r", `/api/leads/${id}/reply`, "POST", { text: reply }); if (j) { setReply(""); load(); } }}>{busy === "r" ? "Reading…" : "Classify reply"}</button>
        </div>
      </div>
    </div>
  );
}
