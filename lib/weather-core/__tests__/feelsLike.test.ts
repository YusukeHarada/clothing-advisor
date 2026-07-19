import { describe, expect, it } from "vitest";
import { computeFeelsLikeTemp } from "../feelsLike";

describe("computeFeelsLikeTemp", () => {
  it("returns the raw temperature when there is no wind and neutral humidity", () => {
    expect(computeFeelsLikeTemp({ temp: 20, windSpeed: 0, humidity: 60 })).toBe(20);
  });

  it("lowers the feels-like temperature as wind speed increases", () => {
    const noWind = computeFeelsLikeTemp({ temp: 10, windSpeed: 0, humidity: 60 });
    const withWind = computeFeelsLikeTemp({ temp: 10, windSpeed: 8, humidity: 60 });
    expect(withWind).toBeLessThan(noWind);
  });

  it("raises feels-like temperature in hot, humid conditions", () => {
    const dry = computeFeelsLikeTemp({ temp: 30, windSpeed: 0, humidity: 60 });
    const humid = computeFeelsLikeTemp({ temp: 30, windSpeed: 0, humidity: 90 });
    expect(humid).toBeGreaterThan(dry);
  });

  it("lowers feels-like temperature in cold, humid conditions", () => {
    const dry = computeFeelsLikeTemp({ temp: 5, windSpeed: 0, humidity: 60 });
    const humid = computeFeelsLikeTemp({ temp: 5, windSpeed: 0, humidity: 90 });
    expect(humid).toBeLessThan(dry);
  });
});
