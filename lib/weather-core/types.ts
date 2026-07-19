export interface NormalizedDailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number;
  windSpeed: number;
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
