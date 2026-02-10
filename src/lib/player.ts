import type { Element, Player } from "./types";

const ELEMENTS: Element[] = ["water", "earth", "thunder"];

/** 初期プレイヤーを生成する */
export function createInitialPlayer(): Player {
  const element = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
  return {
    level: 1,
    exp: 0n,
    hp: 50n,
    maxHp: 50n,
    atk: 10n,
    gold: 0n,
    weapon: {
      name: "棒",
      element,
      attackBonus: 0n,
    },
  };
}

/** 次のレベルに必要な累計EXPを返す（二次関数） */
export function getRequiredExp(level: number): bigint {
  return 10n * BigInt(level) * BigInt(level);
}

/** レベル帯に応じた成長量を返す（桁インフレ設計） */
function getGrowth(level: number): { hp: bigint; atk: bigint } {
  if (level <= 10) return { hp: 12n, atk: 5n };
  if (level <= 20) return { hp: 60n, atk: 25n };
  if (level <= 35) return { hp: 350n, atk: 150n };
  if (level <= 50) return { hp: 2500n, atk: 1000n };
  if (level <= 70) return { hp: 20000n, atk: 8000n };
  return { hp: 200000n, atk: 80000n };
}

/** 1回分のレベルアップを適用する（イミュータブル） */
export function levelUp(player: Player): Player {
  const growth = getGrowth(player.level);
  return {
    ...player,
    level: player.level + 1,
    maxHp: player.maxHp + growth.hp,
    hp: player.hp + growth.hp,
    atk: player.atk + growth.atk,
  };
}

/** 経験値を加算し、必要に応じて複数回レベルアップする */
export function addExp(player: Player, exp: bigint): Player {
  let p = { ...player, exp: player.exp + exp };
  while (p.exp >= getRequiredExp(p.level)) {
    p = levelUp(p);
  }
  return p;
}

/** HP回復（MaxHPを超えない） */
export function heal(player: Player, amount: bigint): Player {
  const newHp = player.hp + amount;
  return {
    ...player,
    hp: newHp > player.maxHp ? player.maxHp : newHp,
  };
}

/** ダメージ適用（HP0未満にならない） */
export function takeDamage(player: Player, damage: bigint): Player {
  const newHp = player.hp - damage;
  return {
    ...player,
    hp: newHp < 0n ? 0n : newHp,
  };
}

/** 死亡判定 */
export function isDead(player: Player): boolean {
  return player.hp <= 0n;
}
