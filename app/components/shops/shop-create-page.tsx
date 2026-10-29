"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { BackLink } from "@/app/components/shared/back-link";
import { LocationFields } from "@/app/components/shared/location-fields";
import { ProfileFields } from "@/app/components/shared/profile-fields";
import { TextField } from "@/app/components/shared/text-field";
import { Button, Panel, inputClassName } from "@/app/components/ui";
import { NO_SELLER_LABEL } from "@/app/data/sellers";
import type { NewShopInput, Seller } from "@/app/types/seller";

const emptyShop: NewShopInput = {
  name: "",
  province: "",
  address: "",
  description: "",
  sellerId: null,
};

export function ShopCreatePage({
  sellers,
  onSubmit,
  onCancel,
}: {
  sellers: Seller[];
  onSubmit: (input: NewShopInput) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(emptyShop);
  const valid = [form.name, form.province, form.address].every((v) => v.trim());

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onSubmit(form);
      }}
    >
      <BackLink label="กลับไปรายการร้านค้าย่อย" onClick={onCancel} />
      <h2 className="text-lg font-bold text-sys-900">เพิ่มร้านค้าย่อย</h2>

      <Panel className="space-y-4 p-5 sm:p-6">
        <h3 className="font-bold text-sys-900">โปรไฟล์</h3>
        <ProfileFields
          name={form.name}
          value={{ avatar: form.avatar, description: form.description }}
          onChange={(profile) => setForm((current) => ({ ...current, ...profile }))}
        />
      </Panel>

      <Panel className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
        <h3 className="font-bold text-sys-900 sm:col-span-2">ข้อมูลร้านค้า</h3>
        <TextField
          label="ชื่อร้านค้า"
          value={form.name}
          onChange={(name) => setForm((current) => ({ ...current, name }))}
          required
        />
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          สังกัดผู้ขาย
          <select
            className={inputClassName}
            value={form.sellerId ?? ""}
            onChange={(event) =>
              setForm((current) => ({ ...current, sellerId: event.target.value || null }))
            }
          >
            <option value="">{NO_SELLER_LABEL}</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </label>
      </Panel>

      <Panel className="space-y-4 p-5 sm:p-6">
        <h3 className="font-bold text-sys-900">ที่ตั้ง</h3>
        <LocationFields
          value={{ province: form.province, address: form.address, photo: form.photo }}
          onChange={(location) => setForm((current) => ({ ...current, ...location }))}
        />
      </Panel>

      <div className="flex gap-3">
        <Button type="submit" disabled={!valid}>
          <Icon name="check" size={15} />
          บันทึกร้านค้า
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          ยกเลิก
        </Button>
      </div>
    </form>
  );
}
