"use client";

import { useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { Button, Panel, inputClassName } from "@/app/components/ui";
import { getSellerName } from "@/app/data/sellers";
import type { Seller, SellerShop } from "@/app/types/seller";

export function SellerShopsPanel({
  seller,
  sellers,
  shops,
  ownShops,
  canManage,
  onMoveOut,
  onMoveIn,
}: {
  seller: Seller;
  sellers: Seller[];
  shops: SellerShop[];
  ownShops: SellerShop[];
  canManage: boolean;
  onMoveOut: (shopId: string) => void;
  onMoveIn: (shopId: string) => void;
}) {
  const [moveShopId, setMoveShopId] = useState("");
  const movableShops = shops.filter((shop) => shop.sellerId !== seller.id);

  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="font-bold text-sys-900">
          ร้านค้าย่อยในสังกัด ({ownShops.length})
        </h3>
      </div>
      {ownShops.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-slate-400">
          ยังไม่มีร้านค้าย่อยในสังกัด
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {ownShops.map((shop) => (
            <li
              key={shop.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 text-sm sm:px-6"
            >
              <div>
                <p className="flex items-center gap-2 font-semibold text-slate-700">
                  <Avatar name={shop.name} src={shop.avatar} size={26} />
                  {shop.name}
                </p>
                <p className="text-xs text-slate-400">
                  {shop.id} · {shop.province}
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  aria-label={`ย้ายออก ${shop.name}`}
                  onClick={() => onMoveOut(shop.id)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                >
                  ย้ายออก
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {canManage && (
        <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 bg-sys-50/40 px-5 py-4 sm:px-6">
          <label className="flex min-w-60 flex-col gap-1.5 text-xs font-medium text-slate-600">
            ย้ายร้านค้าเข้าสังกัดผู้ขายนี้
            <select
              className={inputClassName}
              value={moveShopId}
              onChange={(event) => setMoveShopId(event.target.value)}
            >
              <option value="">เลือกร้านค้า</option>
              {movableShops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  {shop.name} ({getSellerName(sellers, shop.sellerId)})
                </option>
              ))}
            </select>
          </label>
          <Button
            disabled={!moveShopId}
            onClick={() => {
              onMoveIn(moveShopId);
              setMoveShopId("");
            }}
          >
            ย้ายเข้า
          </Button>
        </div>
      )}
    </Panel>
  );
}
