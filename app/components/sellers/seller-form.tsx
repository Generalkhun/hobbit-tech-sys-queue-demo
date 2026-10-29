"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { Button } from "@/app/components/ui";
import type { NewSellerInput } from "@/app/types/seller";

const fields = [
  ["name", "ชื่อผู้ขาย"],
  ["coordinator", "ผู้ประสานงาน"],
  ["phone", "เบอร์ติดต่อ"],
] as const;

const emptyForm: NewSellerInput = { name: "", coordinator: "", phone: "" };

export function SellerForm({
  onSubmit,
}: {
  onSubmit: (input: NewSellerInput) => void;
}) {
  const [form, setForm] = useState(emptyForm);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name: form.name.trim(),
      coordinator: form.coordinator.trim(),
      phone: form.phone.trim(),
    });
    setForm(emptyForm);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 border-b border-slate-100 bg-sys-50/40 p-5 sm:grid-cols-[1fr_1fr_1fr_auto]"
    >
      {fields.map(([key, label]) => (
        <label
          key={key}
          className="flex flex-col gap-1.5 text-xs font-medium text-slate-600"
        >
          {label}
          <input
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sys-400"
            value={form[key]}
            onChange={(event) =>
              setForm((current) => ({ ...current, [key]: event.target.value }))
            }
            required
          />
        </label>
      ))}
      <div className="flex items-end">
        <Button type="submit" className="w-full">
          <Icon name="check" size={15} />
          บันทึกข้อมูล
        </Button>
      </div>
    </form>
  );
}
