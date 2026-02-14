import { describe, it, expect } from "vitest";
import { createItem, generateShopItems, removeItem, hasItem, countItem } from "./item";
import type { Item } from "./types";

describe("createItem", () => {
  it("武器の塗料を生成できる", () => {
    const item = createItem("elementChange");
    expect(item.type).toBe("elementChange");
    expect(item.name).toBe("武器の塗料");
  });

  it("古びた鋼鉄の盾を生成できる", () => {
    const item = createItem("perfectGuard");
    expect(item.type).toBe("perfectGuard");
    expect(item.name).toBe("古びた鋼鉄の盾");
  });

  it("回復の薬を生成できる", () => {
    const item = createItem("heal40");
    expect(item.type).toBe("heal40");
    expect(item.name).toBe("回復の薬");
  });
});

describe("generateShopItems", () => {
  it("3つのアイテムを返す", () => {
    const items = generateShopItems(1);
    expect(items).toHaveLength(3);
  });

  it("エリア1の価格が正しい（rewardMultiplier=30）", () => {
    const items = generateShopItems(1);
    // elementChange: 3 * 30 = 90
    // perfectGuard: 5 * 30 = 150
    // heal40: 2 * 30 = 60
    expect(items[0].price).toBe(90n);
    expect(items[1].price).toBe(150n);
    expect(items[2].price).toBe(60n);
  });

  it("エリア8の価格がスケールする（rewardMultiplier=4000000000）", () => {
    const items = generateShopItems(8);
    // elementChange: 3 * 4000000000 = 12000000000
    expect(items[0].price).toBe(12000000000n);
    // perfectGuard: 5 * 4000000000 = 20000000000
    expect(items[1].price).toBe(20000000000n);
    // heal40: 2 * 4000000000 = 8000000000
    expect(items[2].price).toBe(8000000000n);
  });

  it("各アイテムのタイプが正しい", () => {
    const items = generateShopItems(1);
    expect(items[0].item.type).toBe("elementChange");
    expect(items[1].item.type).toBe("perfectGuard");
    expect(items[2].item.type).toBe("heal40");
  });
});

describe("removeItem", () => {
  it("指定タイプのアイテムを1個削除する", () => {
    const items: Item[] = [
      { type: "heal40", name: "回復の薬" },
      { type: "heal40", name: "回復の薬" },
    ];
    const result = removeItem(items, "heal40");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("heal40");
  });

  it("アイテムが見つからない場合は変更なし", () => {
    const items: Item[] = [{ type: "heal40", name: "回復の薬" }];
    const result = removeItem(items, "perfectGuard");
    expect(result).toHaveLength(1);
    expect(result).toBe(items); // 同一参照
  });

  it("空配列から削除しても空配列", () => {
    const result = removeItem([], "heal40");
    expect(result).toHaveLength(0);
  });

  it("複数種類のアイテムから指定タイプのみ1個削除", () => {
    const items: Item[] = [
      { type: "elementChange", name: "武器の塗料" },
      { type: "heal40", name: "回復の薬" },
      { type: "perfectGuard", name: "古びた鋼鉄の盾" },
    ];
    const result = removeItem(items, "heal40");
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("elementChange");
    expect(result[1].type).toBe("perfectGuard");
  });
});

describe("hasItem", () => {
  it("所持していれば true", () => {
    const items: Item[] = [{ type: "heal40", name: "回復の薬" }];
    expect(hasItem(items, "heal40")).toBe(true);
  });

  it("所持していなければ false", () => {
    const items: Item[] = [{ type: "heal40", name: "回復の薬" }];
    expect(hasItem(items, "perfectGuard")).toBe(false);
  });

  it("空配列は false", () => {
    expect(hasItem([], "heal40")).toBe(false);
  });
});

describe("countItem", () => {
  it("指定タイプの個数を返す", () => {
    const items: Item[] = [
      { type: "heal40", name: "回復の薬" },
      { type: "heal40", name: "回復の薬" },
      { type: "perfectGuard", name: "古びた鋼鉄の盾" },
    ];
    expect(countItem(items, "heal40")).toBe(2);
    expect(countItem(items, "perfectGuard")).toBe(1);
    expect(countItem(items, "elementChange")).toBe(0);
  });
});
