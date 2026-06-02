export type SupportTicketCategory =
  | 'feedback'
  | 'question'
  | 'complaint'
  | 'bug-report'
  | 'feature-request'
  | 'billing'
  | 'account'
  | 'report'
  | 'kundli'
  | 'signature'
  | 'premium-access'
  | 'refund'
  | 'safety-concern'
  | 'general-contact';

export type SupportTicketStatus =
  | 'NEW'
  | 'ACKNOWLEDGED'
  | 'IN_REVIEW'
  | 'WAITING_ON_USER'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'CLOSED';

export type SupportTicketPriority =
  | 'LOW'
  | 'NORMAL'
  | 'HIGH'
  | 'URGENT';

export type SupportTicketAudience = 'customer' | 'admin' | 'system';

export type SupportTicketMessageKind =
  | 'customer_inbound'
  | 'admin_outbound'
  | 'system_auto_reply'
  | 'internal_private_note';

export type SupportTicketMessageVisibility =
  | 'customer_visible'
  | 'internal_only';

export type SupportTicketAuditEventKind =
  | 'ticket_created'
  | 'message_added'
  | 'status_changed'
  | 'priority_changed'
  | 'assignment_changed'
  | 'delivery_recorded';

export type SupportEmailDeliveryProvider = 'resend';

export type SupportEmailDeliveryStatus =
  | 'accepted'
  | 'sent'
  | 'delivered'
  | 'delivery_delayed'
  | 'bounced'
  | 'failed'
  | 'complained'
  | 'suppressed';

export type SupportTicketActor = {
  displayName?: string;
  email?: string;
  role: SupportTicketAudience;
  userId?: string;
};

export type SupportTicketRelatedContext = {
  kundliId?: string;
  purchaseId?: string;
  reportId?: string;
  reportType?: string;
};

export type SupportTicketRecord = {
  assignedTo?: string;
  category: SupportTicketCategory;
  createdAt: string;
  customerEmail?: string;
  customerName?: string;
  id: string;
  language?: string;
  latestAdminReplyAt?: string;
  latestCustomerReplyAt?: string;
  latestMessagePreview?: string;
  priority: SupportTicketPriority;
  related?: SupportTicketRelatedContext;
  route?: string;
  sourceSurface?: string;
  status: SupportTicketStatus;
  subject: string;
  ticketNumber: string;
  updatedAt: string;
  userId?: string;
};

type SupportTicketMessageBase = {
  body: string;
  createdAt: string;
  id: string;
  sender: SupportTicketActor;
  ticketId: string;
  ticketNumber: string;
};

export type SupportTicketCustomerInboundMessage = SupportTicketMessageBase & {
  kind: 'customer_inbound';
  visibility: 'customer_visible';
};

export type SupportTicketAdminOutboundMessage = SupportTicketMessageBase & {
  deliveryEligible: true;
  kind: 'admin_outbound';
  templateId?: string;
  visibility: 'customer_visible';
};

export type SupportTicketSystemAutoReplyMessage = SupportTicketMessageBase & {
  deliveryEligible: true;
  kind: 'system_auto_reply';
  templateId: string;
  visibility: 'customer_visible';
};

export type SupportTicketInternalPrivateNoteMessage = SupportTicketMessageBase & {
  deliveryEligible: false;
  kind: 'internal_private_note';
  visibility: 'internal_only';
};

export type SupportTicketMessage =
  | SupportTicketCustomerInboundMessage
  | SupportTicketAdminOutboundMessage
  | SupportTicketSystemAutoReplyMessage
  | SupportTicketInternalPrivateNoteMessage;

export type CustomerVisibleSupportTicketMessage = Extract<
  SupportTicketMessage,
  { visibility: 'customer_visible' }
>;

export type SupportEmailDeliveryEvent = {
  attemptedAt: string;
  error?: string;
  id: string;
  messageId?: string;
  provider: SupportEmailDeliveryProvider;
  providerMessageId?: string;
  recipient: string;
  status: SupportEmailDeliveryStatus;
  statusCode: number;
  templateId: string;
  ticketId: string;
  ticketNumber: string;
};

export type SupportTicketAuditEvent = {
  actor: SupportTicketActor;
  at: string;
  from?: string;
  id: string;
  kind: SupportTicketAuditEventKind;
  messageId?: string;
  ticketId: string;
  ticketNumber: string;
  to?: string;
};

export type SupportTicketThread = {
  auditEvents: SupportTicketAuditEvent[];
  deliveryEvents: SupportEmailDeliveryEvent[];
  messages: SupportTicketMessage[];
  ticket: SupportTicketRecord;
};
