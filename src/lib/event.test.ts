import { describe, it, expect } from "vitest";
import { rollEvent, generateAreaEvents, generateUpcomingEvents } from "./event";
import type { AreaId, UpcomingEvent } from "./types";

describe("rollEvent", () => {
  it("step=6 で必ず boss が返る（全8エリア）", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      for (let i = 0; i < 10; i++) {
        expect(rollEvent(areaId as AreaId, 6)).toBe("boss");
      }
    }
  });

  it("step=1〜5 で battle/treasure のいずれかが返る", () => {
    const valid = ["battle", "treasure"];
    for (let step = 1; step <= 5; step++) {
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
  it("6つのイベントを返す（step1〜6）", () => {
    const events = generateAreaEvents(1);
    expect(events).toHaveLength(6);
  });

  it("最後のイベント（step6）は必ず boss", () => {
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      expect(events[5].type).toBe("boss");
    }
  });

  it("step1〜5 は battle/treasure のいずれか", () => {
    const valid = ["battle", "treasure"];
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      for (let s = 0; s < 5; s++) {
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
      const boss = events[5];
      expect(boss.type).toBe("boss");
      expect(validElements).toContain(boss.enemyElement);
    }
  });

  it("エリア1のボスはグレイズビースト（earth）", () => {
    for (let i = 0; i < 10; i++) {
      const events = generateAreaEvents(1);
      expect(events[5].enemyElement).toBe("earth");
    }
  });

  it("全8エリアで正しく生成される", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      const events = generateAreaEvents(areaId as AreaId);
      expect(events).toHaveLength(6);
      expect(events[5].type).toBe("boss");
    }
  });
});

describe("generateUpcomingEvents", () => {
  const sampleAreaEvents: UpcomingEvent[] = [
    { type: "battle", enemyElement: "water" },
    { type: "treasure" },
    { type: "treasure" },
    { type: "battle", enemyElement: "earth" },
    { type: "battle", enemyElement: "thunder" },
    { type: "boss", enemyElement: "thunder" },
  ];

  it("step=1 で 3つ返る（step2,3,4）", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 1);
    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: "treasure" });
    expect(events[1]).toEqual({ type: "treasure" });
    expect(events[2]).toEqual({ type: "battle", enemyElement: "earth" });
  });

  it("step=4 で 2つ返る（step5,6）、最後が boss", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 4);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: "battle", enemyElement: "thunder" });
    expect(events[1]).toEqual({ type: "boss", enemyElement: "thunder" });
  });

  it("step=5 で 1つ返る（boss）", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 5);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: "boss", enemyElement: "thunder" });
  });

  it("step=6 で 空配列", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 6);
    expect(events).toHaveLength(0);
  });

  it("step=3 で 3つ返る（step4,5,6）、最後が boss", () => {
    const events = generateUpcomingEvents(sampleAreaEvents, 3);
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
