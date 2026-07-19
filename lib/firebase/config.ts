import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebaseプロジェクトの実設定（NEXT_PUBLIC_FIREBASE_*）は後回しとし、
 * 未設定時はダミー値でFirestore Emulatorに接続する開発用フォールバックを持つ。
 * 本番運用時は環境変数を設定した上でNEXT_PUBLIC_USE_FIREBASE_EMULATORをfalse/未設定にする。
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "demo-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "0",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "demo-app-id",
};

const USE_EMULATOR = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

let app: FirebaseApp;
let db: Firestore;
let emulatorConnected = false;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    if (USE_EMULATOR && !emulatorConnected) {
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      emulatorConnected = true;
    }
  }
  return db;
}
