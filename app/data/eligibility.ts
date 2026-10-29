import type {
  BlacklistRecord,
  PolicyAcknowledgement,
} from "@/app/types/queue";

export function getBlacklistReason(
  driverId: string,
  plate: string,
  blacklist: BlacklistRecord[],
) {
  const matchingEntries = blacklist.filter(
    (entry) =>
      (entry.targetType === "driver" && entry.targetId === driverId) ||
      (entry.targetType === "vehicle" && entry.targetId === plate),
  );
  return matchingEntries.map((entry) => entry.reason);
}

export function hasCurrentPolicyAcknowledgement(
  shopName: string,
  policyVersion: string,
  acknowledgements: PolicyAcknowledgement[],
) {
  const current = acknowledgements.filter(
    (entry) =>
      entry.shopName === shopName && entry.policyVersion === policyVersion,
  );
  return (
    current.some((entry) => entry.documentType === "privacy-notice") &&
    current.some((entry) => entry.documentType === "personal-data-use")
  );
}
