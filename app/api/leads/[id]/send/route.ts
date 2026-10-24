import { z } from "zod";
import { auth, limit, parse, run } from "@/lib/api";
import { unsubToken } from "@/lib/security";

export const POST = (req: Request, c: { params: Promise<{ id: string }> }) => run(async () => {
  const { sb, user } = await auth(req); const id = z.string().uuid().parse((await c.params).id);
  const b = await parse(req, z.object({ emailId: z.string().uuid(), subject: z.string().trim().min(3).max(150), body: z.string().trim().min(20).max(3000) }));
  const [{ data: lead }, { data: s }] = await Promise.all([sb.from("leads").select("*").eq("id", id).single(), sb.from("settings").select("*").eq("user_id", user.id).maybeSingle()]);
  if (!lead || lead.status !== "approved") return Response.json({ error: "Approve the lead before sending." }, { status: 400 });
  if (!lead.email) return Response.json({ error: "No email address found for this lead." }, { status: 400 });
  if (!s?.postal_address || !s?.reply_to || !s?.business_name) return Response.json({ error: "Settings need business name, reply-to email and postal address (required by anti-spam laws)." }, { status: 400 });
  const { data: sup } = await sb.from("suppression").select("email").eq("email", lead.email).maybeSingle();
  if (sup) return Response.json({ error: "This address is on your do-not-contact list." }, { status: 400 });
  await limit(sb, user.id, "send", Number(process.env.DAILY_EMAIL_CAP || 30), 24 * 60);

  const link = `${process.env.APP_URL}/unsubscribe?u=${user.id}&e=${encodeURIComponent(lead.email)}&t=${unsubToken(user.id, lead.email)}`;
  const text = `${b.body}\n\n--\n${s.sender_name || s.business_name}, ${s.business_name}\n${s.postal_address}\nNot interested? Unsubscribe here: ${link}`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST", signal: AbortSignal.timeout(15000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: `${s.sender_name || s.business_name} <${process.env.FROM_EMAIL}>`, to: [lead.email], reply_to: s.reply_to, subject: b.subject, text, headers: { "List-Unsubscribe": `<${link}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { await sb.from("emails").update({ status: "failed" }).eq("id", b.emailId); return Response.json({ error: "Email provider rejected the message." }, { status: 502 }); }
  await sb.from("emails").update({ subject: b.subject, body: b.body, status: "sent", provider_id: j.id, sent_at: new Date().toISOString() }).eq("id", b.emailId);
  await sb.from("leads").update({ status: "contacted" }).eq("id", id);
  return Response.json({ ok: true });
});
