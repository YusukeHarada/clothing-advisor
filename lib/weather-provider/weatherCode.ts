/**
 * 気象庁の天気コード（3桁）を isRainy / isSunny に分類する。
 * コード体系は複合天気（例：108＝晴れ一時雨）を含み厳密な数値範囲では分類できないため、
 * MVPでは主要コードのテーブルと、未知コードに対する先頭桁ヒューリスティックで簡易分類する。
 * 実装時に気象庁の正式なコード表で網羅性を検証すること。
 */
const RAINY_CODES = new Set([
  "108", "182", "202", "203", "204", "205", "206", "207", "208",
  "209", "210", "213", "218", "220", "223", "224", "225", "226", "228",
  "229", "230", "231", "300", "301", "302", "303", "304", "306", "308",
  "309", "311", "313", "314", "315", "316", "317", "320", "321", "322",
  "323", "324", "325", "326", "327", "328", "329", "340", "350", "361",
  "371",
]);

const SUNNY_CODES = new Set([
  "100", "101", "110", "111", "112", "113", "114", "115", "116", "117",
  "118", "119", "120", "130", "131", "132", "140", "160", "170", "181",
]);

export function classifyWeatherCode(code: string): { isRainy: boolean; isSunny: boolean } {
  if (RAINY_CODES.has(code)) {
    return { isRainy: true, isSunny: false };
  }
  if (SUNNY_CODES.has(code)) {
    return { isRainy: false, isSunny: true };
  }
  // 未知コードは先頭桁で簡易判定する（1xx=晴れ系, 3xx/4xx=雨雪系）
  const firstDigit = code.charAt(0);
  return {
    isRainy: firstDigit === "3" || firstDigit === "4",
    isSunny: firstDigit === "1",
  };
}
