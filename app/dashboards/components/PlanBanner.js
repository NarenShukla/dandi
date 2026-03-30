import { DEFAULT_PLAN } from "@/lib/apiKeys/constants";

export function PlanBanner() {
  return (
    <section className="mt-6 rounded-3xl border border-primary/25 bg-gradient-to-r from-primary via-accent to-primary p-6 text-primary-foreground shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="text-[11px] font-semibold tracking-wider text-primary-foreground/80">
            CURRENT PLAN
          </div>
          <div className="text-3xl font-semibold tracking-tight">{DEFAULT_PLAN.name}</div>
        </div>
        <div className="text-xs text-primary-foreground/80">API limit</div>
      </div>
      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-primary-foreground/20">
          <div className="h-full w-[18%] rounded-full bg-primary-foreground/90" />
        </div>
        <div className="mt-2 text-xs text-primary-foreground/80">
          24 / {DEFAULT_PLAN.apiLimit.toLocaleString()} requests
        </div>
      </div>
    </section>
  );
}
