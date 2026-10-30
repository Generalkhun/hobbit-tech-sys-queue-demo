"use client";

import { useMemo, useState } from "react";
import { Avatar } from "@/app/components/avatar";
import { Icon } from "@/app/components/icons";
import { EmptyState } from "@/app/components/shared/empty-state";
import { ManageButton } from "@/app/components/shared/manage-button";
import { SearchInput } from "@/app/components/shared/search-input";
import { SectionHeader } from "@/app/components/shared/section-header";
import { SellerStatusBadge } from "@/app/components/shared/seller-status-badge";
import { RPStatusBadge } from "@/app/components/shared/rp-status-badge";
import { Button, Panel } from "@/app/components/ui";
import type { Seller } from "@/app/types/seller";

export function SellerList({
  sellers,
  canManage,
  onCreate,
  onManage,
}: {
  sellers: Seller[];
  canManage: boolean;
  onCreate: () => void;
  onManage: (sellerId: string) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      sellers.filter((seller) =>
        `${seller.id} ${seller.name} ${seller.coordinator} ${seller.phone}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [sellers, search],
  );

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon="user"
        title="ผู้ขายเศษเหล็ก"
        description="จัดการผู้ขาย ร้านค้าย่อยในสังกัด และการระงับสิทธิ์จองคิว"
        action={
          canManage && (
            <Button onClick={onCreate}>
              <Icon name="plus" size={16} />
              เพิ่มผู้ขาย
            </Button>
          )
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
        <p className="text-xs text-slate-500">ทั้งหมด {sellers.length} ราย</p>
        <SearchInput
          value={search}
          onChange={setSearch}
          label="ค้นหาผู้ขายเศษเหล็ก"
        />
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
            <tr>
              <th className="px-6 py-3.5">รหัส</th>
              <th className="px-4 py-3.5">ชื่อ</th>
              <th className="px-4 py-3.5">ผู้ประสานงาน</th>
              <th className="px-4 py-3.5">เบอร์ติดต่อ</th>
              <th className="px-4 py-3.5">สถานะ RP</th>
              <th className="px-4 py-3.5">สถานะ</th>
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
                <td className="px-4 py-4 text-slate-500">{item.coordinator}</td>
                <td className="px-4 py-4 text-slate-500">{item.phone}</td>
                <td className="px-4 py-4">
                  <RPStatusBadge status={item.rpStatus} />
                </td>
                <td className="px-4 py-4">
                  <SellerStatusBadge status={item.status} />
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
