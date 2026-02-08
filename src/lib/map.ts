import type { AreaId, EventType, GameState } from "./types";
import { rollEvent, generateUpcomingEvents } from "./event";

/** 1マス進む（イミュータブル） */
export function advanceStep(state: GameState): GameState {
  const nextStep = state.currentStep + 1;
  return {
    ...state,
    currentStep: nextStep,
    upcomingEvents: generateUpcomingEvents(state.currentArea, nextStep),
  };
}

/** ボス撃破後、次のエリアへ移動する（イミュータブル） */
export function advanceArea(state: GameState): GameState {
  const nextArea =
    state.currentArea >= 8 ? 1 : ((state.currentArea + 1) as AreaId);
  return {
    ...state,
    currentArea: nextArea,
    currentStep: 1,
    upcomingEvents: generateUpcomingEvents(nextArea, 1),
  };
}

/** 現在マスのイベントを返す */
export function getCurrentEvent(state: GameState): EventType {
  if (state.currentStep === 6) return "boss";
  return rollEvent(state.currentArea, state.currentStep);
}
