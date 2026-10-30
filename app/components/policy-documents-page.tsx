"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import { SectionHeader } from "@/app/components/shared/section-header";
import { TabBar } from "@/app/components/shared/tab-bar";
import {
  addPolicyDocument,
  getAcknowledgementStats,
  getActivePolicyDocuments,
  getPolicyDocuments,
  getTargetsByDocumentStatus,
} from "@/app/data/policy-documents";
import type { PolicyDocument } from "@/app/types/queue";

type View = "list" | "create" | "detail";

export function PolicyDocumentsPage({ userName }: { userName: string }) {
  const [view, setView] = useState<View>("list");
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [documentType, setDocumentType] = useState("privacy-notice");
  const [version, setVersion] = useState("1.0");
  const [targetAudience, setTargetAudience] = useState<"shop" | "seller" | "all">("all");

  const docs = getPolicyDocuments();

  function handleCreate() {
    addPolicyDocument(
      {
        title: title.trim(),
        description: description.trim(),
        documentType,
        version: version.trim(),
        targetAudience,
        active: true,
        createdBy: userName,
        updatedBy: userName,
      },
    );
    setTitle("");
    setDescription("");
    setDocumentType("privacy-notice");
    setVersion("1.0");
    setTargetAudience("all");
    setView("list");
  }

  if (view === "create") {
    return (
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <SectionHeader
            icon="file"
            title="เพิ่มเอกสารใหม่"
            description="สร้างเอกสารที่ร้านค้าหรือผู้ขายต้องเข้าไปรับทราบ"
          />
          <div className="mt-5 space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              ชื่อเอกสาร
              <input
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              รายละเอียด
              <textarea
                className="min-h-24 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                ประเภทเอกสาร
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="privacy-notice">ประกาศความเป็นส่วนตัว</option>
                  <option value="personal-data-use">นโยบายการใช้ข้อมูล</option>
                  <option value="terms">ข้อตกลงการใช้งาน</option>
                  <option value="policy">นโยบายอื่น ๆ</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                เวอร์ชัน
                <input
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                กลุ่มเป้าหมาย
                <select
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                  value={targetAudience}
                  onChange={(e) =>
                    setTargetAudience(e.target.value as "shop" | "seller" | "all")
                  }
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="shop">ร้านค้าย่อย</option>
                  <option value="seller">ผู้ขาย</option>
                </select>
              </label>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleCreate}>
                <Icon name="plus" size={16} />
                เพิ่มเอกสาร
              </Button>
              <Button variant="secondary" onClick={() => setView("list")}>
                ยกเลิก
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    );
  }

  if (view === "detail" && selectedDoc) {
    const stats = getAcknowledgementStats(selectedDoc.id);
    const targets = getTargetsByDocumentStatus(selectedDoc.id);
    return (
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-sys-50 text-sys-700">
              <Icon name="file" size={19} />
            </div>
            <div>
              <h2 className="font-bold text-sys-900">{selectedDoc.title}</h2>
              <p className="mt-1 text-xs text-slate-400">
                v{selectedDoc.version} · {selectedDoc.documentType}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{selectedDoc.description}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-slate-400">ทั้งหมด</p>
              <p className="mt-1 text-lg font-bold text-sys-900">{stats.total}</p>
            </div>
            <div className="rounded-xl bg-rose-50 px-3 py-2">
              <p className="text-rose-600">ยังไม่อ่าน</p>
              <p className="mt-1 text-lg font-bold text-rose-700">{stats.unread}</p>
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-2">
              <p className="text-amber-600">อ่านแล้ว</p>
              <p className="mt-1 text-lg font-bold text-amber-700">{stats.read}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-emerald-600">ยืนยันแล้ว</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {stats.acknowledged}
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h3 className="font-bold text-sys-900">รายการผู้รับ</h3>
          </div>
          <div className="scrollbar-thin overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">ชื่อ</th>
                  <th className="px-4 py-3.5">ประเภท</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targets.map((target) => (
                  <tr key={target.targetId} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {target.targetName}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {target.targetType === "shop" ? "ร้านค้าย่อย" : "ผู้ขาย"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          target.status === "acknowledged"
                            ? "bg-emerald-50 text-emerald-700"
                            : target.status === "read"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {target.status === "acknowledged"
                          ? "ยืนยันแล้ว"
                          : target.status === "read"
                            ? "อ่านแล้ว"
                            : "ยังไม่อ่าน"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Button variant="secondary" onClick={() => { setSelectedDoc(null); setView("list"); }}>
          กลับไปรายการเอกสาร
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden">
        <SectionHeader
          icon="file"
          title="จัดการเอกสารรับทราบ"
          description="เพิ่มเอกสารที่ร้านค้าและผู้ขายต้องเข้าไปรับทราบ และติดตามสถานะการยืนยัน"
          action={
            <Button onClick={() => setView("create")}>
              <Icon name="plus" size={16} />
              เพิ่มเอกสาร
            </Button>
          }
        />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">ชื่อเอกสาร</th>
                <th className="px-4 py-3.5">ประเภท</th>
                <th className="px-4 py-3.5">เวอร์ชัน</th>
                <th className="px-4 py-3.5">กลุ่มเป้าหมาย</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-6 py-3.5 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {doc.title}
                  </td>
                  <td className="px-4 py-4 text-slate-500">{doc.documentType}</td>
                  <td className="px-4 py-4 text-slate-500">v{doc.version}</td>
                  <td className="px-4 py-4 text-slate-500">
                    {doc.targetAudience === "all"
                      ? "ทั้งหมด"
                      : doc.targetAudience === "shop"
                        ? "ร้านค้าย่อย"
                        : "ผู้ขาย"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        doc.active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {doc.active ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="quiet"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setView("detail");
                      }}
                    >
                      ดูสถานะ
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}