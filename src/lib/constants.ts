import type { AreaConfig, Element, ElementAdvantage } from "./types";

// === 属性相性マップ ===
// key: 攻撃側属性, value: { 防御側属性: 相性 }
export const ELEMENT_ADVANTAGE_MAP: Record<
  Element,
  Record<Element, ElementAdvantage>
> = {
  water: { water: "neutral", earth: "advantage", thunder: "disadvantage" },
  earth: { earth: "neutral", thunder: "advantage", water: "disadvantage" },
  thunder: { thunder: "neutral", water: "advantage", earth: "disadvantage" },
};

// === ダメージ倍率 ===
export const DAMAGE_MULTIPLIER: Record<ElementAdvantage, number> = {
  advantage: 2,
  disadvantage: 0.1,
  neutral: 1,
};

// === 異常個体 倍率Tier ===
export const ABNORMAL_TIERS = [8, 20, 60, 150] as const;

// === 異常個体 HP倍率（通常個体より少し高い程度） ===
export const ABNORMAL_HP_MULTIPLIERS: Record<number, number> = {
  8: 1.2,
  20: 1.5,
  60: 1.8,
  150: 2.0,
};

// === 異常個体 撃破時EXP倍率 ===
export const ABNORMAL_EXP_MULTIPLIER = 100;

// === エリアデータ（8エリア） ===
// エリアごとに一定量ずつスケール（線形設計）
export const AREAS: readonly AreaConfig[] = [
  {
    id: 1,
    name: "草原",
    enemyLevelOffset: 0,
    enemyHpMultiplier: 1,
    enemyAtkMultiplier: 1,
    rewardMultiplier: 2,
    elementDistribution: { water: 0.33, earth: 0.33, thunder: 0.34 },
    abnormalRate: 0.055,
    bossMultiplier: 2,
    individualVariation: { min: 0.85, max: 1.15 },
  },
  {
    id: 2,
    name: "山間部",
    enemyLevelOffset: 5,
    enemyHpMultiplier: 3,
    enemyAtkMultiplier: 3,
    rewardMultiplier: 4,
    elementDistribution: { water: 0.3, earth: 0.3, thunder: 0.4 },
    abnormalRate: 0.08,
    bossMultiplier: 2.5,
    individualVariation: { min: 0.8, max: 1.3 },
  },
  {
    id: 3,
    name: "洞窟",
    enemyLevelOffset: 10,
    enemyHpMultiplier: 5,
    enemyAtkMultiplier: 5,
    rewardMultiplier: 6,
    elementDistribution: { water: 0.2, earth: 0.2, thunder: 0.6 },
    abnormalRate: 0.105,
    bossMultiplier: 3,
    individualVariation: { min: 0.75, max: 1.5 },
  },
  {
    id: 4,
    name: "呪われた森",
    enemyLevelOffset: 15,
    enemyHpMultiplier: 7,
    enemyAtkMultiplier: 7,
    rewardMultiplier: 8,
    elementDistribution: { water: 0.2, earth: 0.5, thunder: 0.3 },
    abnormalRate: 0.13,
    bossMultiplier: 3.5,
    individualVariation: { min: 0.7, max: 1.7 },
  },
  {
    id: 5,
    name: "亡者の湿地",
    enemyLevelOffset: 20,
    enemyHpMultiplier: 9,
    enemyAtkMultiplier: 9,
    rewardMultiplier: 10,
    elementDistribution: { water: 0.15, earth: 0.55, thunder: 0.3 },
    abnormalRate: 0.155,
    bossMultiplier: 4,
    individualVariation: { min: 0.65, max: 1.9 },
  },
  {
    id: 6,
    name: "黒曜の火山",
    enemyLevelOffset: 25,
    enemyHpMultiplier: 11,
    enemyAtkMultiplier: 11,
    rewardMultiplier: 12,
    elementDistribution: { water: 0.6, earth: 0.15, thunder: 0.25 },
    abnormalRate: 0.18,
    bossMultiplier: 4.5,
    individualVariation: { min: 0.6, max: 2.1 },
  },
  {
    id: 7,
    name: "魔界の門前",
    enemyLevelOffset: 30,
    enemyHpMultiplier: 13,
    enemyAtkMultiplier: 13,
    rewardMultiplier: 14,
    elementDistribution: { water: 0.35, earth: 0.35, thunder: 0.3 },
    abnormalRate: 0.205,
    bossMultiplier: 5,
    individualVariation: { min: 0.55, max: 2.3 },
  },
  {
    id: 8,
    name: "魔王城",
    enemyLevelOffset: 35,
    enemyHpMultiplier: 15,
    enemyAtkMultiplier: 15,
    rewardMultiplier: 16,
    elementDistribution: { water: 0.33, earth: 0.33, thunder: 0.34 },
    abnormalRate: 0.23,
    bossMultiplier: 5.5,
    individualVariation: { min: 0.5, max: 2.6 },
  },
] as const;

// === エリア内マス数 ===
export const STEPS_PER_AREA = 8;

// === 回復システム ===
export const INITIAL_HEAL_COUNT = 3;
export const BATTLE_PREP_HEAL_RATIO = 0.7;

// === イベント確率テーブル（エリアごと） ===
// battle / treasure の出現割合（最終マスのbossは別処理）
export const EVENT_PROBABILITY_TABLE: Record<
  number,
  { battle: number; treasure: number }
> = {
  1: { battle: 0.80, treasure: 0.20 },
  2: { battle: 0.80, treasure: 0.20 },
  3: { battle: 0.80, treasure: 0.20 },
  4: { battle: 0.80, treasure: 0.20 },
  5: { battle: 0.85, treasure: 0.15 },
  6: { battle: 0.85, treasure: 0.15 },
  7: { battle: 0.85, treasure: 0.15 },
  8: { battle: 0.85, treasure: 0.15 },
};
