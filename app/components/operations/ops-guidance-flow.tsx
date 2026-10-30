"use client";

import { Icon } from "@/app/components/icons";

/**
 * แผนภาพขั้นตอนการจัดการการจัดส่ง (Delivery Management Flow)
 * ใช้ภาพผังขั้นตอนมาตรฐานของระบบ (public/dmf-flow.png)
 */
export function OpsGuidanceFlow() {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
          <Icon name="truck" size={20} />
        </div>
        <div>
          <h2 className="font-bold text-sys-900">ขั้นตอนการจัดการการจัดส่ง</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            สถานะของรถแต่ละคันจะเคลื่อนไปตามผังนี้ — ทุกขั้นตอนบันทึกเป็นประวัติ
          </p>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dmf-flow.png"
        alt="ผังขั้นตอนการจัดการการจัดส่ง (Delivery Management Flow)"
        className="mx-auto w-full max-w-5xl rounded-xl"
      />
    </div>
  );
}
