import Link from "next/link";
import type { SeasonMode } from "../../lib/weather-core/changeover";

/**
 * 5.5：衣替え提案はプッシュ通知を持たないMVPでは見逃されやすいため、
 * 該当時は「今日の服装」画面の最上部に固定表示する。
 */
export function ChangeoverBanner({ suggestedMode }: { suggestedMode: SeasonMode | null }) {
  if (!suggestedMode) return null;

  const label = suggestedMode === "winter" ? "厚手への衣替え時期です" : "薄手への衣替え時期です";

  return (
    <Link
      href="/changeover"
      className="block bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
    >
      {label}。詳細を見る →
    </Link>
  );
}
