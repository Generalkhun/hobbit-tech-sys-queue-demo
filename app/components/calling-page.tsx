"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { OperationsSummary } from "@/app/components/operations/operations-summary";
import { OperationsTable } from "@/app/components/operations/operations-table";
import { demoDate } from "@/app/data/mock-data";
import { getSummaryCounts, getTodayBookings } from "@/app/data/operations";
import type { BookingStatus, PlanRow, QueueBooking } from "@/app/types/queue";

export function CallingPage({
  bookings,
  plans,
  vehicles,
  onStatusChange,
  onMoveBooking,
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  vehicles: { plate: string; vehicleType: string }[];
  onStatusChange: (id: string, status: BookingStatus) => string | null;
  onMoveBooking: (bookingId: string, targetPlantId: string) => string | null;
}) {
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [refreshedAt, setRefreshedAt] = useState("");
  const today = getTodayBookings(bookings, demoDate);

  function report(error: string | null, success: string) {
    setNotice({ text: error ?? success, error: Boolean(error) });
  }

  function destinationFor(booking: QueueBooking) {
    return plans.find(
      (plan) => plan.grade === booking.grade && plan.plantId !== booking.plantId,
    )?.plantId;
  }

  return (
    <div className="space-y-6">
      <OperationsSummary {...getSummaryCounts(today)} />
      {notice && (
        <p
          role={notice.error ? "alert" : "status"}
          className={`rounded-lg px-4 py-3 text-xs ${
            notice.error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </p>
      )}
      {refreshedAt && (
        <p className="text-[11px] text-slate-400">รีเฟรชล่าสุด {refreshedAt} น.</p>
      )}
      <OperationsTable
        bookings={today}
        vehicles={vehicles}
        onRefresh={() =>
          setRefreshedAt(
            new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }),
          )
        }
        renderAction={(booking) => {
          const destination = destinationFor(booking);
          return (
            <div className="flex flex-col items-end gap-1.5">
              {booking.status === "at-gate" && (
                <button
                  type="button"
                  onClick={() =>
                    report(
                      onStatusChange(booking.id, "call-requested"),
                      `แจ้ง รปภ. ให้โทรเรียกรถ ${booking.plate} แล้ว`,
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-md border border-sys-500 px-5 py-2 text-xs font-bold text-sys-700 hover:bg-sys-50"
                >
                  <Icon name="phone" size={13} />
                  โทรแจ้ง
                </button>
              )}
              {booking.status === "call-requested" && (
                <span className="text-[11px] text-amber-700">รปภ. กำลังโทรเรียก</span>
              )}
              {booking.status === "called" && (
                <span className="text-[11px] text-violet-700">รอรถผ่านป้อมพร้อมใบนำผ่าน</span>
              )}
              {(booking.status === "waiting" || booking.status === "confirmed") && (
                <span className="text-[11px] text-slate-400">รอ รปภ. ตรวจรถ</span>
              )}
              {booking.status !== "completed" && destination && (
                <button
                  type="button"
                  className="text-[11px] font-semibold text-sys-700 hover:text-sys-900"
                  onClick={() =>
                    report(
                      onMoveBooking(booking.id, destination),
                      `${booking.id} โยกจาก ${booking.plantId} ไป ${destination} แล้ว`,
                    )
                  }
                >
                  โยกไป {booking.plantId === "SYS1" ? "SYS 2" : "SYS 1"}
                </button>
              )}
            </div>
          );
        }}
      />
    </div>
  );
}
