import type { SupportedLanguage } from '@pridicta/types';
import webGrowthAdvantageTranslations from './translations/webGrowthAdvantage.json';

export type WebGrowthAdvantageCopy = {
  eyebrow: string;
  title: string;
  intro: string;
  advantages: Array<{
    title: string;
    body: string;
    proof: string;
  }>;
  launchLoop: {
    title: string;
    body: string;
    steps: Array<{
      title: string;
      body: string;
    }>;
  };
  actions: {
    copyInvite: string;
    copied: string;
    openDashboard: string;
    openReports: string;
    redeemPass: string;
  };
};

const COPY: Record<SupportedLanguage, WebGrowthAdvantageCopy> =
  webGrowthAdvantageTranslations.copy as Record<SupportedLanguage, WebGrowthAdvantageCopy>;

export function getWebGrowthAdvantageCopy(
  language: SupportedLanguage,
): WebGrowthAdvantageCopy {
  return COPY[language] ?? COPY.en;
}
