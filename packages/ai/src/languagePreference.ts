import { getAiLanguageInstruction, normalizeLocale } from '@pridicta/config';
import type { AppLocale } from '@pridicta/types';

export type AiLanguageContext = {
  locale: AppLocale;
  instruction: string;
};

export function buildAiLanguageContext(locale?: string | null): AiLanguageContext {
  const normalized = normalizeLocale(locale);

  return {
    instruction: getAiLanguageInstruction(normalized),
    locale: normalized,
  };
}
