import { z } from "zod";
import { auth, parse, run } from "@/lib/api";

export const POST = (req: Request) => run(async () => {
  const { sb, user } = await auth(req);
  const b = await parse(req, z.object({ business_name: z.string().trim().max(100), sender_name: z.string().trim().max(100), reply_to: z.string().trim().email().or(z.literal("")), postal_address: z.string().trim().max(250), offer: z.string().trim().max(500) }));
  const { error } = await sb.from("settings").upsert({ user_id: user.id, ...b });
  if (error) throw error;
  return Response.json({ ok: true });
});
