"use client";

import { Icon } from "@/app/components/icons";

type NodeState = "idle" | "active" | "done";

function Node({
  num,
  label,
  state,
  tone = "sys",
}: {
  num?: string;
  label: string;
  state: NodeState;
  tone?: "sys" | "emerald" | "amber" | "violet" | "rose" | "sky";
}) {
  const tones: Record<string, string> = {
    sys: "border-sys-200 bg-sys-50 text-sys-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    rose: "border-rose-200 bg-rose-50 text-rose-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
  };
  const activeTone = "border-sys-400 bg-sys-600 text-white";
  const doneTone = "border-emerald-300 bg-emerald-500 text-white";
  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-sm ${
        state === "active" ? activeTone : state === "done" ? doneTone : tones[tone]
      }`}
    >
      {num && (
        <span
          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${
            state === "active" || state === "done"
              ? "bg-white/25 text-white"
              : "bg-white text-slate-500"
          }`}
        >
          {state === "done" ? <Icon name="check" size={11} /> : num}
        </span>
      )}
      {label}
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex justify-center py-0.5 text-slate-300">
      <Icon name="chevron" size={14} className="rotate-90" />
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="flex items-center px-1 text-slate-300">
      <Icon name="chevron" size={14} className="rotate-180" />
    </div>
  );
}

function Branch({
  left,
  right,
}: {
  left: { label: string; state: NodeState };
  right: { label: string; state: NodeState };
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-semibold text-slate-400">ทางเลือก 1</span>
        </div>
        <Node num="2.1" label={left.label} state={left.state} tone="sky" />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[10px] font-semibold text-slate-400">ทางเลือก 2</span>
        </div>
        <Node num="2.2" label={right.label} state={right.state} tone="sky" />
      </div>
    </div>
  );
}

/**
 * แผนภาพขั้นตอนการจัดการการจัดส่ง (guidance flow สำหรับ ปศ.)
 * 1 ยังไม่ check-in → (2.1 check-in online | 2.2 check-in ที่ รปภ) → 3 รอจัดคิว
 * → 4 รอเรียก → 5 Operation แจ้ง รปภ แล้ว → (6.1 รปภ. โทรเรียกแล้ว → 7 ผ่าน รปภ)
 * | (6.2 รปภ โทรแล้วไม่รับ ↺ กลับ 3 รอจัดคิว)
 */
export function OpsGuidanceFlow({
  stage,
}: {
  /** stage ปัจจุบันของสถานะที่กำลังดู เพื่อไฮไลต์ */
  stage?: "pre-checkin" | "checkin" | "queueing" | "calling" | "passed";
}) {
  const is = (name?: string) => (stage === name ? "active" : "idle") as NodeState;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
          <Icon name="truck" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-sys-900">ขั้นตอนการจัดการการจัดส่ง</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            สถานะของรถแต่ละคันจะเคลื่อนไปตามแผนภาพนี้ — ทุกขั้นตอนบันทึกเป็นประวัติ
          </p>
        </div>
      </div>

      <div className="flex flex-col items-stretch gap-1.5 lg:flex-row lg:items-center lg:gap-3">
        {/* 1 */}
        <Node num="1" label="ยังไม่ check-in" state={stage === "pre-checkin" ? "active" : "idle"} />
        <ArrowRight />
        {/* 2.1 / 2.2 */}
        <Branch
          left={{ label: "check-in online", state: is("checkin") }}
          right={{ label: "check-in ที่ รปภ.", state: is("checkin") }}
        />
        <ArrowRight />
        {/* 3 */}
        <Node num="3" label="รอจัดคิว" state={stage === "queueing" ? "active" : "idle"} tone="amber" />
        <ArrowRight />
        {/* 4 */}
        <Node num="4" label="รอเรียก" state={stage === "queueing" ? "active" : "idle"} tone="amber" />
        <ArrowRight />
        {/* 5 */}
        <Node
          num="5"
          label="Operation แจ้ง รปภ แล้ว"
          state={stage === "calling" ? "active" : "idle"}
          tone="violet"
        />
        <ArrowRight />
        {/* 6.1 / 6.2 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold text-slate-400">โทรแล้วรับสาย</span>
            </div>
            <Node num="6.1" label="รปภ. โทรเรียกแล้ว" state={is("calling")} tone="violet" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[10px] font-semibold text-slate-400">โทรแล้วไม่รับ</span>
            </div>
            <Node num="6.2" label="รปภ. โทรแล้วไม่รับ" state="idle" tone="rose" />
          </div>
        </div>
        <ArrowRight />
        {/* 7 */}
        <Node num="7" label="ผ่าน รปภ แล้ว" state={stage === "passed" ? "active" : "idle"} tone="emerald" />
      </div>

      {/* 6.2 วนกลับ 3 */}
      <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <Icon name="refresh" size={12} className="text-rose-400" />
        <span>
          <span className="font-semibold text-rose-500">รปภ. โทรแล้วไม่รับ</span> → วนกลับไปรอ
          จัดคิวใหม่ (กด {"“"}กลับมารอคิว{"”"} ที่รายการ)
        </span>
      </div>
    </div>
  );
}