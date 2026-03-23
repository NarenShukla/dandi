export function CreateApiKeyModal({
  name,
  nameInputRef,
  onNameChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 text-sm shadow-2xl dark:bg-zinc-950">
        <h3 className="text-lg font-semibold tracking-tight">Create a new API key</h3>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Enter a name and optional usage limit for the new API key.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-200">
              Key name
            </label>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="A unique name to identify this key"
              className="h-10 w-full rounded-2xl border border-black/[.12] bg-transparent px-3 text-sm outline-none transition-colors focus:border-black/30 dark:border-white/[.18] dark:focus:border-white/40"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-200">
              <input
                type="checkbox"
                disabled
                className="h-3.5 w-3.5 rounded border border-black/[.18] text-foreground"
              />
              Limit monthly usage
            </label>
            <input
              type="number"
              disabled
              placeholder="1000"
              className="h-9 w-full rounded-2xl border border-black/[.08] bg-black/[.02] px-3 text-xs text-zinc-500 outline-none dark:border-white/[.12] dark:bg-white/[.03]"
            />
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              *If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be
              rejected.
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-black/[.08] bg-transparent px-4 text-xs font-medium text-zinc-800 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-100 dark:hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
