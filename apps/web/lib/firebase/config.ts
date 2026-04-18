import type { FirebaseOptions } from 'firebase/app';

export const firebaseWebConfig: FirebaseOptions = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
    'AIzaSyDK4CQXC9gPqOqX9lJEcKYbt_rt5kXvqL4',
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
    '1:759876006782:web:8c350429f635548ec6792f',
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
    'predicta-a4758.firebaseapp.com',
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? 'G-R5N9VD3E0L',
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '759876006782',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'predicta-a4758',
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
    'predicta-a4758.firebasestorage.app',
};

export function hasFirebaseWebConfig(): boolean {
  return Boolean(
    firebaseWebConfig.apiKey &&
      firebaseWebConfig.appId &&
      firebaseWebConfig.authDomain &&
      firebaseWebConfig.projectId &&
      firebaseWebConfig.storageBucket,
  );
}
