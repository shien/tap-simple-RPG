import { describe, it, expect } from "vitest";
import { WEAPONS, getWeaponsForArea } from "./weapons";

describe("WEAPONS", () => {
  it("5件以上の武器が定義されている", () => {
    expect(WEAPONS.length).toBeGreaterThanOrEqual(5);
  });

  it("全武器に必須フィールドが存在する", () => {
    for (const w of WEAPONS) {
      expect(w.id).toBeTruthy();
      expect(w.name).toBeTruthy();
      expect(w.description).toBeTruthy();
      expect(w.areaIds.length).toBeGreaterThan(0);
      expect(["fire", "ice", "thunder"]).toContain(w.element);
    }
  });

  it("areaIdsが1〜8の範囲内", () => {
    for (const w of WEAPONS) {
      for (const id of w.areaIds) {
        expect(id).toBeGreaterThanOrEqual(1);
        expect(id).toBeLessThanOrEqual(8);
      }
    }
  });

  it("idが重複しない", () => {
    const ids = WEAPONS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getWeaponsForArea", () => {
  it("エリア1の武器候補が取得できる", () => {
    const weapons = getWeaponsForArea(1);
    expect(weapons.length).toBeGreaterThan(0);
    for (const w of weapons) {
      expect(w.areaIds).toContain(1);
    }
  });

  it("エリア3の武器候補が取得できる", () => {
    const weapons = getWeaponsForArea(3);
    expect(weapons.length).toBeGreaterThan(0);
    for (const w of weapons) {
      expect(w.areaIds).toContain(3);
    }
  });
});
