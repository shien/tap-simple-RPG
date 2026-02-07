import type { AreaId, Element, Weapon } from "./types";
import { AREAS } from "./constants";

const ELEMENTS: Element[] = ["fire", "ice", "thunder"];

/** エリアごとの武器名候補 */
const WEAPON_NAMES: Record<AreaId, string[]> = {
  1: ["木の剣", "石の斧"],
  2: ["鉄の剣", "戦斧"],
  3: ["鋼の剣", "つるはし"],
  4: ["呪剣", "妖刀"],
  5: ["怨嗟の刃", "骸骨の杖"],
  6: ["溶岩の剣", "炎の槍"],
  7: ["魔剣", "闇の大鎌"],
  8: ["聖剣", "伝説の杖"],
};

/** 敵撃破時にドロップする武器を生成する */
export function generateWeaponDrop(areaId: AreaId): Weapon {
  const area = AREAS[areaId - 1];
  const names = WEAPON_NAMES[areaId];
  const name = names[Math.floor(Math.random() * names.length)];
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  const attackBonus = BigInt(
    Math.floor(area.rewardMultiplier * 5 * (0.8 + Math.random() * 0.4))
  );

  return { name, element, attackBonus };
}

/** 武器名テーブルを公開（テスト用） */
export { WEAPON_NAMES };
