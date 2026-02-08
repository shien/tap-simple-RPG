import type { MonsterConfig } from "../types";

/** モンスター設定データ（今後追加予定） */
export const MONSTERS: MonsterConfig[] = [
  {
    id: "slime",
    name: "スライム",
    description: "草原に生息する青い軟体生物",
    areaIds: [1],
    element: "earth",
    isBoss: false,
  },
  {
    id: "goblin",
    name: "ゴブリン",
    description: "粗末な武器を振り回す小鬼",
    areaIds: [1, 2],
    element: "water",
    isBoss: false,
  },
  {
    id: "golem",
    name: "ゴーレム",
    description: "岩石で構成された魔法人形",
    areaIds: [2, 3],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "dragon_pup",
    name: "ドラゴンパピー",
    description: "まだ幼い火竜の子供",
    areaIds: [3, 4],
    element: "water",
    isBoss: false,
  },
  {
    id: "grassland_king",
    name: "草原の王",
    description: "草原エリアを支配する巨大な獣王",
    areaIds: [1],
    element: "thunder",
    isBoss: true,
  },
];

/** エリアIDで通常モンスターを絞り込む */
export function getMonstersForArea(areaId: number): MonsterConfig[] {
  return MONSTERS.filter(
    (m) => !m.isBoss && m.areaIds.includes(areaId as MonsterConfig["areaIds"][number])
  );
}

/** エリアIDでボスモンスターを絞り込む */
export function getBossForArea(areaId: number): MonsterConfig | undefined {
  return MONSTERS.find(
    (m) => m.isBoss && m.areaIds.includes(areaId as MonsterConfig["areaIds"][number])
  );
}
