import type { ReactNode } from "react";
import { Icon, type IconName } from "@/app/components/icons";

export function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
          <Icon name={icon} size={19} />
        </div>
        <div>
          <h2 className="font-bold text-sys-900">{title}</h2>
          {description && (
            <p className="mt-1 text-xs text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
