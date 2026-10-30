"use client";

import { useEffect, useState } from "react";
import { AcknowledgementsPage } from "@/app/components/acknowledgements-page";
import { BookingPage } from "@/app/components/booking-page";
import { CallingPage } from "@/app/components/calling-page";
import { DeliveryNotesPage } from "@/app/components/delivery-notes-page";
import { DirectoryPage } from "@/app/components/directory-page";
import { DriverPortalPage } from "@/app/components/driver-portal-page";
import { FastlaneRulesPage } from "@/app/components/fastlane-rules-page";
import { OverviewPage } from "@/app/components/overview-page";
import { PlansLandingPage } from "@/app/components/plans/plans-landing-page";
import { PolicyDocumentsPage } from "@/app/components/policy-documents-page";
import { QueueCheckPage } from "@/app/components/queue-check-page";
import { DriversPage } from "@/app/components/registry/drivers-page";
import { VehiclesPage } from "@/app/components/registry/vehicles-page";
import { SecurityPage } from "@/app/components/security-page";
import { SellersPage } from "@/app/components/sellers-page";
import { SettingsPage } from "@/app/components/settings-page";
import { SellerProfilePage } from "@/app/components/seller-profile-page";
import { ShopProfilePage } from "@/app/components/shop-profile-page";
import { ShopsPage } from "@/app/components/shops-page";
import { Panel } from "@/app/components/ui";
import { isDirectoryPage, vehicleTypes } from "@/app/data/directories";
import { mockBlacklist } from "@/app/data/mock-data";
import { acknowledgeShopPolicies } from "@/app/data/policy-store";
import { canManagePlans, getQueueShortcut } from "@/app/data/overview-queue";
import type { useCapacityConfig } from "@/app/hooks/use-capacity-config";
import type { useDailyDemand } from "@/app/hooks/use-daily-demand";
import type { useDeliveryDrafts } from "@/app/hooks/use-delivery-drafts";
import type { useDriverCheckin } from "@/app/hooks/use-driver-checkin";
import type { useDriverRegistry } from "@/app/hooks/use-driver-registry";
import type { useVehicleRegistry } from "@/app/hooks/use-vehicle-registry";
import type { useQueueBookings } from "@/app/hooks/use-queue-bookings";
import type { useSellerDirectory } from "@/app/hooks/use-seller-directory";
import type { DemoUser, PageKey, PolicyAcknowledgement } from "@/app/types/queue";

export interface PageContentProps {
  user: DemoUser;
  page: PageKey;
  acknowledgements: PolicyAcknowledgement[];
  onNavigate: (page: PageKey) => void;
  queue: ReturnType<typeof useQueueBookings>;
  registry: ReturnType<typeof useDriverRegistry>;
  vehicleRegistry: ReturnType<typeof useVehicleRegistry>;
  capacity: ReturnType<typeof useCapacityConfig>;
  dailyDemand: ReturnType<typeof useDailyDemand>;
  sellerDirectory: ReturnType<typeof useSellerDirectory>;
  deliveryDrafts: ReturnType<typeof useDeliveryDrafts>;
  driverCheckin: ReturnType<typeof useDriverCheckin>;
}

function DeliveryNotesList({
  user,
  queue,
  deliveryDrafts,
}: Pick<PageContentProps, "user" | "queue" | "deliveryDrafts">) {
  return (
    <DeliveryNotesPage
      bookings={queue.bookings}
      drafts={deliveryDrafts.drafts}
      canCreateBooking={user.role !== "security" && user.role !== "operations"}
      onCreateBooking={deliveryDrafts.startNewDraft}
      onSelectDraft={deliveryDrafts.editDraft}
      onSelectBooking={deliveryDrafts.viewBooking}
    />
  );
}

export function PageContent(props: PageContentProps) {
  const { user, page, acknowledgements, onNavigate } = props;
  const { queue, registry, capacity, sellerDirectory, deliveryDrafts, driverCheckin } =
    props;
  const { vehicleRegistry, dailyDemand } = props;
  const isAdmin = user.role === "admin";
  const shopNames = sellerDirectory.shops.map((shop) => shop.name);
  const vehicleTypeNames = vehicleTypes.map((type) => type.name);
  const [vehicleFocusId, setVehicleFocusId] = useState<string | null>(null);

  // เมื่อออกจากหน้า "vehicles" ให้ล้างสถานะการโฟกัสรถ (กันการค้างหน้าดูรายละเอียด)
  useEffect(() => {
    if (page !== "vehicles") setVehicleFocusId(null);
  }, [page]);

  function openVehicleDetail(vehicleId: string) {
    setVehicleFocusId(vehicleId);
    onNavigate("vehicles");
  }

  if (page === "driver-pass" || page === "driver-checkin" || page === "driver-queue") {
    const currentDriver = registry.drivers.find((d) => d.id === user.driverId);
    if (!currentDriver) {
      return (
        <Panel className="p-6 text-sm text-rose-700">
          ไม่พบข้อมูลพนักงานขับรถที่ผูกกับบัญชีนี้ กรุณาติดต่อผู้ดูแลระบบ
        </Panel>
      );
    }
    return (
      <DriverPortalPage
        page={page}
        driver={currentDriver}
        bookings={queue.bookings}
        progress={driverCheckin.progress}
        contactPhones={driverCheckin.contactPhones}
        onProgressChange={driverCheckin.setProgress}
        onContactPhonesChange={driverCheckin.setContactPhones}
        onNavigate={onNavigate}
      />
    );
  }

  switch (page) {
    case "overview": {
      const shortcut = getQueueShortcut(user);
      return (
        <OverviewPage
          bookings={queue.bookings}
          plans={queue.plans}
          receipts={queue.receipts}
          onReceiptChange={queue.updateReceipt}
          onNavigate={onNavigate}
          canManagePlans={canManagePlans(user)}
          queuePage={shortcut.page}
          queueActionLabel={shortcut.label}
          isAdmin={isAdmin}
        />
      );
    }
    case "plans":
      return (
        <PlansLandingPage
          role={user.role}
          demand={dailyDemand.demand}
          onSaveDemand={dailyDemand.saveDemand}
          slotPlan={{
            plans: queue.plans,
            bookings: queue.bookings,
            capacityConfig: capacity.draftConfig,
            savedConfig: capacity.savedConfig,
            savedDays: capacity.savedDays,
            onSaveDay: capacity.saveDay,
            onEditDay: capacity.editDay,
            onDiscardDay: capacity.discardDay,
            onHourlyDefaultChange: capacity.changeHourlyDefault,
            onSlotCapacitiesChange: capacity.changeSlotCapacities,
            onSlotCapacitiesReset: capacity.resetSlotCapacity,
            onReopenChange: capacity.changeReopenOverride,
          }}
        />
      );
    case "booking":
      if (deliveryDrafts.formDraft) {
        return (
          <BookingPage
            key={deliveryDrafts.formDraft.id}
            user={user}
            drivers={registry.drivers}
            vehicles={vehicleRegistry.vehicles}
            sellers={sellerDirectory.sellers}
            shops={sellerDirectory.shops}
            blacklist={mockBlacklist}
            plans={queue.plans}
            bookings={queue.bookings}
            resolveCapacity={queue.resolveCapacity}
            isRushHourReopened={queue.isRushHourReopened}
            acknowledgements={acknowledgements}
            onCreate={queue.createBooking}
            onGoToRegistry={() => onNavigate("drivers")}
            onViewVehicle={openVehicleDetail}
            onAcknowledgePolicies={(shopName) =>
              acknowledgeShopPolicies(shopName, user.id)
            }
            draft={deliveryDrafts.formDraft}
            viewBooking={deliveryDrafts.viewedBooking}
            onDraftChange={deliveryDrafts.updateDraft}
            onCompleteDraft={deliveryDrafts.completeDraft}
            onReturnToList={deliveryDrafts.returnToList}
            driverLinks={driverCheckin.links}
            onGenerateDriverLink={driverCheckin.generateLink}
          />
        );
      }
      return <DeliveryNotesList user={user} queue={queue} deliveryDrafts={deliveryDrafts} />;
    case "delivery-notes":
    case "operation-notes":
      return <DeliveryNotesList user={user} queue={queue} deliveryDrafts={deliveryDrafts} />;
    case "operations":
      return (
        <CallingPage
          bookings={queue.bookings}
          plans={queue.plans}
          vehicles={vehicleRegistry.vehicles}
          onStatusChange={queue.updateBookingStatus}
          onMoveBooking={queue.moveBooking}
        />
      );
    case "security":
      return (
        <SecurityPage
          bookings={queue.bookings}
          onStatusChange={queue.updateBookingStatus}
        />
      );
    case "queue-check":
      return <QueueCheckPage bookings={queue.bookings} />;
    case "drivers":
      return (
        <DriversPage
          drivers={registry.drivers}
          records={registry.statusRecords}
          shopNames={shopNames}
          isAdmin={isAdmin}
          onSave={registry.saveDriver}
          onStatusChange={registry.changeDriverStatus}
        />
      );
    case "vehicles":
      return (
        <VehiclesPage
          vehicles={vehicleRegistry.vehicles}
          records={vehicleRegistry.statusRecords}
          shopNames={shopNames}
          vehicleTypes={vehicleTypeNames}
          isAdmin={isAdmin}
          focusVehicleId={vehicleFocusId}
          onClearFocus={() => setVehicleFocusId(null)}
          onSave={vehicleRegistry.saveVehicle}
          onStatusChange={vehicleRegistry.changeVehicleStatus}
        />
      );
    case "settings":
      return <SettingsPage />;
    case "sellers":
      return (
        <SellersPage
          sellers={sellerDirectory.sellers}
          shops={sellerDirectory.shops}
          moves={sellerDirectory.moves}
          suspensions={sellerDirectory.suspensions}
          canManage={isAdmin}
          onAddSeller={sellerDirectory.addSeller}
          onSuspend={(id, value) => sellerDirectory.setSellerSuspended(id, true, value)}
          onRelease={(id, value) => sellerDirectory.setSellerSuspended(id, false, value)}
          onMoveShop={sellerDirectory.moveShop}
          onUpdateProfile={sellerDirectory.updateSellerProfile}
          onUpdateRPStatus={sellerDirectory.updateSellerRPStatus}
        />
      );
    case "shops":
      return (
        <ShopsPage
          sellers={sellerDirectory.sellers}
          shops={sellerDirectory.shops}
          moves={sellerDirectory.moves}
          canManage={isAdmin}
          onAddShop={sellerDirectory.addShop}
          onMoveShop={sellerDirectory.moveShop}
          onUpdateProfile={sellerDirectory.updateShopProfile}
          onUpdateRPStatus={sellerDirectory.updateShopRPStatus}
        />
      );
    case "fastlane-rules":
      return <FastlaneRulesPage userName={user.name} />;
    case "policy-documents":
      return <PolicyDocumentsPage userName={user.name} />;
    case "shop-profile": {
      const shop = sellerDirectory.shops.find((s) => s.name === user.organization);
      if (!shop) {
        return (
          <Panel className="p-6 text-sm text-slate-500">
            ไม่พบข้อมูลร้านค้าที่เชื่อมโยงกับบัญชีนี้
          </Panel>
        );
      }
      return (
        <ShopProfilePage
          shop={shop}
          onUpdateProfile={sellerDirectory.updateShopProfile}
        />
      );
    }
    case "seller-profile": {
      const seller = sellerDirectory.sellers.find((s) => s.name === user.organization);
      if (!seller) {
        return (
          <Panel className="p-6 text-sm text-slate-500">
            ไม่พบข้อมูลผู้ขายที่เชื่อมโยงกับบัญชีนี้
          </Panel>
        );
      }
      return (
        <SellerProfilePage
          seller={seller}
          onUpdateProfile={sellerDirectory.updateSellerProfile}
        />
      );
    }
    case "acknowledgements": {
      if (user.role === "admin") {
        return <PolicyDocumentsPage userName={user.name} />;
      }
      const shop = sellerDirectory.shops.find((s) => s.name === user.organization);
      const seller = sellerDirectory.sellers.find((s) => s.name === user.organization);
      if (shop) {
        return (
          <AcknowledgementsPage
            targetType="shop"
            targetId={shop.id}
            targetName={shop.name}
            userId={user.id}
            isAdmin={false}
          />
        );
      }
      if (seller) {
        return (
          <AcknowledgementsPage
            targetType="seller"
            targetId={seller.id}
            targetName={seller.name}
            userId={user.id}
            isAdmin={false}
          />
        );
      }
      return (
        <Panel className="p-6 text-sm text-slate-500">
          ไม่พบข้อมูลร้านค้าหรือผู้ขายที่เชื่อมโยงกับบัญชีนี้
        </Panel>
      );
    }
    default:
      if (isDirectoryPage(page)) {
        return <DirectoryPage page={page} vehicles={vehicleRegistry.vehicles} />;
      }
      return (
        <Panel className="p-6 text-sm text-slate-500">
          ยังไม่มีข้อมูลสำหรับเมนูนี้
        </Panel>
      );
  }
}
