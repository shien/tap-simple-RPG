import type { AreaConfig, AreaId, Element, Enemy } from "./types";
import { AREAS, ABNORMAL_TIERS } from "./constants";
import { getMonstersForArea, getBossForArea } from "./data/monsters";

const BASE_HP = 30n;
const BASE_ATK = 5n;
const BASE_EXP = 8n;
const BASE_GOLD = 3n;

const ELEMENTS: Element[] = ["water", "earth", "thunder"];
const ABNORMAL_TIER_WEIGHTS = [25, 30, 25, 20];

/** エリアのelementDistributionに従ってランダム属性を選ぶ */
function rollElement(distribution: Record<Element, number>): Element {
  const r = Math.random();
  let cumulative = 0;
  for (const el of ELEMENTS) {
    cumulative += distribution[el];
    if (r < cumulative) return el;
  }
  return ELEMENTS[ELEMENTS.length - 1];
}

/** 通常個体の個体補正を算出する（弱め寄り分布） */
export function rollIndividualVariation(areaConfig: AreaConfig): number {
  const { min, max } = areaConfig.individualVariation;
  const r = Math.random();
  return min + (max - min) * r * r;
}

/** 異常個体の判定と倍率Tier決定 */
export function rollAbnormal(
  areaConfig: AreaConfig
): { isAbnormal: boolean; tier: number | null } {
  if (Math.random() >= areaConfig.abnormalRate) {
    return { isAbnormal: false, tier: null };
  }

  // 重み付き抽選
  const totalWeight = ABNORMAL_TIER_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalWeight;
  for (let i = 0; i < ABNORMAL_TIERS.length; i++) {
    r -= ABNORMAL_TIER_WEIGHTS[i];
    if (r <= 0) {
      return { isAbnormal: true, tier: ABNORMAL_TIERS[i] };
    }
  }
  return { isAbnormal: true, tier: ABNORMAL_TIERS[0] };
}

/** number倍率をbigintに適用する */
function applyMultiplier(base: bigint, multiplier: number): bigint {
  const result = BigInt(Math.max(1, Math.floor(Number(base) * multiplier)));
  return result < 1n ? 1n : result;
}

/** エリア設定に基づいて通常敵を生成する */
export function generateEnemy(areaId: AreaId, presetElement?: Element): Enemy {
  const area = AREAS[areaId - 1];
  const candidates = getMonstersForArea(areaId);

  let name: string;
  let element: Element;

  if (presetElement) {
    // 事前生成済み属性が指定されている場合はそれを使用
    element = presetElement;
    const samElementCandidates = candidates.filter((c) => c.element === presetElement);
    if (samElementCandidates.length > 0) {
      name = samElementCandidates[Math.floor(Math.random() * samElementCandidates.length)].name;
    } else if (candidates.length > 0) {
      name = candidates[Math.floor(Math.random() * candidates.length)].name;
    } else {
      name = "モンスター";
    }
  } else if (candidates.length > 0) {
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    name = picked.name;
    element = picked.element;
  } else {
    name = "モンスター";
    element = rollElement(area.elementDistribution);
  }

  const variation = rollIndividualVariation(area);
  const { isAbnormal, tier } = rollAbnormal(area);
  const abnormalMul = isAbnormal && tier ? tier : 1;

  const hp = applyMultiplier(
    BASE_HP,
    area.enemyHpMultiplier * variation * abnormalMul
  );
  const atk = applyMultiplier(
    BASE_ATK,
    area.enemyAtkMultiplier * variation
  );
  const expReward = applyMultiplier(
    BASE_EXP,
    area.rewardMultiplier * variation
  );
  const goldReward = applyMultiplier(
    BASE_GOLD,
    area.rewardMultiplier * variation
  );

  return {
    name,
    element,
    hp,
    maxHp: hp,
    atk,
    expReward,
    goldReward,
    isAbnormal,
    abnormalTier: tier,
  };
}

/** ボス敵を生成する */
export function generateBoss(areaId: AreaId, presetElement?: Element): Enemy {
  const area = AREAS[areaId - 1];
  const bossConfig = getBossForArea(areaId);

  const name = bossConfig ? bossConfig.name : `${area.name}のボス`;
  const element = presetElement
    ? presetElement
    : bossConfig
      ? bossConfig.element
      : rollElement(area.elementDistribution);

  const hp = applyMultiplier(
    BASE_HP,
    area.enemyHpMultiplier * area.bossMultiplier
  );
  const atk = applyMultiplier(
    BASE_ATK,
    area.enemyAtkMultiplier * area.bossMultiplier
  );
  const expReward = applyMultiplier(
    BASE_EXP,
    area.rewardMultiplier * area.bossMultiplier
  );
  const goldReward = applyMultiplier(
    BASE_GOLD,
    area.rewardMultiplier * area.bossMultiplier
  );

  return {
    name,
    element,
    hp,
    maxHp: hp,
    atk,
    expReward,
    goldReward,
    isAbnormal: false,
    abnormalTier: null,
  };
}
