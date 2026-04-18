import * as Keychain from 'react-native-keychain';

import type { KundliData } from '../../types/astrology';

const PIN_SERVICE = 'com.pridicta.pin';
const KUNDLI_SERVICE = 'com.pridicta.kundli';

function simplePinHash(pin: string): string {
  return Array.from(`pridicta:${pin}`)
    .reduce(
      (hash, char) => (hash * 31 + char.charCodeAt(0)) % 4294967296,
      2166136261,
    )
    .toString(16);
}

export async function savePin(pin: string): Promise<void> {
  await Keychain.setGenericPassword('pin', simplePinHash(pin), {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    service: PIN_SERVICE,
  });
}

export async function verifyPin(pin: string): Promise<boolean> {
  const credentials = await Keychain.getGenericPassword({
    service: PIN_SERVICE,
  });

  return Boolean(credentials && credentials.password === simplePinHash(pin));
}

export async function clearPin(): Promise<void> {
  await Keychain.resetGenericPassword({ service: PIN_SERVICE });
}

export async function isBiometrySupported(): Promise<boolean> {
  const biometryType = await Keychain.getSupportedBiometryType();

  return Boolean(biometryType);
}

export async function saveSensitiveKundliSnapshot(
  kundli: KundliData,
): Promise<void> {
  await Keychain.setGenericPassword('kundli', JSON.stringify(kundli), {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    service: KUNDLI_SERVICE,
  });
}

export async function getSensitiveKundliSnapshot(): Promise<KundliData | null> {
  const credentials = await Keychain.getGenericPassword({
    service: KUNDLI_SERVICE,
  });

  if (!credentials) {
    return null;
  }

  return JSON.parse(credentials.password) as KundliData;
}
