import type { OutingHours } from "./types";

/**
 * 5.3 外出時間帯の気温近似
 * 気象庁の無料APIは時間別の予報気温を提供しないため、1日の気温変化を
 * 単純な三角モデルで近似する：
 *   0:00〜5:00   … tempMin（明け方が最も低い）
 *   5:00〜14:00  … tempMinからtempMaxへ線形上昇
 *   14:00〜24:00 … tempMaxからtempMinへ線形下降
 * 外出時間帯の中間時刻（start〜endの中点）における気温をこのモデルで算出する。
 */
const MIN_TIME_MINUTES = 5 * 60; // 05:00
const MAX_TIME_MINUTES = 14 * 60; // 14:00
const DAY_MINUTES = 24 * 60;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function temperatureAtMinutes(minutes: number, tempMax: number, tempMin: number): number {
  if (minutes <= MIN_TIME_MINUTES) {
    return tempMin;
  }
  if (minutes <= MAX_TIME_MINUTES) {
    const ratio = (minutes - MIN_TIME_MINUTES) / (MAX_TIME_MINUTES - MIN_TIME_MINUTES);
    return tempMin + (tempMax - tempMin) * ratio;
  }
  const ratio = (minutes - MAX_TIME_MINUTES) / (DAY_MINUTES - MAX_TIME_MINUTES);
  return tempMax + (tempMin - tempMax) * Math.min(ratio, 1);
}

/**
 * 外出時間帯（start〜end）の中間時刻における気温を三角モデルで近似する。
 * endがstartより前（日をまたぐ設定、例：22:00〜02:00）の場合は
 * 翌日にまたがる時間帯として中点を計算する。
 */
export function estimateOutingTemp(
  tempMax: number,
  tempMin: number,
  outingHours: OutingHours
): number {
  const startMinutes = parseTimeToMinutes(outingHours.start);
  let endMinutes = parseTimeToMinutes(outingHours.end);
  if (endMinutes < startMinutes) {
    endMinutes += DAY_MINUTES;
  }
  const midpoint = ((startMinutes + endMinutes) / 2) % DAY_MINUTES;

  return Math.round(temperatureAtMinutes(midpoint, tempMax, tempMin) * 10) / 10;
}
