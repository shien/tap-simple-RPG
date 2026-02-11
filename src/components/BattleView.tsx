"use client";

import { useEffect, useRef } from "react";
import type { BattleState, GameState, ElementAdvantage, Weapon } from "@/lib/types";
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
  onGuard,
  onChooseWeapon,
  onEndBattle,
}: {
  battleState: BattleState;
  gameState: GameState;
  onAttack: () => void;
  onEnemyAttack: () => void;
  onGuard: () => void;
  onChooseWeapon: (weapon: Weapon) => void;
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
      <BattleResultView battleState={battleState} upcomingEvents={gameState.upcomingEvents} onChooseWeapon={onChooseWeapon} onContinue={onEndBattle} />
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

        {/* モンスター画像エリア */}
        <div className="my-3 flex items-center justify-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-900 text-4xl text-zinc-600">
            ?
          </div>
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

      {/* アクションボタン */}
      <div className="flex gap-3">
        <button
          onClick={onAttack}
          disabled={battleState.isGuarding}
          className={`flex-1 rounded-full py-5 text-xl font-bold text-white ${
            battleState.isGuarding
              ? "bg-red-400"
              : "bg-red-600 active:bg-red-700"
          }`}
        >
          攻撃!
        </button>
        <button
          onClick={onGuard}
          disabled={battleState.isGuarding}
          className={`flex-1 rounded-full py-5 text-xl font-bold text-white ${
            battleState.isGuarding
              ? "bg-blue-500"
              : "bg-blue-600 active:bg-blue-700"
          }`}
        >
          {battleState.isGuarding ? "ガード中!" : battleState.guardCounter ? "ガードカウンター" : "ガード"}
        </button>
      </div>
    </div>
  );
}
