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
      <p className="text-sm text-green-400 text-center">
        回復残り: {gameState.healCount}回
      </p>
      <button
        onClick={onMove}
        className="w-full rounded-full bg-blue-600 py-4 text-lg font-bold text-white active:bg-blue-700"
      >
        進む
      </button>
    </div>
  );
}
