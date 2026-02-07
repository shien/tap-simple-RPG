import { describe, it, expect } from "vitest";
import { MONSTERS, getMonstersForArea, getBossForArea } from "./monsters";

describe("MONSTERS", () => {
  it("5件以上のモンスターが定義されている", () => {
    expect(MONSTERS.length).toBeGreaterThanOrEqual(5);
  });

  it("全モンスターに必須フィールドが存在する", () => {
    for (const m of MONSTERS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.areaIds.length).toBeGreaterThan(0);
      expect(["fire", "ice", "thunder"]).toContain(m.element);
      expect(typeof m.isBoss).toBe("boolean");
    }
  });

  it("areaIdsが1〜8の範囲内", () => {
    for (const m of MONSTERS) {
      for (const id of m.areaIds) {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(8);
      }
    }
  });

  it("idが重複しない", () => {
    const ids = MONSTERS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ボスモンスターが少なくとも1体いる", () => {
    const bosses = MONSTERS.filter((m) => m.isBoss);
    expect(bosses.length).toBeGreaterThanOrEqual(1);
  });
});

describe("getMonstersForArea", () => {
  it("エリア1の通常モンスターが取得できる", () => {
    const monsters = getMonstersForArea(1);
    expect(monsters.length).toBeGreaterThan(0);
    for (const m of monsters) {
      expect(m.isBoss).toBe(false);
      expect(m.areaIds).toContain(1);
    }
  });

  it("ボスは含まれない", () => {
    const monsters = getMonstersForArea(1);
    expect(monsters.every((m) => !m.isBoss)).toBe(true);
  });
});

describe("getBossForArea", () => {
  it("エリア1のボスが取得できる", () => {
    const boss = getBossForArea(1);
    expect(boss).toBeDefined();
    expect(boss!.isBoss).toBe(true);
    expect(boss!.areaIds).toContain(1);
  });

  it("ボスがいないエリアではundefined", () => {
    const boss = getBossForArea(8);
    expect(boss).toBeUndefined();
  });
});
