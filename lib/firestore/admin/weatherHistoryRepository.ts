import { getAdminDb } from "../../firebase/admin";
import { paths } from "../paths";
import type { WeatherHistoryDoc } from "../schema";

/**
 * サーバ側（Cron Jobs等）からweather_historyへ書き込む。Admin SDK経由のため
 * firestore.rules（クライアント書き込み禁止）をバイパスする。7章参照。
 */
export async function saveWeatherHistoryDayAsAdmin(
  locationId: string,
  entry: WeatherHistoryDoc
): Promise<void> {
  await getAdminDb().doc(paths.weatherHistoryDoc(locationId, entry.date)).set(entry);
}
