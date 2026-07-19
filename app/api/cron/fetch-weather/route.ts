import { NextResponse } from "next/server";
import { fetchNormalizedWeather } from "../../../../lib/weather-provider/jmaProvider";
import { KNOWN_LOCATIONS } from "../../../../lib/weather-provider/locationResolver";
import { saveWeatherHistoryDayAsAdmin } from "../../../../lib/firestore/admin/weatherHistoryRepository";

/**
 * Vercel Cron Jobs（vercel.json参照）から1日数回呼ばれるスケジュール取得エンドポイント。
 * 7章のとおり、取得はこの単一経路に統一し、クライアントはFirestoreを読むのみとする。
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const results = await Promise.allSettled(
    KNOWN_LOCATIONS.map(async (location) => {
      const dto = await fetchNormalizedWeather(location.locationId);
      await Promise.all(
        dto.daily.map((day) =>
          saveWeatherHistoryDayAsAdmin(location.locationId, { ...day, fetchedAt: dto.fetchedAt })
        )
      );
      return { locationId: location.locationId, days: dto.daily.length };
    })
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) => ({ r, locationId: KNOWN_LOCATIONS[i].locationId }))
    .filter(({ r }) => r.status === "rejected")
    .map(({ r, locationId }) => ({
      locationId,
      error: r.status === "rejected" ? String(r.reason) : "",
    }));

  return NextResponse.json({ succeeded, failed });
}
