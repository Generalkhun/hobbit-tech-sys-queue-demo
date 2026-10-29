import type {
  Seller,
  SellerShop,
  ShopMoveRecord,
  SuspensionRecord,
} from "@/app/types/seller";

export const mockSellers: Seller[] = [
  {
    id: "SL-001",
    name: "บริษัท เอส.เอส. เมทัล",
    coordinator: "คุณสมศักดิ์ มั่นคง",
    phone: "02-555-0188",
    email: "contact@ss-metal.example",
    address: "88 ถ.พหลโยธิน ต.คลองหนึ่ง อ.คลองหลวง จ.ปทุมธานี",
    taxId: "0105551000011",
    description: "ผู้รวบรวมเศษเหล็กรายใหญ่ ส่งเหล็กเข้าโรงงานสม่ำเสมอ",
    status: "active",
  },
  {
    id: "SL-002",
    name: "หจก. รุ่งกิจรีไซเคิล",
    coordinator: "คุณวิไล รุ่งกิจ",
    phone: "081-555-1042",
    email: "rungkit@example.com",
    address: "12/4 ม.5 ต.บ้านใหม่ อ.พระนครศรีอยุธยา จ.พระนครศรีอยุธยา",
    taxId: "0143552000022",
    description: "ผู้ขายรายกลางในพื้นที่อยุธยา",
    status: "active",
  },
  {
    id: "SL-003",
    name: "บริษัท เมืองทองรีไซเคิล",
    coordinator: "คุณประเสริฐ ทองสุข",
    phone: "02-788-3400",
    email: "info@muangthong.example",
    address: "45 ถ.แจ้งวัฒนะ อ.ปากเกร็ด จ.นนทบุรี",
    taxId: "0125553000033",
    description: "ผู้ขายรายใหม่ อยู่ระหว่างติดตามผล",
    status: "active",
  },
];

export const mockSellerShops: SellerShop[] = [
  { id: "SH-001", name: "ร้านสมชายค้าเหล็ก", province: "อยุธยา", sellerId: "SL-001", description: "ร้านรับซื้อเศษเหล็ก" },
  { id: "SH-002", name: "ร้านเจริญทรัพย์", province: "ปทุมธานี", sellerId: "SL-001", description: "ร้านรับซื้อเศษเหล็ก" },
  { id: "SH-003", name: "ร้านทองดี รีไซเคิล", province: "สระบุรี", sellerId: null, description: "ร้านรับซื้อเศษเหล็ก" },
  { id: "SH-004", name: "ร้านรุ่งเรืองโลหะ", province: "ปทุมธานี", sellerId: "SL-002", description: "ร้านรับซื้อเศษเหล็ก" },
];

export const mockShopMoves: ShopMoveRecord[] = [
  {
    id: "MV-001",
    shopId: "SH-001",
    fromSellerId: null,
    toSellerId: "SL-001",
    at: "2026-03-04T09:30:00+07:00",
    by: "ผู้ดูแลระบบ",
    note: "ลงทะเบียนร้านเข้าสังกัดครั้งแรก",
    attachments: [],
  },
  {
    id: "MV-002",
    shopId: "SH-003",
    fromSellerId: null,
    toSellerId: "SL-002",
    at: "2026-04-10T13:15:00+07:00",
    by: "ผู้ดูแลระบบ",
    note: "",
    attachments: [],
  },
  {
    id: "MV-003",
    shopId: "SH-003",
    fromSellerId: "SL-002",
    toSellerId: null,
    at: "2026-05-02T10:45:00+07:00",
    by: "ผู้ดูแลระบบ",
    note: "ร้านขอเปลี่ยนเป็นผู้ขายอิสระ",
    attachments: [],
  },
];

export const mockSuspensions: SuspensionRecord[] = [];
