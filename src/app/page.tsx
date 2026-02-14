"use client";

import { useState } from "react";
import { useGameState } from "@/hooks/useGameState";
import { ExplorationView } from "@/components/ExplorationView";
import { BattlePrepView } from "@/components/BattlePrepView";
import { BattleView } from "@/components/BattleView";
import { TreasureSelectView } from "@/components/TreasureSelectView";
import { ShopView } from "@/components/ShopView";
import { GameOverView } from "@/components/GameOverView";
import { GameClearView } from "@/components/GameClearView";
import { AreaMoveView } from "@/components/AreaMoveView";
import { StartScreen } from "@/components/StartScreen";

export default function Home() {
  const [started, setStarted] = useState(false);
  const { gameState, battleState, treasureWeapon, shopItems, message, move, attack, enemyAttack, chooseWeapon, endBattle, restart, heal, confirmBattle, confirmAreaMove, chooseTreasureHeal, chooseTreasureWeapon, guard, purchaseItem, leaveShop, useItem } =
    useGameState();

  if (!started) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-zinc-100">
        <StartScreen onStart={() => setStarted(true)} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-900 text-zinc-100">
      <main className="w-full max-w-md px-4 py-6">
        {gameState.phase === "gameClear" && (
          <GameClearView onRestart={() => { restart(); setStarted(false); }} />
        )}

        {gameState.phase === "gameover" && (
          <GameOverView onRestart={restart} />
        )}

        {gameState.phase === "battlePrep" && battleState && (
          <BattlePrepView
            battleState={battleState}
            gameState={gameState}
            onHeal={heal}
            onStartBattle={confirmBattle}
          />
        )}

        {gameState.phase === "treasureSelect" && treasureWeapon && (
          <TreasureSelectView
            gameState={gameState}
            treasureWeapon={treasureWeapon}
            onChooseHeal={chooseTreasureHeal}
            onChooseWeapon={chooseTreasureWeapon}
          />
        )}

        {gameState.phase === "shop" && shopItems && (
          <ShopView
            gameState={gameState}
            shopItems={shopItems}
            onPurchase={purchaseItem}
            onLeave={leaveShop}
          />
        )}

        {gameState.phase === "battle" && battleState && (
          <BattleView
            battleState={battleState}
            gameState={gameState}
            onAttack={attack}
            onEnemyAttack={enemyAttack}
            onGuard={guard}
            onChooseWeapon={chooseWeapon}
            onEndBattle={endBattle}
            onUseItem={useItem}
          />
        )}

        {gameState.phase === "areaMove" && (
          <AreaMoveView
            areaId={gameState.currentArea}
            onConfirm={confirmAreaMove}
          />
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
