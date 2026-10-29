import { Button, inputClassName } from "@/app/components/ui";
import type { PhoneEditor } from "@/app/hooks/use-phone-editor";

export function PhoneListEditor({
  contactPhones,
  editor,
}: {
  contactPhones: string[];
  editor: PhoneEditor;
}) {
  return (
    <div className="mt-6 rounded-2xl bg-slate-50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-sys-900">
            เบอร์ติดต่อฉุกเฉิน
          </p>
          <p className="mt-1 text-xs text-slate-500">
            เพิ่มหรือแก้ไขเบอร์ที่ SYS ใช้ติดต่อได้ สูงสุด 3 เบอร์
          </p>
        </div>
        {!editor.isEditing && (
          <Button variant="secondary" onClick={editor.startEditing}>
            แก้ไขเบอร์ติดต่อ
          </Button>
        )}
      </div>
      {editor.isEditing ? (
        <>
          <div className="mt-4 space-y-3">
            {editor.phoneDrafts.map((phone, index) => (
              <div
                key={`contact-phone-${index}`}
                className="flex items-center gap-2"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => editor.updateDraft(index, event.target.value)}
                  className={inputClassName}
                  aria-label={`เบอร์ติดต่อฉุกเฉิน ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="secondary"
                  aria-label={`ลบเบอร์ติดต่อฉุกเฉิน ${index + 1}`}
                  onClick={() => editor.removeDraft(index)}
                >
                  ลบ
                </Button>
              </div>
            ))}
            {editor.phoneDrafts.length < 3 && (
              <Button type="button" variant="secondary" onClick={editor.addDraft}>
                เพิ่มเบอร์โทร
              </Button>
            )}
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={editor.cancelEditing}>
              ยกเลิก
            </Button>
            <Button onClick={editor.save}>บันทึกเบอร์โทร</Button>
          </div>
          {editor.phoneError && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {editor.phoneError}
            </p>
          )}
        </>
      ) : (
        <ol className="mt-4 space-y-2">
          {contactPhones.map((phone, index) => (
            <li
              key={`${phone}-${index}`}
              className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-sys-800"
            >
              <span className="text-xs text-slate-400">
                เบอร์ {index + 1}
              </span>
              <span>{phone}</span>
              {index === 0 && (
                <span className="ml-auto text-[11px] text-slate-400">
                  เบอร์หลัก
                </span>
              )}
            </li>
          ))}
          {contactPhones.length === 0 && (
            <li className="text-sm text-slate-500">ยังไม่ได้ระบุเบอร์ติดต่อ</li>
          )}
        </ol>
      )}
    </div>
  );
}
