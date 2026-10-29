"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/app/components/icons";
import { StepBar, type StepItem } from "@/app/components/shared/step-bar";
import { Button, Panel } from "@/app/components/ui";

/** wizard 4 ขั้น: 3 ขั้นกรอกข้อมูล + ขั้นสุดท้ายตรวจทานและบันทึก */
export function RegistryWizard({
  title,
  steps,
  initialStep,
  getStepIssues,
  completionIssues,
  renderStep,
  renderReview,
  onSaveDraft,
  onComplete,
  onExit,
  successText,
}: {
  title: string;
  steps: StepItem[];
  initialStep: number;
  getStepIssues: (step: number) => string[];
  completionIssues: string[];
  renderStep: (step: number) => ReactNode;
  renderReview: () => ReactNode;
  onSaveDraft: (step: number) => void;
  onComplete: () => void;
  onExit: () => void;
  successText: string;
}) {
  const [step, setStep] = useState(initialStep);
  const [issues, setIssues] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [done, setDone] = useState(false);
  const last = steps.length - 1;

  function goTo(next: number) {
    setIssues([]);
    setNotice("");
    setStep(next);
  }

  function next() {
    const missing = getStepIssues(step);
    if (missing.length) return setIssues(missing);
    goTo(step + 1);
  }

  function saveDraft() {
    onSaveDraft(step);
    setIssues([]);
    setNotice("บันทึกร่างแล้ว สามารถกลับมาสร้างต่อได้จากตาราง");
  }

  function complete() {
    if (completionIssues.length) return setIssues(completionIssues);
    onComplete();
    setDone(true);
  }

  if (done) {
    return (
      <Panel className="grid place-items-center gap-4 px-6 py-16 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <Icon name="circle-check" size={34} />
        </span>
        <h2 className="text-lg font-bold text-sys-900">บันทึกข้อมูลสำเร็จ</h2>
        <p className="text-sm text-slate-500">{successText}</p>
        <Button onClick={onExit}>กลับหน้าหลัก</Button>
      </Panel>
    );
  }

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-7">
        <h2 className="font-bold text-sys-900">{title}</h2>
        <span className="text-xs font-semibold text-slate-400">
          Step {step + 1} - {steps.length}
        </span>
      </div>
      <StepBar steps={steps} current={step} label={title} />
      <div className="px-5 pb-6 pt-2 sm:px-7">
        {step === last ? renderReview() : renderStep(step)}
        {issues.length > 0 && (
          <div role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            กรุณาระบุข้อมูลที่จำเป็น: {issues.join(", ")}
          </div>
        )}
        {notice && (
          <div role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
        <Button variant="quiet" onClick={onExit}>
          กลับหน้าหลัก
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={step === 0} onClick={() => goTo(step - 1)}>
            ย้อนกลับ
          </Button>
          <Button variant="secondary" onClick={saveDraft}>
            บันทึกร่าง
          </Button>
          {step === last ? (
            <Button variant="success" onClick={complete}>
              บันทึกข้อมูล
            </Button>
          ) : (
            <Button onClick={next}>ต่อไป</Button>
          )}
        </div>
      </div>
    </Panel>
  );
}
