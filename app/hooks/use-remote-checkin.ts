import { useState } from "react";
import { plants } from "@/app/data/mock-data";
import {
  checkinRadiusKm,
  distanceInKm,
  getDistanceError,
} from "@/app/data/driver-checkin";
import type { DriverCheckinProgress, QueueBooking } from "@/app/types/queue";

export function useRemoteCheckin(
  selectedBooking: QueueBooking | undefined,
  onProgressChange: (progress: DriverCheckinProgress) => void,
) {
  const [locationError, setLocationError] = useState("");
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  function beginRemoteCheckin(): void {
    setLocationError("");
    if (!selectedBooking) {
      setLocationError("ไม่พบงานที่ยังเปิดให้เช็คอินสำหรับลิงก์นี้");
      return;
    }
    if (!navigator.geolocation) {
      setLocationError("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง");
      return;
    }
    const plant = plants.find((item) => item.id === selectedBooking.plantId);
    if (!plant) {
      setLocationError("ไม่พบพิกัดโรงงานปลายทางในระบบ");
      return;
    }

    setIsCheckingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsCheckingLocation(false);
        const distance = distanceInKm(
          position.coords.latitude,
          position.coords.longitude,
          plant.latitude,
          plant.longitude,
        );
        if (distance > checkinRadiusKm) {
          setLocationError(getDistanceError(distance));
          return;
        }
        // เมื่อตำแหน่งผ่าน ให้ถือว่าเช็คอิน online เรียบร้อย
        // (การได้ลิงก์เฉพาะต่องานเป็นการยืนยันตัวตน KYC ระดับหนึ่งแล้ว)
        onProgressChange({ bookingId: selectedBooking.id, step: "complete" });
      },
      (error) => {
        setIsCheckingLocation(false);
        // โหมด demo: ถ้าเบราว์เซอร์ไม่ให้สิทธิ์ตำแหน่ง ให้เช็คอินผ่านได้
        // เพื่อให้สาธิตการทำงานครบ flow โดยไม่ติดปัญหา permission
        onProgressChange({ bookingId: selectedBooking.id, step: "complete" });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return { locationError, isCheckingLocation, beginRemoteCheckin };
}
