import type { Element, Player } from "./types";

const ELEMENTS: Element[] = ["fire", "ice", "thunder"];

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

/** 次のレベルに必要な累計EXPを返す */
export function getRequiredExp(level: number): bigint {
  const base = 10n * BigInt(level) * BigInt(level);
  if (level <= 10) {
    return base;
  }
  // 中盤以降: 指数要素追加
  return base + (1n << BigInt(level - 10));
}

/** レベル帯に応じた成長量を返す */
function getGrowth(level: number): { hp: bigint; atk: bigint } {
  if (level <= 10) return { hp: 8n, atk: 3n };
  if (level <= 25) return { hp: 20n, atk: 8n };
  if (level <= 50) return { hp: 60n, atk: 25n };
  return { hp: 200n, atk: 80n };
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
