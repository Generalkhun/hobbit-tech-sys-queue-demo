"use client";

import { useState } from "react";
import { Avatar, ProfileEditor } from "@/app/components/avatar";
import { ShopMoveModal } from "@/app/components/shops/shop-move-modal";
import { BackLink } from "@/app/components/shared/back-link";
import { LocationEditor } from "@/app/components/shared/location-editor";
import { HistoryPanel } from "@/app/components/shared/history-table";
import { RPStatusBadge, RPStatusSelect } from "@/app/components/shared/rp-status-badge";
import { CheckinHistoryPanel } from "@/app/components/shared/checkin-history-panel";
import { Button, Panel } from "@/app/components/ui";
import { buildShopMoveRows, getSellerName } from "@/app/data/sellers";
import { getCheckinLogsByShop } from "@/app/data/checkin-log";
import type { RPStatus } from "@/app/types/queue";
import type {
  ProfilePatch,
  Seller,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
} from "@/app/types/seller";

export function ShopDetail({
  shop,
  sellers,
  moves,
  canManage,
  onBack,
  onMoveShop,
  onUpdateProfile,
  onUpdateRPStatus,
}: {
  shop: SellerShop;
  sellers: Seller[];
  moves: ShopMoveRecord[];
  canManage: boolean;
  onBack: () => void;
  onMoveShop: (input: ShopMoveInput) => void;
  onUpdateProfile: (shopId: string, profile: ProfilePatch) => void;
  onUpdateRPStatus?: (shopId: string, rpStatus: RPStatus) => void;
}) {
  const [showMove, setShowMove] = useState(false);
  const [rpStatusDraft, setRpStatusDraft] = useState<RPStatus | undefined>(
    shop.rpStatus,
  );

  return (
    <div className="space-y-5">
      <BackLink label="กลับไปรายการร้านค้าย่อย" onClick={onBack} />

      <Panel className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={shop.name} src={shop.avatar} size={48} />
          <div>
            <h2 className="text-lg font-bold text-sys-900">{shop.name}</h2>
            <p className="mt-1 text-xs text-slate-400">
              รหัส {shop.id} · {shop.province} · ผู้ขาย:{" "}
              {getSellerName(sellers, shop.sellerId)}
            </p>
          </div>
        </div>
        {canManage && <Button onClick={() => setShowMove(true)}>ย้ายผู้ขาย</Button>}
      </Panel>

      <Panel className="p-5 sm:p-6">
        <ProfileEditor
          key={shop.id}
          name={shop.name}
          avatar={shop.avatar}
          description={shop.description}
          canEdit={canManage}
          onSave={(profile) => onUpdateProfile(shop.id, profile)}
        />
      </Panel>

      {canManage && (
        <Panel className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <p className="text-xs text-slate-400">สถานะ RP</p>
              <p className="mt-1">
                <RPStatusBadge status={shop.rpStatus} />
              </p>
            </div>
            <div className="min-w-40">
              <RPStatusSelect
                value={rpStatusDraft}
                onChange={setRpStatusDraft}
              />
            </div>
            {rpStatusDraft !== shop.rpStatus && onUpdateRPStatus && (
              <Button
                onClick={() => {
                  onUpdateRPStatus(shop.id, rpStatusDraft ?? "normal");
                }}
              >
                บันทึกสถานะ RP
              </Button>
            )}
          </div>
        </Panel>
      )}

      <LocationEditor
        key={`${shop.id}-${shop.province}-${shop.address}-${shop.photo ?? ""}`}
        location={shop}
        canEdit={canManage}
        onSave={(location) => onUpdateProfile(shop.id, location)}
      />

      <HistoryPanel
        title="ประวัติการย้ายผู้ขาย"
        emptyText="ยังไม่มีประวัติการย้ายผู้ขาย"
        rows={buildShopMoveRows(moves, shop.id, sellers)}
      />

      <CheckinHistoryPanel
        title="ประวัติการเช็คอิน"
        logs={getCheckinLogsByShop(shop.name)}
        emptyText="ยังไม่มีประวัติการเช็คอิน"
      />

      {showMove && (
        <ShopMoveModal
          shop={shop}
          sellers={sellers}
          onCancel={() => setShowMove(false)}
          onConfirm={(toSellerId, value) => {
            onMoveShop({ ...value, shopId: shop.id, toSellerId });
            setShowMove(false);
          }}
        />
      )}
    </div>
  );
}
