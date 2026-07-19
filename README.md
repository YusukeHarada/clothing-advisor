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

## ドキュメント

要件定義書：[docs/requirements.md](docs/requirements.md)（未決事項はすべて確定済み。決定内容は10章を参照）

## ステータス

要件定義完了。MVP実装（ロジック層・WeatherProvider・Firestoreデータ層・画面）は一通り完了。以下は未着手・保留中。

- 実Firebaseプロジェクトの作成・接続（意図的に保留中。`.env.example`参照）
- Firebase Authenticationの導入（`firestore.rules`は`request.auth.uid`前提だが認証自体は未実装。導入までは設定画面の保存がルールにより失敗する）
- 気象庁APIレスポンスの実データでの構造検証（開発環境のネットワーク制約により未検証）

## ローカル開発

```bash
npm install
npm run dev          # http://localhost:3000
npm run test         # vitest
npm run emulators    # Firestore Emulator（別ターミナルで起動し、.env.localでNEXT_PUBLIC_USE_FIREBASE_EMULATOR=trueを設定）
```

## 補足

体感温度・不快指数の計算、気象取得・キャッシュ、個人オフセットは aircon-advisor と共通化できる。将来的に統合する場合は共有モジュールとして切り出す。
