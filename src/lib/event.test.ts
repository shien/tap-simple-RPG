import { describe, it, expect } from "vitest";
import { rollEvent, generateAreaEvents, generateUpcomingEvents } from "./event";
import type { AreaId, UpcomingEvent } from "./types";
import { STEPS_PER_AREA } from "./constants";

describe("rollEvent", () => {
  it(`step=${STEPS_PER_AREA} で必ず boss が返る（全8エリア）`, () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      for (let i = 0; i < 10; i++) {
        expect(rollEvent(areaId as AreaId, STEPS_PER_AREA)).toBe("boss");
      }
    }
  });

  it(`step=1〜${STEPS_PER_AREA - 1} で battle/treasure のいずれかが返る`, () => {
    const valid = ["battle", "treasure"];
    for (let step = 1; step <= STEPS_PER_AREA - 1; step++) {
      for (let i = 0; i < 20; i++) {
        expect(valid).toContain(rollEvent(1, step));
      }
    }
  });

  it("確率テーブルに従いbattleが最も多い（統計的200回）", () => {
    const counts: Record<string, number> = {
      battle: 0,
      treasure: 0,
    };
    for (let i = 0; i < 200; i++) {
      const ev = rollEvent(1, 1);
      counts[ev]++;
    }
    // エリア1: battle=0.80 が最多
    expect(counts.battle).toBeGreaterThan(counts.treasure);
  });
});

describe("generateAreaEvents", () => {
  it(`${STEPS_PER_AREA}つのイベントを返す（step1〜${STEPS_PER_AREA}）`, () => {
    const events = generateAreaEvents(1);
    expect(events).toHaveLength(STEPS_PER_AREA);
  });

  it(`最後のイベント（step${STEPS_PER_AREA}）は必ず boss`, () => {
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      expect(events[STEPS_PER_AREA - 1].type).toBe("boss");
    }
  });

  it(`step1〜${STEPS_PER_AREA - 1} は battle/treasure のいずれか`, () => {
    const valid = ["battle", "treasure"];
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      for (let s = 0; s < STEPS_PER_AREA - 1; s++) {
        expect(valid).toContain(events[s].type);
      }
    }
  });

  it("battle イベントに enemyElement が含まれる", () => {
    const validElements = ["water", "earth", "thunder"];
    for (let i = 0; i < 50; i++) {
      const events = generateAreaEvents(1);
      for (const ev of events) {
        if (ev.type === "battle" || ev.type === "boss") {
          expect(validElements).toContain(ev.enemyElement);
        }
      }
    }
  });

  it("treasure イベントに enemyElement が含まれない", () => {
    for (let i = 0; i < 50; i++) {
      const events = generateAreaEvents(1);
      for (const ev of events) {
        if (ev.type === "treasure") {
          expect(ev.enemyElement).toBeUndefined();
        }
      }
    }
  });

  it("boss イベントに enemyElement が含まれる", () => {
    const validElements = ["water", "earth", "thunder"];
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      const boss = events[STEPS_PER_AREA - 1];
      expect(boss.type).toBe("boss");
      expect(validElements).toContain(boss.enemyElement);
    }
  });

  it("エリア1のボスはグレイズビースト（earth）", () => {
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      expect(events[STEPS_PER_AREA - 1].enemyElement).toBe("earth");
    }
  });

  it("全8エリアで正しく生成される", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const events = generateAreaEvents(areaId as AreaId);
      expect(events).toHaveLength(STEPS_PER_AREA);
      expect(events[STEPS_PER_AREA - 1].type).toBe("boss");
    }
  });
});

describe("generateUpcomingEvents", () => {
  const sampleAreaEvents: UpcomingEvent[] = [
    { type: "battle", enemyElement: "water" },   // step1
    { type: "treasure" },                         // step2
    { type: "treasure" },                         // step3
    { type: "battle", enemyElement: "earth" },    // step4
    { type: "battle", enemyElement: "thunder" },  // step5
    { type: "treasure" },                         // step6
    { type: "battle", enemyElement: "water" },    // step7
    { type: "boss", enemyElement: "thunder" },    // step8
  ];

  it("step=1 で 3つ返る（step2,3,4）", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 1);
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "treasure" });
    expect(events[1]).toEqual({ type: "treasure" });
    expect(events[2]).toEqual({ type: "battle", enemyElement: "earth" });
  });

  it("step=6 で 2つ返る（step7,8）、最後が boss", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 6);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: "battle", enemyElement: "water" });
    expect(events[1]).toEqual({ type: "boss", enemyElement: "thunder" });
  });

  it("step=7 で 1つ返る（boss）", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 7);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "boss", enemyElement: "thunder" });
  });

  it(`step=${STEPS_PER_AREA} で 空配列`, () => {
    const events = generateUpcomingEvents(sampleAreaEvents, STEPS_PER_AREA);
    expect(events).toHaveLength(0);
  });

  it("step=5 で 3つ返る（step6,7,8）、最後が boss", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 5);
    expect(events).toHaveLength(3);
    expect(events[2].type).toBe("boss");
  });

  it("areaEventsの内容がそのまま返される（一貫性）", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 1);
    // step2,3,4 の内容が返る
    expect(events[0]).toBe(sampleAreaEvents[1]);
    expect(events[1]).toBe(sampleAreaEvents[2]);
    expect(events[2]).toBe(sampleAreaEvents[3]);
  });
});
