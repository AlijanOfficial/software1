import { serverClient } from "@/lib/supabase";
import { card } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function Analytics() {
  const sb = await serverClient();
  const n = async (s?: string[]) => { let q = sb.from("leads").select("*", { count: "exact", head: true }); if (s) q = q.in("status", s); return (await q).count ?? 0; };
  const [total, qual, appr, cont, rep, meet] = await Promise.all([n(), n(["qualified", "approved", "contacted", "replied", "meeting"]), n(["approved", "contacted", "replied", "meeting"]), n(["contacted", "replied", "meeting"]), n(["replied", "meeting"]), n(["meeting"])]);
  const sent = (await sb.from("emails").select("*", { count: "exact", head: true }).eq("status", "sent")).count ?? 0;
  const funnel = [["Leads found", total], ["Qualified", qual], ["Approved", appr], ["Contacted", cont], ["Replied", rep], ["Meetings booked", meet]] as const;
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-sm text-slate-500">Your whole pipeline at a glance.</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[["Leads found", total], ["Emails sent", sent], ["Replies", rep], ["Meetings", meet]].map(([l, v]) => <div key={l as string} className={card}><div className="text-sm text-slate-500">{l}</div><div className="mt-2 text-3xl font-extrabold text-teal-700">{v}</div></div>)}
      </div>
      <div className={card}>
        <h2 className="mb-4 font-bold">Pipeline</h2>
        <div className="space-y-3">{funnel.map(([l, v]) => <div key={l}><div className="mb-1 flex justify-between text-sm"><span>{l}</span><b>{v}</b></div><div className="h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all" style={{ width: `${total ? Math.max(3, (v / total) * 100) : 0}%` }} /></div></div>)}</div>
      </div>
    </div>
  );
}
