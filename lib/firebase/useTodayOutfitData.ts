"use client";

import { useEffect, useState } from "react";
import { useAnonymousAuth } from "./useAnonymousAuth";
import { getUserSettings } from "../firestore/repositories/userSettingsRepository";
import { getRecentWeatherHistory } from "../firestore/repositories/weatherHistoryRepository";
import { getChangeoverState } from "../firestore/repositories/changeoverStateRepository";
import type { ChangeoverStateDoc, UserSettingsDoc, WeatherHistoryDoc } from "../firestore/schema";

export interface TodayOutfitData {
  settings: UserSettingsDoc;
  today: WeatherHistoryDoc;
  /** 直近7日分（当日含む、日付降順）。衣替え判定（judgeChangeover）に7日未満の場合はnull */
  last7Days: WeatherHistoryDoc[] | null;
  /** 当日を除く直近3日間の平均気温（相対提示の基準線）。データ不足時はnull */
  recentAverageTemp: number | null;
  changeoverState: ChangeoverStateDoc;
}

export type TodayOutfitDataState =
  | { status: "loading" }
  | { status: "no-data" }
  | { status: "error" }
  | { status: "ready"; data: TodayOutfitData };

const DEFAULT_SETTINGS: UserSettingsDoc = {
  locationId: "tokyo",
  offsetDirection: null,
  offsetStrength: "medium",
  outingHours: null,
};

function daysAgoDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

/**
 * 認証済みuidから設定・気温履歴・衣替え状態をFirestoreから読み込み、
 * 「今日の服装」画面（8章）の表示に必要な形にまとめる。
 * Vercel Cron Jobs（7章）がまだ実行されていない等でweather_historyが
 * 空の場合はstatus="no-data"を返し、呼び出し側でサンプル表示にフォールバックできるようにする。
 */
export function useTodayOutfitData(): TodayOutfitDataState {
  const { uid, loading: authLoading } = useAnonymousAuth();
  const [state, setState] = useState<TodayOutfitDataState>({ status: "loading" });

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;

    Promise.all([
      getUserSettings(uid).then((s) => s ?? DEFAULT_SETTINGS),
      getRecentWeatherHistory(DEFAULT_SETTINGS.locationId, daysAgoDateString(30)),
    ])
      .then(async ([settingsResult, initialHistory]) => {
        const settings = settingsResult;
        // 保存済み設定のlocationIdが既定と異なる場合は、そのlocationIdで再取得する
        const history =
          settings.locationId === DEFAULT_SETTINGS.locationId
            ? initialHistory
            : await getRecentWeatherHistory(settings.locationId, daysAgoDateString(30));

        if (cancelled) return;

        if (history.length === 0) {
          setState({ status: "no-data" });
          return;
        }

        const changeoverState = await getChangeoverState(uid, settings.locationId);
        if (cancelled) return;

        const today = history[0];
        const last7Days = history.length >= 7 ? history.slice(0, 7) : null;
        const baselineDays = history.slice(1, 4);
        const recentAverageTemp =
          baselineDays.length > 0
            ? baselineDays.reduce((sum, d) => sum + (d.tempMax + d.tempMin) / 2, 0) / baselineDays.length
            : null;

        setState({
          status: "ready",
          data: { settings, today, last7Days, recentAverageTemp, changeoverState },
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (authLoading) return { status: "loading" };
  return state;
}
