import { describe, it, expect } from "vitest";
import { advanceStep, advanceArea, getCurrentEvent } from "./map";
import type { GameState } from "./types";
import { createInitialPlayer } from "./player";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    player: createInitialPlayer(),
    currentArea: 1,
    currentStep: 1,
    upcomingEvents: ["battle", "rest", "treasure"],
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

  it("upcomingEvents が再生成される", () => {
    const state = makeState({ currentStep: 1 });
    const next = advanceStep(state);
    // step=2 からの先読み → 3つ（step3,4,5）
    expect(next.upcomingEvents.length).toBeLessThanOrEqual(3);
    expect(next.upcomingEvents.length).toBeGreaterThan(0);
  });

  it("step=4→5 のとき、先読みに boss が含まれる", () => {
    const state = makeState({ currentStep: 4 });
    const next = advanceStep(state);
    expect(next.currentStep).toBe(5);
    // step=5 からの先読み → [boss]
    expect(next.upcomingEvents).toContain("boss");
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
  it("step=6 で boss が返る", () => {
    const state = makeState({ currentStep: 6 });
    expect(getCurrentEvent(state)).toBe("boss");
  });

  it("step=1〜5 で有効なイベントが返る", () => {
    const valid = ["battle", "rest", "treasure", "trap"];
    for (let step = 1; step <= 5; step++) {
      const state = makeState({ currentStep: step });
      expect(valid).toContain(getCurrentEvent(state));
    }
  });
});
