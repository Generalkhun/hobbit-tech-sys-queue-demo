"use client";

import { useMemo } from "react";
import {
  ArcElement,
  Chart as ChartJS,
  Legend,
  Tooltip,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Icon } from "@/app/components/icons";
import { Panel } from "@/app/components/ui";
import { mockOnTimeStats, mockTopShops } from "@/app/data/mock-data";

ChartJS.register(ArcElement, Tooltip, Legend);

/** แดชบอร์ด จศ.: โดนัทอัตราตรงเวลา 30 วัน + Top 5 ร้านที่ส่งมากที่สุด */
export function DashboardCharts() {
  const onTime = mockOnTimeStats;
  const topShops = mockTopShops;

  const doughnutData = useMemo(
    () => ({
      labels: ["ตรงเวลา", "มาสาย", "ไม่มา"],
      datasets: [
        {
          data: [onTime.onTimeTrips, onTime.lateTrips, onTime.noShowTrips],
          backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 6,
        },
      ],
    }),
    [onTime],
  );

  const doughnutOptions: ChartOptions<"doughnut"> = {
    cutout: "68%",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.parsed as number;
            const percent = ((value / onTime.totalTrips) * 100).toFixed(1);
            return ` ${ctx.label}: ${value} เที่ยว (${percent}%)`;
          },
        },
      },
    },
  };

  const maxTons = Math.max(...topShops.map((shop) => shop.tons));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* โดนัท: % ตรงเวลา 30 วันย้อนหลัง */}
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Icon name="clock" size={19} />
          </div>
          <div>
            <h3 className="font-bold text-sys-900">การมาส่งตรงเวลา</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              30 วันย้อนหลัง · {onTime.totalTrips} เที่ยว
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <div className="relative h-44 w-44 shrink-0">
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">
                  {onTime.onTimePercent}%
                </p>
                <p className="text-[11px] text-slate-400">ตรงเวลา</p>
              </div>
            </div>
          </div>

          <ul className="w-full space-y-2.5 sm:w-auto">
            {[
              { label: "ตรงเวลา", value: onTime.onTimeTrips, color: "bg-emerald-500" },
              { label: "มาสาย", value: onTime.lateTrips, color: "bg-amber-500" },
              { label: "ไม่มา", value: onTime.noShowTrips, color: "bg-rose-500" },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-xs">
                <span className={`h-3 w-3 shrink-0 rounded-sm ${item.color}`} />
                <span className="w-16 text-slate-600">{item.label}</span>
                <span className="font-bold text-sys-900">{item.value}</span>
                <span className="text-slate-400">
                  ({((item.value / onTime.totalTrips) * 100).toFixed(1)}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {/* Top 5 ร้านที่ส่งมากที่สุด */}
      <Panel className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name="chart" size={19} />
          </div>
          <div>
            <h3 className="font-bold text-sys-900">Top 5 ร้านที่ส่งมากที่สุด</h3>
            <p className="mt-0.5 text-xs text-slate-400">
              น้ำหนักรวม 30 วันย้อนหลัง · พร้อมอัตราตรงเวลา
            </p>
          </div>
        </div>

        <ul className="mt-5 space-y-3.5">
          {topShops.map((shop, index) => (
            <li key={shop.shopName}>
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-700"
                      : index === 1
                        ? "bg-slate-200 text-slate-600"
                        : index === 2
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-700">
                  {shop.shopName}
                </span>
                <span className="shrink-0 text-xs font-bold text-sys-900">
                  {shop.tons.toLocaleString("th-TH", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}{" "}
                  <span className="text-[10px] font-medium text-slate-400">ตัน</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2 pl-9">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-sys-500"
                    style={{ width: `${(shop.tons / maxTons) * 100}%` }}
                  />
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">
                  {shop.trips} เที่ยว
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    shop.onTimePercent >= 90
                      ? "bg-emerald-50 text-emerald-700"
                      : shop.onTimePercent >= 80
                        ? "bg-amber-50 text-amber-700"
                        : "bg-rose-50 text-rose-700"
                  }`}
                >
                  ตรงเวลา {shop.onTimePercent}%
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
