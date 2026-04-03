"use client";

import { useEffect, useRef, useState } from "react";
import {
  DashboardSidebarDesktop,
  DashboardSidebarMobile,
} from "@/app/dashboards/components/DashboardSidebar";
import { IconButton } from "@/app/dashboards/components/IconButton";
import { EyeIcon, EyeOffIcon, MenuIcon, XIcon } from "@/app/dashboards/components/icons";
import { LimitExceededToast } from "./LimitExceededToast";

const INVALID_MESSAGE = "Invalid API key.";
const LIMIT_TOAST_MS = 4200;

export default function PlaygroundPage() {
  const [apiKey, setApiKey] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [keyUsage, setKeyUsage] = useState(null);
  const [summarizerResult, setSummarizerResult] = useState(null);
  const [statusBanner, setStatusBanner] = useState(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [limitToastOpen, setLimitToastOpen] = useState(false);
  const limitToastTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (limitToastTimerRef.current) clearTimeout(limitToastTimerRef.current);
    };
  }, []);

  function showLimitExceededToast() {
    if (limitToastTimerRef.current) clearTimeout(limitToastTimerRef.current);
    setLimitToastOpen(true);
    limitToastTimerRef.current = setTimeout(() => {
      setLimitToastOpen(false);
      limitToastTimerRef.current = null;
    }, LIMIT_TOAST_MS);
  }

  async function fetchKeyStatus(trimmedKey) {
    const res = await fetch("/api/validate-api-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: trimmedKey }),
    });
    const body = await res.json().catch(() => ({}));
    if (!body.valid) {
      const message =
        typeof body.message === "string" && body.message.trim()
          ? body.message
          : INVALID_MESSAGE;
      return { ok: false, message };
    }
    return {
      ok: true,
      usage: typeof body.usage === "number" ? body.usage : Number(body.usage) || 0,
      limit: body.limit == null ? null : Number(body.limit),
    };
  }

  async function onSubmit(e) {
    e.preventDefault();
    const trimmedKey = apiKey.trim();
    const trimmedUrl = githubUrl.trim();
    if (!trimmedKey || !trimmedUrl) return;

    setSubmitting(true);
    setStatusBanner(null);
    setSummarizerResult(null);
    setLimitToastOpen(false);
    if (limitToastTimerRef.current) {
      clearTimeout(limitToastTimerRef.current);
      limitToastTimerRef.current = null;
    }

    try {
      const status = await fetchKeyStatus(trimmedKey);
      if (!status.ok) {
        setStatusBanner({ variant: "error", text: status.message });
        setKeyUsage(null);
        return;
      }

      setKeyUsage({ usage: status.usage, limit: status.limit });

      const atLimit = status.limit != null && status.usage >= status.limit;
      if (atLimit) {
        showLimitExceededToast();
        return;
      }

      const res = await fetch("/api/github-summarizer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": trimmedKey,
        },
        body: JSON.stringify({ githubUrl: trimmedUrl }),
      });

      const body = await res.json().catch(() => ({}));
      const message = typeof body.message === "string" ? body.message : "Request failed";

      if (!res.ok) {
        if (res.status === 429) {
          showLimitExceededToast();
        } else {
          setStatusBanner({ variant: "error", text: message });
        }
        return;
      }

      setSummarizerResult({
        summary: body.summary,
        cool_facts: Array.isArray(body.cool_facts) ? body.cool_facts : [],
        stars: body.stars,
        latest_version: body.latest_version,
        website_url: body.website_url,
        license: body.license,
      });
      setStatusBanner({ variant: "success", text: "Summary ready" });

      const after = await fetchKeyStatus(trimmedKey);
      if (after.ok) setKeyUsage({ usage: after.usage, limit: after.limit });
    } catch {
      setStatusBanner({
        variant: "error",
        text: "Could not complete the request. Try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const usagePct =
    keyUsage && keyUsage.limit != null && keyUsage.limit > 0
      ? Math.min(100, (keyUsage.usage / keyUsage.limit) * 100)
      : 0;

  return (
    <div className="relative font-sans text-foreground">
      <LimitExceededToast open={limitToastOpen} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-accent/10 opacity-10 blur-3xl" />
      </div>

      <DashboardSidebarMobile
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_1fr] lg:gap-8 lg:px-8 lg:py-10">
        <DashboardSidebarDesktop
          isOpen
          onMouseEnter={() => {}}
          onMouseLeave={() => {}}
        />

        <main className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-muted lg:hidden"
                onClick={() => setIsMobileSidebarOpen((v) => !v)}
                aria-label={isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {isMobileSidebarOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
              </button>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Pages / API Playground</div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">API Playground</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {statusBanner ? (
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs shadow-sm"
                  role="status"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      statusBanner.variant === "error" ? "bg-red-500" : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={
                      statusBanner.variant === "error"
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {statusBanner.text}
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Operational
                </div>
              )}
            </div>
          </div>

          <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
            Enter Valid API Key and GitHub Repository URL to receive Summary. Key Limits Apply
          </p>

          <section className="mt-8 rounded-3xl border border-border bg-card shadow-sm">
            <div className="border-b border-border p-5">
              <h2 className="text-base font-semibold text-foreground">GitHub summarizer</h2>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label htmlFor="api-key" className="text-xs font-medium text-foreground">
                  API key
                </label>
                <div className="relative">
                  <input
                    id="api-key"
                    name="apiKey"
                    type={showApiKey ? "text" : "password"}
                    autoComplete="off"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="dandi_…"
                    className="h-10 w-full rounded-2xl border border-input bg-background py-2 pl-4 pr-12 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2">
                    <IconButton
                      label={showApiKey ? "Hide API key" : "Show API key"}
                      onClick={() => setShowApiKey((v) => !v)}
                    >
                      {showApiKey ? (
                        <EyeOffIcon className="h-4 w-4 shrink-0" />
                      ) : (
                        <EyeIcon className="h-4 w-4 shrink-0" />
                      )}
                    </IconButton>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="github-url" className="text-xs font-medium text-foreground">
                  GitHub Repository URL
                </label>
                <input
                  id="github-url"
                  name="githubUrl"
                  type="url"
                  autoComplete="off"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                />
              </div>

              {keyUsage && keyUsage.limit != null && (
                <div className="pt-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {keyUsage.usage.toLocaleString()} / {keyUsage.limit.toLocaleString()} requests (this key)
                  </p>
                </div>
              )}

              {keyUsage && keyUsage.limit == null && (
                <p className="text-xs text-muted-foreground">
                  Usage for this key: {keyUsage.usage.toLocaleString()} (no per-key limit)
                </p>
              )}

              <button
                type="submit"
                disabled={!apiKey.trim() || !githubUrl.trim() || submitting}
                className="inline-flex h-10 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
              >
                {submitting ? "Submitting…" : "Submit"}
              </button>
            </form>

            {summarizerResult && (
              <div className="space-y-5 border-t border-border p-5 text-sm">
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Summary
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap text-foreground">
                    {summarizerResult.summary ?? "—"}
                  </p>
                </div>
                {summarizerResult.cool_facts.length > 0 && (
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Cool facts
                    </h3>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-foreground">
                      {summarizerResult.cool_facts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <dl className="grid gap-3 border-t border-border pt-4 text-xs sm:grid-cols-2">
                  {summarizerResult.stars != null && (
                    <div>
                      <dt className="text-muted-foreground">Stars</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{summarizerResult.stars}</dd>
                    </div>
                  )}
                  {summarizerResult.latest_version != null && summarizerResult.latest_version !== "" && (
                    <div>
                      <dt className="text-muted-foreground">Latest version</dt>
                      <dd className="mt-0.5 font-medium text-foreground">
                        {summarizerResult.latest_version}
                      </dd>
                    </div>
                  )}
                  {summarizerResult.website_url != null && summarizerResult.website_url !== "" && (
                    <div className="sm:col-span-2">
                      <dt className="text-muted-foreground">Website</dt>
                      <dd className="mt-0.5">
                        <a
                          href={summarizerResult.website_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {summarizerResult.website_url}
                        </a>
                      </dd>
                    </div>
                  )}
                  {summarizerResult.license != null && summarizerResult.license !== "" && (
                    <div>
                      <dt className="text-muted-foreground">License</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{summarizerResult.license}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}
