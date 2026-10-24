import { z } from "zod";
import { auth, limit, parse, run } from "@/lib/api";
import { classifyReply } from "@/lib/ai";
import { suppress } from "@/lib/suppress";

export const maxDuration = 60;
export const POST = (req: Request, c: { params: Promise<{ id: string }> }) => run(async () => {
  const { sb, user } = await auth(req); const id = z.string().uuid().parse((await c.params).id);
  const { text } = await parse(req, z.object({ text: z.string().trim().min(2).max(5000) }));
  await limit(sb, user.id, "reply", 100, 60);
  const { data: lead } = await sb.from("leads").select("id,email").eq("id", id).single();
  if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });
  const r = await classifyReply(text);
  await sb.from("replies").insert({ user_id: user.id, lead_id: id, body: text, classification: r.class, summary: r.summary });
  if (r.class === "not_interested") { if (lead.email) await suppress(user.id, lead.email); await sb.from("leads").update({ reply_class: r.class, status: "unsubscribed" }).eq("id", id); }
  else await sb.from("leads").update({ reply_class: r.class, status: "replied" }).eq("id", id);
  return Response.json(r);
});
