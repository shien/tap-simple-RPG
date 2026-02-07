import type { AreaId, EventType } from "./types";
import { EVENT_PROBABILITY_TABLE } from "./constants";

/** エリアの確率テーブルに従ってイベントを決定する */
export function rollEvent(areaId: AreaId, step: number): EventType {
  if (step === 6) return "boss";

  const table = EVENT_PROBABILITY_TABLE[areaId];
  const r = Math.random();
  let cumulative = 0;

  cumulative += table.battle;
  if (r < cumulative) return "battle";

  cumulative += table.rest;
  if (r < cumulative) return "rest";

  cumulative += table.treasure;
  if (r < cumulative) return "treasure";

  return "trap";
}

/** 次の最大3マス分のイベントを先読み生成する */
export function generateUpcomingEvents(
  areaId: AreaId,
  currentStep: number
): EventType[] {
  const events: EventType[] = [];
  for (let s = currentStep + 1; s <= Math.min(currentStep + 3, 6); s++) {
    events.push(rollEvent(areaId, s));
  }
  return events;
}
