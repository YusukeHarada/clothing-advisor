import { ClothingLevelEntry, DEFAULT_CLOTHING_LEVELS, resolveClothingLevel } from "./clothingLevel";

/** 5.4 相対提示：基準線からの差分がこの値(℃)以上のとき提示する */
const RELATIVE_ADVICE_THRESHOLD = 2;

export type RelativeAdviceDirection = "lighter" | "heavier" | "none";

export interface RelativeAdviceResult {
  direction: RelativeAdviceDirection;
  baselineTemp: number;
  todayTemp: number;
  baselineLevel: ClothingLevelEntry;
  todayLevel: ClothingLevelEntry;
  /** 例:「レベル3相当だが、直近より暖かいためレベル2相当の服装で可」 */
  message: string | null;
}

/**
 * 5.4 相対提示（順応の反映）
 * 直近3日間の平均気温を基準線とし、当日の補正気温との差分から
 * 5.2のレベルラベルと連動した具体的な差分を提示する。
 */
export function computeRelativeAdvice(
  todayFeelsLikeTemp: number,
  recentAverageTemp: number,
  levels: ClothingLevelEntry[] = DEFAULT_CLOTHING_LEVELS
): RelativeAdviceResult {
  const baselineLevel = resolveClothingLevel(recentAverageTemp, levels);
  const todayLevel = resolveClothingLevel(todayFeelsLikeTemp, levels);
  const diff = todayFeelsLikeTemp - recentAverageTemp;

  let direction: RelativeAdviceDirection = "none";
  if (diff >= RELATIVE_ADVICE_THRESHOLD) {
    direction = "lighter";
  } else if (diff <= -RELATIVE_ADVICE_THRESHOLD) {
    direction = "heavier";
  }

  let message: string | null = null;
  if (direction === "lighter" && todayLevel.level < baselineLevel.level) {
    message = `レベル${baselineLevel.level}相当だが、直近より暖かいためレベル${todayLevel.level}相当の服装で可`;
  } else if (direction === "heavier" && todayLevel.level > baselineLevel.level) {
    message = `レベル${baselineLevel.level}相当だが、直近より寒いためレベル${todayLevel.level}相当の服装を推奨`;
  }

  return {
    direction,
    baselineTemp: recentAverageTemp,
    todayTemp: todayFeelsLikeTemp,
    baselineLevel,
    todayLevel,
    message,
  };
}
