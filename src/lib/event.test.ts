import { describe, it, expect } from "vitest";
import { rollEvent, generateUpcomingEvents } from "./event";
import type { AreaId } from "./types";

describe("rollEvent", () => {
  it("step=6 で必ず boss が返る（全8エリア）", () => {
    for (let areaId = 1; areaId <= 8; areaId++) {
      for (let i = 0; i < 10; i++) {
        expect(rollEvent(areaId as AreaId, 6)).toBe("boss");
      }
    }
  });

  it("step=1〜5 で battle/rest/treasure/trap のいずれかが返る", () => {
    const valid = ["battle", "rest", "treasure", "trap"];
    for (let step = 1; step <= 5; step++) {
      for (let i = 0; i < 20; i++) {
        expect(valid).toContain(rollEvent(1, step));
      }
    }
  });

  it("確率テーブルに従いbattleが最も多い（統計的200回）", () => {
    const counts: Record<string, number> = {
      battle: 0,
      rest: 0,
      treasure: 0,
      trap: 0,
    };
    for (let i = 0; i < 200; i++) {
      const ev = rollEvent(1, 1);
      counts[ev]++;
    }
    // エリア1: battle=0.5 が最多
    expect(counts.battle).toBeGreaterThan(counts.rest);
    expect(counts.battle).toBeGreaterThan(counts.treasure);
    expect(counts.battle).toBeGreaterThan(counts.trap);
  });
});

describe("generateUpcomingEvents", () => {
  it("step=1 で 3つ返る", () => {
    const events = generateUpcomingEvents(1, 1);
    expect(events).toHaveLength(3);
  });

  it("step=4 で 2つ返る（step5,6）、最後が boss", () => {
    const events = generateUpcomingEvents(1, 4);
    expect(events).toHaveLength(2);
    expect(events[events.length - 1].type).toBe("boss");
  });

  it("step=5 で 1つ返る（boss）", () => {
    const events = generateUpcomingEvents(1, 5);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("boss");
  });

  it("step=6 で 空配列", () => {
    const events = generateUpcomingEvents(1, 6);
    expect(events).toHaveLength(0);
  });

  it("step=3 で 3つ返る（step4,5,6）、最後が boss", () => {
    const events = generateUpcomingEvents(1, 3);
    expect(events).toHaveLength(3);
    expect(events[2].type).toBe("boss");
  });

  it("各要素が type を持つ UpcomingEvent である", () => {
    const events = generateUpcomingEvents(1, 1);
    const validTypes = ["battle", "rest", "treasure", "trap", "boss"];
    for (const ev of events) {
      expect(validTypes).toContain(ev.type);
    }
  });

  it("battle/boss イベントに enemyElement が含まれる", () => {
    // 十分な回数で battle/boss が出るまで試す
    const validElements = ["water", "earth", "thunder"];
    for (let i = 0; i < 50; i++) {
      const events = generateUpcomingEvents(1, 3); // step4,5,6 → 最後がboss
      const bossEvent = events.find((e) => e.type === "boss");
      if (bossEvent) {
        expect(validElements).toContain(bossEvent.enemyElement);
      }
      for (const ev of events) {
        if (ev.type === "battle" || ev.type === "boss") {
          expect(validElements).toContain(ev.enemyElement);
        }
      }
    }
  });

  it("rest/treasure/trap イベントに enemyElement が含まれない", () => {
    for (let i = 0; i < 50; i++) {
      const events = generateUpcomingEvents(1, 1);
      for (const ev of events) {
        if (ev.type === "rest" || ev.type === "treasure" || ev.type === "trap") {
          expect(ev.enemyElement).toBeUndefined();
        }
      }
    }
  });
});
