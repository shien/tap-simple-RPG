import { describe, it, expect } from "vitest";
import {
  createBattleState,
  playerAttack,
  enemyAttack,
  checkBattleResult,
  processBattleRewards,
} from "./battle";
import type { Player, Enemy, BattleState } from "./types";

// テスト用のプレイヤーを生成
function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    level: 1,
    exp: 0n,
    hp: 50n,
    maxHp: 50n,
    atk: 10n,
    gold: 0n,
    weapon: { name: "棒", element: "fire", attackBonus: 5n },
    ...overrides,
  };
}

// テスト用の敵を生成
function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    name: "スライム",
    element: "ice",
    hp: 30n,
    maxHp: 30n,
    atk: 5n,
    expReward: 8n,
    goldReward: 3n,
    isAbnormal: false,
    abnormalTier: null,
    ...overrides,
  };
}

describe("createBattleState", () => {
  it("result='ongoing', turnCount=0 で初期化される", () => {
    const player = makePlayer();
    const enemy = makeEnemy();
    const state = createBattleState(player, enemy);

    expect(state.result).toBe("ongoing");
    expect(state.turnCount).toBe(0);
    expect(state.player).toEqual(player);
    expect(state.enemy).toEqual(enemy);
  });
});

describe("playerAttack", () => {
  it("敵HPが正しく減少する", () => {
    const player = makePlayer(); // atk=10 + weapon bonus=5 = 15
    const enemy = makeEnemy({ element: "fire" }); // neutral → ×1
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // neutral: damage = 15n
    expect(after.enemy.hp).toBe(30n - 15n);
    expect(after.turnCount).toBe(1);
  });

  it("属性有利で2倍ダメージ", () => {
    // fire > ice → advantage ×2
    const player = makePlayer({
      weapon: { name: "炎の剣", element: "fire", attackBonus: 0n },
      atk: 10n,
    });
    const enemy = makeEnemy({ element: "ice", hp: 100n, maxHp: 100n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // damage = (10+0) * 2 = 20
    expect(after.enemy.hp).toBe(80n);
  });

  it("属性不利で1/10ダメージ（最低1保証）", () => {
    // fire vs thunder → disadvantage ×0.1
    const player = makePlayer({
      weapon: { name: "炎の剣", element: "fire", attackBonus: 0n },
      atk: 10n,
    });
    const enemy = makeEnemy({ element: "thunder", hp: 100n, maxHp: 100n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // damage = 10 / 10 = 1
    expect(after.enemy.hp).toBe(99n);
  });

  it("属性不利でatk=1の場合、最低1ダメージ保証", () => {
    const player = makePlayer({
      weapon: { name: "棒", element: "fire", attackBonus: 0n },
      atk: 1n,
    });
    const enemy = makeEnemy({ element: "thunder", hp: 100n, maxHp: 100n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // damage = max(1/10, 1) = 1
    expect(after.enemy.hp).toBe(99n);
  });

  it("result!='ongoing' なら攻撃しない", () => {
    const state: BattleState = {
      player: makePlayer(),
      enemy: makeEnemy(),
      result: "victory",
      turnCount: 5,
    };
    const after = playerAttack(state);

    expect(after).toBe(state); // 同一参照
  });

  it("敵HPが0未満にならない", () => {
    const player = makePlayer({ atk: 1000n });
    const enemy = makeEnemy({ element: "fire", hp: 5n, maxHp: 5n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    expect(after.enemy.hp).toBe(0n);
  });
});

describe("enemyAttack", () => {
  it("プレイヤーHPが敵ATK分減少する", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 8n });
    const state = createBattleState(player, enemy);
    const after = enemyAttack(state);

    expect(after.player.hp).toBe(42n);
  });

  it("プレイヤーHPが0未満にならない", () => {
    const player = makePlayer({ hp: 3n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 100n });
    const state = createBattleState(player, enemy);
    const after = enemyAttack(state);

    expect(after.player.hp).toBe(0n);
  });

  it("result!='ongoing' なら攻撃しない", () => {
    const state: BattleState = {
      player: makePlayer(),
      enemy: makeEnemy(),
      result: "defeat",
      turnCount: 3,
    };
    const after = enemyAttack(state);

    expect(after).toBe(state);
  });
});

describe("checkBattleResult", () => {
  it("敵HP0以下で 'victory'", () => {
    const state: BattleState = {
      player: makePlayer({ hp: 10n }),
      enemy: makeEnemy({ hp: 0n }),
      result: "ongoing",
      turnCount: 1,
    };
    const after = checkBattleResult(state);

    expect(after.result).toBe("victory");
  });

  it("プレイヤーHP0以下で 'defeat'", () => {
    const state: BattleState = {
      player: makePlayer({ hp: 0n }),
      enemy: makeEnemy({ hp: 10n }),
      result: "ongoing",
      turnCount: 1,
    };
    const after = checkBattleResult(state);

    expect(after.result).toBe("defeat");
  });

  it("相打ちは 'defeat'（プレイヤー死亡優先）", () => {
    const state: BattleState = {
      player: makePlayer({ hp: 0n }),
      enemy: makeEnemy({ hp: 0n }),
      result: "ongoing",
      turnCount: 1,
    };
    const after = checkBattleResult(state);

    expect(after.result).toBe("defeat");
  });

  it("両方HP残りで 'ongoing'", () => {
    const state: BattleState = {
      player: makePlayer({ hp: 30n }),
      enemy: makeEnemy({ hp: 20n }),
      result: "ongoing",
      turnCount: 1,
    };
    const after = checkBattleResult(state);

    expect(after.result).toBe("ongoing");
  });
});

describe("processBattleRewards", () => {
  it("勝利時にEXP/Gold加算", () => {
    const state: BattleState = {
      player: makePlayer({ exp: 0n, gold: 0n }),
      enemy: makeEnemy({ expReward: 10n, goldReward: 5n }),
      result: "victory",
      turnCount: 3,
    };
    const after = processBattleRewards(state, 1);

    expect(after.player.exp).toBe(10n);
    expect(after.player.gold).toBe(5n);
  });

  it("異常個体でEXP×100", () => {
    const state: BattleState = {
      player: makePlayer({ exp: 0n, gold: 0n }),
      enemy: makeEnemy({
        expReward: 10n,
        goldReward: 5n,
        isAbnormal: true,
        abnormalTier: 8,
      }),
      result: "victory",
      turnCount: 3,
    };
    const after = processBattleRewards(state, 1);

    expect(after.player.exp).toBe(1000n); // 10 * 100
    expect(after.player.gold).toBe(5n);
  });

  it("武器が更新される", () => {
    const state: BattleState = {
      player: makePlayer(),
      enemy: makeEnemy(),
      result: "victory",
      turnCount: 3,
    };
    const after = processBattleRewards(state, 1);

    // 武器が新しく生成されていることを確認（名前またはattackBonusが変わる可能性）
    expect(after.player.weapon).toBeDefined();
    expect(after.player.weapon.name).toBeDefined();
    expect(["fire", "ice", "thunder"]).toContain(after.player.weapon.element);
  });

  it("result!='victory' なら何もしない", () => {
    const state: BattleState = {
      player: makePlayer({ exp: 5n, gold: 10n }),
      enemy: makeEnemy(),
      result: "defeat",
      turnCount: 3,
    };
    const after = processBattleRewards(state, 1);

    expect(after).toBe(state);
    expect(after.player.exp).toBe(5n);
    expect(after.player.gold).toBe(10n);
  });

  it("ongoing でも何もしない", () => {
    const state: BattleState = {
      player: makePlayer({ exp: 0n, gold: 0n }),
      enemy: makeEnemy(),
      result: "ongoing",
      turnCount: 1,
    };
    const after = processBattleRewards(state, 1);

    expect(after).toBe(state);
  });

  it("EXP加算でレベルアップが発生する", () => {
    // Lv1 → 必要EXP = 10*1*1 = 10n
    const state: BattleState = {
      player: makePlayer({ level: 1, exp: 5n }),
      enemy: makeEnemy({ expReward: 10n }),
      result: "victory",
      turnCount: 3,
    };
    const after = processBattleRewards(state, 1);

    // exp = 5 + 10 = 15 ≥ 10 → レベルアップ
    expect(after.player.level).toBeGreaterThanOrEqual(2);
  });
});
