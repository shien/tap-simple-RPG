"use client";

import { useState, useCallback } from "react";
import type { GameState, BattleState, Weapon } from "@/lib/types";
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

/** すべてのゲーム状態を1つにまとめることで画面遷移の原子性を保証する */
type CombinedState = {
  gameState: GameState;
  battleState: BattleState | null;
  message: string | null;
};

function createInitialState(): CombinedState {
  return {
    gameState: createNewGame(),
    battleState: null,
    message: null,
  };
}

export function useGameState() {
  const [state, setState] = useState<CombinedState>(createInitialState);

  /** 1マス進む → イベント処理 */
  const move = useCallback(() => {
    setState((prev) => {
      if (prev.gameState.phase !== "exploration") return prev;

      const stepped = advanceStep(prev.gameState);
      const processed = processEvent(stepped);

      if (processed.phase === "battle") {
        const enemy =
          stepped.currentStep === 6
            ? generateBoss(stepped.currentArea)
            : generateEnemy(stepped.currentArea);
        return {
          gameState: processed,
          battleState: createBattleState(processed.player, enemy),
          message: null,
        };
      } else if (processed.phase === "gameover") {
        return {
          gameState: processed,
          battleState: null,
          message: "罠にかかって力尽きた...",
        };
      } else {
        const hpDiff = processed.player.hp - prev.gameState.player.hp;
        const expDiff = processed.player.exp - prev.gameState.player.exp;
        const goldDiff = processed.player.gold - prev.gameState.player.gold;

        let message: string | null = null;
        if (hpDiff > 0n) {
          message = `休息: HP ${hpDiff.toString()} 回復`;
        } else if (expDiff > 0n || goldDiff > 0n) {
          message = `宝箱: EXP +${expDiff.toString()}, Gold +${goldDiff.toString()}`;
        } else if (hpDiff < 0n) {
          message = `罠: ${(-hpDiff).toString()} ダメージ`;
        }

        return {
          gameState: processed,
          battleState: null,
          message,
        };
      }
    });
  }, []);

  /** プレイヤー攻撃（タップ） */
  const attack = useCallback(() => {
    setState((prev) => {
      if (!prev.battleState || prev.battleState.result !== "ongoing") return prev;
      const attacked = playerAttack(prev.battleState);
      const checked = checkBattleResult(attacked);
      if (checked.result === "victory") {
        return {
          ...prev,
          battleState: processBattleRewards(checked, prev.gameState.currentArea),
        };
      }
      return { ...prev, battleState: checked };
    });
  }, []);

  /** 敵の自動攻撃 */
  const enemyAttack = useCallback(() => {
    setState((prev) => {
      if (!prev.battleState || prev.battleState.result !== "ongoing") return prev;
      const attacked = enemyAttackFn(prev.battleState);
      return { ...prev, battleState: checkBattleResult(attacked) };
    });
  }, []);

  /** 武器を選択してプレイヤーに装備 */
  const chooseWeapon = useCallback((weapon: Weapon) => {
    setState((prev) => {
      if (!prev.battleState || prev.battleState.result !== "victory") return prev;
      return {
        ...prev,
        battleState: {
          ...prev.battleState,
          player: { ...prev.battleState.player, weapon },
          droppedWeapon: null,
        },
      };
    });
  }, []);

  /** 戦闘終了 → 探索に戻る or リスタート */
  const endBattle = useCallback(() => {
    setState((prev) => {
      if (!prev.battleState) return prev;

      if (prev.battleState.result === "victory") {
        const updated = { ...prev.gameState, player: prev.battleState.player };
        return {
          gameState: handleBattleVictory(updated),
          battleState: null,
          message: null,
        };
      } else if (prev.battleState.result === "defeat") {
        return {
          gameState: handleDeath(),
          battleState: null,
          message: null,
        };
      }

      return prev;
    });
  }, []);

  /** リスタート */
  const restart = useCallback(() => {
    setState({
      gameState: handleDeath(),
      battleState: null,
      message: null,
    });
  }, []);

  return {
    gameState: state.gameState,
    battleState: state.battleState,
    message: state.message,
    move,
    attack,
    enemyAttack,
    chooseWeapon,
    endBattle,
    restart,
  };
}
