import { describe, expect, it } from "vitest";
import { applyPersonalOffset } from "../personalOffset";
import { resolveClothingLevel } from "../clothingLevel";

describe("applyPersonalOffset", () => {
  it("raises the clothing level for a cold-sensitive user at medium strength", () => {
    const base = resolveClothingLevel(20);
    const result = applyPersonalOffset(20, "coldSensitive", "medium");
    expect(result.level).toBe(base.level + 1);
  });

  it("lowers the clothing level for a heat-sensitive user at medium strength", () => {
    const base = resolveClothingLevel(20);
    const result = applyPersonalOffset(20, "heatSensitive", "medium");
    expect(result.level).toBe(base.level - 1);
  });

  it("clamps at the highest defined level for extreme cold sensitivity", () => {
    const result = applyPersonalOffset(-10, "coldSensitive", "strong");
    expect(result.level).toBe(8);
  });

  it("clamps at the lowest defined level for extreme heat sensitivity", () => {
    const result = applyPersonalOffset(40, "heatSensitive", "strong");
    expect(result.level).toBe(0);
  });
});
