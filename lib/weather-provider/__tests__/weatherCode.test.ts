import { describe, expect, it } from "vitest";
import { classifyWeatherCode } from "../weatherCode";

describe("classifyWeatherCode", () => {
  it("classifies 100 as sunny", () => {
    expect(classifyWeatherCode("100")).toEqual({ isRainy: false, isSunny: true });
  });

  it("classifies 300 as rainy", () => {
    expect(classifyWeatherCode("300")).toEqual({ isRainy: true, isSunny: false });
  });

  it("classifies 200 (cloudy) as neither sunny nor rainy", () => {
    expect(classifyWeatherCode("200")).toEqual({ isRainy: false, isSunny: false });
  });

  it("falls back to a first-digit heuristic for unknown codes", () => {
    expect(classifyWeatherCode("999").isRainy).toBe(false);
    expect(classifyWeatherCode("999").isSunny).toBe(false);
    expect(classifyWeatherCode("399").isRainy).toBe(true);
  });
});
