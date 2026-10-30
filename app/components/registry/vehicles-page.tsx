"use client";

import { useEffect, useState } from "react";
import { RegistryList } from "@/app/components/registry/registry-list";
import { VehicleDetail } from "@/app/components/registry/vehicle-detail";
import { VehicleWizard } from "@/app/components/registry/vehicle-wizard";
import {
  createEmptyVehicle,
  nextRegistryId,
  plateKindLabels,
  vehicleOwnerLabels,
} from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  RegistryStatusAction,
  RegistryStatusRecord,
  VehicleRecord,
} from "@/app/types/registry";

type View = { kind: "list" } | { kind: "wizard"; vehicleId: string | null } | { kind: "detail"; vehicleId: string };

export function VehiclesPage({
  vehicles,
  records,
  shopNames,
  vehicleTypes,
  isAdmin,
  focusVehicleId,
  onClearFocus,
  onSave,
  onStatusChange,
}: {
  vehicles: VehicleRecord[];
  records: RegistryStatusRecord[];
  shopNames: string[];
  vehicleTypes: string[];
  isAdmin: boolean;
  focusVehicleId?: string | null;
  onClearFocus?: () => void;
  onSave: (vehicle: VehicleRecord) => void;
  onStatusChange: (id: string, action: RegistryStatusAction, value: NoteWithAttachments) => void;
}) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [newVehicle, setNewVehicle] = useState<VehicleRecord | null>(null);
  const back = () => {
    onClearFocus?.();
    setView({ kind: "list" });
  };

  // มาจากหน้าสร้างใบนำส่ง (กด "ดูรายละเอียด") → เปิดหน้ารายละเอียดรถคันนั้นทันที
  useEffect(() => {
    if (focusVehicleId && vehicles.some((vehicle) => vehicle.id === focusVehicleId)) {
      setView({ kind: "detail", vehicleId: focusVehicleId });
    }
  }, [focusVehicleId, vehicles]);

  if (view.kind === "wizard") {
    const initial =
      vehicles.find((vehicle) => vehicle.id === view.vehicleId) ??
      newVehicle ??
      createEmptyVehicle("");
    return (
      <VehicleWizard
        key={initial.id}
        initial={initial}
        shopNames={shopNames}
        vehicleTypes={vehicleTypes}
        isAdmin={isAdmin}
        onSave={onSave}
        onExit={back}
      />
    );
  }

  const selected = view.kind === "detail" ? vehicles.find((v) => v.id === view.vehicleId) : undefined;
  if (selected) {
    return (
      <VehicleDetail
        vehicle={selected}
        records={records}
        canChangeStatus={isAdmin}
        onBack={back}
        onStatusChange={(action, value) => onStatusChange(selected.id, action, value)}
      />
    );
  }

  return (
    <RegistryList
      icon="truck"
      title="รถยนต์"
      description="รถขนส่งที่ลงทะเบียนภายใต้บริษัทและสถานะอนุมัติ"
      items={vehicles}
      searchLabel="ค้นหารถยนต์"
      searchFields={(vehicle) => [vehicle.plate, vehicle.carrier, vehicle.vehicleType, vehicle.province, vehicle.id]}
      createLabel="เพิ่มรถยนต์"
      emptyText="ไม่พบรถยนต์"
      getName={(vehicle) => vehicle.plate || vehicle.id}
      columns={[
        {
          header: "ทะเบียน / ประเภท",
          render: (vehicle) => (
            <div>
              <p className="font-semibold text-slate-800">{vehicle.plate || "(ยังไม่ระบุทะเบียน)"}</p>
              <p className="text-xs text-slate-400">
                {vehicle.vehicleType || "-"} · {plateKindLabels[vehicle.plateKind]}
              </p>
            </div>
          ),
        },
        { header: "บริษัทขนส่ง", render: (vehicle) => vehicle.carrier || "-" },
        { header: "จังหวัด", render: (vehicle) => vehicle.province || "-" },
        { header: "ประเภทรถ", render: (vehicle) => vehicleOwnerLabels[vehicle.ownerType] },
      ]}
      onCreate={() => {
        setNewVehicle(createEmptyVehicle(nextRegistryId("V", vehicles.map((v) => v.id))));
        setView({ kind: "wizard", vehicleId: null });
      }}
      onManage={(id) => {
        const vehicle = vehicles.find((item) => item.id === id);
        setView(
          vehicle?.status === "draft"
            ? { kind: "wizard", vehicleId: id }
            : { kind: "detail", vehicleId: id },
        );
      }}
    />
  );
}
