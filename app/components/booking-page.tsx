"use client";

import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import { BookingSuccessStep } from "@/app/components/booking/booking-success-step";
import { DeliveryInfoStep } from "@/app/components/booking/delivery-info-step";
import { DriverStep } from "@/app/components/booking/driver-step";
import { VehicleStep } from "@/app/components/booking/vehicle-step";
import { WizardSteps } from "@/app/components/booking/wizard-steps";
import { retailerNames } from "@/app/data/booking-form";
import { useBookingWizard } from "@/app/hooks/use-booking-wizard";
import type { BookingPageProps } from "@/app/types/booking-form";

export { retailerNames };

export function BookingPage(props: BookingPageProps) {
  const {
    user,
    blacklist,
    draft,
    viewBooking,
    verificationCodes,
    onGoToRegistry,
    onReturnToList,
    onGenerateVerificationCode,
  } = props;
  const wizard = useBookingWizard(props);
  const { step, createdBooking, formError } = wizard;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onReturnToList}
        className="inline-flex items-center gap-2 text-sm font-semibold text-sys-700 hover:text-sys-900"
      >
        <Icon name="arrow" size={15} className="rotate-180" />
        กลับไปรายการใบนำส่ง
      </button>
      <Panel className="overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
          <h2 className="text-base font-bold text-sys-900">
            {viewBooking
              ? "รายละเอียดใบนำส่ง"
              : draft.step > 0
                ? "แก้ไขใบนำส่งเศษเหล็ก"
                : "สร้างใบนำส่งเศษเหล็ก"}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            กรอกข้อมูลตามลำดับขั้นตอนเพื่อออกใบนำส่ง
          </p>
        </div>

        <WizardSteps step={step} />

        {step === 0 && (
          <DeliveryInfoStep
            form={wizard.form}
            onFormChange={wizard.updateForm}
            role={user.role}
            heavyWeight={wizard.heavyWeight}
            lightWeight={wizard.lightWeight}
            hasValidWeights={wizard.hasValidWeights}
            unavailableSlots={wizard.unavailableSlots}
            shopHasAcknowledged={wizard.shopHasAcknowledged}
            privacyAccepted={wizard.privacyAccepted}
            dataUseAccepted={wizard.dataUseAccepted}
            onPrivacyChange={wizard.setPrivacyAccepted}
            onDataUseChange={wizard.setDataUseAccepted}
            formError={formError}
            onSubmit={wizard.continueToVehicle}
            onSaveDraft={wizard.saveDraft}
          />
        )}

        {step === 1 && (
          <VehicleStep
            vehicles={wizard.vehicles}
            vehicleKey={wizard.vehicleKey}
            selectedVehicle={wizard.selectedVehicle}
            blacklist={blacklist}
            formError={formError}
            onChooseVehicle={wizard.chooseVehicle}
            onBack={() => wizard.setStep(0)}
            onNext={wizard.continueToDriver}
            onSaveDraft={wizard.saveDraft}
          />
        )}

        {step === 2 && (
          <DriverStep
            selectedVehicle={wizard.selectedVehicle}
            employmentType={wizard.employmentType}
            availableDrivers={wizard.availableDrivers}
            selectedDriver={wizard.selectedDriver}
            selectedDriverBlacklistReasons={
              wizard.selectedDriverBlacklistReasons
            }
            blacklist={blacklist}
            formError={formError}
            onEmploymentTypeChange={wizard.changeEmploymentType}
            onDriverChange={wizard.setDriverId}
            onGoToRegistry={onGoToRegistry}
            onSubmit={wizard.saveBooking}
            onBack={wizard.backToVehicle}
            onSaveDraft={wizard.saveDraft}
          />
        )}

        {step === 3 && createdBooking && (
          <BookingSuccessStep
            booking={createdBooking}
            verificationCode={verificationCodes[createdBooking.id]}
            onGenerateVerificationCode={onGenerateVerificationCode}
            onReturnToList={onReturnToList}
          />
        )}
      </Panel>
    </div>
  );
}
