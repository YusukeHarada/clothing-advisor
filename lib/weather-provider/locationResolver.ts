/**
 * 7章 LocationResolver
 * ユーザーの地点情報を、気象庁が要求する識別子（区域コード）に変換する。
 * MVPでは主要都市の静的テーブルで解決する。将来的にはFirestoreの
 * locations/{locationId}マスタ（geo / area_code）に置き換える。
 */
export interface LocationEntry {
  locationId: string;
  name: string;
  /** 気象庁の予報API area code（例: 東京地方 = 130000） */
  areaCode: string;
  /** アメダス実況取得用の観測所コード */
  amedasStationCode: string;
}

export const KNOWN_LOCATIONS: LocationEntry[] = [
  { locationId: "tokyo", name: "東京", areaCode: "130000", amedasStationCode: "44132" },
  { locationId: "osaka", name: "大阪", areaCode: "270000", amedasStationCode: "62078" },
  { locationId: "sapporo", name: "札幌", areaCode: "016010", amedasStationCode: "14163" },
  { locationId: "fukuoka", name: "福岡", areaCode: "400000", amedasStationCode: "82182" },
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
