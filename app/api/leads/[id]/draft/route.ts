import { z } from "zod";
import { auth, limit, run } from "@/lib/api";
import { draftEmail } from "@/lib/ai";

export const maxDuration = 60;
export const POST = (req: Request, c: { params: Promise<{ id: string }> }) => run(async () => {
  const { sb, user } = await auth(req); const id = z.string().uuid().parse((await c.params).id);
  await limit(sb, user.id, "draft", 60, 60);
  const [{ data: lead }, { data: settings }] = await Promise.all([sb.from("leads").select("*").eq("id", id).single(), sb.from("settings").select("*").eq("user_id", user.id).maybeSingle()]);
  if (!lead) return Response.json({ error: "Lead not found" }, { status: 404 });
  if (!settings?.business_name || !settings?.offer) return Response.json({ error: "Fill in Settings first (business name and offer)." }, { status: 400 });
  const d = await draftEmail({ lead, settings });
  const { data } = await sb.from("emails").insert({ user_id: user.id, lead_id: id, subject: d.subject, body: d.body }).select("*").single();
  return Response.json({ email: data });
});
