import type { NormalizedWeatherDTO } from "../weather-core/types";
import type { ChangeoverStateDoc, UserSettingsDoc } from "../firestore/schema";

/**
 * 画面実装のためのサンプルデータ。
 * 実際のFirebaseプロジェクト作成・サーバ側スケジュール取得（7章）が未着手のため、
 * lib/firestore・lib/weather-providerの結線が完了するまでの暫定データとして使う。
 */
export const sampleWeatherDTO: NormalizedWeatherDTO = {
  locationId: "tokyo",
  fetchedAt: new Date().toISOString(),
  daily: [
    { date: "2026-07-19", tempMax: 31, tempMin: 24, humidity: 70, windSpeed: 3.5, isRainy: false, isSunny: true },
    { date: "2026-07-20", tempMax: 30, tempMin: 25, humidity: null, windSpeed: null, isRainy: false, isSunny: false },
    { date: "2026-07-21", tempMax: 28, tempMin: 23, humidity: null, windSpeed: null, isRainy: true, isSunny: false },
    { date: "2026-07-22", tempMax: 32, tempMin: 24, humidity: null, windSpeed: null, isRainy: false, isSunny: true },
    { date: "2026-07-23", tempMax: 33, tempMin: 22, humidity: null, windSpeed: null, isRainy: false, isSunny: true },
    { date: "2026-07-24", tempMax: 29, tempMin: 23, humidity: null, windSpeed: null, isRainy: false, isSunny: false },
    { date: "2026-07-25", tempMax: 30, tempMin: 24, humidity: null, windSpeed: null, isRainy: true, isSunny: false },
  ],
};

export const sampleRecentAverageTemp = 27;

export const sampleUserSettings: UserSettingsDoc = {
  locationId: "tokyo",
  offsetDirection: null,
  offsetStrength: "medium",
  outingHours: null,
};

export const sampleChangeoverState: ChangeoverStateDoc = {
  currentSeasonMode: "summer",
  lastSuggestedAt: null,
};
