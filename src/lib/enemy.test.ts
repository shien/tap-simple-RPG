import { describe, it, expect } from "vitest";
import {
  rollIndividualVariation,
  rollAbnormal,
  generateEnemy,
  generateBoss,
} from "./enemy";
import { AREAS, ABNORMAL_TIERS } from "./constants";
import { getMonstersForArea } from "./data/monsters";

describe("rollIndividualVariation", () => {
  it("草原: 0.85〜1.15の範囲内（100回）", () => {
    const area = AREAS[0]; // 草原
    for (let i = 0; i < 100; i++) {
      const v = rollIndividualVariation(area);
      expect(v).toBeGreaterThanOrEqual(0.85);
      expect(v).toBeLessThanOrEqual(1.15);
    }
  });

  it("魔王城: 0.5〜2.6の範囲内（100回）", () => {
    const area = AREAS[7]; // 魔王城
    for (let i = 0; i < 100; i++) {
      const v = rollIndividualVariation(area);
      expect(v).toBeGreaterThanOrEqual(0.5);
      expect(v).toBeLessThanOrEqual(2.6);
    }
  });
});

describe("rollAbnormal", () => {
  it("abnormalRate=0 なら常にfalse", () => {
    const area = { ...AREAS[0], abnormalRate: 0 };
    for (let i = 0; i < 50; i++) {
      const result = rollAbnormal(area);
      expect(result.isAbnormal).toBe(false);
      expect(result.tier).toBeNull();
    }
  });

  it("abnormalRate=1 なら常にtrue", () => {
    const area = { ...AREAS[0], abnormalRate: 1 };
    for (let i = 0; i < 50; i++) {
      const result = rollAbnormal(area);
      expect(result.isAbnormal).toBe(true);
      expect(result.tier).not.toBeNull();
    }
  });

  it("異常時のtierがABNORMAL_TIERSのいずれか", () => {
    const area = { ...AREAS[0], abnormalRate: 1 };
    const validTiers = [...ABNORMAL_TIERS];
    for (let i = 0; i < 50; i++) {
      const result = rollAbnormal(area);
      expect(validTiers).toContain(result.tier);
    }
  });
});

describe("generateEnemy", () => {
  it("Enemy型の全フィールドを持つ", () => {
    const e = generateEnemy(1);
    expect(e).toHaveProperty("name");
    expect(e).toHaveProperty("element");
    expect(e).toHaveProperty("hp");
    expect(e).toHaveProperty("maxHp");
    expect(e).toHaveProperty("atk");
    expect(e).toHaveProperty("expReward");
    expect(e).toHaveProperty("goldReward");
    expect(e).toHaveProperty("isAbnormal");
    expect(e).toHaveProperty("abnormalTier");
  });

  it("elementがwater/earth/thunderのいずれか", () => {
    for (let i = 0; i < 20; i++) {
      const e = generateEnemy(1);
      expect(["water", "earth", "thunder"]).toContain(e.element);
    }
  });

  it("モンスター設定に名前がある場合、その名前が使われる", () => {
    const candidates = getMonstersForArea(1);
    const names = candidates.map((c) => c.name);
    for (let i = 0; i < 20; i++) {
      const e = generateEnemy(1);
      expect(names).toContain(e.name);
    }
  });

  it("hp と maxHp が一致する", () => {
    const e = generateEnemy(1);
    expect(e.hp).toBe(e.maxHp);
  });

  it("hpが1n以上", () => {
    for (let i = 0; i < 20; i++) {
      const e = generateEnemy(1);
      expect(e.hp).toBeGreaterThanOrEqual(1n);
    }
  });

  it("エリア8の敵HPがエリア1より大幅に高い（統計的）", () => {
    let sumHp1 = 0n;
    let sumHp8 = 0n;
    const trials = 30;
    for (let i = 0; i < trials; i++) {
      sumHp1 += generateEnemy(1).hp;
      sumHp8 += generateEnemy(8).hp;
    }
    expect(sumHp8).toBeGreaterThan(sumHp1 * 10n);
  });

  it("isAbnormal=falseの場合、abnormalTier=null", () => {
    for (let i = 0; i < 50; i++) {
      const e = generateEnemy(1);
      if (!e.isAbnormal) {
        expect(e.abnormalTier).toBeNull();
      }
    }
  });

  it("設定にないエリアでもフォールバックで生成できる", () => {
    // エリア5にはモンスター設定がない
    const candidates = getMonstersForArea(5);
    if (candidates.length === 0) {
      const e = generateEnemy(5);
      expect(e.name).toBe("モンスター");
      expect(e.hp).toBeGreaterThanOrEqual(1n);
    }
  });

  it("presetElement指定時はその属性が使われる", () => {
    for (let i = 0; i < 20; i++) {
      const e = generateEnemy(1, "thunder");
      expect(e.element).toBe("thunder");
    }
  });

  it("presetElement指定時でもHP/ATK等は正しく生成される", () => {
    const e = generateEnemy(1, "water");
    expect(e.element).toBe("water");
    expect(e.hp).toBeGreaterThanOrEqual(1n);
    expect(e.maxHp).toBe(e.hp);
    expect(e.atk).toBeGreaterThanOrEqual(1n);
  });
});

describe("generateBoss", () => {
  it("エリア1のボス名がモンスター設定から取得される", () => {
    const boss = generateBoss(1);
    expect(boss.name).toBe("草原の王");
  });

  it("ボスのisAbnormal=false", () => {
    const boss = generateBoss(1);
    expect(boss.isAbnormal).toBe(false);
    expect(boss.abnormalTier).toBeNull();
  });

  it("ボスが通常敵よりHP/ATKが高い（統計的、20回）", () => {
    const boss = generateBoss(1);
    let normalStronger = 0;
    for (let i = 0; i < 20; i++) {
      const normal = generateEnemy(1);
      if (normal.hp > boss.hp) normalStronger++;
    }
    // 異常個体でなければ通常敵がボスを超えることはほぼない
    expect(normalStronger).toBeLessThanOrEqual(2);
  });

  it("ボスのexpRewardが通常敵より高い（統計的）", () => {
    const boss = generateBoss(1);
    let sumNormalExp = 0n;
    for (let i = 0; i < 20; i++) {
      sumNormalExp += generateEnemy(1).expReward;
    }
    const avgNormalExp = sumNormalExp / 20n;
    expect(boss.expReward).toBeGreaterThan(avgNormalExp);
  });

  it("設定にないエリアではフォールバック名が使われる", () => {
    const boss = generateBoss(8);
    expect(boss.name).toBe("魔王城のボス");
  });

  it("hp と maxHp が一致する", () => {
    const boss = generateBoss(1);
    expect(boss.hp).toBe(boss.maxHp);
  });

  it("presetElement指定時はその属性が使われる", () => {
    const boss = generateBoss(1, "water");
    expect(boss.element).toBe("water");
  });
});
