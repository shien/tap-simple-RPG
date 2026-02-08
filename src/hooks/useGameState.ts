"use client";

import { useState, useCallback } from "react";
import type { GameState, BattleState } from "@/lib/types";
import { createNewGame, processEvent, handleBattleVictory, handleDeath } from "@/lib/game";
import { advanceStep } from "@/lib/map";
import {
  createBattleState,
  playerAttack,
  enemyAttack as enemyAttackFn,
  checkBattleResult,
  processBattleRewards,
} from "@/lib/battle";
import { generateEnemy, generateBoss } from "@/lib/enemy";

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>(createNewGame);
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /** 1マス進む → イベント処理 */
  const move = useCallback(() => {
    setGameState((prev) => {
      const stepped = advanceStep(prev);
      const processed = processEvent(stepped);

      if (processed.phase === "battle") {
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
          setMessage(`罠: ${(-hpDiff).toString()} ダメージ`);
        } else {
          setMessage(null);
        }
      }

      return processed;
    });
  }, []);

  /** プレイヤー攻撃（タップ） */
  const attack = useCallback(() => {
    setBattleState((prev) => {
      if (!prev || prev.result !== "ongoing") return prev;
      const attacked = playerAttack(prev);
      const checked = checkBattleResult(attacked);
      if (checked.result === "victory") {
        return processBattleRewards(checked, gameState.currentArea);
      }
      return checked;
    });
  }, [gameState.currentArea]);

  /** 敵の自動攻撃 */
  const enemyAttack = useCallback(() => {
    setBattleState((prev) => {
      if (!prev || prev.result !== "ongoing") return prev;
      const attacked = enemyAttackFn(prev);
      return checkBattleResult(attacked);
    });
  }, []);

  /** 戦闘終了 → 探索に戻る or リスタート */
  const endBattle = useCallback(() => {
    setBattleState((prev) => {
      if (!prev) return null;

      if (prev.result === "victory") {
        setGameState((gs) => {
          const updated = { ...gs, player: prev.player };
          return handleBattleVictory(updated);
        });
        setMessage(null);
      } else if (prev.result === "defeat") {
        setGameState(handleDeath());
        setMessage(null);
      }

      return null;
    });
  }, []);

  /** リスタート */
  const restart = useCallback(() => {
    setGameState(handleDeath());
    setBattleState(null);
    setMessage(null);
  }, []);

  return { gameState, battleState, message, move, attack, enemyAttack, endBattle, restart };
}
