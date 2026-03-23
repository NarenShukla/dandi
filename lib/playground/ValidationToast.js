export function ValidationToast({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.kind === "success";
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50">
      <div
        className={[
          "flex max-w-[min(100vw-2rem,360px)] items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
          isSuccess ? "bg-emerald-500 text-white" : "bg-red-500 text-white",
        ].join(" ")}
      >
        <span className="min-w-0 flex-1 leading-snug">{toast.message}</span>
      </div>
    </div>
  );
}
