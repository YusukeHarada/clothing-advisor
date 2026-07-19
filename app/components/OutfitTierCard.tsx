import type { DailyOutfitTier } from "../../lib/weather-core/dailyOutfit";

export function OutfitTierCard({ tier, highlight = false }: { tier: DailyOutfitTier; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        highlight
          ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="text-xs text-black/60 dark:text-white/60">{tier.label}</div>
      <div className="mt-1 text-2xl font-semibold">{tier.feelsLikeTemp}℃</div>
      <div className="mt-1 text-sm">
        レベル{tier.clothingLevel.level}：{tier.clothingLevel.label}
      </div>
    </div>
  );
}
