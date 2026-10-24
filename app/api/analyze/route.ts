import { z } from "zod";
import { auth, limit, parse, run } from "@/lib/api";
import { analyzeSite } from "@/lib/analyze";

export const maxDuration = 60;
export const POST = (req: Request) => run(async () => {
  const { sb, user } = await auth(req);
  const { ids } = await parse(req, z.object({ ids: z.array(z.string().uuid()).min(1).max(5) }));
  await limit(sb, user.id, "analyze", 200, 60);
  const { data: leads } = await sb.from("leads").select("id,website,email").in("id", ids);
  await Promise.all((leads || []).map(async (l: any) => {
    const a = await analyzeSite(l.website);
    await sb.from("leads").update({ score: a.score, issues: a.issues, email: l.email || a.email, analyzed_at: new Date().toISOString(), status: a.score < 70 ? "qualified" : "rejected" }).eq("id", l.id);
  }));
  return Response.json({ done: leads?.length || 0 });
});
