import { Icon, type IconName } from "@/app/components/icons";
import type { BookingStep } from "@/app/types/booking-form";

const wizardSteps: { title: string; icon: IconName }[] = [
  { title: "ข้อมูลการจัดส่ง", icon: "document" },
  { title: "รถยนต์", icon: "truck" },
  { title: "พนักงานขับรถยนต์", icon: "user" },
];

export function WizardSteps({ step }: { step: BookingStep }) {
  return (
    <div
      className="scrollbar-thin overflow-x-auto px-4 py-4 sm:px-7"
      aria-label="ขั้นตอนการสร้างใบนำส่ง"
    >
      <ol className="grid min-w-[640px] grid-cols-3">
        {wizardSteps.map((wizardStep, index) => {
          const complete = index < step;
          const current = index === step;
          return (
            <li
              key={wizardStep.title}
              aria-current={current ? "step" : undefined}
              style={{
                clipPath:
                  index === 0
                    ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
                    : index === wizardSteps.length - 1
                      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
                      : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
              }}
              className={`relative -mr-3 flex min-h-[58px] items-center gap-2 px-4 py-2 text-xs font-semibold sm:gap-3 sm:px-6 ${
                index === 0
                  ? "z-30"
                  : index === 1
                    ? "z-20"
                    : "z-10 mr-0"
              } ${
                complete
                  ? "bg-emerald-600 text-white"
                  : current
                    ? "bg-sys-600 text-white"
                    : "bg-sys-50 text-sys-600"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  complete || current
                    ? "bg-white/20"
                    : "bg-white text-sys-600"
                }`}
              >
                {complete ? (
                  <Icon name="check" size={16} />
                ) : (
                  <Icon name={wizardStep.icon} size={16} />
                )}
              </span>
              <span className="leading-4">{wizardStep.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
