import type { OneTimeProductType } from './subscription';

export const PRODUCT_BANK_QUESTION_PACK_USES: Partial<
  Record<OneTimeProductType, number>
> = {
  AI_QUESTIONS_10: 10,
  AI_QUESTIONS_25: 25,
  AI_QUESTIONS_100: 100,
  FIVE_QUESTIONS: 5,
};

export const PRODUCT_BANK_REPORT_PACK_USES: Partial<
  Record<OneTimeProductType, number>
> = {
  DETAILED_KUNDLI_REPORT: 1,
  JAIMINI_REPORT: 1,
  MARRIAGE_COMPATIBILITY_REPORT: 1,
  PREMIUM_PDF: 1,
  REPORT_BUNDLE: 5,
  REPORT_SINGLE: 1,
};

export function getQuestionCreditQuantity(
  productType: OneTimeProductType,
): number {
  return PRODUCT_BANK_QUESTION_PACK_USES[productType] ?? 0;
}

export function getReportCreditQuantity(productType: OneTimeProductType): number {
  return PRODUCT_BANK_REPORT_PACK_USES[productType] ?? 0;
}

export function isQuestionPackProduct(productType: OneTimeProductType): boolean {
  return getQuestionCreditQuantity(productType) > 0;
}

export function isReportPackProduct(productType: OneTimeProductType): boolean {
  return getReportCreditQuantity(productType) > 0;
}
