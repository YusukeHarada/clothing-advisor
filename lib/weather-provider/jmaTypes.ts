/**
 * 気象庁 予報API (forecast/data/forecast/{areaCode}.json) のレスポンス型。
 * 要素[0]は短期予報（3日分、風・波はテキストのみで数値なし）、
 * 要素[1]は週間予報（7日分、天気コード・気温・降水確率のみ。風速・湿度の数値は含まない）。
 * フィールド名・構造は公開情報に基づく。実装時に実レスポンスで再検証すること。
 */
export interface JmaTimeSeriesArea {
  area: { name: string; code: string };
  weatherCodes?: string[];
  pops?: string[];
  reliabilities?: string[];
  tempsMin?: string[];
  tempsMax?: string[];
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
