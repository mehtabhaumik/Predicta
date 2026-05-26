import type {
  BillingPeriod,
  BillingProductKind,
  OneTimeProductType,
} from '@pridicta/types';

export type PaymentGatewayState =
  | 'gateway_ready'
  | 'gateway_disabled'
  | 'payment_pending'
  | 'payment_cancelled'
  | 'payment_failed'
  | 'manual_support_requested'
  | 'entitlement_active';

export type PaymentGatewayProvider = 'razorpay';

export type PaymentWorkflowIntent = {
  amountInr: number;
  createdAt: string;
  currencyCode: 'INR';
  entitlementId?: string;
  failureCode?: string;
  failureMessage?: string;
  gateway: PaymentGatewayProvider;
  id: string;
  idempotencyKey: string;
  kind: BillingProductKind;
  period?: BillingPeriod;
  productId: string;
  productType?: OneTimeProductType;
  state: PaymentGatewayState;
  supportRequestedAt?: string;
  updatedAt: string;
  userId?: string;
};

export type PaymentWorkflowTransition =
  | {
      state:
        | 'gateway_disabled'
        | 'payment_pending'
        | 'payment_cancelled'
        | 'manual_support_requested';
      supportRequestedAt?: string;
    }
  | {
      failureCode?: string;
      failureMessage?: string;
      state: 'payment_failed';
    }
  | {
      entitlementId?: string;
      state: 'entitlement_active';
    };

export type RazorpayOrderCreateRequest = {
  amountInr: number;
  currencyCode: 'INR';
  idempotencyKey: string;
  productId: string;
  userId?: string;
};

export type RazorpayOrderCreateResult = {
  amountInr: number;
  currencyCode: 'INR';
  gateway: PaymentGatewayProvider;
  idempotencyKey: string;
  razorpayKeyId?: string;
  razorpayOrderId: string;
};

export type RazorpaySignatureVerificationRequest = {
  idempotencyKey: string;
  productId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type RazorpaySignatureVerificationResult = {
  gateway: PaymentGatewayProvider;
  productId: string;
  razorpayOrderId: string;
  safePaymentReference: string;
  verified: boolean;
};

export type PaymentStatusRequest = {
  idempotencyKey: string;
  productId: string;
};

export type PaymentStatusResult = {
  idempotencyKey: string;
  productId: string;
  state: PaymentGatewayState;
};

export type EntitlementActivationRequest = {
  idempotencyKey: string;
  productId: string;
  safePaymentReference: string;
  userId: string;
};

export function createPaymentWorkflowIntent({
  amountInr,
  kind,
  period,
  productId,
  productType,
  state,
  userId,
}: {
  amountInr: number;
  kind: BillingProductKind;
  period?: BillingPeriod;
  productId: string;
  productType?: OneTimeProductType;
  state?: PaymentGatewayState;
  userId?: string;
}): PaymentWorkflowIntent {
  const createdAt = new Date().toISOString();
  const runtimeCrypto = (
    globalThis as typeof globalThis & {
      crypto?: {
        randomUUID?: () => `${string}-${string}-${string}-${string}-${string}`;
      };
    }
  ).crypto;
  const entropy =
    typeof runtimeCrypto?.randomUUID === 'function'
      ? runtimeCrypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return {
    amountInr,
    createdAt,
    currencyCode: 'INR',
    gateway: 'razorpay',
    id: `pay_${entropy}`,
    idempotencyKey: `predicta_${productId}_${entropy}`,
    kind,
    period,
    productId,
    productType,
    state: state ?? 'gateway_disabled',
    updatedAt: createdAt,
    userId,
  };
}

export function transitionPaymentWorkflowIntent(
  intent: PaymentWorkflowIntent,
  transition: PaymentWorkflowTransition,
): PaymentWorkflowIntent {
  return {
    ...intent,
    entitlementId:
      transition.state === 'entitlement_active'
        ? transition.entitlementId
        : intent.entitlementId,
    failureCode:
      transition.state === 'payment_failed'
        ? transition.failureCode
        : intent.failureCode,
    failureMessage:
      transition.state === 'payment_failed'
        ? transition.failureMessage
        : intent.failureMessage,
    state: transition.state,
    supportRequestedAt:
      transition.state === 'manual_support_requested'
        ? (transition.supportRequestedAt ?? new Date().toISOString())
        : intent.supportRequestedAt,
    updatedAt: new Date().toISOString(),
  };
}

export function isGatewayDisabled(state: PaymentGatewayState): boolean {
  return state === 'gateway_disabled';
}

export function isTerminalPaymentState(state: PaymentGatewayState): boolean {
  return (
    state === 'payment_cancelled' ||
    state === 'payment_failed' ||
    state === 'manual_support_requested' ||
    state === 'entitlement_active'
  );
}

export function assertNoPaymentSecrets(
  value: Record<string, unknown>,
): boolean {
  const serialized = JSON.stringify(value).toLowerCase();
  return ![
    'card',
    'cvv',
    'cvc',
    'otp',
    'pin',
    'razorpaysignature',
    'razorpay_signature',
  ].some(secretKey => serialized.includes(secretKey));
}
