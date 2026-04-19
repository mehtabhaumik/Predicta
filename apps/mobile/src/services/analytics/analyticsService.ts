import { analyticsDocument, serverTimestamp } from '../firebase/dbService';

export type AnalyticsEventName =
  | 'chat_question'
  | 'chart_entry'
  | 'compatibility_report_unlocked'
  | 'cloud_save_tapped'
  | 'day_pass_started'
  | 'guest_pass_redeemed'
  | 'google_login_completed'
  | 'google_login_started'
  | 'kundli_generated'
  | 'kundli_generation_failed'
  | 'limit_reached'
  | 'life_timeline_previewed'
  | 'life_timeline_report_unlocked'
  | 'one_time_product_selected'
  | 'paywall_dismissed'
  | 'paywall_viewed'
  | 'pdf_downloaded'
  | 'pdf_generated'
  | 'pdf_upgrade_prompt_dismissed'
  | 'pdf_upgrade_prompt_viewed'
  | 'premium_feature_tapped'
  | 'premium_pdf_unlocked'
  | 'product_selected'
  | 'pricing_plan_selected'
  | 'purchase_canceled'
  | 'purchase_completed'
  | 'purchase_failed'
  | 'purchase_started'
  | 'question_pack_used'
  | 'restore_completed'
  | 'restore_failed'
  | 'restore_started'
  | 'report_generated'
  | 'save_to_cloud_tapped'
  | 'upgrade_cta_tapped';

type AnalyticsMetadata = Record<string, string | number | boolean | null>;

export async function trackAnalyticsEvent({
  eventName,
  metadata = {},
  userId,
}: {
  eventName: AnalyticsEventName;
  metadata?: AnalyticsMetadata;
  userId?: string;
}): Promise<void> {
  try {
    await analyticsDocument().set({
      createdAt: serverTimestamp(),
      eventName,
      metadata: sanitizeAnalyticsMetadata(metadata),
      userId: userId ?? null,
    });
  } catch {
    // Analytics must never block core astrology, chat, PDF, or cloud actions.
  }
}

export function sanitizeAnalyticsMetadata(
  metadata: AnalyticsMetadata,
): AnalyticsMetadata {
  return Object.fromEntries(
    Object.entries(metadata).filter(
      ([key]) =>
        ![
          'birth',
          'kundli',
          'chat',
          'remedy',
          'prediction',
          'journal',
        ].some(blocked => key.toLowerCase().includes(blocked)),
    ),
  );
}
