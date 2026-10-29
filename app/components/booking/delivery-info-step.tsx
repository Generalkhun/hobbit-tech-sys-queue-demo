import type { FormEvent } from "react";
import { demoDate } from "@/app/data/mock-data";
import { retailerNames } from "@/app/data/booking-form";
import { bookableSlots } from "@/app/data/slot-time";
import { Icon } from "@/app/components/icons";
import {
  Button,
  FieldLabel,
  inputClassName,
} from "@/app/components/ui";
import { FormError } from "@/app/components/booking/form-error";
import { PolicyConsent } from "@/app/components/booking/policy-consent";
import { TicketUpload } from "@/app/components/booking/ticket-upload";
import { WeightInput } from "@/app/components/booking/weight-input";
import type { DeliveryFormValues } from "@/app/types/booking-form";
import type { DemoUser } from "@/app/types/queue";

interface DeliveryInfoStepProps {
  form: DeliveryFormValues;
  onFormChange: (patch: Partial<DeliveryFormValues>) => void;
  role: DemoUser["role"];
  heavyWeight: number;
  lightWeight: number;
  hasValidWeights: boolean;
  shopHasAcknowledged: boolean;
  privacyAccepted: boolean;
  dataUseAccepted: boolean;
  onPrivacyChange: (accepted: boolean) => void;
  onDataUseChange: (accepted: boolean) => void;
  formError: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSaveDraft: () => void;
}

export function DeliveryInfoStep({
  form,
  onFormChange,
  role,
  heavyWeight,
  lightWeight,
  hasValidWeights,
  shopHasAcknowledged,
  privacyAccepted,
  dataUseAccepted,
  onPrivacyChange,
  onDataUseChange,
  formError,
  onSubmit,
  onSaveDraft,
}: DeliveryInfoStepProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-bold text-sys-900">ข้อมูลการจัดส่ง</h3>
          <span className="text-xs text-slate-400">ขั้นตอน 1 จาก 3</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FieldLabel label="ร้านค้าของเก่า" required>
            <select
              className={inputClassName}
              value={form.retailer}
              onChange={(event) =>
                onFormChange({ retailer: event.target.value })
              }
              disabled={role === "retailer"}
              required
            >
              {retailerNames.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </FieldLabel>
          <FieldLabel label="ผู้ขายเศษเหล็ก / นายหน้า">
            <select
              className={inputClassName}
              value={form.broker}
              onChange={(event) => onFormChange({ broker: event.target.value })}
            >
              <option>—</option>
              <option>บริษัท เอส.เอส. เมทัล</option>
              <option>หจก. รุ่งกิจรีไซเคิล</option>
            </select>
          </FieldLabel>
          <div className="rounded-xl border border-sys-100 bg-sys-50/60 p-3.5">
            <p className="text-xs font-medium text-slate-500">
              โรงงานปลายทาง · ระบบจัดสรรอัตโนมัติ
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              ระบบจะเลือกโรงงานและจัดสรรคิวที่เหมาะสมให้โดยอัตโนมัติ
            </p>
          </div>
          <FieldLabel label="เกรดเศษเหล็ก" required>
            <select
              className={inputClassName}
              value={form.grade}
              onChange={(event) => onFormChange({ grade: event.target.value })}
              required
            >
              <option>Bundle SY</option>
              <option>Local O</option>
              <option>Scrap Return SP</option>
              <option>PM Scrap L1</option>
              <option>Scrap (D)</option>
            </select>
          </FieldLabel>
          <FieldLabel label="วันที่ส่ง" required>
            <input
              className={inputClassName}
              type="date"
              value={form.date}
              min={demoDate}
              onChange={(event) => onFormChange({ date: event.target.value })}
              required
            />
          </FieldLabel>
          <FieldLabel label="ช่วงเวลาจอง" required>
            <select
              className={inputClassName}
              value={form.timeSlot}
              onChange={(event) =>
                onFormChange({ timeSlot: event.target.value })
              }
              required
            >
              {bookableSlots.map((slot) => (
                <option key={slot}>{slot}</option>
              ))}
            </select>
          </FieldLabel>
          <WeightInput
            label="น้ำหนักชั่งหนัก (กิโลกรัม)"
            value={form.heavyWeightKg}
            onChange={(heavyWeightKg) => onFormChange({ heavyWeightKg })}
          />
          <WeightInput
            label="น้ำหนักชั่งเบา (กิโลกรัม)"
            value={form.lightWeightKg}
            onChange={(lightWeightKg) => onFormChange({ lightWeightKg })}
          />
        </div>

        <div className="mt-3 text-xs text-slate-500">
          น้ำหนักสุทธิ:{" "}
          {Math.max(0, heavyWeight - lightWeight).toLocaleString("th-TH")}{" "}
          กิโลกรัม (ชั่งหนัก − ชั่งเบา)
        </div>

        {!shopHasAcknowledged && (
          <PolicyConsent
            role={role}
            privacyAccepted={privacyAccepted}
            dataUseAccepted={dataUseAccepted}
            onPrivacyChange={onPrivacyChange}
            onDataUseChange={onDataUseChange}
          />
        )}

        <TicketUpload
          ticketName={form.ticketName}
          onChange={(ticketName) => onFormChange({ ticketName })}
        />
      </div>

      <FormError
        message={formError}
        className="mx-5 mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-7"
      />
      <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
        <Button type="button" variant="secondary" onClick={onSaveDraft}>
          <Icon name="document" size={16} />
          บันทึก
        </Button>
        <Button type="submit" disabled={!hasValidWeights}>
          ถัดไป: รถยนต์ <Icon name="arrow" size={16} />
        </Button>
      </div>
    </form>
  );
}
