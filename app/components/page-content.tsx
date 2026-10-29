"use client";

import { BookingPage } from "@/app/components/booking-page";
import { CallingPage } from "@/app/components/calling-page";
import { DeliveryNotesPage } from "@/app/components/delivery-notes-page";
import { DirectoryPage } from "@/app/components/directory-page";
import { DriverPortalPage } from "@/app/components/driver-portal-page";
import { OverviewPage } from "@/app/components/overview-page";
import { PlansPage } from "@/app/components/plans-page";
import { QueueCheckPage } from "@/app/components/queue-check-page";
import { RegistryPage } from "@/app/components/registry-page";
import { SecurityPage } from "@/app/components/security-page";
import { SellersPage } from "@/app/components/sellers-page";
import { SettingsPage } from "@/app/components/settings-page";
import { ShopsPage } from "@/app/components/shops-page";
import { Panel } from "@/app/components/ui";
import { directoryDefinitions, isDirectoryPage } from "@/app/data/directories";
import { mockBlacklist } from "@/app/data/mock-data";
import { acknowledgeShopPolicies } from "@/app/data/policy-store";
import { canManagePlans, getQueueShortcut } from "@/app/data/overview-queue";
import type { useCapacityConfig } from "@/app/hooks/use-capacity-config";
import type { useDeliveryDrafts } from "@/app/hooks/use-delivery-drafts";
import type { useDriverCheckin } from "@/app/hooks/use-driver-checkin";
import type { useDriverRegistry } from "@/app/hooks/use-driver-registry";
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
  capacity: ReturnType<typeof useCapacityConfig>;
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
  const isAdmin = user.role === "admin";

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
        onVerifyCode={driverCheckin.verifyCode}
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
        />
      );
    }
    case "plans":
      return (
        <PlansPage
          plans={queue.plans}
          bookings={queue.bookings}
          capacityConfig={capacity.draftConfig}
          savedConfig={capacity.savedConfig}
          savedDays={capacity.savedDays}
          onSaveDay={capacity.saveDay}
          onEditDay={capacity.editDay}
          onDiscardDay={capacity.discardDay}
          onHourlyDefaultChange={capacity.changeHourlyDefault}
          onSlotCapacitiesChange={capacity.changeSlotCapacities}
          onSlotCapacitiesReset={capacity.resetSlotCapacity}
        />
      );
    case "booking":
      if (deliveryDrafts.formDraft) {
        return (
          <BookingPage
            key={deliveryDrafts.formDraft.id}
            user={user}
            drivers={registry.drivers}
            blacklist={mockBlacklist}
            plans={queue.plans}
            bookings={queue.bookings}
            resolveCapacity={queue.resolveCapacity}
            acknowledgements={acknowledgements}
            onCreate={queue.createBooking}
            onGoToRegistry={() => onNavigate("drivers")}
            onAcknowledgePolicies={(shopName) =>
              acknowledgeShopPolicies(shopName, user.id)
            }
            draft={deliveryDrafts.formDraft}
            viewBooking={deliveryDrafts.viewedBooking}
            onDraftChange={deliveryDrafts.updateDraft}
            onCompleteDraft={deliveryDrafts.completeDraft}
            onReturnToList={deliveryDrafts.returnToList}
            verificationCodes={driverCheckin.codes}
            onGenerateVerificationCode={driverCheckin.generateCode}
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
        <RegistryPage
          user={user}
          drivers={registry.drivers}
          onRegister={registry.registerDriver}
          onApprovalChange={registry.updateDriverApproval}
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
        />
      );
    case "shops":
      return (
        <ShopsPage
          sellers={sellerDirectory.sellers}
          shops={sellerDirectory.shops}
          moves={sellerDirectory.moves}
          canManage={isAdmin}
          onMoveShop={sellerDirectory.moveShop}
          onUpdateProfile={sellerDirectory.updateShopProfile}
        />
      );
    default:
      if (isDirectoryPage(page)) {
        return (
          <DirectoryPage definition={directoryDefinitions[page]} canManage={isAdmin} />
        );
      }
      return (
        <Panel className="p-6 text-sm text-slate-500">
          ยังไม่มีข้อมูลสำหรับเมนูนี้
        </Panel>
      );
  }
}
