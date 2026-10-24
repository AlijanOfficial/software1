import { admin } from "@/lib/supabase";
import { allSlots, fmt } from "@/lib/slots";
import BookClient from "@/components/BookClient";

export const dynamic = "force-dynamic";
export default async function Book({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const db = admin();
  const { data: m } = /^[a-f0-9]{48}$/.test(token) ? await db.from("meetings").select("user_id,status").eq("token", token).maybeSingle() : { data: null };
  const shell = (c: React.ReactNode) => <div className="grid min-h-screen place-items-center bg-gradient-to-br from-teal-700 to-emerald-500 p-4"><div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">{c}</div></div>;
  if (!m || m.status !== "link_sent") return shell(<p className="text-center text-slate-600">This booking link is not valid or was already used.</p>);
  const [{ data: s }, { data: taken }] = await Promise.all([db.from("settings").select("business_name").eq("user_id", m.user_id).maybeSingle(), db.from("meetings").select("slot").eq("user_id", m.user_id).eq("status", "booked")]);
  const used = new Set((taken || []).map((x: any) => new Date(x.slot).toISOString()));
  const slots = allSlots().filter(x => !used.has(x)).map(iso => ({ iso, label: fmt(iso) }));
  return shell(<><h1 className="text-2xl font-extrabold text-teal-800">Book a free 15-minute call</h1><p className="mb-5 text-slate-500">with {s?.business_name || "our team"} · times shown in Pakistan time</p><BookClient token={token} slots={slots} /></>);
}
