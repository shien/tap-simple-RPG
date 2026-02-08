import type { AreaId, Element, EventType, UpcomingEvent } from "./types";
import { AREAS, EVENT_PROBABILITY_TABLE } from "./constants";

const ELEMENTS: Element[] = ["water", "earth", "thunder"];

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

/** エリアのelementDistributionに従ってランダム属性を選ぶ */
function rollElement(distribution: Record<Element, number>): Element {
  const r = Math.random();
  let cumulative = 0;
  for (const el of ELEMENTS) {
    cumulative += distribution[el];
    if (r < cumulative) return el;
  }
  return ELEMENTS[ELEMENTS.length - 1];
}

/** 次の最大3マス分のイベントを先読み生成する */
export function generateUpcomingEvents(
  areaId: AreaId,
  currentStep: number
): UpcomingEvent[] {
  const area = AREAS[areaId - 1];
  const events: UpcomingEvent[] = [];
  for (let s = currentStep + 1; s <= Math.min(currentStep + 3, 6); s++) {
    const type = rollEvent(areaId, s);
    if (type === "battle" || type === "boss") {
      events.push({ type, enemyElement: rollElement(area.elementDistribution) });
    } else {
      events.push({ type });
    }
  }
  return events;
}
