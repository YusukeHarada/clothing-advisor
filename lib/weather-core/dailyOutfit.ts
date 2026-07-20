import { computeFeelsLikeTemp } from "./feelsLike";
import { ClothingLevelEntry, resolveClothingLevel } from "./clothingLevel";
import { estimateOutingTemp } from "./outingTempEstimate";
import type { OutingHours } from "./types";

export interface DailyOutfitInput {
  tempMax: number;
  tempMin: number;
  humidity: number | null;
  windSpeed: number | null;
  outingHours?: OutingHours | null;
  /**
   * 外出時間帯に対応する実測/時間別予報の気温。取得できる場合のみ渡す。
   * 気象庁の無料APIには時間別予報が無いため、未指定の場合は
   * outingTempEstimate.tsの三角モデルでtempMax/tempMinから近似する。
   */
  outingTemp?: number | null;
  levels?: ClothingLevelEntry[];
}

export interface DailyOutfitTier {
  label: "昼" | "朝晩" | "外出時間帯";
  feelsLikeTemp: number;
  clothingLevel: ClothingLevelEntry;
}

export interface DailyOutfitResult {
  /** 昼・朝晩の二段表示。外出時間帯設定時も補助情報として常に算出する */
  tiers: DailyOutfitTier[];
  /** 外出時間帯が設定されている場合の主表示。未設定ならnull */
  primaryTier: DailyOutfitTier | null;
}

/**
 * 5.3 当日服装（表示単位）
 * outing_hoursが設定されている場合は、対応する時間帯のレベルを主表示とし、
 * 昼／朝晩の二段表示は補助情報として算出する。
 */
export function computeDailyOutfit(input: DailyOutfitInput): DailyOutfitResult {
  const { tempMax, tempMin, humidity, windSpeed, outingHours, outingTemp, levels } = input;

  const dayTier: DailyOutfitTier = {
    label: "昼",
    feelsLikeTemp: computeFeelsLikeTemp({ temp: tempMax, windSpeed, humidity }),
    clothingLevel: resolveClothingLevel(
      computeFeelsLikeTemp({ temp: tempMax, windSpeed, humidity }),
      levels
    ),
  };
  const morningEveningTier: DailyOutfitTier = {
    label: "朝晩",
    feelsLikeTemp: computeFeelsLikeTemp({ temp: tempMin, windSpeed, humidity }),
    clothingLevel: resolveClothingLevel(
      computeFeelsLikeTemp({ temp: tempMin, windSpeed, humidity }),
      levels
    ),
  };

  const tiers = [dayTier, morningEveningTier];

  if (!outingHours) {
    return { tiers, primaryTier: null };
  }

  // 時間別予報が取得できない場合は三角モデルによる近似で代替する
  const approximatedOutingTemp = outingTemp ?? estimateOutingTemp(tempMax, tempMin, outingHours);
  const primaryFeelsLike = computeFeelsLikeTemp({
    temp: approximatedOutingTemp,
    windSpeed,
    humidity,
  });
  const primaryTier: DailyOutfitTier = {
    label: "外出時間帯",
    feelsLikeTemp: primaryFeelsLike,
    clothingLevel: resolveClothingLevel(primaryFeelsLike, levels),
  };

  return { tiers, primaryTier };
}
