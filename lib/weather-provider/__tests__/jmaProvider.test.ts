import { describe, expect, it } from "vitest";
import { applyAmedasObservation, normalizeJmaWeeklyForecast } from "../jmaProvider";
import { jmaForecastSample } from "../fixtures/jmaForecastSample";
import type { JmaAmedasResponse } from "../jmaTypes";

describe("normalizeJmaWeeklyForecast", () => {
  it("produces 7 daily entries from the weekly forecast element", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily).toHaveLength(7);
    expect(daily[0]).toMatchObject({
      date: "2026-07-19",
      tempMin: 24,
      tempMax: 31,
      humidity: null,
      windSpeed: null,
    });
  });

  it("classifies weather codes into isRainy/isSunny per day", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    expect(daily[0].isSunny).toBe(true);
    expect(daily[2].isRainy).toBe(true);
  });
});

describe("applyAmedasObservation", () => {
  it("overwrites humidity/windSpeed only for the matching date", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    const amedas: JmaAmedasResponse = {
      "44132": { humidity: [70, 0], wind: [3.5, 0] },
    };
    const result = applyAmedasObservation(daily, amedas, "44132", "2026-07-19");
    expect(result[0].humidity).toBe(70);
    expect(result[0].windSpeed).toBe(3.5);
    expect(result[1].humidity).toBeNull();
  });

  it("returns the input unchanged when the station has no observation", () => {
    const daily = normalizeJmaWeeklyForecast(jmaForecastSample);
    const result = applyAmedasObservation(daily, {}, "99999", "2026-07-19");
    expect(result).toEqual(daily);
  });
});
