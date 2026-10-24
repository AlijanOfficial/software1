import { okToken } from "@/lib/security";
import { suppress } from "@/lib/suppress";

/** One-click unsubscribe (email clients POST here via the List-Unsubscribe header). The signed token is the protection. */
export async function POST(req: Request) {
  const q = new URL(req.url).searchParams, u = q.get("u") || "", e = q.get("e") || "", t = q.get("t") || "";
  if (!u || !e || !okToken(u, e, t)) return Response.json({ error: "Invalid link" }, { status: 400 });
  await suppress(u, e);
  return Response.json({ ok: true });
}
