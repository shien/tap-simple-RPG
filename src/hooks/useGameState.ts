"use client";

import { useState, useCallback } from "react";
import type { GameState, BattleState, Weapon } from "@/lib/types";
import { createNewGame, processEvent, handleBattleVictory, handleDeath, healInPrep, startBattle, processTreasureHeal, processTreasureWeapon } from "@/lib/game";
import { generateWeaponDrop } from "@/lib/weapon";
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
  treasureWeapon: Weapon | null;
  message: string | null;
};

function createInitialState(): CombinedState {
  return {
    gameState: createNewGame(),
    battleState: null,
    treasureWeapon: null,
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

      if (processed.phase === "battlePrep") {
        const currentEvent = stepped.areaEvents[stepped.currentStep - 1];
        const presetElement = currentEvent?.enemyElement;
        const enemy =
          stepped.currentStep === 6
            ? generateBoss(stepped.currentArea, presetElement)
            : generateEnemy(stepped.currentArea, presetElement);
        return {
          gameState: processed,
          battleState: createBattleState(processed.player, enemy),
          treasureWeapon: null,
          message: null,
        };
      } else if (processed.phase === "treasureSelect") {
        const weapon = generateWeaponDrop(stepped.currentArea);
        return {
          gameState: processed,
          battleState: null,
          treasureWeapon: weapon,
          message: null,
        };
      } else {
        return {
          gameState: processed,
          battleState: null,
          treasureWeapon: null,
          message: null,
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
          treasureWeapon: null,
          message: null,
        };
      } else if (prev.battleState.result === "defeat") {
        return {
          gameState: handleDeath(),
          battleState: null,
          treasureWeapon: null,
          message: null,
        };
      }

      return prev;
    });
  }, []);

  /** 戦闘準備画面での回復 */
  const heal = useCallback(() => {
    setState((prev) => {
      if (prev.gameState.phase !== "battlePrep") return prev;
      if (prev.gameState.healCount <= 0) return prev;
      const healed = healInPrep(prev.gameState);
      return {
        ...prev,
        gameState: healed,
        battleState: prev.battleState
          ? { ...prev.battleState, player: healed.player }
          : null,
      };
    });
  }, []);

  /** 戦闘準備 → 戦闘開始 */
  const confirmBattle = useCallback(() => {
    setState((prev) => {
      if (prev.gameState.phase !== "battlePrep") return prev;
      return {
        ...prev,
        gameState: startBattle(prev.gameState),
      };
    });
  }, []);

  /** 宝箱: 回復アイテムを選択 */
  const chooseTreasureHeal = useCallback(() => {
    setState((prev) => {
      if (prev.gameState.phase !== "treasureSelect") return prev;
      return {
        gameState: processTreasureHeal(prev.gameState),
        battleState: null,
        treasureWeapon: null,
        message: null,
      };
    });
  }, []);

  /** 宝箱: 武器を選択 */
  const chooseTreasureWeapon = useCallback(() => {
    setState((prev) => {
      if (prev.gameState.phase !== "treasureSelect" || !prev.treasureWeapon) return prev;
      return {
        gameState: processTreasureWeapon(prev.gameState, prev.treasureWeapon),
        battleState: null,
        treasureWeapon: null,
        message: null,
      };
    });
  }, []);

  /** リスタート */
  const restart = useCallback(() => {
    setState({
      gameState: handleDeath(),
      battleState: null,
      treasureWeapon: null,
      message: null,
    });
  }, []);

  return {
    gameState: state.gameState,
    battleState: state.battleState,
    treasureWeapon: state.treasureWeapon,
    message: state.message,
    move,
    attack,
    enemyAttack,
    chooseWeapon,
    endBattle,
    restart,
    heal,
    confirmBattle,
    chooseTreasureHeal,
    chooseTreasureWeapon,
  };
}
