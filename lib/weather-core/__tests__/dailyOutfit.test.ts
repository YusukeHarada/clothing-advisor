import { describe, expect, it } from "vitest";
import { computeDailyOutfit } from "../dailyOutfit";

describe("computeDailyOutfit", () => {
  it("returns day/morning-evening tiers with no primary tier when outing hours are unset", () => {
    const result = computeDailyOutfit({
      tempMax: 22,
      tempMin: 12,
      humidity: 60,
      windSpeed: 0,
    });
    expect(result.tiers).toHaveLength(2);
    expect(result.tiers[0].label).toBe("昼");
    expect(result.tiers[1].label).toBe("朝晩");
    expect(result.primaryTier).toBeNull();
  });

  it("sets a primary tier from outing temp when outing hours are set", () => {
    const result = computeDailyOutfit({
      tempMax: 22,
      tempMin: 12,
      humidity: 60,
      windSpeed: 0,
      outingHours: { start: "10:00", end: "16:00" },
      outingTemp: 20,
    });
    expect(result.primaryTier).not.toBeNull();
    expect(result.primaryTier?.label).toBe("外出時間帯");
    expect(result.primaryTier?.feelsLikeTemp).toBe(20);
  });

  it("falls back to the triangular estimate when outing temp is unavailable", () => {
    const result = computeDailyOutfit({
      tempMax: 22,
      tempMin: 12,
      humidity: 60,
      windSpeed: 0,
      outingHours: { start: "06:00", end: "08:00" },
      outingTemp: null,
    });
    // 07:00は05:00〜14:00の上昇局面の途中にあたるため、tempMinより高くtempMaxより低い
    expect(result.primaryTier?.feelsLikeTemp).toBeGreaterThan(12);
    expect(result.primaryTier?.feelsLikeTemp).toBeLessThan(22);
  });
});
