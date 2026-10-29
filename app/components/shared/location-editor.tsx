"use client";

import { useState } from "react";
import { LocationFields } from "@/app/components/shared/location-fields";
import { Button, Panel } from "@/app/components/ui";
import type { SellerLocation } from "@/app/types/seller";

export function LocationEditor({
  location,
  canEdit,
  onSave,
}: {
  location: SellerLocation;
  canEdit: boolean;
  onSave: (location: SellerLocation) => void;
}) {
  const [draft, setDraft] = useState(location);
  const dirty =
    draft.province !== location.province ||
    draft.address !== location.address ||
    draft.photo !== location.photo;

  return (
    <Panel className="space-y-4 p-5 sm:p-6">
      <h3 className="font-bold text-sys-900">ที่ตั้ง</h3>
      <LocationFields value={draft} onChange={setDraft} disabled={!canEdit} />
      {canEdit && (
        <Button
          disabled={!dirty || !draft.province.trim() || !draft.address.trim()}
          onClick={() =>
            onSave({
              ...draft,
              province: draft.province.trim(),
              address: draft.address.trim(),
            })
          }
        >
          บันทึกที่ตั้ง
        </Button>
      )}
    </Panel>
  );
}
