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

  it("Lv5 → 50n", () => {
    expect(getRequiredExp(5)).toBe(50n);
  });

  it("Lv10 → 100n", () => {
    expect(getRequiredExp(10)).toBe(100n);
  });

  it("線形に増加する（レベル差に比例）", () => {
    const exp10 = getRequiredExp(10);
    const exp20 = getRequiredExp(20);
    // 20 / 10 = 2倍
    expect(exp20).toBe(exp10 * 2n);
  });

  it("Lv50 → 500n", () => {
    expect(getRequiredExp(50)).toBe(500n);
  });
});

describe("levelUp", () => {
  it("レベルが1上がる", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.level).toBe(2);
  });

  it("Lv1→2でMaxHP+12、ATK+5", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 12n);
    expect(leveled.atk).toBe(p.atk + 5n);
  });

  it("HPも成長量分だけ増加する", () => {
    const p = createInitialPlayer();
    const leveled = levelUp(p);
    expect(leveled.hp).toBe(p.hp + 12n);
  });

  it("Lv11→12でMaxHP+60、ATK+25", () => {
    // Lv11のプレイヤーを作る
    let p = createInitialPlayer();
    for (let i = 0; i < 10; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(11);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 60n);
    expect(leveled.atk).toBe(p.atk + 25n);
  });

  it("Lv21→22でMaxHP+350、ATK+150", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 20; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(21);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 350n);
    expect(leveled.atk).toBe(p.atk + 150n);
  });

  it("Lv36→37でMaxHP+2500、ATK+1000", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 35; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(36);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 2500n);
    expect(leveled.atk).toBe(p.atk + 1000n);
  });

  it("Lv51→52でMaxHP+20000、ATK+8000", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 50; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(51);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 20000n);
    expect(leveled.atk).toBe(p.atk + 8000n);
  });

  it("Lv71→72でMaxHP+200000、ATK+80000", () => {
    let p = createInitialPlayer();
    for (let i = 0; i < 70; i++) {
      p = levelUp(p);
    }
    expect(p.level).toBe(71);
    const leveled = levelUp(p);
    expect(leveled.maxHp).toBe(p.maxHp + 200000n);
    expect(leveled.atk).toBe(p.atk + 80000n);
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
    // Lv1→2: 10n, Lv2→3: 20n, Lv3→4: 30n → 30n で Lv4
    const result = addExp(p, 30n);
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
