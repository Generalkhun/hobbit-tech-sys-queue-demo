import test from "node:test";
import assert from "node:assert/strict";
import {
  createSeller,
  createSellerIntakeMoves,
  createShop,
  createShopIntakeMove,
} from "../app/data/sellers.ts";
import { mockSellers, mockSellerShops } from "../app/data/mocks/sellers.ts";

const sellerInput = {
  name: " ผู้ขายใหม่ ",
  coordinator: "คุณทดสอบ",
  phone: "081-000-0000",
  email: "",
  taxId: "",
  province: "นนทบุรี",
  address: "1 ถ.ทดสอบ",
  description: "",
  shopIds: ["SH-002", "SH-003"],
};

test("createSeller generates the next id and normalises blank optional fields", () => {
  const seller = createSeller(sellerInput, mockSellers);
  assert.equal(seller.id, "SL-004");
  assert.equal(seller.name, "ผู้ขายใหม่");
  assert.equal(seller.email, "—");
  assert.equal(seller.status, "active");
  assert.equal("shopIds" in seller, false);
});

test("seller intake moves record the source seller or the unassigned group", () => {
  const seller = createSeller(sellerInput, mockSellers);
  const moves = createSellerIntakeMoves(seller, ["SH-002", "SH-003"], mockSellerShops, "admin");
  assert.deepEqual(
    moves.map((m) => [m.shopId, m.fromSellerId, m.toSellerId]),
    [
      ["SH-002", "SL-001", seller.id],
      ["SH-003", null, seller.id],
    ],
  );
});

test("createShop assigns the next id and optional seller intake move", () => {
  const shop = createShop(
    { name: "ร้านใหม่", province: "สระบุรี", address: "9", description: "", sellerId: "SL-002" },
    mockSellerShops,
  );
  assert.equal(shop.id, "SH-005");
  assert.equal(createShopIntakeMove(shop, "admin")?.toSellerId, "SL-002");
  assert.equal(createShopIntakeMove({ ...shop, sellerId: null }, "admin"), null);
});
