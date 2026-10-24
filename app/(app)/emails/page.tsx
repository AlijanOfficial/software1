import { serverClient } from "@/lib/supabase";
import { Badge, when } from "@/components/ui";

export const dynamic = "force-dynamic";
export default async function EmailActivity() {
  const sb = await serverClient();
  const { data } = await sb.from("emails").select("id,subject,status,sent_at,created_at,leads(name,email)").order("created_at", { ascending: false }).limit(200);
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Email activity</h1>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">To</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Time</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{((data || []) as any[]).map(e => <tr key={e.id}><td className="px-4 py-3"><b>{e.leads?.name}</b><div className="text-xs text-slate-500">{e.leads?.email}</div></td><td className="px-4 py-3">{e.subject}</td><td className="px-4 py-3"><Badge s={e.status} /></td><td className="px-4 py-3 text-slate-500">{when(e.sent_at || e.created_at)}</td></tr>)}
          {!data?.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">No emails yet.</td></tr>}</tbody></table></div>
    </div>
  );
}
