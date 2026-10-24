import { admin } from "./supabase";
/** Adds an address to the do-not-contact list and stops the lead (used by unsubscribe + "not interested"). */
export async function suppress(uid: string, email: string) {
  const db = admin(); const e = email.toLowerCase();
  await db.from("suppression").upsert({ user_id: uid, email: e }, { onConflict: "user_id,email" });
  await db.from("leads").update({ status: "unsubscribed" }).eq("user_id", uid).eq("email", e);
}
