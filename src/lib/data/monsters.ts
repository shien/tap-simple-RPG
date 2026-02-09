import type { MonsterConfig } from "../types";

/** モンスター設定データ */
export const MONSTERS: MonsterConfig[] = [
  // === エリア1: 草原 ===
  {
    id: "grass_hound",
    name: "グラスハウンド",
    description: "草原を駆け回る俊敏な牙獣。",
    areaIds: [1],
    element: "earth",
    isBoss: false,
  },
  {
    id: "shard_crow",
    name: "シャードクロウ",
    description:
      "光るものを集める習性を持つ鳥型魔物。黒い羽に都市の鳥の面影がある。",
    areaIds: [1],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "long_tail",
    name: "ロングテイル",
    description: "異様に長い尾でバランスを取る小型魔物。",
    areaIds: [1],
    element: "water",
    isBoss: false,
  },
  {
    id: "graze_beast",
    name: "グレイズビースト",
    description:
      "巨大な体で突進する温厚そうな巨獣。角や体格に家畜だった頃の名残がある。",
    areaIds: [1],
    element: "earth",
    isBoss: true,
  },

  // === エリア2: 山間部 ===
  {
    id: "crag_horn",
    name: "クラッグホーン",
    description: "岩場を跳ね回る角持つ獣。",
    areaIds: [2],
    element: "earth",
    isBoss: false,
  },
  {
    id: "sky_eye",
    name: "スカイアイ",
    description:
      "上空を漂い侵入者を見張る浮遊魔物。金属質の外殻は機械を思わせる。",
    areaIds: [2],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "wanderer",
    name: "ワンダラー",
    description: "ふらふらと山道を歩く人型の影。",
    areaIds: [2],
    element: "water",
    isBoss: false,
  },
  {
    id: "highland_lord",
    name: "ハイランドロード",
    description:
      "山頂を縄張りとする巨大角獣。脚力に山岳動物の特徴を色濃く残している。",
    areaIds: [2],
    element: "thunder",
    isBoss: true,
  },

  // === エリア3: 洞窟 ===
  {
    id: "glow_fang",
    name: "グロウファング",
    description: "体内から淡く光を放つ飛行魔物。",
    areaIds: [3],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "silk_leg",
    name: "シルクレッグ",
    description:
      "粘つく糸で獲物を絡め取る多脚魔物。脚の動きは大型の節足生物を思わせる。",
    areaIds: [3],
    element: "earth",
    isBoss: false,
  },
  {
    id: "digger",
    name: "ディガー",
    description: "一定の間隔で巡回を続ける硬質の魔物。",
    areaIds: [3],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "deep_throw",
    name: "ディープスロウ",
    description:
      "地面を揺らして現れる長大な魔物。口元の形状に土中生物の面影がある。",
    areaIds: [3],
    element: "earth",
    isBoss: true,
  },

  // === エリア4: 呪われた森 ===
  {
    id: "bark_deer",
    name: "バークディア",
    description: "樹皮のような体毛で森に溶け込む。",
    areaIds: [4],
    element: "earth",
    isBoss: false,
  },
  {
    id: "vine_hand",
    name: "バインハンド",
    description: "蔓状の腕で絡みつく植物型魔物。",
    areaIds: [4],
    element: "earth",
    isBoss: false,
  },
  {
    id: "spore_beast",
    name: "スポアビースト",
    description:
      "胞子を撒き散らし視界を奪う。体表に菌類の特徴を色濃く残している。",
    areaIds: [4],
    element: "water",
    isBoss: false,
  },
  {
    id: "green_lord",
    name: "グリーンロード",
    description: "植物が絡み合い一つの巨体を形成した魔物。",
    areaIds: [4],
    element: "earth",
    isBoss: true,
  },

  // === エリア5: 亡者の湿地 ===
  {
    id: "mud_jaw",
    name: "マッドジョー",
    description: "泥中から飛び出す顎持つ魔物。",
    areaIds: [5],
    element: "earth",
    isBoss: false,
  },
  {
    id: "gas_will",
    name: "ガスウィル",
    description: "霧のように漂う半透明の存在。動きが気体の流れを思わせる。",
    areaIds: [5],
    element: "water",
    isBoss: false,
  },
  {
    id: "hollow_guard",
    name: "ホロウガード",
    description: "中身のない外殻だけで動く守護者。",
    areaIds: [5],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "rot_titan",
    name: "ロットタイタン",
    description:
      "腐敗しながらも動き続ける巨体。人型だった頃の名残が全身に残る。",
    areaIds: [5],
    element: "earth",
    isBoss: true,
  },

  // === エリア6: 黒曜の火山 ===
  {
    id: "ash_monkey",
    name: "アッシュモンキー",
    description: "灰をまとい素早く動く小柄な魔物。",
    areaIds: [6],
    element: "earth",
    isBoss: false,
  },
  {
    id: "flare_scale",
    name: "フレアスケイル",
    description: "高熱に耐える鱗を持つ。",
    areaIds: [6],
    element: "water",
    isBoss: false,
  },
  {
    id: "core_worker",
    name: "コアワーカー",
    description:
      "重い足取りで歩き続ける硬質魔物。関節構造が作業機械を思わせる。",
    areaIds: [6],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "lava_eater",
    name: "ラヴァイーター",
    description:
      "溶岩地帯に潜む巨大魔物。体表は耐熱生物の特徴を色濃く残している。",
    areaIds: [6],
    element: "water",
    isBoss: true,
  },

  // === エリア7: 魔界の門前 ===
  {
    id: "failed",
    name: "フェイルド",
    description: "形の定まらない人型魔物。",
    areaIds: [7],
    element: "water",
    isBoss: false,
  },
  {
    id: "mix_beast",
    name: "ミックスビースト",
    description: "複数の生物の特徴が混ざったような姿。",
    areaIds: [7],
    element: "earth",
    isBoss: false,
  },
  {
    id: "gate_keeper",
    name: "ゲートキーパー",
    description:
      "門を守る統率された魔物。各部位に異なる生物の面影がある。",
    areaIds: [7],
    element: "thunder",
    isBoss: true,
  },

  // === エリア8: 魔王城 ===
  {
    id: "echo",
    name: "エコー",
    description: "同じ姿の個体が何度も現れる。",
    areaIds: [8],
    element: "thunder",
    isBoss: false,
  },
  {
    id: "sentry",
    name: "セントリー",
    description:
      "無機質に侵入者を排除する番人。装甲の質感は人工物を思わせる。",
    areaIds: [8],
    element: "water",
    isBoss: false,
  },
  {
    id: "alpha",
    name: "アルファ",
    description:
      "異様に整った完成形の存在。全身に人型生物の特徴を色濃く残している。",
    areaIds: [8],
    element: "earth",
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
