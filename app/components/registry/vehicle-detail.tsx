"use client";

import { DocumentGallery, InfoGrid } from "@/app/components/registry/info-grid";
import { RegistryDetailShell } from "@/app/components/registry/registry-detail-shell";
import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import {
  buildStatusRows,
  plateKindLabels,
  vehicleOwnerLabels,
  vehiclePhotoSides,
} from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  RegistryStatusAction,
  RegistryStatusRecord,
  VehicleRecord,
} from "@/app/types/registry";

export function VehicleDetail({
  vehicle,
  records,
  canChangeStatus,
  onBack,
  onStatusChange,
}: {
  vehicle: VehicleRecord;
  records: RegistryStatusRecord[];
  canChangeStatus: boolean;
  onBack: () => void;
  onStatusChange: (action: RegistryStatusAction, value: NoteWithAttachments) => void;
}) {
  return (
    <RegistryDetailShell
      backLabel="กลับไปรายการรถยนต์"
      name={vehicle.plate}
      subtitle={`${vehicle.id} · ${vehicle.vehicleType}`}
      avatar={
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sys-50 text-sys-700">
          <Icon name="truck" size={30} />
        </span>
      }
      status={vehicle.status}
      canChangeStatus={canChangeStatus}
      historyRows={buildStatusRows(records, vehicle.id)}
      onBack={onBack}
      onStatusChange={onStatusChange}
    >
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <h3 className="mb-4 font-bold text-sys-900">ข้อมูลรถยนต์</h3>
          <InfoGrid
            items={[
              { label: "ทะเบียนรถยนต์", value: vehicle.plate },
              { label: "ประเภททะเบียน", value: plateKindLabels[vehicle.plateKind] },
              { label: "ประเภทรถยนต์", value: vehicle.vehicleType },
              { label: "จังหวัด", value: vehicle.province },
              { label: "หมายเลขตัวถัง", value: vehicle.chassisNumber },
              { label: "บริษัทขนส่ง", value: vehicle.carrier },
              { label: "ประเภทรถ", value: vehicleOwnerLabels[vehicle.ownerType] },
              { label: "ร้านค้า", value: vehicle.shopName },
            ]}
          />
        </Panel>
        <Panel className="p-5 sm:p-6">
          <h3 className="mb-4 font-bold text-sys-900">ภาพถ่ายรถและเอกสาร</h3>
          <DocumentGallery
            documents={[
              ...vehiclePhotoSides.map((side) => ({
                label: `รถ${side.label}`,
                url: vehicle.photos[side.key],
              })),
              { label: "เล่มทะเบียนรถ", url: vehicle.registrationDocument },
            ]}
          />
        </Panel>
      </div>
    </RegistryDetailShell>
  );
}
