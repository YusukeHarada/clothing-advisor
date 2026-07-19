/**
 * 気象庁 予報API (forecast/data/forecast/{areaCode}.json) のレスポンス型。
 * 実レスポンス（東京地方 130000、2026-07-19 17:00発表）で構造を確認済み。
 *
 * 要素[0]（短期予報、3日分）：
 * - timeSeries[0]: weatherCodes/weathers/winds/waves（area.code=130010等、区域単位）
 * - timeSeries[1]: pops（5つのtimeDefines、区域単位）
 * - timeSeries[2]: temps（2つのtimeDefines、area.codeはアメダス観測所コード単位。例：東京=44132）
 *   2値は「翌日の最低・最高気温」に相当する（発表時刻により意味が変わりうる点に注意）
 *
 * 要素[1]（週間予報、7日分）：
 * - timeSeries[0]: weatherCodes/pops/reliabilities（区域単位）。
 *   最初の1日分（＝短期予報でカバー済みの日）はpops/reliabilitiesが空文字列になる
 * - timeSeries[1]: tempsMin/tempsMax（観測所コード単位）。
 *   同様に最初の1日分は空文字列になり、値は要素[0]のtimeSeries[2].tempsで補う必要がある
 */
export interface JmaTimeSeriesArea {
  area: { name: string; code: string };
  weatherCodes?: string[];
  weathers?: string[];
  winds?: string[];
  waves?: string[];
  pops?: string[];
  reliabilities?: string[];
  /** 短期予報（要素[0].timeSeries[2]）の気温。2要素で[翌日の最低, 翌日の最高]に相当 */
  temps?: string[];
  tempsMin?: string[];
  tempsMinUpper?: string[];
  tempsMinLower?: string[];
  tempsMax?: string[];
  tempsMaxUpper?: string[];
  tempsMaxLower?: string[];
}

export interface JmaTimeSeries {
  timeDefines: string[];
  areas: JmaTimeSeriesArea[];
}

export interface JmaForecastElement {
  publishingOffice: string;
  reportDatetime: string;
  timeSeries: JmaTimeSeries[];
}

export type JmaForecastResponse = [JmaForecastElement, JmaForecastElement];

/**
 * 気象庁 アメダス実況値。当日の実測風速・湿度取得に用いる。
 * `{observedAt}: { [stationCode]: [temp, tempFlag, humidity, humidityFlag, wind, windFlag, ...] }` 形式。
 * 実際のフィールド順序・欠測表現は実装時に実レスポンスで確認する。
 */
export type JmaAmedasResponse = Record<
  string,
  {
    temp?: [number, number];
    humidity?: [number, number];
    wind?: [number, number];
  }
>;
