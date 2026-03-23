import { supabase } from "@/lib/supabaseClient";

/**
 * Returns whether an API key exists in Supabase `api_keys` (exact match on `key` column).
 */
export async function isApiKeyValid(key) {
  const trimmed = typeof key === "string" ? key.trim() : "";
  if (!trimmed) return { valid: false, error: null };

  const { data, error } = await supabase
    .from("api_keys")
    .select("id")
    .eq("key", trimmed)
    .limit(1)
    .maybeSingle();

  if (error) return { valid: false, error };

  return { valid: !!data, error: null };
}
