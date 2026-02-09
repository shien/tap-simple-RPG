import type { WeaponConfig } from "../types";

/** 武器設定データ */
export const WEAPONS: WeaponConfig[] = [
  // === エリア1: 草原 ===
  {
    id: "decayed_stick",
    name: "朽ちた棒",
    description: "ただの木の棒。手に馴染む長さ。",
    areaIds: [1],
    element: "water",
  },
  {
    id: "traveler_dagger",
    name: "旅人の短剣",
    description: "軽く扱いやすい刃物。金属部分に日用品だった頃の面影がある。",
    areaIds: [1],
    element: "thunder",
  },
  {
    id: "apprentice_spear",
    name: "見習いの槍",
    description: "簡素だが間合いを取りやすい。",
    areaIds: [1],
    element: "earth",
  },
  {
    id: "wind_bow",
    name: "風切りの弓",
    description: "軽量で素早く射られる。",
    areaIds: [1],
    element: "water",
  },
  // === エリア2: 山間部 ===
  {
    id: "chipped_sword",
    name: "欠けた直剣",
    description: "刃こぼれしているがまだ使える。",
    areaIds: [2],
    element: "thunder",
  },
  {
    id: "iron_band_staff",
    name: "鉄帯の棍",
    description: "均等な重みを持つ打撃武器。握りの加工が工具を思わせる。",
    areaIds: [2],
    element: "earth",
  },
  {
    id: "hunter_axe",
    name: "猟師の斧",
    description: "木を割るのにも戦うのにも使える。",
    areaIds: [2],
    element: "water",
  },
  {
    id: "old_longsword",
    name: "古びた長剣",
    description: "長く使い込まれた標準的な剣。",
    areaIds: [2],
    element: "thunder",
  },
  // === エリア3: 洞窟 ===
  {
    id: "trident_spear",
    name: "三又の槍",
    description: "穂先が三方向に分かれている。",
    areaIds: [3],
    element: "earth",
  },
  {
    id: "flexible_whip",
    name: "しなる鞭",
    description: "扱いは難しいが間合いが広い。",
    areaIds: [3],
    element: "water",
  },
  {
    id: "heavy_greatsword",
    name: "重鉄の大剣",
    description: "力任せに振るう大型武器。",
    areaIds: [3],
    element: "thunder",
  },
  {
    id: "bone_carver",
    name: "骨削りの刃",
    description: "荒削りな刃物。加工跡が工具のようだ。",
    areaIds: [3],
    element: "earth",
  },
  // === エリア4: 呪われた森 ===
  {
    id: "pilgrim_staff",
    name: "巡礼者の杖",
    description: "支えにも武器にもなる。",
    areaIds: [4],
    element: "water",
  },
  {
    id: "curved_blade",
    name: "曲刃の刀",
    description: "湾曲した刃が特徴。",
    areaIds: [4],
    element: "thunder",
  },
  {
    id: "leather_sling",
    name: "硬革のスリング",
    description: "石を飛ばす投射具。",
    areaIds: [4],
    element: "earth",
  },
  {
    id: "twin_fang_dagger",
    name: "双牙の短剣",
    description: "左右対の刃を持つ。形状に調理器具の面影がある。",
    areaIds: [4],
    element: "water",
  },
  // === エリア5: 亡者の湿地 ===
  {
    id: "warrior_hammer",
    name: "戦士のハンマー",
    description: "重量で叩き潰す武器。",
    areaIds: [5],
    element: "thunder",
  },
  {
    id: "long_scythe",
    name: "長柄の鎌",
    description: "大きく弧を描く刃を持つ。",
    areaIds: [5],
    element: "earth",
  },
  {
    id: "iron_nunchaku",
    name: "鉄節のヌンチャク",
    description: "連結部が異様に頑丈。",
    areaIds: [5],
    element: "water",
  },
  {
    id: "bone_crusher_mace",
    name: "砕骨のメイス",
    description: "打撃に特化した棍棒。",
    areaIds: [5],
    element: "thunder",
  },
  // === エリア6: 黒曜の火山 ===
  {
    id: "hidden_blade_cane",
    name: "仕込み杖",
    description: "一見ただの杖に見える。",
    areaIds: [6],
    element: "earth",
  },
  {
    id: "black_iron_javelin",
    name: "黒鉄の投槍",
    description: "遠距離にも対応する。",
    areaIds: [6],
    element: "thunder",
  },
  {
    id: "crescent_ring",
    name: "円月輪",
    description: "輪状の刃を投げて使う。加工精度が工業製品を思わせる。",
    areaIds: [6],
    element: "water",
  },
  {
    id: "heavy_machete",
    name: "大鉈",
    description: "分厚い刃を持つ重量武器。",
    areaIds: [6],
    element: "earth",
  },
  // === エリア7: 魔界の門前 ===
  {
    id: "ancient_crossbow",
    name: "古代式の弩",
    description: "機構で矢を放つ武器。",
    areaIds: [7],
    element: "thunder",
  },
  {
    id: "heavy_flail",
    name: "重連フレイル",
    description: "鎖で繋がれた打撃武器。連結部の構造が機械的だ。",
    areaIds: [7],
    element: "water",
  },
  {
    id: "steel_garrote",
    name: "鋼糸のガロット",
    description: "細い線で締め上げる武器。",
    areaIds: [7],
    element: "earth",
  },
  // === エリア8: 魔王城 ===
  {
    id: "siege_halberd",
    name: "破城の斧槍",
    description: "貫通力に優れる大型武器。",
    areaIds: [8],
    element: "thunder",
  },
  {
    id: "royal_ceremonial_sword",
    name: "王城の儀剣",
    description: "装飾的だが切れ味は鋭い。",
    areaIds: [8],
    element: "water",
  },
  {
    id: "primordial_blade",
    name: "原初の刃",
    description: "異様に整った形状の武器。素材に人工物だった頃の名残がある。",
    areaIds: [8],
    element: "earth",
  },
];

/** エリアIDで武器候補を絞り込む */
export function getWeaponsForArea(areaId: number): WeaponConfig[] {
  return WEAPONS.filter(
    (w) => w.areaIds.includes(areaId as WeaponConfig["areaIds"][number])
  );
}
