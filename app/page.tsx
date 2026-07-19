import { computeDailyOutfit } from "../lib/weather-core/dailyOutfit";
import { computeRelativeAdvice } from "../lib/weather-core/relativeAdvice";
import { judgeChangeover } from "../lib/weather-core/changeover";
import { applyPersonalOffset } from "../lib/weather-core/personalOffset";
import {
  sampleChangeoverState,
  sampleRecentAverageTemp,
  sampleUserSettings,
  sampleWeatherDTO,
} from "../lib/mock/sampleData";
import { ChangeoverBanner } from "./components/ChangeoverBanner";
import { OutfitTierCard } from "./components/OutfitTierCard";

export default function TodayOutfitPage() {
  const today = sampleWeatherDTO.daily[0];
  const settings = sampleUserSettings;

  const outfit = computeDailyOutfit({
    tempMax: today.tempMax,
    tempMin: today.tempMin,
    humidity: today.humidity,
    windSpeed: today.windSpeed,
    outingHours: settings.outingHours,
  });

  const dayLevelTemp = outfit.tiers[0].feelsLikeTemp;
  const relativeAdvice = computeRelativeAdvice(dayLevelTemp, sampleRecentAverageTemp);

  const last7Days = sampleWeatherDTO.daily.map((d) => (d.tempMax + d.tempMin) / 2);
  const changeover = judgeChangeover(last7Days, sampleChangeoverState);

  const personalizedLevel = settings.offsetDirection
    ? applyPersonalOffset(dayLevelTemp, settings.offsetDirection, settings.offsetStrength)
    : null;

  const primaryOrTiers = outfit.primaryTier ? [outfit.primaryTier] : outfit.tiers;
  const secondaryTiers = outfit.primaryTier ? outfit.tiers : [];

  return (
    <div>
      <ChangeoverBanner suggestedMode={changeover.shouldSuggestChangeover ? changeover.suggestedMode : null} />

      <main className="mx-auto max-w-md space-y-6 p-4">
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

        {relativeAdvice.message && (
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
          データ取得時刻：{new Date(sampleWeatherDTO.fetchedAt).toLocaleString("ja-JP")}
        </p>
      </main>
    </div>
  );
}
