import type { OffsetStrength, OutingHours } from "../weather-core/types";

/** 6章 locations/{locationId}（マスタ） */
export interface LocationDoc {
  locationId: string;
  name: string;
  geo?: { lat: number; lng: number };
  areaCode?: string;
}

/** 6章 users/{uid}/settings */
export interface UserSettingsDoc {
  locationId: string;
  temporaryLocationId?: string | null;
  temporaryUntil?: string | null;
  offsetDirection: "coldSensitive" | "heatSensitive" | null;
  offsetStrength: OffsetStrength;
  outingHours?: OutingHours | null;
}

/** 6章 clothing_levels/{level}（マスタ） */
export interface ClothingLevelDoc {
  level: number;
  tempMin: number | null;
  tempMax: number | null;
  label: string;
}

/** 6章 weather_history/{locationId}/history/{date} */
export interface WeatherHistoryDoc {
  date: string;
  tempMax: number;
  tempMin: number;
  humidity: number | null;
  windSpeed: number | null;
  isRainy: boolean;
  isSunny: boolean;
  fetchedAt: string;
}

/** 6章 users/{uid}/locations/{locationId}/changeover_state */
export interface ChangeoverStateDoc {
  currentSeasonMode: "summer" | "winter";
  lastSuggestedAt: string | null;
}
