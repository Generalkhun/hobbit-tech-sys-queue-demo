import { getGradeColor } from "@/app/data/grade-colors";
import { KG_PER_VEHICLE_FACTOR, type GradeDaySummary } from "@/app/data/slot-capacity";
import { Panel } from "@/app/components/ui";

export function CapacitySummary({
  summary,
  grades,
}: {
  summary: GradeDaySummary[];
  grades: string[];
}) {
  const totalVehicles = summary.reduce((sum, row) => sum + row.vehicles, 0);
  const totalKilograms = summary.reduce((sum, row) => sum + row.kilograms, 0);

  return (
    <Panel className="p-5 sm:p-6">
      <h2 className="text-lg font-bold text-sys-900">สรุปการรับเหล็กทั้งวัน</h2>
      <p className="text-xs text-slate-400">
        จำนวนรถรวมทุกช่วงเวลา × {KG_PER_VEHICLE_FACTOR} = กก.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {summary.map((row) => {
          const color = getGradeColor(grades, row.grade);
          return (
            <div key={row.grade} className={`overflow-hidden rounded-xl ${color.soft}`}>
              <div className={`h-1.5 ${color.bar}`} />
              <div className={`p-4 ${color.text}`}>
                <p className="truncate text-xs font-medium">{row.grade}</p>
                <p className="mt-1 text-2xl font-bold">
                  {row.vehicles} <span className="text-xs font-medium">คัน</span>
                </p>
                <p className="text-xs font-medium">
                  {row.kilograms.toLocaleString("th-TH")} กก.
                </p>
              </div>
            </div>
          );
        })}
        <div className="rounded-xl bg-sys-800 p-4 text-white">
          <p className="text-xs font-medium text-sys-200">รวมทุกเกรด</p>
          <p className="mt-1 text-2xl font-bold">
            {totalVehicles} <span className="text-xs font-medium">คัน</span>
          </p>
          <p className="text-xs font-medium text-sys-200">
            {totalKilograms.toLocaleString("th-TH")} กก.
          </p>
        </div>
      </div>
    </Panel>
  );
}
