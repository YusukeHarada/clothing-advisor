import { ClothingLevelEntry, DEFAULT_CLOTHING_LEVELS, resolveClothingLevel } from "./clothingLevel";
import type { OffsetStrength } from "./types";

/** 5.6 個人オフセット（決定ログ D-05）：弱0.5／中1.0／強1.5段 */
export const PERSONAL_OFFSET_STEPS: Record<OffsetStrength, number> = {
  weak: 0.5,
  medium: 1.0,
  strong: 1.5,
};

export type OffsetDirection = "coldSensitive" | "heatSensitive";

/**
 * 寒がり／暑がりのオフセットを服装レベルに反映する。
 * 寒がり（coldSensitive）はレベルを上げる（厚着）方向、暑がり（heatSensitive）は下げる方向。
 */
export function applyPersonalOffset(
  baseFeelsLikeTemp: number,
  direction: OffsetDirection,
  strength: OffsetStrength,
  levels: ClothingLevelEntry[] = DEFAULT_CLOTHING_LEVELS
): ClothingLevelEntry {
  const baseLevel = resolveClothingLevel(baseFeelsLikeTemp, levels);
  const offsetSteps = PERSONAL_OFFSET_STEPS[strength];
  const signedOffset = direction === "coldSensitive" ? offsetSteps : -offsetSteps;
  const targetLevel = Math.round(baseLevel.level + signedOffset);

  const sorted = [...levels].sort((a, b) => a.level - b.level);
  const minLevel = sorted[0].level;
  const maxLevel = sorted[sorted.length - 1].level;
  const clampedLevel = Math.min(maxLevel, Math.max(minLevel, targetLevel));

  return sorted.find((entry) => entry.level === clampedLevel) ?? baseLevel;
}
