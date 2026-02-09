import { describe, it, expect } from "vitest";
import { WEAPONS, getWeaponsForArea } from "./weapons";

describe("WEAPONS", () => {
  it("30件の武器が定義されている", () => {
    expect(WEAPONS.length).toBe(30);
  });

  it("全武器に必須フィールドが存在する", () => {
    for (const w of WEAPONS) {
      expect(w.id).toBeTruthy();
      expect(w.name).toBeTruthy();
      expect(w.description).toBeTruthy();
      expect(w.areaIds.length).toBeGreaterThan(0);
      expect(["water", "earth", "thunder"]).toContain(w.element);
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
  it("全8エリアに武器候補が存在する", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const weapons = getWeaponsForArea(areaId);
      expect(weapons.length).toBeGreaterThan(0);
      for (const w of weapons) {
        expect(w.areaIds).toContain(areaId);
      }
    }
  });

  it("各エリアに複数属性の武器が含まれる", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const weapons = getWeaponsForArea(areaId);
      const elements = new Set(weapons.map((w) => w.element));
      expect(elements.size).toBeGreaterThanOrEqual(2);
    }
  });
});
