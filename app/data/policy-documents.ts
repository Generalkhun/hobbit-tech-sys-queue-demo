import { mockSellerShops, mockSellers } from "@/app/data/mocks/sellers";
import type { DocumentAcknowledgement, PolicyDocument } from "@/app/types/queue";

const documents: PolicyDocument[] = [
  {
    id: "PD-001",
    title: "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)",
    description:
      "ประกาศเกี่ยวกับการเก็บรวบรวมและใช้ข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
    documentType: "privacy-notice",
    version: "1.0",
    targetAudience: "all",
    fileUrl: "/policy-sample.pdf",
    fileName: "PDPA-นโยบายคุ้มครองข้อมูลส่วนบุคคล.pdf",
    createdAt: "2026-10-01T09:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-01T09:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
  {
    id: "PD-002",
    title: "นโยบายการใช้ข้อมูลส่วนบุคคลและวัตถุประสงค์",
    description:
      "รายละเอียดเกี่ยวกับวัตถุประสงค์ ระยะเวลา และสิทธิของเจ้าของข้อมูลส่วนบุคคล",
    documentType: "personal-data-use",
    version: "1.0",
    targetAudience: "all",
    fileUrl: "/policy-sample.pdf",
    fileName: "นโยบายการใช้ข้อมูลส่วนบุคคล.pdf",
    createdAt: "2026-10-01T09:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-01T09:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
  {
    id: "PD-003",
    title: "ข้อตกลงการใช้งานระบบจองคิว SYS",
    description:
      "เงื่อนไขการใช้งานระบบจองคิว การยกเลิก และบทลงโทษกรณีไม่มาตามนัด",
    documentType: "terms",
    version: "1.0",
    targetAudience: "all",
    fileUrl: "/policy-sample.pdf",
    fileName: "ข้อตกลงการใช้งานระบบ.pdf",
    createdAt: "2026-10-05T10:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-05T10:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
  {
    id: "PD-004",
    title: "คู่มือความปลอดภัยในการขนส่งเศษเหล็ก",
    description:
      "ข้อปฏิบัติด้านความปลอดภัยสำหรับผู้ขายและร้านค้าย่อยในการขนส่งเศษเหล็กเข้าโรงงาน",
    documentType: "policy",
    version: "1.0",
    targetAudience: "seller",
    fileUrl: "/policy-sample.pdf",
    fileName: "คู่มือความปลอดภัย.pdf",
    createdAt: "2026-10-10T14:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-10T14:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
];

const acknowledgements: DocumentAcknowledgement[] = [
  // ร้านเจริญทรัพย์ (SH-002) — ยืนยันครบทุกฉบับ
  {
    id: "DA-SH-002-PD-001",
    documentId: "PD-001",
    targetType: "shop",
    targetId: "SH-002",
    targetName: "ร้านเจริญทรัพย์",
    status: "acknowledged",
    readAt: "2026-10-20T09:00:00+07:00",
    acknowledgedAt: "2026-10-20T09:00:00+07:00",
    acknowledgedBy: "SH-002",
  },
  {
    id: "DA-SH-002-PD-002",
    documentId: "PD-002",
    targetType: "shop",
    targetId: "SH-002",
    targetName: "ร้านเจริญทรัพย์",
    status: "acknowledged",
    readAt: "2026-10-20T09:05:00+07:00",
    acknowledgedAt: "2026-10-20T09:05:00+07:00",
    acknowledgedBy: "SH-002",
  },
  {
    id: "DA-SH-002-PD-003",
    documentId: "PD-003",
    targetType: "shop",
    targetId: "SH-002",
    targetName: "ร้านเจริญทรัพย์",
    status: "acknowledged",
    readAt: "2026-10-20T09:10:00+07:00",
    acknowledgedAt: "2026-10-20T09:10:00+07:00",
    acknowledgedBy: "SH-002",
  },
  // ร้านทองดี รีไซเคิล (SH-003) — อ่านแล้วบางฉบับ ยังไม่ยืนยัน
  {
    id: "DA-SH-003-PD-001",
    documentId: "PD-001",
    targetType: "shop",
    targetId: "SH-003",
    targetName: "ร้านทองดี รีไซเคิล",
    status: "acknowledged",
    readAt: "2026-10-21T11:30:00+07:00",
    acknowledgedAt: "2026-10-21T11:30:00+07:00",
    acknowledgedBy: "SH-003",
  },
  {
    id: "DA-SH-003-PD-002",
    documentId: "PD-002",
    targetType: "shop",
    targetId: "SH-003",
    targetName: "ร้านทองดี รีไซเคิล",
    status: "read",
    readAt: "2026-10-21T11:35:00+07:00",
  },
  // ร้านสมชายค้าเหล็ก (SH-001) — ยังไม่อ่านเลย
  {
    id: "DA-SH-001-PD-001",
    documentId: "PD-001",
    targetType: "shop",
    targetId: "SH-001",
    targetName: "ร้านสมชายค้าเหล็ก",
    status: "unread",
  },
  // ผู้ขาย บริษัท เอส.เอส. เมทัล (SL-001) — ยืนยันครบ
  {
    id: "DA-SL-001-PD-001",
    documentId: "PD-001",
    targetType: "seller",
    targetId: "SL-001",
    targetName: "บริษัท เอส.เอส. เมทัล",
    status: "acknowledged",
    readAt: "2026-10-18T08:30:00+07:00",
    acknowledgedAt: "2026-10-18T08:30:00+07:00",
    acknowledgedBy: "SL-001",
  },
  {
    id: "DA-SL-001-PD-002",
    documentId: "PD-002",
    targetType: "seller",
    targetId: "SL-001",
    targetName: "บริษัท เอส.เอส. เมทัล",
    status: "acknowledged",
    readAt: "2026-10-18T08:35:00+07:00",
    acknowledgedAt: "2026-10-18T08:35:00+07:00",
    acknowledgedBy: "SL-001",
  },
  {
    id: "DA-SL-001-PD-004",
    documentId: "PD-004",
    targetType: "seller",
    targetId: "SL-001",
    targetName: "บริษัท เอส.เอส. เมทัล",
    status: "read",
    readAt: "2026-10-18T08:40:00+07:00",
  },
  // ผู้ขาย หจก. รุ่งกิจรีไซเคิล (SL-002) — ยังไม่อ่าน
  {
    id: "DA-SL-002-PD-001",
    documentId: "PD-001",
    targetType: "seller",
    targetId: "SL-002",
    targetName: "หจก. รุ่งกิจรีไซเคิล",
    status: "unread",
  },
];

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function subscribeToPolicyDocuments(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPolicyDocuments(): PolicyDocument[] {
  return [...documents];
}

export function getActivePolicyDocuments(): PolicyDocument[] {
  return documents.filter((doc) => doc.active);
}

export function getDocumentAcknowledgements(): DocumentAcknowledgement[] {
  return [...acknowledgements];
}

export function getAcknowledgementsByTarget(
  targetType: "shop" | "seller",
  targetId: string,
): DocumentAcknowledgement[] {
  return acknowledgements.filter(
    (a) => a.targetType === targetType && a.targetId === targetId,
  );
}

export function getPendingAcknowledgements(
  targetType: "shop" | "seller",
  targetId: string,
): PolicyDocument[] {
  const activeDocs = getActivePolicyDocuments();
  const ackDocIds = acknowledgements
    .filter(
      (a) =>
        a.targetType === targetType &&
        a.targetId === targetId &&
        a.status === "acknowledged",
    )
    .map((a) => a.documentId);
  return activeDocs.filter((doc) => !ackDocIds.includes(doc.id));
}

export function getUnreadAcknowledgements(
  targetType: "shop" | "seller",
  targetId: string,
): PolicyDocument[] {
  const activeDocs = getActivePolicyDocuments();
  const ackDocIds = acknowledgements
    .filter(
      (a) =>
        a.targetType === targetType &&
        a.targetId === targetId &&
        (a.status === "read" || a.status === "acknowledged"),
    )
    .map((a) => a.documentId);
  return activeDocs.filter((doc) => !ackDocIds.includes(doc.id));
}

function findAcknowledgementIndex(
  targetType: "shop" | "seller",
  targetId: string,
  documentId: string,
): number {
  for (let i = 0; i < acknowledgements.length; i++) {
    const a = acknowledgements[i];
    if (a.targetType === targetType && a.targetId === targetId && a.documentId === documentId) {
      return i;
    }
  }
  return -1;
}

export function markDocumentRead(
  targetType: "shop" | "seller",
  targetId: string,
  targetName: string,
  documentId: string,
) {
  const existing = findAcknowledgementIndex(targetType, targetId, documentId);
  if (existing >= 0) {
    acknowledgements[existing] = {
      ...acknowledgements[existing],
      status: "read",
      readAt: new Date().toISOString(),
    };
  } else {
    acknowledgements.push({
      id: `DA-${Date.now().toString(36)}`,
      documentId,
      targetType,
      targetId,
      targetName,
      status: "read",
      readAt: new Date().toISOString(),
    });
  }
  notify();
}

export function acknowledgeDocument(
  targetType: "shop" | "seller",
  targetId: string,
  targetName: string,
  documentId: string,
  acknowledgedBy: string,
) {
  const existing = findAcknowledgementIndex(targetType, targetId, documentId);
  const now = new Date().toISOString();
  if (existing >= 0) {
    acknowledgements[existing] = {
      ...acknowledgements[existing],
      status: "acknowledged",
      readAt: acknowledgements[existing].readAt || now,
      acknowledgedAt: now,
      acknowledgedBy,
    };
  } else {
    acknowledgements.push({
      id: `DA-${Date.now().toString(36)}`,
      documentId,
      targetType,
      targetId,
      targetName,
      status: "acknowledged",
      readAt: now,
      acknowledgedAt: now,
      acknowledgedBy,
    });
  }
  notify();
}

export function addPolicyDocument(
  doc: Omit<PolicyDocument, "id" | "createdAt" | "updatedAt">,
): PolicyDocument {
  const now = new Date().toISOString();
  const newDoc: PolicyDocument = {
    ...doc,
    id: `PD-${String(documents.length + 1).padStart(3, "0")}`,
    createdAt: now,
    updatedAt: now,
  };
  documents.push(newDoc);
  notify();
  return newDoc;
}

/** สรุปสถานะการรับทราบของเอกสาร — นับจากผู้รับทั้งหมดตามกลุ่มเป้าหมาย */
export function getAcknowledgementStats(documentId: string): {
  total: number;
  unread: number;
  read: number;
  acknowledged: number;
} {
  const targets = getTargetsByDocumentStatus(documentId);
  return {
    total: targets.length,
    unread: targets.filter((t) => t.status === "unread").length,
    read: targets.filter((t) => t.status === "read").length,
    acknowledged: targets.filter((t) => t.status === "acknowledged").length,
  };
}

/**
 * รายชื่อผู้รับทั้งหมด (ร้านค้าย่อย + ผู้ขาย) พร้อมสถานะการรับทราบของเอกสารนั้น
 * ผู้ที่ยังไม่มีบันทึกจะถือว่า "ยังไม่อ่าน"
 */
export function getTargetsByDocumentStatus(documentId: string): {
  targetType: "shop" | "seller";
  targetId: string;
  targetName: string;
  status: "unread" | "read" | "acknowledged";
}[] {
  const doc = documents.find((d) => d.id === documentId);
  const audience = doc?.targetAudience ?? "all";
  const rows: {
    targetType: "shop" | "seller";
    targetId: string;
    targetName: string;
    status: "unread" | "read" | "acknowledged";
  }[] = [];

  if (audience === "all" || audience === "shop") {
    for (const shop of mockSellerShops) {
      const record = acknowledgements.find(
        (a) =>
          a.documentId === documentId &&
          a.targetType === "shop" &&
          a.targetId === shop.id,
      );
      rows.push({
        targetType: "shop",
        targetId: shop.id,
        targetName: shop.name,
        status: record?.status ?? "unread",
      });
    }
  }
  if (audience === "all" || audience === "seller") {
    for (const seller of mockSellers) {
      const record = acknowledgements.find(
        (a) =>
          a.documentId === documentId &&
          a.targetType === "seller" &&
          a.targetId === seller.id,
      );
      rows.push({
        targetType: "seller",
        targetId: seller.id,
        targetName: seller.name,
        status: record?.status ?? "unread",
      });
    }
  }
  return rows;
}