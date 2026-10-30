import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import { formatKg, type OverviewMetrics } from "@/app/data/overview";

type IconName = Parameters<typeof Icon>[0]["name"];

interface StatCard {
  label: string;
  value: string;
  icon: IconName;
  color: string;
  description: string;
}

export function OverviewStatCards({ metrics }: { metrics: OverviewMetrics }) {
  const stats: StatCard[] = [
    {
      label: "ปริมาณจอง",
      value: formatKg(metrics.bookedKg),
      icon: "calendar",
      color: "bg-sys-50 text-sys-700",
      description: `${metrics.scheduledBookings.length} ใบ · ตามวันที่จอง`,
    },
    {
      label: "มาส่งแล้ว",
      value: formatKg(metrics.receivedKg),
      icon: "circle-check",
      color: "bg-emerald-50 text-emerald-700",
      description: `${metrics.receivedOnDate.length} ใบ · ผ่านป้อมแล้ว`,
    },
    {
      label: "ยกเลิก",
      value: formatKg(metrics.noShowKg),
      icon: "close",
      color: "bg-rose-50 text-rose-700",
      description: `${metrics.noShowBookings.length} ใบ · ยกเลิกการจอง`,
    },
    {
      label: "ยังไม่มาส่ง",
      value: formatKg(
        Math.max(0, metrics.bookedKg - metrics.receivedKg - metrics.noShowKg),
      ),
      icon: "clock",
      color: "bg-amber-50 text-amber-700",
      description: `${
        metrics.scheduledBookings.length -
        metrics.receivedOnDate.length -
        metrics.noShowBookings.length
      } ใบ · ยังไม่ผ่านป้อม`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      {stats.map((stat) => (
        <Panel key={stat.label} className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-sys-900">
                {stat.value}
              </p>
            </div>
            <div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.color}`}>
              <Icon name={stat.icon} size={19} />
            </div>
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">
            {stat.description}
          </p>
        </Panel>
      ))}
    </div>
  );
}
