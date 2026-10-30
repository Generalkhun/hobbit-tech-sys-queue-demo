/**
 * สถิติสำหรับแดชบอร์ด จศ. (mock)
 * - อัตราการมาส่งตรงเวลา 30 วันย้อนหลัง
 * - Top 5 ร้านค้าที่ส่งมากที่สุด (ตัน + % ตรงเวลา)
 */

export interface OnTimeStats {
  /** จำนวนเที่ยวทั้งหมดใน 30 วัน */
  totalTrips: number;
  /** มาส่งตรงเวลา */
  onTimeTrips: number;
  /** มาสาย */
  lateTrips: number;
  /** ไม่มา (no-show) */
  noShowTrips: number;
  /** เปอร์เซ็นต์ตรงเวลา */
  onTimePercent: number;
}

export interface TopShopStat {
  shopName: string;
  /** น้ำหนักรวมที่ส่ง (ตัน) */
  tons: number;
  /** จำนวนเที่ยว */
  trips: number;
  /** เปอร์เซ็นต์การมาส่งตรงเวลา */
  onTimePercent: number;
}

export const mockOnTimeStats: OnTimeStats = {
  totalTrips: 428,
  onTimeTrips: 361,
  lateTrips: 47,
  noShowTrips: 20,
  onTimePercent: 84.3,
};

export const mockTopShops: TopShopStat[] = [
  { shopName: "ร้านเจริญทรัพย์", tons: 486.5, trips: 62, onTimePercent: 93.5 },
  { shopName: "ร้านสมชายค้าเหล็ก", tons: 412.0, trips: 55, onTimePercent: 89.1 },
  { shopName: "ร้านรุ่งเรืองโลหะ", tons: 358.8, trips: 48, onTimePercent: 85.4 },
  { shopName: "ร้านทองดี รีไซเคิล", tons: 297.2, trips: 41, onTimePercent: 78.0 },
  { shopName: "บจก. เอส.เอส. เมทัล", tons: 254.6, trips: 36, onTimePercent: 72.2 },
];
