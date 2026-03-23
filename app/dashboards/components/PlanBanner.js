import { DEFAULT_PLAN } from "@/lib/apiKeys/constants";

export function PlanBanner() {
  return (
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
  );
}
