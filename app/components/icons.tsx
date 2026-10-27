import type { SVGProps } from "react";

export type IconName =
  | "dashboard"
  | "calendar"
  | "document"
  | "clipboard"
  | "phone"
  | "truck"
  | "warehouse"
  | "users"
  | "chart"
  | "settings"
  | "bell"
  | "search"
  | "plus"
  | "arrow"
  | "chevron"
  | "close"
  | "check"
  | "clock"
  | "map"
  | "weight"
  | "qr"
  | "shield"
  | "menu"
  | "logout"
  | "file"
  | "filter"
  | "scan"
  | "refresh"
  | "circle-check"
  | "user"
  | "sparkle";

const paths: Record<IconName, string> = {
  dashboard: "M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z",
  calendar: "M8 2v4m8-4v4M3 9h18M5 4h14a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z",
  document: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8",
  clipboard: "M9 5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 3h6v4H9zM9 12h6M9 16h6",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3.1a2 2 0 0 1-.6 1.8L7.2 10.4a16 16 0 0 0 6 6l1.8-1.8a2 2 0 0 1 1.8-.6l3.1.5a2 2 0 0 1 1.7 2Z",
  truck: "M3 6h12v12H3zM15 10h4l3 3v5h-7zM7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  warehouse: "m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22v-8h6v8M3 10h18",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.9m-3-12a4 4 0 0 1 0 7.8",
  chart: "M3 3v18h18M18 17V9M13 17V5M8 17v-3",
  settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2m10-10h-2M4 12H2m17.1-7.1-1.4 1.4M6.3 17.7l-1.4 1.4m14.2 0-1.4-1.4M6.3 6.3 4.9 4.9",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12a2 2 0 0 0 4 0",
  search: "m21 21-4.3-4.3M19 10.5a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0Z",
  plus: "M12 5v14m-7-7h14",
  arrow: "M5 12h14m-7-7 7 7-7 7",
  chevron: "m9 18 6-6-6-6",
  close: "M18 6 6 18M6 6l12 12",
  check: "m5 12 4 4L19 6",
  clock: "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  map: "M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  weight: "M6 7h12l2 14H4L6 7Zm3 0a3 3 0 0 1 6 0",
  qr: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM19 14h2v2h-2zM19 19h2v2h-2zM14 19h2v2h-2z",
  shield: "M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-3-11 2 2 4-4",
  menu: "M4 6h16M4 12h16M4 18h16",
  logout: "M10 17l5-5-5-5m5 5H3m9-9h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7",
  file: "M12 10v6m-3-3h6m-8 9h10a2 2 0 0 0 2-2V7l-5-5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2ZM14 2v5h5",
  filter: "M4 7h16M7 12h10m-7 5h4",
  scan: "M3 7V5a2 2 0 0 1 2-2h2m10 0h2a2 2 0 0 1 2 2v2m0 10v2a2 2 0 0 1-2 2h-2m-10 0H5a2 2 0 0 1-2-2v-2M7 12h10",
  refresh: "M20 7v5h-5M4 17v-5h5m-4-2a8 8 0 0 1 13-3l2 2M4 15l2 2a8 8 0 0 0 13-3",
  "circle-check": "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14l-3-3",
  user: "M20 21a8 8 0 0 0-16 0m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  sparkle: "m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z",
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name]} />
    </svg>
  );
}
