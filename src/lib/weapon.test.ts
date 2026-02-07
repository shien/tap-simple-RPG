import { describe, it, expect } from "vitest";
import { generateWeaponDrop, WEAPON_NAMES } from "./weapon";
import type { AreaId } from "./types";

describe("generateWeaponDrop", () => {
  it("生成された武器がname, element, attackBonusを持つ", () => {
    const w = generateWeaponDrop(1);
    expect(w).toHaveProperty("name");
    expect(w).toHaveProperty("element");
    expect(w).toHaveProperty("attackBonus");
  });

  it("elementがfire/ice/thunderのいずれか", () => {
    const w = generateWeaponDrop(1);
    expect(["fire", "ice", "thunder"]).toContain(w.element);
  });

  it("attackBonusが0n以上", () => {
    for (let i = 0; i < 20; i++) {
      const w = generateWeaponDrop(1);
      expect(w.attackBonus).toBeGreaterThanOrEqual(0n);
    }
  });

  it("武器名がエリアに対応するテーブルに含まれる", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const w = generateWeaponDrop(areaId as AreaId);
      expect(WEAPON_NAMES[areaId as AreaId]).toContain(w.name);
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
