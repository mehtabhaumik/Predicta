'use client';

import {
  PREDICTA_PROTECTED_BACKEND_URL,
  resolveBackendUrl,
} from '@pridicta/config';
import { createBackendAuthorityClient } from '@pridicta/firebase';
import { getFirebaseWebAuth } from './firebase/client';

const backendAuthorityUrl = resolveBackendUrl(
  process.env.NEXT_PUBLIC_PRIDICTA_BACKEND_URL,
  PREDICTA_PROTECTED_BACKEND_URL,
);

export function getWebBackendAuthorityClient() {
  return createBackendAuthorityClient({
    baseUrl: backendAuthorityUrl,
    getIdToken: async () => {
      const user = getFirebaseWebAuth().currentUser;
      return user ? user.getIdToken() : undefined;
    },
  });
}

export function getCurrentWebAuthUser() {
  return getFirebaseWebAuth().currentUser;
}
