import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";

export function CompleteStep({
  contactPhone,
  hasOtherActiveBooking,
  onOpenQueue,
  onCheckinOther,
}: {
  contactPhone: string;
  hasOtherActiveBooking: boolean;
  onOpenQueue: () => void;
  onCheckinOther: () => void;
}) {
  return (
    <Panel className="mx-auto max-w-2xl p-8 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-700">
        <Icon name="circle-check" size={32} />
      </div>
      <h2 className="mt-5 text-xl font-bold text-sys-900">
        เช็คอิน online เรียบร้อย
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        ระบบจะแสดงสถานะรอคิว และ SYS จะติดต่อกลับที่เบอร์ {contactPhone}
      </p>
      <Button className="mt-6" onClick={onOpenQueue}>
        ไปหน้าแถบรอคิว
      </Button>
      {hasOtherActiveBooking && (
        <button
          type="button"
          className="mt-4 block w-full text-sm font-semibold text-sys-700"
          onClick={onCheckinOther}
        >
          เช็คอินงานอื่น
        </button>
      )}
    </Panel>
  );
}
