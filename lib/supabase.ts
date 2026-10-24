import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Supabase client bound to the logged-in user (respects Row Level Security). */
export async function serverClient() {
  const jar = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: list => { try { list.forEach(({ name, value, options }) => jar.set(name, value, options)); } catch {} },
    },
  });
}
/** Service-role client. Server only, used for public pages (booking, unsubscribe). Bypasses RLS: be careful. */
export const admin = () => createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
