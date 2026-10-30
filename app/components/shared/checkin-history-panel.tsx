import { Panel } from "@/app/components/ui";
import { formatDateTime } from "@/app/data/format";
import type { CheckinLog } from "@/app/types/queue";

export function CheckinHistoryPanel({
  logs,
  title = "ประวัติการเช็คอิน",
  emptyText = "ยังไม่มีประวัติการเช็คอิน",
}: {
  logs: CheckinLog[];
  title?: string;
  emptyText?: string;
}) {
  if (logs.length === 0) {
    return (
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="font-bold text-sys-900">{title}</h3>
        </div>
        <p className="px-6 py-12 text-center text-sm text-slate-400">
          {emptyText}
        </p>
      </Panel>
    );
  }

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="font-bold text-sys-900">{title}</h3>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-3.5">วัน-เวลา</th>
              <th className="px-4 py-3.5">วันที่จอง</th>
              <th className="px-4 py-3.5">ช่วงเวลา</th>
              <th className="px-4 py-3.5">ทะเบียนรถ</th>
              <th className="px-4 py-3.5">คนขับ</th>
              <th className="px-4 py-3.5">สถานะ</th>
              <th className="px-4 py-3.5">สาย (นาที)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                  {formatDateTime(log.recordedAt)}
                </td>
                <td className="px-4 py-4 text-slate-500">{log.scheduledDate}</td>
                <td className="px-4 py-4 text-slate-500">{log.scheduledTimeSlot}</td>
                <td className="px-4 py-4 text-slate-500">{log.plate}</td>
                <td className="px-4 py-4 text-slate-500">{log.driverName}</td>
                <td className="px-4 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      log.status === "on-time"
                        ? "bg-emerald-50 text-emerald-700"
                        : log.status === "late"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {log.status === "on-time"
                      ? "มาตรงเวลา"
                      : log.status === "late"
                        ? "สาย"
                        : "ไม่มา"}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {log.status === "late" ? `${log.lateMinutes} นาที` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}