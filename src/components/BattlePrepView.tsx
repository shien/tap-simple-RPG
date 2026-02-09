"use client";

import type { BattleState, GameState, ElementAdvantage } from "@/lib/types";
import { getElementAdvantage, getElementMultiplier } from "@/lib/element";
import { ElementBadge } from "./ElementBadge";
import { HpBar } from "./HpBar";

const ADVANTAGE_DISPLAY: Record<
  ElementAdvantage,
  { label: string; className: string }
> = {
  advantage: { label: "有利!", className: "text-green-400" },
  disadvantage: { label: "不利...", className: "text-red-400" },
  neutral: { label: "同属性", className: "text-zinc-400" },
};

export function BattlePrepView({
  battleState,
  gameState,
  onHeal,
  onStartBattle,
}: {
  battleState: BattleState;
  gameState: GameState;
  onHeal: () => void;
  onStartBattle: () => void;
}) {
  const { player, enemy } = battleState;
  const weaponElement = player.weapon.element;
  const enemyElement = enemy.element;
  const advantage = getElementAdvantage(weaponElement, enemyElement);
  const multiplier = getElementMultiplier(weaponElement, enemyElement);
  const advDisplay = ADVANTAGE_DISPLAY[advantage];
  const canHeal = gameState.healCount > 0;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-xl font-bold text-yellow-400">
        戦闘準備
      </h2>

      {/* 敵情報 */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg font-bold">{enemy.name}</span>
          <ElementBadge element={enemyElement} />
          {enemy.isAbnormal && (
            <span className="rounded bg-red-800 px-2 py-0.5 text-xs font-bold text-red-200">
              異常個体
            </span>
          )}
        </div>
        <HpBar current={enemy.hp} max={enemy.maxHp} label="敵HP" colorClass="bg-red-500" />
      </div>

      {/* 相性情報 */}
      <div className="flex items-center justify-center gap-3 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3">
        <ElementBadge element={weaponElement} />
        <span className="text-zinc-500">vs</span>
        <ElementBadge element={enemyElement} />
        <span className="mx-1 text-zinc-500">→</span>
        <span className={`font-bold ${advDisplay.className}`}>
          {advDisplay.label} x{multiplier}
        </span>
      </div>

      {/* プレイヤーHP */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <HpBar current={player.hp} max={player.maxHp} label="HP" />
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
          <span>Lv.{player.level}</span>
          <span>ATK: {player.atk.toString()}</span>
          <span>武器: {player.weapon.name}</span>
        </div>
      </div>

      {/* 回復ボタン */}
      <button
        onClick={onHeal}
        disabled={!canHeal}
        className={`w-full rounded-lg py-4 text-lg font-bold ${
          canHeal
            ? "bg-green-700 text-white active:bg-green-800"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
      >
        回復 (残り{gameState.healCount}回) — HP 70%回復
      </button>

      {/* 戦闘開始ボタン */}
      <button
        onClick={onStartBattle}
        className="w-full rounded-lg bg-red-600 py-5 text-xl font-bold text-white active:bg-red-700"
      >
        戦闘開始!
      </button>
    </div>
  );
}
