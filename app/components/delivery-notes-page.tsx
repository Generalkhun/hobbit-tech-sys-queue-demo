"use client";

import { useMemo } from "react";
import { Icon } from "@/app/components/icons";
import { DeliveryNotesTable } from "@/app/components/delivery-notes-table";
import type {
  DeliveryDraft,
  QueueBooking,
} from "@/app/types/queue";
import { Panel } from "@/app/components/ui";

export function DeliveryNotesPage({
  bookings,
  drafts,
  canCreateBooking,
  onCreateBooking,
  onSelectDraft,
  onSelectBooking,
}: {
  bookings: QueueBooking[];
  drafts: DeliveryDraft[];
  canCreateBooking: boolean;
  onCreateBooking: () => void;
  onSelectDraft: (draft: DeliveryDraft) => void;
  onSelectBooking: (booking: QueueBooking) => void;
}) {
  const items = useMemo(
    () => [
      ...drafts.map((draft) => ({ kind: "draft" as const, draft })),
      ...bookings.map((booking) => ({ kind: "booking" as const, booking })),
    ],
    [bookings, drafts],
  );

  return (
    <div className="space-y-6">
      <Panel className="flex min-h-[220px] flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sys-50 text-sys-700">
          <Icon name="document" size={25} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-sys-900">
            ใบนำส่งเศษเหล็ก
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            สร้างใบนำส่งใหม่ หรือเลือกใบนำส่งเดิมเพื่อแก้ไขและติดตามสถานะ
          </p>
        </div>
        {canCreateBooking && (
          <button
            type="button"
            onClick={onCreateBooking}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-sys-600 px-5 text-sm font-semibold text-white hover:bg-sys-700"
          >
            <Icon name="plus" size={17} />
            สร้างใบนำส่ง
          </button>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h3 className="font-bold text-sys-900">รายการใบนำส่ง</h3>
          <p className="mt-1 text-xs text-slate-400">
            ใบที่ยังไม่เสร็จสามารถแก้ไขต่อได้ ส่วนใบที่บันทึกสำเร็จเปิดดูได้อย่างเดียว
          </p>
        </div>
        <DeliveryNotesTable
          items={items}
          onSelectDraft={onSelectDraft}
          onSelectBooking={onSelectBooking}
        />
      </Panel>
    </div>
  );
}
