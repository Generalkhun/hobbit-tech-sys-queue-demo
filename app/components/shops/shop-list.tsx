"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { EmptyState } from "@/app/components/shared/empty-state";
import { ManageButton } from "@/app/components/shared/manage-button";
import { SearchInput } from "@/app/components/shared/search-input";
import { SectionHeader } from "@/app/components/shared/section-header";
import { TabBar } from "@/app/components/shared/tab-bar";
import { RPStatusBadge } from "@/app/components/shared/rp-status-badge";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import { getSellerName } from "@/app/data/sellers";
import type { Seller, SellerShop } from "@/app/types/seller";

type Filter = "all" | "unassigned";

export function ShopList({
  sellers,
  shops,
  canManage,
  onCreate,
  onManage,
}: {
  sellers: Seller[];
  shops: SellerShop[];
  canManage: boolean;
  onCreate: () => void;
  onManage: (shopId: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const unassignedCount = shops.filter((item) => item.sellerId === null).length;

  const filtered = useMemo(
    () =>
      shops.filter(
        (shop) =>
          (filter === "all" || shop.sellerId === null) &&
          `${shop.id} ${shop.name} ${shop.province} ${getSellerName(sellers, shop.sellerId)}`
            .toLowerCase()
            .includes(search.toLowerCase()),
      ),
    [shops, sellers, search, filter],
  );

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon="warehouse"
        title="ร้านค้าย่อย"
        description="ร้านค้าของเก่าที่มีเศษเหล็กและเป็นผู้จองรถเข้ารับ"
        action={
          canManage && (
            <Button onClick={onCreate}>
              <Icon name="plus" size={16} />
              เพิ่มร้านค้าย่อย
            </Button>
          )
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <TabBar
          active={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: `ทั้งหมด (${shops.length})` },
            { id: "unassigned", label: `ไม่มีผู้ขาย (${unassignedCount})` },
          ]}
        />
        <SearchInput value={search} onChange={setSearch} label="ค้นหาร้านค้าย่อย" />
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-3.5">รหัส</th>
              <th className="px-4 py-3.5">ชื่อ</th>
              <th className="px-4 py-3.5">ผู้ขาย</th>
              <th className="px-4 py-3.5">จังหวัด</th>
              <th className="px-4 py-3.5">สถานะ RP</th>
              <th className="px-6 py-3.5 text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/60">
                <td className="px-6 py-4 font-semibold text-sys-700">{item.id}</td>
                <td className="px-4 py-4 font-semibold text-slate-700">
                  <span className="flex items-center gap-2.5">
                    <Avatar name={item.name} src={item.avatar} size={30} />
                    {item.name}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {getSellerName(sellers, item.sellerId)}
                </td>
                <td className="px-4 py-4 text-slate-500">{item.province}</td>
                <td className="px-4 py-4">
                  <RPStatusBadge status={item.rpStatus} />
                </td>
                <td className="px-6 py-4 text-right">
                  <ManageButton name={item.name} onClick={() => onManage(item.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState>ไม่พบข้อมูลที่ค้นหา</EmptyState>}
      </div>
    </Panel>
  );
}
