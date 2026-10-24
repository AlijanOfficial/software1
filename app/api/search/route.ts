import { z } from "zod";
import { auth, limit, parse, run } from "@/lib/api";
import { searchPlaces } from "@/lib/places";

export const POST = (req: Request) => run(async () => {
  const { sb, user } = await auth(req);
  const b = await parse(req, z.object({ query: z.string().trim().min(3).max(120), max: z.number().int().min(1).max(60) }));
  await limit(sb, user.id, "search", 10, 60);
  const places = await searchPlaces(b.query, b.max);
  const { data: s } = await sb.from("searches").insert({ user_id: user.id, query: b.query, max_results: b.max, found: places.length }).select("id").single();
  const rows = places.map((p: any) => ({ user_id: user.id, search_id: s?.id, place_id: p.id, name: p.displayName?.text || "Unknown", address: p.formattedAddress, phone: p.nationalPhoneNumber, website: p.websiteUri || null, rating: p.rating ?? null }));
  if (rows.length) await sb.from("leads").upsert(rows, { onConflict: "user_id,place_id", ignoreDuplicates: true });
  const { data } = await sb.from("leads").select("id").eq("search_id", s?.id).is("analyzed_at", null);
  return Response.json({ ids: (data || []).map((x: any) => x.id), found: places.length });
});
