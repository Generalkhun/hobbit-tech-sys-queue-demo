import { Icon } from "@/app/components/icons";
import { Button, FieldLabel, inputClassName, Panel } from "@/app/components/ui";

export function ContactStep({
  contactPhone,
  verificationCode,
  codeError,
  onPhoneChange,
  onCodeChange,
  onConfirm,
}: {
  contactPhone: string;
  verificationCode: string;
  codeError: string;
  onPhoneChange: (phone: string) => void;
  onCodeChange: (code: string) => void;
  onConfirm: () => void;
}) {
  return (
    <Panel className="mx-auto max-w-2xl p-6 sm:p-8">
      <h2 className="text-xl font-bold text-sys-900">ยืนยันตัวตนคนขับ</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        ขอรหัส 6 หลักจากผู้ส่งเหล็ก แล้วกรอกเบอร์โทรศัพท์ที่ SYS ใช้ติดต่อกลับ
      </p>
      <div className="mt-6 space-y-4">
        <FieldLabel label="เบอร์โทรศัพท์ติดต่อ" required>
          <input
            type="tel"
            value={contactPhone}
            onChange={(event) => onPhoneChange(event.target.value)}
            className={inputClassName}
            placeholder="เช่น 0812345678"
            required
          />
        </FieldLabel>
        <FieldLabel label="รหัสยืนยัน 6 หลักจากผู้ส่งเหล็ก" required>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            value={verificationCode}
            onChange={(event) => onCodeChange(event.target.value)}
            className={`${inputClassName} text-center text-xl tracking-[0.5em]`}
            placeholder="••••••"
            required
          />
        </FieldLabel>
        {codeError && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {codeError}
          </p>
        )}
        <Button className="w-full" onClick={onConfirm}>
          ยืนยันและเช็คอิน <Icon name="arrow" size={16} />
        </Button>
      </div>
    </Panel>
  );
}
