import { Button, Panel } from "@/app/components/ui";

export type PlanSaveStatus = "unsaved-default" | "dirty" | "saved";

const statusStyle: Record<PlanSaveStatus, { label: string; className: string }> = {
  "unsaved-default": {
    label: "ยังไม่ได้บันทึกแผน · ระบบใช้ค่าเริ่มต้น",
    className: "bg-slate-100 text-slate-600",
  },
  dirty: {
    label: "มีการแก้ไขที่ยังไม่ได้บันทึก",
    className: "bg-amber-50 text-amber-700",
  },
  saved: {
    label: "บันทึกแผนแล้ว",
    className: "bg-emerald-50 text-emerald-700",
  },
};

export function PlanSaveBar({
  status,
  dateLabel,
  savedAt,
  locked,
  onSave,
  onEdit,
  onDiscard,
}: {
  status: PlanSaveStatus;
  dateLabel: string;
  savedAt?: string;
  locked: boolean;
  onSave: () => void;
  onEdit: () => void;
  onDiscard: () => void;
}) {
  const style = statusStyle[status];
  return (
    <Panel className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <span
          role="status"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${style.className}`}
        >
          {style.label}
        </span>
        <span className="text-xs text-slate-400">
          แผนวันที่ {dateLabel} (ทั้งสองโรงงาน)
          {savedAt && ` · บันทึกล่าสุด ${savedAt} น.`}
        </span>
      </div>
      <div className="flex gap-2">
        {locked ? (
          <Button variant="secondary" onClick={onEdit}>
            แก้ไขแผน
          </Button>
        ) : (
          <>
            {status === "dirty" && (
              <Button variant="quiet" onClick={onDiscard}>
                ยกเลิกการแก้ไข
              </Button>
            )}
            <Button onClick={onSave} disabled={status === "saved"}>
              บันทึกแผน
            </Button>
          </>
        )}
      </div>
    </Panel>
  );
}
