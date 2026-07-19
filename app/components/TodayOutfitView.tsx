"use client";

import { computeDailyOutfit } from "../../lib/weather-core/dailyOutfit";
import { computeRelativeAdvice } from "../../lib/weather-core/relativeAdvice";
import { judgeChangeover } from "../../lib/weather-core/changeover";
import { applyPersonalOffset } from "../../lib/weather-core/personalOffset";
import {
  sampleChangeoverState,
  sampleRecentAverageTemp,
  sampleUserSettings,
  sampleWeatherDTO,
} from "../../lib/mock/sampleData";
import { useTodayOutfitData, type TodayOutfitData } from "../../lib/firebase/useTodayOutfitData";
import { ChangeoverBanner } from "./ChangeoverBanner";
import { OutfitTierCard } from "./OutfitTierCard";

const sampleHistory = sampleWeatherDTO.daily.map((day) => ({
  ...day,
  fetchedAt: sampleWeatherDTO.fetchedAt,
}));

const SAMPLE_DATA: TodayOutfitData = {
  settings: sampleUserSettings,
  today: sampleHistory[0],
  last7Days: sampleHistory,
  recentAverageTemp: sampleRecentAverageTemp,
  changeoverState: sampleChangeoverState,
};

export function TodayOutfitView() {
  const state = useTodayOutfitData();

  if (state.status === "loading") {
    return <main className="mx-auto max-w-md p-4 text-sm text-black/60 dark:text-white/60">読み込み中…</main>;
  }

  const isSample = state.status !== "ready";
  const data = state.status === "ready" ? state.data : SAMPLE_DATA;

  const { settings, today, last7Days, recentAverageTemp, changeoverState } = data;

  const outfit = computeDailyOutfit({
    tempMax: today.tempMax,
    tempMin: today.tempMin,
    humidity: today.humidity,
    windSpeed: today.windSpeed,
    outingHours: settings.outingHours,
  });

  const dayLevelTemp = outfit.tiers[0].feelsLikeTemp;
  const relativeAdvice =
    recentAverageTemp !== null ? computeRelativeAdvice(dayLevelTemp, recentAverageTemp) : null;

  const changeover = last7Days
    ? judgeChangeover(
        last7Days.map((d) => (d.tempMax + d.tempMin) / 2),
        changeoverState
      )
    : null;

  const personalizedLevel = settings.offsetDirection
    ? applyPersonalOffset(dayLevelTemp, settings.offsetDirection, settings.offsetStrength)
    : null;

  const primaryOrTiers = outfit.primaryTier ? [outfit.primaryTier] : outfit.tiers;
  const secondaryTiers = outfit.primaryTier ? outfit.tiers : [];

  return (
    <div>
      {changeover && (
        <ChangeoverBanner suggestedMode={changeover.shouldSuggestChangeover ? changeover.suggestedMode : null} />
      )}

      <main className="mx-auto max-w-md space-y-6 p-4">
        {isSample && (
          <section className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-100">
            {state.status === "no-data"
              ? "気温データがまだありません。サンプルデータを表示しています（Vercel Cron Jobsの初回実行後に実データへ切り替わります）"
              : "データの取得に失敗したため、サンプルデータを表示しています"}
          </section>
        )}

        <section>
          <h1 className="mb-3 text-lg font-semibold">今日の服装</h1>
          <div className="grid grid-cols-2 gap-3">
            {primaryOrTiers.map((tier) => (
              <OutfitTierCard key={tier.label} tier={tier} highlight />
            ))}
          </div>
          {secondaryTiers.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-3 opacity-70">
              {secondaryTiers.map((tier) => (
                <OutfitTierCard key={tier.label} tier={tier} />
              ))}
            </div>
          )}
        </section>

        {personalizedLevel && (
          <section className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
            <div className="text-black/60 dark:text-white/60">個人オフセット反映後</div>
            <div className="mt-1">
              レベル{personalizedLevel.level}：{personalizedLevel.label}
            </div>
          </section>
        )}

        {relativeAdvice?.message && (
          <section className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
            {relativeAdvice.message}
          </section>
        )}

        <section className="flex items-center gap-2 text-sm">
          <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/10">
            {today.isRainy ? "☂ 傘・レインウェアが必要です" : "☀ 雨具は不要です"}
          </span>
        </section>

        <p className="text-xs text-black/40 dark:text-white/40">
          データ取得時刻：{new Date(today.fetchedAt).toLocaleString("ja-JP")}
        </p>
      </main>
    </div>
  );
}
