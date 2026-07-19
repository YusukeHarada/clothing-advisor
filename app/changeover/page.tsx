import { judgeChangeover } from "../../lib/weather-core/changeover";
import { sampleChangeoverState, sampleWeatherDTO } from "../../lib/mock/sampleData";

const SEASON_LABEL: Record<"summer" | "winter", string> = {
  summer: "夏物（薄手）",
  winter: "冬物（厚手）",
};

export default function ChangeoverPage() {
  const last7Days = sampleWeatherDTO.daily.map((d) => (d.tempMax + d.tempMin) / 2);
  const judgement = judgeChangeover(last7Days, sampleChangeoverState);

  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-lg font-semibold">衣替え</h1>

      <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
        <div className="text-xs text-black/60 dark:text-white/60">現在の状態</div>
        <div className="mt-1 text-xl font-semibold">
          {SEASON_LABEL[sampleChangeoverState.currentSeasonMode]}
        </div>
      </section>

      <section className="rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
        <div className="text-black/60 dark:text-white/60">直近7日の移動平均気温</div>
        <div className="mt-1 text-lg">{judgement.movingAverageTemp.toFixed(1)}℃</div>
      </section>

      {judgement.shouldSuggestChangeover && judgement.suggestedMode ? (
        <section className="rounded-lg bg-amber-100 p-4 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          {SEASON_LABEL[judgement.suggestedMode]}への衣替えをおすすめします。
        </section>
      ) : (
        <section className="rounded-lg bg-black/5 p-4 text-sm dark:bg-white/10">
          現時点では衣替えの提案はありません。
        </section>
      )}
    </main>
  );
}
