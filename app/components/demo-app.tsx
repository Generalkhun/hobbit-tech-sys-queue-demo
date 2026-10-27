"use client";

import { useState } from "react";
import { canAccessPage } from "@/app/data/access";
import {
  demoUsers,
  mockBookings,
  mockDrivers,
  mockPlans,
} from "@/app/data/mock-data";
import {
  directoryDefinitions,
  isDirectoryPage,
} from "@/app/data/directories";
import { AppShell } from "@/app/components/app-shell";
import { BookingPage } from "@/app/components/booking-page";
import { CallingPage } from "@/app/components/calling-page";
import { DeliveryNotesPage } from "@/app/components/delivery-notes-page";
import { DirectoryPage } from "@/app/components/directory-page";
import { LoginScreen } from "@/app/components/login-screen";
import { OverviewPage } from "@/app/components/overview-page";
import { PlansPage } from "@/app/components/plans-page";
import { QueueCheckPage } from "@/app/components/queue-check-page";
import { RegistryPage } from "@/app/components/registry-page";
import { SecurityPage } from "@/app/components/security-page";
import { SettingsPage } from "@/app/components/settings-page";
import { Panel } from "@/app/components/ui";
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

  function navigateTo(nextPage: PageKey) {
    if (user && canAccessPage(user.role, nextPage)) {
      setPage(nextPage);
    }
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

  let content;
  if (page === "overview") {
    content = (
      <OverviewPage
        bookings={bookings}
        onNavigate={navigateTo}
        canManagePlans={user.role === "admin"}
        queuePage={
          user.role === "security"
            ? "security"
            : user.role === "admin"
              ? "operations"
              : "delivery-notes"
        }
        queueActionLabel={
          user.role === "security"
            ? "ไปสถานี รปภ."
            : user.role === "admin"
              ? "ไปหน้าปฏิบัติการ"
              : "ดูใบนำส่ง"
        }
      />
    );
  } else if (page === "plans") {
    content = <PlansPage plans={plans} onUpdatePlan={updatePlan} />;
  } else if (page === "booking") {
    content = (
      <BookingPage
        user={user}
        drivers={drivers}
        onCreate={createBooking}
        onStatusChange={updateBookingStatus}
        onGoToRegistry={() => navigateTo("drivers")}
      />
    );
  } else if (page === "operations") {
    content = (
      <CallingPage
        bookings={bookings}
        onStatusChange={updateBookingStatus}
      />
    );
  } else if (page === "security") {
    content = (
      <SecurityPage
        bookings={bookings}
        onStatusChange={updateBookingStatus}
      />
    );
  } else if (page === "delivery-notes" || page === "operation-notes") {
    content = (
      <DeliveryNotesPage
        bookings={bookings}
        onCreateBooking={() => navigateTo("booking")}
      />
    );
  } else if (page === "queue-check") {
    content = <QueueCheckPage bookings={bookings} />;
  } else if (page === "drivers") {
    content = (
      <RegistryPage
        user={user}
        drivers={drivers}
        onRegister={registerDriver}
        onApprovalChange={updateDriverApproval}
      />
    );
  } else if (page === "settings") {
    content = <SettingsPage />;
  } else if (isDirectoryPage(page)) {
    content = (
      <DirectoryPage
        definition={directoryDefinitions[page]}
        canManage={user.role === "admin"}
      />
    );
  } else {
    content = (
      <Panel className="p-6 text-sm text-slate-500">
        ยังไม่มีข้อมูลสำหรับเมนูนี้
      </Panel>
    );
  }

  return (
    <AppShell
      user={user}
      page={page}
      onNavigate={navigateTo}
      onLogout={() => {
        setUser(null);
        setPage("overview");
      }}
      onCreateBooking={() => navigateTo("booking")}
    >
      {content}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200/70 pt-4 text-[10px] text-slate-400">
        <span>SYS Queue Management · Demo v1.0</span>
        <span>ข้อมูลตัวอย่าง · {demoUsers.length} บัญชีทดลอง</span>
      </div>
    </AppShell>
  );
}
