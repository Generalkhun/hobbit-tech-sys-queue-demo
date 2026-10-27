"use client";

import { useState } from "react";
import { demoUsers } from "@/app/data/mock-data";
import type { DemoUser, UserRole } from "@/app/types/queue";
import { Icon } from "@/app/components/icons";
import { Button } from "@/app/components/ui";

const roleDetails: Record<
  UserRole,
  { title: string; description: string; icon: "shield" | "users" | "warehouse" }
> = {
  admin: {
    title: "ผู้ดูแลระบบ",
    description: "จัดการแผน เรียกคิว และดูแลทุกโรงงาน",
    icon: "shield",
  },
  broker: {
    title: "ผู้ขายเศษเหล็ก · นายหน้า",
    description: "จองคิวและทำรายการแทนร้านค้าได้",
    icon: "users",
  },
  retailer: {
    title: "ร้านค้าของเก่า",
    description: "จองรถส่งเหล็กของร้านและติดตามคิว",
    icon: "warehouse",
  },
};

export function LoginScreen({ onLogin }: { onLogin: (user: DemoUser) => void }) {
  const [selectedId, setSelectedId] = useState(demoUsers[0].id);
  const selectedUser =
    demoUsers.find((user) => user.id === selectedId) ?? demoUsers[0];

  return (
    <main className="min-h-screen bg-[#f2f7f9] p-4 sm:p-8 lg:p-12">
      <div className="mx-auto grid min-h-[min(800px,calc(100vh-6rem))] max-w-[1180px] overflow-hidden rounded-[30px] bg-white shadow-[0_24px_80px_rgba(31,83,98,0.12)] lg:grid-cols-[0.88fr_1.12fr]">
        <section className="login-scene grid-pattern relative flex min-h-[330px] flex-col overflow-hidden px-8 py-8 text-white sm:px-12 lg:min-h-[690px] lg:px-14 lg:py-12">
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-[74px] items-center justify-center rounded-xl bg-white/15 text-[25px] font-black italic tracking-[-3px] ring-1 ring-white/20">
              SYS
            </div>
            <span className="text-sm font-medium tracking-wide text-white/85">
              QUEUE MANAGEMENT
            </span>
          </div>

          <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-8">
            <div className="relative mb-7 flex h-48 w-64 items-center justify-center sm:h-56 sm:w-72">
              <div className="absolute h-36 w-60 rounded-[48%] bg-white/15 blur-sm" />
              <div className="absolute bottom-8 left-9 h-14 w-24 rounded-[48%] bg-[#54745c] shadow-[55px_12px_0_3px_#496653,130px_0_0_-4px_#64795c]" />
              <div className="absolute bottom-[63px] left-[75px] h-[68px] w-[100px] rounded-t-[28px] bg-[#beeaf6] shadow-[0_0_0_4px_rgba(255,255,255,.16)]" />
              <div className="absolute bottom-[49px] left-[58px] h-[52px] w-[110px] rounded-t-[20px] rounded-br-xl bg-[#1a526c]" />
              <div className="absolute bottom-[62px] left-[70px] h-10 w-12 rounded-t-lg border-4 border-[#f4fcff] bg-[#58b8d2]" />
              <div className="absolute bottom-[62px] left-[123px] h-10 w-12 rounded-t-lg border-4 border-[#f4fcff] bg-[#58b8d2]" />
              <div className="absolute bottom-[33px] left-[78px] h-7 w-7 rounded-full border-[6px] border-[#25445a] bg-[#dcecf0]" />
              <div className="absolute bottom-[33px] left-[143px] h-7 w-7 rounded-full border-[6px] border-[#25445a] bg-[#dcecf0]" />
              <div className="absolute right-8 top-8 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                <Icon name="truck" size={29} />
              </div>
              <div className="absolute left-10 top-12 h-4 w-4 rounded-full bg-[#b7edf3]" />
              <div className="absolute bottom-4 right-16 h-3 w-3 rounded-full bg-white/60" />
            </div>
            <p className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
              ทุกเที่ยวรถ เริ่มต้นด้วยคิวที่ชัดเจน
            </p>
            <p className="mt-2 max-w-sm text-center text-sm leading-6 text-white/75">
              จองคิวส่งเศษเหล็ก · รับใบนำส่ง · สแกนเข้าโรงงาน
              <br />
              จัดการการเข้าโรงงานได้อย่างเป็นระบบ
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/20 pt-5 text-xs text-white/75">
            <span>ระบบจัดการคิวรับเศษเหล็ก SYS</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Demo environment
            </span>
          </div>
        </section>

        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-[72px]">
          <div className="mb-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-sys-600">
              Welcome to SYS
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-sys-900 sm:text-[34px]">
              เข้าสู่ระบบ
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              เลือกบัญชีผู้ใช้เพื่อทดลองการทำงานของระบบ
            </p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
            {(["admin", "broker", "retailer"] as const).map((role) => {
              const roleUser = demoUsers.find((user) => user.role === role);
              if (!roleUser) return null;
              const isSelected = selectedUser.role === role;
              return (
                <button
                  type="button"
                  key={role}
                  onClick={() => setSelectedId(roleUser.id)}
                  className={`rounded-lg px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    isSelected
                      ? "bg-white text-sys-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {roleDetails[role].title.split(" · ")[0]}
                </button>
              );
            })}
          </div>

          <div className="mb-7 rounded-2xl border border-sys-100 bg-sys-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-sys-700 shadow-sm">
                <Icon name={roleDetails[selectedUser.role].icon} size={21} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-sys-900">
                  {selectedUser.name}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {selectedUser.organization}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                พร้อมใช้งาน
              </span>
            </div>
            <p className="mt-3 border-t border-sys-100 pt-3 text-xs leading-5 text-slate-500">
              {roleDetails[selectedUser.role].description}
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              อีเมลหรือชื่อผู้ใช้
              <input
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value={selectedUser.id}
                readOnly
                aria-label="ชื่อผู้ใช้สำหรับบัญชีตัวอย่าง"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              รหัสผ่าน
              <input
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm tracking-[0.25em] text-slate-700 outline-none focus:border-sys-400 focus:ring-4 focus:ring-sys-50"
                value="sys-demo-2026"
                readOnly
                aria-label="รหัสผ่านบัญชีตัวอย่าง"
              />
            </label>
          </div>

          <Button
            className="mt-6 h-12 w-full justify-between px-5"
            onClick={() => onLogin(selectedUser)}
          >
            <span>เข้าสู่ระบบ</span>
            <Icon name="arrow" size={18} />
          </Button>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Demo นี้ใช้ข้อมูลตัวอย่าง · ไม่มีการเชื่อมต่อระบบจริง
          </p>
        </section>
      </div>
    </main>
  );
}
