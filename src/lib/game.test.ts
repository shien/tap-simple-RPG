import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createNewGame,
  processEvent,
  handleBattleVictory,
  handleBossClear,
  handleDeath,
  isGameClear,
  healInPrep,
  startBattle,
  processTreasureHeal,
  processTreasureWeapon,
  confirmAreaMove,
  processShopPurchase,
  processShopLeave,
} from "./game";
import * as mapModule from "./map";
import type { GameState } from "./types";
import { STEPS_PER_AREA } from "./constants";

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
    expect(state.player.items).toEqual([]);
    expect(state.currentArea).toBe(1);
    expect(state.currentStep).toBe(1);
    expect(state.phase).toBe("exploration");
    expect(state.healCount).toBe(3);
  });

  it(`areaEvents が${STEPS_PER_AREA}件存在し、最後がboss`, () => {
    const state = createNewGame();

    expect(state.areaEvents).toHaveLength(STEPS_PER_AREA);
    expect(state.areaEvents[STEPS_PER_AREA - 1].type).toBe("boss");
    for (const ev of state.areaEvents) {
      expect(["battle", "treasure", "boss", "shop"]).toContain(ev.type);
    }
  });

  it("upcomingEvents が3件存在する", () => {
    const state = createNewGame();

    // step=1 → 先読み: step 2,3,4 → 3件
    expect(state.upcomingEvents).toHaveLength(3);
    for (const ev of state.upcomingEvents) {
      expect(["battle", "treasure", "boss", "shop"]).toContain(ev.type);
    }
  });

  it("upcomingEvents が areaEvents と一貫性がある", () => {
    const state = createNewGame();

    // step=1 → 先読み: step 2,3,4
    expect(state.upcomingEvents[0]).toBe(state.areaEvents[1]);
    expect(state.upcomingEvents[1]).toBe(state.areaEvents[2]);
    expect(state.upcomingEvents[2]).toBe(state.areaEvents[3]);
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
    it("battle イベントで phase が 'battlePrep' になる", () => {
      const state = makeState({ currentStep: 1 });
      getCurrentEventMock.mockReturnValueOnce("battle");

      const after = processEvent(state);

      expect(after.phase).toBe("battlePrep");
      expect(after.player.hp).toBe(state.player.hp);
      expect(after.player.gold).toBe(state.player.gold);
    });

    it("boss イベントで phase が 'battlePrep' になる", () => {
      const state = makeState({ currentStep: STEPS_PER_AREA });
      getCurrentEventMock.mockReturnValueOnce("boss");

      const after = processEvent(state);

      expect(after.phase).toBe("battlePrep");
    });
  });

  describe("treasure", () => {
    it("treasure イベントで phase が 'treasureSelect' になる", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("treasure");

      const after = processEvent(state);

      expect(after.phase).toBe("treasureSelect");
    });

    it("treasure イベントで player のステータスが変化しない", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("treasure");

      const after = processEvent(state);

      expect(after.player.hp).toBe(state.player.hp);
      expect(after.player.gold).toBe(state.player.gold);
      expect(after.player.exp).toBe(state.player.exp);
    });
  });

  describe("shop", () => {
    it("shop イベントで phase が 'shop' になる", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("shop");

      const after = processEvent(state);

      expect(after.phase).toBe("shop");
    });

    it("shop イベントで player のステータスが変化しない", () => {
      const state = makeState();
      getCurrentEventMock.mockReturnValueOnce("shop");

      const after = processEvent(state);

      expect(after.player.hp).toBe(state.player.hp);
      expect(after.player.gold).toBe(state.player.gold);
    });
  });

});

describe("processShopPurchase", () => {
  it("ゴールドが十分ならアイテムが追加されゴールドが減る", () => {
    const state = makeState({ phase: "shop" });
    state.player = { ...state.player, gold: 100n };

    const after = processShopPurchase({ ...state, player: { ...state.player } }, "heal40", 60n);

    expect(after.player.gold).toBe(40n);
    expect(after.player.items).toHaveLength(1);
    expect(after.player.items[0].type).toBe("heal40");
  });

  it("ゴールドが不足なら変化しない", () => {
    const state = makeState({ phase: "shop" });
    state.player = { ...state.player, gold: 10n };

    const after = processShopPurchase({ ...state, player: { ...state.player } }, "heal40", 60n);

    expect(after.player.gold).toBe(10n);
    expect(after.player.items).toHaveLength(0);
  });

  it("shop以外のphaseでは変化しない", () => {
    const state = makeState({ phase: "exploration" });
    state.player = { ...state.player, gold: 1000n };

    const after = processShopPurchase(state, "heal40", 60n);

    expect(after).toBe(state);
  });

  it("複数回購入できる", () => {
    const state = makeState({ phase: "shop" });
    state.player = { ...state.player, gold: 200n };

    let after = processShopPurchase({ ...state, player: { ...state.player } }, "heal40", 60n);
    after = processShopPurchase(after, "heal40", 60n);

    expect(after.player.gold).toBe(80n);
    expect(after.player.items).toHaveLength(2);
  });
});

describe("processShopLeave", () => {
  it("shop → exploration に遷移する", () => {
    const state = makeState({ phase: "shop" });

    const after = processShopLeave(state);

    expect(after.phase).toBe("exploration");
  });

  it("shop以外のphaseでは変化しない", () => {
    const state = makeState({ phase: "exploration" });

    const after = processShopLeave(state);

    expect(after).toBe(state);
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

  it(`ボス（step=${STEPS_PER_AREA}）後に次エリアへ遷移（areaMove画面）`, () => {
    const state = makeState({
      currentStep: STEPS_PER_AREA,
      currentArea: 1,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    expect(after.currentArea).toBe(2);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("areaMove");
  });

  it("エリア7ボス撃破でエリア8へ（areaMove画面）", () => {
    const state = makeState({
      currentStep: STEPS_PER_AREA,
      currentArea: 7,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    expect(after.currentArea).toBe(8);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("areaMove");
  });

  it("エリア8ボス撃破でクリア画面に遷移", () => {
    const state = makeState({
      currentStep: STEPS_PER_AREA,
      currentArea: 8,
      phase: "battle",
    });
    const after = handleBattleVictory(state);

    expect(after.phase).toBe("gameClear");
    expect(after.currentArea).toBe(8);
  });
});

describe("handleBossClear", () => {
  it("エリア1→2 へ遷移（areaMove画面）", () => {
    const state = makeState({ currentStep: STEPS_PER_AREA, currentArea: 1, healCount: 3 });
    const after = handleBossClear(state);

    expect(after.currentArea).toBe(2);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("areaMove");
    expect(after.upcomingEvents.length).toBeGreaterThan(0);
  });

  it("ボス撃破で healCount が +1 される", () => {
    const state = makeState({ currentStep: STEPS_PER_AREA, currentArea: 1, healCount: 3 });
    const after = handleBossClear(state);

    expect(after.healCount).toBe(4);
  });

  it("エリア8→クリア画面に遷移（状態は維持）", () => {
    const state = makeState({ currentStep: STEPS_PER_AREA, currentArea: 8, healCount: 5 });
    const after = handleBossClear(state);

    expect(after.phase).toBe("gameClear");
    expect(after.currentArea).toBe(8);
    expect(after.healCount).toBe(5);
  });
});

describe("confirmAreaMove", () => {
  it("areaMove → exploration に遷移する", () => {
    const state = makeState({ phase: "areaMove", currentArea: 2, currentStep: 1 });

    const after = confirmAreaMove(state);

    expect(after.phase).toBe("exploration");
    expect(after.currentArea).toBe(2);
    expect(after.currentStep).toBe(1);
  });

  it("areaMove 以外では変化しない", () => {
    const state = makeState({ phase: "exploration" });

    const after = confirmAreaMove(state);

    expect(after.phase).toBe("exploration");
    expect(after).toBe(state);
  });
});

describe("handleDeath", () => {
  it("全進行リセット（Lv1, area=1, step=1, healCount=3）", () => {
    const after = handleDeath();

    expect(after.player.level).toBe(1);
    expect(after.player.hp).toBe(50n);
    expect(after.player.exp).toBe(0n);
    expect(after.player.gold).toBe(0n);
    expect(after.player.items).toEqual([]);
    expect(after.currentArea).toBe(1);
    expect(after.currentStep).toBe(1);
    expect(after.phase).toBe("exploration");
    expect(after.healCount).toBe(3);
  });
});

describe("isGameClear", () => {
  it(`エリア8 step=${STEPS_PER_AREA} で true`, () => {
    const state = makeState({ currentArea: 8, currentStep: STEPS_PER_AREA });
    expect(isGameClear(state)).toBe(true);
  });

  it(`エリア8 step!=${STEPS_PER_AREA} で false`, () => {
    const state = makeState({ currentArea: 8, currentStep: 3 });
    expect(isGameClear(state)).toBe(false);
  });

  it("エリア8 以外で false", () => {
    const state = makeState({ currentArea: 3, currentStep: STEPS_PER_AREA });
    expect(isGameClear(state)).toBe(false);
  });

  it("エリア1 step=1 で false", () => {
    const state = makeState({ currentArea: 1, currentStep: 1 });
    expect(isGameClear(state)).toBe(false);
  });
});

describe("healInPrep", () => {
  it("HP が maxHP の 70% 回復する", () => {
    const state = makeState({ healCount: 3 });
    state.player = { ...state.player, hp: 20n, maxHp: 100n };

    const after = healInPrep({ ...state, player: { ...state.player } });

    // 100 * 0.7 = 70 → 20 + 70 = 90
    expect(after.player.hp).toBe(90n);
    expect(after.healCount).toBe(2);
  });

  it("HP が maxHP を超えない", () => {
    const state = makeState({ healCount: 3 });
    state.player = { ...state.player, hp: 45n, maxHp: 50n };

    const after = healInPrep({ ...state, player: { ...state.player } });

    expect(after.player.hp).toBe(50n);
  });

  it("healCount が 0 のとき回復しない", () => {
    const state = makeState({ healCount: 0 });
    state.player = { ...state.player, hp: 20n, maxHp: 50n };

    const after = healInPrep({ ...state, player: { ...state.player } });

    expect(after.player.hp).toBe(20n);
    expect(after.healCount).toBe(0);
  });

  it("healCount がデクリメントされる", () => {
    const state = makeState({ healCount: 2 });

    const after = healInPrep(state);

    expect(after.healCount).toBe(1);
  });
});

describe("startBattle", () => {
  it("battlePrep → battle に遷移する", () => {
    const state = makeState({ phase: "battlePrep" });

    const after = startBattle(state);

    expect(after.phase).toBe("battle");
  });

  it("battlePrep 以外では変化しない", () => {
    const state = makeState({ phase: "exploration" });

    const after = startBattle(state);

    expect(after.phase).toBe("exploration");
  });
});

describe("processTreasureHeal", () => {
  it("HP が maxHP の 70% 回復する", () => {
    const state = makeState({ phase: "treasureSelect" });
    state.player = { ...state.player, hp: 20n, maxHp: 100n };

    const after = processTreasureHeal({ ...state, player: { ...state.player } });

    expect(after.player.hp).toBe(90n);
    expect(after.phase).toBe("exploration");
  });

  it("HP が maxHP を超えない", () => {
    const state = makeState({ phase: "treasureSelect" });
    state.player = { ...state.player, hp: 45n, maxHp: 50n };

    const after = processTreasureHeal({ ...state, player: { ...state.player } });

    expect(after.player.hp).toBe(50n);
  });

  it("treasureSelect 以外では変化しない", () => {
    const state = makeState({ phase: "exploration" });
    state.player = { ...state.player, hp: 20n, maxHp: 100n };

    const after = processTreasureHeal({ ...state, player: { ...state.player } });

    expect(after.player.hp).toBe(20n);
    expect(after.phase).toBe("exploration");
  });

  it("回復後に phase が exploration に戻る", () => {
    const state = makeState({ phase: "treasureSelect" });

    const after = processTreasureHeal(state);

    expect(after.phase).toBe("exploration");
  });
});

describe("processTreasureWeapon", () => {
  const testWeapon = { name: "テスト剣", element: "water" as const, attackBonus: 50n };

  it("武器が装備される", () => {
    const state = makeState({ phase: "treasureSelect" });

    const after = processTreasureWeapon(state, testWeapon);

    expect(after.player.weapon).toEqual(testWeapon);
    expect(after.phase).toBe("exploration");
  });

  it("treasureSelect 以外では変化しない", () => {
    const state = makeState({ phase: "exploration" });
    const originalWeapon = state.player.weapon;

    const after = processTreasureWeapon(state, testWeapon);

    expect(after.player.weapon).toEqual(originalWeapon);
  });

  it("武器選択後に phase が exploration に戻る", () => {
    const state = makeState({ phase: "treasureSelect" });

    const after = processTreasureWeapon(state, testWeapon);

    expect(after.phase).toBe("exploration");
  });
});

describe("イミュータブル性", () => {
  it("processEvent は元の state を変更しない", () => {
    const state = makeState();
    const original = JSON.stringify(state, (_k, v) =>
      typeof v === "bigint" ? v.toString() : v
    );

    getCurrentEventMock.mockReturnValueOnce("treasure");
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
