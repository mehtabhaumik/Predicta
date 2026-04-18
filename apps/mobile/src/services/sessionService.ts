import { useAppStore } from '../store/useAppStore';

export async function bootstrapSession(): Promise<{
  onboardingComplete: boolean;
  securityEnabled: boolean;
}> {
  const { onboardingComplete, securityEnabled } = useAppStore.getState();

  return {
    onboardingComplete,
    securityEnabled,
  };
}
