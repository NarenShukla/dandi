import { CheckIcon, TrashIcon } from "./icons";

export function DashboardToast({ toast }) {
  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[65] sm:top-24">
      <div
        className={[
          "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium shadow-lg backdrop-blur",
          toast.kind === "delete"
            ? "bg-red-500 text-white"
            : "bg-emerald-500 text-white",
        ].join(" ")}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/10">
          {toast.kind === "delete" ? (
            <TrashIcon className="h-4 w-4" />
          ) : (
            <CheckIcon className="h-4 w-4" />
          )}
        </span>
        <span className="max-w-[260px] truncate">{toast.message}</span>
      </div>
    </div>
  );
}
