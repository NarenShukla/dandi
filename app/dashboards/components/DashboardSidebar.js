import Link from "next/link";
import { MenuIcon, XIcon } from "./icons";

export function DashboardSidebarMobile({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="relative h-full w-[260px] overflow-y-auto rounded-3xl border border-border bg-card p-4 shadow-lg">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="text-lg font-semibold tracking-tight text-foreground">Dandi</div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted"
            aria-label="Close sidebar"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-3 space-y-1">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl bg-muted/80 px-3 py-2 text-sm font-medium text-foreground"
          >
            <span>Home</span>
            <span className="text-xs text-muted-foreground">Pages</span>
          </Link>
          <Link
            href="/dashboards"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl bg-primary/10 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-primary/20"
          >
            <span>Overview</span>
            <span className="text-xs text-muted-foreground">Pages</span>
          </Link>
          <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Research Assistant</div>
          <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Research Reports</div>
          <Link
            href="/playground"
            onClick={onClose}
            className="flex items-center justify-between rounded-2xl bg-muted/80 px-3 py-2 text-sm font-medium text-foreground"
          >
            <span>API Playground</span>
            <span className="text-xs text-muted-foreground">Pages</span>
          </Link>
          <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Invoices</div>
          <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Documentation</div>
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
        <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="text-lg font-semibold tracking-tight text-foreground">Dandi</div>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
          </div>

          <nav className="mt-3 space-y-1">
            <Link
              href="/dashboards"
              className="flex items-center justify-between rounded-2xl bg-primary/10 px-3 py-2 text-sm font-medium text-foreground ring-1 ring-primary/20"
            >
              <span>Overview</span>
              <span className="text-xs text-muted-foreground">Pages</span>
            </Link>
            <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Research Assistant</div>
            <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Research Reports</div>
            <Link
              href="/playground"
              className="flex items-center justify-between rounded-2xl bg-muted/80 px-3 py-2 text-sm font-medium text-foreground"
            >
              <span>API Playground</span>
              <span className="text-xs text-muted-foreground">Pages</span>
            </Link>
            <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Invoices</div>
            <div className="rounded-2xl px-3 py-2 text-sm text-muted-foreground">Documentation</div>
          </nav>
        </aside>
      ) : (
        <div className="h-full rounded-3xl border border-border bg-card p-2 shadow-sm">
          <div className="mt-2 flex h-9 w-full items-center justify-center rounded-2xl bg-muted/60">
            <MenuIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
