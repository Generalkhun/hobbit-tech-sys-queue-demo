import type { FormEvent } from "react";
import { getBlacklistReason } from "@/app/data/eligibility";
import { Icon } from "@/app/components/icons";
import { Button, FieldLabel, inputClassName } from "@/app/components/ui";
import { FormError } from "@/app/components/booking/form-error";
import type {
  DeliveryVehicle,
  EmploymentType,
} from "@/app/types/booking-form";
import type { BlacklistRecord, DriverRecord } from "@/app/types/queue";

const employmentOptions: readonly (readonly [EmploymentType, string])[] = [
  ["contractor", "พนักงานขับรถรับจ้าง"],
  ["employee", "พนักงานขับรถบริษัท"],
];

interface DriverStepProps {
  selectedVehicle?: DeliveryVehicle;
  employmentType: EmploymentType;
  availableDrivers: DriverRecord[];
  selectedDriver?: DriverRecord;
  selectedDriverBlacklistReasons: string[];
  blacklist: BlacklistRecord[];
  formError: string;
  onEmploymentTypeChange: (type: EmploymentType) => void;
  onDriverChange: (driverId: string) => void;
  onGoToRegistry: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

export function DriverStep({
  selectedVehicle,
  employmentType,
  availableDrivers,
  selectedDriver,
  selectedDriverBlacklistReasons,
  blacklist,
  formError,
  onEmploymentTypeChange,
  onDriverChange,
  onGoToRegistry,
  onSubmit,
  onBack,
  onSaveDraft,
}: DriverStepProps) {
  return (
    <form onSubmit={onSubmit}>
      <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sys-900">ข้อมูลพนักงานขับรถยนต์</h3>
            <p className="mt-1 text-xs text-slate-400">
              รถ {selectedVehicle?.plate ?? "—"} ·{" "}
              {selectedVehicle?.carrier ?? "ยังไม่ได้เลือกรถ"}
            </p>
          </div>
          <span className="text-xs text-slate-400">ขั้นตอน 3 จาก 3</span>
        </div>

        <fieldset>
          <legend className="mb-3 text-sm font-medium text-slate-700">
            ประเภทพนักงานขับรถยนต์
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {employmentOptions.map(([type, label]) => (
              <label
                key={type}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  employmentType === type
                    ? "border-sys-400 bg-sys-50/60"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="employmentType"
                  value={type}
                  checked={employmentType === type}
                  onChange={() => onEmploymentTypeChange(type)}
                  className="h-4 w-4 accent-sys-600"
                />
                <span className="text-sm font-medium text-slate-700">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-6 max-w-xl">
          <FieldLabel label="พนักงานขับรถยนต์" required>
            <select
              className={inputClassName}
              value={selectedDriver?.id ?? ""}
              onChange={(event) => onDriverChange(event.target.value)}
              disabled={availableDrivers.length === 0}
              required
            >
              {availableDrivers.length === 0 ? (
                <option value="">ไม่พบพนักงานประเภทนี้สำหรับรถที่เลือก</option>
              ) : (
                availableDrivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} · {driver.phone}
                    {getBlacklistReason(driver.id, driver.plate, blacklist)
                      .length > 0
                      ? " · ติด Blacklist"
                      : ""}
                  </option>
                ))
              )}
            </select>
          </FieldLabel>
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
            <Icon name="shield" size={13} />
            ตรวจสอบ blacklist ของรถและผู้ขับก่อนออกใบนำส่ง
          </p>
          {selectedDriverBlacklistReasons.length > 0 && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700"
            >
              ไม่สามารถใช้ผู้ขับ/รถนี้ได้:{" "}
              {selectedDriverBlacklistReasons.join(" · ")}
            </p>
          )}
          {availableDrivers.length === 0 && (
            <button
              type="button"
              onClick={onGoToRegistry}
              className="mt-3 text-xs font-semibold text-sys-600 hover:text-sys-800"
            >
              ลงทะเบียนพนักงานขับรถยนต์
            </button>
          )}
        </div>

        <FormError
          message={formError}
          className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
        />
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
        <Button type="button" variant="secondary" onClick={onBack}>
          <Icon name="arrow" size={16} className="rotate-180" />
          กลับหน้าก่อน
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onSaveDraft}>
            <Icon name="document" size={16} />
            บันทึก
          </Button>
          <Button type="submit" disabled={!selectedDriver}>
            <Icon name="check" size={16} />
            บันทึกข้อมูล
          </Button>
        </div>
      </div>
    </form>
  );
}
