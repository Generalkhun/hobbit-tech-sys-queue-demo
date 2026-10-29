import { registryStatusLabels } from "@/app/data/registry";
import type { RegistryStatus } from "@/app/types/registry";

const tones: Record<RegistryStatus, string> = {
  draft: "bg-amber-50 text-amber-700",
  pending: "bg-sky-50 text-sky-700",
  active: "bg-emerald-50 text-emerald-700",
  suspended: "bg-rose-50 text-rose-700",
};

const dots: Record<RegistryStatus, string> = {
  draft: "bg-amber-400",
  pending: "bg-sky-400",
  active: "bg-emerald-500",
  suspended: "bg-rose-500",
};

export function RegistryStatusBadge({ status }: { status: RegistryStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${tones[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status]}`} />
      {registryStatusLabels[status]}
    </span>
  );
}
