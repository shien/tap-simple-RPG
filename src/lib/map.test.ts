import { describe, it, expect } from "vitest";
import { advanceStep, advanceArea, getCurrentEvent } from "./map";
import type { GameState, UpcomingEvent } from "./types";
import { createInitialPlayer } from "./player";

const defaultAreaEvents: UpcomingEvent[] = [
  { type: "battle", enemyElement: "water" },
  { type: "rest" },
  { type: "treasure" },
  { type: "rest" },
  { type: "battle", enemyElement: "earth" },
  { type: "boss", enemyElement: "thunder" },
];

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    player: createInitialPlayer(),
    currentArea: 1,
    currentStep: 1,
    areaEvents: defaultAreaEvents,
    upcomingEvents: [{ type: "battle" }, { type: "rest" }, { type: "treasure" }],
    phase: "exploration",
    ...overrides,
  };
}

describe("advanceStep", () => {
  it("currentStep が +1 される", () => {
    const state = makeState({ currentStep: 1 });
    const next = advanceStep(state);
    expect(next.currentStep).toBe(2);
  });

  it("upcomingEvents が areaEvents から導出される", () => {
    const state = makeState({ currentStep: 1 });
    const next = advanceStep(state);
    // step=2 からの先読み → step3,4,5 → 3つ
    expect(next.upcomingEvents).toHaveLength(3);
    expect(next.upcomingEvents[0]).toBe(defaultAreaEvents[2]); // step3
    expect(next.upcomingEvents[1]).toBe(defaultAreaEvents[3]); // step4
    expect(next.upcomingEvents[2]).toBe(defaultAreaEvents[4]); // step5
  });

  it("step=4→5 のとき、先読みに boss が含まれる", () => {
    const state = makeState({ currentStep: 4 });
    const next = advanceStep(state);
    expect(next.currentStep).toBe(5);
    // step=5 からの先読み → [boss]
    expect(next.upcomingEvents.some((e) => e.type === "boss")).toBe(true);
  });

  it("areaEvents は変更されない", () => {
    const state = makeState({ currentStep: 1 });
    const next = advanceStep(state);
    expect(next.areaEvents).toBe(state.areaEvents);
  });

  it("元のstateは変更されない（イミュータブル）", () => {
    const state = makeState({ currentStep: 1 });
    advanceStep(state);
    expect(state.currentStep).toBe(1);
  });
});

describe("advanceArea", () => {
  it("currentArea +1, currentStep=1", () => {
    const state = makeState({ currentArea: 1, currentStep: 6 });
    const next = advanceArea(state);
    expect(next.currentArea).toBe(2);
    expect(next.currentStep).toBe(1);
  });

  it("areaEvents が新エリアで再生成される", () => {
    const state = makeState({ currentArea: 1, currentStep: 6 });
    const next = advanceArea(state);
    expect(next.areaEvents).toHaveLength(6);
    expect(next.areaEvents[5].type).toBe("boss");
    // 新しいオブジェクト（再生成されている）
    expect(next.areaEvents).not.toBe(state.areaEvents);
  });

  it("upcomingEvents が新エリアで再生成される", () => {
    const state = makeState({ currentArea: 1, currentStep: 6 });
    const next = advanceArea(state);
    expect(next.upcomingEvents.length).toBe(3);
  });

  it("エリア8 → エリア1 に戻る", () => {
    const state = makeState({ currentArea: 8, currentStep: 6 });
    const next = advanceArea(state);
    expect(next.currentArea).toBe(1);
    expect(next.currentStep).toBe(1);
  });

  it("元のstateは変更されない（イミュータブル）", () => {
    const state = makeState({ currentArea: 3, currentStep: 6 });
    advanceArea(state);
    expect(state.currentArea).toBe(3);
  });
});

describe("getCurrentEvent", () => {
  it("areaEvents からイベントタイプを返す", () => {
    const state = makeState({ currentStep: 1 });
    expect(getCurrentEvent(state)).toBe("battle");
  });

  it("step=2 で rest を返す", () => {
    const state = makeState({ currentStep: 2 });
    expect(getCurrentEvent(state)).toBe("rest");
  });

  it("step=6 で boss を返す", () => {
    const state = makeState({ currentStep: 6 });
    expect(getCurrentEvent(state)).toBe("boss");
  });

  it("areaEvents の内容と一致する", () => {
    for (let step = 1; step <= 6; step++) {
      const state = makeState({ currentStep: step });
      expect(getCurrentEvent(state)).toBe(defaultAreaEvents[step - 1].type);
    }
  });
});
