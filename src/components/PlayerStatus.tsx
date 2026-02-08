import type { Player, Element } from "@/lib/types";

const ELEMENT_LABEL: Record<Element, string> = {
  fire: "火",
  ice: "氷",
  thunder: "雷",
};

const ELEMENT_COLOR: Record<Element, string> = {
  fire: "text-red-500",
  ice: "text-blue-400",
  thunder: "text-yellow-500",
};

export function PlayerStatus({ player }: { player: Player }) {
  const hpPercent =
    player.maxHp > 0n
      ? Number((player.hp * 100n) / player.maxHp)
      : 0;

  const hpBarColor =
    hpPercent > 50 ? "bg-green-500" : hpPercent > 20 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-lg font-bold">Lv.{player.level}</span>
        <span className="text-yellow-400">Gold: {player.gold.toString()}</span>
      </div>

      {/* HPバー */}
      <div className="mb-2">
        <div className="mb-1 flex justify-between text-sm">
          <span>HP</span>
          <span>
            {player.hp.toString()} / {player.maxHp.toString()}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-600">
          <div
            className={`h-full rounded-full transition-all ${hpBarColor}`}
            style={{ width: `${Math.max(0, Math.min(100, hpPercent))}%` }}
          />
        </div>
      </div>

      {/* ステータス */}
      <div className="flex justify-between text-sm text-zinc-300">
        <span>ATK: {player.atk.toString()}</span>
        <span>EXP: {player.exp.toString()}</span>
      </div>

      {/* 武器 */}
      <div className="mt-2 flex items-center gap-2 text-sm">
        <span className="text-zinc-400">武器:</span>
        <span className="font-medium">{player.weapon.name}</span>
        <span className={ELEMENT_COLOR[player.weapon.element]}>
          [{ELEMENT_LABEL[player.weapon.element]}]
        </span>
        {player.weapon.attackBonus > 0n && (
          <span className="text-zinc-400">
            +{player.weapon.attackBonus.toString()}
          </span>
        )}
      </div>
    </div>
  );
}
