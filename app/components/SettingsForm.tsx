"use client";

import { useState } from "react";
import type { UserSettingsDoc } from "../../lib/firestore/schema";
import { saveUserSettings } from "../../lib/firestore/repositories/userSettingsRepository";
import { KNOWN_LOCATIONS } from "../../lib/weather-provider/locationResolver";
import type { OffsetStrength } from "../../lib/weather-core/types";

const OFFSET_DIRECTION_LABEL = {
  none: "指定なし",
  coldSensitive: "寒がり",
  heatSensitive: "暑がり",
} as const;

const OFFSET_STRENGTH_LABEL: Record<OffsetStrength, string> = {
  weak: "弱",
  medium: "中",
  strong: "強",
};

/**
 * uidは本来Firebase Authenticationから取得する。認証は対象外機能の範囲外のため、
 * ここではローカル開発用の固定uidをプレースホルダーとして使う。
 */
const DEV_UID = "local-dev-user";

export function SettingsForm({ initialSettings }: { initialSettings: UserSettingsDoc }) {
  const [settings, setSettings] = useState(initialSettings);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const offsetDirectionKey = settings.offsetDirection ?? "none";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      // Firestore SDKはネットワーク到達不能時に無応答のまま待ち続けることがあるため、
      // Firebaseプロジェクト・Emulator未接続の開発環境でも一定時間でUIに失敗を返す
      await Promise.race([
        saveUserSettings(DEV_UID, settings),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
      ]);
      setStatus("saved");
    } catch {
      // Firebaseプロジェクト・Emulatorが未接続の環境では失敗しうる（想定内）
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium">地点</label>
        <select
          className="w-full rounded-lg border border-black/10 p-2 dark:border-white/10 dark:bg-black"
          value={settings.locationId}
          onChange={(e) => setSettings({ ...settings, locationId: e.target.value })}
        >
          {KNOWN_LOCATIONS.map((loc) => (
            <option key={loc.locationId} value={loc.locationId}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">寒がり／暑がり</label>
        <div className="flex gap-2">
          {(Object.keys(OFFSET_DIRECTION_LABEL) as Array<keyof typeof OFFSET_DIRECTION_LABEL>).map(
            (key) => (
              <button
                type="button"
                key={key}
                onClick={() =>
                  setSettings({
                    ...settings,
                    offsetDirection: key === "none" ? null : key,
                  })
                }
                className={`flex-1 rounded-lg border p-2 text-sm ${
                  offsetDirectionKey === key
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                {OFFSET_DIRECTION_LABEL[key]}
              </button>
            )
          )}
        </div>
      </div>

      {settings.offsetDirection && (
        <div>
          <label className="mb-1 block text-sm font-medium">オフセットの強さ</label>
          <div className="flex gap-2">
            {(Object.keys(OFFSET_STRENGTH_LABEL) as OffsetStrength[]).map((strength) => (
              <button
                type="button"
                key={strength}
                onClick={() => setSettings({ ...settings, offsetStrength: strength })}
                className={`flex-1 rounded-lg border p-2 text-sm ${
                  settings.offsetStrength === strength
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40"
                    : "border-black/10 dark:border-white/10"
                }`}
              >
                {OFFSET_STRENGTH_LABEL[strength]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">外出時間帯（任意）</label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            className="rounded-lg border border-black/10 p-2 dark:border-white/10 dark:bg-black"
            value={settings.outingHours?.start ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                outingHours: { start: e.target.value, end: settings.outingHours?.end ?? "" },
              })
            }
          />
          <span>〜</span>
          <input
            type="time"
            className="rounded-lg border border-black/10 p-2 dark:border-white/10 dark:bg-black"
            value={settings.outingHours?.end ?? ""}
            onChange={(e) =>
              setSettings({
                ...settings,
                outingHours: { start: settings.outingHours?.start ?? "", end: e.target.value },
              })
            }
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 p-3 text-sm font-medium text-white disabled:opacity-50"
        disabled={status === "saving"}
      >
        {status === "saving" ? "保存中…" : "保存する"}
      </button>

      {status === "saved" && <p className="text-sm text-emerald-600">保存しました</p>}
      {status === "error" && (
        <p className="text-sm text-red-600">
          保存に失敗しました（Firebaseプロジェクト未接続の可能性があります）
        </p>
      )}
    </form>
  );
}
