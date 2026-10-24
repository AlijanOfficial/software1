import Link from "next/link";
import { serverClient } from "@/lib/supabase";
import { Badge, btn2, when } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function Followups() {
  const sb = await serverClient();
  const cutoff = new Date(Date.now() - 3 * 864e5).toISOString();
  const { data } = await sb.from("emails").select("sent_at,leads(id,name,email,status)").eq("status", "sent").lt("sent_at", cutoff).order("sent_at");
  const list = ((data || []) as any[]).filter(e => e.leads?.status === "contacted");
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Follow-ups</h1><p className="text-sm text-slate-500">Contacted 3+ days ago with no reply yet. Write a short, polite follow-up from the lead page.</p></div>
      <div className="space-y-3">{list.map((e, i) => <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div><b>{e.leads.name}</b><div className="text-sm text-slate-500">{e.leads.email} · emailed {when(e.sent_at)}</div></div><div className="flex items-center gap-3"><Badge s="contacted" /><Link className={btn2} href={`/leads/${e.leads.id}`}>Open</Link></div></div>)}
        {!list.length && <p className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">Nothing to follow up right now.</p>}</div>
    </div>
  );
}
