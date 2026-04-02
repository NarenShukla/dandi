import { createSupabaseAdmin } from "@/lib/supabaseClient";

const API_KEY_SELECT = 'id, usage, "limit"';

export const apiKeyMessages = {
  invalid: "Invalid API key.",
  unavailable: "Supabase service role is not configured; API key checks cannot run.",
  validateFailed: "Could not validate the API key.",
  rateLimited: "Rate limit exceeded.",
  usageFailed: "Could not update API key usage.",
  notFoundAfterValidate: "API key was not found when recording usage.",
};

/**
 * @typedef {{ id: string, usage: number, limit: number | null }} ApiKeyRateRow
 */

/**
 * Validates that an API key exists in `api_keys` (exact match on `key`).
 * Zero rows means the key is invalid.
 *
 * @param {string} key
 * @returns {Promise<
 *   | { ok: true; row: ApiKeyRateRow }
 *   | { ok: false; code: "invalid"; message: string }
 *   | { ok: false; code: "unavailable"; message: string }
 *   | { ok: false; code: "error"; message: string; error: unknown }
 * >}
 */
export async function validateApiKey(key) {
  const trimmed = typeof key === "string" ? key.trim() : "";
  if (!trimmed) {
    return { ok: false, code: "invalid", message: apiKeyMessages.invalid };
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, code: "unavailable", message: apiKeyMessages.unavailable };
  }

  const { data, error } = await admin.from("api_keys").select(API_KEY_SELECT).eq("key", trimmed).limit(1);

  if (error) {
    return { ok: false, code: "error", message: apiKeyMessages.validateFailed, error };
  }

  const row = Array.isArray(data) && data.length > 0 ? data[0] : null;
  if (!row) {
    return { ok: false, code: "invalid", message: apiKeyMessages.invalid };
  }

  return {
    ok: true,
    row: {
      id: row.id,
      usage: row.usage ?? 0,
      limit: row.limit != null ? Number(row.limit) : null,
    },
  };
}

const MAX_USAGE_INCREMENT_ATTEMPTS = 8;

/**
 * Atomically increments `usage` when current usage is strictly below `limit`.
 * If `limit` is null, usage is always incremented (no cap).
 * Use after {@link validateApiKey}; handles concurrent requests via optimistic retries.
 *
 * @param {string} key
 * @returns {Promise<
 *   | { ok: true; row: ApiKeyRateRow }
 *   | { ok: false; code: "rate_limited"; message: string }
 *   | { ok: false; code: "unavailable"; message: string }
 *   | { ok: false; code: "not_found"; message: string }
 *   | { ok: false; code: "error"; message: string; error: unknown }
 * >}
 */
export async function incrementApiKeyUsageAndCheckLimit(key) {
  const trimmed = typeof key === "string" ? key.trim() : "";
  if (!trimmed) {
    return { ok: false, code: "not_found", message: apiKeyMessages.notFoundAfterValidate };
  }

  const admin = createSupabaseAdmin();
  if (!admin) {
    return { ok: false, code: "unavailable", message: apiKeyMessages.unavailable };
  }

  for (let attempt = 0; attempt < MAX_USAGE_INCREMENT_ATTEMPTS; attempt++) {
    const { data: rows, error: readError } = await admin
      .from("api_keys")
      .select(API_KEY_SELECT)
      .eq("key", trimmed)
      .limit(1);

    if (readError) {
      return { ok: false, code: "error", message: apiKeyMessages.usageFailed, error: readError };
    }

    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) {
      return { ok: false, code: "not_found", message: apiKeyMessages.notFoundAfterValidate };
    }

    const usage = row.usage ?? 0;
    const limitVal = row.limit != null ? Number(row.limit) : null;

    if (limitVal != null && usage >= limitVal) {
      return { ok: false, code: "rate_limited", message: apiKeyMessages.rateLimited };
    }

    const nextUsage = usage + 1;
    const { data: updatedRows, error: updateError } = await admin
      .from("api_keys")
      .update({ usage: nextUsage, updated_at: new Date().toISOString() })
      .eq("key", trimmed)
      .eq("usage", usage)
      .select(API_KEY_SELECT)
      .limit(1);

    if (updateError) {
      return { ok: false, code: "error", message: apiKeyMessages.usageFailed, error: updateError };
    }

    const updated = Array.isArray(updatedRows) && updatedRows.length > 0 ? updatedRows[0] : null;
    if (updated) {
      return {
        ok: true,
        row: {
          id: updated.id,
          usage: updated.usage ?? 0,
          limit: updated.limit != null ? Number(updated.limit) : null,
        },
      };
    }
  }

  return { ok: false, code: "rate_limited", message: apiKeyMessages.rateLimited };
}

/**
 * Legacy shape for callers that only need a boolean.
 * On service-role misconfiguration, returns `{ valid: false, error }` so callers can surface 503/500.
 */
export async function isApiKeyValid(key) {
  const result = await validateApiKey(key);
  if (result.ok) return { valid: true, error: null };
  if (result.code === "error") return { valid: false, error: result.error };
  if (result.code === "unavailable") {
    return { valid: false, error: new Error(result.message) };
  }
  return { valid: false, error: null };
}
