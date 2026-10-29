import { DeliverySlip } from "@/app/components/delivery-slip";
import { Panel } from "@/app/components/ui";
import type { QueueBooking } from "@/app/types/queue";

export function DriverPassView({ booking }: { booking: QueueBooking | undefined }) {
  return (
    <div className="space-y-4">
      <Panel className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-sys-900">ใบนำส่งสำหรับงานนี้</h2>
        <p className="mt-1 text-xs text-slate-500">
          ใบนำส่งฉบับเดียวกับที่พิมพ์ติดรถ พร้อม QR Code สำหรับสแกน
        </p>
      </Panel>
      {booking ? (
        <DeliverySlip
          key={booking.id}
          booking={booking}
          onGenerateVerificationCode={() => null}
          showVerificationSection={false}
          showPrintButton={false}
          showStatusBadge={false}
        />
      ) : (
        <Panel className="p-10 text-center text-sm text-slate-500">
          ยังไม่มีใบนำส่งที่กำหนดให้รถ/ผู้ขับของคุณ
        </Panel>
      )}
    </div>
  );
}
