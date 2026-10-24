import { z } from "zod";
import { auth, run } from "@/lib/api";
import { newToken } from "@/lib/security";

export const POST = (req: Request, c: { params: Promise<{ id: string }> }) => run(async () => {
  const { sb, user } = await auth(req); const id = z.string().uuid().parse((await c.params).id);
  const { data: old } = await sb.from("meetings").select("token").eq("lead_id", id).eq("status", "link_sent").maybeSingle();
  let token = old?.token;
  if (!token) { token = newToken(); const { error } = await sb.from("meetings").insert({ user_id: user.id, lead_id: id, token }); if (error) throw error; }
  return Response.json({ url: `${process.env.APP_URL}/book/${token}` });
});
