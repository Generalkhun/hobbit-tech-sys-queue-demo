import type { ReactNode } from "react";
import { Icon, type IconName } from "@/app/components/icons";
import { Button } from "@/app/components/ui";
import type { DemoUser, PageKey } from "@/app/types/queue";

const navigation: { id: PageKey; label: string; icon: IconName }[] = [
  { id: "overview", label: "ภาพรวมคิว", icon: "dashboard" },
  { id: "plans", label: "แผนรับเศษเหล็ก", icon: "calendar" },
  { id: "booking", label: "สร้างใบนำส่ง", icon: "document" },
  { id: "calling", label: "เรียกคิวรถ", icon: "phone" },
  { id: "registry", label: "ผู้ขับและรถขนส่ง", icon: "truck" },
];

const pageDetails: Record<PageKey, { title: string; subtitle: string }> = {
  overview: {
    title: "ภาพรวมคิวรับเศษเหล็ก",
    subtitle: "ติดตามรายการจองและสถานะรถเข้าโรงงานแบบเรียลไทม์",
  },
  plans: {
    title: "แผนการรับเศษเหล็ก",
    subtitle: "กำหนดปริมาณรับซื้อและช่วงเวลาจองแยกตามโรงงานและเกรด",
  },
  booking: {
    title: "สร้างใบนำส่ง",
    subtitle: "จองคิวส่งเศษเหล็ก พร้อมแนบใบชั่งต้นทาง",
  },
  calling: {
    title: "เรียกคิวรถ",
    subtitle: "จัดการรถที่รอเรียก ยืนยันรถถึงป้อม และบันทึกการเข้าโรงงาน",
  },
  registry: {
    title: "ผู้ขับและรถขนส่ง",
    subtitle: "จัดการทะเบียนคนขับและรถภายใต้บริษัทขนส่ง",
  },
};

export function AppShell({
  user,
  page,
  onNavigate,
  onLogout,
  onCreateBooking,
  children,
}: {
  user: DemoUser;
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  onCreateBooking: () => void;
  children: ReactNode;
}) {
  const activePage = pageDetails[page];

  return (
    <div className="min-h-screen bg-[#f4f8fa] lg:flex">
      <aside className="flex flex-col bg-sys-900 text-white lg:fixed lg:inset-y-0 lg:w-[254px]">
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-[66px] items-center justify-center rounded-xl bg-white/10 text-[22px] font-black italic tracking-[-3px] ring-1 ring-white/10">
              SYS
            </div>
            <div>
              <p className="text-sm font-bold tracking-wide">QUEUE</p>
              <p className="mt-0.5 text-[10px] text-white/45">MANAGEMENT</p>
            </div>
          </div>
          <span className="hidden text-white/60 lg:block">···</span>
        </div>

        <div className="mx-4 mt-5 flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-xs text-white/70 ring-1 ring-white/10">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>ระบบรับคิวเปิดให้บริการ</span>
        </div>

        <nav className="scrollbar-thin flex gap-1 overflow-x-auto px-3 py-5 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35 lg:block">
            Workspace
          </p>
          {navigation.map((item) => {
            const active = page === item.id;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm transition lg:w-full ${
                  active
                    ? "bg-white text-sys-800 shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={18} />
                <span className="font-medium">{item.label}</span>
                {item.id === "calling" && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-sys-50 text-sys-700"
                        : "bg-white/10 text-white/80"
                    }`}
                  >
                    5
                  </span>
                )}
              </button>
            );
          })}

          <div className="hidden lg:block">
            <p className="px-3 pb-2 pt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
              System
            </p>
            <button
              type="button"
              onClick={() => onNavigate("registry")}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <Icon name="chart" size={18} />
              <span className="font-medium">รายงานและประวัติ</span>
            </button>
          </div>
        </nav>

        <div className="hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sys-500 text-xs font-bold">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="mt-1 truncate text-[10px] text-white/50">
                {user.organization}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="ออกจากระบบ"
              className="text-white/55 transition hover:text-white"
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 lg:ml-[254px]">
        <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-7 xl:px-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>SYS Queue</span>
                <Icon name="chevron" size={13} />
                <span className="truncate text-slate-600">{activePage.title}</span>
              </div>
              <h1 className="mt-1 truncate text-lg font-bold tracking-tight text-sys-900 sm:text-xl">
                {activePage.title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <span className="hidden text-xs text-slate-500 md:block">
                อังคาร 27 ต.ค. 2569
              </span>
              <button
                type="button"
                aria-label="การแจ้งเตือน"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50"
              >
                <Icon name="bell" size={18} />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500" />
              </button>
              <Button
                onClick={onCreateBooking}
                className="hidden sm:inline-flex"
              >
                <Icon name="plus" size={17} />
                สร้างใบนำส่ง
              </Button>
              <div className="grid h-9 w-9 place-items-center rounded-full bg-sys-100 text-xs font-bold text-sys-700 sm:hidden">
                {user.initials}
              </div>
            </div>
          </div>
          <div className="px-4 pb-3 text-xs text-slate-500 sm:hidden">
            {activePage.subtitle}
          </div>
        </header>

        <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-7 xl:px-10">
          <div className="mb-6 hidden items-center justify-between sm:flex">
            <p className="text-sm text-slate-500">{activePage.subtitle}</p>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ข้อมูลอัปเดตล่าสุด
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
