/**
 * 6章のコレクション構成に対応するFirestoreパスビルダー。
 * SDK呼び出しから分離することでパス構成自体を単体テストできる。
 */
export const paths = {
  location: (locationId: string) => `locations/${locationId}`,
  locations: () => "locations",

  userSettings: (uid: string) => `users/${uid}/settings/default`,

  clothingLevel: (level: number) => `clothing_levels/${level}`,
  clothingLevels: () => "clothing_levels",

  weatherHistoryDoc: (locationId: string, date: string) =>
    `weather_history/${locationId}/history/${date}`,
  weatherHistoryCollection: (locationId: string) => `weather_history/${locationId}/history`,

  changeoverState: (uid: string, locationId: string) =>
    `users/${uid}/locations/${locationId}/changeover_state/current`,
} as const;
