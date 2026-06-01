'use client';

import { getFirebaseWebAuth } from './client';

export async function getCurrentWebAuthToken(): Promise<string> {
  const user = getFirebaseWebAuth().currentUser;

  if (!user) {
    throw new Error('Please sign in with Google before using this Predicta action.');
  }

  return user.getIdToken();
}

export async function getWebAuthHeaders(): Promise<Record<string, string>> {
  const token = await getCurrentWebAuthToken();
  return {
    Authorization: `Bearer ${token}`,
  };
}
