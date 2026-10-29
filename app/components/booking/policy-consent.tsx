import { policyVersion } from "@/app/data/mock-data";
import type { DemoUser } from "@/app/types/queue";

interface PolicyConsentProps {
  role: DemoUser["role"];
  privacyAccepted: boolean;
  dataUseAccepted: boolean;
  onPrivacyChange: (accepted: boolean) => void;
  onDataUseChange: (accepted: boolean) => void;
}

export function PolicyConsent({
  role,
  privacyAccepted,
  dataUseAccepted,
  onPrivacyChange,
  onDataUseChange,
}: PolicyConsentProps) {
  return (
    <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
      <p className="text-sm font-semibold text-amber-900">
        ต้องรับทราบนโยบาย PDPA ก่อนสร้างใบนำส่ง
      </p>
      {role === "retailer" ? (
        <div className="mt-3 space-y-2.5 text-xs text-amber-900">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(event) => onPrivacyChange(event.target.checked)}
              className="mt-0.5 accent-amber-700"
            />
            ข้าพเจ้ารับทราบประกาศคุ้มครองข้อมูลส่วนบุคคล ฉบับ {policyVersion}
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={dataUseAccepted}
              onChange={(event) => onDataUseChange(event.target.checked)}
              className="mt-0.5 accent-amber-700"
            />
            ข้าพเจ้ายอมรับการใช้ข้อมูลส่วนบุคคลตามวัตถุประสงค์และระยะเวลาที่แจ้ง ฉบับ {policyVersion}
          </label>
          <p className="text-[11px] text-amber-800">
            ระบบจะบันทึกบัญชีผู้ยอมรับ เวลา และเวอร์ชันของเอกสารทั้งสองฉบับ
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs leading-5 text-amber-800">
          กรุณาให้ผู้ใช้ร้านค้าเข้าสู่ระบบและกดยอมรับด้วยตนเองก่อน
          นายหน้า/Admin จึงจะสร้างใบนำส่งแทนร้านนี้ได้
        </p>
      )}
    </div>
  );
}
