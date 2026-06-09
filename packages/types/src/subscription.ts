import type { UserPlan } from './astrology';

export type BillingPeriod = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type OneTimeProductType =
  | 'AI_QUESTIONS_10'
  | 'AI_QUESTIONS_25'
  | 'AI_QUESTIONS_100'
  | 'DAY_PASS'
  | 'FIVE_QUESTIONS'
  | 'HUMAN_ASTROLOGER_REVIEW'
  | 'PREMIUM_PDF'
  | 'REPORT_SINGLE'
  | 'REPORT_BUNDLE'
  | 'JAIMINI_REPORT'
  | 'PRECISION_READING'
  | 'PRECISION_FOLLOW_UP_PACK'
  | 'DETAILED_KUNDLI_REPORT'
  | 'MARRIAGE_COMPATIBILITY_REPORT';

export type PricingPlan = {
  id: BillingPeriod;
  productId: string;
  label: string;
  priceInr: number;
  displayPrice: string;
  billingCopy: string;
  monthlyEquivalent?: string;
  badge?: string;
  recommended?: boolean;
  regularPriceInr?: number;
};

export type OneTimeProduct = {
  id: OneTimeProductType;
  productId: string;
  label: string;
  priceInr: number;
  displayPrice: string;
  description: string;
  badge?: string;
};

export type SubscriptionStatus =
  | 'NONE'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELED'
  | 'GRACE_PERIOD'
  | 'BILLING_RETRY'
  | 'UNKNOWN';

export type EntitlementSource =
  | 'local'
  | 'firebase'
  | 'app_store'
  | 'play_store'
  | 'razorpay'
  | 'mock';

export type EntitlementState = {
  plan: UserPlan;
  status: SubscriptionStatus;
  source: EntitlementSource;
  activeProductId?: string;
  expiresAt?: string;
  updatedAt: string;
};

export type OneTimeEntitlement = {
  productType: OneTimeProductType;
  productId: string;
  remainingUses?: number;
  expiresAt?: string;
  kundliId?: string;
  purchasedAt: string;
  source: EntitlementSource;
};

export type MonetizationState = {
  entitlement: EntitlementState;
  oneTimeEntitlements: OneTimeEntitlement[];
};

export type BillingProductKind = 'SUBSCRIPTION' | 'ONE_TIME';

export type BillingProduct = {
  productId: string;
  kind: BillingProductKind;
  period?: BillingPeriod;
  oneTimeType?: OneTimeProductType;
  title: string;
  price: string;
  currencyCode: string;
  rawPrice?: number;
};

export type BillingPurchaseStatus =
  | 'SUCCESS'
  | 'CANCELED'
  | 'FAILED'
  | 'PENDING'
  | 'RESTORED';

export type BillingPurchaseResult = {
  status: BillingPurchaseStatus;
  productId?: string;
  transactionId?: string;
  entitlement?: EntitlementState;
  oneTimeEntitlement?: OneTimeEntitlement;
  paymentIntent?: Record<string, unknown>;
  errorMessage?: string;
};

export type BillingProvider = {
  getProducts(): Promise<BillingProduct[]>;
  purchase(productId: string): Promise<BillingPurchaseResult>;
  restorePurchases(): Promise<BillingPurchaseResult[]>;
  manageSubscription(): Promise<void>;
};

export function createFreeEntitlement(
  source: EntitlementSource = 'local',
): EntitlementState {
  return {
    plan: 'FREE',
    source,
    status: 'NONE',
    updatedAt: new Date().toISOString(),
  };
}
