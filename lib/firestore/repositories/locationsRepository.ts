import { doc, getDoc, setDoc } from "firebase/firestore";
import { getDb } from "../../firebase/config";
import { paths } from "../paths";
import type { LocationDoc } from "../schema";

export async function getLocation(locationId: string): Promise<LocationDoc | null> {
  const snapshot = await getDoc(doc(getDb(), paths.location(locationId)));
  return snapshot.exists() ? (snapshot.data() as LocationDoc) : null;
}

export async function saveLocation(location: LocationDoc): Promise<void> {
  await setDoc(doc(getDb(), paths.location(location.locationId)), location);
}
