import type { GameState } from "@/lib/types";
import { AreaInfo } from "./AreaInfo";
import { EventPreview } from "./EventPreview";
import { PlayerStatus } from "./PlayerStatus";
import { EventResultMessage } from "./EventResultMessage";

export function ExplorationView({
  gameState,
  message,
  onMove,
}: {
  gameState: GameState;
  message: string | null;
  onMove: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AreaInfo areaId={gameState.currentArea} currentStep={gameState.currentStep} />
      <EventPreview events={gameState.upcomingEvents} />
      <EventResultMessage message={message} />
      <PlayerStatus player={gameState.player} />
      <div className="flex items-center justify-center gap-4 text-sm">
        <p className="text-green-400">
          回復残り: {gameState.healCount}回
        </p>
        {gameState.player.items.length > 0 && (
          <p className="text-purple-400">
            アイテム: {gameState.player.items.length}個
          </p>
        )}
      </div>
      <button
        onClick={onMove}
        className="w-full rounded-full bg-blue-600 py-4 text-lg font-bold text-white active:bg-blue-700"
      >
        進む
      </button>
    </div>
  );
}
