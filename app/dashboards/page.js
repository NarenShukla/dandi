"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const STORAGE_KEY = "apiKeys";
const DEFAULT_PLAN = {
  name: "Researcher",
  apiLimit: 1000,
};

function safeParse(json) {
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function loadKeys() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
}

function saveKeys(keys) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function generateApiKey() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const base64 = btoa(String.fromCharCode(...bytes))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
  return `dandi_${base64}`;
}

function maskKey(key) {
  if (!key) return "";
  if (key.length <= 10) return "•".repeat(key.length);
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

function clampInt(n, fallback = 0) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(0, Math.floor(x));
}

function formatCompactInt(n) {
  const x = clampInt(n, 0);
  return new Intl.NumberFormat(undefined, { notation: "compact" }).format(x);
}

function IconButton({ label, onClick, children, variant = "default" }) {
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border text-zinc-900 transition-colors dark:text-zinc-50";
  const styles =
    variant === "danger"
      ? "border-red-500/30 hover:border-transparent hover:bg-red-500/10"
      : "border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]";
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
    </svg>
  );
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a3.5 3.5 0 0 0 4.8 4.8" />
      <path d="M9.5 5.3A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.4" />
      <path d="M6.1 6.1C3.3 8.2 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3.1-.5" />
    </svg>
  );
}

function CopyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M9 9h11v11H9z" />
      <path d="M4 15H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function RefreshIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M21 12a9 9 0 1 1-3-6.7" />
      <path d="M21 3v6h-6" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M6 6l1 16a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function XIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function DashboardsPage() {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [revealed, setRevealed] = useState(() => new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null); // { message: string, kind: "success" | "error" | "delete" } | null
  const nameInputRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  function showToast(message, kind = "success") {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, kind });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2200);
  }

  useEffect(() => {
    let cancelled = false;

    async function fetchKeys() {
      const { data, error } = await supabase
        .from("api_keys")
        .select("id, name, key, usage, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load API keys from Supabase", error);
        if (!cancelled) setKeys(loadKeys());
        return;
      }

      if (!cancelled) {
        const mapped = (data ?? []).map((row) => ({
          id: row.id,
          name: row.name ?? "Untitled key",
          key: row.key,
          usage: row.usage ?? 0,
          createdAt: row.created_at,
          updatedAt: row.updated_at ?? row.created_at,
        }));
        setKeys(mapped);
      }
    }

    fetchKeys();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Keep localStorage for offline/demo fallback.
    saveKeys(keys);
  }, [keys]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter((k) => (k.name ?? "").toLowerCase().includes(q));
  }, [keys, query]);

  function onCreate(e) {
    e.preventDefault();
    const trimmed = name.trim();
    const localId = uuid();
    const now = new Date().toISOString();
    const keyValue = generateApiKey();
    const optimistic = {
      id: localId,
      name: trimmed || "Untitled key",
      key: keyValue,
      usage: 0,
      createdAt: now,
      updatedAt: now,
    };
    setKeys((prev) => [optimistic, ...prev]);
    setName("");
    setIsCreateOpen(false);
    showToast("Created new API key", "success");

    supabase
      .from("api_keys")
      .insert({
        id: localId,
        name: optimistic.name,
        key: optimistic.key,
        usage: optimistic.usage,
      })
      .select("id, created_at, updated_at")
      .single()
      .then(({ error, data }) => {
        if (error) {
          console.error("Failed to create API key in Supabase", error);
          return;
        }
        if (!data) return;
        setKeys((prev) =>
          prev.map((k) =>
            k.id === localId
              ? {
                  ...k,
                  createdAt: data.created_at,
                  updatedAt: data.updated_at ?? data.created_at,
                }
              : k
          )
        );
      });
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied API key to clipboard", "success");
    } catch {
      showToast("Failed to copy to clipboard", "error");
    }
  }

  function toggleReveal(id) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateName(id, nextName) {
    const updatedAt = new Date().toISOString();
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, name: nextName, updatedAt } : k))
    );

    supabase
      .from("api_keys")
      .update({ name: nextName, updated_at: updatedAt })
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update API key name in Supabase", error);
          showToast("Failed to rename API key", "error");
          return;
        }
        showToast("Updated API key name", "success");
      });
  }

  function regenerate(id) {
    const nextKey = generateApiKey();
    const updatedAt = new Date().toISOString();
    setKeys((prev) =>
      prev.map((k) => (k.id === id ? { ...k, key: nextKey, updatedAt } : k))
    );

    supabase
      .from("api_keys")
      .update({ key: nextKey, updated_at: updatedAt })
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to regenerate API key in Supabase", error);
          showToast("Failed to regenerate API key", "error");
          return;
        }
        showToast("Regenerated API key", "success");
      });
  }

  function remove(id) {
    setKeys((prev) => prev.filter((k) => k.id !== id));
    setRevealed((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    supabase
      .from("api_keys")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to delete API key in Supabase", error);
          showToast("Failed to delete API key", "error");
          return;
        }
        showToast("Deleted API key", "delete");
      });
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <div
            className={[
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
              toast.kind === "delete"
                ? "bg-red-500 text-white"
                : "bg-emerald-500 text-white",
            ].join(" ")}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
              {toast.kind === "delete" ? (
                <TrashIcon className="h-4 w-4" />
              ) : (
                <CheckIcon className="h-4 w-4" />
              )}
            </span>
            <span className="max-w-[260px] truncate">{toast.message}</span>
          </div>
        </div>
      )}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative h-full w-[260px] overflow-y-auto rounded-3xl border border-black/[.08] bg-white p-4 shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="flex items-center justify-between px-2 py-2">
              <div className="text-lg font-semibold tracking-tight">Dandi AI</div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] bg-white text-zinc-900 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
                aria-label="Close sidebar"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <nav className="mt-3 space-y-1">
              <Link
                href="/"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-black/[.04] px-3 py-2 text-sm font-medium dark:bg-white/[.08]"
              >
                <span>Home</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Pages</span>
              </Link>
              <Link
                href="/dashboards"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="flex items-center justify-between rounded-2xl bg-black/[.04] px-3 py-2 text-sm font-medium dark:bg-white/[.08]"
              >
                <span>Overview</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Pages</span>
              </Link>
              <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Research Assistant</div>
              <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Research Reports</div>
              <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">API Playground</div>
              <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Invoices</div>
              <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Documentation</div>
            </nav>
          </aside>
        </div>
      )}
      <div
        className={`mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-10 ${
          isDesktopSidebarOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[56px_1fr]"
        }`}
      >
        <div
          className="hidden h-full lg:block"
          onMouseEnter={() => setIsDesktopSidebarOpen(true)}
          onMouseLeave={() => setIsDesktopSidebarOpen(false)}
        >
          {isDesktopSidebarOpen ? (
            <aside className="rounded-3xl border border-black/[.08] bg-white p-4 shadow-sm dark:border-white/[.145] dark:bg-black">
              <div className="flex items-center justify-between px-2 py-2">
                <div className="text-lg font-semibold tracking-tight">Dandi AI</div>
                <Link
                  href="/"
                  className="text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  Home
                </Link>
              </div>

              <nav className="mt-3 space-y-1">
                <Link
                  href="/dashboards"
                  className="flex items-center justify-between rounded-2xl bg-black/[.04] px-3 py-2 text-sm font-medium dark:bg-white/[.08]"
                >
                  <span>Overview</span>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">Pages</span>
                </Link>
                <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Research Assistant</div>
                <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Research Reports</div>
                <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">API Playground</div>
                <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Invoices</div>
                <div className="rounded-2xl px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400">Documentation</div>
              </nav>
            </aside>
          ) : (
            <div className="h-full rounded-3xl border border-black/[.08] bg-white p-2 shadow-sm dark:border-white/[.145] dark:bg-black">
              <div className="mt-2 flex h-9 w-full items-center justify-center rounded-2xl bg-black/[.04] dark:bg-white/[.06]">
                <MenuIcon className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
              </div>
            </div>
          )}
        </div>

        <main className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] bg-white text-zinc-900 shadow-sm transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:hover:bg-[#1a1a1a] lg:hidden"
                onClick={() => setIsMobileSidebarOpen((v) => !v)}
                aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isMobileSidebarOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
              </button>
              <div className="space-y-1">
                <div className="text-xs text-zinc-600 dark:text-zinc-400">Pages / Overview</div>
                <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-black/[.08] bg-white px-3 py-1.5 text-xs text-zinc-700 shadow-sm dark:border-white/[.145] dark:bg-black dark:text-zinc-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-full border border-black/[.08] bg-white px-4 text-xs font-medium transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:hover:bg-[#1a1a1a]"
              >
                Manage plan
              </button>
            </div>
          </div>

          <section className="mt-6 rounded-3xl border border-black/[.08] bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-500 p-6 text-white shadow-sm dark:border-white/[.145]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="text-[11px] font-semibold tracking-wider text-white/80">CURRENT PLAN</div>
                <div className="text-3xl font-semibold tracking-tight">{DEFAULT_PLAN.name}</div>
              </div>
              <div className="text-xs text-white/80">API limit</div>
            </div>
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-[18%] rounded-full bg-white/80" />
              </div>
              <div className="mt-2 text-xs text-white/80">24 / {DEFAULT_PLAN.apiLimit.toLocaleString()} requests</div>
            </div>
          </section>

          <section className="mt-8 rounded-3xl border border-black/[.08] bg-white shadow-sm dark:border-white/[.145] dark:bg-black">
            <div className="flex flex-col gap-4 border-b border-black/[.08] p-5 dark:border-white/[.145] sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold">API Keys</h2>
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {filtered.length} shown / {keys.length} total
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  The key is used to authenticate your requests. Keys are stored in your browser’s localStorage for now.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <div className="w-full sm:w-64">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search keys…"
                    className="h-10 w-full rounded-2xl border border-black/[.12] bg-transparent px-4 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:focus:border-white/40"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setName("");
                    setIsCreateOpen(true);
                    setTimeout(() => {
                      nameInputRef.current?.focus?.();
                    }, 0);
                  }}
                  className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                >
                  + Create
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <tr className="border-b border-black/[.06] dark:border-white/[.10]">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Usage</th>
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[.06] dark:divide-white/[.10]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td className="px-5 py-10 text-sm text-zinc-600 dark:text-zinc-400" colSpan={4}>
                        No API keys yet. Add one above.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((k) => {
                      const isRevealed = revealed.has(k.id);
                      const displayKey = isRevealed ? k.key : maskKey(k.key);
                      const usage = clampInt(k.usage, 0);
                      return (
                        <tr key={k.id} className="align-top">
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              <input
                                value={k.name ?? ""}
                                onChange={(e) => updateName(k.id, e.target.value)}
                                className="h-10 w-full max-w-[260px] rounded-2xl border border-black/[.12] bg-transparent px-3 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:focus:border-white/40"
                                aria-label="API key name"
                              />
                              <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                                Created {new Date(k.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-zinc-900 dark:text-zinc-50">{formatCompactInt(usage)}</td>
                          <td className="px-5 py-4">
                            <code className="inline-flex max-w-[420px] rounded-2xl bg-black/[.04] px-3 py-2 text-xs text-zinc-900 dark:bg-white/[.08] dark:text-zinc-50">
                              {displayKey}
                            </code>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <IconButton
                                label={isRevealed ? "Hide key" : "Reveal key"}
                                onClick={() => toggleReveal(k.id)}
                              >
                                {isRevealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </IconButton>
                              <IconButton label="Copy key" onClick={() => copyToClipboard(k.key)}>
                                <CopyIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton label="Regenerate key" onClick={() => regenerate(k.id)}>
                                <RefreshIcon className="h-4 w-4" />
                              </IconButton>
                              <IconButton label="Delete key" variant="danger" onClick={() => remove(k.id)}>
                                <TrashIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                              </IconButton>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
          {isCreateOpen && (
            <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 text-sm shadow-2xl dark:bg-zinc-950">
                <h3 className="text-lg font-semibold tracking-tight">Create a new API key</h3>
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  Enter a name and optional usage limit for the new API key.
                </p>
                <form onSubmit={onCreate} className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
                      Key name
                    </label>
                    <input
                      ref={nameInputRef}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="A unique name to identify this key"
                      className="h-10 w-full rounded-2xl border border-black/[.12] bg-transparent px-3 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:focus:border-white/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
                      <input
                        type="checkbox"
                        disabled
                        className="h-3.5 w-3.5 rounded border border-black/[.18] text-foreground"
                      />
                      Limit monthly usage
                    </label>
                    <input
                      type="number"
                      disabled
                      placeholder="1000"
                      className="h-9 w-full rounded-2xl border border-black/[.08] bg-black/[.02] px-3 text-xs text-zinc-500 outline-none dark:border-white/[.12] dark:bg-white/[.03]"
                    />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      *If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be
                      rejected.
                    </p>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreateOpen(false);
                        setName("");
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-2xl border border-black/[.08] bg-transparent px-4 text-xs font-medium text-zinc-800 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-100 dark:hover:bg-[#1a1a1a]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-2xl bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

