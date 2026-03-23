"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PENDING_API_KEY_STORAGE_KEY } from "@/lib/playground/constants";
import { resetPendingApiKeyStaging } from "@/lib/playground/pendingApiKey";
import { ValidationToast } from "@/lib/playground/ValidationToast";

const INVALID_MESSAGE = "Invalid API key";

export default function PlaygroundPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    resetPendingApiKeyStaging();
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showInvalidToast() {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ kind: "error", message: INVALID_MESSAGE });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed || typeof window === "undefined") return;

    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch("/api/validate-api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: trimmed }),
      });
      const body = await res.json().catch(() => ({}));
      const valid = body && body.valid === true;

      if (!valid) {
        showInvalidToast();
        return;
      }

      resetPendingApiKeyStaging();
      window.sessionStorage.setItem(PENDING_API_KEY_STORAGE_KEY, trimmed);
      router.push("/protected");
    } catch {
      showInvalidToast();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <ValidationToast toast={toast} />

      <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
        <div className="mb-8 text-sm">
          <Link
            href="/dashboards"
            className="text-zinc-600 underline-offset-4 hover:underline dark:text-zinc-400"
          >
            ← Back to Overview
          </Link>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">API Playground</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Enter an API key to validate access to <code className="rounded bg-black/[.06] px-1.5 py-0.5 text-xs dark:bg-white/[.08]">/protected</code>
          .
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="api-key" className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              API key
            </label>
            <input
              id="api-key"
              name="apiKey"
              type="password"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="dandi_…"
              className="h-11 w-full rounded-2xl border border-black/[.12] bg-white px-4 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:bg-zinc-950 dark:focus:border-white/40"
            />
          </div>
          <button
            type="submit"
            disabled={!apiKey.trim() || submitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#ccc]"
          >
            Submit and go to /protected
          </button>
        </form>
      </div>
    </div>
  );
}
