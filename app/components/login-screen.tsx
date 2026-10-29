"use client";

import Image from "next/image";
import { useState } from "react";
import { demoUsers } from "@/app/data/mock-data";
import type { DemoUser, UserRole } from "@/app/types/queue";
import { Icon } from "@/app/components/icons";
import { Button } from "@/app/components/ui";

const roleDetails: Record<
  UserRole,
  {
    title: string;
    description: string;
  }
> = {
  admin: {
    title: "เจ้าหน้าที่จัดหาเศษเหล็ก · จศ.",
    description: "ดูยอดจองและจัดการระบบได้ทุกส่วน",
  },
  operations: {
    title: "ทีมปฏิบัติการเศษเหล็ก · ปศ.",
    description: "กำหนดความจุราย slot และโยกรถสลับโรงงาน",
  },
  broker: {
    title: "ผู้ขายเศษเหล็ก · นายหน้า",
    description: "จองคิวและทำรายการแทนร้านค้าได้",
  },
  retailer: {
    title: "ร้านค้าของเก่า",
    description: "จองรถส่งเหล็กของร้านและติดตามคิว",
  },
  security: {
    title: "เจ้าหน้าที่รักษาความปลอดภัย",
    description: "ประจำสถานีแรก ตรวจใบนำส่งและบันทึกรถผ่านป้อม",
  },
};

export function LoginScreen({ onLogin }: { onLogin: (user: DemoUser) => void }) {
  const [selectedId, setSelectedId] = useState(demoUsers[0].id);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(false);
  const selectedUser =
    demoUsers.find((user) => user.id === selectedId) ?? demoUsers[0];

  return (
    <main className="min-h-screen bg-[#eef5f7] p-0 sm:p-5 lg:p-8">
      <div className="mx-auto grid min-h-screen max-w-[1240px] overflow-hidden bg-white shadow-[0_20px_70px_rgba(27,81,97,0.12)] sm:min-h-[min(820px,calc(100vh-2.5rem))] sm:rounded-[24px] lg:min-h-[min(820px,calc(100vh-4rem))] lg:grid-cols-2">
        <section className="login-scene relative flex min-h-[360px] flex-col overflow-hidden px-6 py-7 text-white sm:min-h-[400px] sm:px-10 sm:py-9 lg:min-h-[700px] lg:px-12 lg:py-10">
          <div className="relative z-10 flex justify-center lg:justify-start">
            <Image
              src="/sys-logo.png"
              alt="SYS"
              width={177}
              height={74}
              priority
              className="h-[55px] w-auto object-contain sm:h-[65px]"
            />
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-4">
            <Image
              src="/sys-02.png"
              alt="รถและเครื่องจักรสำหรับจัดการเศษเหล็กของ SYS"
              width={535}
              height={380}
              priority
              className="h-auto w-[min(82%,390px)] drop-shadow-[0_18px_28px_rgba(12,75,97,0.16)] sm:w-[min(78%,440px)]"
            />
            <h2 className="mt-1 text-center text-xl font-semibold tracking-tight sm:text-2xl">
              Manage your orders
            </h2>
            <p className="mt-2 max-w-sm text-center text-sm leading-6 text-white/85">
              จัดการคิวส่งเศษเหล็กและติดตามการเข้าโรงงาน
              <br className="hidden sm:block" />
              ตั้งแต่จองคิวจนถึงสถานี รปภ.
            </p>
            <div className="mt-4 flex items-center gap-2" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-white/55" />
              <span className="h-3 w-3 rounded-full bg-white ring-4 ring-white/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-white/55" />
            </div>
          </div>

          <footer className="relative z-10 border-t border-white/35 pt-4 text-center text-xs leading-5 text-white/85 lg:pt-5">
            <p className="text-sm font-semibold">ระบบการจัดส่งเศษเหล็ก SYS</p>
            <p>ระบบสาธิตสำหรับการบริหารคิวและการเข้าโรงงาน</p>
            <p>บริษัท SYS · ประเทศไทย</p>
          </footer>
        </section>

        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 sm:py-12 lg:px-[clamp(48px,7vw,92px)]">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-8">
              <h1 className="text-[30px] font-semibold tracking-tight text-[#252f35] sm:text-[34px]">
                เข้าสู่ระบบ
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                เลือกบัญชีผู้ใช้และรหัสผ่านเพื่อเข้าใช้งานระบบ
              </p>
            </div>

            <div className="space-y-5">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                อีเมลหรือชื่อผู้ใช้
                <select
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#299bb3] focus:ring-2 focus:ring-[#299bb3]/15"
                  value={selectedId}
                  onChange={(event) => setSelectedId(event.target.value)}
                  aria-label="เลือกบัญชีผู้ใช้สำหรับทดลอง"
                >
                  {demoUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.id}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-normal text-slate-500">
                  {selectedUser.name} · {roleDetails[selectedUser.role].title}
                </span>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                รหัสผ่าน
                <span className="flex h-11 overflow-hidden rounded-md border border-slate-300 transition focus-within:border-[#299bb3] focus-within:ring-2 focus-within:ring-[#299bb3]/15">
                  <input
                    className="min-w-0 flex-1 bg-white px-3 text-sm tracking-[0.2em] text-slate-700 outline-none"
                    type={showPassword ? "text" : "password"}
                    value="sys-demo-2026"
                    readOnly
                    aria-label="รหัสผ่านบัญชีตัวอย่าง"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="grid w-11 shrink-0 place-items-center border-l border-slate-200 text-[#299bb3] transition hover:bg-sys-50"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M3 3l18 18M10.6 10.7a2 2 0 002.7 2.7" />
                        <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.1 0 8.5 4.2 9.5 6.2a1.7 1.7 0 010 1.6 13 13 0 01-3 3.6M6.2 6.3a13.7 13.7 0 00-3.7 4.9 1.7 1.7 0 000 1.6C3.5 14.8 6.9 19 12 19c1.2 0 2.3-.2 3.3-.7" />
                      </svg>
                    ) : (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M2.5 12s3.4-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.4 6.5-9.5 6.5S2.5 12 2.5 12Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </svg>
                    )}
                  </button>
                </span>
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-600">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={rememberAccount}
                  onChange={(event) => setRememberAccount(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-[#299bb3]"
                />
                จำบัญชีนี้ไว้
              </label>
              <span className="text-[#299bb3]">บัญชีสำหรับทดลองใช้</span>
            </div>

            <Button
              className="mt-6 h-11 w-full justify-center rounded-md bg-[#299bb3] px-5 text-sm font-semibold hover:bg-[#21869d] sm:w-auto sm:min-w-[132px] sm:justify-between"
              onClick={() => onLogin(selectedUser)}
            >
              <span>เข้าสู่ระบบ</span>
              <Icon name="arrow" size={17} />
            </Button>

            <div className="mt-7 border-t border-slate-200 pt-5 text-xs leading-6 text-[#299bb3]">
              เลือกบัญชีด้านบนเพื่อทดลองตามบทบาทผู้ใช้งาน
              <br />
              {roleDetails[selectedUser.role].description}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
