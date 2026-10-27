"use client";

import { useState } from "react";
import {
  demoUsers,
  mockBookings,
  mockDrivers,
  mockPlans,
} from "@/app/data/mock-data";
import { AppShell } from "@/app/components/app-shell";
import { BookingPage } from "@/app/components/booking-page";
import { CallingPage } from "@/app/components/calling-page";
import { LoginScreen } from "@/app/components/login-screen";
import { OverviewPage } from "@/app/components/overview-page";
import { PlansPage } from "@/app/components/plans-page";
import { RegistryPage } from "@/app/components/registry-page";
import type {
  BookingStatus,
  DemoUser,
  DriverRecord,
  PageKey,
  PlanRow,
  QueueBooking,
} from "@/app/types/queue";

export function DemoApp() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const [bookings, setBookings] = useState(mockBookings);
  const [plans, setPlans] = useState(mockPlans);
  const [drivers, setDrivers] = useState(mockDrivers);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  function updateBookingStatus(id: string, status: BookingStatus) {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );
  }

  function createBooking(
    input: Omit<QueueBooking, "id" | "createdAt" | "status">,
  ) {
    const datePart = input.date.replaceAll("-", "").slice(2);
    const nextBooking: QueueBooking = {
      ...input,
      id: `SC${datePart}${String(bookings.length + 1).padStart(2, "0")}`,
      createdAt: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "confirmed",
    };
    setBookings((current) => [nextBooking, ...current]);
    return nextBooking;
  }

  function updatePlan(planId: string, change: Partial<PlanRow>) {
    setPlans((current) =>
      current.map((plan) =>
        plan.id === planId ? { ...plan, ...change } : plan,
      ),
    );
  }

  function registerDriver(driver: DriverRecord) {
    setDrivers((current) => [driver, ...current]);
  }

  function updateDriverApproval(driverId: string, approved: boolean) {
    setDrivers((current) =>
      current.map((driver) =>
        driver.id === driverId ? { ...driver, approved } : driver,
      ),
    );
  }

  function changePage(nextPage: PageKey) {
    setPage(nextPage);
  }

  return (
    <AppShell
      user={user}
      page={page}
      onNavigate={changePage}
      onLogout={() => {
        setUser(null);
        setPage("overview");
      }}
      onCreateBooking={() => setPage("booking")}
    >
      {page === "overview" && (
        <OverviewPage bookings={bookings} onNavigate={changePage} />
      )}
      {page === "plans" && (
        <PlansPage plans={plans} onUpdatePlan={updatePlan} />
      )}
      {page === "booking" && (
        <BookingPage
          user={user}
          drivers={drivers}
          bookings={bookings}
          onCreate={createBooking}
          onStatusChange={updateBookingStatus}
          onGoToRegistry={() => setPage("registry")}
        />
      )}
      {page === "calling" && (
        <CallingPage
          bookings={bookings}
          onStatusChange={updateBookingStatus}
        />
      )}
      {page === "registry" && (
        <RegistryPage
          user={user}
          drivers={drivers}
          onRegister={registerDriver}
          onApprovalChange={updateDriverApproval}
        />
      )}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200/70 pt-4 text-[10px] text-slate-400">
        <span>SYS Queue Management · Demo v1.0</span>
        <span>ข้อมูลตัวอย่าง · {demoUsers.length} บัญชีทดลอง</span>
      </div>
    </AppShell>
  );
}
