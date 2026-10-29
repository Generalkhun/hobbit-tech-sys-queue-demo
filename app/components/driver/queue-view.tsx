import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import { PhoneListEditor } from "@/app/components/driver/phone-list-editor";
import type { PhoneEditor } from "@/app/hooks/use-phone-editor";
import type { DriverCheckinProgress, QueueBooking } from "@/app/types/queue";

export function QueueView({
  progress,
  checkinBooking,
  contactPhones,
  phoneEditor,
  onOpenCheckin,
}: {
  progress: DriverCheckinProgress;
  checkinBooking: QueueBooking | undefined;
  contactPhones: string[];
  phoneEditor: PhoneEditor;
  onOpenCheckin: () => void;
}) {
  if (progress.step !== "complete") {
    return (
      <Panel className="mx-auto max-w-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-sys-900">
          ยังไม่ได้เช็คอิน online
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          เช็คอินและยืนยันตัวตนก่อน เพื่อติดตามสถานะรอคิว
        </p>
        <Button className="mt-6" onClick={onOpenCheckin}>
          ไปหน้าเช็คอิน online
        </Button>
      </Panel>
    );
  }

  return (
    <Panel className="mx-auto max-w-2xl p-6 sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
        <Icon name="clock" size={30} />
      </div>
      <h2 className="mt-5 text-center text-xl font-bold text-sys-900">
        สถานะ: รอคิว
      </h2>
      <p className="mt-2 text-center text-sm leading-6 text-slate-500">
        กรุณารอ SYS ติดต่อกลับที่เบอร์โทรศัพท์ที่บันทึกไว้ด้านล่าง
      </p>
      <PhoneListEditor contactPhones={contactPhones} editor={phoneEditor} />
      {checkinBooking && (
        <p className="mt-5 text-center text-xs text-slate-400">
          งาน {checkinBooking.id} · {checkinBooking.plantId}
        </p>
      )}
    </Panel>
  );
}
