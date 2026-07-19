export interface NormalizedDailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  /** 気象庁の週間予報は風速・湿度の数値を持たないため、2〜7日目はnullになりうる（7章参照） */
  humidity: number | null;
  windSpeed: number | null;
  isRainy: boolean;
  isSunny: boolean;
}

export interface NormalizedWeatherDTO {
  locationId: string;
  fetchedAt: string;
  daily: NormalizedDailyWeather[];
}

export type OffsetStrength = "weak" | "medium" | "strong";

export interface OutingHours {
  start: string;
  end: string;
}
