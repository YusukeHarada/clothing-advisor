"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getAuthInstance } from "./config";

export interface AnonymousAuthState {
  uid: string | null;
  loading: boolean;
}

/**
 * users/{uid}配下のFirestoreルール（request.auth.uid == uid）を満たすため、
 * ログインUIなしで匿名認証を確立するフック。
 * 認証が確立するまでuidはnullを返す。
 */
export function useAnonymousAuth(): AnonymousAuthState {
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuthInstance();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setLoading(false);
      } else {
        signInAnonymously(auth).catch(() => {
          setLoading(false);
        });
      }
    });
    return unsubscribe;
  }, []);

  return { uid, loading };
}
