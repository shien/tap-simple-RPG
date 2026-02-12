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
    droppedWeapon: null,
    isGuarding: false,
    guardCounter: false,
  };
}

/** プレイヤーが攻撃する（タップ時） */
export function playerAttack(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  let damage = calculatePlayerDamage(state.player, state.enemy);

  // ガードカウンター: 敵最大HPの10%を上乗せ
  if (state.guardCounter) {
    const bonus = state.enemy.maxHp / 10n || 1n;
    damage = damage + bonus;
  }

  const newEnemyHp = state.enemy.hp - damage;

  return {
    ...state,
    enemy: {
      ...state.enemy,
      hp: newEnemyHp < 0n ? 0n : newEnemyHp,
    },
    turnCount: state.turnCount + 1,
    guardCounter: false,
  };
}

/** ガードを発動する */
export function activateGuard(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;
  if (state.isGuarding) return state;

  return {
    ...state,
    isGuarding: true,
    guardCounter: false,
  };
}

/** 敵の自動攻撃 */
export function enemyAttack(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  // ガード中 → ダメージ1/10（最低1）→ HP最低1保証 → ガードカウンター発動
  if (state.isGuarding) {
    const reducedDamage = state.enemy.atk / 10n || 1n;
    const newHp = state.player.hp - reducedDamage;
    const clampedHp = newHp < 1n ? 1n : newHp;
    const newPlayer = { ...state.player, hp: clampedHp };
    return {
      ...state,
      player: newPlayer,
      isGuarding: false,
      guardCounter: true,
    };
  }

  // 通常被弾
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
  };

  return {
    ...state,
    player,
    droppedWeapon: generateWeaponDrop(areaId),
  };
}
