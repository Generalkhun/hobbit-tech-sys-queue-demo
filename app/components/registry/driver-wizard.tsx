"use client";

import { useState } from "react";
import { InfoGrid } from "@/app/components/registry/info-grid";
import { RegistryWizard } from "@/app/components/registry/registry-wizard";
import { ImagePicker } from "@/app/components/shared/image-picker";
import { RadioGroup } from "@/app/components/shared/radio-group";
import { SelectField } from "@/app/components/shared/select-field";
import { TextField } from "@/app/components/shared/text-field";
import type { IconName } from "@/app/components/icons";
import {
  buildDriverName,
  employmentLabels,
  finalizeDriver,
  getDriverCompletionIssues,
  getDriverStepIssues,
  maskNationalId,
  saveDriverDraft,
} from "@/app/data/registry";
import type { DriverRecord, EmploymentType } from "@/app/types/registry";

const steps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลพนักงาน", icon: "user" },
  { title: "ภาพถ่ายพนักงาน", icon: "scan" },
  { title: "ภาพถ่ายเอกสาร", icon: "document" },
  { title: "บันทึกข้อมูลสำเร็จ", icon: "circle-check" },
];

export function DriverWizard({
  initial,
  shopNames,
  isAdmin,
  onSave,
  onExit,
}: {
  initial: DriverRecord;
  shopNames: string[];
  isAdmin: boolean;
  onSave: (driver: DriverRecord) => void;
  onExit: () => void;
}) {
  const [driver, setDriver] = useState(initial);
  const update = (patch: Partial<DriverRecord>) =>
    setDriver((current) => ({ ...current, ...patch }));

  return (
    <RegistryWizard
      title={initial.name ? `สร้างพนักงานขับรถยนต์ต่อ: ${initial.name}` : "เพิ่มพนักงานขับรถยนต์"}
      steps={steps}
      initialStep={initial.draftStep ?? 0}
      getStepIssues={(step) => getDriverStepIssues(driver, step)}
      completionIssues={getDriverCompletionIssues(driver)}
      onSaveDraft={(step) => onSave(saveDriverDraft(driver, step))}
      onComplete={() => onSave(finalizeDriver(driver, isAdmin))}
      onExit={onExit}
      successText={
        isAdmin
          ? "พนักงานขับรถยนต์พร้อมใช้งานในใบนำส่งแล้ว"
          : "ส่งข้อมูลแล้ว รอผู้ดูแลระบบอนุมัติก่อนใช้งาน"
      }
      renderStep={(step) => {
        if (step === 0) {
          return <DriverInfoStep driver={driver} shopNames={shopNames} onChange={update} />;
        }
        if (step === 1) {
          return (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                ต้องแนบรูปคนขับ ใบขับขี่ และบัตรประชาชน เพื่อตรวจสอบ Blacklist และ TMS / Car in out
              </p>
              <ImagePicker
                label="ภาพถ่ายพนักงาน"
                variant="avatar"
                name={driver.firstName}
                value={driver.photo}
                onChange={(photo) => update({ photo })}
              />
            </div>
          );
        }
        return (
          <div className="grid gap-6 sm:grid-cols-2">
            <ImagePicker
              label="ภาพบัตรประชาชน"
              value={driver.idCardImage}
              onChange={(idCardImage) => update({ idCardImage })}
            />
            <ImagePicker
              label="ภาพใบขับขี่"
              value={driver.licenseImage}
              onChange={(licenseImage) => update({ licenseImage })}
            />
          </div>
        );
      }}
      renderReview={() => (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">ตรวจสอบข้อมูลก่อนกดบันทึก</p>
          <InfoGrid
            items={[
              { label: "ชื่อ-นามสกุล", value: buildDriverName(driver) },
              { label: "ประเภทผู้ขับ", value: employmentLabels[driver.employmentType] },
              { label: "ร้านค้า", value: driver.shopName },
              { label: "เลขบัตรประชาชน", value: maskNationalId(driver.nationalId) },
              { label: "เลขใบอนุญาตขับขี่", value: driver.licenseNumber },
              { label: "เบอร์โทรศัพท์", value: driver.phone },
              { label: "บริษัทขนส่ง", value: driver.carrier },
              { label: "ทะเบียนรถประจำ", value: driver.plate },
            ]}
          />
        </div>
      )}
    />
  );
}

function DriverInfoStep({
  driver,
  shopNames,
  onChange,
}: {
  driver: DriverRecord;
  shopNames: string[];
  onChange: (patch: Partial<DriverRecord>) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <RadioGroup<EmploymentType>
        label="ประเภทพนักงาน"
        value={driver.employmentType}
        options={[
          { value: "employee", label: employmentLabels.employee },
          { value: "contractor", label: employmentLabels.contractor },
        ]}
        onChange={(employmentType) => onChange({ employmentType })}
      />
      {driver.employmentType === "employee" && (
        <SelectField
          label="ร้านค้า"
          value={driver.shopName}
          options={shopNames}
          placeholder="เลือกร้านค้า"
          onChange={(shopName) => onChange({ shopName })}
        />
      )}
      <TextField label="ชื่อต้น" value={driver.prefix} onChange={(prefix) => onChange({ prefix })} />
      <TextField label="ชื่อ" value={driver.firstName} onChange={(firstName) => onChange({ firstName })} required />
      <TextField label="นามสกุล" value={driver.lastName} onChange={(lastName) => onChange({ lastName })} required />
      <TextField label="เลขบัตรประชาชน" value={driver.nationalId} onChange={(nationalId) => onChange({ nationalId })} required />
      <TextField label="เลขใบอนุญาตขับขี่" value={driver.licenseNumber} onChange={(licenseNumber) => onChange({ licenseNumber })} required />
      <TextField label="เบอร์โทรศัพท์" value={driver.phone} onChange={(phone) => onChange({ phone })} required />
      <TextField label="อีเมล" value={driver.email} onChange={(email) => onChange({ email })} />
      <TextField label="บริษัทขนส่ง" value={driver.carrier} onChange={(carrier) => onChange({ carrier })} required />
      <TextField label="ทะเบียนรถประจำ" value={driver.plate} onChange={(plate) => onChange({ plate })} required />
    </div>
  );
}
