"use client";

import type { GameState, ItemType, ShopItem } from "@/lib/types";

const ITEM_DESCRIPTIONS: Record<ItemType, string> = {
  elementChange: "武器の属性を一時的に変更",
  perfectGuard: "次の敵攻撃を完全に無効化",
  heal40: "MaxHPの40%を回復",
};

export function ShopView({
  gameState,
  shopItems,
  onPurchase,
  onLeave,
}: {
  gameState: GameState;
  shopItems: ShopItem[];
  onPurchase: (itemType: ItemType, price: bigint) => void;
  onLeave: () => void;
}) {
  const playerGold = gameState.player.gold;

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4 text-center">
        <p className="text-lg font-bold text-yellow-300">ショップ</p>
        <p className="mt-1 text-sm text-zinc-400">
          所持ゴールド: <span className="text-yellow-400">{playerGold.toString()}G</span>
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {shopItems.map((shopItem) => {
          const canBuy = playerGold >= shopItem.price;
          return (
            <div
              key={shopItem.item.type}
              className="rounded-lg border border-zinc-700 bg-zinc-800 p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{shopItem.item.name}</p>
                  <p className="text-sm text-zinc-400">
                    {ITEM_DESCRIPTIONS[shopItem.item.type]}
                  </p>
                </div>
                <p className="text-sm font-bold text-yellow-400">
                  {shopItem.price.toString()}G
                </p>
              </div>
              <button
                onClick={() => onPurchase(shopItem.item.type, shopItem.price)}
                disabled={!canBuy}
                className={`mt-3 w-full rounded-full py-2 text-sm font-bold ${
                  canBuy
                    ? "bg-yellow-600 text-white active:bg-yellow-700"
                    : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                }`}
              >
                {canBuy ? "購入" : "ゴールド不足"}
              </button>
            </div>
          );
        })}
      </div>

      {/* 所持アイテム表示 */}
      {gameState.player.items.length > 0 && (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
          <p className="mb-1 text-sm text-zinc-400">所持アイテム</p>
          <div className="flex flex-wrap gap-2">
            {Array.from(
              gameState.player.items.reduce((acc, item) => {
                acc.set(item.name, (acc.get(item.name) ?? 0) + 1);
                return acc;
              }, new Map<string, number>())
            ).map(([name, count]) => (
              <span
                key={name}
                className="rounded-md bg-zinc-700 px-2 py-1 text-xs text-zinc-300"
              >
                {name} x{count}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onLeave}
        className="w-full rounded-full bg-zinc-600 py-4 text-lg font-bold text-white active:bg-zinc-700"
      >
        立ち去る
      </button>
    </div>
  );
}
