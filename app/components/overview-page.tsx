"use client";

import { useState } from "react";
import { demoDate, plants } from "@/app/data/mock-data";
import {
  computeBreakdownRows,
  computeOverviewMetrics,
  computePlanRows,
} from "@/app/data/overview";
import { BreakdownTable } from "@/app/components/overview/breakdown-table";
import { OverviewFilters } from "@/app/components/overview/overview-filters";
import { OverviewStatCards } from "@/app/components/overview/overview-stat-cards";
import { PlanFillPanel } from "@/app/components/overview/plan-fill-panel";
import { PlantSummaryTable } from "@/app/components/overview/plant-summary-table";
import { ReceiptTable } from "@/app/components/overview/receipt-table";
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
}: {
  bookings: QueueBooking[];
  plans: PlanRow[];
  receipts: Record<string, BookingReceipt>;
  onReceiptChange: (bookingId: string, receipt: BookingReceipt) => void;
  onNavigate: (page: PageKey) => void;
  canManagePlans: boolean;
  queuePage: PageKey;
  queueActionLabel: string;
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

  return (
    <div className="space-y-6">
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
