import type { ReactNode } from "react";
import { getAllowedPages } from "@/app/data/access";
import { Icon } from "@/app/components/icons";
import { navigationGroups, pageDetails } from "@/app/data/navigation";
import { getUnreadAcknowledgements } from "@/app/data/policy-documents";
import type { DemoUser, PageKey } from "@/app/types/queue";

export function AppShell({
  user,
  page,
  onNavigate,
  onLogout,
  children,
  unreadAckCount = 0,
}: {
  user: DemoUser;
  page: PageKey;
  onNavigate: (page: PageKey) => void;
  onLogout: () => void;
  children: ReactNode;
  unreadAckCount?: number;
}) {
  const activePage = pageDetails[page];
  const allowedPages = getAllowedPages(user.role);

  return (
    <div className="min-h-screen bg-[#f4f8fa] lg:flex">
      <aside className="flex flex-col bg-sys-700 text-white lg:fixed lg:inset-y-0 lg:w-[254px]">
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-[66px] items-center justify-center rounded-lg bg-white/15 text-[22px] font-black italic tracking-[-3px] ring-1 ring-white/15">
              SYS
            </div>
            <div className="text-sm font-bold tracking-wide">SYS</div>
          </div>
          <span className="text-lg tracking-widest text-white/75">···</span>
        </div>

        <nav className="scrollbar-thin flex gap-1 overflow-x-auto px-2.5 py-4 lg:flex-1 lg:flex-col lg:overflow-y-auto">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) =>
              allowedPages.includes(item.id),
            );
            if (visibleItems.length === 0) return null;

            return (
              <section key={group.label} className="mb-3">
                <h2 className="hidden px-3 pb-2 pt-1 text-[10px] font-semibold text-white/65 lg:block">
                  {group.label}
                </h2>
                <div className="flex gap-1 lg:flex-col">
                  {visibleItems.map((item) => {
                    const active = page === item.id;
                    const showBadge = item.id === "acknowledgements" && unreadAckCount > 0;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        aria-current={active ? "page" : undefined}
                        onClick={() => onNavigate(item.id)}
                        className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition lg:w-full ${
                          active
                            ? "bg-white font-semibold text-sys-700 shadow-sm"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon name={item.icon} size={17} />
                        <span className="font-medium">{item.label}</span>
                        {showBadge && (
                          <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                            {unreadAckCount > 99 ? "99+" : unreadAckCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {allowedPages.includes("settings") && (
            <button
              type="button"
              onClick={() => onNavigate("settings")}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition lg:w-full ${
                page === "settings"
                  ? "bg-white font-semibold text-sys-700 shadow-sm"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon name="settings" size={17} />
              <span className="font-medium">ตั้งค่า</span>
            </button>
          )}
        </nav>

        <div className="hidden border-t border-white/10 p-3 lg:block">
          <div className="flex items-center gap-2.5 rounded-xl bg-white/10 p-2.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold">
              {user.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{user.name}</p>
              <p className="mt-1 truncate text-[10px] text-white/70">
                {user.organization}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              aria-label="ออกจากระบบ"
              className="text-white/70 transition hover:text-white"
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
                <span>SYS</span>
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
