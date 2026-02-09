"use client";

import { useState } from "react";
import type { GameState, Weapon } from "@/lib/types";
import { ElementBadge } from "./ElementBadge";
import { HpBar } from "./HpBar";

type TreasureChoice = "heal" | "weapon";

export function TreasureSelectView({
  gameState,
  treasureWeapon,
  onChooseHeal,
  onChooseWeapon,
}: {
  gameState: GameState;
  treasureWeapon: Weapon;
  onChooseHeal: () => void;
  onChooseWeapon: () => void;
}) {
  const [selected, setSelected] = useState<TreasureChoice | null>(null);
  const { player } = gameState;

  const healAmount = BigInt(
    Math.max(1, Math.floor(Number(player.maxHp) * 0.7))
  );
  const healedHp = player.hp + healAmount > player.maxHp ? player.maxHp : player.hp + healAmount;

  const handleConfirm = () => {
    if (selected === "heal") {
      onChooseHeal();
    } else if (selected === "weapon") {
      onChooseWeapon();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-xl font-bold text-yellow-400">
        宝箱を発見!
      </h2>

      <p className="text-center text-sm text-zinc-400">
        どちらか一つを選んでください
      </p>

      {/* プレイヤー状態 */}
      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3">
        <HpBar current={player.hp} max={player.maxHp} label="HP" />
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
          <span>Lv.{player.level}</span>
          <span>武器: {player.weapon.name}</span>
          <ElementBadge element={player.weapon.element} />
          {player.weapon.attackBonus > 0n && (
            <span>+{player.weapon.attackBonus.toString()}</span>
          )}
        </div>
      </div>

      {/* 選択肢 */}
      <div className="flex gap-3">
        {/* 回復アイテム */}
        <button
          onClick={() => setSelected("heal")}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
            selected === "heal"
              ? "border-green-500 bg-zinc-700"
              : "border-zinc-600 bg-zinc-800 active:border-green-500 active:bg-zinc-700"
          }`}
        >
          <p className="mb-1 text-xs text-zinc-400">回復アイテム</p>
          <p className="font-bold text-green-400">HP回復</p>
          <p className="mt-1 text-sm text-zinc-300">
            HP {player.hp.toString()} → {healedHp.toString()}
          </p>
          <p className="text-xs text-zinc-500">
            (MaxHPの70%)
          </p>
        </button>

        {/* 武器 */}
        <button
          onClick={() => setSelected("weapon")}
          className={`flex-1 rounded-lg border-2 p-4 text-left transition-colors ${
            selected === "weapon"
              ? "border-blue-500 bg-zinc-700"
              : "border-zinc-600 bg-zinc-800 active:border-blue-500 active:bg-zinc-700"
          }`}
        >
          <p className="mb-1 text-xs text-zinc-400">武器</p>
          <p className="font-bold">{treasureWeapon.name}</p>
          <div className="mt-1 flex items-center gap-2">
            <ElementBadge element={treasureWeapon.element} />
            {treasureWeapon.attackBonus > 0n && (
              <span className="text-sm text-zinc-300">
                +{treasureWeapon.attackBonus.toString()}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* 決定ボタン */}
      <button
        onClick={handleConfirm}
        disabled={selected === null}
        className={`w-full rounded-lg py-4 text-lg font-bold ${
          selected !== null
            ? "bg-blue-600 text-white active:bg-blue-700"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
      >
        決定
      </button>
    </div>
  );
}
