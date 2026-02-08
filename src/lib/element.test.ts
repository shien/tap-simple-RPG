import { describe, it, expect } from "vitest";
import { getElementAdvantage, getElementMultiplier } from "./element";

describe("getElementAdvantage", () => {
  it("水→土: advantage", () => {
    expect(getElementAdvantage("water", "earth")).toBe("advantage");
  });

  it("土→雷: advantage", () => {
    expect(getElementAdvantage("earth", "thunder")).toBe("advantage");
  });

  it("雷→水: advantage", () => {
    expect(getElementAdvantage("thunder", "water")).toBe("advantage");
  });

  it("水→雷: disadvantage", () => {
    expect(getElementAdvantage("water", "thunder")).toBe("disadvantage");
  });

  it("土→水: disadvantage", () => {
    expect(getElementAdvantage("earth", "water")).toBe("disadvantage");
  });

  it("雷→土: disadvantage", () => {
    expect(getElementAdvantage("thunder", "earth")).toBe("disadvantage");
  });

  it("水→水: neutral", () => {
    expect(getElementAdvantage("water", "water")).toBe("neutral");
  });

  it("土→土: neutral", () => {
    expect(getElementAdvantage("earth", "earth")).toBe("neutral");
  });

  it("雷→雷: neutral", () => {
    expect(getElementAdvantage("thunder", "thunder")).toBe("neutral");
  });
});

describe("getElementMultiplier", () => {
  it("有利 → 2", () => {
    expect(getElementMultiplier("water", "earth")).toBe(2);
  });

  it("不利 → 0.1", () => {
    expect(getElementMultiplier("water", "thunder")).toBe(0.1);
  });

  it("同属性 → 1", () => {
    expect(getElementMultiplier("water", "water")).toBe(1);
  });
});
