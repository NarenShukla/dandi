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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-950 dark:bg-black dark:text-zinc-50">
      <DashboardToast toast={api.toast} />

      <DashboardSidebarMobile
        isOpen={api.isMobileSidebarOpen}
        onClose={() => api.setIsMobileSidebarOpen(false)}
      />

      <div
        className={`mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:gap-8 lg:px-8 lg:py-10 ${
          api.isDesktopSidebarOpen ? "lg:grid-cols-[260px_1fr]" : "lg:grid-cols-[56px_1fr]"
        }`}
      >
        <DashboardSidebarDesktop
          isOpen={api.isDesktopSidebarOpen}
          onMouseEnter={() => api.setIsDesktopSidebarOpen(true)}
          onMouseLeave={() => api.setIsDesktopSidebarOpen(false)}
        />

        <main className="min-w-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/[.08] bg-white text-zinc-900 shadow-sm transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:bg-black dark:text-zinc-50 dark:hover:bg-[#1a1a1a] lg:hidden"
                onClick={() => api.setIsMobileSidebarOpen((v) => !v)}
                aria-label={api.isMobileSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                {api.isMobileSidebarOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
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
