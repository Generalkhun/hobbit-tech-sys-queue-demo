import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import { PhoneListEditor } from "@/app/components/driver/phone-list-editor";
import type { PhoneEditor } from "@/app/hooks/use-phone-editor";
import type { DriverCheckinProgress, QueueBooking } from "@/app/types/queue";

const queueSteps: {
  key: string;
  label: string;
  doneWhen: (status: QueueBooking["status"]) => boolean;
  activeWhen: (status: QueueBooking["status"]) => boolean;
}[] = [
  {
    key: "ops",
    label: "ทีม operation รับคิว",
    doneWhen: (status) =>
      ["checked-in", "at-gate", "call-requested", "called", "completed"].includes(status),
    activeWhen: (status) => status === "waiting" || status === "confirmed",
  },
  {
    key: "queued",
    label: "จัดคิวแล้ว",
    doneWhen: (status) => ["call-requested", "called", "completed"].includes(status),
    activeWhen: (status) => status === "at-gate" || status === "checked-in" || status === "no-answer",
  },
  {
    key: "security-call",
    label: "รอ รปภ. โทรเรียก",
    doneWhen: (status) => status === "completed",
    activeWhen: (status) =>
      status === "call-requested" || status === "called" || status === "no-answer",
  },
];

export function QueueView({
  progress,
  checkinBooking,
  contactPhones,
  phoneEditor,
  onOpenCheckin,
}: {
  progress: DriverCheckinProgress;
  checkinBooking: QueueBooking | undefined;
  contactPhones: string[];
  phoneEditor: PhoneEditor;
  onOpenCheckin: () => void;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() =>
    new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
  );

  function refreshStatus() {
    if (refreshing) return;
    setRefreshing(true);
    // demo: ดึงสถานะล่าสุดจากระบบ (mock) แล้วรีเฟรชข้อมูลจาก props
    window.setTimeout(() => {
      setRefreshing(false);
      setLastUpdated(
        new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    }, 600);
  }

  if (progress.step !== "complete") {
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-sys-900">
          ยังไม่ได้เช็คอิน online
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          เช็คอินและยืนยันตัวตนก่อน เพื่อติดตามสถานะรอคิว
        </p>
        <Button className="mt-6" onClick={onOpenCheckin}>
          ไปหน้าเช็คอิน online
        </Button>
      </Panel>
    );
  }

  const status = checkinBooking?.status ?? "confirmed";

  return (
    <Panel className="mx-auto max-w-2xl p-6 sm:p-10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600">
            <Icon name="clock" size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sys-900">แถบรอคิว</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              ติดตามสถานะคิวของคุณแบบ real-time
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={refreshStatus} disabled={refreshing}>
          <Icon name="refresh" size={15} />
          {refreshing ? "กำลังดึง…" : "รีเฟรช"}
        </Button>
      </div>

      {/* สถานะคิว pipeline */}
      <ol className="mt-6 space-y-3">
        {queueSteps.map((step, index) => {
          const done = step.doneWhen(status);
          const active = !done && step.activeWhen(status);
          const waiting = !done && !active;
          return (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                done
                  ? "border-emerald-100 bg-emerald-50/70"
                  : active
                    ? "border-sys-200 bg-sys-50"
                    : "border-slate-100 bg-slate-50/60 opacity-70"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-sys-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? <Icon name="circle-check" size={15} /> : index + 1}
              </span>
              <span
                className={`text-sm font-semibold ${
                  done
                    ? "text-emerald-800"
                    : active
                      ? "text-sys-800"
                      : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
              {done && (
                <span className="ml-auto text-[11px] font-medium text-emerald-600">
                  เรียบร้อย
                </span>
              )}
              {active && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] font-medium text-sys-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sys-500" />
                  กำลังดำเนินการ
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-4 text-center text-xs text-slate-400">
        สถานะล่าสุดจากระบบเมื่อ {lastUpdated} น.
      </p>

      <p className="mt-5 text-center text-sm leading-6 text-slate-500">
        กรุณารอ SYS ติดต่อกลับที่เบอร์โทรศัพท์ที่บันทึกไว้ด้านล่าง
      </p>
      <PhoneListEditor contactPhones={contactPhones} editor={phoneEditor} />
      {checkinBooking && (
        <p className="mt-5 text-center text-xs text-slate-400">
          งาน {checkinBooking.id} · {checkinBooking.plantId}
        </p>
      )}
    </Panel>
  );
}
