"use client";

import { useState } from "react";
import { demoDate, plants } from "@/app/data/mock-data";
import {
  computeBreakdownRows,
  computeOverviewMetrics,
  computePlanRows,
} from "@/app/data/overview";
import { computePendingWorkByGrade } from "@/app/data/pending-work";
import { BreakdownTable } from "@/app/components/overview/breakdown-table";
import { DashboardCharts } from "@/app/components/overview/dashboard-charts";
import { OverviewFilters } from "@/app/components/overview/overview-filters";
import { OverviewStatCards } from "@/app/components/overview/overview-stat-cards";
import { PlanFillPanel } from "@/app/components/overview/plan-fill-panel";
import { PlantSummaryTable } from "@/app/components/overview/plant-summary-table";
import { ReceiptTable } from "@/app/components/overview/receipt-table";
import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import { formatKg } from "@/app/data/overview";
import type { BreakdownBy } from "@/app/types/overview";
import type {
  BookingReceipt,
  PageKey,
  PlanRow,
  QueueBooking,
} from "@/app/types/queue";

export function OverviewPage({
  bookings,
  plans,
  receipts,
  onReceiptChange,
  onNavigate,
  canManagePlans,
  queuePage,
  queueActionLabel,
  isAdmin,
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  receipts: Record<string, BookingReceipt>;
  onReceiptChange: (bookingId: string, receipt: BookingReceipt) => void;
  onNavigate: (page: PageKey) => void;
  canManagePlans: boolean;
  queuePage: PageKey;
  queueActionLabel: string;
  isAdmin?: boolean;
}) {
  const [date, setDate] = useState(demoDate);
  const [plantFilter, setPlantFilter] = useState("all");
  const [breakdownBy, setBreakdownBy] = useState<BreakdownBy>("grade");

  const metrics = computeOverviewMetrics(bookings, receipts, plants, date, plantFilter);
  const breakdownRows = computeBreakdownRows(
    metrics.visibleBookings,
    receipts,
    date,
    breakdownBy,
  );
  const planRows = computePlanRows(plans, metrics.scheduledBookings, plantFilter);

  const pendingWork = isAdmin
    ? computePendingWorkByGrade(bookings, plans, date, 7)
    : [];

  return (
    <div className="space-y-6">
      {isAdmin && <DashboardCharts />}
      <OverviewFilters
        date={date}
        plantFilter={plantFilter}
        onDateChange={setDate}
        onPlantFilterChange={setPlantFilter}
      />
      <OverviewStatCards metrics={metrics} />
      <PlantSummaryTable metrics={metrics} />
      <BreakdownTable
        rows={breakdownRows}
        breakdownBy={breakdownBy}
        onBreakdownChange={setBreakdownBy}
      />
      {isAdmin && pendingWork.length > 0 && (
        <Panel className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Icon name="chart" size={19} className="text-sys-700" />
              <h3 className="font-bold text-sys-900">
                ปริมาณงานคงค้าง 7 วันข้างหน้า
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              เปรียบเทียบยอดจองกับเป้าหมาย แยกตามเกรด
            </p>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">เกรด</th>
                  <th className="px-4 py-3.5">ยอดจอง (7 วัน)</th>
                  <th className="px-4 py-3.5">เป้าหมาย (7 วัน)</th>
                  <th className="px-4 py-3.5">สัดส่วน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingWork.map((row) => (
                  <tr key={row.grade} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {row.grade}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatKg(row.totalBookedKg)}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatKg(row.totalTargetKg)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full bg-sys-500 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sys-600"
                            style={{ width: `${Math.min(100, row.fillPercent)}%` }}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            row.fillPercent >= 80
                              ? "text-emerald-600"
                              : row.fillPercent >= 50
                                ? "text-amber-600"
                                : "text-rose-600"
                          }`}
                        >
                          {Math.round(row.fillPercent)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
      <PlanFillPanel
        planRows={planRows}
        canManagePlans={canManagePlans}
        onManagePlans={() => onNavigate("plans")}
      />
      <ReceiptTable
        bookings={metrics.visibleBookings}
        receipts={receipts}
        date={date}
        queueActionLabel={queueActionLabel}
        onReceiptChange={onReceiptChange}
        onOpenQueue={() => onNavigate(queuePage)}
      />
    </div>
  );
}
