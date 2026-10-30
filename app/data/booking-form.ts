import type { DriverRecord } from "@/app/types/queue";
import type { DeliveryVehicle, VehicleScope } from "@/app/types/booking-form";
import type { VehicleRecord } from "@/app/types/registry";
import type { Seller, SellerShop } from "@/app/types/seller";

export const ownShop = "ร้านสมชายค้าเหล็ก";

export const retailerNames: string[] = [
  "ร้านสมชายค้าเหล็ก",
  "ร้านเจริญทรัพย์",
  "ร้านรุ่งเรืองโลหะ",
  "ร้านทองดี รีไซเคิล",
];

export function getVehicleKey(
  vehicle: Pick<VehicleRecord, "plate" | "province">,
) {
  // รถยนต์ unique ด้วยทะเบียน+จังหวัด (ทะเบียนออกซ้ำได้ถ้าต่างจังหวัด)
  return `${vehicle.plate}::${vehicle.province || ""}`;
}

/**
 * กรองรถยนต์ตามบทบาทของผู้สร้างใบนำส่ง:
 * - admin (จศ.): เห็นรถทุกคันในระบบ
 * - broker (ผู้ขาย): รถของร้านค้าที่อยู่ใต้ผู้ขาย + รถรับจ้างอิสระ
 * - retailer (ร้านค้าย่อย): รถของร้านตัวเอง + รถรับจ้างอิสระ
 */
export function scopeVehicles(
  vehicles: VehicleRecord[],
  sellers: Seller[],
  shops: SellerShop[],
  scope: VehicleScope,
): VehicleRecord[] {
  if (scope.kind === "admin") return vehicles;
  if (scope.kind === "broker") {
    const sellerShops = shops
      .filter((shop) => shop.sellerId === scope.sellerId)
      .map((shop) => shop.name);
    return vehicles.filter(
      (vehicle) =>
        vehicle.ownerType === "contractor" ||
        (vehicle.ownerType === "shop" &&
          sellerShops.includes(vehicle.shopName)),
    );
  }
  // retailer
  return vehicles.filter(
    (vehicle) =>
      vehicle.ownerType === "contractor" || vehicle.shopName === scope.shopName,
  );
}

/** รวมรายละเอียดรถเข้ากับคนขับที่ผ่านการอนุมัติแล้วที่ผูกกับรถ */
export function groupRegistryVehicles(
  vehicles: VehicleRecord[],
  approvedDrivers: DriverRecord[],
): DeliveryVehicle[] {
  return vehicles
    .filter((vehicle) => vehicle.plate.trim() !== "")
    .map((vehicle) => {
      const key = getVehicleKey({
        plate: vehicle.plate,
        province: vehicle.province,
      });
      return {
        key,
        id: vehicle.id,
        carrier: vehicle.carrier,
        plate: vehicle.plate,
        vehicleType: vehicle.vehicleType,
        province: vehicle.province,
        ownerType: vehicle.ownerType,
        shopName: vehicle.shopName,
        status: vehicle.status,
        drivers: approvedDrivers.filter(
          (driver) =>
            driver.carrier === vehicle.carrier && driver.plate === vehicle.plate,
        ),
      };
    });
}

export function findSellerByName(sellers: Seller[], name: string) {
  return sellers.find((seller) => seller.name === name) ?? null;
}

/** ชื่อสังกัดของรถสำหรับคอลัมน์/ตัวกรอง: ผู้ขาย / ร้านค้า / อิสระ */
export function getVehicleAffiliation(
  vehicle: Pick<DeliveryVehicle, "ownerType" | "shopName">,
  shops: SellerShop[],
  sellers: Seller[],
) {
  if (vehicle.ownerType === "contractor" || vehicle.shopName === "") {
    return { label: "รถอิสระ", sellerName: null, shopName: null };
  }
  const shop = shops.find((item) => item.name === vehicle.shopName);
  const seller = shop
    ? sellers.find((item) => item.id === shop.sellerId) ?? null
    : null;
  return {
    label: seller ? `ร้านค้าในสังกัด ${seller.name}` : "ร้านค้าอิสระ",
    sellerName: seller?.name ?? null,
    shopName: shop?.name ?? null,
  };
}
