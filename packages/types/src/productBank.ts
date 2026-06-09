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

export const PRODUCT_BANK_PRECISION_READING_USES: Partial<
  Record<OneTimeProductType, number>
> = {
  PRECISION_READING: 1,
};

export const PRODUCT_BANK_PRECISION_FOLLOW_UP_USES: Partial<
  Record<OneTimeProductType, number>
> = {
  PRECISION_FOLLOW_UP_PACK: 3,
};

export const PRODUCT_BANK_HUMAN_REVIEW_USES: Partial<
  Record<OneTimeProductType, number>
> = {
  HUMAN_ASTROLOGER_REVIEW: 1,
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

export function getPrecisionReadingCreditQuantity(
  productType: OneTimeProductType,
): number {
  return PRODUCT_BANK_PRECISION_READING_USES[productType] ?? 0;
}

export function getPrecisionFollowUpCreditQuantity(
  productType: OneTimeProductType,
): number {
  return PRODUCT_BANK_PRECISION_FOLLOW_UP_USES[productType] ?? 0;
}

export function isPrecisionReadingProduct(
  productType: OneTimeProductType,
): boolean {
  return getPrecisionReadingCreditQuantity(productType) > 0;
}

export function isPrecisionFollowUpProduct(
  productType: OneTimeProductType,
): boolean {
  return getPrecisionFollowUpCreditQuantity(productType) > 0;
}

export function getHumanReviewCreditQuantity(
  productType: OneTimeProductType,
): number {
  return PRODUCT_BANK_HUMAN_REVIEW_USES[productType] ?? 0;
}

export function isHumanReviewProduct(productType: OneTimeProductType): boolean {
  return getHumanReviewCreditQuantity(productType) > 0;
}
