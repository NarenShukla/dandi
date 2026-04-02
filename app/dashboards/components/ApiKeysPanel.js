import { clampInt, formatCompactInt, maskKey } from "@/lib/apiKeys/format";
import { IconButton } from "./IconButton";
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
  TrashIcon,
} from "./icons";

export function ApiKeysPanel({
  keys,
  filtered,
  query,
  onQueryChange,
  revealed,
  onOpenCreate,
  onUpdateName,
  onToggleReveal,
  onCopy,
  onRegenerate,
  onRemove,
}) {
  return (
    <section className="mt-8 rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-foreground">API Keys</h2>
            <span className="text-xs text-muted-foreground">
              {filtered.length} shown / {keys.length} total
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            The key is used to authenticate your requests. Keys are stored in your browser’s localStorage for now.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <div className="w-full sm:w-64">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search keys…"
              className="h-10 w-full rounded-2xl border border-input bg-background px-4 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            + Create
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Usage</th>
              <th className="px-5 py-3">Key</th>
              <th className="px-5 py-3 text-right">Options</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td className="px-5 py-10 text-sm text-muted-foreground" colSpan={4}>
                  No API keys yet. Add one above.
                </td>
              </tr>
            ) : (
              filtered.map((k) => {
                const isRevealed = revealed.has(k.id);
                const displayKey = isRevealed ? k.key : maskKey(k.key);
                const usage = clampInt(k.usage, 0);
                const cap = k.limit != null ? clampInt(k.limit, 0) : null;
                const usageLabel =
                  cap != null ? `${formatCompactInt(usage)} / ${formatCompactInt(cap)}` : formatCompactInt(usage);
                return (
                  <tr key={k.id} className="align-top">
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <input
                          value={k.name ?? ""}
                          onChange={(e) => onUpdateName(k.id, e.target.value)}
                          className="h-10 w-full max-w-[260px] rounded-2xl border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
                          aria-label="API key name"
                        />
                        <div className="text-[11px] text-muted-foreground">
                          Created {new Date(k.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground">
                      {usageLabel}
                      {cap != null ? (
                        <span className="mt-1 block text-[11px] text-muted-foreground">Usage / limit</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-4">
                      <code className="inline-flex max-w-[420px] rounded-2xl bg-muted px-3 py-2 text-xs text-foreground">
                        {displayKey}
                      </code>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          label={isRevealed ? "Hide key" : "Reveal key"}
                          onClick={() => onToggleReveal(k.id)}
                        >
                          {isRevealed ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </IconButton>
                        <IconButton label="Copy key" onClick={() => onCopy(k.key)}>
                          <CopyIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Regenerate key" onClick={() => onRegenerate(k.id)}>
                          <RefreshIcon className="h-4 w-4" />
                        </IconButton>
                        <IconButton label="Delete key" variant="danger" onClick={() => onRemove(k.id)}>
                          <TrashIcon className="h-4 w-4 text-destructive" />
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
  );
}
