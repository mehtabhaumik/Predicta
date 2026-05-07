import { env } from '../../config/env';
import type {
  BillingProduct,
  BillingProvider,
  BillingPurchaseResult,
} from '../../types/subscription';
import { mockBillingProvider } from './mockBillingProvider';

function getBillingProvider(): BillingProvider {
  if (env.enableMockBilling || __DEV__) {
    return mockBillingProvider;
  }

  throw new Error(
    'Purchases are not available right now. Please try again later.',
  );
}

export async function getBillingProducts(): Promise<BillingProduct[]> {
  return getBillingProvider().getProducts();
}

export async function purchaseProduct(
  productId: string,
): Promise<BillingPurchaseResult> {
  return getBillingProvider().purchase(productId);
}

export async function restorePurchases(): Promise<BillingPurchaseResult[]> {
  return getBillingProvider().restorePurchases();
}

export async function manageSubscription(): Promise<void> {
  return getBillingProvider().manageSubscription();
}
