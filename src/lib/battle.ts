import type { AreaId, BattleState, Enemy, Player } from "./types";
import { calculatePlayerDamage } from "./damage";
import { takeDamage, addExp } from "./player";
import { generateWeaponDrop } from "./weapon";
import { ABNORMAL_EXP_MULTIPLIER } from "./constants";

/** 戦闘開始時の状態を生成する */
export function createBattleState(player: Player, enemy: Enemy): BattleState {
  return {
    player,
    enemy,
    result: "ongoing",
    turnCount: 0,
  };
}

/** プレイヤーが攻撃する（タップ時） */
export function playerAttack(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  const damage = calculatePlayerDamage(state.player, state.enemy);
  const newEnemyHp = state.enemy.hp - damage;

  return {
    ...state,
    enemy: {
      ...state.enemy,
      hp: newEnemyHp < 0n ? 0n : newEnemyHp,
    },
    turnCount: state.turnCount + 1,
  };
}

/** 敵の自動攻撃 */
export function enemyAttack(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  const newPlayer = takeDamage(state.player, state.enemy.atk);

  return {
    ...state,
    player: newPlayer,
  };
}

/** 戦闘結果を判定する（プレイヤー死亡優先） */
export function checkBattleResult(state: BattleState): BattleState {
  if (state.player.hp <= 0n) {
    return { ...state, result: "defeat" };
  }
  if (state.enemy.hp <= 0n) {
    return { ...state, result: "victory" };
  }
  return { ...state, result: "ongoing" };
}

/** 勝利時の報酬を処理する */
export function processBattleRewards(
  state: BattleState,
  areaId: AreaId
): BattleState {
  if (state.result !== "victory") return state;

  const expMultiplier = state.enemy.isAbnormal
    ? BigInt(ABNORMAL_EXP_MULTIPLIER)
    : 1n;
  const exp = state.enemy.expReward * expMultiplier;

  let player = addExp(state.player, exp);
  player = {
    ...player,
    gold: player.gold + state.enemy.goldReward,
    weapon: generateWeaponDrop(areaId),
  };

  return {
    ...state,
    player,
  };
}
