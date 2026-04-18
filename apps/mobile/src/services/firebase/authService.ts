import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { env } from '../../config/env';
import type { AuthState } from '../../types/astrology';
import type { FirebaseUserRef } from './firebaseConfig';

function mapFirebaseUser(
  user: import('@react-native-firebase/auth').FirebaseAuthTypes.User | null,
): AuthState {
  const providerId = user?.providerData[0]?.providerId;
  const provider =
    providerId === 'password'
      ? 'password'
      : providerId === 'apple.com'
      ? 'apple'
      : providerId === 'microsoft.com'
      ? 'microsoft'
      : user
      ? 'google'
      : null;

  return {
    displayName: user?.displayName ?? undefined,
    email: user?.email ?? undefined,
    isLoggedIn: Boolean(user),
    photoURL: user?.photoURL ?? undefined,
    provider,
    userId: user?.uid,
  };
}

export function configureGoogleSignIn(): void {
  GoogleSignin.configure({
    webClientId: env.googleWebClientId || undefined,
  });
}

export async function signInWithGoogle(): Promise<AuthState> {
  configureGoogleSignIn();

  if (!env.googleWebClientId) {
    throw new Error(
      'Google Web Client ID is missing. Add GOOGLE_WEB_CLIENT_ID to the app environment.',
    );
  }

  await GoogleSignin.hasPlayServices({
    showPlayServicesUpdateDialog: true,
  });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;

  if (!idToken) {
    throw new Error('Google sign-in did not return an identity token.');
  }

  const credential = auth.GoogleAuthProvider.credential(idToken);
  const userCredential = await auth().signInWithCredential(credential);

  return mapFirebaseUser(userCredential.user);
}

export async function signOutGoogle(): Promise<AuthState> {
  await auth().signOut();
  await GoogleSignin.signOut().catch(() => undefined);
  return mapFirebaseUser(null);
}

export async function signInWithEmailPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthState> {
  const result = await auth().signInWithEmailAndPassword(
    email.trim(),
    password,
  );
  return mapFirebaseUser(result.user);
}

export async function registerWithEmailPassword({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AuthState> {
  const result = await auth().createUserWithEmailAndPassword(
    email.trim(),
    password,
  );
  return mapFirebaseUser(result.user);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await auth().sendPasswordResetEmail(email.trim());
}

export async function signInWithApple(): Promise<AuthState> {
  const provider = new auth.OAuthProvider('apple.com');
  const userCredential = await auth().signInWithProvider(provider);
  return mapFirebaseUser(userCredential.user);
}

export async function signInWithMicrosoft(): Promise<AuthState> {
  const provider = new auth.OAuthProvider('microsoft.com');
  const userCredential = await auth().signInWithProvider(provider);
  return mapFirebaseUser(userCredential.user);
}

export async function getCurrentAuthState(): Promise<AuthState> {
  return mapFirebaseUser(auth().currentUser);
}

export async function getCurrentFirebaseUser(): Promise<FirebaseUserRef | null> {
  const user = auth().currentUser;

  if (!user) {
    return null;
  }

  return { uid: user.uid };
}

export async function requireFirebaseUser(): Promise<FirebaseUserRef> {
  const user = await getCurrentFirebaseUser();

  if (!user) {
    throw new Error('Firebase auth is not connected yet.');
  }

  return user;
}
