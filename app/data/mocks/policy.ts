import type { PolicyAcknowledgement } from "@/app/types/queue";

export const policyVersion = "1.0";
export const mockPolicyAcknowledgements: PolicyAcknowledgement[] = [
  {
    shopName: "ร้านเจริญทรัพย์",
    documentType: "privacy-notice",
    policyVersion,
    acknowledgedAt: "2026-10-20T09:00:00+07:00",
    acknowledgedBy: "SH-002",
  },
  {
    shopName: "ร้านเจริญทรัพย์",
    documentType: "personal-data-use",
    policyVersion,
    acknowledgedAt: "2026-10-20T09:00:00+07:00",
    acknowledgedBy: "SH-002",
  },
  {
    shopName: "ร้านทองดี รีไซเคิล",
    documentType: "privacy-notice",
    policyVersion,
    acknowledgedAt: "2026-10-21T11:30:00+07:00",
    acknowledgedBy: "SH-003",
  },
  {
    shopName: "ร้านทองดี รีไซเคิล",
    documentType: "personal-data-use",
    policyVersion,
    acknowledgedAt: "2026-10-21T11:30:00+07:00",
    acknowledgedBy: "SH-003",
  },
];
