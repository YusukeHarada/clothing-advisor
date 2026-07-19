import type { NormalizedDailyWeather, NormalizedWeatherDTO } from "../weather-core/types";
import type { JmaAmedasResponse, JmaForecastResponse, JmaTimeSeriesArea } from "./jmaTypes";
import { classifyWeatherCode } from "./weatherCode";
import { resolveLocation } from "./locationResolver";

const JMA_FORECAST_BASE_URL = "https://www.jma.go.jp/bosai/forecast/data/forecast";
const JMA_AMEDAS_LATEST_TIME_URL = "https://www.jma.go.jp/bosai/amedas/data/latest_time.txt";
const JMA_AMEDAS_MAP_BASE_URL = "https://www.jma.go.jp/bosai/amedas/data/map";

function toDateString(isoDateTime: string): string {
  return isoDateTime.slice(0, 10);
}

/**
 * areas配列から指定コードに一致する区域を選ぶ。都道府県単位のarea code（例：080000）で
 * 予報を取得すると、レスポンスは県内の複数区域（例：茨城県の北部/南部）を含みうるため、
 * areas[0]を無条件に使うと意図と異なる区域のデータを取得してしまう。
 * codeが未指定、または一致する区域がない場合はareas[0]にフォールバックする
 * （未検証の地点向けの暫定挙動）。
 */
function pickArea(areas: JmaTimeSeriesArea[], code: string | undefined): JmaTimeSeriesArea {
  const matched = code ? areas.find((a) => a.area.code === code) : undefined;
  return matched ?? areas[0];
}

/**
 * 週間予報の最初の1日分（要素[1]）は短期予報側でカバーされるため
 * tempsMin/tempsMaxが空文字列になる。要素[0].timeSeries[2].tempsの
 * [翌日の最低, 翌日の最高]で補う。
 */
function resolveShortTermFallbackTemps(
  response: JmaForecastResponse,
  amedasStationCode: string | undefined
): {
  tempMin: number | null;
  tempMax: number | null;
} {
  const shortTermTempAreas = response[0].timeSeries[2]?.areas ?? [];
  const shortTermTempArea = pickArea(shortTermTempAreas, amedasStationCode);
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
 *
 * @param subAreaCode weatherCodes/pops側の区域選択に使うarea.code（例：080020＝茨城県南部）
 * @param amedasStationCode tempsMin/tempsMax・短期予報の気温側の区域選択に使う観測所コード
 */
export function normalizeJmaWeeklyForecast(
  response: JmaForecastResponse,
  subAreaCode?: string,
  amedasStationCode?: string
): NormalizedDailyWeather[] {
  const weekly = response[1];
  const weatherSeries = weekly.timeSeries[0];
  const tempSeries = weekly.timeSeries[1];

  const weatherArea = pickArea(weatherSeries.areas, subAreaCode);
  const tempArea = pickArea(tempSeries.areas, amedasStationCode);
  const shortTermFallback = resolveShortTermFallbackTemps(response, amedasStationCode);

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
  let daily = normalizeJmaWeeklyForecast(forecast, location.subAreaCode, location.amedasStationCode);

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
