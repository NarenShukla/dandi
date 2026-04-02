import { createSupabaseAdmin } from "@/lib/supabaseClient";

/**
 * Resolves Supabase `users.id` for a NextAuth user email (same `users` row as syncUserToSupabase).
 */
export async function getSupabaseUserIdForEmail(email) {
  if (!email) return null;

  const admin = createSupabaseAdmin();
  if (!admin) {
    console.warn(
      "[getSupabaseUserIdForEmail] SUPABASE_SERVICE_ROLE_KEY missing; cannot resolve users.id"
    );
    return null;
  }

  const { data, error } = await admin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("[getSupabaseUserIdForEmail] lookup failed:", error);
    return null;
  }

  return data?.id ?? null;
}
