import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { getDb } from "../../firebase/config";
import { paths } from "../paths";
import type { ClothingLevelDoc } from "../schema";
import { DEFAULT_CLOTHING_LEVELS } from "../../weather-core/clothingLevel";

/**
 * Firestoreのclothing_levelsマスタを取得する。未登録の場合はコード側のデフォルト
 * （lib/weather-core/clothingLevel.ts）にフォールバックする（9章：マスタは運用調整可能）。
 */
export async function getClothingLevels(): Promise<ClothingLevelDoc[]> {
  const q = query(collection(getDb(), paths.clothingLevels()), orderBy("level", "asc"));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return DEFAULT_CLOTHING_LEVELS;
  }
  return snapshot.docs.map((d) => d.data() as ClothingLevelDoc);
}
