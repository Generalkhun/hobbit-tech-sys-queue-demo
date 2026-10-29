import { useState } from "react";
import { plants } from "@/app/data/mock-data";
import {
  checkinRadiusKm,
  distanceInKm,
  getDistanceError,
  getGeolocationErrorMessage,
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
      setLocationError("ไม่พบงานที่ยังเปิดให้เช็คอินสำหรับบัญชีคนขับนี้");
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
        onProgressChange({ bookingId: selectedBooking.id, step: "review" });
      },
      (error) => {
        setIsCheckingLocation(false);
        setLocationError(getGeolocationErrorMessage(error.code));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  return { locationError, isCheckingLocation, beginRemoteCheckin };
}
