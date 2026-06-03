import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Suspended: "bg-rose-50 text-rose-700 ring-rose-200",
  Available: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Occupied: "bg-amber-50 text-amber-700 ring-amber-200",
  Reserved: "bg-sky-50 text-sky-700 ring-sky-200",
  open: "bg-sky-50 text-sky-700 ring-sky-200",
  closed: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  ready: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export function StatusPill({ value }: { value: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold ring-1",
        styles[value] ?? "bg-slate-100 text-slate-700 ring-slate-200",
      )}
    >
      {value}
    </span>
  );
}
