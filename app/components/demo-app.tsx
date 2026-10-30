"use client";

import { useState, useSyncExternalStore } from "react";
import { AppShell } from "@/app/components/app-shell";
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

  function navigateTo(nextPage: PageKey) {
    if (user && canAccessPage(user.role, nextPage)) setPage(nextPage);
  }

  const deliveryDrafts = useDeliveryDrafts({
    user,
    drivers: registry.drivers,
    bookings: queue.bookings,
    openBookingPage: () => navigateTo("booking"),
  });

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
