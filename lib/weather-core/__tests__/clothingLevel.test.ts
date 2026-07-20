import { describe, expect, it } from "vitest";
import { resolveClothingLevel } from "../clothingLevel";

describe("resolveClothingLevel", () => {
  it.each([
    [36, 0],
    [25, 1],
    [34, 1],
    [23, 2],
    [20, 3],
    [16, 4],
    [13, 5],
    [9, 6],
    [3, 7],
    [0, 7],
    [-5, 8],
  ])("resolves %d℃ to level %d", (temp, expectedLevel) => {
    expect(resolveClothingLevel(temp).level).toBe(expectedLevel);
  });

  it.each([
    [14.9, 5],
    [14.2, 5],
    [8.5, 6],
    [-0.1, 8],
  ])("resolves fractional %d℃ without falling into a gap between integer boundaries", (temp, expectedLevel) => {
    expect(resolveClothingLevel(temp).level).toBe(expectedLevel);
  });
});
