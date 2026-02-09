import { describe, it, expect } from "vitest";
import { MONSTERS, getMonstersForArea, getBossForArea } from "./monsters";

describe("MONSTERS", () => {
  it("30件のモンスターが定義されている", () => {
    expect(MONSTERS.length).toBe(30);
  });

  it("全モンスターに必須フィールドが存在する", () => {
    for (const m of MONSTERS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.description).toBeTruthy();
      expect(m.areaIds.length).toBeGreaterThan(0);
      expect(["water", "earth", "thunder"]).toContain(m.element);
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

  it("nameが重複しない", () => {
    const names = MONSTERS.map((m) => m.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("全8エリアにボスが1体ずつ存在する", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const bosses = MONSTERS.filter(
        (m) => m.isBoss && m.areaIds.includes(areaId as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
      );
      expect(bosses.length).toBe(1);
    }
  });

  it("全8エリアに通常モンスターが2体以上存在する", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const normals = MONSTERS.filter(
        (m) => !m.isBoss && m.areaIds.includes(areaId as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8)
      );
      expect(normals.length).toBeGreaterThanOrEqual(2);
    }
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
    for (let areaId = 1; areaId <= 8; areaId++) {
      const monsters = getMonstersForArea(areaId);
      expect(monsters.every((m) => !m.isBoss)).toBe(true);
    }
  });

  it("存在しないエリアでは空配列", () => {
    const monsters = getMonstersForArea(99);
    expect(monsters).toEqual([]);
  });
});

describe("getBossForArea", () => {
  it("全8エリアのボスが取得できる", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const boss = getBossForArea(areaId);
      expect(boss).toBeDefined();
      expect(boss!.isBoss).toBe(true);
      expect(boss!.areaIds).toContain(areaId);
    }
  });

  it("存在しないエリアではundefined", () => {
    const boss = getBossForArea(99);
    expect(boss).toBeUndefined();
  });
});
