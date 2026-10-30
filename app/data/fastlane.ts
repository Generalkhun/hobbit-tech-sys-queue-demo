import type { FastlaneRule, RPStatus } from "@/app/types/queue";

export const defaultFastlaneRule: FastlaneRule = {
  id: "FL-RULE-001",
  consecutiveOnTimeThreshold: 5,
  noShowLimit: 2,
  lateTolerance: 3,
  updatedAt: new Date().toISOString(),
  updatedBy: "ระบบ",
};

let currentRule = defaultFastlaneRule;

export function getFastlaneRule(): FastlaneRule {
  return { ...currentRule };
}

export function updateFastlaneRule(
  updates: Partial<FastlaneRule>,
  by: string,
): FastlaneRule {
  currentRule = {
    ...currentRule,
    ...updates,
    id: currentRule.id,
    updatedAt: new Date().toISOString(),
    updatedBy: by,
  };
  return { ...currentRule };
}

/** จำลองการคำนวณ RP status จากประวัติ */
export function computeRPStatus(
  consecutiveOnTime: number,
  noShowCount: number,
  lateCount: number,
): RPStatus {
  const rule = getFastlaneRule();
  if (consecutiveOnTime >= rule.consecutiveOnTimeThreshold) return "fastlane";
  if (noShowCount >= rule.noShowLimit) return "limited";
  if (lateCount > rule.lateTolerance) return "limited";
  return "normal";
}