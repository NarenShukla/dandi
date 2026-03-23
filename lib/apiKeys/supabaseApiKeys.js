import { supabase } from "@/lib/supabaseClient";
import { mapApiKeyRow } from "./mappers";

export async function listApiKeys() {
  const { data, error } = await supabase
    .from("api_keys")
    .select("id, name, key, usage, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) return { error, keys: null };
  return { error: null, keys: (data ?? []).map(mapApiKeyRow) };
}

export function insertApiKey({ id, name, key, usage }) {
  return supabase
    .from("api_keys")
    .insert({
      id,
      name,
      key,
      usage,
    })
    .select("id, created_at, updated_at")
    .single();
}

export function updateApiKeyName(id, name, updatedAt) {
  return supabase.from("api_keys").update({ name, updated_at: updatedAt }).eq("id", id);
}

export function updateApiKeyValue(id, key, updatedAt) {
  return supabase.from("api_keys").update({ key, updated_at: updatedAt }).eq("id", id);
}

export function deleteApiKey(id) {
  return supabase.from("api_keys").delete().eq("id", id);
}
