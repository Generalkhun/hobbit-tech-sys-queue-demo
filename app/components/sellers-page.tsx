"use client";

import { useState } from "react";
import { SellerCreatePage } from "@/app/components/sellers/seller-create-page";
import { SellerDetail, type SellerDetailProps } from "@/app/components/sellers/seller-detail";
import { SellerList } from "@/app/components/sellers/seller-list";
import type { NewSellerInput } from "@/app/types/seller";

type SellersPageProps = Omit<SellerDetailProps, "seller" | "onBack"> & {
  onAddSeller: (input: NewSellerInput) => void;
};

type View = { kind: "list" } | { kind: "create" } | { kind: "detail"; id: string };

export function SellersPage({ onAddSeller, ...detailProps }: SellersPageProps) {
  const [view, setView] = useState<View>({ kind: "list" });
  const backToList = () => setView({ kind: "list" });
  const seller =
    view.kind === "detail"
      ? detailProps.sellers.find((item) => item.id === view.id)
      : undefined;

  if (view.kind === "create") {
    return (
      <SellerCreatePage
        sellers={detailProps.sellers}
        shops={detailProps.shops}
        onCancel={backToList}
        onSubmit={(input) => {
          onAddSeller(input);
          backToList();
        }}
      />
    );
  }
  if (!seller) {
    return (
      <SellerList
        sellers={detailProps.sellers}
        canManage={detailProps.canManage}
        onCreate={() => setView({ kind: "create" })}
        onManage={(id) => setView({ kind: "detail", id })}
      />
    );
  }
  return <SellerDetail key={seller.id} seller={seller} onBack={backToList} {...detailProps} />;
}
