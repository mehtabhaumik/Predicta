import {
  assertNoPaymentSecrets,
  createPaymentWorkflowIntent,
  isGatewayDisabled,
  isTerminalPaymentState,
  transitionPaymentWorkflowIntent,
} from '@pridicta/monetization';
import { getDayPassProduct, getRecommendedPricingPlan } from '@pridicta/config/pricing';
import { disabledBillingProvider } from '../src/services/billing/disabledBillingProvider';
import { resolveBillingProvider } from '../src/services/billing/billingService';
import { mockBillingProvider } from '../src/services/billing/mockBillingProvider';

describe('payment workflow contract', () => {
  it('covers disabled, pending, cancelled, failed, and success-interface states without secrets', () => {
    const product = getDayPassProduct();
    const intent = createPaymentWorkflowIntent({
      amountInr: product.priceInr,
      kind: 'ONE_TIME',
      productId: product.productId,
      productType: product.id,
      state: 'gateway_disabled',
    });

    expect(isGatewayDisabled(intent.state)).toBe(true);
    expect(assertNoPaymentSecrets(intent)).toBe(true);

    const pending = transitionPaymentWorkflowIntent(intent, {
      state: 'payment_pending',
    });
    const cancelled = transitionPaymentWorkflowIntent(pending, {
      state: 'payment_cancelled',
    });
    const failed = transitionPaymentWorkflowIntent(pending, {
      failureCode: 'gateway_unavailable',
      failureMessage: 'Secure checkout is being connected.',
      state: 'payment_failed',
    });
    const manualSupport = transitionPaymentWorkflowIntent(pending, {
      state: 'manual_support_requested',
      supportRequestedAt: '2026-05-27T00:00:00.000Z',
    });
    const activated = transitionPaymentWorkflowIntent(pending, {
      entitlementId: 'entitlement_test',
      state: 'entitlement_active',
    });

    expect(pending.state).toBe('payment_pending');
    expect(isTerminalPaymentState(cancelled.state)).toBe(true);
    expect(isTerminalPaymentState(failed.state)).toBe(true);
    expect(failed.failureCode).toBe('gateway_unavailable');
    expect(isTerminalPaymentState(manualSupport.state)).toBe(true);
    expect(manualSupport.supportRequestedAt).toBe('2026-05-27T00:00:00.000Z');
    expect(isTerminalPaymentState(activated.state)).toBe(true);
    expect(activated.entitlementId).toBe('entitlement_test');
  });

  it('keeps production billing on a disabled provider even when mock billing is enabled', async () => {
    const provider = resolveBillingProvider({
      enableMockBilling: true,
      isDev: false,
    });
    const product = getRecommendedPricingPlan();
    const result = await provider.purchase(product.productId);

    expect(provider).not.toBe(mockBillingProvider);
    expect(result.status).toBe('PENDING');
    expect(result.entitlement).toBeUndefined();
    expect(result.oneTimeEntitlement).toBeUndefined();
    expect(result.paymentIntent?.state).toBe('payment_pending');
  });

  it('does not throw for disabled-gateway purchase, restore, or manage paths', async () => {
    const product = getDayPassProduct();

    await expect(disabledBillingProvider.getProducts()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ productId: product.productId }),
      ]),
    );
    await expect(
      disabledBillingProvider.purchase(product.productId),
    ).resolves.toMatchObject({
      errorMessage: expect.stringContaining('Secure checkout'),
      productId: product.productId,
      status: 'PENDING',
    });
    await expect(disabledBillingProvider.restorePurchases()).resolves.toEqual(
      [],
    );
    await expect(disabledBillingProvider.manageSubscription()).resolves.toBeUndefined();
  });
});
