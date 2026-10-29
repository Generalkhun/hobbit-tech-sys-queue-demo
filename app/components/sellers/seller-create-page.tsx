"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { BackLink } from "@/app/components/shared/back-link";
import { LocationFields } from "@/app/components/shared/location-fields";
import { ProfileFields } from "@/app/components/shared/profile-fields";
import { TextField } from "@/app/components/shared/text-field";
import { Button, Panel } from "@/app/components/ui";
import { getSellerName } from "@/app/data/sellers";
import type { NewSellerInput, Seller, SellerShop } from "@/app/types/seller";

const emptySeller: NewSellerInput = {
  name: "",
  coordinator: "",
  phone: "",
  email: "",
  taxId: "",
  province: "",
  address: "",
  description: "",
  shopIds: [],
};

export function SellerCreatePage({
  sellers,
  shops,
  onSubmit,
  onCancel,
}: {
  sellers: Seller[];
  shops: SellerShop[];
  onSubmit: (input: NewSellerInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(emptySeller);
  const set = <K extends keyof NewSellerInput>(key: K, value: NewSellerInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const valid = [form.name, form.coordinator, form.phone, form.province, form.address]
    .every((value) => value.trim());

  function toggleShop(shopId: string) {
    set(
      "shopIds",
      form.shopIds.includes(shopId)
        ? form.shopIds.filter((id) => id !== shopId)
        : [...form.shopIds, shopId],
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onSubmit(form);
      }}
    >
      <BackLink label="กลับไปรายการผู้ขาย" onClick={onCancel} />
      <h2 className="text-lg font-bold text-sys-900">เพิ่มผู้ขายเศษเหล็ก</h2>

      <Panel className="space-y-4 p-5 sm:p-6">
        <h3 className="font-bold text-sys-900">โปรไฟล์</h3>
        <ProfileFields
          name={form.name}
          value={{ avatar: form.avatar, description: form.description }}
          onChange={(profile) => setForm((current) => ({ ...current, ...profile }))}
        />
      </Panel>

      <Panel className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h3 className="font-bold text-sys-900 sm:col-span-2">ข้อมูลผู้ขาย</h3>
        <TextField label="ชื่อผู้ขาย" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField label="ผู้ประสานงาน" value={form.coordinator} onChange={(v) => set("coordinator", v)} required />
        <TextField label="เบอร์ติดต่อ" value={form.phone} onChange={(v) => set("phone", v)} required />
        <TextField label="อีเมล" value={form.email} onChange={(v) => set("email", v)} />
        <TextField label="เลขประจำตัวผู้เสียภาษี" value={form.taxId} onChange={(v) => set("taxId", v)} />
      </Panel>

      <Panel className="space-y-4 p-5 sm:p-6">
        <h3 className="font-bold text-sys-900">ที่ตั้ง</h3>
        <LocationFields
          value={{ province: form.province, address: form.address, photo: form.photo }}
          onChange={(location) => setForm((current) => ({ ...current, ...location }))}
        />
      </Panel>

      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
          <h3 className="font-bold text-sys-900">
            ร้านค้าย่อยในสังกัด ({form.shopIds.length})
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            เลือกร้านที่จะย้ายเข้ามา จากผู้ขายรายอื่นหรือจากกลุ่มร้านที่ไม่มีผู้ขาย
          </p>
        </div>
        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
          {shops.map((shop) => (
            <li key={shop.id}>
              <label className="flex cursor-pointer items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50 sm:px-6">
                <input
                  type="checkbox"
                  checked={form.shopIds.includes(shop.id)}
                  onChange={() => toggleShop(shop.id)}
                />
                <span className="font-semibold text-slate-700">{shop.name}</span>
                <span className="text-xs text-slate-400">
                  {shop.province} · ปัจจุบัน: {getSellerName(sellers, shop.sellerId)}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </Panel>

      <div className="flex gap-3">
        <Button type="submit" disabled={!valid}>
          <Icon name="check" size={15} />
          บันทึกผู้ขาย
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
