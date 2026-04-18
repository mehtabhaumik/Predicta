import {
  getDayPassProduct,
  getRecommendedPricingPlan,
} from '../src/config/pricing';
import { mockBillingProvider } from '../src/services/billing/mockBillingProvider';

describe('mockBillingProvider', () => {
  it('returns products and grants subscription entitlement on success', async () => {
    const products = await mockBillingProvider.getProducts();
    const subscription = getRecommendedPricingPlan();

    expect(
      products.some(product => product.productId === subscription.productId),
    ).toBe(true);

    const result = await mockBillingProvider.purchase(subscription.productId);

    expect(result.status).toBe('SUCCESS');
    expect(result.entitlement).toMatchObject({
      plan: 'PREMIUM',
      source: 'mock',
      status: 'ACTIVE',
    });
  });

  it('grants one-time day pass entitlement on success', async () => {
    const result = await mockBillingProvider.purchase(
      getDayPassProduct().productId,
    );

    expect(result.status).toBe('SUCCESS');
    expect(result.oneTimeEntitlement).toMatchObject({
      productType: 'DAY_PASS',
      remainingUses: 10,
      source: 'mock',
    });
  });

  it('fails safely for unknown products and restores last purchase', async () => {
    const failed = await mockBillingProvider.purchase('unknown_product');
    expect(failed.status).toBe('FAILED');

    const restored = await mockBillingProvider.restorePurchases();
    expect(restored[0]?.status).toBe('RESTORED');
  });
});
