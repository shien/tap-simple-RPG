import type { AreaId, Element, EventType, UpcomingEvent } from "./types";
import { AREAS, EVENT_PROBABILITY_TABLE, STEPS_PER_AREA } from "./constants";
import { getBossForArea } from "./data/monsters";

const ELEMENTS: Element[] = ["water", "earth", "thunder"];

/** エリアの確率テーブルに従ってイベントを決定する */
export function rollEvent(areaId: AreaId, step: number): EventType {
  if (step === STEPS_PER_AREA) return "boss";

  const table = EVENT_PROBABILITY_TABLE[areaId];
  const r = Math.random();

  if (r < table.battle) return "battle";

  if (r < table.battle + table.treasure) return "treasure";

  return "shop";
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

/** エリア内のstep1〜8のイベントを事前生成する */
export function generateAreaEvents(areaId: AreaId): UpcomingEvent[] {
  const area = AREAS[areaId - 1];
  const events: UpcomingEvent[] = [];

  // step 1〜(STEPS_PER_AREA-1): ランダムイベント
  for (let s = 1; s <= STEPS_PER_AREA - 1; s++) {
    const type = rollEvent(areaId, s);
    if (type === "battle") {
      events.push({ type, enemyElement: rollElement(area.elementDistribution) });
    } else {
      events.push({ type });
    }
  }

  // 最終step: ボス固定
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
  for (let s = currentStep + 1; s <= Math.min(currentStep + 3, STEPS_PER_AREA); s++) {
    events.push(areaEvents[s - 1]);
  }
  return events;
}
