import type { AreaId, Element, Weapon } from "./types";
import { AREAS } from "./constants";
import { getWeaponsForArea } from "./data/weapons";

const ELEMENTS: Element[] = ["water", "earth", "thunder"];

/** 敵撃破時にドロップする武器を生成する */
export function generateWeaponDrop(areaId: AreaId): Weapon {
  const area = AREAS[areaId - 1];
  const candidates = getWeaponsForArea(areaId);

  let name: string;
  let element: Element;

  if (candidates.length > 0) {
    // 設定ファイルから候補を選択
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    name = picked.name;
    element = picked.element;
  } else {
    // 設定にないエリアはフォールバック
    name = "謎の武器";
    element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  }

  const attackBonus = BigInt(
    Math.floor(area.rewardMultiplier * 5 * (0.8 + Math.random() * 0.4))
  );

  return { name, element, attackBonus };
}
