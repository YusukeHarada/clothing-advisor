/**
 * 5.2 服装レベルマスタ
 * 初期値はコード上のデフォルトとして持つ。Firestoreのclothing_levelsマスタで上書き可能にする想定。
 */
export interface ClothingLevelEntry {
  level: number;
  tempMin: number | null;
  tempMax: number | null;
  label: string;
}

export const DEFAULT_CLOTHING_LEVELS: ClothingLevelEntry[] = [
  { level: 0, tempMin: 35, tempMax: null, label: "猛暑対応（半袖・通気重視、日射/熱中症注意）" },
  { level: 1, tempMin: 25, tempMax: 34, label: "半袖" },
  { level: 2, tempMin: 22, tempMax: 24, label: "長袖1枚" },
  { level: 3, tempMin: 18, tempMax: 21, label: "重ね着（カーディガン等）" },
  { level: 4, tempMin: 15, tempMax: 17, label: "薄手の上着" },
  { level: 5, tempMin: 12, tempMax: 14, label: "コート" },
  { level: 6, tempMin: 8, tempMax: 11, label: "厚手コート" },
  { level: 7, tempMin: 0, tempMax: 7, label: "防寒（マフラー・手袋等）" },
  { level: 8, tempMin: null, tempMax: -0.1, label: "厳寒対応（防寒強化・氷点下想定）" },
];

export function resolveClothingLevel(
  feelsLikeTemp: number,
  levels: ClothingLevelEntry[] = DEFAULT_CLOTHING_LEVELS
): ClothingLevelEntry {
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  const match = sorted.find((entry) => {
    const aboveMin = entry.tempMin === null || feelsLikeTemp >= entry.tempMin;
    const belowMax = entry.tempMax === null || feelsLikeTemp <= entry.tempMax;
    return aboveMin && belowMax;
  });
  if (!match) {
    throw new Error(`No clothing level matched for feelsLikeTemp=${feelsLikeTemp}`);
  }
  return match;
}
