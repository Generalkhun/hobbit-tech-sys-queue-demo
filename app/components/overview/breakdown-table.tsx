import { Panel } from "@/app/components/ui";
import { formatKg } from "@/app/data/overview";
import type { BreakdownBy, BreakdownRow } from "@/app/types/overview";

const breakdownLabels: Record<BreakdownBy, string> = {
  grade: "เกรด",
  seller: "ผู้ขาย",
  retailer: "ร้านค้า",
};

export function BreakdownTable({
  rows,
  breakdownBy,
  onBreakdownChange,
}: {
  rows: BreakdownRow[];
  breakdownBy: BreakdownBy;
  onBreakdownChange: (group: BreakdownBy) => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h3 className="font-bold text-sys-900">รายละเอียดตามมิติ</h3>
          <p className="mt-1 text-xs text-slate-400">
            ปริมาณจอง, มาส่งแล้ว, ยกเลิก และยังไม่มาส่ง
          </p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1">
          {(Object.keys(breakdownLabels) as BreakdownBy[]).map((group) => (
            <button
              type="button"
              key={group}
              onClick={() => onBreakdownChange(group)}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${
                breakdownBy === group
                  ? "bg-white text-sys-800 shadow-sm"
                  : "text-slate-500"
              }`}
            >
              {breakdownLabels[group]}
            </button>
          ))}
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-500">
            <tr>
              <th className="px-6 py-3">รายการ</th>
              <th className="px-4 py-3">จอง</th>
              <th className="px-4 py-3">มาส่งแล้ว</th>
              <th className="px-4 py-3">ยกเลิก</th>
              <th className="px-6 py-3">ยังไม่มาส่ง</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(([label, row]) => (
              <tr key={label}>
                <td className="px-6 py-3.5 font-medium text-slate-700">{label}</td>
                <td className="px-4 py-3.5">{formatKg(row.booked)}</td>
                <td className="px-4 py-3.5 text-emerald-700">{formatKg(row.received)}</td>
                <td className="px-4 py-3.5 text-amber-700">{formatKg(row.noShow)}</td>
                <td className="px-6 py-3.5 text-violet-700">{formatKg(row.late)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                  ไม่มีข้อมูลในวันที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
