"use client";

import { useState } from "react";
import { Avatar, ProfileEditor } from "@/app/components/avatar";
import {
  SellerActionModal,
  type SellerAction,
} from "@/app/components/sellers/seller-action-modal";
import { SellerShopsPanel } from "@/app/components/sellers/seller-shops-panel";
import { BackLink } from "@/app/components/shared/back-link";
import { LocationEditor } from "@/app/components/shared/location-editor";
import { HistoryPanel } from "@/app/components/shared/history-table";
import { SellerStatusBadge } from "@/app/components/shared/seller-status-badge";
import { TabBar } from "@/app/components/shared/tab-bar";
import { Button, Panel } from "@/app/components/ui";
import {
  buildSellerMoveRows,
  buildSuspensionRows,
  getShopsOfSeller,
} from "@/app/data/sellers";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  ProfilePatch,
  Seller,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
  SuspensionRecord,
} from "@/app/types/seller";

type DetailTab = "info" | "moves" | "suspensions";

const tabs: { id: DetailTab; label: string }[] = [
  { id: "info", label: "ข้อมูลผู้ขาย" },
  { id: "moves", label: "ประวัติการเปลี่ยนร้านค้าย่อย" },
  { id: "suspensions", label: "ประวัติการระงับ" },
];

export interface SellerDetailProps {
  seller: Seller;
  sellers: Seller[];
  shops: SellerShop[];
  moves: ShopMoveRecord[];
  suspensions: SuspensionRecord[];
  canManage: boolean;
  onBack: () => void;
  onSuspend: (sellerId: string, value: NoteWithAttachments) => void;
  onRelease: (sellerId: string, value: NoteWithAttachments) => void;
  onMoveShop: (input: ShopMoveInput) => void;
  onUpdateProfile: (sellerId: string, profile: ProfilePatch) => void;
}

export function SellerDetail({
  seller,
  sellers,
  shops,
  moves,
  suspensions,
  canManage,
  onBack,
  onSuspend,
  onRelease,
  onMoveShop,
  onUpdateProfile,
}: SellerDetailProps) {
  const [tab, setTab] = useState<DetailTab>("info");
  const [action, setAction] = useState<SellerAction | null>(null);
  const isSuspended = seller.status === "suspended";

  function confirm(value: NoteWithAttachments, targetSellerId: string | null) {
    if (!action) return;
    if (action.kind === "suspend") onSuspend(seller.id, value);
    else if (action.kind === "release") onRelease(seller.id, value);
    else onMoveShop({ ...value, shopId: action.shopId, toSellerId: targetSellerId });
    setAction(null);
  }

  return (
    <div className="space-y-5">
      <BackLink label="กลับไปรายการผู้ขาย" onClick={onBack} />

      <Panel className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={seller.name} src={seller.avatar} size={48} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-sys-900">{seller.name}</h2>
              <SellerStatusBadge status={seller.status} />
            </div>
            <p className="mt-1 text-xs text-slate-400">รหัส {seller.id}</p>
          </div>
        </div>
        {canManage && (
          <Button
            variant={isSuspended ? "success" : "secondary"}
            className={isSuspended ? "" : "!border-rose-200 !text-rose-700"}
            onClick={() => setAction({ kind: isSuspended ? "release" : "suspend" })}
          >
            {isSuspended ? "ปลดการระงับ" : "ระงับ"}
          </Button>
        )}
      </Panel>

      {isSuspended && (
        <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          ผู้ขายรายนี้ถูกระงับ ไม่สามารถจองคิวได้จนกว่าจะปลดการระงับ
        </p>
      )}

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === "info" && (
        <>
          <Panel className="p-5 sm:p-6">
            <ProfileEditor
              key={seller.id}
              name={seller.name}
              avatar={seller.avatar}
              description={seller.description}
              canEdit={canManage}
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
            canEdit={canManage}
            onSave={(location) => onUpdateProfile(seller.id, location)}
          />
          <SellerShopsPanel
            seller={seller}
            sellers={sellers}
            shops={shops}
            ownShops={getShopsOfSeller(shops, seller.id)}
            canManage={canManage}
            onMoveOut={(shopId) => setAction({ kind: "move-out", shopId })}
            onMoveIn={(shopId) => setAction({ kind: "move-in", shopId })}
          />
        </>
      )}

      {tab === "moves" && (
        <HistoryPanel
          title="ประวัติของการเปลี่ยนร้านค้าย่อยที่เกี่ยวข้อง"
          emptyText="ยังไม่มีประวัติการย้ายร้านค้า"
          rows={buildSellerMoveRows(moves, seller.id, sellers, shops)}
        />
      )}

      {tab === "suspensions" && (
        <HistoryPanel
          title="ประวัติการระงับ"
          emptyText="ยังไม่มีประวัติการระงับ"
          rows={buildSuspensionRows(suspensions, seller.id)}
        />
      )}

      {action && (
        <SellerActionModal
          action={action}
          seller={seller}
          sellers={sellers}
          shops={shops}
          onConfirm={confirm}
          onCancel={() => setAction(null)}
        />
      )}
    </div>
  );
}
