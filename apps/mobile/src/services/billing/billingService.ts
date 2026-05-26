import { env } from '../../config/env';
import type {
  BillingProduct,
  BillingProvider,
  BillingPurchaseResult,
} from '../../types/subscription';
import { disabledBillingProvider } from './disabledBillingProvider';
import { mockBillingProvider } from './mockBillingProvider';

export function resolveBillingProvider({
  enableMockBilling,
  isDev,
}: {
  enableMockBilling: boolean;
  isDev: boolean;
}): BillingProvider {
  if (isDev) {
    return mockBillingProvider;
  }

  if (enableMockBilling) {
    return disabledBillingProvider;
  }

  return disabledBillingProvider;
}

function getBillingProvider(): BillingProvider {
  return resolveBillingProvider({
    enableMockBilling: env.enableMockBilling,
    isDev: __DEV__,
  });
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
