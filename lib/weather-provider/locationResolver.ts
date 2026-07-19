/**
 * 7章 LocationResolver
 * ユーザーの地点情報を、気象庁が要求する識別子（区域コード）に変換する。
 * MVPでは主要都市の静的テーブルで解決する。将来的にはFirestoreの
 * locations/{locationId}マスタ（geo / area_code）に置き換える。
 */
export interface LocationEntry {
  locationId: string;
  name: string;
  /** 気象庁の予報APIを呼び出すarea code（例: 茨城県 = 080000）。レスポンスは県内の複数区域を含みうる */
  areaCode: string;
  /**
   * weatherCodes/pops等の区域内訳（areas配列）から該当地点の区域を選ぶためのarea.code。
   * 例：茨城県(080000)は北部(080010)・南部(080020)に分かれ、守谷市を含むエリアは南部。
   * 未指定の場合はareas[0]にフォールバックする（未検証の地点向けの暫定挙動、要実データ確認）。
   */
  subAreaCode?: string;
  /** アメダス実況取得用の観測所コード（tempsMin/tempsMax・実況値の照合に使う） */
  amedasStationCode: string;
}

export const KNOWN_LOCATIONS: LocationEntry[] = [
  { locationId: "tokyo", name: "東京", areaCode: "130000", subAreaCode: "130010", amedasStationCode: "44132" },
  { locationId: "osaka", name: "大阪", areaCode: "270000", amedasStationCode: "62078" },
  { locationId: "sapporo", name: "札幌", areaCode: "016010", amedasStationCode: "14163" },
  { locationId: "fukuoka", name: "福岡", areaCode: "400000", amedasStationCode: "82182" },
  { locationId: "ibaraki-south", name: "茨城県（南部）", areaCode: "080000", subAreaCode: "080020", amedasStationCode: "40426" },
];

export class UnknownLocationError extends Error {
  constructor(locationId: string) {
    super(`Unknown locationId: ${locationId}`);
    this.name = "UnknownLocationError";
  }
}

export function resolveLocation(locationId: string): LocationEntry {
  const entry = KNOWN_LOCATIONS.find((loc) => loc.locationId === locationId);
  if (!entry) {
    throw new UnknownLocationError(locationId);
  }
  return entry;
}
