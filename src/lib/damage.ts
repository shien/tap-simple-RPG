import type { Player, Enemy } from "./types";
import { getElementMultiplier } from "./element";

/** プレイヤー→敵へのダメージを計算する（最低1保証） */
export function calculatePlayerDamage(player: Player, enemy: Enemy): bigint {
  const baseDamage = player.atk + player.weapon.attackBonus;
  const multiplier = getElementMultiplier(player.weapon.element, enemy.element);

  let damage: bigint;
  if (multiplier >= 1) {
    damage = baseDamage * BigInt(multiplier);
  } else {
    // 0.1 → baseDamage / 10
    const divisor = BigInt(Math.round(1 / multiplier));
    damage = baseDamage / divisor;
  }

  return damage < 1n ? 1n : damage;
}
