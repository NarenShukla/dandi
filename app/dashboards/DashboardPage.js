"use client";

import { useApiKeys } from "@/hooks/useApiKeys";
import { ApiKeysPanel } from "./components/ApiKeysPanel";
import { CreateApiKeyModal } from "./components/CreateApiKeyModal";
import { DashboardSidebarDesktop, DashboardSidebarMobile } from "./components/DashboardSidebar";
import { DashboardToast } from "./components/DashboardToast";
import { MenuIcon, XIcon } from "./components/icons";
import { PlanBanner } from "./components/PlanBanner";

function DashboardPage() {
  const api = useApiKeys();

  function openCreateModal() {
    api.setName("");
    api.setIsCreateOpen(true);
    setTimeout(() => {
      api.nameInputRef.current?.focus?.();
    }, 0);
  }

  function closeCreateModal() {
    api.setIsCreateOpen(false);
    api.setName("");
  }

  return (
    <div className="relative font-sans text-foreground">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-primary/10 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-accent/10 opacity-10 blur-3xl" />
      </div>

      <DashboardToast toast={api.toast} />

      <DashboardSidebarMobile
        isOpen={api.isMobileSidebarOpen}
        onClose={() => api.setIsMobileSidebarOpen(false)}
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
                onClick={() => api.setIsMobileSidebarOpen((v) => !v)}
                aria-label={api.isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {api.isMobileSidebarOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
              </button>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Pages / Overview</div>
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">Overview</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </div>
              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-full border border-border bg-card px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Manage plan
              </button>
            </div>
          </div>

          <PlanBanner />

          <ApiKeysPanel
            keys={api.keys}
            filtered={api.filtered}
            query={api.query}
            onQueryChange={api.setQuery}
            revealed={api.revealed}
            onOpenCreate={openCreateModal}
            onUpdateName={api.updateName}
            onToggleReveal={api.toggleReveal}
            onCopy={api.copyToClipboard}
            onRegenerate={api.regenerate}
            onRemove={api.remove}
          />

          {api.isCreateOpen && (
            <CreateApiKeyModal
              name={api.name}
              nameInputRef={api.nameInputRef}
              onNameChange={api.setName}
              onSubmit={api.onCreate}
              onCancel={closeCreateModal}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
