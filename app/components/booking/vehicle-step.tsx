"use client";

import { useMemo, useState } from "react";
import { getBlacklistReason } from "@/app/data/eligibility";
import { Icon } from "@/app/components/icons";
import { Button, inputClassName } from "@/app/components/ui";
import { FormError } from "@/app/components/booking/form-error";
import { RegistryStatusBadge } from "@/app/components/registry/registry-status-badge";
import type { DeliveryVehicle, VehicleScope } from "@/app/types/booking-form";
import type { BlacklistRecord } from "@/app/types/queue";

interface VehicleStepProps {
  /** รถที่ผู้ใช้เห็นตามสิทธิ์ (ผู้ขาย/ร้านค้า/จศ.) */
  vehicles: DeliveryVehicle[];
  /** รถทั้งหมดในระบบ ใช้กับ จศ. ที่มี filter สังกัด */
  allVehicles: DeliveryVehicle[];
  vehicleKey: string;
  selectedVehicle?: DeliveryVehicle;
  selectedVehicleBlacklistReasons: string[];
  vehicleScope: VehicleScope;
  blacklist: BlacklistRecord[];
  formError: string;
  onChooseVehicle: (vehicle: DeliveryVehicle) => void;
  onViewVehicle: (vehicleId: string) => void;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
}

const affiliationOptions = [
  { value: "all", label: "ทุกสังกัด" },
  { value: "shop", label: "รถของร้านค้า" },
  { value: "contractor", label: "รถรับจ้างอิสระ" },
] as const;

export function VehicleStep({
  vehicles,
  allVehicles,
  vehicleKey,
  selectedVehicle,
  selectedVehicleBlacklistReasons,
  vehicleScope,
  blacklist,
  formError,
  onChooseVehicle,
  onViewVehicle,
  onBack,
  onNext,
  onSaveDraft,
}: VehicleStepProps) {
  const isAdmin = vehicleScope.kind === "admin";
  const [query, setQuery] = useState("");
  const [affiliation, setAffiliation] = useState<string>("all");
  const [vehicleType, setVehicleType] = useState("");
  const [province, setProvince] = useState("");
  const [sortBy, setSortBy] = useState<"plate" | "carrier" | "province">("plate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const pool = isAdmin ? allVehicles : vehicles;
  const vehicleTypes = useMemo(
    () => Array.from(new Set(pool.map((v) => v.vehicleType).filter(Boolean))).sort(),
    [pool],
  );
  const provinces = useMemo(
    () => Array.from(new Set(pool.map((v) => v.province).filter(Boolean))).sort(),
    [pool],
  );

  const rows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return pool
      .filter((vehicle) => {
        if (keyword) {
          const haystack = [
            vehicle.plate,
            vehicle.carrier,
            vehicle.vehicleType,
            vehicle.province,
            vehicle.shopName,
          ]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(keyword)) return false;
        }
        if (affiliation !== "all" && vehicle.ownerType !== affiliation) return false;
        if (vehicleType && vehicle.vehicleType !== vehicleType) return false;
        if (province && vehicle.province !== province) return false;
        return true;
      })
      .sort((left, right) => {
        const a = left[sortBy] ?? "";
        const b = right[sortBy] ?? "";
        return sortDir === "asc" ? a.localeCompare(b, "th") : b.localeCompare(a, "th");
      });
  }, [pool, query, affiliation, vehicleType, province, sortBy, sortDir]);

  function toggleSort(next: typeof sortBy) {
    if (sortBy === next) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(next);
      setSortDir("asc");
    }
  }

  const sortArrow = (column: typeof sortBy) =>
    sortBy === column ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div>
      <div className="border-t border-slate-100 px-5 py-6 sm:px-7">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sys-900">เลือกรถยนต์</h3>
            <p className="mt-1 text-xs text-slate-400">
              {isAdmin
                ? "รถทุกคันในระบบ · กดหัวตารางเพื่อเรียงลำดับ และกรองตามสังกัด ประเภท หรือจังหวัด"
                : "รถที่อยู่ในสังกัดของคุณและรถรับจ้างอิสระ · กดหัวตารางเพื่อเรียงลำดับ"}
            </p>
          </div>
          <span className="text-xs text-slate-400">ขั้นตอน 2 จาก 3</span>
        </div>

        {/* ตัวกรอง */}
        <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500">
              ค้นหา
            </label>
            <input
              className={inputClassName}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ทะเบียน, บริษัทขนส่ง, ร้านค้า…"
            />
          </div>
          {isAdmin && (
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-slate-500">
                สังกัด
              </label>
              <select
                className={inputClassName}
                value={affiliation}
                onChange={(event) => setAffiliation(event.target.value)}
              >
                {affiliationOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500">
              ประเภทรถ
            </label>
            <select
              className={inputClassName}
              value={vehicleType}
              onChange={(event) => setVehicleType(event.target.value)}
            >
              <option value="">ทุกประเภท</option>
              {vehicleTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-500">
              จังหวัด
            </label>
            <select
              className={inputClassName}
              value={province}
              onChange={(event) => setProvince(event.target.value)}
            >
              <option value="">ทุกจังหวัด</option>
              {provinces.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        {rows.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3" aria-label="เลือก" />
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("plate")}
                      className="font-semibold hover:text-sys-700"
                    >
                      ทะเบียน / สังกัด{sortArrow("plate")}
                    </button>
                  </th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("carrier")}
                      className="font-semibold hover:text-sys-700"
                    >
                      บริษัทขนส่ง{sortArrow("carrier")}
                    </button>
                  </th>
                  <th className="px-3 py-3 font-semibold">ประเภทรถ</th>
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => toggleSort("province")}
                      className="font-semibold hover:text-sys-700"
                    >
                      จังหวัด{sortArrow("province")}
                    </button>
                  </th>
                  <th className="px-3 py-3 font-semibold">สถานะ</th>
                  <th className="px-3 py-3 text-right font-semibold">รายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((vehicle) => {
                  const selected = vehicle.key === vehicleKey;
                  const blacklistReasons = getBlacklistReason(
                    "",
                    vehicle.plate,
                    blacklist,
                  );
                  const isBlacklisted = blacklistReasons.length > 0;
                  const isSelectable =
                    vehicle.status === "active" &&
                    !isBlacklisted &&
                    vehicle.drivers.length > 0;
                  return (
                    <tr
                      key={vehicle.key}
                      className={
                        selected
                          ? "bg-sys-50/70"
                          : isSelectable
                            ? "hover:bg-slate-50/60"
                            : "opacity-60"
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="radio"
                          name="vehicle-radio"
                          aria-label={`เลือก ${vehicle.plate}`}
                          checked={selected}
                          disabled={!isSelectable}
                          onChange={() => onChooseVehicle(vehicle)}
                          className="h-4 w-4 accent-sys-600"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800">
                          {vehicle.plate}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {vehicle.shopName
                            ? `สังกัด ${vehicle.shopName}`
                            : vehicle.ownerType === "shop"
                              ? "รถของร้านค้า"
                              : "รถรับจ้างอิสระ"}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {vehicle.carrier || "-"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {vehicle.vehicleType || "-"}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {vehicle.province || "-"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <RegistryStatusBadge status={vehicle.status} />
                          {isBlacklisted && (
                            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold text-rose-700">
                              Blacklist
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => onViewVehicle(vehicle.id)}
                          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-sys-700 hover:bg-sys-50"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
            <p className="text-sm font-semibold text-slate-600">
              ไม่พบรถยนต์ที่ตรงกับเงื่อนไข
            </p>
            <p className="mt-1 text-xs text-slate-400">
              ปรับตัวกรองหรือค้นหาด้วยคำอื่น หรือลงทะเบียนรถและรอผู้ดูแลระบบอนุมัติ
            </p>
          </div>
        )}

        {selectedVehicle && (
          <div className="mt-5 flex items-start gap-3 rounded-xl bg-sys-50/70 px-4 py-3">
            <Icon name="circle-check" size={18} className="mt-0.5 text-sys-600" />
            <div>
              <p className="text-xs text-sys-800">
                เลือกรถ{" "}
                <span className="font-bold">{selectedVehicle.plate}</span>
                {" · "}
                {selectedVehicle.carrier}
              </p>
              {selectedVehicleBlacklistReasons.length > 0 && (
                <p className="mt-1 text-[11px] font-semibold text-rose-700">
                  Blacklist: {selectedVehicleBlacklistReasons.join(" · ")}
                </p>
              )}
            </div>
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
