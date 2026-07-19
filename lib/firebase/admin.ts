import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * サーバ側（Vercel Cron Jobs等）専用のFirebase Admin初期化。
 * Firestoreセキュリティルール（firestore.rules）をバイパスして書き込むため、
 * weather_history等のマスタ更新はクライアントSDKではなくこちらを経由する。
 *
 * Firestore Emulator接続時（FIRESTORE_EMULATOR_HOST設定時）はサービスアカウント認証情報が
 * 不要なため、プロジェクトIDのみで初期化する。本番はFIREBASE_ADMIN_*環境変数が必須。
 */
let app: App;
let db: Firestore;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0];
    return app;
  }

  if (process.env.FIRESTORE_EMULATOR_HOST) {
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-project",
    });
    return app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin credentials are missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export function getAdminDb(): Firestore {
  if (!db) {
    db = getFirestore(getAdminApp());
  }
  return db;
}
