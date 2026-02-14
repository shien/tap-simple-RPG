import type { AreaId, BattleState, Element, Enemy, Player } from "./types";
import { calculatePlayerDamage } from "./damage";
import { takeDamage, addExp, heal } from "./player";
import { generateWeaponDrop } from "./weapon";
import { ABNORMAL_EXP_MULTIPLIER, HEAL_ITEM_RATIO } from "./constants";
import { removeItem } from "./item";

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
    perfectGuard: false,
    originalWeaponElement: null,
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

  // 完全防御（古びた鋼鉄の盾）→ ダメージ0 → ガードカウンター発動
  if (state.perfectGuard) {
    return {
      ...state,
      perfectGuard: false,
      isGuarding: false,
      guardCounter: true,
    };
  }

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

/** 属性変更アイテム使用（武器の塗料） */
export function useElementChangeItem(state: BattleState, element: Element): BattleState {
  if (state.result !== "ongoing") return state;

  const originalElement = state.originalWeaponElement ?? state.player.weapon.element;
  return {
    ...state,
    player: {
      ...state.player,
      weapon: { ...state.player.weapon, element },
      items: removeItem(state.player.items, "elementChange"),
    },
    originalWeaponElement: originalElement,
  };
}

/** 完全防御アイテム使用（古びた鋼鉄の盾） */
export function usePerfectGuardItem(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  return {
    ...state,
    player: {
      ...state.player,
      items: removeItem(state.player.items, "perfectGuard"),
    },
    perfectGuard: true,
  };
}

/** 回復アイテム使用（回復の薬） */
export function useHealItem(state: BattleState): BattleState {
  if (state.result !== "ongoing") return state;

  const healAmount = BigInt(
    Math.max(1, Math.floor(Number(state.player.maxHp) * HEAL_ITEM_RATIO))
  );
  return {
    ...state,
    player: {
      ...heal(state.player, healAmount),
      items: removeItem(state.player.items, "heal40"),
    },
  };
}

/** 戦闘終了時に武器属性を元に戻す */
export function restoreWeaponElement(state: BattleState): BattleState {
  if (!state.originalWeaponElement) return state;

  return {
    ...state,
    player: {
      ...state.player,
      weapon: { ...state.player.weapon, element: state.originalWeaponElement },
    },
    originalWeaponElement: null,
  };
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

  // 武器属性を復元してから報酬処理
  const restored = restoreWeaponElement({ ...state, player });

  return {
    ...restored,
    droppedWeapon: generateWeaponDrop(areaId),
  };
}
