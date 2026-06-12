import {
  getAccuracyMethodCopy,
  type AccuracyMethodCopy,
} from '../../../packages/config/src/accuracyMethod';
import type { SupportedLanguage } from '@pridicta/types';

export type LightweightAccuracyMethodCopy = AccuracyMethodCopy;

export function getLightweightAccuracyMethodCopy(
  language: SupportedLanguage,
): LightweightAccuracyMethodCopy {
  return getAccuracyMethodCopy(language);
}
