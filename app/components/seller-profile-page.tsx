"use client";

import { useState } from "react";
import { Avatar, ProfileEditor } from "@/app/components/avatar";
import { LocationEditor } from "@/app/components/shared/location-editor";
import { Button, Panel } from "@/app/components/ui";
import { Icon } from "@/app/components/icons";
import type { ProfilePatch, Seller } from "@/app/types/seller";

export function SellerProfilePage({
  seller,
  onUpdateProfile,
}: {
  seller: Seller;
  onUpdateProfile: (sellerId: string, profile: ProfilePatch) => void;
}) {
  const [documents, setDocuments] = useState<
    { name: string; url: string }[]
  >([]);

  function addDocument(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDocuments((current) => [
      ...current,
      { name: file.name, url },
    ]);
  }

  return (
    <div className="space-y-5">
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={seller.name} src={seller.avatar} size={48} />
          <div>
            <h2 className="text-lg font-bold text-sys-900">{seller.name}</h2>
            <p className="mt-1 text-xs text-slate-400">
              รหัส {seller.id} · โปรไฟล์ผู้ขาย
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5 sm:p-6">
        <ProfileEditor
          key={seller.id}
          name={seller.name}
          avatar={seller.avatar}
          description={seller.description}
          canEdit={true}
          onSave={(profile) => onUpdateProfile(seller.id, profile)}
        />
      </Panel>

      <Panel className="grid gap-4 p-5 text-sm sm:grid-cols-2 sm:p-6">
        {[
          ["ผู้ประสานงาน", seller.coordinator],
          ["เบอร์ติดต่อ", seller.phone],
          ["อีเมล", seller.email],
          ["เลขประจำตัวผู้เสียภาษี", seller.taxId],
        ].map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 font-medium text-slate-700">{value}</p>
          </div>
        ))}
      </Panel>

      <LocationEditor
        key={`${seller.id}-${seller.province}-${seller.address}-${seller.photo ?? ""}`}
        location={seller}
        canEdit={true}
        onSave={(location) => onUpdateProfile(seller.id, location)}
      />

      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Icon name="file" size={19} className="text-sys-700" />
          <h3 className="font-bold text-sys-900">เอกสารแนบ</h3>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          แนบเอกสารที่เกี่ยวข้อง (ใบอนุญาต, เอกสารบริษัท ฯลฯ)
        </p>

        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3"
              >
                <Icon name="file" size={16} className="text-slate-500" />
                <span className="text-sm font-medium text-slate-700">
                  {doc.name}
                </span>
                <a
                  href={doc.url}
                  download={doc.name}
                  className="ml-auto text-xs font-semibold text-sys-700 hover:underline"
                >
                  ดาวน์โหลด
                </a>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-sys-50 px-4 py-2.5 text-sm font-semibold text-sys-700 hover:bg-sys-100">
            <Icon name="plus" size={16} />
            แนบเอกสาร
            <input
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => {
                addDocument(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </Panel>
    </div>
  );
}