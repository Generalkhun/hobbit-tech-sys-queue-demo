"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { canAccessPage } from "@/app/data/access";
import { getBlacklistReason, hasCurrentPolicyAcknowledgement } from "@/app/data/eligibility";
import {
  getPolicyAcknowledgements,
  getPolicyStorageError,
  getServerPolicyAcknowledgements,
  subscribeToPolicyAcknowledgements,
  acknowledgeShopPolicies,
} from "@/app/data/policy-store";
import {
  demoUsers,
  mockBlacklist,
  mockBookings,
  mockDrivers,
  mockPlans,
  policyVersion,
  demoDate,
} from "@/app/data/mock-data";
import { bookableSlots } from "@/app/data/slot-time";
import { canMoveBookingToPlant, schedulePlant } from "@/app/data/scheduling";
import {
  copyDateConfig,
  createCapacityResolver,
  emptyCapacityConfig,
  resetSlotCapacities,
  setHourlyDefault,
  setSlotCapacities,
  setSlotClosure,
  type GradeCapacities,
} from "@/app/data/slot-capacity";
import { getStatusTransitionError } from "@/app/data/workflow";
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
import { PlansPage, type SavedPlanDay } from "@/app/components/plans-page";
import { QueueCheckPage } from "@/app/components/queue-check-page";
import { RegistryPage } from "@/app/components/registry-page";
import { SecurityPage } from "@/app/components/security-page";
import { SettingsPage } from "@/app/components/settings-page";
import { Panel } from "@/app/components/ui";
import type {
  BookingStatus,
  DeliveryDraft,
  DemoUser,
  DriverRecord,
  PageKey,
  QueueBooking,
} from "@/app/types/queue";

export function DemoApp() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [page, setPage] = useState<PageKey>("overview");
  const [bookings, setBookings] = useState(mockBookings);
  const [deliveryDrafts, setDeliveryDrafts] = useState<DeliveryDraft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [viewBookingId, setViewBookingId] = useState<string | null>(null);
  const [plans, setPlans] = useState(mockPlans);
  const [draftConfig, setDraftConfig] = useState(emptyCapacityConfig);
  const [savedConfig, setSavedConfig] = useState(emptyCapacityConfig);
  const [savedDays, setSavedDays] = useState<Record<string, SavedPlanDay>>({});
  const resolveCapacity = useMemo(
    () => createCapacityResolver(plans, savedConfig),
    [plans, savedConfig],
  );
  const [drivers, setDrivers] = useState(mockDrivers);
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
  const updateDeliveryDraft = useCallback((updatedDraft: DeliveryDraft) => {
    setDeliveryDrafts((current) =>
      current.map((draft) =>
        draft.id === updatedDraft.id ? updatedDraft : draft,
      ),
    );
  }, []);

  const completeDeliveryDraft = useCallback((draftId: string) => {
    setDeliveryDrafts((current) =>
      current.filter((draft) => draft.id !== draftId),
    );
  }, []);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  function navigateTo(nextPage: PageKey) {
    if (user && canAccessPage(user.role, nextPage)) {
      setPage(nextPage);
    }
  }

  function startNewDeliveryDraft() {
    if (!user || user.role === "security" || user.role === "operations") return;
    const firstDriver = drivers.find((driver) => driver.approved);
    const draft: DeliveryDraft = {
      id: `DRAFT-${Date.now().toString(36).toUpperCase()}`,
      step: 0,
      retailer:
        user.role === "retailer" ? "ร้านสมชายค้าเหล็ก" : "ร้านเจริญทรัพย์",
      broker:
        user.role === "broker" ? "บริษัท เอส.เอส. เมทัล" : "—",
      grade: "Bundle SY",
      date: demoDate,
      timeSlot: bookableSlots[1],
      heavyWeightKg: "40000",
      lightWeightKg: "12000",
      ticketName: "ใบชั่งต้นทาง_ตัวอย่าง.pdf",
      driverId: "",
      employmentType: "contractor",
      carrier: firstDriver?.carrier ?? "",
      plate: firstDriver?.plate ?? "",
      driver: "",
    };
    setDeliveryDrafts((current) => [draft, ...current]);
    setActiveDraftId(draft.id);
    setViewBookingId(null);
    navigateTo("booking");
  }

  function editDeliveryDraft(draft: DeliveryDraft) {
    setActiveDraftId(draft.id);
    setViewBookingId(null);
    navigateTo("booking");
  }

  function viewDeliveryBooking(booking: QueueBooking) {
    setActiveDraftId(null);
    setViewBookingId(booking.id);
    navigateTo("booking");
  }

  function returnToDeliveryNotes() {
    setActiveDraftId(null);
    setViewBookingId(null);
    navigateTo("booking");
  }

  function updateBookingStatus(
    id: string,
    status: BookingStatus,
  ): string | null {
    const booking = bookings.find((item) => item.id === id);
    if (!booking) return "ไม่พบใบนำส่งที่ต้องการเปลี่ยนสถานะ";
    if (!user) return "กรุณาเข้าสู่ระบบก่อนเปลี่ยนสถานะคิว";
    const transitionError = getStatusTransitionError(
      user.role,
      booking.status,
      status,
    );
    if (transitionError) return transitionError;
    setBookings((current) =>
      current.map((booking) =>
        booking.id === id ? { ...booking, status } : booking,
      ),
    );
    return null;
  }

  function createBooking(
    input: Omit<
      QueueBooking,
      "id" | "createdAt" | "status" | "plantId"
    >,
  ): { booking?: QueueBooking; error?: string } {
    if (
      !hasCurrentPolicyAcknowledgement(
        input.retailer,
        policyVersion,
        acknowledgements,
      )
    ) {
      return { error: "ร้านค้ายังไม่ได้รับทราบนโยบาย PDPA ฉบับปัจจุบัน" };
    }
    const selectedDriver = drivers.find(
      (driver) =>
        driver.name === input.driver &&
        driver.plate === input.plate &&
        driver.carrier === input.carrier,
    );
    if (!selectedDriver) {
      return { error: "ไม่พบผู้ขับและรถที่เลือกในทะเบียน" };
    }
    if (!selectedDriver.approved) {
      return { error: "ผู้ขับหรือรถยังไม่ได้รับการอนุมัติ" };
    }
    const blacklistReasons = getBlacklistReason(
      selectedDriver.id,
      input.plate,
      mockBlacklist,
    );
    if (blacklistReasons.length > 0) {
      return {
        error: `ไม่สามารถสร้างใบนำส่งได้: ${blacklistReasons.join(" · ")}`,
      };
    }
    const schedule = schedulePlant(
      {
        date: input.date,
        timeSlot: input.timeSlot,
        grade: input.grade,
        estimatedTons: input.estimatedTons,
      },
      plans,
      bookings,
      resolveCapacity,
    );
    if (!schedule.available) return { error: schedule.reason };

    const datePart = input.date.replaceAll("-", "").slice(2);
    const nextBooking: QueueBooking = {
      ...input,
      plantId: schedule.decision.plantId,
      schedulingReason: schedule.decision.reason,
      id: `SC${datePart}${String(bookings.length + 1).padStart(2, "0")}`,
      createdAt: new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "confirmed",
    };
    setBookings((current) => [nextBooking, ...current]);
    setPlans((current) =>
      current.map((plan) =>
        plan.plantId === nextBooking.plantId &&
        plan.grade === nextBooking.grade
          ? { ...plan, reserved: plan.reserved + nextBooking.estimatedTons }
          : plan,
      ),
    );
    return { booking: nextBooking };
  }

  function moveBooking(bookingId: string, targetPlantId: string) {
    const booking = bookings.find((item) => item.id === bookingId);
    if (!booking) return "ไม่พบใบนำส่งที่ต้องการโยกโรงงาน";
    if (booking.plantId === targetPlantId) {
      return "รถคันนี้อยู่ที่โรงงานปลายทางดังกล่าวแล้ว";
    }
    if (booking.status === "completed") {
      return "ไม่สามารถโยกรายการที่ผ่านป้อม รปภ. แล้ว";
    }
    const result = canMoveBookingToPlant(
      booking,
      targetPlantId,
      plans,
      bookings,
      resolveCapacity,
    );
    if (!result.available) return result.reason;

    setBookings((current) =>
      current.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              plantId: targetPlantId,
              schedulingReason: result.decision.reason,
            }
          : item,
      ),
    );
    setPlans((current) =>
      current.map((plan) => {
        if (
          plan.plantId === booking.plantId &&
          plan.grade === booking.grade
        ) {
          return {
            ...plan,
            reserved: Math.max(0, plan.reserved - booking.estimatedTons),
          };
        }
        if (plan.plantId === targetPlantId && plan.grade === booking.grade) {
          return {
            ...plan,
            reserved: plan.reserved + booking.estimatedTons,
          };
        }
        return plan;
      }),
    );
    return null;
  }

  function changeHourlyDefault(date: string, plantId: string, value: number) {
    setDraftConfig((current) => setHourlyDefault(current, date, plantId, value));
  }

  function changeSlotCapacities(
    date: string,
    plantId: string,
    slot: string,
    capacities: GradeCapacities,
    closureReason: string | null,
  ) {
    setDraftConfig((current) =>
      setSlotClosure(
        setSlotCapacities(current, date, plantId, slot, capacities),
        date,
        plantId,
        slot,
        closureReason,
      ),
    );
  }

  function resetSlotCapacity(date: string, plantId: string, slot: string) {
    setDraftConfig((current) =>
      resetSlotCapacities(current, date, plantId, slot),
    );
  }

  function saveDay(date: string) {
    setSavedConfig((current) => copyDateConfig(draftConfig, current, date));
    setSavedDays((current) => ({
      ...current,
      [date]: {
        locked: true,
        savedAt: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    }));
  }

  function editDay(date: string) {
    setSavedDays((current) =>
      current[date] ? { ...current, [date]: { ...current[date], locked: false } } : current,
    );
  }

  function discardDay(date: string) {
    setDraftConfig((current) => copyDateConfig(savedConfig, current, date));
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
        canManagePlans={
          user.role === "admin" || user.role === "operations"
        }
        queuePage={
          user.role === "security"
            ? "security"
            : user.role === "admin" || user.role === "operations"
              ? "operations"
              : "delivery-notes"
        }
        queueActionLabel={
          user.role === "security"
            ? "ไปสถานี รปภ."
            : user.role === "admin" || user.role === "operations"
              ? "ไปหน้าปฏิบัติการ"
              : "ดูใบนำส่ง"
        }
      />
    );
  } else if (page === "plans") {
    content = (
      <PlansPage
        plans={plans}
        bookings={bookings}
        capacityConfig={draftConfig}
        savedConfig={savedConfig}
        savedDays={savedDays}
        onSaveDay={saveDay}
        onEditDay={editDay}
        onDiscardDay={discardDay}
        onHourlyDefaultChange={changeHourlyDefault}
        onSlotCapacitiesChange={changeSlotCapacities}
        onSlotCapacitiesReset={resetSlotCapacity}
      />
    );
  } else if (page === "booking") {
    const activeDraft = deliveryDrafts.find(
      (draft) => draft.id === activeDraftId,
    );
    const viewedBooking = bookings.find(
      (booking) => booking.id === viewBookingId,
    );
    const formDraft =
      activeDraft ??
      (viewedBooking
        ? {
            id: `view-${viewedBooking.id}`,
            step: 2 as const,
            retailer: viewedBooking.retailer,
            broker: viewedBooking.broker,
            grade: viewedBooking.grade,
            date: viewedBooking.date,
            timeSlot: viewedBooking.timeSlot,
            heavyWeightKg: String(viewedBooking.heavyWeightKg),
            lightWeightKg: String(viewedBooking.lightWeightKg),
            ticketName: viewedBooking.ticketName,
            driverId: "",
            employmentType: "contractor" as const,
            carrier: viewedBooking.carrier,
            plate: viewedBooking.plate,
            driver: viewedBooking.driver,
          } satisfies DeliveryDraft
        : null);
    if (formDraft) {
      content = (
        <BookingPage
          key={formDraft.id}
          user={user}
          drivers={drivers}
          blacklist={mockBlacklist}
          plans={plans}
          bookings={bookings}
          resolveCapacity={resolveCapacity}
          acknowledgements={acknowledgements}
          onCreate={createBooking}
          onGoToRegistry={() => navigateTo("drivers")}
          onAcknowledgePolicies={(shopName) => {
            return acknowledgeShopPolicies(shopName, user.id);
          }}
          draft={formDraft}
          viewBooking={viewedBooking}
          onDraftChange={updateDeliveryDraft}
          onCompleteDraft={completeDeliveryDraft}
          onReturnToList={returnToDeliveryNotes}
        />
      );
    } else {
      content = (
        <DeliveryNotesPage
          bookings={bookings}
          drafts={deliveryDrafts}
          canCreateBooking={user.role !== "security" && user.role !== "operations"}
          onCreateBooking={startNewDeliveryDraft}
          onSelectDraft={editDeliveryDraft}
          onSelectBooking={viewDeliveryBooking}
        />
      );
    }
  } else if (page === "operations") {
    content = (
      <CallingPage
        bookings={bookings}
        plans={plans}
        onStatusChange={updateBookingStatus}
        onMoveBooking={moveBooking}
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
        drafts={deliveryDrafts}
        canCreateBooking={
          user.role !== "security" && user.role !== "operations"
        }
        onCreateBooking={startNewDeliveryDraft}
        onSelectDraft={editDeliveryDraft}
        onSelectBooking={viewDeliveryBooking}
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
        setActiveDraftId(null);
        setViewBookingId(null);
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
      {content}
      <div className="mt-8 flex items-center justify-between border-t border-slate-200/70 pt-4 text-[10px] text-slate-400">
        <span>SYS Queue Management · Demo v1.0</span>
        <span>ข้อมูลตัวอย่าง · {demoUsers.length} บัญชีทดลอง</span>
      </div>
    </AppShell>
  );
}
