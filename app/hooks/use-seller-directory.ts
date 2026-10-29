"use client";

import { useCallback, useState } from "react";
import { mockSellerShops, mockSellers, mockShopMoves, mockSuspensions } from "@/app/data/mocks/sellers";
import {
  createSeller,
  createSellerIntakeMoves,
  createShop,
  createShopIntakeMove,
  createShopMove,
  getSellerSuspensionBlock,
} from "@/app/data/sellers";
import type { NoteWithAttachments } from "@/app/types/common";
import type {
  NewSellerInput,
  NewShopInput,
  ProfilePatch,
  Seller,
  SellerShop,
  ShopMoveInput,
  ShopMoveRecord,
  SuspensionRecord,
} from "@/app/types/seller";

export function useSellerDirectory(actorName: string) {
  const [sellers, setSellers] = useState<Seller[]>(mockSellers);
  const [shops, setShops] = useState<SellerShop[]>(mockSellerShops);
  const [moves, setMoves] = useState<ShopMoveRecord[]>(mockShopMoves);
  const [suspensions, setSuspensions] =
    useState<SuspensionRecord[]>(mockSuspensions);

  const addSeller = useCallback(
    (input: NewSellerInput) => {
      const seller = createSeller(input, sellers);
      const intake = createSellerIntakeMoves(seller, input.shopIds, shops, actorName);
      setSellers((current) => [...current, seller]);
      setShops((current) =>
        current.map((shop) =>
          intake.some((move) => move.shopId === shop.id)
            ? { ...shop, sellerId: seller.id }
            : shop,
        ),
      );
      setMoves((current) => [...intake, ...current]);
    },
    [sellers, shops, actorName],
  );

  const addShop = useCallback(
    (input: NewShopInput) => {
      const shop = createShop(input, shops);
      const move = createShopIntakeMove(shop, actorName);
      setShops((current) => [...current, shop]);
      if (move) setMoves((current) => [move, ...current]);
    },
    [shops, actorName],
  );

  const setSellerSuspended = useCallback(
    (sellerId: string, suspended: boolean, value: NoteWithAttachments) => {
      setSellers((current) =>
        current.map((seller) =>
          seller.id === sellerId
            ? { ...seller, status: suspended ? "suspended" : "active" }
            : seller,
        ),
      );
      setSuspensions((current) => [
        {
          id: `SU-${Date.now().toString(36)}`,
          sellerId,
          type: suspended ? "suspend" : "release",
          at: new Date().toISOString(),
          by: actorName,
          note: value.note.trim(),
          attachments: value.attachments,
        },
        ...current,
      ]);
    },
    [actorName],
  );

  const moveShop = useCallback(
    (input: ShopMoveInput) => {
      const shop = shops.find((item) => item.id === input.shopId);
      const move = shop ? createShopMove(shop, input, actorName) : null;
      if (!move) return;
      setShops((current) =>
        current.map((item) =>
          item.id === input.shopId
            ? { ...item, sellerId: input.toSellerId }
            : item,
        ),
      );
      setMoves((current) => [move, ...current]);
    },
    [shops, actorName],
  );

  const updateSellerProfile = useCallback(
    (sellerId: string, profile: ProfilePatch) => {
      setSellers((current) =>
        current.map((item) =>
          item.id === sellerId ? { ...item, ...profile } : item,
        ),
      );
    },
    [],
  );

  const updateShopProfile = useCallback(
    (shopId: string, profile: ProfilePatch) => {
      setShops((current) =>
        current.map((item) =>
          item.id === shopId ? { ...item, ...profile } : item,
        ),
      );
    },
    [],
  );

  const getBookingBlock = useCallback(
    (retailerName: string, brokerName: string) =>
      getSellerSuspensionBlock(sellers, shops, retailerName, brokerName),
    [sellers, shops],
  );

  return {
    sellers,
    shops,
    moves,
    suspensions,
    addSeller,
    addShop,
    setSellerSuspended,
    moveShop,
    updateSellerProfile,
    updateShopProfile,
    getBookingBlock,
  };
}
