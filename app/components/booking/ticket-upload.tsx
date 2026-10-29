import { Icon } from "@/app/components/icons";

interface TicketUploadProps {
  ticketName: string;
  onChange: (name: string) => void;
}

export function TicketUpload({ ticketName, onChange }: TicketUploadProps) {
  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <p className="mb-2 text-sm font-medium text-slate-700">
        ใบชั่งต้นทาง <span className="text-rose-500">*</span>
      </p>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-sys-200 bg-sys-50/40 px-4 py-6 text-center transition hover:bg-sys-50">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sys-600 shadow-sm">
          <Icon name="file" size={20} />
        </span>
        <span className="mt-3 text-sm font-semibold text-sys-800">
          คลิกเพื่อแนบใบชั่งต้นทาง
        </span>
        <span className="mt-1 text-xs text-slate-400">
          รองรับ PDF, JPG, PNG · {ticketName || "ยังไม่ได้เลือกไฟล์"}
        </span>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="sr-only"
          onChange={(event) => onChange(event.target.files?.[0]?.name ?? "")}
        />
      </label>
    </div>
  );
}
