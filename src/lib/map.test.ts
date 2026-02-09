import { describe, it, expect } from "vitest";
import { advanceStep, advanceArea, getCurrentEvent } from "./map";
import type { GameState, UpcomingEvent } from "./types";
import { createInitialPlayer } from "./player";
import { STEPS_PER_AREA } from "./constants";

const defaultAreaEvents: UpcomingEvent[] = [
  { type: "battle", enemyElement: "water" },   // step1
  { type: "treasure" },                         // step2
  { type: "treasure" },                         // step3
  { type: "battle", enemyElement: "earth" },    // step4
  { type: "battle", enemyElement: "earth" },    // step5
  { type: "treasure" },                         // step6
  { type: "battle", enemyElement: "thunder" },  // step7
  { type: "boss", enemyElement: "thunder" },    // step8
];

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    player: createInitialPlayer(),
    currentArea: 1,
    currentStep: 1,
    areaEvents: defaultAreaEvents,
    upcomingEvents: [{ type: "treasure" }, { type: "treasure" }, { type: "battle" }],
    phase: "exploration",
    healCount: 3,
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

  it(`step=${STEPS_PER_AREA - 2}→${STEPS_PER_AREA - 1} のとき、先読みに boss が含まれる`, () => {
    const state = makeState({ currentStep: STEPS_PER_AREA - 2 });
    const next = advanceStep(state);
    expect(next.currentStep).toBe(STEPS_PER_AREA - 1);
    // 最終stepの先読み → [boss]
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
    const state = makeState({ currentArea: 1, currentStep: STEPS_PER_AREA });
    const next = advanceArea(state);
    expect(next.currentArea).toBe(2);
    expect(next.currentStep).toBe(1);
  });

  it("areaEvents が新エリアで再生成される", () => {
    const state = makeState({ currentArea: 1, currentStep: STEPS_PER_AREA });
    const next = advanceArea(state);
    expect(next.areaEvents).toHaveLength(STEPS_PER_AREA);
    expect(next.areaEvents[STEPS_PER_AREA - 1].type).toBe("boss");
    // 新しいオブジェクト（再生成されている）
    expect(next.areaEvents).not.toBe(state.areaEvents);
  });

  it("upcomingEvents が新エリアで再生成される", () => {
    const state = makeState({ currentArea: 1, currentStep: STEPS_PER_AREA });
    const next = advanceArea(state);
    expect(next.upcomingEvents.length).toBe(3);
  });

  it("エリア8 → エリア1 に戻る", () => {
    const state = makeState({ currentArea: 8, currentStep: STEPS_PER_AREA });
    const next = advanceArea(state);
    expect(next.currentArea).toBe(1);
    expect(next.currentStep).toBe(1);
  });

  it("元のstateは変更されない（イミュータブル）", () => {
    const state = makeState({ currentArea: 3, currentStep: STEPS_PER_AREA });
    advanceArea(state);
    expect(state.currentArea).toBe(3);
  });
});

describe("getCurrentEvent", () => {
  it("areaEvents からイベントタイプを返す", () => {
    const state = makeState({ currentStep: 1 });
    expect(getCurrentEvent(state)).toBe("battle");
  });

  it("step=2 で treasure を返す", () => {
    const state = makeState({ currentStep: 2 });
    expect(getCurrentEvent(state)).toBe("treasure");
  });

  it(`step=${STEPS_PER_AREA} で boss を返す`, () => {
    const state = makeState({ currentStep: STEPS_PER_AREA });
    expect(getCurrentEvent(state)).toBe("boss");
  });

  it("areaEvents の内容と一致する", () => {
    for (let step = 1; step <= STEPS_PER_AREA; step++) {
      const state = makeState({ currentStep: step });
      expect(getCurrentEvent(state)).toBe(defaultAreaEvents[step - 1].type);
    }
  });
});
