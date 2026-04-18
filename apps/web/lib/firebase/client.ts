'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAnalytics,
  isSupported,
  type Analytics,
} from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { firebaseWebConfig, hasFirebaseWebConfig } from './config';

let analyticsPromise: Promise<Analytics | null> | null = null;

export function getFirebaseWebApp(): FirebaseApp {
  if (!hasFirebaseWebConfig()) {
    throw new Error('Firebase web config is incomplete.');
  }

  return getApps().length > 0 ? getApp() : initializeApp(firebaseWebConfig);
}

export function getFirebaseWebAuth(): Auth {
  return getAuth(getFirebaseWebApp());
}

export function getFirebaseWebDb(): Firestore {
  return getFirestore(getFirebaseWebApp());
}

export function getFirebaseWebStorage(): FirebaseStorage {
  return getStorage(getFirebaseWebApp());
}

export function initializeClientTelemetry(): Promise<Analytics | null> {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }

  analyticsPromise ??= isSupported()
    .then(supported => (supported ? getAnalytics(getFirebaseWebApp()) : null))
    .catch(() => null);

  return analyticsPromise;
}
