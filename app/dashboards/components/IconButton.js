export function IconButton({ label, onClick, children, variant = "default" }) {
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border text-foreground transition-colors";
  const styles =
    variant === "danger"
      ? "border-destructive/40 hover:border-destructive/60 hover:bg-destructive/10"
      : "border-border bg-background hover:bg-muted";
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
