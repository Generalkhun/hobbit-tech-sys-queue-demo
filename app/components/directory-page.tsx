"use client";

import { useMemo, useState } from "react";
import { provinces, vehicleTypes } from "@/app/data/directories";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import type { PageKey } from "@/app/types/queue";
import type { VehicleRecord } from "@/app/types/registry";

export function DirectoryPage({
  page,
  vehicles,
}: {
  page: PageKey;
  vehicles: VehicleRecord[];
}) {
  if (page === "provinces") return <ProvincesPage />;
  if (page === "vehicle-types") return <VehicleTypesPage vehicles={vehicles} />;
  return (
    <Panel className="p-6 text-sm text-slate-500">
      ไม่พบหน้ารายการที่ระบุ
    </Panel>
  );
}

/* ─── จังหวัด ───────────────────────────────────────────── */

function ProvincesPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return provinces.filter((province) =>
      `${province.code} ${province.name} ${province.region}`
        .toLowerCase()
        .includes(keyword),
    );
  }, [search]);

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="map" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">จังหวัด</h2>
              <p className="mt-1 text-xs text-slate-400">
                รหัสจังหวัดตามมาตรฐานกรมการขนส่งทางบก
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <p className="text-xs text-slate-500">
            ทั้งหมด {provinces.length} จังหวัด
          </p>
          <div className="relative">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="h-10 w-56 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
              placeholder="ค้นหาจังหวัด..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="ค้นหาจังหวัด"
            />
          </div>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[540px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3.5">รหัส</th>
                <th className="px-4 py-3.5">ชื่อจังหวัด</th>
                <th className="px-4 py-3.5">ภูมิภาค</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((province) => (
                <tr key={province.code} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-mono font-semibold text-sys-700">
                    {province.code}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {province.name}
                  </td>
                  <td className="px-4 py-4 text-slate-500">{province.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-slate-400">
              ไม่พบจังหวัดที่ค้นหา
            </p>
          )}
        </div>
      </Panel>

      <Panel className="rounded-2xl border border-sky-100 bg-sky-50/40 p-5 sm:p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-sys-800">
          <Icon name="info" size={16} />
          รหัสประจำตัวรถยนต์
        </h3>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          รถยนต์แต่ละคันในระบบมี id = <strong>ทะเบียนรถ-รหัสจังหวัด</strong>
          เช่น <code className="rounded bg-slate-100 px-1.5 font-mono text-sys-700">70-4380-14</code>{" "}
          (ทะเบียน 70-4380 จังหวัดพระนครศรีอยุธยา รหัส 14)
          เพราะทะเบียนรถสามารถออกซ้ำกันได้ในต่างจังหวัด
          การใช้ทะเบียน+รหัสจังหวัดจึงทำให้ id ไม่ซ้ำกัน
        </p>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3">
            <p className="font-semibold text-sys-700">ตัวอย่าง</p>
            <p className="mt-1 text-slate-500">
              <code className="font-mono">71-2398-13</code> = 71-2398 ปทุมธานี (13)
            </p>
            <p className="mt-1 text-slate-500">
              <code className="font-mono">SYS-006-13</code> = SYS-006 ปทุมธานี (13)
            </p>
          </div>
          <div className="rounded-lg bg-white p-3">
            <p className="font-semibold text-sys-700">รูปแบบ</p>
            <p className="mt-1 text-slate-500">
              <code className="font-mono">[ทะเบียน]-[รหัส 2 หลัก]</code>
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ─── ประเภทรถยนต์ ──────────────────────────────────────── */

function VehicleTypesPage({
  vehicles,
}: {
  vehicles: VehicleRecord[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = vehicleTypes.find((vt) => vt.id === selectedId);

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="truck" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">ประเภทรถยนต์</h2>
              <p className="mt-1 text-xs text-slate-400">
                กำหนดประเภทและรายละเอียดรถที่ใช้ลงทะเบียน
              </p>
            </div>
          </div>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3.5">รหัส</th>
                <th className="px-4 py-3.5">ชื่อประเภทรถ</th>
                <th className="px-4 py-3.5">รายละเอียด</th>
                <th className="px-4 py-3.5">ความจุสูงสุด</th>
                <th className="px-6 py-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicleTypes.map((vt) => (
                <tr key={vt.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-semibold text-sys-700">
                    {vt.id}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {vt.name}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {vt.description}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {vt.spec.maxTons} ตัน
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedId(selectedId === vt.id ? null : vt.id)
                      }
                      className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-sys-700 hover:bg-sys-50"
                    >
                      {selectedId === vt.id ? "ปิด" : "ดูรายละเอียด"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {selected && (
        <VehicleTypeDetail vehicleType={selected} vehicles={vehicles} />
      )}
    </div>
  );
}

function VehicleTypeDetail({
  vehicleType,
  vehicles,
}: {
  vehicleType: (typeof vehicleTypes)[number];
  vehicles: VehicleRecord[];
}) {
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const PAGE_SIZE = 5;

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return vehicles
      .filter((vehicle) => vehicle.vehicleType === vehicleType.name)
      .filter((vehicle) =>
        keyword
          ? `${vehicle.plate} ${vehicle.carrier} ${vehicle.province} ${vehicle.shopName}`
              .toLowerCase()
              .includes(keyword)
          : true,
      );
  }, [search, vehicles, vehicleType.name]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = useMemo(
    () => filtered.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE),
    [filtered, pageIndex],
  );

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-sys-50 text-sys-700">
            <Icon name="truck" size={26} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-sys-900">
              {vehicleType.name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {vehicleType.description}
            </p>
          </div>
        </div>
      </div>

      {/* รูปภาพประเภทรถ */}
      <div className="px-5 py-4 sm:px-6">
        <h4 className="mb-3 text-sm font-bold text-sys-800">รูปภาพประเภทรถ</h4>
        {vehicleType.images.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {vehicleType.images.map((url, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={index}
                src={url}
                alt={`${vehicleType.name} รูปที่ ${index + 1}`}
                className="h-32 w-48 rounded-xl border border-slate-200 object-cover"
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">
            ยังไม่มีรูปภาพสำหรับประเภทรถนี้
          </p>
        )}
      </div>

      {/* Spec */}
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3 sm:px-6">
        <div className="rounded-xl bg-sys-50/70 p-4">
          <p className="text-[11px] font-semibold text-sys-700">
            ความเหมาะสม
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {vehicleType.spec.suitableFor}
          </p>
        </div>
        <div className="rounded-xl bg-sys-50/70 p-4">
          <p className="text-[11px] font-semibold text-sys-700">
            น้ำหนักสูงสุด
          </p>
          <p className="mt-1 text-2xl font-bold text-sys-900">
            {vehicleType.spec.maxTons}
            <span className="ml-1 text-xs text-slate-400">ตัน</span>
          </p>
        </div>
        {vehicleType.spec.note && (
          <div className="rounded-xl bg-amber-50/70 p-4">
            <p className="text-[11px] font-semibold text-amber-700">หมายเหตุ</p>
            <p className="mt-1 text-xs text-amber-800">
              {vehicleType.spec.note}
            </p>
          </div>
        )}
      </div>

      {/* รถในระบบที่ตรงกับประเภทนี้ */}
      <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
        <h4 className="text-sm font-bold text-sys-800">
          รถในระบบที่ตรงกับประเภทนี้
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          {filtered.length} คัน
        </p>
        <div className="relative mt-3">
          <Icon
            name="search"
            size={15}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
            placeholder="ค้นหาทะเบียน, บริษัทขนส่ง, จังหวัด..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPageIndex(0);
            }}
            aria-label="ค้นหารถในระบบ"
          />
        </div>
        {filtered.length > 0 ? (
          <>
            <div className="mt-3 scrollbar-thin overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-xs">
                <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">ทะเบียน</th>
                    <th className="px-4 py-3">บริษัทขนส่ง</th>
                    <th className="px-4 py-3">จังหวัด</th>
                    <th className="px-4 py-3">สังกัด</th>
                    <th className="px-4 py-3">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {vehicle.plate}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {vehicle.carrier || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {vehicle.province || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {vehicle.shopName || (vehicle.ownerType === "shop" ? "ร้านค้า" : "อิสระ")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            vehicle.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : vehicle.status === "pending"
                                ? "bg-sky-50 text-sky-700"
                                : vehicle.status === "suspended"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {vehicle.status === "active"
                            ? "ใช้งาน"
                            : vehicle.status === "pending"
                              ? "รออนุมัติ"
                              : vehicle.status === "suspended"
                                ? "ระงับ"
                                : "สร้างไม่เสร็จ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > PAGE_SIZE && (
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-[11px] text-slate-400">
                  หน้า {pageIndex + 1} จาก {totalPages} (ทั้งหมด{" "}
                  {filtered.length} คัน)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    disabled={pageIndex === 0}
                    onClick={() =>
                      setPageIndex((index) => Math.max(0, index - 1))
                    }
                  >
                    ก่อนหน้า
                  </Button>
                  <Button
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    disabled={pageIndex >= totalPages - 1}
                    onClick={() =>
                      setPageIndex((index) =>
                        Math.min(totalPages - 1, index + 1),
                      )
                    }
                  >
                    ถัดไป
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="mt-3 text-xs text-slate-400">
            ไม่มีรถในระบบที่ตรงกับประเภทรถนี้
          </p>
        )}
      </div>
    </Panel>
  );
}
