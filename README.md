# clothing-advisor

現在の気温・天気に応じて、当日の服装の厚さ指標と衣替え時期を提示するアプリ。

## 概要

性質の異なる2機能を同等に扱う。

- 当日の服装（連続・毎日利用）：予報から服装の厚さを昼／朝晩の二段で提示する
- 衣替え時期（離散・季節イベント）：週間平均気温の移動平均から入替え時期を判定する

## 主な機能

- 地点の気温（最高／最低）・天気・風速・湿度・7日予報の取得とキャッシュ
- 体感温度補正を経た服装レベルの提示（昼／朝晩の二段）
- 直近平均との相対提示（「一枚多め／少なめ」）
- ヒステリシス付きの衣替え判定
- 寒がり／暑がりの個人オフセット

## 技術構成

- Next.js
- Firebase（Firestore）
- 外部気象API：気象庁（無料・APIキー不要・週間予報あり）
- デプロイ先：Vercel（サーバ側スケジュール取得はVercel Cron Jobsで実装）

## ドキュメント

要件定義書：[docs/requirements.md](docs/requirements.md)（未決事項はすべて確定済み。決定内容は10章を参照）

## ステータス

要件定義完了。MVP実装（ロジック層・WeatherProvider・Firestoreデータ層・画面）は完了し、実Firebaseプロジェクト・Vercelへのデプロイも完了（`https://clothing-advisor.vercel.app`）。

- 気象データ取得は`/api/cron/fetch-weather`（Vercel Cron Jobs、毎日07:00 JST。Hobbyプランは1日1回までのためこの頻度）に統一し、Firebase Admin SDK経由で`weather_history`へ書き込む。書き込みはこの経路のみで、クライアントSDKからの書き込みは`firestore.rules`で拒否する
- 「今日の服装」画面はFirestoreの実データを読み込む。まだデータが無い場合（初回デプロイ直後等）はサンプルデータにフォールバックし、その旨をバナーで表示する
- 設定画面の保存はFirebase Authenticationの匿名認証（Anonymous Auth）で有効化済み。ログインUIなしでデバイスごとにuidが自動発行される
- 地点は東京・大阪・札幌・福岡・茨城県（南部）に対応（`lib/weather-provider/locationResolver.ts`）

## ローカル開発

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # vitest
npm run emulators    # Firestore + Auth Emulator（別ターミナルで起動し、.env.localでNEXT_PUBLIC_USE_FIREBASE_EMULATOR=trueを設定）
```

`/api/cron/fetch-weather`をローカルで手動実行する場合は、`.env.local`にFirebase Admin SDKの認証情報（`FIREBASE_ADMIN_*`）を設定し、`curl http://localhost:3000/api/cron/fetch-weather`を呼び出す。`CRON_SECRET`を設定している場合は`Authorization: Bearer <CRON_SECRET>`ヘッダを付与する。

## 補足

体感温度・不快指数の計算、気象取得・キャッシュ、個人オフセットは aircon-advisor と共通化できる。将来的に統合する場合は共有モジュールとして切り出す。
