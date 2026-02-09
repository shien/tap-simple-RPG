import { describe, it, expect } from "vitest";
import {
  AREAS,
  ELEMENT_ADVANTAGE_MAP,
  DAMAGE_MULTIPLIER,
  ABNORMAL_TIERS,
  ABNORMAL_EXP_MULTIPLIER,
  EVENT_PROBABILITY_TABLE,
} from "./constants";

describe("AREAS", () => {
  it("8エリア分のデータが存在する", () => {
    expect(AREAS).toHaveLength(8);
  });

  it("エリアIDが1〜8で連番である", () => {
    AREAS.forEach((area, i) => {
      expect(area.id).toBe(i + 1);
    });
  });

  it("全エリアに必須フィールドが定義されている", () => {
    for (const area of AREAS) {
      expect(area.name).toBeTruthy();
      expect(typeof area.enemyLevelOffset).toBe("number");
      expect(typeof area.enemyHpMultiplier).toBe("number");
      expect(typeof area.enemyAtkMultiplier).toBe("number");
      expect(typeof area.rewardMultiplier).toBe("number");
      expect(area.elementDistribution).toHaveProperty("water");
      expect(area.elementDistribution).toHaveProperty("earth");
      expect(area.elementDistribution).toHaveProperty("thunder");
      expect(typeof area.abnormalRate).toBe("number");
      expect(typeof area.bossMultiplier).toBe("number");
      expect(typeof area.individualVariation.min).toBe("number");
      expect(typeof area.individualVariation.max).toBe("number");
    }
  });

  it("属性出現分布の合計が1になる", () => {
    for (const area of AREAS) {
      const { water, earth, thunder } = area.elementDistribution;
      expect(water + earth + thunder).toBeCloseTo(1, 5);
    }
  });

  it("後半エリアほど敵HP倍率が高い", () => {
    for (let i = 1; i < AREAS.length; i++) {
      expect(AREAS[i].enemyHpMultiplier).toBeGreaterThan(
        AREAS[i - 1].enemyHpMultiplier
      );
    }
  });

  it("後半エリアほど個体差の振れ幅が大きい", () => {
    for (let i = 1; i < AREAS.length; i++) {
      const prevRange =
        AREAS[i - 1].individualVariation.max -
        AREAS[i - 1].individualVariation.min;
      const currRange =
        AREAS[i].individualVariation.max - AREAS[i].individualVariation.min;
      expect(currRange).toBeGreaterThan(prevRange);
    }
  });

  it("草原の個体差が0.85〜1.15", () => {
    expect(AREAS[0].individualVariation.min).toBe(0.85);
    expect(AREAS[0].individualVariation.max).toBe(1.15);
  });

  it("魔王城の個体差が0.5〜2.6", () => {
    expect(AREAS[7].individualVariation.min).toBe(0.5);
    expect(AREAS[7].individualVariation.max).toBe(2.6);
  });

  it("草原の異常個体出現率が0.5%", () => {
    expect(AREAS[0].abnormalRate).toBeCloseTo(0.005, 6);
  });

  it("魔王城の異常個体出現率が18%", () => {
    expect(AREAS[7].abnormalRate).toBeCloseTo(0.18, 6);
  });
});

describe("ELEMENT_ADVANTAGE_MAP", () => {
  it("水 > 土（有利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.water.earth).toBe("advantage");
  });

  it("土 > 雷（有利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.earth.thunder).toBe("advantage");
  });

  it("雷 > 水（有利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.thunder.water).toBe("advantage");
  });

  it("水 < 雷（不利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.water.thunder).toBe("disadvantage");
  });

  it("土 < 水（不利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.earth.water).toBe("disadvantage");
  });

  it("雷 < 土（不利）", () => {
    expect(ELEMENT_ADVANTAGE_MAP.thunder.earth).toBe("disadvantage");
  });

  it("同属性はneutral", () => {
    expect(ELEMENT_ADVANTAGE_MAP.water.water).toBe("neutral");
    expect(ELEMENT_ADVANTAGE_MAP.earth.earth).toBe("neutral");
    expect(ELEMENT_ADVANTAGE_MAP.thunder.thunder).toBe("neutral");
  });
});

describe("DAMAGE_MULTIPLIER", () => {
  it("有利は×2", () => {
    expect(DAMAGE_MULTIPLIER.advantage).toBe(2);
  });

  it("不利は×0.1", () => {
    expect(DAMAGE_MULTIPLIER.disadvantage).toBe(0.1);
  });

  it("同属性は×1", () => {
    expect(DAMAGE_MULTIPLIER.neutral).toBe(1);
  });
});

describe("ABNORMAL_TIERS", () => {
  it("4段階のTierが定義されている", () => {
    expect(ABNORMAL_TIERS).toHaveLength(4);
  });

  it("Tier値が正しい", () => {
    expect([...ABNORMAL_TIERS]).toEqual([8, 20, 60, 150]);
  });
});

describe("ABNORMAL_EXP_MULTIPLIER", () => {
  it("異常個体撃破時のEXP倍率が100", () => {
    expect(ABNORMAL_EXP_MULTIPLIER).toBe(100);
  });
});

describe("EVENT_PROBABILITY_TABLE", () => {
  it("8エリア分のテーブルが存在する", () => {
    for (let i = 1; i <= 8; i++) {
      expect(EVENT_PROBABILITY_TABLE[i]).toBeDefined();
    }
  });

  it("各エリアの確率合計が1になる", () => {
    for (let i = 1; i <= 8; i++) {
      const t = EVENT_PROBABILITY_TABLE[i];
      expect(t.battle + t.treasure).toBeCloseTo(1, 5);
    }
  });
});
