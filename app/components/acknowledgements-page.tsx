"use client";

import { useState } from "react";
import { Icon } from "@/app/components/icons";
import { Button, Panel } from "@/app/components/ui";
import { SectionHeader } from "@/app/components/shared/section-header";
import {
  acknowledgeDocument,
  getActivePolicyDocuments,
  getPendingAcknowledgements,
  getUnreadAcknowledgements,
  markDocumentRead,
} from "@/app/data/policy-documents";
import type { PolicyDocument } from "@/app/types/queue";

export function AcknowledgementsPage({
  targetType,
  targetId,
  targetName,
  userId,
  isAdmin,
}: {
  targetType: "shop" | "seller";
  targetId: string;
  targetName: string;
  userId: string;
  isAdmin: boolean;
}) {
  const [selectedDoc, setSelectedDoc] = useState<PolicyDocument | null>(null);
  const [showContent, setShowContent] = useState(false);

  const allDocs = getActivePolicyDocuments();
  const pendingDocs = getPendingAcknowledgements(targetType, targetId);
  const unreadDocs = getUnreadAcknowledgements(targetType, targetId);

  function handleRead(doc: PolicyDocument) {
    markDocumentRead(targetType, targetId, targetName, doc.id);
    setSelectedDoc(doc);
    setShowContent(true);
  }

  function handleAcknowledge(doc: PolicyDocument) {
    acknowledgeDocument(targetType, targetId, targetName, doc.id, userId);
    setShowContent(false);
    setSelectedDoc(null);
  }

  if (selectedDoc && showContent) {
    return (
      <div className="space-y-5">
        <Panel className="p-5 sm:p-6">
          <h2 className="text-lg font-bold text-sys-900">{selectedDoc.title}</h2>
          <p className="mt-1 text-xs text-slate-400">
            เวอร์ชัน {selectedDoc.version} · {selectedDoc.documentType}
          </p>
          <div className="mt-5 rounded-xl bg-slate-50 p-5">
            <h3 className="font-bold text-sys-900">เนื้อหาเอกสาร</h3>
            <p className="mt-3 text-sm text-slate-600">{selectedDoc.description}</p>
            {selectedDoc.fileUrl ? (
              <div className="mt-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <Icon name="file" size={14} />
                    {selectedDoc.fileName ?? "เอกสารแนบ.pdf"}
                  </span>
                  <a
                    href={selectedDoc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-sys-700 hover:text-sys-900"
                  >
                    เปิดในแท็บใหม่
                  </a>
                </div>
                <object
                  data={selectedDoc.fileUrl}
                  type="application/pdf"
                  className="h-[520px] w-full rounded-xl border border-slate-200 bg-white"
                  aria-label={`ไฟล์เอกสาร ${selectedDoc.title}`}
                >
                  <p className="p-4 text-xs text-slate-500">
                    เบราว์เซอร์ไม่รองรับการแสดง PDF —{" "}
                    <a
                      href={selectedDoc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-sys-700 underline"
                    >
                      กดเปิดไฟล์เอกสาร
                    </a>
                  </p>
                </object>
              </div>
            ) : (
              <div className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-400">
                <p>เอกสารนี้ยังไม่มีไฟล์แนบ</p>
              </div>
            )}
          </div>
          <div className="mt-5 flex gap-3">
            <Button onClick={() => handleAcknowledge(selectedDoc)}>
              ยืนยันรับทราบ
            </Button>
            <Button variant="secondary" onClick={() => { setShowContent(false); setSelectedDoc(null); }}>
              กลับ
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!isAdmin && pendingDocs.length > 0 && (
        <Panel className="border-l-4 border-l-rose-400 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Icon name="bell" size={20} className="text-rose-500" />
            <div>
              <h3 className="font-bold text-rose-700">
                มีเอกสารที่ต้องรับทราบ {pendingDocs.length} ฉบับ
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                กรุณาอ่านและยืนยันรับทราบเอกสารด้านล่าง
              </p>
            </div>
          </div>
        </Panel>
      )}

      <Panel className="overflow-hidden">
        <SectionHeader
          icon="file"
          title="เอกสารรับทราบ"
          description="เอกสารที่ต้องอ่านและยืนยันรับทราบ"
        />
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
              <tr>
                <th className="px-6 py-3.5">ชื่อเอกสาร</th>
                <th className="px-4 py-3.5">ประเภท</th>
                <th className="px-4 py-3.5">เวอร์ชัน</th>
                <th className="px-4 py-3.5">สถานะ</th>
                <th className="px-6 py-3.5 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allDocs.map((doc) => {
                const isPending = pendingDocs.some((d) => d.id === doc.id);
                const isUnread = unreadDocs.some((d) => d.id === doc.id);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        {doc.title}
                        {isPending && (
                          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            ใหม่
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{doc.documentType}</td>
                    <td className="px-4 py-4 text-slate-500">v{doc.version}</td>
                    <td className="px-4 py-4">
                      {isPending ? (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold text-rose-700">
                          ยังไม่ยืนยัน
                        </span>
                      ) : isUnread ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">
                          อ่านแล้ว
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                          ยืนยันแล้ว
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="quiet"
                        onClick={() => handleRead(doc)}
                      >
                        อ่านเอกสาร
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}