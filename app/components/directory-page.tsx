"use client";

import { useMemo, useState } from "react";
import {
  type DirectoryDefinition,
  type DirectoryRecord,
} from "@/app/data/directories";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";

export function DirectoryPage({
  definition,
  canManage,
}: {
  definition: DirectoryDefinition;
  canManage: boolean;
}) {
  const [records, setRecords] = useState(definition.records);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const filtered = useMemo(
    () =>
      records.filter((record) =>
        `${record.id} ${record.name} ${record.detail}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [records, search],
  );
  const activeCount = records.filter((record) => record.status === "active").length;
  const pendingCount = records.length - activeCount;

  function addRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const record: DirectoryRecord = {
      id: `${definition.page.slice(0, 2).toUpperCase()}-${String(records.length + 1).padStart(3, "0")}`,
      name: name.trim(),
      detail: detail.trim() || "เพิ่มโดยผู้ดูแลระบบ",
      status: "active",
    };
    setRecords((current) => [record, ...current]);
    setName("");
    setDetail("");
    setShowForm(false);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-sys-50 text-sys-700">
            <Icon name={definition.icon} size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">รายการทั้งหมด</p>
            <p className="mt-1 text-2xl font-bold text-sys-900">{records.length}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <Icon name="circle-check" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">ใช้งาน</p>
            <p className="mt-1 text-2xl font-bold text-sys-900">{activeCount}</p>
          </div>
        </Panel>
        <Panel className="flex items-center gap-4 p-5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Icon name="clock" size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-400">รอตรวจสอบ</p>
            <p className="mt-1 text-2xl font-bold text-sys-900">{pendingCount}</p>
          </div>
        </Panel>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name={definition.icon} size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">{definition.title}</h2>
              <p className="mt-1 text-xs text-slate-400">
                {definition.description}
              </p>
            </div>
          </div>
          {canManage && (
            <Button onClick={() => setShowForm((open) => !open)}>
              <Icon name={showForm ? "close" : "plus"} size={16} />
              {showForm ? "ปิดแบบฟอร์ม" : `เพิ่ม${definition.noun}`}
            </Button>
          )}
        </div>

        {showForm && (
          <form
            onSubmit={addRecord}
            className="grid gap-3 border-b border-slate-100 bg-sys-50/40 p-5 sm:grid-cols-[1fr_1fr_auto]"
          >
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
              ชื่อ{definition.noun}
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sys-400"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">
              รายละเอียด
              <input
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sys-400"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" className="h-10 w-full sm:w-auto">
                <Icon name="check" size={15} />
                บันทึกข้อมูล
              </Button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <p className="text-xs text-slate-500">
            รายชื่อ{definition.title}ในระบบ
          </p>
          <div className="relative">
            <Icon
              name="search"
              size={15}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              className="h-10 w-56 rounded-xl border border-slate-200 pl-9 pr-3 text-xs outline-none focus:border-sys-400"
              placeholder="ค้นหาข้อมูล..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label={`ค้นหา${definition.title}`}
            />
          </div>
        </div>

        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-6 py-3.5">รหัส</th>
                <th className="px-4 py-3.5">ชื่อรายการ</th>
                <th className="px-4 py-3.5">{definition.columns[0]}</th>
                <th className="px-4 py-3.5">{definition.columns[1]}</th>
                <th className="px-6 py-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-semibold text-sys-700">
                    {record.id}
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-700">
                    {record.name}
                  </td>
                  <td className="px-4 py-4 text-slate-500">{record.detail}</td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        record.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {record.status === "active" ? "ใช้งาน" : "รอตรวจสอบ"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {canManage && (
                      <button
                        type="button"
                        onClick={() =>
                          setRecords((current) =>
                            current.map((item) =>
                              item.id === record.id
                                ? {
                                    ...item,
                                    status:
                                      item.status === "active"
                                        ? "pending"
                                        : "active",
                                  }
                                : item,
                            ),
                          )
                        }
                        className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-sys-700 hover:bg-sys-50"
                      >
                        {record.status === "active" ? "ระงับ" : "เปิดใช้งาน"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-slate-400">
              ไม่พบข้อมูลที่ค้นหา
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
}
