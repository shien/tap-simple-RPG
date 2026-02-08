import type { WeaponConfig } from "../types";

/** 武器設定データ（今後追加予定） */
export const WEAPONS: WeaponConfig[] = [
  {
    id: "wooden_sword",
    name: "木の剣",
    description: "枝を削って作った粗末な剣",
    areaIds: [1],
    element: "water",
  },
  {
    id: "stone_axe",
    name: "石の斧",
    description: "石を研いで作った原始的な斧",
    areaIds: [1],
    element: "thunder",
  },
  {
    id: "iron_sword",
    name: "鉄の剣",
    description: "鍛冶屋で打たれた標準的な剣",
    areaIds: [2],
    element: "water",
  },
  {
    id: "earth_staff",
    name: "土の杖",
    description: "大地の力を宿した魔法の杖",
    areaIds: [2, 3],
    element: "earth",
  },
  {
    id: "steel_blade",
    name: "鋼の刃",
    description: "良質な鋼で鍛えられた刃",
    areaIds: [3],
    element: "thunder",
  },
];

/** エリアIDで武器候補を絞り込む */
export function getWeaponsForArea(areaId: number): WeaponConfig[] {
  return WEAPONS.filter(
    (w) => w.areaIds.includes(areaId as WeaponConfig["areaIds"][number])
  );
}
