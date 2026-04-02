import { createSupabaseAdmin } from "@/lib/supabaseClient";
import { mapApiKeyRow } from "./mappers";

function adminClientOrError() {
  const client = createSupabaseAdmin();
  if (!client) {
    return { client: null, unavailable: true };
  }
  return { client, unavailable: false };
}

export async function listApiKeysByUserId(userId) {
  const { client, unavailable } = adminClientOrError();
  if (unavailable) return { unavailable: true, error: null, keys: null };

  const { data, error: queryError } = await client
    .from("api_keys")
    .select("id, name, key, usage, created_at, updated_at, user_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (queryError) return { unavailable: false, error: queryError, keys: null };
  return { unavailable: false, error: null, keys: (data ?? []).map(mapApiKeyRow) };
}

export async function getApiKeyById(userId, id) {
  const { client, unavailable } = adminClientOrError();
  if (unavailable) return { unavailable: true, error: null, key: null };

  const { data, error: queryError } = await client
    .from("api_keys")
    .select("id, name, key, usage, created_at, updated_at, user_id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (queryError) return { unavailable: false, error: queryError, key: null };
  if (!data) return { unavailable: false, error: null, key: null };
  return { unavailable: false, error: null, key: mapApiKeyRow(data) };
}

export async function insertApiKey({ userId, id, name, key, usage = 0 }) {
  const { client, unavailable } = adminClientOrError();
  if (unavailable) return { data: null, error: null, unavailable: true };

  const result = await client
    .from("api_keys")
    .insert({
      id,
      name,
      key,
      usage,
      user_id: userId,
    })
    .select("id, name, key, usage, created_at, updated_at, user_id")
    .single();
  return { ...result, unavailable: false };
}

export async function updateApiKeyFields(userId, id, { name, key }) {
  const { client, unavailable } = adminClientOrError();
  if (unavailable) return { data: null, error: null, unavailable: true };

  const updatedAt = new Date().toISOString();
  const patch = { updated_at: updatedAt };
  if (name !== undefined) patch.name = name;
  if (key !== undefined) patch.key = key;

  const result = await client
    .from("api_keys")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select("id, name, key, usage, created_at, updated_at, user_id")
    .maybeSingle();
  return { ...result, unavailable: false };
}

export async function deleteApiKeyById(userId, id) {
  const { client, unavailable } = adminClientOrError();
  if (unavailable) return { error: null, unavailable: true };

  const { error: deleteError } = await client.from("api_keys").delete().eq("id", id).eq("user_id", userId);

  return { error: deleteError ?? null, unavailable: false };
}
