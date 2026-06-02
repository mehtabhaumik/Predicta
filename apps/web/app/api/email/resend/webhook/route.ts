import { NextResponse } from 'next/server';

import {
  getResendWebhookSecret,
  processVerifiedResendWebhook,
  ResendWebhookProcessingError,
  ResendWebhookVerificationError,
  verifyResendWebhookSignature,
} from '../../../../../lib/email/resend-webhook';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const headers = {
    signature: request.headers.get('svix-signature'),
    timestamp: request.headers.get('svix-timestamp'),
    webhookId: request.headers.get('svix-id'),
  };
  const secret = getResendWebhookSecret();

  if (!secret) {
    return NextResponse.json(
      {
        error: 'Resend webhook secret is not configured.',
        ok: false,
      },
      { status: 503 },
    );
  }

  try {
    verifyResendWebhookSignature({
      headers,
      rawBody,
      secret,
    });

    const result = await processVerifiedResendWebhook({
      headers,
      rawBody,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    if (error instanceof ResendWebhookVerificationError) {
      return NextResponse.json(
        {
          error: getErrorMessage(error),
          ok: false,
        },
        { status: 401 },
      );
    }

    if (error instanceof ResendWebhookProcessingError) {
      return NextResponse.json(
        {
          error: getErrorMessage(error),
          ok: false,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Resend webhook could not be processed.',
        ok: false,
      },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Resend webhook error.';
}
