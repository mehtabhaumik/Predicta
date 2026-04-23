'use client';

import {
  resolvePredictaWebBackendUrl,
} from '@pridicta/config';
import { createBackendAuthorityClient } from '@pridicta/firebase';
import { getFirebaseWebAuth } from './firebase/client';

export function getWebBackendAuthorityBaseUrl() {
  return resolvePredictaWebBackendUrl({
    configuredUrl: process.env.NEXT_PUBLIC_PRIDICTA_BACKEND_URL,
  });
}

export function getWebBackendAuthorityClient() {
  return createBackendAuthorityClient({
    baseUrl: getWebBackendAuthorityBaseUrl(),
    getIdToken: async () => {
      const user = getFirebaseWebAuth().currentUser;
      return user ? user.getIdToken() : undefined;
    },
  });
}

export function getCurrentWebAuthUser() {
  return getFirebaseWebAuth().currentUser;
}
