import { serverClient } from "@/lib/supabase";
import { Badge, card } from "@/components/ui";
import { fmt } from "@/lib/slots";

export const dynamic = "force-dynamic";
export default async function Meetings() {
  const sb = await serverClient();
  const { data } = await sb.from("meetings").select("id,slot,status,leads(name,website,issues)").eq("status", "booked").order("slot");
  const now = Date.now(), list = (data || []) as any[];
  const upcoming = list.filter(m => new Date(m.slot).getTime() >= now).length;
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Meetings</h1>
      <div className="grid grid-cols-2 gap-4 sm:max-w-md"><div className={card}><div className="text-sm text-slate-500">Upcoming</div><div className="text-3xl font-extrabold text-teal-700">{upcoming}</div></div><div className={card}><div className="text-sm text-slate-500">Past</div><div className="text-3xl font-extrabold">{list.length - upcoming}</div></div></div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Business</th><th className="px-4 py-3">Meeting time</th><th className="px-4 py-3">Website issue found</th><th className="px-4 py-3">Status</th></tr></thead>
        <tbody className="divide-y divide-slate-100">{list.map(m => <tr key={m.id}><td className="px-4 py-3 font-semibold">{m.leads?.name}</td><td className="px-4 py-3">{fmt(m.slot)} (PKT)</td><td className="px-4 py-3 text-slate-600">{(m.leads?.issues || [])[0] || "–"}</td><td className="px-4 py-3"><Badge s="booked" /></td></tr>)}
          {!list.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-slate-500">No meetings booked yet.</td></tr>}</tbody></table></div>
    </div>
  );
}
