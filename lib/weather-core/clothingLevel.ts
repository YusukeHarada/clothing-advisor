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

/**
 * tempMinのみを閾値として判定する（tempMaxは表示用の参考値）。
 * 体感気温は小数を取りうるため、tempMin/tempMaxの両方で範囲判定すると
 * 整数境界の間（例：14℃と15℃の間の14.2℃）が抜け落ちる。
 * tempMinが最も高くfeelsLikeTemp以下であるレベルを選ぶことで、境界を隙間なく連続させる。
 */
export function resolveClothingLevel(
  feelsLikeTemp: number,
  levels: ClothingLevelEntry[] = DEFAULT_CLOTHING_LEVELS
): ClothingLevelEntry {
  // tempMin降順（nullは-Infinity扱い）でソートし、順序に依存せず正しい閾値を選べるようにする
  const sorted = [...levels].sort((a, b) => (b.tempMin ?? -Infinity) - (a.tempMin ?? -Infinity));
  const match = sorted.find((entry) => entry.tempMin === null || feelsLikeTemp >= entry.tempMin);
  if (!match) {
    throw new Error(`No clothing level matched for feelsLikeTemp=${feelsLikeTemp}`);
  }
  return match;
}
