"use client";

import type { ReactNode } from "react";
import { Icon, type IconName } from "@/app/components/icons";
import { RegistryStatusBadge } from "@/app/components/registry/registry-status-badge";
import { EmptyState } from "@/app/components/shared/empty-state";
import { ManageButton } from "@/app/components/shared/manage-button";
import { Pagination } from "@/app/components/shared/pagination";
import { SearchInput } from "@/app/components/shared/search-input";
import { SectionHeader } from "@/app/components/shared/section-header";
import { Button, Panel } from "@/app/components/ui";
import { useTableControls } from "@/app/hooks/use-table-controls";
import type { RegistryStatus } from "@/app/types/registry";

export interface RegistryColumn<T> {
  header: string;
  render: (item: T) => ReactNode;
}

/** ตารางทะเบียนที่มีสถานะ พร้อมค้นหา แบ่งหน้า และปุ่มจัดการ */
export function RegistryList<T extends { id: string; status: RegistryStatus }>({
  icon,
  title,
  description,
  items,
  columns,
  searchFields,
  searchLabel,
  createLabel,
  emptyText,
  getName,
  onCreate,
  onManage,
}: {
  icon: IconName;
  title: string;
  description: string;
  items: T[];
  columns: RegistryColumn<T>[];
  searchFields: (item: T) => string[];
  searchLabel: string;
  createLabel: string;
  emptyText: string;
  getName: (item: T) => string;
  onCreate: () => void;
  onManage: (id: string) => void;
}) {
  const table = useTableControls(items, searchFields);

  return (
    <Panel className="overflow-hidden">
      <SectionHeader
        icon={icon}
        title={title}
        description={description}
        action={
          <Button onClick={onCreate}>
            <Icon name="plus" size={16} /> {createLabel}
          </Button>
        }
      />
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <SearchInput value={table.query} onChange={table.setQuery} label={searchLabel} />
      </div>
      {table.items.length === 0 ? (
        <EmptyState>{emptyText}</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                {columns.map((column) => (
                  <th key={column.header} className="px-5 py-3 font-semibold sm:px-6">
                    {column.header}
                  </th>
                ))}
                <th className="px-5 py-3 font-semibold">สถานะ</th>
                <th className="px-5 py-3 text-right font-semibold sm:px-6">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  {columns.map((column) => (
                    <td key={column.header} className="px-5 py-3.5 sm:px-6">
                      {column.render(item)}
                    </td>
                  ))}
                  <td className="px-5 py-3.5">
                    <RegistryStatusBadge status={item.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <ManageButton name={getName(item)} onClick={() => onManage(item.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        currentPage={table.currentPage}
        pageCount={table.pageCount}
        total={table.total}
        onChange={table.setPage}
      />
    </Panel>
  );
}
