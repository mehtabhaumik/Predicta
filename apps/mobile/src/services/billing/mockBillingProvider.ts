import { getOneTimeProducts, getPricingPlans } from '@pridicta/config/pricing';
import type {
  BillingProduct,
  BillingProvider,
  BillingPurchaseResult,
  EntitlementState,
  OneTimeEntitlement,
} from '../../types/subscription';
import { createDayPassEntitlement } from '../subscription/entitlementService';

let lastPurchase: BillingPurchaseResult | null = null;

function createPremiumEntitlement(productId: string): EntitlementState {
  return {
    activeProductId: productId,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan: 'PREMIUM',
    source: 'mock',
    status: 'ACTIVE',
    updatedAt: new Date().toISOString(),
  };
}

function createOneTimeEntitlement(productId: string): OneTimeEntitlement {
  const product = getOneTimeProducts().find(
    item => item.productId === productId,
  );

  if (!product) {
    throw new Error(`Unknown one-time product: ${productId}`);
  }

  if (product.id === 'DAY_PASS') {
    return createDayPassEntitlement(product.productId);
  }

  return {
    productId: product.productId,
    productType: product.id,
    purchasedAt: new Date().toISOString(),
    remainingUses: getMockOneTimeUses(product.id),
    source: 'mock',
  };
}

function getMockOneTimeUses(productType: OneTimeEntitlement['productType']): number | undefined {
  switch (productType) {
    case 'AI_QUESTIONS_10':
      return 10;
    case 'AI_QUESTIONS_25':
      return 25;
    case 'AI_QUESTIONS_100':
      return 100;
    case 'FIVE_QUESTIONS':
      return 5;
    case 'REPORT_BUNDLE':
      return 5;
    case 'REPORT_SINGLE':
    case 'PREMIUM_PDF':
    case 'JAIMINI_REPORT':
    case 'DETAILED_KUNDLI_REPORT':
    case 'MARRIAGE_COMPATIBILITY_REPORT':
      return 1;
    default:
      return undefined;
  }
}

export const mockBillingProvider: BillingProvider = {
  async getProducts(): Promise<BillingProduct[]> {
    return [
      ...getPricingPlans().map(plan => ({
        currencyCode: 'INR',
        kind: 'SUBSCRIPTION' as const,
        period: plan.id,
        price: plan.displayPrice,
        productId: plan.productId,
        rawPrice: plan.priceInr,
        title: plan.label,
      })),
      ...getOneTimeProducts().map(product => ({
        currencyCode: 'INR',
        kind: 'ONE_TIME' as const,
        oneTimeType: product.id,
        price: product.displayPrice,
        productId: product.productId,
        rawPrice: product.priceInr,
        title: product.label,
      })),
    ];
  },
  async manageSubscription(): Promise<void> {
    return undefined;
  },
  async purchase(productId: string): Promise<BillingPurchaseResult> {
    const isSubscription = getPricingPlans().some(
      plan => plan.productId === productId,
    );
    const isOneTime = getOneTimeProducts().some(
      product => product.productId === productId,
    );

    if (!isSubscription && !isOneTime) {
      return {
        errorMessage: 'This product is not available yet.',
        productId,
        status: 'FAILED',
      };
    }

    lastPurchase = isSubscription
      ? {
          entitlement: createPremiumEntitlement(productId),
          productId,
          status: 'SUCCESS',
          transactionId: `mock-${Date.now()}`,
        }
      : {
          oneTimeEntitlement: createOneTimeEntitlement(productId),
          productId,
          status: 'SUCCESS',
          transactionId: `mock-${Date.now()}`,
        };

    return lastPurchase;
  },
  async restorePurchases(): Promise<BillingPurchaseResult[]> {
    return lastPurchase ? [{ ...lastPurchase, status: 'RESTORED' }] : [];
  },
};
