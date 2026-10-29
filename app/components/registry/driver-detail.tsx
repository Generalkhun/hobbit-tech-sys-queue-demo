"use client";

import { Avatar } from "@/app/components/avatar";
import { DocumentGallery, InfoGrid } from "@/app/components/registry/info-grid";
import { RegistryDetailShell } from "@/app/components/registry/registry-detail-shell";
import { Panel } from "@/app/components/ui";
import {
  buildStatusRows,
  employmentLabels,
  maskNationalId,
} from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  DriverRecord,
  RegistryStatusAction,
  RegistryStatusRecord,
} from "@/app/types/registry";

export function DriverDetail({
  driver,
  records,
  canChangeStatus,
  onBack,
  onStatusChange,
}: {
  driver: DriverRecord;
  records: RegistryStatusRecord[];
  canChangeStatus: boolean;
  onBack: () => void;
  onStatusChange: (action: RegistryStatusAction, value: NoteWithAttachments) => void;
}) {
  return (
    <RegistryDetailShell
      backLabel="กลับไปรายการพนักงานขับรถยนต์"
      name={driver.name}
      subtitle={`${driver.id} · ${employmentLabels[driver.employmentType]}`}
      avatar={<Avatar name={driver.name} src={driver.photo} size={72} />}
      status={driver.status}
      canChangeStatus={canChangeStatus}
      historyRows={buildStatusRows(records, driver.id)}
      onBack={onBack}
      onStatusChange={onStatusChange}
    >
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <h3 className="mb-4 font-bold text-sys-900">ข้อมูลพนักงาน</h3>
          <InfoGrid
            items={[
              { label: "ชื่อ-นามสกุล", value: driver.name },
              { label: "ประเภทผู้ขับ", value: employmentLabels[driver.employmentType] },
              { label: "ร้านค้า", value: driver.shopName },
              { label: "บริษัทขนส่ง", value: driver.carrier },
              { label: "เลขบัตรประชาชน", value: maskNationalId(driver.nationalId) },
              { label: "เลขใบอนุญาตขับขี่", value: driver.licenseNumber },
              { label: "เบอร์โทรศัพท์", value: driver.phone },
              { label: "อีเมล", value: driver.email },
              { label: "ทะเบียนรถประจำ", value: driver.plate },
              { label: "ประวัติการขับขี่", value: driver.drivingHistory },
            ]}
          />
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h3 className="mb-4 font-bold text-sys-900">เอกสารประจำตัว</h3>
          <DocumentGallery
            documents={[
              { label: "รูปโปรไฟล์", url: driver.photo },
              { label: "บัตรประชาชน", url: driver.idCardImage },
              { label: "ใบขับขี่", url: driver.licenseImage },
            ]}
          />
        </Panel>
      </div>
    </RegistryDetailShell>
  );
}
