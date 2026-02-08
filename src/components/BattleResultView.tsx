import type { BattleState } from "@/lib/types";
import { ABNORMAL_EXP_MULTIPLIER } from "@/lib/constants";

export function BattleResultView({
  battleState,
  onContinue,
}: {
  battleState: BattleState;
  onContinue: () => void;
}) {
  const isVictory = battleState.result === "victory";
  const enemy = battleState.enemy;

  if (isVictory) {
    const expMultiplier = enemy.isAbnormal ? ABNORMAL_EXP_MULTIPLIER : 1;
    const totalExp = enemy.expReward * BigInt(expMultiplier);

    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-zinc-600 bg-zinc-800 p-6">
        <h3 className="text-2xl font-bold text-green-400">勝利!</h3>
        <p className="text-zinc-300">{enemy.name} を倒した</p>

        {enemy.isAbnormal && (
          <p className="text-lg font-bold text-red-400">
            異常個体撃破! EXP x{ABNORMAL_EXP_MULTIPLIER}
          </p>
        )}

        <div className="flex gap-6 text-sm">
          <span className="text-blue-300">EXP +{totalExp.toString()}</span>
          <span className="text-yellow-300">Gold +{enemy.goldReward.toString()}</span>
        </div>

        <button
          onClick={onContinue}
          className="w-full rounded-lg bg-blue-600 py-3 text-lg font-bold text-white active:bg-blue-700"
        >
          続ける
        </button>
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
