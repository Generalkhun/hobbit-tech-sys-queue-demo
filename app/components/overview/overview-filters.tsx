import { plants } from "@/app/data/mock-data";

export function OverviewFilters({
  date,
  plantFilter,
  onDateChange,
  onPlantFilterChange,
}: {
  date: string;
  plantFilter: string;
  onDateChange: (date: string) => void;
  onPlantFilterChange: (plantId: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-sys-900">Monitor Dashboard</h2>
        <p className="mt-1 text-xs text-slate-500">
          เปรียบเทียบยอดจองกับยอดรับจริง และติดตามใบที่ไม่มาตามนัด/มาผิดวัน
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-500">
          วันที่
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 bg-transparent text-sm text-slate-700 outline-none"
            aria-label="เลือกวันที่ dashboard"
          />
        </label>
        <select
          value={plantFilter}
          onChange={(event) => onPlantFilterChange(event.target.value)}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-700"
          aria-label="กรองโรงงาน dashboard"
        >
          <option value="all">ทุกโรงงาน</option>
          {plants.map((plant) => (
            <option key={plant.id} value={plant.id}>
              {plant.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
