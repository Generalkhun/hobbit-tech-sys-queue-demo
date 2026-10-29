import { getBlacklistReason } from "@/app/data/eligibility";
import { Icon } from "@/app/components/icons";
import { Button } from "@/app/components/ui";
import { FormError } from "@/app/components/booking/form-error";
import type { DeliveryVehicle } from "@/app/types/booking-form";
import type { BlacklistRecord } from "@/app/types/queue";

interface VehicleStepProps {
  vehicles: DeliveryVehicle[];
  vehicleKey: string;
  selectedVehicle?: DeliveryVehicle;
  blacklist: BlacklistRecord[];
  formError: string;
  onChooseVehicle: (vehicle: DeliveryVehicle) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

export function VehicleStep({
  vehicles,
  vehicleKey,
  selectedVehicle,
  blacklist,
  formError,
  onChooseVehicle,
  onBack,
  onNext,
  onSaveDraft,
}: VehicleStepProps) {
  return (
    <div>
      <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sys-900">เลือกรถยนต์</h3>
            <p className="mt-1 text-xs text-slate-400">
              เลือกรถที่ลงทะเบียนและผ่านการอนุมัติแล้ว
            </p>
          </div>
          <span className="text-xs text-slate-400">ขั้นตอน 2 จาก 3</span>
        </div>

        {vehicles.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => {
              const selected = vehicle.key === vehicleKey;
              const vehicleBlacklistReasons = getBlacklistReason(
                "",
                vehicle.plate,
                blacklist,
              );
              const isBlacklisted = vehicleBlacklistReasons.length > 0;
              return (
                <button
                  type="button"
                  key={vehicle.key}
                  aria-pressed={selected}
                  disabled={isBlacklisted}
                  onClick={() => onChooseVehicle(vehicle)}
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    isBlacklisted
                      ? "cursor-not-allowed border-rose-200 bg-rose-50/60 opacity-80"
                      : selected
                      ? "border-sys-500 bg-sys-50 ring-2 ring-sys-100"
                      : "border-slate-200 hover:border-sys-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                      selected
                        ? "bg-sys-600 text-white"
                        : "bg-sys-50 text-sys-700"
                    }`}
                  >
                    <Icon name="truck" size={21} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-sys-900">
                      {vehicle.plate}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500">
                      {vehicle.carrier}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                      <Icon name="shield" size={13} />
                      อนุมัติแล้ว
                    </span>
                    {isBlacklisted && (
                      <span className="mt-2 block text-[11px] font-semibold text-rose-700">
                        Blacklist: {vehicleBlacklistReasons.join(" · ")}
                      </span>
                    )}
                  </span>
                  <span
                    className={`mt-1 h-4 w-4 rounded-full border ${
                      selected
                        ? "border-[5px] border-sys-600 bg-white"
                        : "border-slate-300"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              ยังไม่มีรถที่ได้รับอนุมัติ
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ลงทะเบียนรถและรอผู้ดูแลระบบอนุมัติก่อนสร้างใบนำส่ง
            </p>
          </div>
        )}
        {selectedVehicle && (
          <div className="mt-5 flex items-center gap-3 rounded-xl bg-sys-50/70 px-4 py-3">
            <Icon name="circle-check" size={18} className="text-sys-600" />
            <p className="text-xs text-sys-800">
              เลือกรถ{" "}
              <span className="font-bold">{selectedVehicle.plate}</span>
              {" · "}
              {selectedVehicle.carrier}
            </p>
          </div>
        )}
      </div>
      <FormError
        message={formError}
        className="mx-5 mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-7"
      />
      <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-7">
        <Button variant="secondary" onClick={onBack}>
          <Icon name="arrow" size={16} className="rotate-180" />
          กลับหน้าก่อน
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onSaveDraft}>
            <Icon name="document" size={16} />
            บันทึก
          </Button>
          <Button onClick={onNext} disabled={!selectedVehicle}>
            ถัดไป: พนักงานขับรถยนต์ <Icon name="arrow" size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
