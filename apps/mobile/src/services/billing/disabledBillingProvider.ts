import { getOneTimeProducts, getPricingPlans } from '@pridicta/config/pricing';
import {
  createPaymentWorkflowIntent,
  transitionPaymentWorkflowIntent,
} from '@pridicta/monetization';
import type {
  BillingProduct,
  BillingProvider,
  BillingPurchaseResult,
} from '../../types/subscription';

const gatewayPendingMessage =
  'Secure checkout is being connected. No payment was taken and no premium access was activated.';

export const disabledBillingProvider: BillingProvider = {
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
    const subscription = getPricingPlans().find(
      plan => plan.productId === productId,
    );
    const oneTime = getOneTimeProducts().find(
      product => product.productId === productId,
    );

    if (!subscription && !oneTime) {
      const intent = createPaymentWorkflowIntent({
        amountInr: 0,
        kind: 'ONE_TIME',
        productId,
        state: 'payment_failed',
      });

      return {
        errorMessage: 'This product is not available yet.',
        paymentIntent: intent,
        productId,
        status: 'FAILED',
      };
    }

    const intent = createPaymentWorkflowIntent({
      amountInr: subscription?.priceInr ?? oneTime?.priceInr ?? 0,
      kind: subscription ? 'SUBSCRIPTION' : 'ONE_TIME',
      period: subscription?.id,
      productId,
      productType: oneTime?.id,
      state: 'gateway_disabled',
    });

    return {
      errorMessage: gatewayPendingMessage,
      paymentIntent: transitionPaymentWorkflowIntent(intent, {
        state: 'payment_pending',
      }),
      productId,
      status: 'PENDING',
    };
  },
  async restorePurchases(): Promise<BillingPurchaseResult[]> {
    return [];
  },
};
