import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "../../firebase/config";
import { paths } from "../paths";
import type { UserSettingsDoc } from "../schema";

export async function getUserSettings(uid: string): Promise<UserSettingsDoc | null> {
  const snapshot = await getDoc(doc(getDb(), paths.userSettings(uid)));
  return snapshot.exists() ? (snapshot.data() as UserSettingsDoc) : null;
}

export async function saveUserSettings(uid: string, settings: UserSettingsDoc): Promise<void> {
  await setDoc(doc(getDb(), paths.userSettings(uid)), settings);
}
