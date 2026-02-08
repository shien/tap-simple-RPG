"use client";

import { useGameState } from "@/hooks/useGameState";
import { ExplorationView } from "@/components/ExplorationView";
import { GameOverView } from "@/components/GameOverView";

export default function Home() {
  const { gameState, battleState, message, move, restart } = useGameState();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-zinc-100">
      <main className="w-full max-w-md px-4 py-6">
        <h1 className="mb-4 text-center text-2xl font-bold">タップRPG</h1>

        {gameState.phase === "gameover" && (
          <GameOverView onRestart={restart} />
        )}

        {gameState.phase === "battle" && battleState && (
          <div className="flex flex-col items-center gap-4 py-8">
            <p className="text-lg">戦闘中...</p>
            <p className="text-sm text-zinc-400">
              vs {battleState.enemy.name}
            </p>
            <p className="text-xs text-zinc-500">
              （戦闘UIはPhase9で実装）
            </p>
          </div>
        )}

        {gameState.phase === "exploration" && (
          <ExplorationView
            gameState={gameState}
            message={message}
            onMove={move}
          />
        )}
      </main>
    </div>
  );
}
