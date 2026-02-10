import type { GameState, Weapon } from "./types";
import { AREAS, INITIAL_HEAL_COUNT, BATTLE_PREP_HEAL_RATIO, STEPS_PER_AREA } from "./constants";
import { createInitialPlayer, heal } from "./player";
import { advanceArea } from "./map";
import { getCurrentEvent } from "./map";
import { generateAreaEvents, generateUpcomingEvents } from "./event";

/** 宝箱回復アイテムの回復割合（MaxHPの70%） */
const TREASURE_HEAL_RATIO = 0.7;

/** 新しいゲームを初期化する */
export function createNewGame(): GameState {
  const areaEvents = generateAreaEvents(1);
  return {
    player: createInitialPlayer(),
    currentArea: 1,
    currentStep: 1,
    areaEvents,
    upcomingEvents: generateUpcomingEvents(areaEvents, 1),
    phase: "exploration",
    healCount: INITIAL_HEAL_COUNT,
  };
}

/** 現在マスのイベントを処理する */
export function processEvent(state: GameState): GameState {
  const event = getCurrentEvent(state);

  switch (event) {
    case "battle":
    case "boss":
      return { ...state, phase: "battlePrep" };

    case "treasure":
      return { ...state, phase: "treasureSelect" };
  }
}

/** 戦闘準備画面での回復処理 */
export function healInPrep(state: GameState): GameState {
  if (state.healCount <= 0) return state;
  const healAmount = BigInt(
    Math.max(1, Math.floor(Number(state.player.maxHp) * BATTLE_PREP_HEAL_RATIO))
  );
  return {
    ...state,
    player: heal(state.player, healAmount),
    healCount: state.healCount - 1,
  };
}

/** 戦闘準備から戦闘開始への遷移 */
export function startBattle(state: GameState): GameState {
  if (state.phase !== "battlePrep") return state;
  return { ...state, phase: "battle" };
}

/** 宝箱で回復アイテムを選択した場合の処理 */
export function processTreasureHeal(state: GameState): GameState {
  if (state.phase !== "treasureSelect") return state;
  const healAmount = BigInt(
    Math.max(1, Math.floor(Number(state.player.maxHp) * TREASURE_HEAL_RATIO))
  );
  return {
    ...state,
    player: heal(state.player, healAmount),
    phase: "exploration",
  };
}

/** 宝箱で武器を選択した場合の処理 */
export function processTreasureWeapon(state: GameState, weapon: Weapon): GameState {
  if (state.phase !== "treasureSelect") return state;
  return {
    ...state,
    player: { ...state.player, weapon },
    phase: "exploration",
  };
}

/** 戦闘勝利後の処理 */
export function handleBattleVictory(state: GameState): GameState {
  if (state.currentStep === STEPS_PER_AREA) {
    return handleBossClear(state);
  }
  return { ...state, phase: "exploration" };
}

/** ボス撃破後の処理 */
export function handleBossClear(state: GameState): GameState {
  if (state.currentArea === 8) {
    return { ...state, phase: "gameClear" };
  }
  return {
    ...advanceArea(state),
    phase: "areaMove",
    healCount: state.healCount + 1,
  };
}

/** エリア移動画面から探索へ遷移 */
export function confirmAreaMove(state: GameState): GameState {
  if (state.phase !== "areaMove") return state;
  return { ...state, phase: "exploration" };
}

/** 死亡時のリスタート処理 */
export function handleDeath(): GameState {
  return createNewGame();
}

/** 魔王城ボス撃破判定 */
export function isGameClear(state: GameState): boolean {
  return state.currentArea === 8 && state.currentStep === STEPS_PER_AREA;
}
