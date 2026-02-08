import type { GameState } from "./types";
import { AREAS } from "./constants";
import { createInitialPlayer, heal, takeDamage, addExp, isDead } from "./player";
import { advanceArea } from "./map";
import { getCurrentEvent } from "./map";
import { generateUpcomingEvents } from "./event";

// === 定数 ===
const REST_HEAL_RATIO = 0.3;
const TRAP_DAMAGE_RATIO = 0.2;
const TREASURE_BASE_EXP = 5n;
const TREASURE_BASE_GOLD = 10n;

/** 新しいゲームを初期化する */
export function createNewGame(): GameState {
  return {
    player: createInitialPlayer(),
    currentArea: 1,
    currentStep: 1,
    upcomingEvents: generateUpcomingEvents(1, 1),
    phase: "exploration",
  };
}

/** 現在マスのイベントを処理する */
export function processEvent(state: GameState): GameState {
  const event = getCurrentEvent(state);

  switch (event) {
    case "battle":
    case "boss":
      return { ...state, phase: "battle" };

    case "rest": {
      const healAmount = BigInt(
        Math.max(1, Math.floor(Number(state.player.maxHp) * REST_HEAL_RATIO))
      );
      return {
        ...state,
        player: heal(state.player, healAmount),
      };
    }

    case "treasure": {
      const area = AREAS[state.currentArea - 1];
      const exp = TREASURE_BASE_EXP * BigInt(Math.floor(area.rewardMultiplier));
      const gold =
        TREASURE_BASE_GOLD * BigInt(Math.floor(area.rewardMultiplier));
      const player = addExp(
        { ...state.player, gold: state.player.gold + gold },
        exp
      );
      return { ...state, player };
    }

    case "trap": {
      const damage = BigInt(
        Math.max(1, Math.floor(Number(state.player.maxHp) * TRAP_DAMAGE_RATIO))
      );
      const player = takeDamage(state.player, damage);
      return {
        ...state,
        player,
        phase: isDead(player) ? "gameover" : state.phase,
      };
    }
  }
}

/** 戦闘勝利後の処理 */
export function handleBattleVictory(state: GameState): GameState {
  if (state.currentStep === 6) {
    return handleBossClear(state);
  }
  return { ...state, phase: "exploration" };
}

/** ボス撃破後の処理 */
export function handleBossClear(state: GameState): GameState {
  if (state.currentArea === 8) {
    return createNewGame();
  }
  return {
    ...advanceArea(state),
    phase: "exploration",
  };
}

/** 死亡時のリスタート処理 */
export function handleDeath(): GameState {
  return createNewGame();
}

/** 魔王城ボス撃破判定 */
export function isGameClear(state: GameState): boolean {
  return state.currentArea === 8 && state.currentStep === 6;
}
