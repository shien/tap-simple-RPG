// === 属性 ===
export type Element = "water" | "thunder" | "earth";

// === 属性相性 ===
export type ElementAdvantage = "advantage" | "disadvantage" | "neutral";

// === 武器 ===
export type Weapon = {
  name: string;
  element: Element;
  attackBonus: bigint;
};

// === プレイヤー ===
export type Player = {
  level: number;
  exp: bigint;
  hp: bigint;
  maxHp: bigint;
  atk: bigint;
  gold: bigint;
  weapon: Weapon;
};

// === 敵 ===
export type Enemy = {
  name: string;
  imageUrl?: string;
  element: Element;
  hp: bigint;
  maxHp: bigint;
  atk: bigint;
  expReward: bigint;
  goldReward: bigint;
  isAbnormal: boolean;
  abnormalTier: number | null;
};

// === イベント種別 ===
export type EventType = "battle" | "treasure" | "boss";

// === エリアID ===
export type AreaId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// === エリア設定 ===
export type AreaConfig = {
  id: AreaId;
  name: string;
  enemyLevelOffset: number;
  enemyHpMultiplier: number;
  enemyAtkMultiplier: number;
  rewardMultiplier: number;
  elementDistribution: Record<Element, number>;
  abnormalRate: number;
  bossMultiplier: number;
  individualVariation: { min: number; max: number };
};

// === モンスター設定 ===
export type MonsterConfig = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  areaIds: AreaId[];
  element: Element;
  isBoss: boolean;
};

// === 武器設定 ===
export type WeaponConfig = {
  id: string;
  name: string;
  description: string;
  areaIds: AreaId[];
  element: Element;
};

// === 戦闘結果 ===
export type BattleResult = "ongoing" | "victory" | "defeat";

// === 戦闘状態 ===
export type BattleState = {
  player: Player;
  enemy: Enemy;
  result: BattleResult;
  turnCount: number;
  droppedWeapon: Weapon | null;
  isGuarding: boolean;
  guardCounter: boolean;
};

// === 先読みイベント ===
export type UpcomingEvent = {
  type: EventType;
  enemyElement?: Element;
};

// === ゲーム状態 ===
export type GameState = {
  player: Player;
  currentArea: AreaId;
  currentStep: number; // 1〜8
  areaEvents: UpcomingEvent[]; // エリア内のstep1〜8の事前生成イベント列
  upcomingEvents: UpcomingEvent[];
  phase: "exploration" | "battlePrep" | "battle" | "event" | "treasureSelect" | "areaMove" | "gameover" | "gameClear";
  healCount: number; // 回復残回数（初期3、ボス撃破で+1）
};
