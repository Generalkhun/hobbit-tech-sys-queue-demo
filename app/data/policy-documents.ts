import type { DocumentAcknowledgement, PolicyDocument } from "@/app/types/queue";

const documents: PolicyDocument[] = [
  {
    id: "PD-001",
    title: "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)",
    description: "ประกาศเกี่ยวกับการเก็บรวบรวม和使用ข้อมูลส่วนบุคคลตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562",
    documentType: "privacy-notice",
    version: "1.0",
    targetAudience: "all",
    createdAt: "2026-10-01T09:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-01T09:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
  {
    id: "PD-002",
    title: "นโยบายการใช้ข้อมูลส่วนบุคคลและวัตถุประสงค์",
    description: "รายละเอียดเกี่ยวกับวัตถุประสงค์ ระยะเวลา และสิทธิของเจ้าของข้อมูลส่วนบุคคล",
    documentType: "personal-data-use",
    version: "1.0",
    targetAudience: "all",
    createdAt: "2026-10-01T09:00:00+07:00",
    createdBy: "ระบบ",
    updatedAt: "2026-10-01T09:00:00+07:00",
    updatedBy: "ระบบ",
    active: true,
  },
];

const acknowledgements: DocumentAcknowledgement[] = [
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
    readAt: "2026-10-20T09:00:00+07:00",
    acknowledgedAt: "2026-10-20T09:00:00+07:00",
    acknowledgedBy: "SH-002",
  },
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
    status: "acknowledged",
    readAt: "2026-10-21T11:30:00+07:00",
    acknowledgedAt: "2026-10-21T11:30:00+07:00",
    acknowledgedBy: "SH-003",
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

export function getAcknowledgementStats(documentId: string): {
  total: number;
  unread: number;
  read: number;
  acknowledged: number;
} {
  const related = acknowledgements.filter((a) => a.documentId === documentId);
  return {
    total: related.length,
    unread: related.filter((a) => a.status === "unread").length,
    read: related.filter((a) => a.status === "read").length,
    acknowledged: related.filter((a) => a.status === "acknowledged").length,
  };
}

export function getTargetsByDocumentStatus(documentId: string): {
  targetType: "shop" | "seller";
  targetId: string;
  targetName: string;
  status: "unread" | "read" | "acknowledged";
}[] {
  return acknowledgements
    .filter((a) => a.documentId === documentId)
    .map((a) => ({
      targetType: a.targetType,
      targetId: a.targetId,
      targetName: a.targetName,
      status: a.status,
    }));
}