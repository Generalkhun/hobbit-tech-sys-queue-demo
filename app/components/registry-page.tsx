"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import {
  Button,
  FieldLabel,
  inputClassName,
  Panel,
} from "@/app/components/ui";
import type { DemoUser, DriverRecord } from "@/app/types/queue";

export function RegistryPage({
  user,
  drivers,
  onRegister,
  onApprovalChange,
}: {
  user: DemoUser;
  drivers: DriverRecord[];
  onRegister: (driver: DriverRecord) => void;
  onApprovalChange: (driverId: string, approved: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [carrier, setCarrier] = useState("");
  const [plate, setPlate] = useState("");
  const [phone, setPhone] = useState("");
  const [savedNotice, setSavedNotice] = useState("");
  const approvedCount = drivers.filter((driver) => driver.approved).length;
  const pendingCount = drivers.length - approvedCount;
  const summaryCards: {
    label: string;
    value: string;
    icon: "user" | "clock" | "truck";
  }[] = [
    { label: "ผู้ขับที่อนุมัติแล้ว", value: String(approvedCount), icon: "user" },
    { label: "รออนุมัติ", value: String(pendingCount), icon: "clock" },
    {
      label: "บริษัทขนส่ง",
      value: String(new Set(drivers.map((driver) => driver.carrier)).size),
      icon: "truck",
    },
  ];

  function submitRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const driver: DriverRecord = {
      id: `D-${String(drivers.length + 1).padStart(3, "0")}`,
      name: name.trim(),
      carrier: carrier.trim(),
      plate: plate.trim(),
      phone: phone.trim(),
      approved: user.role === "admin",
    };
    onRegister(driver);
    setSavedNotice(
      user.role === "admin"
        ? "เพิ่มทะเบียนผู้ขับที่ผ่านการอนุมัติแล้ว"
        : "ส่งข้อมูลลงทะเบียนแล้ว · รอผู้ดูแลระบบอนุมัติ",
    );
    setName("");
    setCarrier("");
    setPlate("");
    setPhone("");
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((item, index) => (
          <Panel key={item.label} className="flex items-center gap-4 p-5">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                index === 0
                  ? "bg-emerald-50 text-emerald-600"
                  : index === 1
                    ? "bg-amber-50 text-amber-600"
                    : "bg-sys-50 text-sys-700"
              }`}
            >
              <Icon name={item.icon} size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="mt-1 text-2xl font-bold text-sys-900">{item.value}</p>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Panel className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <h2 className="font-bold text-sys-900">ทะเบียนผู้ขับและรถขนส่ง</h2>
            <p className="mt-1 text-xs text-slate-400">
              ผู้ขับต้องลงทะเบียนภายใต้บริษัทขนส่ง และได้รับอนุมัติก่อนจองคิว
            </p>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">ผู้ขับ / โทรศัพท์</th>
                  <th className="px-4 py-3.5">บริษัทขนส่ง</th>
                  <th className="px-4 py-3.5">ทะเบียนรถ</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-6 py-3.5 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">
                        {driver.name}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {driver.phone}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {driver.carrier}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                        {driver.plate}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          driver.approved
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {driver.approved ? "อนุมัติแล้ว" : "รออนุมัติ"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role === "admin" && (
                        <Button
                          variant={driver.approved ? "secondary" : "success"}
                          className="px-3 py-2 text-[11px]"
                          onClick={() =>
                            onApprovalChange(driver.id, !driver.approved)
                          }
                        >
                          {driver.approved ? "ระงับ" : "อนุมัติผู้ขับ"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="user" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">ลงทะเบียนผู้ขับ</h2>
              <p className="mt-1 text-xs text-slate-400">
                เพิ่มผู้ขับภายใต้บริษัทขนส่ง
              </p>
            </div>
          </div>
          <form onSubmit={submitRegistration} className="space-y-4">
            <FieldLabel label="ชื่อผู้ขับ" required>
              <input
                className={inputClassName}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="ชื่อและนามสกุล"
                required
              />
            </FieldLabel>
            <FieldLabel label="บริษัทขนส่ง" required>
              <input
                className={inputClassName}
                value={carrier}
                onChange={(event) => setCarrier(event.target.value)}
                placeholder="ชื่อบริษัทขนส่ง"
                required
              />
            </FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              <FieldLabel label="ทะเบียนรถ" required>
                <input
                  className={inputClassName}
                  value={plate}
                  onChange={(event) => setPlate(event.target.value)}
                  placeholder="เช่น 70-1234"
                  required
                />
              </FieldLabel>
              <FieldLabel label="เบอร์โทรศัพท์" required>
                <input
                  className={inputClassName}
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="08x-xxx-xxxx"
                  required
                />
              </FieldLabel>
            </div>
            <div className="rounded-xl bg-sys-50/70 p-3 text-xs leading-5 text-sys-800">
              {user.role === "admin"
                ? "บัญชีผู้ดูแลระบบเพิ่มผู้ขับพร้อมอนุมัติได้ทันที"
                : "รายการใหม่จะรอผู้ดูแลระบบตรวจสอบก่อน จึงเลือกใช้จองคิวได้"}
            </div>
            {savedNotice && (
              <p role="status" className="text-xs font-medium text-emerald-700">
                {savedNotice}
              </p>
            )}
            <Button type="submit" className="w-full">
              <Icon name="plus" size={16} />
              ลงทะเบียนผู้ขับ
            </Button>
          </form>
        </Panel>
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-sys-100 bg-sys-50/50 p-4">
        <Icon name="shield" size={18} className="mt-0.5 shrink-0 text-sys-700" />
        <p className="text-xs leading-5 text-slate-600">
          ผู้ขับและรถที่ลงทะเบียนจะผูกกับบริษัทขนส่ง
          การสร้างใบนำส่งจะแสดงให้เลือกเฉพาะผู้ขับที่ได้รับอนุมัติแล้วเท่านั้น
        </p>
      </div>
    </div>
  );
}
