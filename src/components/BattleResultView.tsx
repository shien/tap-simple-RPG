import type { BattleState, UpcomingEvent, Weapon } from "@/lib/types";
import { ABNORMAL_EXP_MULTIPLIER } from "@/lib/constants";
import { ElementBadge } from "./ElementBadge";
import { EventPreview } from "./EventPreview";

function WeaponCard({
  weapon,
  label,
  onSelect,
}: {
  weapon: Weapon;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex-1 rounded-lg border-2 border-zinc-600 bg-zinc-800 p-3 text-left transition-colors active:border-blue-500 active:bg-zinc-700"
    >
      <p className="mb-1 text-xs text-zinc-400">{label}</p>
      <p className="font-bold">{weapon.name}</p>
      <div className="mt-1 flex items-center gap-2">
        <ElementBadge element={weapon.element} />
        {weapon.attackBonus > 0n && (
          <span className="text-sm text-zinc-300">
            +{weapon.attackBonus.toString()}
          </span>
        )}
      </div>
    </button>
  );
}

export function BattleResultView({
  battleState,
  upcomingEvents,
  onChooseWeapon,
  onContinue,
}: {
  battleState: BattleState;
  upcomingEvents: UpcomingEvent[];
  onChooseWeapon: (weapon: Weapon) => void;
  onContinue: () => void;
}) {
  const isVictory = battleState.result === "victory";
  const enemy = battleState.enemy;

  if (isVictory) {
    const expMultiplier = enemy.isAbnormal ? ABNORMAL_EXP_MULTIPLIER : 1;
    const totalExp = enemy.expReward * BigInt(expMultiplier);
    const currentWeapon = battleState.player.weapon;
    const droppedWeapon = battleState.droppedWeapon;
    const hasChosen = droppedWeapon === null;

    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-600 bg-zinc-800 p-6">
        <h3 className="text-2xl font-bold text-green-400">勝利!</h3>
        <p className="text-zinc-300">{enemy.name} を倒した</p>

        <div className="flex gap-6 text-sm">
          <span className="text-blue-300">EXP +{totalExp.toString()}</span>
          <span className="text-yellow-300">Gold +{enemy.goldReward.toString()}</span>
        </div>

        {droppedWeapon && (
          <div className="w-full">
            <EventPreview events={upcomingEvents} />
            <p className="mb-2 mt-3 text-center text-sm text-zinc-400">
              武器を選択してください
            </p>
            <div className="flex gap-3">
              <WeaponCard
                weapon={currentWeapon}
                label="現在の武器"
                onSelect={() => onChooseWeapon(currentWeapon)}
              />
              <WeaponCard
                weapon={droppedWeapon}
                label="ドロップ武器"
                onSelect={() => onChooseWeapon(droppedWeapon)}
              />
            </div>
          </div>
        )}

        {hasChosen && (
          <button
            onClick={onContinue}
            className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white active:bg-blue-700"
          >
            続ける
          </button>
        )}
      </div>
    );
  }

  // 敗北
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-600 bg-zinc-800 p-6">
      <h3 className="text-2xl font-bold text-red-500">敗北...</h3>
      <p className="text-zinc-400">{enemy.name} に倒された</p>

      <button
        onClick={onContinue}
        className="w-full rounded-lg bg-red-700 py-3 text-lg font-bold text-white active:bg-red-800"
      >
        最初から
      </button>
    </div>
  );
}
