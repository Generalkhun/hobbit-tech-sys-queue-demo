"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { DatePicker } from "@/app/components/date-picker";
import { Icon } from "@/app/components/icons";
import { RowsPagination } from "@/app/components/shared/rows-pagination";
import { SearchInput } from "@/app/components/shared/search-input";
import { Panel } from "@/app/components/ui";
import {
  getOpsLogs,
  subscribeToOpsLogs,
} from "@/app/data/ops-log";
import { operationStatusStyle } from "@/app/data/operations";
import { matchesSearch, paginate } from "@/app/data/registry";

export function OpsHistoryPage({ date }: { date?: string }) {
  const [selectedDate, setSelectedDate] = useState(date ?? "");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortDesc, setSortDesc] = useState(true);
  // Live update เมื่อมี log ใหม่จากหน้าจัดการการจัดส่ง
  useSyncExternalStore(
    subscribeToOpsLogs,
    () => 1,
    () => 0,
  );

  const logs = useMemo(() => {
    const all = getOpsLogs(selectedDate || undefined);
    return all.sort((a, b) =>
      sortDesc ? b.at.localeCompare(a.at) : a.at.localeCompare(b.at),
    );
  }, [selectedDate, sortDesc]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return logs.filter((entry) =>
      matchesSearch(
        [
          entry.bookingId,
          entry.booking.plate,
          entry.booking.retailer,
          entry.actionLabel,
          entry.note,
          entry.actor,
        ],
        keyword,
      ),
    );
  }, [logs, query]);

  const paged = paginate(filtered, page, pageSize);
  const reset = () => setPage(1);

  function formatAt(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <Panel className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name="clipboard" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sys-900">ประวัติการจัดส่ง (Log Archive)</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              ทุกการดำเนินการย้ายสถานะใน pipeline บันทึก timestamp ละเอียด
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-end gap-3">
          <div>
            <p className="mb-2 text-[11px] font-semibold text-slate-500">เลือกวันที่</p>
            <DatePicker value={selectedDate || "2026-10-27"} onChange={(value) => {
              setSelectedDate(value);
              reset();
            }} />
          </div>
          <button
            type="button"
            aria-label={selectedDate ? "ล้างการกรองวันที่" : "กรองตามวันที่"}
            onClick={() => {
              setSelectedDate("");
              reset();
            }}
            className="mb-0.5 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <Icon name="close" size={15} />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
        <SearchInput
          value={query}
          onChange={(value) => {
            setQuery(value);
            reset();
          }}
          label="ค้นหาประวัติ"
          placeholder="ค้นหาใบนำส่ง, ทะเบียน, ผู้กระทำ..."
        />
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          onClick={() => setSortDesc((current) => !current)}
        >
          <Icon name="arrow" size={13} className={sortDesc ? "" : "rotate-180"} />
          เรียงตามเวลา {sortDesc ? "ล่าสุดก่อน" : "เก่าสุดก่อน"}
        </button>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="text-[11px] font-semibold text-slate-500">
            <tr className="border-y border-slate-100">
              <th className="px-4 py-3 pl-6">เวลา</th>
              <th className="px-4 py-3">ใบนำส่ง</th>
              <th className="px-4 py-3">ทะเบียน</th>
              <th className="px-4 py-3">ร้านค้า</th>
              <th className="px-4 py-3">ดำเนินการ</th>
              <th className="px-4 py-3">จาก → ไป</th>
              <th className="px-4 py-3">ผู้กระทำ</th>
              <th className="px-4 py-3 pr-6">หมายเหตุ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.items.map((entry) => (
              <tr key={entry.id} className="align-top hover:bg-slate-50/60">
                <td className="whitespace-nowrap px-4 py-3.5 pl-6 font-medium text-slate-600">
                  {formatAt(entry.at)}
                </td>
                <td className="px-4 py-3.5 font-semibold text-sys-700">
                  {entry.bookingId}
                </td>
                <td className="px-4 py-3.5 text-slate-600">{entry.booking.plate}</td>
                <td className="px-4 py-3.5 text-slate-600">{entry.booking.retailer}</td>
                <td className="px-4 py-3.5">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                    {entry.actionLabel}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="flex items-center gap-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${operationStatusStyle[entry.from]?.className ?? "bg-slate-400"}`}>
                      {operationStatusStyle[entry.from]?.label ?? entry.from}
                    </span>
                    <Icon name="arrow" size={11} className="text-slate-300" />
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${operationStatusStyle[entry.to]?.className ?? "bg-slate-400"}`}>
                      {operationStatusStyle[entry.to]?.label ?? entry.to}
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3.5 text-slate-500">{entry.actor}</td>
                <td className="max-w-[220px] px-4 py-3.5 pr-6 text-[11px] leading-4 text-slate-400">
                  {entry.note || "-"}
                  {entry.attachments.length > 0 && (
                    <span className="mt-1 flex flex-wrap gap-1.5">
                      {entry.attachments.map((file) => (
                        <a
                          key={file.url}
                          href={file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-sys-700 hover:bg-sys-50"
                        >
                          <Icon name="document" size={10} />
                          {file.name}
                        </a>
                      ))}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-slate-400">
            ไม่พบประวัติที่ตรงกับเงื่อนไข
          </div>
        )}
      </div>
      <RowsPagination
        page={paged.currentPage}
        pageCount={paged.pageCount}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          reset();
        }}
      />
    </Panel>
  );
}
