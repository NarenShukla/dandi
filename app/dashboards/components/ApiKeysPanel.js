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
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search keys…"
              className="h-10 w-full rounded-2xl border border-black/[.12] bg-transparent px-4 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:focus:border-white/40"
            />
          </div>
          <button
            type="button"
            onClick={onOpenCreate}
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
                          onChange={(e) => onUpdateName(k.id, e.target.value)}
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
  );
}
