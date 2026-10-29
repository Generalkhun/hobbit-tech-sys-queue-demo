import { DeliverySlip } from "@/app/components/delivery-slip";
import { Icon } from "@/app/components/icons";
import { Button } from "@/app/components/ui";
import type { QueueBooking } from "@/app/types/queue";

interface BookingSuccessStepProps {
  booking: QueueBooking;
  verificationCode?: string;
  onGenerateVerificationCode: (bookingId: string) => string | null;
  onReturnToList: () => void;
}

export function BookingSuccessStep({
  booking,
  verificationCode,
  onGenerateVerificationCode,
  onReturnToList,
}: BookingSuccessStepProps) {
  return (
    <div
      id="new-delivery-slip"
      className="space-y-5 border-t border-slate-100 px-5 py-6 sm:px-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <Icon name="circle-check" size={19} />
            บันทึกข้อมูลสำเร็จ
          </div>
          <p className="mt-1 text-xs text-slate-400">
            ใบนำส่งพร้อม QR Code สำหรับยืนยันรถที่ป้อม รปภ.
          </p>
        </div>
        <Button variant="secondary" onClick={onReturnToList}>
          <Icon name="plus" size={16} />
          กลับไปรายการใบนำส่ง
        </Button>
      </div>
      <DeliverySlip
        booking={booking}
        verificationCode={verificationCode}
        onGenerateVerificationCode={onGenerateVerificationCode}
      />
    </div>
  );
}
