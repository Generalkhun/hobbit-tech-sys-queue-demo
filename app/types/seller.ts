import type {
  IsoDateTime,
  NoteAttachment,
  NoteWithAttachments,
} from "@/app/types/common";

export type SellerStatus = "active" | "suspended";

export interface SellerProfile {
  avatar?: string;
  description: string;
}

/** ตำแหน่งที่ตั้งของผู้ขาย/ร้านค้า */
export interface SellerLocation {
  province: string;
  address: string;
  /** รูปถ่ายหน้าร้าน/สำนักงาน */
  photo?: string;
}

export type ProfilePatch = Partial<SellerProfile & SellerLocation>;

export interface Seller extends SellerProfile, SellerLocation {
  id: string;
  name: string;
  coordinator: string;
  phone: string;
  email: string;
  taxId: string;
  status: SellerStatus;
}

export interface NewSellerInput extends SellerProfile, SellerLocation {
  name: string;
  coordinator: string;
  phone: string;
  email: string;
  taxId: string;
  /** ร้านค้าที่ย้ายเข้าสังกัดผู้ขายใหม่ (จากผู้ขายอื่นหรือจากกลุ่มไม่มีผู้ขาย) */
  shopIds: string[];
}

export interface NewShopInput extends SellerProfile, SellerLocation {
  name: string;
  /** null = ไม่สังกัดผู้ขาย */
  sellerId: string | null;
}

export interface SellerShop extends SellerProfile, SellerLocation {
  id: string;
  name: string;
  /** null = ร้านค้าที่ไม่มีผู้ขาย */
  sellerId: string | null;
}

/** บันทึกการย้ายร้านค้า 1 ครั้ง (null = ไม่มีผู้ขาย) */
export interface ShopMoveRecord {
  id: string;
  shopId: string;
  fromSellerId: string | null;
  toSellerId: string | null;
  at: IsoDateTime;
  by: string;
  note: string;
  attachments: NoteAttachment[];
}

/** แถวประวัติสำหรับตารางแสดงผล */
export interface HistoryRow {
  id: string;
  at: IsoDateTime;
  action: string;
  tone: "in" | "out";
  by: string;
  note: string;
  attachments: NoteAttachment[];
}

export interface ShopMoveInput extends NoteWithAttachments {
  shopId: string;
  toSellerId: string | null;
}

/** ผลของการระงับ/ปลดระงับผู้ขาย */
export interface SuspensionRecord {
  id: string;
  sellerId: string;
  type: "suspend" | "release";
  at: IsoDateTime;
  by: string;
  note: string;
  attachments: NoteAttachment[];
}
