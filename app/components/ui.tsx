import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { BookingStatus } from "@/app/types/queue";

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "quiet" | "success";
}) {
  const styles = {
    primary: "bg-sys-600 text-white shadow-sm hover:bg-sys-700",
    secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    quiet: "text-slate-600 hover:bg-slate-100",
    success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700",
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-slate-100 bg-white shadow-[0_6px_25px_rgba(27,74,89,0.035)] ${className}`}
    >
      {children}
    </section>
  );
}

const statusContent: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "ยืนยันแล้ว",
    className: "bg-sys-50 text-sys-700 ring-sys-100",
  },
  waiting: {
    label: "รอเรียกคิว",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  "checked-in": {
    label: "เช็คอินแล้ว",
    className: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  "at-gate": {
    label: "จัดคิวแล้ว",
    className: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  "call-requested": {
    label: "ปศ. แจ้ง รปภ. ให้เรียกรถ",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  called: {
    label: "รปภ. โทรเรียกแล้ว",
    className: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  "no-answer": {
    label: "โทรแล้วไม่รับ",
    className: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  completed: {
    label: "ผ่านป้อม · ออกใบนำผ่านแล้ว",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const content = statusContent[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${content.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {content.label}
    </span>
  );
}

export function FieldLabel({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
      <span>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition focus:border-sys-400 focus:ring-4 focus:ring-sys-50";
