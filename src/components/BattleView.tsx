"use client";

import { useEffect, useRef } from "react";
import type { BattleState, GameState, ElementAdvantage } from "@/lib/types";
import { getElementAdvantage, getElementMultiplier } from "@/lib/element";
import { ElementBadge } from "./ElementBadge";
import { HpBar } from "./HpBar";
import { BattleResultView } from "./BattleResultView";

const ENEMY_ATTACK_INTERVAL = 1500;

const ADVANTAGE_DISPLAY: Record<
  ElementAdvantage,
  { label: string; className: string }
> = {
  advantage: { label: "有利!", className: "text-green-400" },
  disadvantage: { label: "不利...", className: "text-red-400" },
  neutral: { label: "同属性", className: "text-zinc-400" },
};

export function BattleView({
  battleState,
  gameState,
  onAttack,
  onEnemyAttack,
  onEndBattle,
}: {
  battleState: BattleState;
  gameState: GameState;
  onAttack: () => void;
  onEnemyAttack: () => void;
  onEndBattle: () => void;
}) {
  const { player, enemy, result } = battleState;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 敵の自動攻撃
  useEffect(() => {
    if (result !== "ongoing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      onEnemyAttack();
    }, ENEMY_ATTACK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [result, onEnemyAttack]);

  // 戦闘終了 → 結果表示
  if (result !== "ongoing") {
    return (
      <BattleResultView battleState={battleState} onContinue={onEndBattle} />
    );
  }

  // 相性情報
  const weaponElement = player.weapon.element;
  const enemyElement = enemy.element;
  const advantage = getElementAdvantage(weaponElement, enemyElement);
  const multiplier = getElementMultiplier(weaponElement, enemyElement);
  const advDisplay = ADVANTAGE_DISPLAY[advantage];

  return (
    <div className="flex flex-col gap-4">
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

        {enemy.isAbnormal && (
          <p className="mb-2 text-sm text-red-400">
            撃破時 EXP x100
          </p>
        )}

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

      {/* 攻撃ボタン */}
      <button
        onClick={onAttack}
        className="w-full rounded-lg bg-red-600 py-5 text-xl font-bold text-white active:bg-red-700"
      >
        攻撃!
      </button>
    </div>
  );
}
