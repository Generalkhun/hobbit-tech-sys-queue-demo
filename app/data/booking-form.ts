import type { DriverRecord } from "@/app/types/queue";
import type { DeliveryVehicle } from "@/app/types/booking-form";

export const ownShop = "ร้านสมชายค้าเหล็ก";

export const retailerNames: string[] = [
  "ร้านสมชายค้าเหล็ก",
  "ร้านเจริญทรัพย์",
  "ร้านรุ่งเรืองโลหะ",
  "ร้านทองดี รีไซเคิล",
];

export function getVehicleKey(
  driver: Pick<DriverRecord, "carrier" | "plate">,
) {
  return `${driver.carrier}::${driver.plate}`;
}

export function groupVehicles(approvedDrivers: DriverRecord[]) {
  return approvedDrivers.reduce((available, driver) => {
    const key = getVehicleKey(driver);
    const existing = available.find((vehicle) => vehicle.key === key);
    if (existing) {
      existing.drivers.push(driver);
    } else {
      available.push({
        key,
        carrier: driver.carrier,
        plate: driver.plate,
        drivers: [driver],
      });
    }
    return available;
  }, [] as DeliveryVehicle[]);
}
