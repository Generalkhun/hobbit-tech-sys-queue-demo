"use client";

import { useState } from "react";
import { ShopDetail } from "@/app/components/shops/shop-detail";
import { ShopList } from "@/app/components/shops/shop-list";
import type {
  Seller,
  SellerProfile,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
} from "@/app/types/seller";

export function ShopsPage({
  sellers,
  shops,
  moves,
  canManage,
  onMoveShop,
  onUpdateProfile,
}: {
  sellers: Seller[];
  shops: SellerShop[];
  moves: ShopMoveRecord[];
  canManage: boolean;
  onMoveShop: (input: ShopMoveInput) => void;
  onUpdateProfile: (shopId: string, profile: SellerProfile) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const shop = shops.find((item) => item.id === selectedId);

  if (!shop) {
    return <ShopList sellers={sellers} shops={shops} onManage={setSelectedId} />;
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
    />
  );
}
