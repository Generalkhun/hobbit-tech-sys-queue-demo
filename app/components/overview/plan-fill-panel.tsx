import { Panel } from "@/app/components/ui";
import type { PlanFillRow } from "@/app/types/overview";

export function PlanFillPanel({
  planRows,
  canManagePlans,
  onManagePlans,
}: {
  planRows: PlanFillRow[];
  canManagePlans: boolean;
  onManagePlans: () => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h3 className="font-bold text-sys-900">แผนรับเกรด Local / Bundle</h3>
          <p className="mt-1 text-xs text-slate-400">
            เปรียบเทียบยอดจองกับปริมาณแผน เพื่อดูว่าแผนเต็มหรือยัง
          </p>
        </div>
        {canManagePlans && (
          <button
            type="button"
            onClick={onManagePlans}
            className="text-xs font-semibold text-sys-700 hover:text-sys-900"
          >
            จัดการแผนรับ
          </button>
        )}
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {planRows.map((plan) => (
          <div key={plan.id} className="rounded-xl border border-slate-100 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-sys-900">
                  {plan.plantId.replace("SYS", "SYS ")} · {plan.grade}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  เปิดรับ {plan.dailyLimit.toLocaleString("th-TH")} ตัน ·
                  จองแล้ว {(plan.reservedKg / 1000).toLocaleString("th-TH")} ตัน
                </p>
              </div>
              <span className="text-xs font-semibold text-sys-700">
                {Math.round(plan.fillPercent)}%
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${
                  plan.fillPercent >= 100 ? "bg-rose-500" : "bg-sys-500"
                }`}
                style={{ width: `${plan.fillPercent}%` }}
              />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              {plan.fillPercent >= 100 ? "เต็มแล้ว" : "ยังมีปริมาณรับเหลือ"}
            </p>
          </div>
        ))}
        {planRows.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400 sm:col-span-2">
            ไม่พบแผน Local / Bundle สำหรับโรงงานนี้
          </p>
        )}
      </div>
    </Panel>
  );
}
