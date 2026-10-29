import { getGradeColor } from "@/app/data/grade-colors";
import type { GradeCapacities } from "@/app/data/slot-capacity";
import { formatHour, formatSlot, slotHours } from "@/app/data/slot-time";
import { Panel } from "@/app/components/ui";

export interface SlotView {
  slot: string;
  closedReason?: string;
  manualClosure?: string;
  capacities: GradeCapacities;
  booked: Record<string, number>;
  customized: boolean;
}

export function GradeLegend({ grades }: { grades: string[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {grades.map((grade) => (
        <span key={grade} className="flex items-center gap-2 text-xs text-slate-500">
          <span className={`h-3 w-3 rounded ${getGradeColor(grades, grade).bar}`} />
          {grade}
        </span>
      ))}
    </div>
  );
}

function SlotCard({
  view,
  grades,
  onSelect,
  readOnly,
}: {
  view: SlotView;
  grades: string[];
  onSelect: (slot: string) => void;
  readOnly: boolean;
}) {
  if (view.closedReason) {
    return (
      <div className="flex min-h-16 items-center rounded-xl bg-slate-50 px-4 text-xs text-slate-400 [background-image:repeating-linear-gradient(135deg,transparent_0_8px,rgba(148,163,184,0.12)_8px_16px)]">
        {view.closedReason}
      </div>
    );
  }
  if (view.manualClosure !== undefined) {
    return (
      <button
        type="button"
        disabled={readOnly}
        aria-label={`ปรับความจุช่วง ${view.slot}`}
        className="flex min-h-16 w-full items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 text-left text-xs text-rose-700 enabled:hover:border-rose-300 disabled:cursor-default"
        onClick={() => onSelect(view.slot)}
      >
        <span>
          <span className="font-bold">ปิดรับ</span> · {view.manualClosure}
        </span>
        {view.customized && (
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold">
            ปรับแล้ว
          </span>
        )}
      </button>
    );
  }
  const entries = Object.entries(view.capacities);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <button
      type="button"
      disabled={readOnly}
      aria-label={`ปรับความจุช่วง ${view.slot}`}
      className="group flex min-h-16 w-full flex-col gap-2 rounded-xl border border-slate-100 bg-white p-2 text-left transition enabled:hover:border-sys-300 enabled:hover:shadow-md disabled:cursor-default sm:flex-row sm:items-stretch"
      onClick={() => onSelect(view.slot)}
    >
      <div className="flex min-w-0 flex-1 gap-1.5">
        {entries.map(([grade, capacity]) => {
          const color = getGradeColor(grades, grade);
          const booked = view.booked[grade] ?? 0;
          return (
            <div
              key={grade}
              title={`${grade}: ${capacity} คัน`}
              style={
                capacity > 0
                  ? { flex: `${capacity} 1 0%` }
                  : { flex: "0 0 2.5rem" }
              }
              className={`flex min-w-0 overflow-hidden rounded-lg ${color.soft}`}
            >
              <span className={`w-1.5 shrink-0 ${color.bar}`} />
              <span className={`min-w-0 px-2 py-1 ${color.text}`}>
                <span className="block truncate text-[11px] font-medium">{grade}</span>
                <span className="block truncate text-sm font-bold">
                  {capacity}
                  {booked > 0 && (
                    <span className="ml-1 text-[10px] font-medium opacity-70">
                      ({booked})
                    </span>
                  )}
                </span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 px-2 text-xs text-slate-400 sm:flex-col sm:justify-center">
        <span className="font-semibold text-sys-800">รวม {total} คัน</span>
        {view.customized && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            ปรับแล้ว
          </span>
        )}
      </div>
    </button>
  );
}

export function SlotCalendar({
  views,
  grades,
  onSelect,
  readOnly = false,
}: {
  views: SlotView[];
  grades: string[];
  onSelect: (slot: string) => void;
  readOnly?: boolean;
}) {
  const bySlot = new Map(views.map((view) => [view.slot, view]));
  return (
    <Panel className="p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-sys-900">ช่วงเวลารับรถ</h2>
          <p className="text-xs text-slate-400">{readOnly ? "แผนถูกบันทึกแล้ว · กด \"แก้ไขแผน\" เพื่อปรับ" : "กดที่ช่วงเวลาเพื่อปรับจำนวนรถรายเกรด · ความยาวแถบสีตามจำนวนรถ"}</p>
        </div>
        <GradeLegend grades={grades} />
      </div>
      <div className="divide-y divide-slate-100 border-y border-slate-100">
        {slotHours.map((hour) => {
          const view = bySlot.get(formatSlot(hour));
          return (
            <div key={hour} className="grid grid-cols-[3.5rem_1fr] gap-3 py-2 sm:grid-cols-[4.5rem_1fr]">
              <span className="pt-2 text-right text-xs font-medium text-slate-400">
                {formatHour(hour)}
              </span>
              {view && <SlotCard view={view} grades={grades} onSelect={onSelect} readOnly={readOnly} />}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
