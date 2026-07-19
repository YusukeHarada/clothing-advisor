/**
 * 5.5 衣替え判定
 * 決定ログ D-01 の仮初期値：秋→冬15℃、春→夏20℃、ヒステリシス幅2℃。
 */
export const CHANGEOVER_THRESHOLDS = {
  toWinterLowerBound: 15,
  toSummerUpperBound: 20,
  hysteresis: 2,
} as const;

export type SeasonMode = "summer" | "winter";

export interface ChangeoverState {
  currentSeasonMode: SeasonMode;
  lastSuggestedAt: string | null;
}

export interface ChangeoverJudgement {
  shouldSuggestChangeover: boolean;
  suggestedMode: SeasonMode | null;
  movingAverageTemp: number;
}

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * 直近7日の平均気温の移動平均から衣替え提案の要否を判定する。
 * toWinterLowerBound(15℃)とtoSummerUpperBound(20℃)の間の5℃の帯が
 * ヒステリシス（境界付近での往復提案の防止）として機能する。
 * hysteresisは運用調整用の追加バッファとして両閾値にさらに適用する。
 */
export function judgeChangeover(
  last7DaysTemps: number[],
  state: ChangeoverState,
  thresholds = CHANGEOVER_THRESHOLDS
): ChangeoverJudgement {
  if (last7DaysTemps.length < 7) {
    throw new Error("last7DaysTemps must contain at least 7 days of data");
  }
  const movingAverageTemp = average(last7DaysTemps.slice(-7));
  const { toWinterLowerBound, toSummerUpperBound, hysteresis } = thresholds;

  if (state.currentSeasonMode === "summer") {
    const effectiveLowerBound = toWinterLowerBound - hysteresis / 2;
    if (movingAverageTemp < effectiveLowerBound) {
      return { shouldSuggestChangeover: true, suggestedMode: "winter", movingAverageTemp };
    }
    return { shouldSuggestChangeover: false, suggestedMode: null, movingAverageTemp };
  }

  const effectiveUpperBound = toSummerUpperBound + hysteresis / 2;
  if (movingAverageTemp > effectiveUpperBound) {
    return { shouldSuggestChangeover: true, suggestedMode: "summer", movingAverageTemp };
  }
  return { shouldSuggestChangeover: false, suggestedMode: null, movingAverageTemp };
}
