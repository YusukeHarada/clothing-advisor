import { collection, doc, getDocs, orderBy, query, setDoc, where } from "firebase/firestore";
import { getDb } from "../../firebase/config";
import { paths } from "../paths";
import type { WeatherHistoryDoc } from "../schema";

export async function saveWeatherHistoryDay(
  locationId: string,
  entry: WeatherHistoryDoc
): Promise<void> {
  await setDoc(doc(getDb(), paths.weatherHistoryDoc(locationId, entry.date)), entry);
}

/**
 * 直近N日分の気温履歴を日付降順で取得する。
 * 9章の非機能要件（最低30日保持）に沿って、呼び出し側でNを指定する
 * （5.4の相対提示は3日、5.5の衣替え判定は7日を用いる）。
 */
export async function getRecentWeatherHistory(
  locationId: string,
  sinceDate: string
): Promise<WeatherHistoryDoc[]> {
  const q = query(
    collection(getDb(), paths.weatherHistoryCollection(locationId)),
    where("date", ">=", sinceDate),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => d.data() as WeatherHistoryDoc);
}
