import { z } from "zod";
import { serverClient } from "./supabase";

/** Every protected API route starts here: CSRF origin check + login check. */
export async function auth(req: Request) {
  if (req.method !== "GET") {
    const o = req.headers.get("origin"), h = req.headers.get("host");
    if (!o || !h || new URL(o).host !== h) throw Response.json({ error: "Bad origin" }, { status: 403 });
  }
  const sb = await serverClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw Response.json({ error: "Unauthorized" }, { status: 401 });
  return { sb, user };
}
/** Simple per-user rate limit stored in the database (works on serverless). */
export async function limit(sb: any, uid: string, kind: string, max: number, mins: number) {
  const since = new Date(Date.now() - mins * 60000).toISOString();
  const { count } = await sb.from("usage").select("*", { count: "exact", head: true }).eq("user_id", uid).eq("kind", kind).gte("created_at", since);
  if ((count ?? 0) >= max) throw Response.json({ error: "Limit reached. Please try again later." }, { status: 429 });
  await sb.from("usage").insert({ user_id: uid, kind });
}
/** Turns thrown Responses / validation errors into clean JSON, never leaks internals. */
export const run = (fn: () => Promise<Response>) =>
  fn().catch(e => {
    if (e instanceof Response) return e;
    if (e instanceof z.ZodError) return Response.json({ error: "Invalid input" }, { status: 400 });
    console.error(e);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  });
export const parse = async <T extends z.ZodTypeAny>(req: Request, schema: T): Promise<z.infer<T>> => schema.parse(await req.json());
