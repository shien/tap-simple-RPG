import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createNewGame,
  processEvent,
  handleBattleVictory,
  handleBossClear,
  handleDeath,
  isGameClear,
} from "./game";
import * as mapModule from "./map";
import type { GameState } from "./types";

// getCurrentEvent をモック可能にする
vi.mock("./map", async () => {
  const actual = await vi.importActual<typeof import("./map")>("./map");
  return {
    ...actual,
    getCurrentEvent: vi.fn(actual.getCurrentEvent),
  };
});

const getCurrentEventMock = vi.mocked(mapModule.getCurrentEvent);

beforeEach(() => {
  getCurrentEventMock.mockRestore();
});

// テスト用のstate生成ヘルパー
function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createNewGame();
  return { ...base, ...overrides };
}

describe("createNewGame", () => {
  it("初期状態が正しい（Lv1, area=1, step=1, exploration）", () => {
    const state = createNewGame();

    expect(state.player.level).toBe(1);
    expect(state.player.hp).toBe(50n);
    expect(state.player.maxHp).toBe(50n);
    expect(state.player.atk).toBe(10n);
    expect(state.player.exp).toBe(0n);
    expect(state.player.gold).toBe(0n);
    expect(state.currentArea).toBe(1);
    expect(state.currentStep).toBe(1);
    expect(state.phase).toBe("exploration");
  });

  it("upcomingEvents が3件存在する", () => {
    const state = createNewGame();

    // step=1 → 先読み: step 2,3,4 → 3件
    expect(state.upcomingEvents).toHaveLength(3);
    for (const ev of state.upcomingEvents) {
      expect(["battle", "rest", "treasure", "trap", "boss"]).toContain(ev.type);
    }
  });

  it("武器は「棒」で属性がランダム", () => {
    const state = createNewGame();

    expect(state.player.weapon.name).toBe("棒");
    expect(["water", "earth", "thunder"]).toContain(state.player.weapon.element);
    expect(state.player.weapon.attackBonus).toBe(0n);
  });
});

describe("processEvent", () => {
  describe("battle / boss", () => {
    it("battle イベントで phase が 'battle' になる", () => {
      const state = makeState({ currentStep: 1 });
      getCurrentEventMock.mockReturnValueOnce("battle");

      const after = processEvent(state);

      expect(after.phase).toBe("battle");
      expect(after.player.hp).toBe(state.player.hp);
      expect(after.player.gold).toBe(state.player.gold);
    });

    it("boss イベントで phase が 'battle' になる", () => {
      const state = makeState({ currentStep: 6 });
      getCurrentEventMock.mockReturnValueOnce("boss");

      const after = processEvent(state);

      expect(after.phase).toBe("battle");
    });
  });

  describe("rest", () => {
    it("HP が maxHP の 30% 回復する", () => {
      const state = makeState();
      state.player = { ...state.player, hp: 20n, maxHp: 50n };
      getCurrentEventMock.mockReturnValueOnce("rest");

      const after = processEvent({ ...state, player: { ...state.player } });

      // 50 * 0.3 = 15 → 20 + 15 = 35
      expect(after.player.hp).toBe(35n);
    });

    it("HP が maxHP を超えない", () => {
      const state = makeState();
      state.player = { ...state.player, hp: 45n, maxHp: 50n };
      getCurrentEventMock.mockReturnValueOnce("rest");

      const after = processEvent({ ...state, player: { ...state.player } });

      // 45 + 15 = 60 → capped at 50
      expect(after.player.hp).toBe(50n);
    });

    it("phase は変化しない", () => {
      const state = makeState();
      state.player = { ...state.player, hp: 20n };
      getCurrentEventMock.mockReturnValueOnce("rest");

      const after = processEvent({ ...state, player: { ...state.player } });

      expect(after.phase).toBe("exploration");
    });
  });

  describe("treasure", () => {
    it("EXP と Gold が増加する", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("treasure");

      const after = processEvent(state);

      expect(after.player.exp).toBeGreaterThan(state.player.exp);
      expect(after.player.gold).toBeGreaterThan(state.player.gold);
    });

    it("エリア1で EXP=5, Gold=10 加算される", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("treasure");

      const after = processEvent(state);

      expect(after.player.exp).toBe(5n);
      expect(after.player.gold).toBe(10n);
    });
  });

  describe("trap", () => {
    it("HP が maxHP の 20% 減少する", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("trap");

      const after = processEvent(state);

      // 50 * 0.2 = 10 → 50 - 10 = 40
      expect(after.player.hp).toBe(40n);
    });

    it("HP が 0 になったら phase = 'gameover'", () => {
      const state = makeState();
      state.player = { ...state.player, hp: 5n, maxHp: 50n };
      getCurrentEventMock.mockReturnValueOnce("trap");

      const after = processEvent({ ...state, player: { ...state.player } });

      // damage = 50*0.2 = 10 → 5-10 = 0 (clamped)
      expect(after.player.hp).toBe(0n);
      expect(after.phase).toBe("gameover");
    });

    it("HP が残っていれば phase は変わらない", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("trap");

      const after = processEvent(state);

      expect(after.phase).toBe("exploration");
    });
  });
});

describe("handleBattleVictory", () => {
  it("通常戦闘後 phase = 'exploration'", () => {
    const state = makeState({ currentStep: 3, phase: "battle" });
    const after = handleBattleVictory(state);

    expect(after.phase).toBe("exploration");
    expect(after.currentStep).toBe(3);
    expect(after.currentArea).toBe(1);
  });

  it("ボス（step=6）後に次エリアへ遷移", () => {
    const state = makeState({
      currentStep: 6,
      currentArea: 1,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    expect(after.currentArea).toBe(2);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("exploration");
  });

  it("エリア7ボス撃破でエリア8へ", () => {
    const state = makeState({
      currentStep: 6,
      currentArea: 7,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    expect(after.currentArea).toBe(8);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("exploration");
  });

  it("エリア8ボス撃破でリスタート（クリア）", () => {
    const state = makeState({
      currentStep: 6,
      currentArea: 8,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    // createNewGame() と同等
    expect(after.currentArea).toBe(1);
    expect(after.currentStep).toBe(1);
    expect(after.player.level).toBe(1);
    expect(after.phase).toBe("exploration");
  });
});

describe("handleBossClear", () => {
  it("エリア1→2 へ遷移", () => {
    const state = makeState({ currentStep: 6, currentArea: 1 });
    const after = handleBossClear(state);

    expect(after.currentArea).toBe(2);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("exploration");
    expect(after.upcomingEvents.length).toBeGreaterThan(0);
  });

  it("エリア8→リスタート", () => {
    const state = makeState({ currentStep: 6, currentArea: 8 });
    const after = handleBossClear(state);

    expect(after.currentArea).toBe(1);
    expect(after.currentStep).toBe(1);
    expect(after.player.level).toBe(1);
  });
});

describe("handleDeath", () => {
  it("全進行リセット（Lv1, area=1, step=1）", () => {
    const after = handleDeath();

    expect(after.player.level).toBe(1);
    expect(after.player.hp).toBe(50n);
    expect(after.player.exp).toBe(0n);
    expect(after.player.gold).toBe(0n);
    expect(after.currentArea).toBe(1);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("exploration");
  });
});

describe("isGameClear", () => {
  it("エリア8 step=6 で true", () => {
    const state = makeState({ currentArea: 8, currentStep: 6 });
    expect(isGameClear(state)).toBe(true);
  });

  it("エリア8 step!=6 で false", () => {
    const state = makeState({ currentArea: 8, currentStep: 3 });
    expect(isGameClear(state)).toBe(false);
  });

  it("エリア8 以外で false", () => {
    const state = makeState({ currentArea: 3, currentStep: 6 });
    expect(isGameClear(state)).toBe(false);
  });

  it("エリア1 step=1 で false", () => {
    const state = makeState({ currentArea: 1, currentStep: 1 });
    expect(isGameClear(state)).toBe(false);
  });
});

describe("イミュータブル性", () => {
  it("processEvent は元の state を変更しない", () => {
    const state = makeState();
    const original = JSON.stringify(state, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v
    );

    getCurrentEventMock.mockReturnValueOnce("trap");
    processEvent(state);

    const after = JSON.stringify(state, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v
    );
    expect(after).toBe(original);
  });

  it("handleBattleVictory は元の state を変更しない", () => {
    const state = makeState({ currentStep: 3, phase: "battle" });
    const originalArea = state.currentArea;
    const originalStep = state.currentStep;

    handleBattleVictory(state);

    expect(state.currentArea).toBe(originalArea);
    expect(state.currentStep).toBe(originalStep);
    expect(state.phase).toBe("battle");
  });
});
