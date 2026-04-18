import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'pridicta.device.installId.v1';

export async function getInstallDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);

  if (existing) {
    return existing;
  }

  const next = `device-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 12)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, next);

  return next;
}
