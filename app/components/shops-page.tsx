"use client";

import { useState } from "react";
import { ShopCreatePage } from "@/app/components/shops/shop-create-page";
import { ShopDetail } from "@/app/components/shops/shop-detail";
import { ShopList } from "@/app/components/shops/shop-list";
import type { RPStatus } from "@/app/types/queue";
import type {
  NewShopInput,
  ProfilePatch,
  Seller,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
} from "@/app/types/seller";

export function ShopsPage({
  sellers,
  shops,
  moves,
  canManage,
  onAddShop,
  onMoveShop,
  onUpdateProfile,
  onUpdateRPStatus,
}: {
  sellers: Seller[];
  shops: SellerShop[];
  moves: ShopMoveRecord[];
  canManage: boolean;
  onAddShop: (input: NewShopInput) => void;
  onMoveShop: (input: ShopMoveInput) => void;
  onUpdateProfile: (shopId: string, profile: ProfilePatch) => void;
  onUpdateRPStatus?: (shopId: string, rpStatus: RPStatus) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const shop = shops.find((item) => item.id === selectedId);

  if (creating) {
    return (
      <ShopCreatePage
        sellers={sellers}
        onCancel={() => setCreating(false)}
        onSubmit={(input) => {
          onAddShop(input);
          setCreating(false);
        }}
      />
    );
  }
  if (!shop) {
    return (
      <ShopList
        sellers={sellers}
        shops={shops}
        canManage={canManage}
        onCreate={() => setCreating(true)}
        onManage={setSelectedId}
      />
    );
  }
  return (
    <ShopDetail
      key={shop.id}
      shop={shop}
      sellers={sellers}
      moves={moves}
      canManage={canManage}
      onBack={() => setSelectedId(null)}
      onMoveShop={onMoveShop}
      onUpdateProfile={onUpdateProfile}
      onUpdateRPStatus={onUpdateRPStatus}
    />
  );
}
