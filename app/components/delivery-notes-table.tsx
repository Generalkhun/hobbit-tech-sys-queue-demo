"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/app/components/icons";
import type { DeliveryListItem } from "@/app/types/delivery";
import type { DeliveryDraft, QueueBooking } from "@/app/types/queue";

function getItemId(item: DeliveryListItem) {
  return item.kind === "draft" ? item.draft.id : item.booking.id;
}

function getStatus(item: DeliveryListItem) {
  if (item.kind === "booking") {
    return { label: "บันทึกข้อมูลสำเร็จ", complete: true };
  }

  const stageLabels = [
    "ข้อมูลการจัดส่ง",
    "รถยนต์",
    "พนักงานขับรถยนต์",
  ] as const;
  return { label: stageLabels[item.draft.step], complete: false };
}

export function DeliveryNotesTable({
  items,
  onSelectDraft,
  onSelectBooking,
}: {
  items: DeliveryListItem[];
  onSelectDraft: (draft: DeliveryDraft) => void;
  onSelectBooking: (booking: QueueBooking) => void;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("th");
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      const text =
        item.kind === "draft"
          ? [
              item.draft.id,
              item.draft.retailer,
              item.draft.broker,
              item.draft.plate,
              item.draft.driver,
            ]
          : [
              item.booking.id,
              item.booking.retailer,
              item.booking.broker,
              item.booking.plate,
              item.booking.driver,
              item.booking.grade,
            ];
      return text.join(" ").toLocaleLowerCase("th").includes(normalizedQuery);
    });
  }, [items, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <span className="text-xs text-slate-500">
          รายการใบนำส่ง {filtered.length} รายการ
        </span>
        <div className="relative">
          <Icon
            name="search"
            size={15}
            className="absolute left-3 top-3 text-slate-400"
          />
          <input
            className="h-10 w-64 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="ค้นหาเลขที่ ร้านค้า ทะเบียนรถ"
            aria-label="ค้นหาใบนำส่ง"
          />
        </div>
      </div>

      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-6 py-3.5">เลขที่ใบนำส่ง</th>
              <th className="px-4 py-3.5">ร้านค้า / ผู้ขาย</th>
              <th className="px-4 py-3.5">โรงงาน / เกรด</th>
              <th className="px-4 py-3.5">วันและเวลาจอง</th>
              <th className="px-4 py-3.5">รถ / ผู้ขับ</th>
              <th className="px-4 py-3.5">น้ำหนักสุทธิ</th>
              <th className="px-6 py-3.5">สถานะ</th>
              <th className="px-6 py-3.5 text-right">รายการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.map((item) => {
              const status = getStatus(item);
              const draft = item.kind === "draft" ? item.draft : null;
              const booking = item.kind === "booking" ? item.booking : null;
              const id = getItemId(item);
              return (
                <tr key={id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-bold text-sys-700">
                    {id}
                    <p className="mt-1 font-normal text-[10px] text-slate-400">
                      {draft ? "ยังไม่ออกใบนำส่ง" : "QR พร้อมใช้งาน"}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-700">
                      {draft?.retailer ?? booking?.retailer}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {draft?.broker ?? booking?.broker}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-700">
                      {booking?.plantId ?? "รอจัดสรรอัตโนมัติ"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {draft?.grade ?? booking?.grade}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-slate-600">
                      {draft?.date ?? booking?.date}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {draft?.timeSlot ?? booking?.timeSlot} น.
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-700">
                      {draft?.plate || booking?.plate || "—"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {draft?.driver || booking?.driver || "ยังไม่เลือก"}
                    </p>
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-600">
                    {draft
                      ? `${Math.max(0, Number(draft.heavyWeightKg) - Number(draft.lightWeightKg)).toLocaleString("th-TH")} กก.`
                      : `${((booking?.estimatedTons ?? 0) * 1000).toLocaleString("th-TH")} กก.`}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          status.complete ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                      />
                      {status.label}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        draft ? onSelectDraft(draft) : booking && onSelectBooking(booking)
                      }
                      className="font-semibold text-sys-700 hover:text-sys-900"
                    >
                      {draft ? "แก้ไขต่อ" : "ดูรายละเอียด"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {paginatedItems.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-400">
            ไม่พบใบนำส่งที่ตรงกับคำค้นหา
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6">
        <span>
          หน้า {currentPage} จาก {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ก่อนหน้า
          </button>
          <button
            type="button"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ถัดไป
          </button>
        </div>
      </div>
    </>
  );
}
