import { Button, Panel } from "@/app/components/ui";
import { DetailGrid } from "@/app/components/driver/detail-grid";
import { WorkDetails } from "@/app/components/driver/work-details";
import type { DriverRecord, QueueBooking } from "@/app/types/queue";

export function ReviewStep({
  booking,
  driver,
  onBack,
  onConfirm,
}: {
  booking: QueueBooking;
  driver: DriverRecord;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-5">
      <Panel className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-sys-900">ตรวจสอบข้อมูลงาน</h2>
        <p className="mt-1 text-xs text-slate-500">
          ตรวจสอบรายละเอียดใบนำส่งและข้อมูลผู้ขับ/รถก่อนยืนยัน
        </p>
        <div className="mt-5">
          <WorkDetails booking={booking} />
        </div>
      </Panel>
      <Panel className="p-5 sm:p-6">
        <h3 className="font-bold text-sys-900">ประวัติคนขับและเอกสาร</h3>
        <DetailGrid
          className="mt-4 "
          items={[
            ["ชื่อคนขับ", driver.name],
            ["บัตรประชาชน", driver.nationalIdMasked ?? "ไม่มีข้อมูล"],
            ["ใบอนุญาตขับขี่", driver.licenseNumber ?? "ไม่มีข้อมูล"],
            ["ประวัติคนขับ", driver.drivingHistory ?? "ไม่มีข้อมูล"],
            ["บริษัทขนส่ง", driver.carrier],
            ["ทะเบียนรถ", `${driver.plate} · ${driver.employmentType === "employee" ? "พนักงานบริษัท" : "พนักงานรับจ้าง"}`],
          ]}
        />
        <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ข้อมูลบัตรและประวัติเป็นข้อมูลตัวอย่างสำหรับ demo
        </p>
        <div className="mt-5 flex justify-between gap-3">
          <Button variant="secondary" onClick={onBack}>
            กลับ
          </Button>
          <Button onClick={onConfirm}>ข้อมูลถูกต้อง · ต่อไป</Button>
        </div>
      </Panel>
    </div>
  );
}
