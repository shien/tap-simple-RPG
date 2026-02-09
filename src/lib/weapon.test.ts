import { describe, it, expect } from "vitest";
import { generateWeaponDrop } from "./weapon";
import { getWeaponsForArea } from "./data/weapons";
import type { AreaId } from "./types";

describe("generateWeaponDrop", () => {
  it("生成された武器がname, element, attackBonusを持つ", () => {
    const w = generateWeaponDrop(1);
    expect(w).toHaveProperty("name");
    expect(w).toHaveProperty("element");
    expect(w).toHaveProperty("attackBonus");
  });

  it("elementがwater/earth/thunderのいずれか", () => {
    const w = generateWeaponDrop(1);
    expect(["water", "earth", "thunder"]).toContain(w.element);
  });

  it("attackBonusが0n以上", () => {
    for (let i = 0; i < 20; i++) {
      const w = generateWeaponDrop(1);
      expect(w.attackBonus).toBeGreaterThanOrEqual(0n);
    }
  });

  it("設定ファイルに候補があるエリアでは設定の武器名が返る", () => {
    const candidates = getWeaponsForArea(1);
    const names = candidates.map((c) => c.name);
    for (let i = 0; i < 20; i++) {
      const w = generateWeaponDrop(1);
      expect(names).toContain(w.name);
    }
  });

  it("全エリアで設定された武器名が返る", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const candidates = getWeaponsForArea(areaId as AreaId);
      const names = candidates.map((c) => c.name);
      for (let i = 0; i < 10; i++) {
        const w = generateWeaponDrop(areaId as AreaId);
        expect(names).toContain(w.name);
      }
    }
  });

  it("エリア8の方がエリア1よりattackBonusが大きい（統計的）", () => {
    let sum1 = 0n;
    let sum8 = 0n;
    const trials = 50;
    for (let i = 0; i < trials; i++) {
      sum1 += generateWeaponDrop(1).attackBonus;
      sum8 += generateWeaponDrop(8).attackBonus;
    }
    expect(sum8).toBeGreaterThan(sum1);
  });

  it("全8エリアで正常に武器が生成できる", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const w = generateWeaponDrop(areaId as AreaId);
      expect(w.name.length).toBeGreaterThan(0);
      expect(typeof w.attackBonus).toBe("bigint");
    }
  });
});
