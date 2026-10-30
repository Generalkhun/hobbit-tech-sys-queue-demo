import { Icon, type IconName } from "@/app/components/icons";

interface Card {
  label: string;
  value: number;
  icon: IconName;
  card: string;
  circle: string;
}

/** การ์ดสรุป 4 ช่องของหน้าจัดการการส่ง */
export function OperationsSummary({
  delivering,
  callRequested,
  unreachable,
  confirmed,
}: {
  delivering: number;
  callRequested: number;
  unreachable: number;
  confirmed: number;
}) {
  const cards: Card[] = [
    { label: "กำลังจัดส่ง", value: delivering, icon: "truck", card: "bg-sky-50", circle: "bg-sky-500" },
    { label: "ให้เรียกรถยนต์", value: callRequested, icon: "phone", card: "bg-orange-50", circle: "bg-orange-400" },
    { label: "ติดต่อไม่ได้", value: unreachable, icon: "close", card: "bg-rose-50", circle: "bg-rose-500" },
    { label: "ยืนยันการจัดส่ง", value: confirmed, icon: "check", card: "bg-emerald-50", circle: "bg-emerald-500" },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`flex items-center justify-between rounded-2xl p-5 shadow-sm ${card.card}`}
        >
          <span className={`grid h-14 w-14 place-items-center rounded-full text-white ${card.circle}`}>
            <Icon name={card.icon} size={26} />
          </span>
          <div className="text-right">
            <p className="text-3xl font-bold text-sys-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-600">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
