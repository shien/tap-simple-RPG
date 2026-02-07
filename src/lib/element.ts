import type { Element, ElementAdvantage } from "./types";
import { ELEMENT_ADVANTAGE_MAP, DAMAGE_MULTIPLIER } from "./constants";

/** 属性相性を判定する */
export function getElementAdvantage(
  attacker: Element,
  defender: Element
): ElementAdvantage {
  return ELEMENT_ADVANTAGE_MAP[attacker][defender];
}

/** 属性相性に応じたダメージ倍率を返す */
export function getElementMultiplier(
  attacker: Element,
  defender: Element
): number {
  const advantage = getElementAdvantage(attacker, defender);
  return DAMAGE_MULTIPLIER[advantage];
}
