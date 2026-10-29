import { Icon, type IconName } from "@/app/components/icons";

export interface StepItem {
  title: string;
  icon: IconName;
}

const arrowDepth = "14px";

function stepShape(index: number, total: number) {
  const right = `calc(100% - ${arrowDepth}) 0, 100% 50%, calc(100% - ${arrowDepth}) 100%`;
  if (index === 0) return `polygon(0 0, ${right}, 0 100%)`;
  if (index === total - 1) {
    return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${arrowDepth} 50%)`;
  }
  return `polygon(0 0, ${right}, 0 100%, ${arrowDepth} 50%)`;
}

/** แถบขั้นตอนแบบหัวลูกศรชี้ไปทางขวา */
export function StepBar({
  steps,
  current,
  label,
}: {
  steps: StepItem[];
  current: number;
  label: string;
}) {
  return (
    <div className="scrollbar-thin overflow-x-auto px-4 py-4 sm:px-7" aria-label={label}>
      <ol
        className="grid min-w-[640px]"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step, index) => {
          const complete = index < current;
          const active = index === current;
          const last = index === steps.length - 1;
          return (
            <li
              key={step.title}
              aria-current={active ? "step" : undefined}
              style={{
                clipPath: stepShape(index, steps.length),
                zIndex: steps.length - index,
              }}
              className={`relative flex min-h-[58px] items-center gap-2 px-4 py-2 text-xs font-semibold sm:gap-3 sm:px-6 ${
                last ? "" : "-mr-3"
              } ${
                complete
                  ? "bg-emerald-600 text-white"
                  : active
                    ? "bg-sys-600 text-white"
                    : "bg-sys-50 text-sys-600"
              }`}
            >
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  complete || active ? "bg-white/20" : "bg-white text-sys-600"
                }`}
              >
                <Icon name={complete ? "check" : step.icon} size={16} />
              </span>
              <span className="leading-4">{step.title}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
