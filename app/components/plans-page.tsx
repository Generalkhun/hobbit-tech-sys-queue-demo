import { plants } from "@/app/data/mock-data";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import type { PlanRow } from "@/app/types/queue";

export function PlansPage({
  plans,
  onUpdatePlan,
}: {
  plans: PlanRow[];
  onUpdatePlan: (planId: string, change: Partial<PlanRow>) => void;
}) {
  const totalCapacity = plans.reduce((sum, plan) => sum + plan.dailyLimit, 0);
  const totalReserved = plans.reduce((sum, plan) => sum + plan.reserved, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["กำลังเปิดรับ", "2 โรงงาน", "เปิดให้จองคิววันนี้"],
          ["ปริมาณรับรวม", `${totalCapacity} ตัน`, "กำลังการรับต่อวัน"],
          ["จองแล้ว", `${totalReserved} ตัน`, `${Math.round((totalReserved / totalCapacity) * 100)}% ของแผน`],
        ].map((card, index) => (
          <Panel key={card[0]} className="flex items-center gap-4 p-5">
            <div
              className={`grid h-11 w-11 place-items-center rounded-xl ${
                index === 1
                  ? "bg-sys-50 text-sys-700"
                  : index === 2
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Icon
                name={index === 0 ? "warehouse" : index === 1 ? "weight" : "calendar"}
                size={20}
              />
            </div>
            <div>
              <p className="text-xs text-slate-400">{card[0]}</p>
              <p className="mt-1 text-xl font-bold text-sys-900">{card[1]}</p>
              <p className="mt-1 text-[11px] text-slate-400">{card[2]}</p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-bold text-sys-900">แผนรับเศษเหล็กรายเกรด</h2>
            <p className="mt-1 text-xs text-slate-400">
              จัดสรรปริมาณรายวันและช่วงเวลารับแยกตามโรงงาน
            </p>
          </div>
          <Button variant="secondary">
            <Icon name="calendar" size={16} />
            27 ต.ค. 2569
          </Button>
        </div>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3.5">โรงงาน</th>
                <th className="px-4 py-3.5">เกรดเหล็ก</th>
                <th className="px-4 py-3.5">ปริมาณที่เปิดรับ</th>
                <th className="px-4 py-3.5">จองแล้ว</th>
                <th className="px-4 py-3.5">ช่วงเวลารับ</th>
                <th className="px-4 py-3.5">คิวคงเหลือ</th>
                <th className="px-6 py-3.5 text-right">ปรับแผน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => {
                const plant = plants.find((item) => item.id === plan.plantId);
                const percent = Math.min(
                  100,
                  Math.round((plan.reserved / plan.dailyLimit) * 100),
                );
                return (
                  <tr key={plan.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sys-800">{plan.plantId}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {plant?.location}
                      </p>
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-700">
                      {plan.grade}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-sys-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {plan.dailyLimit} ตัน
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {plan.reserved} ตัน
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">
                      {plan.window} น.
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-lg bg-sys-50 px-2.5 py-1 text-xs font-semibold text-sys-700">
                        {plan.slotsOpen} คิว
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          aria-label={`ลดปริมาณแผน ${plan.grade}`}
                          onClick={() =>
                            onUpdatePlan(plan.id, {
                              dailyLimit: Math.max(plan.reserved, plan.dailyLimit - 10),
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          aria-label={`เพิ่มปริมาณแผน ${plan.grade}`}
                          onClick={() =>
                            onUpdatePlan(plan.id, {
                              dailyLimit: plan.dailyLimit + 10,
                            })
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          aria-label={`เพิ่มคิว ${plan.grade}`}
                          onClick={() =>
                            onUpdatePlan(plan.id, {
                              slotsOpen: plan.slotsOpen + 1,
                            })
                          }
                          className="ml-1 grid h-8 w-8 place-items-center rounded-lg bg-sys-50 text-sys-700 hover:bg-sys-100"
                        >
                          <Icon name="calendar" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50">
              <tr>
                <td
                  className="px-6 py-4 font-bold text-sys-900"
                  colSpan={2}
                >
                  รวมแผนรับวันนี้
                </td>
                <td className="px-4 py-4 font-bold text-sys-900">
                  {totalCapacity} ตัน
                </td>
                <td className="px-4 py-4 font-semibold text-slate-600">
                  {totalReserved} ตัน
                </td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
        </div>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2">
        {plants.map((plant) => (
          <Panel key={plant.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
                  <Icon name="warehouse" size={19} />
                </div>
                <div>
                  <h3 className="font-bold text-sys-900">{plant.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">{plant.location}</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                เปิดรับอยู่
              </span>
            </div>
            <div className="mt-5 flex items-center justify-between text-xs">
              <span className="text-slate-500">ปริมาณจองรวม</span>
              <span className="font-semibold text-sys-800">
                {plant.reservedTons} / {plant.dailyCapacity} ตัน
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-sys-500"
                style={{
                  width: `${(plant.reservedTons / plant.dailyCapacity) * 100}%`,
                }}
              />
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
