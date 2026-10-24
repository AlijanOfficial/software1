import { z } from "zod";
import { admin } from "@/lib/supabase";
import { allSlots } from "@/lib/slots";

const hits = new Map<string, number[]>(); // best-effort throttle per IP
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "x", now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 60000); if (recent.length >= 10) return Response.json({ error: "Too many attempts" }, { status: 429 });
  hits.set(ip, [...recent, now]);
  const p = z.object({ token: z.string().regex(/^[a-f0-9]{48}$/), slot: z.string() }).safeParse(await req.json().catch(() => null));
  if (!p.success || !allSlots().includes(p.data.slot)) return Response.json({ error: "Invalid request" }, { status: 400 });
  const db = admin();
  const { data: m } = await db.from("meetings").select("id,user_id,lead_id,status").eq("token", p.data.token).maybeSingle();
  if (!m || m.status !== "link_sent") return Response.json({ error: "This link is no longer valid." }, { status: 404 });
  const { data: taken } = await db.from("meetings").select("id").eq("user_id", m.user_id).eq("slot", p.data.slot).eq("status", "booked").maybeSingle();
  if (taken) return Response.json({ error: "That time was just taken. Please pick another." }, { status: 409 });
  await db.from("meetings").update({ slot: p.data.slot, status: "booked" }).eq("id", m.id);
  await db.from("leads").update({ status: "meeting" }).eq("id", m.lead_id);
  return Response.json({ ok: true });
}
