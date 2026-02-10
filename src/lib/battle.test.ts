import { describe, it, expect } from "vitest";
import {
  createBattleState,
  playerAttack,
  enemyAttack,
  activateGuard,
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
    weapon: { name: "棒", element: "water", attackBonus: 5n },
    ...overrides,
  };
}

// テスト用の敵を生成
function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    name: "スライム",
    element: "earth",
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

  it("isGuarding=false で初期化される", () => {
    const state = createBattleState(makePlayer(), makeEnemy());

    expect(state.isGuarding).toBe(false);
  });
});

describe("playerAttack", () => {
  it("敵HPが正しく減少する", () => {
    const player = makePlayer(); // atk=10 + weapon bonus=5 = 15
    const enemy = makeEnemy({ element: "water" }); // neutral → ×1
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // neutral: damage = 15n
    expect(after.enemy.hp).toBe(30n - 15n);
    expect(after.turnCount).toBe(1);
  });

  it("属性有利で2倍ダメージ", () => {
    // water > earth → advantage ×2
    const player = makePlayer({
      weapon: { name: "水の剣", element: "water", attackBonus: 0n },
      atk: 10n,
    });
    const enemy = makeEnemy({ element: "earth", hp: 100n, maxHp: 100n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    // damage = (10+0) * 2 = 20
    expect(after.enemy.hp).toBe(80n);
  });

  it("属性不利で1/10ダメージ（最低1保証）", () => {
    // water vs thunder → disadvantage ×0.1
    const player = makePlayer({
      weapon: { name: "水の剣", element: "water", attackBonus: 0n },
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
      weapon: { name: "棒", element: "water", attackBonus: 0n },
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = playerAttack(state);

    expect(after).toBe(state); // 同一参照
  });

  it("敵HPが0未満にならない", () => {
    const player = makePlayer({ atk: 1000n });
    const enemy = makeEnemy({ element: "water", hp: 5n, maxHp: 5n });
    const state = createBattleState(player, enemy);
    const after = playerAttack(state);

    expect(after.enemy.hp).toBe(0n);
  });
});

describe("activateGuard", () => {
  it("isGuarding=false の時、isGuarding=true になる", () => {
    const state = createBattleState(makePlayer(), makeEnemy());
    const after = activateGuard(state);

    expect(after.isGuarding).toBe(true);
  });

  it("既に isGuarding=true の時、状態は変わらない", () => {
    const state = createBattleState(makePlayer(), makeEnemy());
    const guarding = activateGuard(state);
    const after = activateGuard(guarding);

    expect(after).toBe(guarding);
  });

  it("result!='ongoing' の時、状態は変わらない", () => {
    const state: BattleState = {
      player: makePlayer(),
      enemy: makeEnemy(),
      result: "victory",
      turnCount: 1,
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = activateGuard(state);

    expect(after).toBe(state);
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = enemyAttack(state);

    expect(after).toBe(state);
  });

  it("isGuarding=true の時、プレイヤーは1/10ダメージを受ける", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 20n });
    const state = activateGuard(createBattleState(player, enemy));
    const after = enemyAttack(state);

    // 20 / 10 = 2 → HP: 50 - 2 = 48
    expect(after.player.hp).toBe(48n);
  });

  it("isGuarding=true でATKが10未満の時、最低1ダメージを受ける", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 5n });
    const state = activateGuard(createBattleState(player, enemy));
    const after = enemyAttack(state);

    // 5 / 10 = 0 → 最低1 → HP: 50 - 1 = 49
    expect(after.player.hp).toBe(49n);
  });

  it("isGuarding=true の時、ガード後に isGuarding=false になる", () => {
    const state = activateGuard(createBattleState(makePlayer(), makeEnemy()));
    const after = enemyAttack(state);

    expect(after.isGuarding).toBe(false);
  });
});

describe("ガードサイクル", () => {
  it("ガード → 1/10ダメージ → 再度ガード → 1/10ダメージ のサイクルが正常に動作する", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 20n });
    let state = createBattleState(player, enemy);

    // 1回目: ガード → 敵攻撃（1/10ダメージ = 2）
    state = activateGuard(state);
    expect(state.isGuarding).toBe(true);
    state = enemyAttack(state);
    expect(state.player.hp).toBe(48n);
    expect(state.isGuarding).toBe(false);

    // 2回目: 再度ガード → 敵攻撃（1/10ダメージ = 2）
    state = activateGuard(state);
    expect(state.isGuarding).toBe(true);
    state = enemyAttack(state);
    expect(state.player.hp).toBe(46n);
    expect(state.isGuarding).toBe(false);
  });
});

describe("ガードカウンター", () => {
  it("ガード成功後、guardCounter=true になる", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 20n });
    let state = createBattleState(player, enemy);

    state = activateGuard(state);
    state = enemyAttack(state);

    expect(state.guardCounter).toBe(true);
    expect(state.isGuarding).toBe(false);
  });

  it("ガードカウンター中の攻撃は敵最大HPの10%が上乗せされる", () => {
    // neutral属性: damage = atk(10) + weapon(5) = 15
    // ガードカウンターボーナス: maxHp(100) / 10 = 10
    // 合計: 25
    const player = makePlayer({ atk: 10n, weapon: { name: "棒", element: "water", attackBonus: 5n } });
    const enemy = makeEnemy({ element: "water", hp: 100n, maxHp: 100n, atk: 20n });
    let state = createBattleState(player, enemy);

    state = activateGuard(state);
    state = enemyAttack(state);
    expect(state.guardCounter).toBe(true);

    state = playerAttack(state);
    expect(state.enemy.hp).toBe(75n); // 100 - 25 = 75
    expect(state.guardCounter).toBe(false);
  });

  it("ガードカウンターなしの通常攻撃ではボーナスが付かない", () => {
    const player = makePlayer({ atk: 10n, weapon: { name: "棒", element: "water", attackBonus: 5n } });
    const enemy = makeEnemy({ element: "water", hp: 100n, maxHp: 100n });
    let state = createBattleState(player, enemy);

    state = playerAttack(state);
    expect(state.enemy.hp).toBe(85n); // 100 - 15 = 85
  });

  it("ガードカウンター中に再度ガードすると、カウンターがリセットされる", () => {
    const player = makePlayer({ hp: 50n, maxHp: 50n });
    const enemy = makeEnemy({ atk: 20n });
    let state = createBattleState(player, enemy);

    // ガード → 敵攻撃 → カウンター発動
    state = activateGuard(state);
    state = enemyAttack(state);
    expect(state.guardCounter).toBe(true);

    // カウンター中に再度ガード → カウンターリセット
    state = activateGuard(state);
    expect(state.guardCounter).toBe(false);
    expect(state.isGuarding).toBe(true);
  });

  it("ガードカウンターのボーナスは1回の攻撃で消費される", () => {
    const player = makePlayer({ atk: 10n, weapon: { name: "棒", element: "water", attackBonus: 5n } });
    const enemy = makeEnemy({ element: "water", hp: 200n, maxHp: 200n, atk: 20n });
    let state = createBattleState(player, enemy);

    // ガード → カウンター攻撃
    state = activateGuard(state);
    state = enemyAttack(state);
    state = playerAttack(state);
    expect(state.enemy.hp).toBe(165n); // 200 - (15 + 20) = 165

    // 2回目の攻撃はボーナスなし
    state = playerAttack(state);
    expect(state.enemy.hp).toBe(150n); // 165 - 15 = 150
  });

  it("初期状態で guardCounter=false", () => {
    const state = createBattleState(makePlayer(), makeEnemy());
    expect(state.guardCounter).toBe(false);
  });
});

describe("checkBattleResult", () => {
  it("敵HP0以下で 'victory'", () => {
    const state: BattleState = {
      player: makePlayer({ hp: 10n }),
      enemy: makeEnemy({ hp: 0n }),
      result: "ongoing",
      turnCount: 1,
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = processBattleRewards(state, 1);

    expect(after.player.exp).toBe(1000n); // 10 * 100
    expect(after.player.gold).toBe(5n);
  });

  it("ドロップ武器が droppedWeapon に保持される", () => {
    const state: BattleState = {
      player: makePlayer(),
      enemy: makeEnemy(),
      result: "victory",
      turnCount: 3,
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = processBattleRewards(state, 1);

    expect(after.droppedWeapon).not.toBeNull();
    expect(after.droppedWeapon!.name).toBeDefined();
    expect(["water", "earth", "thunder"]).toContain(after.droppedWeapon!.element);
  });

  it("プレイヤーの武器は変更されない（即装備しない）", () => {
    const originalWeapon = { name: "棒", element: "water" as const, attackBonus: 5n };
    const state: BattleState = {
      player: makePlayer({ weapon: originalWeapon }),
      enemy: makeEnemy(),
      result: "victory",
      turnCount: 3,
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = processBattleRewards(state, 1);

    expect(after.player.weapon).toEqual(originalWeapon);
  });

  it("result!='victory' なら何もしない", () => {
    const state: BattleState = {
      player: makePlayer({ exp: 5n, gold: 10n }),
      enemy: makeEnemy(),
      result: "defeat",
      turnCount: 3,
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
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
      droppedWeapon: null,
      isGuarding: false,
      guardCounter: false,
    };
    const after = processBattleRewards(state, 1);

    // exp = 5 + 10 = 15 ≥ 10 → レベルアップ
    expect(after.player.level).toBeGreaterThanOrEqual(2);
  });
});
