export function IconButton({ label, onClick, children, variant = "default" }) {
  const base =
    "inline-flex h-9 w-9 items-center justify-center rounded-full border text-zinc-900 transition-colors dark:text-zinc-50";
  const styles =
    variant === "danger"
      ? "border-red-500/30 hover:border-transparent hover:bg-red-500/10"
      : "border-black/[.08] hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a]";
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}
