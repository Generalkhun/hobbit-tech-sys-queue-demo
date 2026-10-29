"use client";

import { useState } from "react";
import {
  generateVerificationCode,
  verifyDriverCode,
} from "@/app/data/driver-verification";
import type { DriverCheckinProgress } from "@/app/types/queue";

const initialProgress: DriverCheckinProgress = {
  bookingId: null,
  step: "landing",
};

export function useDriverCheckin() {
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<DriverCheckinProgress>(initialProgress);
  const [contactPhones, setContactPhones] = useState<string[]>([]);

  function generateCode(bookingId: string): string | null {
    const result = generateVerificationCode();
    if ("error" in result) return result.error;
    setCodes((current) => ({ ...current, [bookingId]: result.code }));
    return null;
  }

  function verifyCode(bookingId: string, submittedCode: string): string | null {
    const error = verifyDriverCode(codes[bookingId], submittedCode);
    if (error) return error;
    setCodes((current) =>
      Object.fromEntries(Object.entries(current).filter(([id]) => id !== bookingId)),
    );
    return null;
  }

  function reset(initialPhone?: string) {
    setProgress(initialProgress);
    setContactPhones(initialPhone ? [initialPhone] : []);
  }

  return {
    codes,
    progress,
    contactPhones,
    setProgress,
    setContactPhones,
    generateCode,
    verifyCode,
    reset,
  };
}
