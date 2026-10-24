import { z } from "zod";
import { auth, parse, run } from "@/lib/api";

export const PATCH = (req: Request, c: { params: Promise<{ id: string }> }) => run(async () => {
  const { sb } = await auth(req); const { id } = await c.params;
  const { status } = await parse(req, z.object({ status: z.enum(["approved", "rejected", "qualified"]) }));
  const { error } = await sb.from("leads").update({ status }).eq("id", z.string().uuid().parse(id)).in("status", ["new", "qualified", "rejected", "approved"]);
  if (error) throw error;
  return Response.json({ ok: true });
});
