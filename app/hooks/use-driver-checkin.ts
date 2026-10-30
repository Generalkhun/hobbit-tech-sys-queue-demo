"use client";

import { useState } from "react";
import {
  generateDriverLinkToken,
  isValidDriverLinkToken,
} from "@/app/data/driver-verification";
import type { DriverCheckinProgress } from "@/app/types/queue";

const initialProgress: DriverCheckinProgress = {
  bookingId: null,
  step: "landing",
};

/** เก็บ token ของลิงก์ใน localStorage เพื่อให้เปิดลิงก์ข้าม tab/browser เดียวกันได้ (demo) */
function storageKey(bookingId: string) {
  return `sys-driver-link-${bookingId}`;
}

export function useDriverCheckin() {
  const [links, setLinks] = useState<Record<string, string>>(() => {
    // เริ่มจาก token ที่เคยสร้างไว้
    const restored: Record<string, string> = {};
    try {
      if (typeof window !== "undefined") {
        for (let index = 0; index < window.localStorage.length; index += 1) {
          const key = window.localStorage.key(index);
          if (key && key.startsWith("sys-driver-link-")) {
            const bookingId = key.slice("sys-driver-link-".length);
            const token = window.localStorage.getItem(key);
            if (token) restored[bookingId] = token;
          }
        }
      }
    } catch {
      // localStorage อาจไม่พร้อมใช้งานในบางโหมด demo
    }
    return restored;
  });
  const [progress, setProgress] = useState<DriverCheckinProgress>(initialProgress);
  const [contactPhones, setContactPhones] = useState<string[]>([]);

  /** สร้าง link เช็คอินเฉพาะของงานนี้ 1 ครั้ง (unique ต่อ bookingId) */
  function generateLink(bookingId: string, baseUrl = ""): string | null {
    const token = generateDriverLinkToken();
    if (token === null) return null;
    setLinks((current) => {
      const next = { ...current, [bookingId]: token };
      try {
        window.localStorage.setItem(storageKey(bookingId), token);
      } catch {
        // ไม่มี localStorage — เก็บเฉพาะในหน่วยความจำ
      }
      return next;
    });
    return `${baseUrl}#driver-${bookingId}-${token}`;
  }

  function isValidLink(bookingId: string, token: string): boolean {
    return isValidDriverLinkToken(links[bookingId], token);
  }

  function reset(initialPhone?: string) {
    setProgress(initialProgress);
    setContactPhones(initialPhone ? [initialPhone] : []);
  }

  return {
    links,
    progress,
    contactPhones,
    setProgress,
    setContactPhones,
    generateLink,
    isValidLink,
    reset,
  };
}
