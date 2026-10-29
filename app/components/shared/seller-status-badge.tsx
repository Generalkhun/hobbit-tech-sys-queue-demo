import type { SellerStatus } from "@/app/types/seller";

export function SellerStatusBadge({ status }: { status: SellerStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        status === "active"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-rose-50 text-rose-700"
      }`}
    >
      {status === "active" ? "ใช้งาน" : "ระงับ"}
    </span>
  );
}
