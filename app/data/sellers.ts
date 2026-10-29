import type {
  HistoryRow,
  Seller,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
  SuspensionRecord,
} from "@/app/types/seller";

export const NO_SELLER_LABEL = "ไม่มีผู้ขาย";

export function getShopsOfSeller(shops: SellerShop[], sellerId: string) {
  return shops.filter((shop) => shop.sellerId === sellerId);
}

// ผู้ขายที่ถูกระงับ รวมถึงผู้ขายที่ร้านค้าสังกัดอยู่ จะจองคิวไม่ได้
export function getSellerSuspensionBlock(
  sellers: Seller[],
  shops: SellerShop[],
  retailerName: string,
  brokerName: string,
): string | null {
  const suspended = (seller: Seller | undefined) =>
    seller?.status === "suspended" ? seller : undefined;
  const byBroker = suspended(sellers.find((s) => s.name === brokerName));
  const shop = shops.find((item) => item.name === retailerName);
  const byShop = suspended(sellers.find((s) => s.id === shop?.sellerId));
  const blocked = byBroker ?? byShop;
  return blocked
    ? `ผู้ขาย "${blocked.name}" ถูกระงับ ไม่สามารถจองคิวได้จนกว่าจะปลดการระงับ`
    : null;
}

export function getSellerName(sellers: Seller[], sellerId: string | null) {
  return sellers.find((seller) => seller.id === sellerId)?.name ?? NO_SELLER_LABEL;
}

function byNewest<T extends { at: string }>(items: T[]) {
  return [...items].sort((a, b) => b.at.localeCompare(a.at));
}

export function buildSellerMoveRows(
  moves: ShopMoveRecord[],
  sellerId: string,
  sellers: Seller[],
  shops: SellerShop[],
): HistoryRow[] {
  const rows: HistoryRow[] = [];
  for (const move of byNewest(moves)) {
    const shopName = shops.find((shop) => shop.id === move.shopId)?.name ?? move.shopId;
    const common = { at: move.at, by: move.by, note: move.note, attachments: move.attachments };
    if (move.toSellerId === sellerId) {
      rows.push({
        ...common,
        id: `${move.id}-in`,
        action: `ย้ายเข้า · ${shopName} (จาก ${getSellerName(sellers, move.fromSellerId)})`,
        tone: "in",
      });
    }
    if (move.fromSellerId === sellerId) {
      rows.push({
        ...common,
        id: `${move.id}-out`,
        action: `ย้ายออก · ${shopName} (ไป ${getSellerName(sellers, move.toSellerId)})`,
        tone: "out",
      });
    }
  }
  return rows;
}

export function buildShopMoveRows(
  moves: ShopMoveRecord[],
  shopId: string,
  sellers: Seller[],
): HistoryRow[] {
  return byNewest(moves.filter((move) => move.shopId === shopId)).map((move) => ({
    id: move.id,
    at: move.at,
    action: `ย้ายผู้ขาย: ${getSellerName(sellers, move.fromSellerId)} → ${getSellerName(sellers, move.toSellerId)}`,
    tone: move.toSellerId ? "in" : "out",
    by: move.by,
    note: move.note,
    attachments: move.attachments,
  }));
}

export function buildSuspensionRows(
  records: SuspensionRecord[],
  sellerId: string,
): HistoryRow[] {
  return byNewest(records.filter((record) => record.sellerId === sellerId)).map(
    (record) => ({
      id: record.id,
      at: record.at,
      action: record.type === "suspend" ? "ระงับ" : "ปลดการระงับ",
      tone: record.type === "suspend" ? "out" : "in",
      by: record.by,
      note: record.note,
      attachments: record.attachments,
    }),
  );
}

/** สร้างบันทึกการย้ายร้านค้า 1 รายการ; คืน null ถ้าปลายทางเหมือนเดิม */
export function createShopMove(
  shop: SellerShop,
  input: ShopMoveInput,
  by: string,
  now: Date = new Date(),
): ShopMoveRecord | null {
  if (shop.sellerId === input.toSellerId) return null;
  return {
    id: `MV-${now.getTime().toString(36)}`,
    shopId: shop.id,
    fromSellerId: shop.sellerId,
    toSellerId: input.toSellerId,
    at: now.toISOString(),
    by,
    note: input.note.trim(),
    attachments: input.attachments,
  };
}
