import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "../../firebase/config";
import { paths } from "../paths";
import type { ChangeoverStateDoc } from "../schema";

const DEFAULT_STATE: ChangeoverStateDoc = {
  currentSeasonMode: "summer",
  lastSuggestedAt: null,
};

export async function getChangeoverState(
  uid: string,
  locationId: string
): Promise<ChangeoverStateDoc> {
  const snapshot = await getDoc(doc(getDb(), paths.changeoverState(uid, locationId)));
  return snapshot.exists() ? (snapshot.data() as ChangeoverStateDoc) : DEFAULT_STATE;
}

/**
 * 5.5・決定ログD-04のとおり、閾値変更時もこの関数はリセットせず
 * 呼び出し側が判定した新しいモードをそのまま保存する。
 */
export async function saveChangeoverState(
  uid: string,
  locationId: string,
  state: ChangeoverStateDoc
): Promise<void> {
  await setDoc(doc(getDb(), paths.changeoverState(uid, locationId)), state);
}
