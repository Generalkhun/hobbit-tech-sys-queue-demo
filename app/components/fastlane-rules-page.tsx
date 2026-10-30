"use client";

import { useState } from "react";
import { getFastlaneRule, updateFastlaneRule } from "@/app/data/fastlane";
import { Button, Panel } from "@/app/components/ui";
import { Icon } from "@/app/components/icons";

export function FastlaneRulesPage({ userName }: { userName: string }) {
  const rule = getFastlaneRule();
  const [consecutiveOnTimeThreshold, setConsecutiveOnTimeThreshold] = useState(
    rule.consecutiveOnTimeThreshold,
  );
  const [noShowLimit, setNoShowLimit] = useState(rule.noShowLimit);
  const [lateTolerance, setLateTolerance] = useState(rule.lateTolerance);
  const [saved, setSaved] = useState(false);

  const dirty =
    consecutiveOnTimeThreshold !== rule.consecutiveOnTimeThreshold ||
    noShowLimit !== rule.noShowLimit ||
    lateTolerance !== rule.lateTolerance;

  function save() {
    updateFastlaneRule(
      {
        consecutiveOnTimeThreshold,
        noShowLimit,
        lateTolerance,
      },
      userName,
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name="sparkle" size={19} />
          </div>
          <div>
            <h2 className="font-bold text-sys-900">ตั้งค่ากติกา Fastlane</h2>
            <p className="mt-1 text-xs text-slate-400">
              ปรับเปลี่ยนเกณฑ์สำหรับการคำนวณสถานะ RP (Fastlane / Normal / Limited)
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h3 className="mb-4 font-bold text-sys-900">เกณฑ์การปรับสถานะ</h3>
        <div className="space-y-5">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>
              จำนวนครั้งที่จองแล้วมาตามนัดติดต่อกัน
              <span className="text-slate-400"> (เพื่อได้ Fastlane)</span>
            </span>
            <input
              type="number"
              min={1}
              max={50}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
              value={consecutiveOnTimeThreshold}
              onChange={(e) =>
                setConsecutiveOnTimeThreshold(Number(e.target.value))
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>
              จำนวนครั้งที่เบี้ยว (No-show)
              <span className="text-slate-400"> (ถึงเกณฑ์จะถูกปรับเป็น Limited)</span>
            </span>
            <input
              type="number"
              min={1}
              max={20}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
              value={noShowLimit}
              onChange={(e) => setNoShowLimit(Number(e.target.value))}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            <span>
              จำนวนครั้งที่สายที่ยอมรับได้
              <span className="text-slate-400"> (เกินเกณฑ์จะถูกปรับเป็น Limited)</span>
            </span>
            <input
              type="number"
              min={0}
              max={20}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
              value={lateTolerance}
              onChange={(e) => setLateTolerance(Number(e.target.value))}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button disabled={!dirty} onClick={save}>
            บันทึกการตั้งค่า
          </Button>
          {saved && (
            <span className="text-sm font-semibold text-emerald-600">
              บันทึกเรียบร้อย
            </span>
          )}
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <h3 className="mb-3 font-bold text-sys-900">คำอธิบายสถานะ RP</h3>
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              Fastlane
            </span>
            <span>ร้านค้าหรือผู้ขายที่มาสม่ำเสมอตรงเวลา จะได้เป็น Quality Lead</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-inset ring-sky-200">
              Normal
            </span>
            <span>สถานะปกติสำหรับร้านค้าหรือผู้ขายทั่วไป</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
              Limited
            </span>
            <span>ถูกจำกัดปริมาณการจองเนื่องจากเบี้ยวหรือสายบ่อย</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}