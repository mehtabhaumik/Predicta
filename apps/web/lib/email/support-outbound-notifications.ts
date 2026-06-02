import {
  createEmailDeliveryEvent,
  resolveResendOutboundConfig,
  sendResendEmail,
  type EmailDeliveryEvent,
  type ResendFetch,
  type ResendOutboundConfig,
} from './resend-outbound';
import {
  createAdminNotificationEmail,
  createCustomerAutoReplyEmail,
  SUPPORT_ADMIN_NOTIFICATION_TEMPLATE_ID,
  SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
  type PersistedSupportTicketForEmail,
} from './support-email-templates';

export type SupportOutboundNotificationResult = {
  configReady: boolean;
  deliveryEvents: EmailDeliveryEvent[];
  sentAdminNotification: boolean;
  sentCustomerAutoReply: boolean;
  ticketNumber: string;
};

export type SupportOutboundNotificationOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: ResendFetch;
  liveRequired?: boolean;
  recordDeliveryEvent?: (event: EmailDeliveryEvent) => void | Promise<void>;
};

export async function sendSupportOutboundNotifications(
  ticket: PersistedSupportTicketForEmail,
  options: SupportOutboundNotificationOptions = {},
): Promise<SupportOutboundNotificationResult> {
  const config = resolveResendOutboundConfig(options.env, {
    liveRequired: options.liveRequired,
  });
  const deliveryEvents: EmailDeliveryEvent[] = [];

  if (!config) {
    return {
      configReady: false,
      deliveryEvents,
      sentAdminNotification: false,
      sentCustomerAutoReply: false,
      ticketNumber: ticket.ticketNumber,
    };
  }

  const customerEmail = createCustomerAutoReplyEmail(config, ticket);
  const adminEmail = createAdminNotificationEmail(config, ticket);

  if (customerEmail) {
    const result = await sendEmailSafely({
      config,
      email: customerEmail,
      fetchImpl: options.fetchImpl,
      recordDeliveryEvent: options.recordDeliveryEvent,
      templateId: SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID,
      ticketNumber: ticket.ticketNumber,
    });
    deliveryEvents.push(result.event);
  }

  const adminResult = await sendEmailSafely({
    config,
    email: adminEmail,
    fetchImpl: options.fetchImpl,
    recordDeliveryEvent: options.recordDeliveryEvent,
    templateId: SUPPORT_ADMIN_NOTIFICATION_TEMPLATE_ID,
    ticketNumber: ticket.ticketNumber,
  });
  deliveryEvents.push(adminResult.event);

  return {
    configReady: true,
    deliveryEvents,
    sentAdminNotification: adminResult.event.status === 'accepted',
    sentCustomerAutoReply:
      customerEmail !== undefined &&
      deliveryEvents.some(
        event =>
          event.templateId === SUPPORT_CUSTOMER_AUTO_REPLY_TEMPLATE_ID &&
          event.status === 'accepted',
      ),
    ticketNumber: ticket.ticketNumber,
  };
}

async function sendEmailSafely(input: {
  config: ResendOutboundConfig;
  email: ReturnType<typeof createAdminNotificationEmail>;
  fetchImpl?: ResendFetch;
  recordDeliveryEvent?: (event: EmailDeliveryEvent) => void | Promise<void>;
  templateId: string;
  ticketNumber: string;
}): Promise<{ event: EmailDeliveryEvent }> {
  const recipient = input.email.to[0] ?? 'unknown-recipient';

  try {
    const result = await sendResendEmail(
      input.config,
      input.email,
      input.fetchImpl,
    );
    const event = createEmailDeliveryEvent({
      recipient,
      result,
      templateId: input.templateId,
      ticketNumber: input.ticketNumber,
    });
    await input.recordDeliveryEvent?.(event);

    return { event };
  } catch (error) {
    const event = createEmailDeliveryEvent({
      recipient,
      result: {
        accepted: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown Resend delivery failure.',
        statusCode: 0,
      },
      templateId: input.templateId,
      ticketNumber: input.ticketNumber,
    });
    await input.recordDeliveryEvent?.(event);

    return { event };
  }
}
