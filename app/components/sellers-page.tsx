"use client";

import { useState } from "react";
import { SellerDetail, type SellerDetailProps } from "@/app/components/sellers/seller-detail";
import { SellerList } from "@/app/components/sellers/seller-list";
import type { NewSellerInput } from "@/app/types/seller";

type SellersPageProps = Omit<SellerDetailProps, "seller" | "onBack"> & {
  onAddSeller: (input: NewSellerInput) => void;
};

export function SellersPage({ onAddSeller, ...detailProps }: SellersPageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const seller = detailProps.sellers.find((item) => item.id === selectedId);

  if (!seller) {
    return (
      <SellerList
        sellers={detailProps.sellers}
        canManage={detailProps.canManage}
        onAddSeller={onAddSeller}
        onManage={setSelectedId}
      />
    );
  }
  return (
    <SellerDetail
      key={seller.id}
      seller={seller}
      onBack={() => setSelectedId(null)}
      {...detailProps}
    />
  );
}
