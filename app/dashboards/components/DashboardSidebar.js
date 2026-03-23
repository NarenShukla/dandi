import Link from "next/link";
import { MenuIcon, XIcon } from "./icons";

export function DashboardSidebarMobile({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative h-full w-[260px] overflow-y-auto rounded-3xl border border-black/[.08] bg-white p-4 shadow-sm dark:border-white/[.145] dark:bg-black">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="text-lg font-semibold tracking-tight">Dandi AI</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] bg-white text-zinc-900 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
            aria-label="Close sidebar"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-3 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl bg-black/[.04] px-3 py-2 text-sm font-medium dark:bg-white/[.08]"
          >
            <span>Home</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Pages</span>
          </Link>
          <Link
            href="/dashboards"
            onClick={onClose}
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
  );
}

export function DashboardSidebarDesktop({ isOpen, onMouseEnter, onMouseLeave }) {
  return (
    <div
      className="hidden h-full lg:block"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isOpen ? (
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
  );
}
