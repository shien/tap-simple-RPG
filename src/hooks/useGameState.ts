"use client";

import { useState, useCallback } from "react";
import type { GameState, BattleState } from "@/lib/types";
import { createNewGame, processEvent, handleDeath } from "@/lib/game";
import { advanceStep } from "@/lib/map";
import { createBattleState } from "@/lib/battle";
import { generateEnemy, generateBoss } from "@/lib/enemy";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createNewGame);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const move = useCallback(() => {
    setGameState((prev) => {
      // 1マス進む
      const stepped = advanceStep(prev);
      // イベント処理
      const processed = processEvent(stepped);

      // phase に応じたメッセージとバトル状態の設定
      if (processed.phase === "battle") {
        // 敵生成
        const enemy =
          stepped.currentStep === 6
            ? generateBoss(stepped.currentArea)
            : generateEnemy(stepped.currentArea);
        setBattleState(createBattleState(processed.player, enemy));
        setMessage(null);
      } else if (processed.phase === "gameover") {
        setBattleState(null);
        setMessage("罠にかかって力尽きた...");
      } else {
        setBattleState(null);
        // rest/treasure/trap のメッセージ
        const hpDiff = processed.player.hp - prev.player.hp;
        const expDiff = processed.player.exp - prev.player.exp;
        const goldDiff = processed.player.gold - prev.player.gold;

        if (hpDiff > 0n) {
          setMessage(`休息: HP ${hpDiff.toString()} 回復`);
        } else if (expDiff > 0n || goldDiff > 0n) {
          setMessage(
            `宝箱: EXP +${expDiff.toString()}, Gold +${goldDiff.toString()}`
          );
        } else if (hpDiff < 0n) {
          const absDiff = -hpDiff;
          setMessage(`罠: ${absDiff.toString()} ダメージ`);
        } else {
          setMessage(null);
        }
      }

      return processed;
    });
  }, []);

  const restart = useCallback(() => {
    setGameState(handleDeath());
    setBattleState(null);
    setMessage(null);
  }, []);

  return { gameState, battleState, message, move, restart };
}
