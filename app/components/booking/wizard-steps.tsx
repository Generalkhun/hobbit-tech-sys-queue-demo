import type { IconName } from "@/app/components/icons";
import { StepBar } from "@/app/components/shared/step-bar";
import type { BookingStep } from "@/app/types/booking-form";

const wizardSteps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลการจัดส่ง", icon: "document" },
  { title: "รถยนต์", icon: "truck" },
  { title: "พนักงานขับรถยนต์", icon: "user" },
];

export function WizardSteps({ step }: { step: BookingStep }) {
  return <StepBar steps={wizardSteps} current={step} label="ขั้นตอนการสร้างใบนำส่ง" />;
}
