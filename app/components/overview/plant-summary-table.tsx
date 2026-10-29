import { Panel } from "@/app/components/ui";
import { formatKg, type OverviewMetrics } from "@/app/data/overview";

export function PlantSummaryTable({ metrics }: { metrics: OverviewMetrics }) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h3 className="font-bold text-sys-900">ปริมาณจองเทียบกับยอดรับจริง</h3>
        <p className="mt-1 text-xs text-slate-400">
          แยกตามโรงงาน · วันที่รับจริงที่ต่างจากวันที่จองจะนับเป็นมาผิดวัน
        </p>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-slate-50 text-[11px] text-slate-500">
            <tr>
              <th className="px-6 py-3.5">โรงงาน</th>
              <th className="px-4 py-3.5">จองในวันนี้</th>
              <th className="px-4 py-3.5">เข้าจริงตรงวัน</th>
              <th className="px-4 py-3.5">จองแล้วไม่มา</th>
              <th className="px-6 py-3.5">มาผิดวันในวันนี้</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metrics.plantSummary.map((plant) => (
              <tr key={plant.id}>
                <td className="px-6 py-4 font-semibold text-sys-800">{plant.name}</td>
                <td className="px-4 py-4 text-slate-600">{formatKg(plant.bookedKg)}</td>
                <td className="px-4 py-4 text-emerald-700">{formatKg(plant.receivedKg)}</td>
                <td className="px-4 py-4 text-amber-700">{formatKg(plant.noShowKg)}</td>
                <td className="px-6 py-4 text-violet-700">{formatKg(plant.lateKg)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50 font-semibold">
              <td className="px-6 py-4 text-sys-900">รวม</td>
              <td className="px-4 py-4">{formatKg(metrics.bookedKg)}</td>
              <td className="px-4 py-4 text-emerald-700">{formatKg(metrics.receivedKg)}</td>
              <td className="px-4 py-4 text-amber-700">{formatKg(metrics.noShowKg)}</td>
              <td className="px-6 py-4 text-violet-700">{formatKg(metrics.lateKg)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
