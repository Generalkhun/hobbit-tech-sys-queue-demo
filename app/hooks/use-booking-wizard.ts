import { useEffect, useState, type FormEvent } from "react";
import { demoDate, policyVersion } from "@/app/data/mock-data";
import {
  getBlacklistReason,
  hasCurrentPolicyAcknowledgement,
} from "@/app/data/eligibility";
import { schedulePlant } from "@/app/data/scheduling";
import { bookableSlots } from "@/app/data/slot-time";
import {
  scopeVehicles,
  groupRegistryVehicles,
  findSellerByName,
  ownShop,
} from "@/app/data/booking-form";
import { isDriverApproved } from "@/app/data/registry";
import type {
  BookingPageProps,
  BookingStep,
  DeliveryFormValues,
  DeliveryVehicle,
  EditableStep,
  EmploymentType,
  VehicleScope,
} from "@/app/types/booking-form";
import type { DeliveryDraft, QueueBooking } from "@/app/types/queue";

export function useBookingWizard({
  user,
  drivers,
  vehicles,
  sellers,
  shops,
  blacklist,
  plans,
  bookings,
  acknowledgements,
  onCreate,
  onAcknowledgePolicies,
  resolveCapacity,
  isRushHourReopened,
  draft,
  viewBooking,
  onDraftChange,
  onCompleteDraft,
  onReturnToList,
}: BookingPageProps) {
  const [step, setStep] = useState<BookingStep>(
    viewBooking ? 3 : draft.step,
  );
  const [form, setForm] = useState<DeliveryFormValues>({
    retailer: draft.retailer || ownShop,
    broker: draft.broker || "—",
    grade: draft.grade || "Bundle SY",
    date: draft.date || demoDate,
    timeSlot: draft.timeSlot || bookableSlots[1],
    heavyWeightKg: draft.heavyWeightKg || "40000",
    lightWeightKg: draft.lightWeightKg || "12000",
    ticketName: draft.ticketName || "ใบชั่งต้นทาง_ตัวอย่าง.pdf",
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [dataUseAccepted, setDataUseAccepted] = useState(false);
  const approvedDrivers = drivers.filter(isDriverApproved);
  const { retailer, broker, grade, date, timeSlot } = form;
  const sellerScopeName =
    user.role === "broker"
      ? broker !== "—" && broker !== ""
        ? broker
        : user.organization.replace(" · นายหน้า", "")
      : "";
  const vehicleScope: VehicleScope =
    user.role === "admin"
      ? { kind: "admin" }
      : user.role === "broker"
        ? { kind: "broker", sellerId: findSellerByName(sellers, sellerScopeName)?.id ?? null }
        : { kind: "retailer", shopName: retailer || ownShop };
  const scopedVehicles = scopeVehicles(vehicles, sellers, shops, vehicleScope);
  const allVehicles = groupRegistryVehicles(vehicles, approvedDrivers);
  const vehiclesByScope = groupRegistryVehicles(scopedVehicles, approvedDrivers);
  const [vehicleKey, setVehicleKey] = useState(() =>
    (draft.carrier && draft.plate
      ? vehiclesByScope.find(
          (vehicle) =>
            vehicle.plate === draft.plate && vehicle.province === draft.province,
        )?.key ??
        vehiclesByScope.find(
          (vehicle) =>
            vehicle.plate === draft.plate && vehicle.carrier === draft.carrier,
        )?.key
      : undefined) ?? vehiclesByScope[0]?.key ?? "",
  );
  // เมื่อสังกัดเปลี่ยน (เช่น ผู้ขายเปลี่ยนร้านค้า) ให้เลือกรถคันแรกของสังกัดใหม่
  useEffect(() => {
    if (vehicleKey !== "" && !vehiclesByScope.some((v) => v.key === vehicleKey)) {
      setVehicleKey(vehiclesByScope[0]?.key ?? "");
    }
  }, [vehiclesByScope, vehicleKey]);
  const selectedVehicle =
    vehiclesByScope.find((vehicle) => vehicle.key === vehicleKey) ??
    vehiclesByScope[0];
  const [employmentType, setEmploymentType] =
    useState<EmploymentType>(draft.employmentType || "contractor");
  const [driverId, setDriverId] = useState(draft.driverId);
  const [createdBooking, setCreatedBooking] = useState<QueueBooking | null>(
    viewBooking ?? null,
  );
  const [formError, setFormError] = useState("");

  const heavyWeight = Number(form.heavyWeightKg);
  const lightWeight = Number(form.lightWeightKg);
  const hasValidWeights =
    Number.isFinite(heavyWeight) &&
    Number.isFinite(lightWeight) &&
    heavyWeight > 0 &&
    lightWeight > 0;
  const estimatedTons = (heavyWeight - lightWeight) / 1000;
  const schedule = schedulePlant(
    { date, timeSlot, grade, estimatedTons },
    plans,
    bookings,
    resolveCapacity,
    isRushHourReopened,
  );
  const unavailableSlots = bookableSlots.filter(
    (slot) => !schedulePlant(
      { date, timeSlot: slot, grade, estimatedTons },
      plans,
      bookings,
      resolveCapacity,
      isRushHourReopened,
    ).available,
  );
  const selectedVehicleBlacklistReasons = selectedVehicle
    ? getBlacklistReason("", selectedVehicle.plate, blacklist)
    : [];

  const shopHasAcknowledged = hasCurrentPolicyAcknowledgement(
    retailer,
    policyVersion,
    acknowledgements,
  );
  const availableDrivers =
    selectedVehicle?.drivers.filter(
      (driver) => driver.employmentType === employmentType,
    ) ?? [];
  const selectedDriver =
    availableDrivers.find((driver) => driver.id === driverId) ??
    availableDrivers[0];
  const selectedDriverBlacklistReasons = selectedDriver
    ? getBlacklistReason(selectedDriver.id, selectedDriver.plate, blacklist)
    : [];

  function updateForm(patch: Partial<DeliveryFormValues>) {
    setForm((current) => ({ ...current, ...patch }));
    if (patch.retailer !== undefined) {
      setPrivacyAccepted(false);
      setDataUseAccepted(false);
    }
  }

  function getCurrentDraft(
    savedStep: EditableStep = step === 3 ? 2 : step,
  ): DeliveryDraft {
    return {
      id: draft.id,
      step: savedStep,
      ...form,
      driverId,
      employmentType,
      carrier: selectedVehicle?.carrier ?? "",
      plate: selectedVehicle?.plate ?? "",
      province: selectedVehicle?.province ?? "",
      driver: selectedDriver?.name ?? "",
    };
  }

  function saveDraft() {
    onDraftChange(getCurrentDraft());
    onReturnToList();
  }

  function continueToVehicle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!hasValidWeights) {
      setFormError("กรุณาระบุน้ำหนักชั่งหนักและชั่งเบาให้มากกว่า 0 กิโลกรัม");
      return;
    }
    if (estimatedTons <= 0) {
      setFormError("น้ำหนักชั่งหนักต้องมากกว่าน้ำหนักชั่งเบา");
      return;
    }
    if (!shopHasAcknowledged) {
      if (user.role === "retailer" && privacyAccepted && dataUseAccepted) {
        const saved = onAcknowledgePolicies(retailer);
        if (!saved) {
          setFormError("บันทึกการยอมรับนโยบายไม่สำเร็จ จึงยังดำเนินการต่อไม่ได้");
          return;
        }
      } else {
        setFormError(
          "ร้านค้าต้องเข้าสู่ระบบและยอมรับนโยบาย PDPA ทั้งสองฉบับก่อนสร้างใบนำส่ง",
        );
        return;
      }
    }
    if (!schedule.available) {
      setFormError(schedule.reason);
      return;
    }
    onDraftChange(getCurrentDraft(1));
    setStep(1);
  }

  function chooseVehicle(vehicle: DeliveryVehicle) {
    setVehicleKey(vehicle.key);
    setEmploymentType(vehicle.drivers[0]?.employmentType ?? "contractor");
    setDriverId(vehicle.drivers[0]?.id ?? "");
    setFormError("");
  }

  function continueToDriver() {
    if (!selectedVehicle) {
      setFormError("กรุณาเลือกรถยนต์ก่อนดำเนินการต่อ");
      return;
    }
    setFormError("");
    onDraftChange(getCurrentDraft(2));
    setStep(2);
  }

  function backToVehicle() {
    onDraftChange(getCurrentDraft(1));
    setStep(1);
  }

  function changeEmploymentType(type: EmploymentType) {
    setEmploymentType(type);
    setDriverId("");
  }

  function saveBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedVehicle) {
      setFormError("กรุณาเลือกรถยนต์ก่อนบันทึกข้อมูล");
      return;
    }
    if (!selectedDriver || !isDriverApproved(selectedDriver)) {
      setFormError("กรุณาเลือกพนักงานขับรถที่ผ่านการอนุมัติแล้ว");
      return;
    }
    if (!form.ticketName) {
      setFormError("กรุณาแนบใบชั่งต้นทางก่อนบันทึกข้อมูล");
      setStep(0);
      return;
    }
    if (!hasValidWeights || estimatedTons <= 0) {
      setFormError("กรุณาตรวจสอบน้ำหนักชั่งหนักและชั่งเบาให้ถูกต้อง");
      setStep(0);
      return;
    }
    if (selectedDriverBlacklistReasons.length > 0) {
      setFormError(
        `ไม่สามารถสร้างใบนำส่งได้: ${selectedDriverBlacklistReasons.join(" · ")}`,
      );
      return;
    }
    const creation = onCreate({
      retailer,
      broker,
      grade,
      heavyWeightKg: heavyWeight,
      lightWeightKg: lightWeight,
      estimatedTons,
      date,
      timeSlot,
      driver: selectedDriver.name,
      carrier: selectedVehicle.carrier,
      plate: selectedVehicle.plate,
      province: selectedVehicle.province,
      ticketName: form.ticketName,
    });
    if (creation.error || !creation.booking) {
      setFormError(creation.error ?? "ไม่สามารถสร้างใบนำส่งได้ กรุณาลองอีกครั้ง");
      setStep(0);
      return;
    }
    setCreatedBooking(creation.booking);
    setFormError("");
    onCompleteDraft(draft.id);
    setStep(3);
  }

  return {
    step,
    setStep,
    form,
    updateForm,
    heavyWeight,
    lightWeight,
    hasValidWeights,
    unavailableSlots,
    shopHasAcknowledged,
    privacyAccepted,
    setPrivacyAccepted,
    dataUseAccepted,
    setDataUseAccepted,
    vehicles: vehiclesByScope,
    allVehicles,
    vehicleKey,
    selectedVehicle,
    vehicleScope,
    selectedVehicleBlacklistReasons,
    employmentType,
    availableDrivers,
    selectedDriver,
    selectedDriverBlacklistReasons,
    setDriverId,
    createdBooking,
    formError,
    saveDraft,
    continueToVehicle,
    chooseVehicle,
    continueToDriver,
    backToVehicle,
    changeEmploymentType,
    saveBooking,
  };
}
