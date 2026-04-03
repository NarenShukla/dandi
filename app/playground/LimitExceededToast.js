"use client";

import { AlertTriangle } from "lucide-react";

export function LimitExceededToast({ open }) {
  if (!open) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[70] sm:top-24">
      <div
        role="alert"
        className="flex max-w-[min(100vw-2rem,380px)] items-stretch overflow-hidden rounded-xl bg-zinc-900 shadow-lg ring-1 ring-zinc-700/90"
      >
        <div className="w-1.5 shrink-0 self-stretch rounded-l-[10px] bg-amber-400" aria-hidden />
        <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5">
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-amber-400"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-sm font-bold tracking-tight text-white">API Key limit exceeded</span>
        </div>
      </div>
    </div>
  );
}
