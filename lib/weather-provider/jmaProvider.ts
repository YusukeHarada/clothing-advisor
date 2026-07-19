import type { NormalizedDailyWeather, NormalizedWeatherDTO } from "../weather-core/types";
import type { JmaAmedasResponse, JmaForecastResponse } from "./jmaTypes";
import { classifyWeatherCode } from "./weatherCode";
import { resolveLocation } from "./locationResolver";

const JMA_FORECAST_BASE_URL = "https://www.jma.go.jp/bosai/forecast/data/forecast";
const JMA_AMEDAS_LATEST_TIME_URL = "https://www.jma.go.jp/bosai/amedas/data/latest_time.txt";
const JMA_AMEDAS_MAP_BASE_URL = "https://www.jma.go.jp/bosai/amedas/data/map";

function toDateString(isoDateTime: string): string {
  return isoDateTime.slice(0, 10);
}

/**
 * 週間予報の最初の1日分（要素[1]）は短期予報側でカバーされるため
 * tempsMin/tempsMaxが空文字列になる。要素[0].timeSeries[2].tempsの
 * [翌日の最低, 翌日の最高]で補う。
 */
function resolveShortTermFallbackTemps(response: JmaForecastResponse): {
  tempMin: number | null;
  tempMax: number | null;
} {
  const shortTermTempArea = response[0].timeSeries[2]?.areas[0];
  const [minRaw, maxRaw] = shortTermTempArea?.temps ?? [];
  return {
    tempMin: minRaw ? Number(minRaw) : null,
    tempMax: maxRaw ? Number(maxRaw) : null,
  };
}

/**
 * 週間予報部分（要素[1]）を7日分の天気・気温に正規化する。
 * 風速・湿度は数値を含まないため、この時点ではnullのまま返す
 * （当日〜翌日分は正規化後に applyAmedasObservation で上書きする）。
 */
export function normalizeJmaWeeklyForecast(response: JmaForecastResponse): NormalizedDailyWeather[] {
  const weekly = response[1];
  const weatherSeries = weekly.timeSeries[0];
  const tempSeries = weekly.timeSeries[1];

  const weatherArea = weatherSeries.areas[0];
  const tempArea = tempSeries.areas[0];
  const shortTermFallback = resolveShortTermFallbackTemps(response);

  return weatherSeries.timeDefines.map((timeDefine, index) => {
    const weatherCode = weatherArea.weatherCodes?.[index] ?? "";
    const { isRainy, isSunny } = classifyWeatherCode(weatherCode);
    const tempMinRaw = tempArea.tempsMin?.[index];
    const tempMaxRaw = tempArea.tempsMax?.[index];

    const tempMin = tempMinRaw ? Number(tempMinRaw) : (index === 0 ? shortTermFallback.tempMin : null);
    const tempMax = tempMaxRaw ? Number(tempMaxRaw) : (index === 0 ? shortTermFallback.tempMax : null);

    return {
      date: toDateString(timeDefine),
      // フォールバックでも取得できない場合はNaNではなくnullにせず、
      // 呼び出し側での扱いを一貫させるため0を許容しない値として明示的にthrowする
      tempMin: assertTemp(tempMin, timeDefine, "tempMin"),
      tempMax: assertTemp(tempMax, timeDefine, "tempMax"),
      humidity: null,
      windSpeed: null,
      isRainy,
      isSunny,
    };
  });
}

function assertTemp(value: number | null, timeDefine: string, field: string): number {
  if (value === null || Number.isNaN(value)) {
    throw new Error(`JMA forecast is missing ${field} for ${timeDefine}`);
  }
  return value;
}

/**
 * アメダス実況値から当日分の実測風速・湿度を該当日のエントリに適用する。
 * 実測値が存在する日（通常は当日のみ）に限り上書きする。
 */
export function applyAmedasObservation(
  daily: NormalizedDailyWeather[],
  amedas: JmaAmedasResponse,
  stationCode: string,
  targetDate: string
): NormalizedDailyWeather[] {
  const observation = amedas[stationCode];
  if (!observation) return daily;

  return daily.map((entry) => {
    if (entry.date !== targetDate) return entry;
    return {
      ...entry,
      humidity: observation.humidity?.[0] ?? entry.humidity,
      windSpeed: observation.wind?.[0] ?? entry.windSpeed,
    };
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`JMA API request failed: ${url} (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/**
 * 気象庁の週間予報とアメダス実況を取得し、正規化DTOを返す。
 * サーバ側スケジュール実行（7章）から呼び出す想定。
 */
export async function fetchNormalizedWeather(locationId: string): Promise<NormalizedWeatherDTO> {
  const location = resolveLocation(locationId);

  const forecast = await fetchJson<JmaForecastResponse>(
    `${JMA_FORECAST_BASE_URL}/${location.areaCode}.json`
  );
  let daily = normalizeJmaWeeklyForecast(forecast);

  try {
    const latestTime = (await fetch(JMA_AMEDAS_LATEST_TIME_URL).then((r) => r.text())).trim();
    const timeKey = latestTime.replace(/[-:]/g, "").replace("T", "").slice(0, 12);
    const amedas = await fetchJson<JmaAmedasResponse>(
      `${JMA_AMEDAS_MAP_BASE_URL}/${timeKey}.json`
    );
    const today = daily[0]?.date;
    if (today) {
      daily = applyAmedasObservation(daily, amedas, location.amedasStationCode, today);
    }
  } catch {
    // アメダス実況の取得に失敗しても予報自体は返す（風速・湿度はnullのまま）
  }

  return {
    locationId,
    fetchedAt: new Date().toISOString(),
    daily,
  };
}
