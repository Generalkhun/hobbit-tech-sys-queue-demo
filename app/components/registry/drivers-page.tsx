"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { DriverDetail } from "@/app/components/registry/driver-detail";
import { DriverWizard } from "@/app/components/registry/driver-wizard";
import { RegistryList } from "@/app/components/registry/registry-list";
import { createEmptyDriver, employmentLabels, nextRegistryId } from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  DriverRecord,
  RegistryStatusAction,
  RegistryStatusRecord,
} from "@/app/types/registry";

type View = { kind: "list" } | { kind: "wizard"; driverId: string | null } | { kind: "detail"; driverId: string };

export function DriversPage({
  drivers,
  records,
  shopNames,
  isAdmin,
  onSave,
  onStatusChange,
}: {
  drivers: DriverRecord[];
  records: RegistryStatusRecord[];
  shopNames: string[];
  isAdmin: boolean;
  onSave: (driver: DriverRecord) => void;
  onStatusChange: (id: string, action: RegistryStatusAction, value: NoteWithAttachments) => void;
}) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [newDriver, setNewDriver] = useState<DriverRecord | null>(null);
  const back = () => setView({ kind: "list" });

  if (view.kind === "wizard") {
    const initial =
      drivers.find((driver) => driver.id === view.driverId) ?? newDriver ?? createEmptyDriver("");
    return (
      <DriverWizard
        key={initial.id}
        initial={initial}
        shopNames={shopNames}
        isAdmin={isAdmin}
        onSave={onSave}
        onExit={back}
      />
    );
  }

  const selected = view.kind === "detail" ? drivers.find((d) => d.id === view.driverId) : undefined;
  if (selected) {
    return (
      <DriverDetail
        driver={selected}
        records={records}
        canChangeStatus={isAdmin}
        onBack={back}
        onStatusChange={(action, value) => onStatusChange(selected.id, action, value)}
      />
    );
  }

  return (
    <RegistryList
      icon="user"
      title="ทะเบียนผู้ขับและรถขนส่ง"
      description="พนักงานขับรถยนต์ที่ลงทะเบียนในระบบ"
      items={drivers}
      searchLabel="ค้นหาพนักงานขับรถยนต์"
      searchFields={(driver) => [driver.name, driver.phone, driver.carrier, driver.plate, driver.id]}
      createLabel="เพิ่มพนักงานขับรถยนต์"
      emptyText="ไม่พบพนักงานขับรถยนต์"
      getName={(driver) => driver.name || driver.id}
      columns={[
        {
          header: "ผู้ขับ / โทรศัพท์",
          render: (driver) => (
            <div className="flex items-center gap-3">
              <Avatar name={driver.name} src={driver.photo} size={34} />
              <div>
                <p className="font-semibold text-slate-800">{driver.name || "(ยังไม่ระบุชื่อ)"}</p>
                <p className="text-xs text-slate-400">{driver.phone || "-"}</p>
              </div>
            </div>
          ),
        },
        { header: "บริษัทขนส่ง", render: (driver) => driver.carrier || "-" },
        { header: "ประเภทผู้ขับ", render: (driver) => employmentLabels[driver.employmentType] },
      ]}
      onCreate={() => {
        setNewDriver(createEmptyDriver(nextRegistryId("D", drivers.map((d) => d.id))));
        setView({ kind: "wizard", driverId: null });
      }}
      onManage={(id) => {
        const driver = drivers.find((item) => item.id === id);
        setView(
          driver?.status === "draft"
            ? { kind: "wizard", driverId: id }
            : { kind: "detail", driverId: id },
        );
      }}
    />
  );
}
