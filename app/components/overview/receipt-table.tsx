import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import type { BookingReceipt, QueueBooking } from "@/app/types/queue";

export function ReceiptTable({
  bookings,
  receipts,
  date,
  queueActionLabel,
  onReceiptChange,
  onOpenQueue,
}: {
  bookings: QueueBooking[];
  receipts: Record<string, BookingReceipt>;
  date: string;
  queueActionLabel: string;
  onReceiptChange: (bookingId: string, receipt: BookingReceipt) => void;
  onOpenQueue: () => void;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sys-900">บันทึกยอดรับจริง / การไม่มาตามนัด</h3>
            <p className="mt-1 text-xs text-slate-400">
              เลือกสถานะและกรอกวันที่กับน้ำหนักที่รับจริง เพื่อให้ dashboard สรุปผลได้
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenQueue}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sys-700"
          >
            {queueActionLabel} <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-500">
            <tr>
              <th className="px-6 py-3">ใบนำส่ง</th>
              <th className="px-4 py-3">โรงงาน / เกรด</th>
              <th className="px-4 py-3">ผู้ขาย / ร้านค้า</th>
              <th className="px-4 py-3">วันที่จอง</th>
              <th className="px-4 py-3">บันทึกผล</th>
              <th className="px-4 py-3">วันที่รับจริง</th>
              <th className="px-6 py-3">รับจริง (กก.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((booking) => {
              const receipt: BookingReceipt = receipts[booking.id] ?? {
                state: "pending",
                receivedDate: "",
                receivedKg: 0,
              };
              return (
                <tr key={booking.id}>
                  <td className="px-6 py-3.5 font-semibold text-sys-700">{booking.id}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-700">{booking.plantId}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{booking.grade}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-slate-700">{booking.broker}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{booking.retailer}</p>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {booking.date} · {booking.timeSlot}
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={receipt.state}
                      onChange={(event) => {
                        const state = event.target.value as BookingReceipt["state"];
                        onReceiptChange(booking.id, {
                          ...receipt,
                          state,
                          receivedDate:
                            state === "received"
                              ? receipt.receivedDate || booking.date
                              : "",
                          receivedKg: state === "received" ? receipt.receivedKg : 0,
                        });
                      }}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs"
                      aria-label={`ผลการมาของ ${booking.id}`}
                    >
                      <option value="pending">ยังไม่ระบุ</option>
                      <option value="received">เข้ารับแล้ว</option>
                      <option value="no-show" disabled={booking.date !== date}>
                        ไม่มาตามนัด
                      </option>
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <input
                      type="date"
                      value={receipt.receivedDate || booking.date}
                      disabled={receipt.state !== "received"}
                      onChange={(event) =>
                        onReceiptChange(booking.id, {
                          ...receipt,
                          receivedDate: event.target.value,
                        })
                      }
                      className="h-9 rounded-lg border border-slate-200 px-2 text-xs disabled:bg-slate-50 disabled:text-slate-400"
                      aria-label={`วันที่รับจริง ${booking.id}`}
                    />
                  </td>
                  <td className="px-6 py-3.5">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={receipt.state === "received" ? receipt.receivedKg : ""}
                      disabled={receipt.state !== "received"}
                      onChange={(event) =>
                        onReceiptChange(booking.id, {
                          ...receipt,
                          receivedKg: Number(event.target.value),
                        })
                      }
                      className="h-9 w-28 rounded-lg border border-slate-200 px-2 text-xs disabled:bg-slate-50"
                      aria-label={`น้ำหนักรับจริง ${booking.id}`}
                    />
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                  ไม่มีใบนำส่งในวันที่เลือก
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
