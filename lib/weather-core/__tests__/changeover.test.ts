import { describe, expect, it } from "vitest";
import { judgeChangeover } from "../changeover";

describe("judgeChangeover", () => {
  it("suggests switching to winter clothes when the moving average drops below the lower bound", () => {
    const result = judgeChangeover(
      [16, 15, 14, 13, 12, 11, 10],
      { currentSeasonMode: "summer", lastSuggestedAt: null }
    );
    expect(result.shouldSuggestChangeover).toBe(true);
    expect(result.suggestedMode).toBe("winter");
  });

  it("does not suggest switching when the moving average stays within the hysteresis band", () => {
    const result = judgeChangeover(
      [18, 18, 18, 18, 18, 18, 18],
      { currentSeasonMode: "summer", lastSuggestedAt: null }
    );
    expect(result.shouldSuggestChangeover).toBe(false);
  });

  it("suggests switching to summer clothes when the moving average exceeds the upper bound", () => {
    const result = judgeChangeover(
      [22, 23, 24, 22, 23, 24, 23],
      { currentSeasonMode: "winter", lastSuggestedAt: null }
    );
    expect(result.shouldSuggestChangeover).toBe(true);
    expect(result.suggestedMode).toBe("summer");
  });

  it("throws when fewer than 7 days of data are provided", () => {
    expect(() =>
      judgeChangeover([20, 20, 20], { currentSeasonMode: "summer", lastSuggestedAt: null })
    ).toThrow();
  });
});
