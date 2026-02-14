import type { AreaId, Item, ItemType, ShopItem } from "./types";
import { AREAS, ITEM_DEFINITIONS, ITEM_PRICE_MULTIPLIERS } from "./constants";

/** アイテムを生成する */
export function createItem(type: ItemType): Item {
  return { ...ITEM_DEFINITIONS[type] };
}

/** ショップの商品リストを生成する */
export function generateShopItems(areaId: AreaId): ShopItem[] {
  const area = AREAS[areaId - 1];
  const types: ItemType[] = ["elementChange", "perfectGuard", "heal40"];

  return types.map((type) => ({
    item: createItem(type),
    price: BigInt(Math.floor(ITEM_PRICE_MULTIPLIERS[type] * area.rewardMultiplier)),
  }));
}

/** アイテムを1個消費する（最初に見つかったものを削除） */
export function removeItem(items: Item[], type: ItemType): Item[] {
  const index = items.findIndex((item) => item.type === type);
  if (index === -1) return items;
  return [...items.slice(0, index), ...items.slice(index + 1)];
}

/** 指定タイプのアイテムを所持しているか */
export function hasItem(items: Item[], type: ItemType): boolean {
  return items.some((item) => item.type === type);
}

/** 指定タイプのアイテム数を返す */
export function countItem(items: Item[], type: ItemType): number {
  return items.filter((item) => item.type === type).length;
}
