"use client";

import { useState } from "react";
import { InfoGrid } from "@/app/components/registry/info-grid";
import { RegistryWizard } from "@/app/components/registry/registry-wizard";
import { ImagePicker } from "@/app/components/shared/image-picker";
import { ProvinceField } from "@/app/components/shared/province-field";
import { RadioGroup } from "@/app/components/shared/radio-group";
import { SelectField } from "@/app/components/shared/select-field";
import { TextField } from "@/app/components/shared/text-field";
import type { IconName } from "@/app/components/icons";
import {
  finalizeVehicle,
  getVehicleCompletionIssues,
  getVehicleStepIssues,
  plateKindLabels,
  saveVehicleDraft,
  vehicleOwnerLabels,
  vehiclePhotoSides,
} from "@/app/data/registry";
import type { PlateKind, VehicleOwnerType, VehicleRecord } from "@/app/types/registry";

const steps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลทั่วไป", icon: "truck" },
  { title: "ภาพถ่ายรถยนต์", icon: "scan" },
  { title: "บันทึกเอกสาร", icon: "document" },
  { title: "บันทึกข้อมูลสำเร็จ", icon: "circle-check" },
];

export function VehicleWizard({
  initial,
  shopNames,
  vehicleTypes,
  isAdmin,
  onSave,
  onExit,
}: {
  initial: VehicleRecord;
  shopNames: string[];
  vehicleTypes: string[];
  isAdmin: boolean;
  onSave: (vehicle: VehicleRecord) => void;
  onExit: () => void;
}) {
  const [vehicle, setVehicle] = useState(initial);
  const update = (patch: Partial<VehicleRecord>) =>
    setVehicle((current) => ({ ...current, ...patch }));

  return (
    <RegistryWizard
      title={initial.plate ? `สร้างรถยนต์ต่อ: ${initial.plate}` : "เพิ่มรถยนต์"}
      steps={steps}
      initialStep={initial.draftStep ?? 0}
      getStepIssues={(step) => getVehicleStepIssues(vehicle, step)}
      completionIssues={getVehicleCompletionIssues(vehicle)}
      onSaveDraft={(step) => onSave(saveVehicleDraft(vehicle, step))}
      onComplete={() => onSave(finalizeVehicle(vehicle, isAdmin))}
      onExit={onExit}
      successText={
        isAdmin
          ? "รถยนต์พร้อมใช้งานแล้ว"
          : "ส่งข้อมูลแล้ว รอผู้ดูแลระบบอนุมัติก่อนใช้งาน"
      }
      renderStep={(step) => {
        if (step === 0) {
          return (
            <div className="grid gap-4 sm:grid-cols-2">
              <RadioGroup<VehicleOwnerType>
                label="ประเภทรถ"
                value={vehicle.ownerType}
                options={[
                  { value: "shop", label: vehicleOwnerLabels.shop },
                  { value: "contractor", label: vehicleOwnerLabels.contractor },
                ]}
                onChange={(ownerType) => update({ ownerType })}
              />
              {vehicle.ownerType === "shop" && (
                <SelectField
                  label="ร้านค้า"
                  value={vehicle.shopName}
                  options={shopNames}
                  placeholder="เลือกร้านค้า"
                  onChange={(shopName) => update({ shopName })}
                />
              )}
              <RadioGroup<PlateKind>
                label="ประเภททะเบียน"
                value={vehicle.plateKind}
                options={[
                  { value: "head", label: plateKindLabels.head },
                  { value: "tail", label: plateKindLabels.tail },
                ]}
                onChange={(plateKind) => update({ plateKind })}
              />
              <TextField label="บริษัทขนส่ง" value={vehicle.carrier} onChange={(carrier) => update({ carrier })} required />
              <SelectField
                label="ประเภทรถยนต์"
                value={vehicle.vehicleType}
                options={vehicleTypes}
                placeholder="เลือกประเภทรถยนต์"
                onChange={(vehicleType) => update({ vehicleType })}
              />
              <TextField label="ทะเบียนรถยนต์ (ตรวจสอบ black list)" value={vehicle.plate} onChange={(plate) => update({ plate })} required />
              <ProvinceField value={vehicle.province} onChange={(province) => update({ province })} />
              <TextField label="หมายเลขตัวถัง" value={vehicle.chassisNumber} onChange={(chassisNumber) => update({ chassisNumber })} required />
            </div>
          );
        }
        if (step === 1) {
          return (
            <div className="grid gap-6 sm:grid-cols-2">
              {vehiclePhotoSides.map((side) => (
                <ImagePicker
                  key={side.key}
                  label={`ภาพถ่ายรถ${side.label}`}
                  value={vehicle.photos[side.key]}
                  onChange={(url) =>
                    update({ photos: { ...vehicle.photos, [side.key]: url } })
                  }
                />
              ))}
            </div>
          );
        }
        return (
          <ImagePicker
            label="เล่มทะเบียนรถ"
            value={vehicle.registrationDocument}
            onChange={(registrationDocument) => update({ registrationDocument })}
          />
        );
      }}
      renderReview={() => (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">ตรวจสอบข้อมูลก่อนกดบันทึก</p>
          <InfoGrid
            items={[
              { label: "ประเภทรถ", value: vehicleOwnerLabels[vehicle.ownerType] },
              { label: "ร้านค้า", value: vehicle.shopName },
              { label: "ประเภททะเบียน", value: plateKindLabels[vehicle.plateKind] },
              { label: "ทะเบียนรถยนต์", value: vehicle.plate },
              { label: "ประเภทรถยนต์", value: vehicle.vehicleType },
              { label: "บริษัทขนส่ง", value: vehicle.carrier },
              { label: "จังหวัด", value: vehicle.province },
              { label: "หมายเลขตัวถัง", value: vehicle.chassisNumber },
            ]}
          />
        </div>
      )}
    />
  );
}
