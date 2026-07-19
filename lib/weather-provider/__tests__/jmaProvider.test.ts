import { describe, expect, it } from "vitest";
import { applyAmedasObservation, normalizeJmaWeeklyForecast } from "../jmaProvider";
import { jmaForecastSample } from "../fixtures/jmaForecastSample";
import type { JmaAmedasResponse } from "../jmaTypes";

describe("normalizeJmaWeeklyForecast", () => {
  it("produces 7 daily entries from the weekly forecast element", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily).toHaveLength(7);
    expect(daily.map((d) => d.date)).toEqual([
      "2026-07-20",
      "2026-07-21",
      "2026-07-22",
      "2026-07-23",
      "2026-07-24",
      "2026-07-25",
      "2026-07-26",
    ]);
  });

  it("falls back to the short-term forecast temps when the weekly entry is blank (day 0)", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily[0]).toMatchObject({
      tempMin: 26,
      tempMax: 36,
      humidity: null,
      windSpeed: null,
    });
  });

  it("uses the weekly tempsMin/tempsMax directly from day 1 onward", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily[1]).toMatchObject({ tempMin: 27, tempMax: 36 });
  });

  it("classifies weather codes into isRainy/isSunny per day", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily[0].isSunny).toBe(true);
    expect(daily[3].isSunny).toBe(false);
    expect(daily[3].isRainy).toBe(false);
  });

  it("throws when neither the weekly nor short-term data provides a temperature", () => {
    const broken = structuredClone(jmaForecastSample);
    broken[0].timeSeries[2].areas[0].temps = [];
    expect(() => normalizeJmaWeeklyForecast(broken)).toThrow();
  });
});

describe("applyAmedasObservation", () => {
  it("overwrites humidity/windSpeed only for the matching date", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    const amedas: JmaAmedasResponse = {
      "44132": { humidity: [70, 0], wind: [3.5, 0] },
    };
    const result = applyAmedasObservation(daily, amedas, "44132", "2026-07-20");
    expect(result[0].humidity).toBe(70);
    expect(result[0].windSpeed).toBe(3.5);
    expect(result[1].humidity).toBeNull();
  });

  it("returns the input unchanged when the station has no observation", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    const result = applyAmedasObservation(daily, {}, "99999", "2026-07-20");
    expect(result).toEqual(daily);
  });
});
