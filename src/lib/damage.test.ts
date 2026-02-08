import { describe, it, expect } from "vitest";
import { calculatePlayerDamage } from "./damage";
import type { Player, Enemy } from "./types";

function makePlayer(
  atk: bigint,
  attackBonus: bigint,
  weaponElement: "water" | "earth" | "thunder"
): Player {
  return {
    level: 1,
    exp: 0n,
    hp: 50n,
    maxHp: 50n,
    atk,
    gold: 0n,
    weapon: { name: "テスト武器", element: weaponElement, attackBonus },
  };
}

function makeEnemy(element: "water" | "earth" | "thunder"): Enemy {
  return {
    name: "テスト敵",
    element,
    hp: 100n,
    maxHp: 100n,
    atk: 10n,
    expReward: 10n,
    goldReward: 5n,
    isAbnormal: false,
    abnormalTier: null,
  };
}

describe("calculatePlayerDamage", () => {
  it("同属性: (ATK + bonus) × 1", () => {
    const p = makePlayer(100n, 50n, "water");
    const e = makeEnemy("water");
    expect(calculatePlayerDamage(p, e)).toBe(150n);
  });

  it("有利: (ATK + bonus) × 2", () => {
    const p = makePlayer(100n, 50n, "water");
    const e = makeEnemy("earth");
    expect(calculatePlayerDamage(p, e)).toBe(300n);
  });

  it("不利: (ATK + bonus) / 10", () => {
    const p = makePlayer(100n, 50n, "water");
    const e = makeEnemy("thunder");
    expect(calculatePlayerDamage(p, e)).toBe(15n);
  });

  it("不利で極小でも最低1ダメージ保証", () => {
    const p = makePlayer(5n, 0n, "water");
    const e = makeEnemy("thunder");
    // 5 / 10 = 0 → 最低1保証
    expect(calculatePlayerDamage(p, e)).toBe(1n);
  });

  it("bonus=0nのときATKのみで計算", () => {
    const p = makePlayer(100n, 0n, "earth");
    const e = makeEnemy("thunder");
    // 有利: 100 * 2 = 200
    expect(calculatePlayerDamage(p, e)).toBe(200n);
  });
});
