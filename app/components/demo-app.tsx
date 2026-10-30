"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AppShell } from "@/app/components/app-shell";
import { DriverPortalPage } from "@/app/components/driver-portal-page";
import { LoginScreen } from "@/app/components/login-screen";
import { PageContent } from "@/app/components/page-content";
import { canAccessPage } from "@/app/data/access";
import { demoUsers } from "@/app/data/mock-data";
import {
  getPolicyAcknowledgements,
  getPolicyStorageError,
  getServerPolicyAcknowledgements,
  subscribeToPolicyAcknowledgements,
} from "@/app/data/policy-store";
import {
  getUnreadAcknowledgements,
  subscribeToPolicyDocuments,
} from "@/app/data/policy-documents";
import { useCapacityConfig } from "@/app/hooks/use-capacity-config";
import { useDeliveryDrafts } from "@/app/hooks/use-delivery-drafts";
import { useDailyDemand } from "@/app/hooks/use-daily-demand";
import { useDriverCheckin } from "@/app/hooks/use-driver-checkin";
import { useVehicleRegistry } from "@/app/hooks/use-vehicle-registry";
import { useDriverRegistry } from "@/app/hooks/use-driver-registry";
import { useQueueBookings } from "@/app/hooks/use-queue-bookings";
import { useSellerDirectory } from "@/app/hooks/use-seller-directory";
import type { DemoUser, PageKey } from "@/app/types/queue";

export function DemoApp() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const acknowledgements = useSyncExternalStore(
    subscribeToPolicyAcknowledgements,
    getPolicyAcknowledgements,
    getServerPolicyAcknowledgements,
  );
  const policyStorageError = useSyncExternalStore(
    subscribeToPolicyAcknowledgements,
    getPolicyStorageError,
    () => "",
  );
  const _docSub = useSyncExternalStore(
    subscribeToPolicyDocuments,
    () => 1,
    () => 0,
  );
  void _docSub;

  const registry = useDriverRegistry(user?.name ?? "—");
  const vehicleRegistry = useVehicleRegistry(user?.name ?? "—");
  const capacity = useCapacityConfig();
  const dailyDemand = useDailyDemand();
  const sellerDirectory = useSellerDirectory(user?.name ?? "—");
  const queue = useQueueBookings({
    user,
    drivers: registry.drivers,
    savedConfig: capacity.savedConfig,
    acknowledgements,
    getSellerBlock: sellerDirectory.getBookingBlock,
  });
  const driverCheckin = useDriverCheckin();

  // เปิดลิงก์เช็คอินคนขับ (รูปแบบ #driver-<bookingId>-<token>)
  // ไม่ต้องเข้าสู่ระบบ — ลิงก์เฉพาะต่องานเป็นตัวยืนยันตัวตน (KYC) ของคนขับ
  const [driverLink, setDriverLink] = useState<{
    bookingId: string;
    token: string;
  } | null>(null);

  useEffect(() => {
    function parseDriverLink() {
      const raw = window.location.hash;
      const match = raw.match(/^#driver-(.+)-(\d{6})$/);
      if (!match) return;
      const [, bookingId, token] = match;
      setDriverLink({ bookingId, token });
      setPage("driver-checkin");
    }
    parseDriverLink();
  }, []);

  function navigateTo(nextPage: PageKey) {
    if (user && canAccessPage(user.role, nextPage)) setPage(nextPage);
  }

  const deliveryDrafts = useDeliveryDrafts({
    user,
    drivers: registry.drivers,
    bookings: queue.bookings,
    openBookingPage: () => navigateTo("booking"),
  });

  if (driverLink) {
    const checkinBooking = queue.bookings.find(
      (booking) => booking.id === driverLink.bookingId,
    );
    if (
      !checkinBooking ||
      !driverCheckin.isValidLink(driverLink.bookingId, driverLink.token)
    ) {
      return (
        <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-bold text-sys-900">
            ลิงก์เช็คอินไม่ถูกต้อง
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            ลิงก์นี้ใช้ไม่ได้หรือหมดอายุแล้ว กรุณาติดต่อผู้ส่งเหล็กเพื่อขอลิงก์ใหม่
          </p>
          <a
            href="/"
            className="mt-6 rounded-xl bg-sys-700 px-5 py-2.5 text-sm font-semibold text-white"
          >
            กลับหน้าแรก
          </a>
        </div>
      );
    }
    const currentDriver = registry.drivers.find(
      (driver) => driver.name === checkinBooking.driver,
    );
    const linkDriver: DemoUser = {
      id: "driver-link",
      name: currentDriver?.name ?? checkinBooking.driver,
      organization: `${checkinBooking.carrier} · พนักงานขับรถ`,
      role: "driver",
      initials: (currentDriver?.name ?? checkinBooking.driver).slice(0, 2),
    };
    const linkPages: PageKey[] = ["driver-pass", "driver-checkin", "driver-queue"];
    function navigateInLink(nextPage: PageKey) {
      if (linkPages.includes(nextPage)) setPage(nextPage);
    }
    // เปิดหน้าเช็คอินของงานนี้โดยตรง (เข้าสู่ระบบผ่านลิงก์แล้ว)
    return (
      <AppShell
        user={linkDriver}
        page={page}
        onNavigate={navigateInLink}
        onLogout={() => {
          setDriverLink(null);
          setPage("overview");
          if (typeof window !== "undefined") {
            window.location.hash = "";
          }
        }}
      >
        <DriverPortalPage
          page={page}
          driver={
            currentDriver ?? {
              id: "link-driver",
              name: checkinBooking.driver,
              prefix: "",
              firstName: "",
              lastName: "",
              employmentType: "contractor",
              shopName: "",
              carrier: checkinBooking.carrier,
              plate: checkinBooking.plate,
              phone: "",
              email: "",
              nationalId: "",
              licenseNumber: "",
              status: "active",
            }
          }
          bookings={queue.bookings}
          linkBookingId={checkinBooking.id}
          progress={driverCheckin.progress}
          contactPhones={driverCheckin.contactPhones}
          onProgressChange={driverCheckin.setProgress}
          onContactPhonesChange={driverCheckin.setContactPhones}
          onNavigate={navigateInLink}
        />
      </AppShell>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={(nextUser) => {
          setUser(nextUser);
          setPage(nextUser.role === "driver" ? "driver-pass" : "overview");
          driverCheckin.reset(
            registry.drivers.find((driver) => driver.id === nextUser.driverId)
              ?.phone,
          );
        }}
      />
    );
  }

  const shop = sellerDirectory.shops.find((s) => s.name === user.organization);
  const seller = sellerDirectory.sellers.find((s) => s.name === user.organization);
  const unreadAckCount =
    user.role === "admin"
      ? 0
      : shop
        ? getUnreadAcknowledgements("shop", shop.id).length
        : seller
          ? getUnreadAcknowledgements("seller", seller.id).length
          : 0;

  return (
    <AppShell
      user={user}
      page={page}
      onNavigate={navigateTo}
      onLogout={() => {
        setUser(null);
        setPage("overview");
        deliveryDrafts.closeForm();
        driverCheckin.reset();
      }}
      unreadAckCount={unreadAckCount}
    >
      {policyStorageError && (
        <p
          role="alert"
          className="mx-auto mt-4 max-w-[1480px] px-4 text-sm text-rose-700 sm:px-7 xl:px-10"
        >
          {policyStorageError}
        </p>
      )}
      <PageContent
        user={user}
        page={page}
        acknowledgements={acknowledgements}
        onNavigate={navigateTo}
        queue={queue}
        registry={registry}
        vehicleRegistry={vehicleRegistry}
        capacity={capacity}
        dailyDemand={dailyDemand}
        sellerDirectory={sellerDirectory}
        deliveryDrafts={deliveryDrafts}
        driverCheckin={driverCheckin}
      />
      <div className="mt-8 flex items-center justify-between border-t border-slate-200/70 pt-4 text-[10px] text-slate-400">
        <span>SYS Queue Management · Demo v1.0</span>
        <span>ข้อมูลตัวอย่าง · {demoUsers.length} บัญชีทดลอง</span>
      </div>
    </AppShell>
  );
}
