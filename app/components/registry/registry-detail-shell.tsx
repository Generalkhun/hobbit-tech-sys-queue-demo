"use client";

import { useState, type ReactNode } from "react";
import { RegistryStatusBadge } from "@/app/components/registry/registry-status-badge";
import { StatusActionModal } from "@/app/components/registry/status-action-modal";
import { BackLink } from "@/app/components/shared/back-link";
import { HistoryPanel } from "@/app/components/shared/history-table";
import { TabBar } from "@/app/components/shared/tab-bar";
import { Button, Panel } from "@/app/components/ui";
import { getAvailableStatusAction } from "@/app/data/registry";
import type { NoteWithAttachments } from "@/app/types/common";
import type { RegistryStatus, RegistryStatusAction } from "@/app/types/registry";
import type { HistoryRow } from "@/app/types/seller";

type DetailTab = "info" | "history";

const actionButtons: Record<RegistryStatusAction, { label: string; danger: boolean }> = {
  approve: { label: "อนุมัติ", danger: false },
  suspend: { label: "ระงับ", danger: true },
  release: { label: "ปลดการระงับ", danger: false },
};

/** โครงหน้าจัดการรายการ: หัวข้อ สถานะ ปุ่มอนุมัติ/ระงับ และแท็บประวัติ */
export function RegistryDetailShell({
  backLabel,
  name,
  subtitle,
  avatar,
  status,
  canChangeStatus,
  historyRows,
  children,
  onBack,
  onStatusChange,
}: {
  backLabel: string;
  name: string;
  subtitle: string;
  avatar: ReactNode;
  status: RegistryStatus;
  canChangeStatus: boolean;
  historyRows: HistoryRow[];
  children: ReactNode;
  onBack: () => void;
  onStatusChange: (action: RegistryStatusAction, value: NoteWithAttachments) => void;
}) {
  const [tab, setTab] = useState<DetailTab>("info");
  const [pending, setPending] = useState<RegistryStatusAction | null>(null);
  const action = getAvailableStatusAction(status);

  return (
    <div className="space-y-5">
      <BackLink label={backLabel} onClick={onBack} />
      <Panel className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          {avatar}
          <div>
            <h2 className="text-lg font-bold text-sys-900">{name}</h2>
            <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            <div className="mt-2">
              <RegistryStatusBadge status={status} />
            </div>
          </div>
        </div>
        {canChangeStatus && action && (
          <Button
            variant={actionButtons[action].danger ? "secondary" : "success"}
            className={actionButtons[action].danger ? "!border-rose-200 !text-rose-700" : ""}
            onClick={() => setPending(action)}
          >
            {actionButtons[action].label}
          </Button>
        )}
      </Panel>
      <TabBar
        tabs={[
          { id: "info", label: "ข้อมูลทั้งหมด" },
          { id: "history", label: "ประวัติสถานะ" },
        ]}
        active={tab}
        onChange={setTab}
      />
      {tab === "info" ? (
        children
      ) : (
        <HistoryPanel
          title="ประวัติการเปลี่ยนสถานะ"
          rows={historyRows}
          emptyText="ยังไม่มีประวัติการเปลี่ยนสถานะ"
        />
      )}
      {pending && (
        <StatusActionModal
          action={pending}
          targetName={name}
          onCancel={() => setPending(null)}
          onConfirm={(value) => {
            onStatusChange(pending, value);
            setPending(null);
          }}
        />
      )}
    </div>
  );
}
