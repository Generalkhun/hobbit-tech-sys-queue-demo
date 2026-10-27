import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name="settings" size={19} />
          </div>
          <div>
            <h2 className="font-bold text-sys-900">ตั้งค่าระบบ</h2>
            <p className="mt-1 text-xs text-slate-400">
              การตั้งค่าพื้นฐานสำหรับการจัดการคิว
            </p>
          </div>
        </div>
        <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
          {[
            ["การแจ้งเตือนคิว", "แจ้งเตือนเมื่อมีรถจองหรือมาถึงสถานี รปภ."],
            ["โรงงานที่ให้บริการ", "SYS 1 · อ.บางปะอิน และ SYS 2 · อ.วังน้อย"],
            ["เวลาทำการ", "จันทร์–เสาร์ · 08:00–17:00 น."],
          ].map(([title, detail]) => (
            <div
              key={title}
              className="flex flex-wrap items-center justify-between gap-3 py-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{detail}</p>
              </div>
              <span className="rounded-full bg-sys-50 px-3 py-1 text-[10px] font-semibold text-sys-700">
                Demo
              </span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
