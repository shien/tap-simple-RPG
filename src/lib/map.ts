import type { AreaId, EventType, GameState } from "./types";
import { generateUpcomingEvents, generateAreaEvents } from "./event";

/** 1マス進む（イミュータブル） */
export function advanceStep(state: GameState): GameState {
  const nextStep = state.currentStep + 1;
  return {
    ...state,
    currentStep: nextStep,
    upcomingEvents: generateUpcomingEvents(state.areaEvents, nextStep),
  };
}

/** ボス撃破後、次のエリアへ移動する（イミュータブル） */
export function advanceArea(state: GameState): GameState {
  const nextArea =
    state.currentArea >= 8 ? 1 : ((state.currentArea + 1) as AreaId);
  const areaEvents = generateAreaEvents(nextArea);
  return {
    ...state,
    currentArea: nextArea,
    currentStep: 1,
    areaEvents,
    upcomingEvents: generateUpcomingEvents(areaEvents, 1),
  };
}

/** 現在マスのイベントを返す（事前生成済みareaEventsから取得） */
export function getCurrentEvent(state: GameState): EventType {
  return state.areaEvents[state.currentStep - 1].type;
}
