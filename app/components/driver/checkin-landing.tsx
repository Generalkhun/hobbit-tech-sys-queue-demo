import { Icon } from "@/app/components/icons";
import { Button, inputClassName, Panel } from "@/app/components/ui";
import { checkinRadiusKm } from "@/app/data/driver-checkin";
import type { QueueBooking } from "@/app/types/queue";

export function CheckinLanding({
  activeBookings,
  selectedBooking,
  locationError,
  isCheckingLocation,
  onSelectBooking,
  onBegin,
}: {
  activeBookings: QueueBooking[];
  selectedBooking: QueueBooking | undefined;
  locationError: string;
  isCheckingLocation: boolean;
  onSelectBooking: (bookingId: string) => void;
  onBegin: () => void;
}) {
  return (
    <Panel className="mx-auto flex min-h-[420px] max-w-2xl flex-col items-center justify-center p-8 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-sys-50 text-sys-700">
        <Icon name="map" size={30} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-sys-900">
        เริ่มเช็คอินระยะไกล
      </h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
        ต้องอยู่ห่างจากโรงงานปลายทางไม่เกิน {checkinRadiusKm} กิโลเมตร
        และอนุญาตให้ browser เข้าถึงตำแหน่งก่อนเริ่มเช็คอิน online
      </p>
      {activeBookings.length > 1 && (
        <label className="mt-5 flex w-full max-w-sm flex-col gap-2 text-left text-sm font-medium text-slate-700">
          เลือกงาน
          <select
            value={selectedBooking?.id ?? ""}
            onChange={(event) => onSelectBooking(event.target.value)}
            className={inputClassName}
          >
            {activeBookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.id} · {booking.plantId} · {booking.date}
              </option>
            ))}
          </select>
        </label>
      )}
      {selectedBooking && (
        <p className="mt-4 text-xs font-medium text-sys-700">
          งาน {selectedBooking.id} · {selectedBooking.plantId}
        </p>
      )}
      {locationError && (
        <p role="alert" className="mt-4 max-w-lg rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {locationError}
        </p>
      )}
      <Button
        className="mt-6 min-h-14 px-8 text-base"
        onClick={onBegin}
        disabled={isCheckingLocation || !selectedBooking}
      >
        <Icon name="map" size={19} />
        {isCheckingLocation ? "กำลังตรวจสอบตำแหน่ง…" : "เริ่ม check-in"}
      </Button>
      <p className="mt-4 max-w-lg text-[11px] leading-5 text-amber-700">
        พิกัดโรงงานในระบบนี้เป็นพิกัดตัวอย่างสำหรับ demo
        กรุณาตั้งค่าพิกัดจริงก่อนใช้งานจริง
      </p>
    </Panel>
  );
}
