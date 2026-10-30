"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/icons";
import { RowsPagination } from "@/app/components/shared/rows-pagination";
import { SearchInput } from "@/app/components/shared/search-input";
import { TabBar } from "@/app/components/shared/tab-bar";
import { Panel } from "@/app/components/ui";
import { getGradeColor } from "@/app/data/grade-colors";
import {
  compareTime,
  countByTab,
  filterByTab,
  formatDmy,
  getVehicleTypeByPlate,
  operationStatusStyle,
  operationTabs,
  slotStart,
  waitingMinutes,
  type OperationTab,
} from "@/app/data/operations";
import { matchesSearch, paginate } from "@/app/data/registry";
import { computeLateMinutes } from "@/app/hooks/use-queue-bookings";
import type { CheckinTimes, NoAnswerCounts, QueueBooking } from "@/app/types/queue";
import type { ReactNode } from "react";

export interface OpsTableRow {
  booking: QueueBooking;
  /** เวลาเช็คอินจริง (ถ้ามี) */
  checkinTime?: string;
  /** จำนวนครั้งที่โทรแล้วไม่รับ */
  noAnswerCount: number;
  /** นาทีที่รอแล้ว (เฉพาะสถานะรอจัดคิว/โทรไม่ติด) */
  waitMinutes: number;
  /** ความสาย (นาที) ถ้าเช็คอินช้ากว่ากำหนด 10 นาที */
  lateMinutes: number;
}

export function OperationsTable({
  bookings,
  vehicles,
  checkinTimes,
  noAnswerCounts,
  grades,
  renderAction,
  onRefresh,
}: {
  bookings: QueueBooking[];
  vehicles: { plate: string; vehicleType: string }[];
  checkinTimes: CheckinTimes;
  noAnswerCounts: NoAnswerCounts;
  /** ลำดับเกรดสำหรับสี Badge (reuse จากแผนรับเหล็ก) */
  grades: string[];
  renderAction: (row: OpsTableRow) => ReactNode;
  onRefresh: () => void;
}) {
  const [tab, setTab] = useState<OperationTab>("delivering");
  const [query, setQuery] = useState("");
  const [plantId, setPlantId] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const counts = countByTab(bookings);

  const rows: OpsTableRow[] = useMemo(() => {
    return filterByTab(bookings, tab)
      .filter((booking) => plantId === "all" || booking.plantId === plantId)
      .filter((booking) => timeFilter === "all" || booking.timeSlot === timeFilter)
      .filter((booking) =>
        matchesSearch(
          [booking.id, booking.retailer, booking.driver, booking.plate, booking.carrier],
          query,
        ),
      )
      .map((booking) => {
        const checkinTime = checkinTimes[booking.id];
        const inWaiting =
          booking.status === "at-gate" ||
          booking.status === "checked-in" ||
          booking.status === "no-answer";
        // ถ้ายังไม่มีเวลาเช็คอิน (ข้อมูล mock) ให้ใช้เวลาสร้างใบนำส่งเป็นตัวประมาณเวลาที่เริ่มรอ
        const waitBase = checkinTime ?? (booking.createdAt || "");
        return {
          booking,
          checkinTime,
          noAnswerCount: noAnswerCounts[booking.id] ?? 0,
          waitMinutes: inWaiting ? waitingMinutes(waitBase) : 0,
          lateMinutes: checkinTime
            ? computeLateMinutes(booking.timeSlot, checkinTime)
            : 0,
        };
      })
      .sort((a, b) => {
        // รถที่รอนานที่สุดขึ้นก่อน — priority ลำดับแรก (รอจัดคิว/โทรไม่ติด)
        const waitingPriority = Number(b.waitMinutes > 0) - Number(a.waitMinutes > 0);
        if (waitingPriority !== 0) return waitingPriority;
        if (b.waitMinutes !== a.waitMinutes) return b.waitMinutes - a.waitMinutes;
        // ถ้ารอเท่ากัน เรียงตามเวลานัดหมาย
        return compareTime(slotStart(a.booking.timeSlot), slotStart(b.booking.timeSlot));
      });
  }, [bookings, tab, plantId, timeFilter, query, checkinTimes, noAnswerCounts]);

  // ตัวเลือก filter ช่วงเวลา = slot ที่มีในรายการวันนี้
  const timeOptions = useMemo(() => {
    const slots = new Set<string>();
    bookings.forEach((booking) => slots.add(booking.timeSlot));
    return Array.from(slots).sort(compareTime);
  }, [bookings]);

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
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"
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
        <select
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600"
          aria-label="กรองตามช่วงเวลา"
          value={timeFilter}
          onChange={(event) => {
            setTimeFilter(event.target.value);
            reset();
          }}
        >
          <option value="all">ทุกช่วงเวลา</option>
          {timeOptions.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
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
        <table className="w-full min-w-[1400px] text-left text-xs">
          <thead className="text-[11px] font-semibold text-slate-500">
            <tr className="border-y border-slate-100">
              <th className="px-3 py-3 pl-6">เลขที่เอกสาร</th>
              <th className="px-3 py-3">ร้านค้า</th>
              <th className="px-3 py-3">โรงงาน</th>
              <th className="px-3 py-3">เกรด</th>
              <th className="px-3 py-3">ประเภทรถยนต์</th>
              <th className="px-3 py-3">เวลานัดหมาย</th>
              <th className="px-3 py-3">เวลา Check-in</th>
              <th className="px-3 py-3">รอแล้ว</th>
              <th className="px-3 py-3">สถานะ</th>
              <th className="px-3 py-3">สถานะผิดปกติ</th>
              <th className="px-3 py-3">หมายเหตุ</th>
              <th className="px-3 py-3 pr-6 text-right">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.items.map((row) => {
              const { booking, checkinTime, noAnswerCount, waitMinutes, lateMinutes } = row;
              const status = operationStatusStyle[booking.status];
              const gradeColor = getGradeColor(grades, booking.grade);
              return (
                <tr
                  key={booking.id}
                  className={`hover:bg-slate-50/60 ${
                    waitMinutes > 0 ? "bg-amber-50/40" : ""
                  }`}
                >
                  <td className="px-3 py-4 pl-6 font-semibold text-slate-700">
                    {booking.id}
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-slate-700">{booking.retailer}</p>
                    <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[10px] text-slate-500">
                      ทะเบียน: {booking.plate}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    {booking.plantId.replace("SYS", "SYS ")}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${gradeColor.soft} ${gradeColor.text}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${gradeColor.bar}`} />
                      {booking.grade}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    {getVehicleTypeByPlate(vehicles, booking.plate)}
                  </td>
                  <td className="px-3 py-4 text-slate-600">
                    {formatDmy(booking.date)} {booking.timeSlot} น.
                  </td>
                  <td className="px-3 py-4">
                    {checkinTime ? (
                      <span className="rounded bg-cyan-600 px-2 py-1 text-[10px] font-bold text-white">
                        {checkinTime} น.
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    {waitMinutes > 0 ? (
                      <span className="font-bold text-amber-700">
                        {waitMinutes >= 60
                          ? `${Math.floor(waitMinutes / 60)} ชม. ${waitMinutes % 60} นาที`
                          : `${waitMinutes} นาที`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    {lateMinutes >= 10 || noAnswerCount > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {lateMinutes >= 10 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 ring-1 ring-inset ring-amber-100">
                            <Icon name="clock" size={10} />
                            สาย {lateMinutes} นาที
                          </span>
                        )}
                        {noAnswerCount > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-100">
                            <Icon name="phone" size={10} />
                            โทรแล้วไม่รับ +{noAnswerCount}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-300">-</span>
                    )}
                  </td>
                  <td className="max-w-[170px] px-3 py-4 text-[11px] leading-4 text-slate-400">
                    {booking.schedulingReason ?? "-"}
                  </td>
                  <td className="px-3 py-4 pr-6 text-right">
                    {renderAction(row)}
                  </td>
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
