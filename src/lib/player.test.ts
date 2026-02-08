import { describe, it, expect } from "vitest";
import {
  createInitialPlayer,
  getRequiredExp,
  levelUp,
  addExp,
  heal,
  takeDamage,
  isDead,
} from "./player";

describe("createInitialPlayer", () => {
  it("Lv1で正しい初期値を持つ", () => {
    const p = createInitialPlayer();
    expect(p.level).toBe(1);
    expect(p.exp).toBe(0n);
    expect(p.hp).toBe(50n);
    expect(p.maxHp).toBe(50n);
    expect(p.atk).toBe(10n);
    expect(p.gold).toBe(0n);
  });

  it("武器が「棒」でattackBonus=0n", () => {
    const p = createInitialPlayer();
    expect(p.weapon.name).toBe("棒");
    expect(p.weapon.attackBonus).toBe(0n);
  });

  it("武器の属性がwater/earth/thunderのいずれか", () => {
    const p = createInitialPlayer();
    expect(["water", "earth", "thunder"]).toContain(p.weapon.element);
  });
});

describe("getRequiredExp", () => {
  it("Lv1 → 10n", () => {
    expect(getRequiredExp(1)).toBe(10n);
  });

  it("Lv5 → 250n", () => {
    expect(getRequiredExp(5)).toBe(250n);
  });

  it("Lv10 → 1000n", () => {
    expect(getRequiredExp(10)).toBe(1000n);
  });

  it("Lv11以降は指数要素が加わる", () => {
    // Lv11: 10 * 121 + 2^1 = 1210 + 2 = 1212
    expect(getRequiredExp(11)).toBe(1212n);
  });

  it("後半は指数的に増加する（Lv20 >> Lv10の数倍以上）", () => {
    const exp10 = getRequiredExp(10);
    const exp20 = getRequiredExp(20);
    expect(exp20).toBeGreaterThan(exp10 * 5n);
  });

  it("Lv50は極めて大きい値になる", () => {
    const exp50 = getRequiredExp(50);
    expect(exp50).toBeGreaterThan(1_000_000n);
  });
});

describe("levelUp", () => {
  it("レベルが1上がる", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.level).toBe(2);
  });

  it("Lv1→2でMaxHP+8、ATK+3", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 8n);
    expect(leveled.atk).toBe(p.atk + 3n);
  });

  it("HPも成長量分だけ増加する", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.hp).toBe(p.hp + 8n);
  });

  it("Lv11→12でMaxHP+20、ATK+8", () => {
    // Lv11のプレイヤーを作る
    let p = createInitialPlayer();
    for (let i = 0; i < 10; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(11);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 20n);
    expect(leveled.atk).toBe(p.atk + 8n);
  });

  it("Lv26→27でMaxHP+60、ATK+25", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 25; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(26);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 60n);
    expect(leveled.atk).toBe(p.atk + 25n);
  });

  it("Lv51→52でMaxHP+200、ATK+80", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 50; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(51);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 200n);
    expect(leveled.atk).toBe(p.atk + 80n);
  });

  it("元のプレイヤーオブジェクトは変更されない（イミュータブル）", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(p.level).toBe(1);
    expect(leveled.level).toBe(2);
  });
});

describe("addExp", () => {
  it("EXP不足ならレベルは変わらない", () => {
    const p = createInitialPlayer();
    const result = addExp(p, 5n);
    expect(result.level).toBe(1);
    expect(result.exp).toBe(5n);
  });

  it("ちょうど必要EXPで1回レベルアップ", () => {
    const p = createInitialPlayer();
    const required = getRequiredExp(1); // 10n
    const result = addExp(p, required);
    expect(result.level).toBe(2);
  });

  it("大量EXPで複数回レベルアップ", () => {
    const p = createInitialPlayer();
    // Lv1→2: 10n, Lv2→3: 40n, Lv3→4: 90n → 合計 140n で Lv4
    const result = addExp(p, 140n);
    expect(result.level).toBe(4);
  });

  it("余りEXPが保持される", () => {
    const p = createInitialPlayer();
    const result = addExp(p, 15n); // Lv1→2に10n必要、5n余り
    expect(result.level).toBe(2);
    expect(result.exp).toBe(15n);
  });
});

describe("heal", () => {
  it("HPが回復する", () => {
    const p = { ...createInitialPlayer(), hp: 30n };
    const healed = heal(p, 10n);
    expect(healed.hp).toBe(40n);
  });

  it("MaxHPを超えない", () => {
    const p = { ...createInitialPlayer(), hp: 45n };
    const healed = heal(p, 20n);
    expect(healed.hp).toBe(p.maxHp);
  });

  it("満タンなら変化しない", () => {
    const p = createInitialPlayer(); // hp === maxHp
    const healed = heal(p, 100n);
    expect(healed.hp).toBe(p.maxHp);
  });
});

describe("takeDamage", () => {
  it("ダメージでHPが減る", () => {
    const p = createInitialPlayer();
    const damaged = takeDamage(p, 20n);
    expect(damaged.hp).toBe(30n);
  });

  it("HPは0未満にならない", () => {
    const p = createInitialPlayer();
    const damaged = takeDamage(p, 999n);
    expect(damaged.hp).toBe(0n);
  });
});

describe("isDead", () => {
  it("HP > 0 なら false", () => {
    const p = createInitialPlayer();
    expect(isDead(p)).toBe(false);
  });

  it("HP === 0 なら true", () => {
    const p = { ...createInitialPlayer(), hp: 0n };
    expect(isDead(p)).toBe(true);
  });
});
