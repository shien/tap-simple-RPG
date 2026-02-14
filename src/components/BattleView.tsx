"use client";

import { useEffect, useRef, useState } from "react";
import type { BattleState, Element, GameState, ElementAdvantage, ItemType, Weapon } from "@/lib/types";
import { countItem } from "@/lib/item";
import { getElementAdvantage, getElementMultiplier } from "@/lib/element";
import { ElementBadge } from "./ElementBadge";
import { HpBar } from "./HpBar";
import { BattleResultView } from "./BattleResultView";

const ENEMY_ATTACK_MIN = 1500;
const ENEMY_ATTACK_MAX = 3000;
const ENEMY_ATTACK_WARN = 1000;

const ADVANTAGE_DISPLAY: Record<
  ElementAdvantage,
  { label: string; className: string }
> = {
  advantage: { label: "有利!", className: "text-green-400" },
  disadvantage: { label: "不利...", className: "text-red-400" },
  neutral: { label: "同属性", className: "text-zinc-400" },
};

const ELEMENT_LABELS: Record<Element, string> = {
  water: "水",
  earth: "土",
  thunder: "雷",
};

const ELEMENT_COLORS: Record<Element, string> = {
  water: "bg-blue-600 active:bg-blue-700",
  earth: "bg-amber-600 active:bg-amber-700",
  thunder: "bg-yellow-500 active:bg-yellow-600",
};

export function BattleView({
  battleState,
  gameState,
  onAttack,
  onEnemyAttack,
  onGuard,
  onChooseWeapon,
  onEndBattle,
  onUseItem,
}: {
  battleState: BattleState;
  gameState: GameState;
  onAttack: () => void;
  onEnemyAttack: () => void;
  onGuard: () => void;
  onChooseWeapon: (weapon: Weapon) => void;
  onEndBattle: () => void;
  onUseItem: (itemType: ItemType, element?: Element) => void;
}) {
  const { player, enemy, result } = battleState;
  const attackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showElementSelect, setShowElementSelect] = useState(false);

  // 敵の自動攻撃（ランダム間隔 + 攻撃前点滅）
  useEffect(() => {
    if (result !== "ongoing") {
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      attackTimeoutRef.current = null;
      flashTimeoutRef.current = null;
      setIsFlashing(false);
      return;
    }

    function scheduleNextAttack() {
      const interval = ENEMY_ATTACK_MIN + Math.random() * (ENEMY_ATTACK_MAX - ENEMY_ATTACK_MIN);
      const flashDelay = Math.max(0, interval - ENEMY_ATTACK_WARN);

      flashTimeoutRef.current = setTimeout(() => {
        setIsFlashing(true);
      }, flashDelay);

      attackTimeoutRef.current = setTimeout(() => {
        setIsFlashing(false);
        onEnemyAttack();
        scheduleNextAttack();
      }, interval);
    }

    scheduleNextAttack();

    return () => {
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
      attackTimeoutRef.current = null;
      flashTimeoutRef.current = null;
      setIsFlashing(false);
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
    <div className="flex flex-col gap-3">
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
          <div className={`flex h-48 w-48 items-center justify-center rounded-lg bg-zinc-900 ${
            isFlashing
              ? "animate-enemy-flash border-2 border-red-500"
              : "border border-zinc-600"
          }`}>
            {enemy.imageUrl ? (
              <img src={enemy.imageUrl} alt={enemy.name} className="h-full w-full rounded-lg object-contain" />
            ) : (
              <span className="text-4xl text-zinc-600">?</span>
            )}
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
              : battleState.guardCounter
                ? "bg-yellow-500 active:bg-yellow-600"
                : "bg-red-600 active:bg-red-700"
          }`}
        >
          {battleState.guardCounter ? "カウンター!" : "攻撃!"}
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
          {battleState.isGuarding ? "ガード中!" : "ガード"}
        </button>
      </div>

      {/* 完全防御インジケーター */}
      {battleState.perfectGuard && (
        <div className="rounded-lg border border-cyan-500 bg-cyan-900/40 p-2 text-center text-sm font-bold text-cyan-300">
          完全防御発動中
        </div>
      )}

      {/* アイテムスロット */}
      {player.items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {countItem(player.items, "elementChange") > 0 && (
            <button
              onClick={() => setShowElementSelect(true)}
              className="rounded-lg bg-purple-700 px-3 py-2 text-xs font-bold text-white active:bg-purple-800"
            >
              武器の塗料 x{countItem(player.items, "elementChange")}
            </button>
          )}
          {countItem(player.items, "perfectGuard") > 0 && (
            <button
              onClick={() => onUseItem("perfectGuard")}
              className="rounded-lg bg-cyan-700 px-3 py-2 text-xs font-bold text-white active:bg-cyan-800"
            >
              古びた鋼鉄の盾 x{countItem(player.items, "perfectGuard")}
            </button>
          )}
          {countItem(player.items, "heal40") > 0 && (
            <button
              onClick={() => onUseItem("heal40")}
              className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white active:bg-green-800"
            >
              回復の薬 x{countItem(player.items, "heal40")}
            </button>
          )}
        </div>
      )}

      {/* 属性選択モーダル */}
      {showElementSelect && (
        <div className="rounded-lg border border-purple-500 bg-zinc-800 p-4">
          <p className="mb-3 text-center text-sm text-zinc-300">属性を選択</p>
          <div className="flex gap-2">
            {(["water", "earth", "thunder"] as Element[]).map((el) => (
              <button
                key={el}
                onClick={() => {
                  onUseItem("elementChange", el);
                  setShowElementSelect(false);
                }}
                className={`flex-1 rounded-full py-3 text-sm font-bold text-white ${ELEMENT_COLORS[el]}`}
              >
                {ELEMENT_LABELS[el]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowElementSelect(false)}
            className="mt-2 w-full text-center text-xs text-zinc-500"
          >
            キャンセル
          </button>
        </div>
      )}
    </div>
  );
}
