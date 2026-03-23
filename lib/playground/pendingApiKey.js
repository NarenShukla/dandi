import { PENDING_API_KEY_STORAGE_KEY } from "./constants";

/** Survives Strict Mode double-mount so we only consume sessionStorage once per navigation. */
let stagedPendingKey = undefined;

/**
 * Call when entering the playground so a later /protected visit can read a newly submitted key.
 */
export function resetPendingApiKeyStaging() {
  stagedPendingKey = undefined;
}

/**
 * Returns the pending API key once per staging cycle (then cached). Reads sessionStorage only on first call.
 */
export function takePendingApiKeyFromSession() {
  if (stagedPendingKey !== undefined) return stagedPendingKey;
  if (typeof window === "undefined") {
    stagedPendingKey = null;
    return null;
  }
  const raw = window.sessionStorage.getItem(PENDING_API_KEY_STORAGE_KEY);
  window.sessionStorage.removeItem(PENDING_API_KEY_STORAGE_KEY);
  stagedPendingKey = raw;
  return raw;
}
