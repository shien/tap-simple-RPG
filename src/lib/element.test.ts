import { describe, it, expect } from "vitest";
import { getElementAdvantage, getElementMultiplier } from "./element";

describe("getElementAdvantage", () => {
  it("火→氷: advantage", () => {
    expect(getElementAdvantage("fire", "ice")).toBe("advantage");
  });

  it("氷→雷: advantage", () => {
    expect(getElementAdvantage("ice", "thunder")).toBe("advantage");
  });

  it("雷→火: advantage", () => {
    expect(getElementAdvantage("thunder", "fire")).toBe("advantage");
  });

  it("火→雷: disadvantage", () => {
    expect(getElementAdvantage("fire", "thunder")).toBe("disadvantage");
  });

  it("氷→火: disadvantage", () => {
    expect(getElementAdvantage("ice", "fire")).toBe("disadvantage");
  });

  it("雷→氷: disadvantage", () => {
    expect(getElementAdvantage("thunder", "ice")).toBe("disadvantage");
  });

  it("火→火: neutral", () => {
    expect(getElementAdvantage("fire", "fire")).toBe("neutral");
  });

  it("氷→氷: neutral", () => {
    expect(getElementAdvantage("ice", "ice")).toBe("neutral");
  });

  it("雷→雷: neutral", () => {
    expect(getElementAdvantage("thunder", "thunder")).toBe("neutral");
  });
});

describe("getElementMultiplier", () => {
  it("有利 → 2", () => {
    expect(getElementMultiplier("fire", "ice")).toBe(2);
  });

  it("不利 → 0.1", () => {
    expect(getElementMultiplier("fire", "thunder")).toBe(0.1);
  });

  it("同属性 → 1", () => {
    expect(getElementMultiplier("fire", "fire")).toBe(1);
  });
});
