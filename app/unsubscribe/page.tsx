import { redirect } from "next/navigation";
import { okToken } from "@/lib/security";
import { suppress } from "@/lib/suppress";

export const dynamic = "force-dynamic";
export default async function Unsub({ searchParams }: { searchParams: Promise<{ u?: string; e?: string; t?: string; done?: string }> }) {
  const q = await searchParams;
  const shell = (c: React.ReactNode) => <div className="grid min-h-screen place-items-center p-4"><div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">{c}</div></div>;
  if (q.done) return shell(<><h1 className="text-xl font-bold text-teal-800">You are unsubscribed</h1><p className="mt-2 text-slate-500">You will not receive further emails from us.</p></>);
  const ok = !!(q.u && q.e && q.t && okToken(q.u, q.e, q.t));
  if (!ok) return shell(<p className="text-slate-600">This unsubscribe link is not valid.</p>);
  async function act() { "use server"; await suppress(q.u!, q.e!); redirect("/unsubscribe?done=1"); }
  return shell(<><h1 className="text-xl font-bold">Unsubscribe</h1><p className="my-3 text-slate-500">Stop all emails to <b>{q.e}</b>?</p><form action={act}><button className="rounded-lg bg-teal-600 px-5 py-2 font-semibold text-white">Yes, unsubscribe me</button></form></>);
}
