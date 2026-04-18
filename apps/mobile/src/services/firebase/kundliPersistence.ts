import type { KundliData } from '../../types/astrology';
import {
  kundlisCollection,
  serverTimestamp,
  topLevelKundliDocument,
} from './dbService';
import type { FirebaseUserRef } from './firebaseConfig';

type CloudKundliRecord = {
  cloudId: string;
  kundliData: KundliData;
};

export async function saveKundliForUser(
  user: FirebaseUserRef,
  kundli: KundliData,
): Promise<CloudKundliRecord> {
  const docRef = topLevelKundliDocument(kundli.id);

  await docRef.set(
    {
      birthDetails: kundli.birthDetails,
      calculationMeta: kundli.calculationMeta,
      createdAt: serverTimestamp(),
      kundliData: kundli,
      localId: kundli.id,
      resolvedBirthPlace: kundli.birthDetails.resolvedBirthPlace ?? null,
      summary: {
        birthDate: kundli.birthDetails.date,
        birthPlace: kundli.birthDetails.place,
        birthTime: kundli.birthDetails.time,
        lagna: kundli.lagna,
        moonSign: kundli.moonSign,
        nakshatra: kundli.nakshatra,
        name: kundli.birthDetails.name,
      },
      updatedAt: serverTimestamp(),
      userId: user.uid,
    },
    { merge: true },
  );

  return {
    cloudId: docRef.id,
    kundliData: kundli,
  };
}

export async function loadKundlisForUser(
  user: FirebaseUserRef,
): Promise<KundliData[]> {
  const snapshot = await kundlisCollection()
    .where('userId', '==', user.uid)
    .orderBy('updatedAt', 'desc')
    .get();

  return snapshot.docs
    .map(doc => doc.data().kundliData as KundliData | undefined)
    .filter((kundli): kundli is KundliData => Boolean(kundli));
}
