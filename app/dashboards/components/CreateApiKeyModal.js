export function CreateApiKeyModal({
  name,
  nameInputRef,
  onNameChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 text-sm text-foreground shadow-2xl">
        <h3 className="text-lg font-semibold tracking-tight">Create a new API key</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Enter a name and optional usage limit for the new API key.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Key name</label>
            <input
              ref={nameInputRef}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="A unique name to identify this key"
              className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm text-foreground outline-none ring-offset-background transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                disabled
                className="h-3.5 w-3.5 rounded border border-input text-primary"
              />
              Limit monthly usage
            </label>
            <input
              type="number"
              disabled
              placeholder="1000"
              className="h-9 w-full rounded-2xl border border-border bg-muted/50 px-3 text-xs text-muted-foreground outline-none"
            />
            <p className="text-[11px] text-muted-foreground">
              *If the combined usage of all your keys exceeds your plan&apos;s limit, all requests will be
              rejected.
            </p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex h-9 items-center justify-center rounded-2xl border border-border bg-transparent px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center rounded-2xl bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
