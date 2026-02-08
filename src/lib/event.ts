import type { AreaId, Element, EventType, UpcomingEvent } from "./types";
import { AREAS, EVENT_PROBABILITY_TABLE } from "./constants";
import { getBossForArea } from "./data/monsters";

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

/** エリア内のstep1〜6のイベントを事前生成する */
export function generateAreaEvents(areaId: AreaId): UpcomingEvent[] {
  const area = AREAS[areaId - 1];
  const events: UpcomingEvent[] = [];

  // step 1〜5: ランダムイベント
  for (let s = 1; s <= 5; s++) {
    const type = rollEvent(areaId, s);
    if (type === "battle") {
      events.push({ type, enemyElement: rollElement(area.elementDistribution) });
    } else {
      events.push({ type });
    }
  }

  // step 6: ボス固定
  const bossConfig = getBossForArea(areaId);
  const bossElement = bossConfig
    ? bossConfig.element
    : rollElement(area.elementDistribution);
  events.push({ type: "boss", enemyElement: bossElement });

  return events;
}

/** areaEventsから次の最大3マス分のイベントを先読みで返す */
export function generateUpcomingEvents(
  areaEvents: UpcomingEvent[],
  currentStep: number
): UpcomingEvent[] {
  const events: UpcomingEvent[] = [];
  for (let s = currentStep + 1; s <= Math.min(currentStep + 3, 6); s++) {
    events.push(areaEvents[s - 1]);
  }
  return events;
}
