import { getOneTimeProducts, getPricingPlans } from '../../config/pricing';
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
    remainingUses:
      product.id === 'FIVE_QUESTIONS'
        ? 5
        : product.id === 'PREMIUM_PDF' ||
          product.id === 'DETAILED_KUNDLI_REPORT' ||
          product.id === 'MARRIAGE_COMPATIBILITY_REPORT'
        ? 1
        : undefined,
    source: 'mock',
  };
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
