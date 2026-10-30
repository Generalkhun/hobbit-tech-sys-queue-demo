"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/icons";
import { RowsPagination } from "@/app/components/shared/rows-pagination";
import { SearchInput } from "@/app/components/shared/search-input";
import { TabBar } from "@/app/components/shared/tab-bar";
import { Panel } from "@/app/components/ui";
import {
  countByTab,
  filterByTab,
  formatDmy,
  getVehicleTypeByPlate,
  operationStatusStyle,
  operationTabs,
  type OperationTab,
} from "@/app/data/operations";
import { matchesSearch, paginate } from "@/app/data/registry";
import type { QueueBooking } from "@/app/types/queue";
import type { ReactNode } from "react";

const headers = [
  "เลขที่เอกสาร",
  "วันที่จัดส่ง",
  "เวลา",
  "ร้านค้า",
  "โรงงาน",
  "เกรด",
  "ประเภทรถยนต์",
  "เวลายืนยัน",
  "สถานะ",
  "หมายเหตุ",
  "ดำเนินการ",
];

export function OperationsTable({
  bookings,
  vehicles,
  renderAction,
  onRefresh,
}: {
  bookings: QueueBooking[];
  vehicles: { plate: string; vehicleType: string }[];
  renderAction: (booking: QueueBooking) => ReactNode;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<OperationTab>("delivering");
  const [query, setQuery] = useState("");
  const [plantId, setPlantId] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const counts = countByTab(bookings);
  const rows = useMemo(
    () =>
      filterByTab(bookings, tab)
        .filter((booking) => plantId === "all" || booking.plantId === plantId)
        .filter((booking) =>
          matchesSearch([booking.id, booking.retailer, booking.driver, booking.plate], query),
        ),
    [bookings, tab, plantId, query],
  );
  const paged = paginate(rows, page, pageSize);
  const reset = () => setPage(1);

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-5 sm:px-6">
        <Icon name="clipboard" size={20} className="text-sys-700" />
        <h2 className="font-bold text-sys-900">รายการใบนำส่งเศษเหล็ก</h2>
      </div>
      <div className="px-5 sm:px-6">
        <TabBar
          tabs={operationTabs.map((item) => ({
            id: item.id,
            label: `${item.label} (${counts[item.id]})`,
          }))}
          active={tab}
          onChange={(next) => {
            setTab(next);
            reset();
          }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 px-5 py-5 sm:px-6">
        <div className="w-full max-w-xs">
          <SearchInput
            value={query}
            onChange={(value) => {
              setQuery(value);
              reset();
            }}
            label="ค้นหาใบนำส่ง"
            placeholder="ค้นหา..."
          />
        </div>
        <select
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"
          aria-label="กรองตามโรงงาน"
          value={plantId}
          onChange={(event) => {
            setPlantId(event.target.value);
            reset();
          }}
        >
          <option value="all">ทุกโรงงาน</option>
          <option value="SYS1">SYS 1</option>
          <option value="SYS2">SYS 2</option>
        </select>
        <button
          type="button"
          aria-label="รีเฟรชรายการ"
          onClick={onRefresh}
          className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-sys-300 text-sys-700 hover:bg-sys-50"
        >
          <Icon name="refresh" size={16} />
        </button>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[1150px] text-left text-xs">
          <thead className="text-[11px] font-semibold text-slate-500">
            <tr className="border-y border-slate-100">
              {headers.map((header) => (
                <th key={header} className="px-3 py-3 first:pl-6 last:pr-6 last:text-right">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.items.map((booking) => {
              const status = operationStatusStyle[booking.status];
              return (
                <tr key={booking.id} className="hover:bg-slate-50/60">
                  <td className="px-3 py-4 pl-6 font-semibold text-slate-700">{booking.id}</td>
                  <td className="px-3 py-4 text-slate-600">{formatDmy(booking.date)}</td>
                  <td className="px-3 py-4 text-slate-600">{booking.timeSlot}</td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-slate-700">{booking.retailer}</p>
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-500">
                      ทะเบียน: {booking.plate}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-600">{booking.plantId.replace("SYS", "SYS ")}</td>
                  <td className="px-3 py-4 text-slate-600">{booking.grade}</td>
                  <td className="px-3 py-4 text-slate-600">
                    {getVehicleTypeByPlate(vehicles, booking.plate)}
                  </td>
                  <td className="px-3 py-4">
                    <span className="rounded bg-cyan-600 px-2 py-1 text-[10px] font-bold text-white">
                      {formatDmy(booking.date)} {booking.createdAt} น.
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="max-w-[170px] px-3 py-4 text-[11px] leading-4 text-slate-400">
                    {booking.schedulingReason ?? "-"}
                  </td>
                  <td className="px-3 py-4 pr-6 text-right">{renderAction(booking)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-slate-400">
            ไม่พบรายการที่ตรงกับตัวกรอง
          </div>
        )}
      </div>
      <RowsPagination
        page={paged.currentPage}
        pageCount={paged.pageCount}
        pageSize={pageSize}
        total={rows.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          reset();
        }}
      />
    </Panel>
  );
}
