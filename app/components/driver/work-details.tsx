import { plants } from "@/app/data/mock-data";
import { DetailGrid } from "@/app/components/driver/detail-grid";
import type { QueueBooking } from "@/app/types/queue";

export function WorkDetails({ booking }: { booking: QueueBooking }) {
  const plant = plants.find((item) => item.id === booking.plantId);
  return (
    <DetailGrid
      items={[
        ["เลขที่ใบนำส่ง", booking.id],
        ["โรงงานปลายทาง", plant?.name ?? booking.plantId],
        ["ที่ตั้งโรงงาน", plant?.location ?? "—"],
        ["วันและเวลารับ", `${booking.date} · ${booking.timeSlot} น.`],
        ["ผู้ส่งเหล็ก", booking.broker === "—" ? booking.retailer : booking.broker],
        ["ร้านค้า", booking.retailer],
        ["เกรด", booking.grade],
        ["น้ำหนักสุทธิประมาณ", `${booking.estimatedTons * 1000} กก.`],
        ["รถขนส่ง", `${booking.carrier} · ${booking.plate}`],
        ["ชื่อผู้ขับ", booking.driver],
      ]}
    />
  );
}
