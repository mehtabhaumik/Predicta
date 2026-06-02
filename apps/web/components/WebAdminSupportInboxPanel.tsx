'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
  SupportTicketCategory,
  SupportTicketMessage,
  SupportTicketPriority,
  SupportTicketStatus,
  SupportTicketThread,
} from '@pridicta/types';
import {
  buildTemplateVariablesForThread,
  renderSupportEmailTemplateBodyText,
  searchSupportEmailTemplates,
  suggestSupportReplyTemplate,
} from '../lib/email/support-email-template-renderer';

type InboxResponse = {
  counts: {
    open: number;
    urgent: number;
    waiting: number;
  };
  threads: SupportTicketThread[];
};

const statusLabels: Record<SupportTicketStatus, string> = {
  ACKNOWLEDGED: 'Acknowledged',
  CLOSED: 'Closed',
  ESCALATED: 'Escalated',
  IN_REVIEW: 'In review',
  NEW: 'New',
  RESOLVED: 'Resolved',
  WAITING_ON_USER: 'Waiting on user',
};

const priorityLabels: Record<SupportTicketPriority, string> = {
  HIGH: 'High',
  LOW: 'Low',
  NORMAL: 'Normal',
  URGENT: 'Urgent',
};

const categoryLabels: Record<SupportTicketCategory, string> = {
  account: 'Account',
  billing: 'Billing',
  'bug-report': 'Bug',
  complaint: 'Complaint',
  feedback: 'Feedback',
  'feature-request': 'Feature',
  'general-contact': 'General',
  kundli: 'Kundli',
  'premium-access': 'Premium',
  question: 'Question',
  refund: 'Refund',
  report: 'Report',
  'safety-concern': 'Safety',
  signature: 'Signature',
};

const statuses = Object.keys(statusLabels) as SupportTicketStatus[];
const priorities = Object.keys(priorityLabels) as SupportTicketPriority[];

export function WebAdminSupportInboxPanel(): React.JSX.Element {
  const [token, setToken] = useState('');
  const [threads, setThreads] = useState<SupportTicketThread[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string>();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SupportTicketStatus>('ALL');
  const [priorityFilter, setPriorityFilter] =
    useState<'ALL' | SupportTicketPriority>('ALL');
  const [categoryFilter, setCategoryFilter] =
    useState<'ALL' | SupportTicketCategory>('ALL');
  const [counts, setCounts] = useState<InboxResponse['counts']>({
    open: 0,
    urgent: 0,
    waiting: 0,
  });
  const [message, setMessage] = useState(
    'Enter the owner key to open the Predicta support inbox.',
  );
  const [busy, setBusy] = useState(false);

  const categories = useMemo(
    () =>
      Array.from(new Set(threads.map(thread => thread.ticket.category))).sort(),
    [threads],
  );
  const filteredThreads = useMemo(
    () =>
      threads.filter(thread => {
        const haystack = [
          thread.ticket.ticketNumber,
          thread.ticket.subject,
          thread.ticket.customerName,
          thread.ticket.customerEmail,
          thread.ticket.latestMessagePreview,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const queryMatch = !query.trim() || haystack.includes(query.trim().toLowerCase());
        const statusMatch =
          statusFilter === 'ALL' || thread.ticket.status === statusFilter;
        const priorityMatch =
          priorityFilter === 'ALL' || thread.ticket.priority === priorityFilter;
        const categoryMatch =
          categoryFilter === 'ALL' || thread.ticket.category === categoryFilter;

        return queryMatch && statusMatch && priorityMatch && categoryMatch;
      }),
    [categoryFilter, priorityFilter, query, statusFilter, threads],
  );
  const selectedThread =
    threads.find(thread => thread.ticket.id === selectedTicketId) ??
    filteredThreads[0] ??
    threads[0];

  async function loadInbox() {
    try {
      setBusy(true);
      const response = await fetch('/api/email/admin/tickets', {
        headers: { 'x-pridicta-admin-token': token },
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Support inbox could not be opened.');
        return;
      }

      setThreads(payload.threads ?? []);
      setCounts(payload.counts ?? { open: 0, urgent: 0, waiting: 0 });
      setSelectedTicketId(payload.threads?.[0]?.ticket.id);
      setMessage(`${payload.threads?.length ?? 0} support threads loaded.`);
    } catch {
      setMessage('Support inbox could not be opened right now.');
    } finally {
      setBusy(false);
    }
  }

  async function updateTicket(
    ticketId: string,
    patch: {
      assignedTo?: string;
      priority?: SupportTicketPriority;
      status?: SupportTicketStatus;
    },
  ) {
    try {
      setBusy(true);
      const response = await fetch(
        `/api/email/admin/tickets/${encodeURIComponent(ticketId)}`,
        {
          body: JSON.stringify(patch),
          headers: {
            'Content-Type': 'application/json',
            'x-pridicta-admin-token': token,
          },
          method: 'PATCH',
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Support ticket could not be updated.');
        return;
      }

      setThreads(current =>
        current.map(thread => (thread.ticket.id === payload.ticket.id ? payload : thread)),
      );
      setSelectedTicketId(payload.ticket.id);
      setMessage(`${payload.ticket.ticketNumber} updated.`);
    } catch {
      setMessage('Support ticket could not be updated right now.');
    } finally {
      setBusy(false);
    }
  }

  async function sendReply(
    ticketId: string,
    payload: {
      action: 'escalate' | 'resolve' | 'waiting';
      body: string;
      idempotencyKey: string;
      templateId: string;
      variables: Record<string, string>;
    },
  ) {
    try {
      setBusy(true);
      const response = await fetch(
        `/api/email/admin/tickets/${encodeURIComponent(ticketId)}/reply`,
        {
          body: JSON.stringify(payload),
          headers: {
            'Content-Type': 'application/json',
            'x-pridicta-admin-token': token,
          },
          method: 'POST',
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setMessage(result.detail ?? 'Reply could not be sent.');
        return;
      }

      setThreads(current =>
        current.map(thread =>
          thread.ticket.id === result.thread.ticket.id ? result.thread : thread,
        ),
      );
      setSelectedTicketId(result.thread.ticket.id);
      setMessage(
        result.emailConfigured
          ? `${result.thread.ticket.ticketNumber} reply sent and ticket updated.`
          : `${result.thread.ticket.ticketNumber} reply saved; email provider is not configured.`,
      );
    } catch {
      setMessage('Reply could not be sent right now.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-support-inbox-panel" aria-label="Predicta support inbox">
      <div className="admin-support-hero glass-panel">
        <div>
          <span className="section-title">PREDICTA CARE DESK</span>
          <h2>Support inbox</h2>
          <p>
            Review customer replies, ticket status, private notes, and delivery
            health from one calm owner workspace.
          </p>
        </div>
        <div className="admin-support-access-card">
          <label className="field-label" htmlFor="support-inbox-owner-key">
            Owner key
          </label>
          <div className="admin-support-token-row">
            <input
              id="support-inbox-owner-key"
              onChange={event => setToken(event.target.value)}
              placeholder="Enter owner key"
              type="password"
              value={token}
            />
            <button className="button" disabled={busy || !token} onClick={loadInbox} type="button">
              Open Inbox
            </button>
          </div>
          <p className="form-status idle">{message}</p>
        </div>
      </div>

      <div className="admin-support-metrics" aria-label="Inbox health">
        <MetricCard label="Open" value={counts.open} />
        <MetricCard label="Urgent" value={counts.urgent} />
        <MetricCard label="Waiting" value={counts.waiting} />
      </div>

      <div className="admin-support-toolbar glass-panel">
        <label className="field-stack">
          <span className="field-label">Search tickets</span>
          <input
            onChange={event => setQuery(event.target.value)}
            placeholder="Search by name, email, ticket, subject"
            type="search"
            value={query}
          />
        </label>
        <label className="field-stack">
          <span className="field-label">Status</span>
          <select
            onChange={event =>
              setStatusFilter(event.target.value as 'ALL' | SupportTicketStatus)
            }
            value={statusFilter}
          >
            <option value="ALL">All statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="field-stack">
          <span className="field-label">Priority</span>
          <select
            onChange={event =>
              setPriorityFilter(event.target.value as 'ALL' | SupportTicketPriority)
            }
            value={priorityFilter}
          >
            <option value="ALL">All priorities</option>
            {priorities.map(priority => (
              <option key={priority} value={priority}>
                {priorityLabels[priority]}
              </option>
            ))}
          </select>
        </label>
        <label className="field-stack">
          <span className="field-label">Category</span>
          <select
            onChange={event =>
              setCategoryFilter(event.target.value as 'ALL' | SupportTicketCategory)
            }
            value={categoryFilter}
          >
            <option value="ALL">All categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {categoryLabels[category]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-support-layout">
        <aside className="admin-support-ticket-list" aria-label="Ticket list">
          {filteredThreads.length ? (
            filteredThreads.map(thread => (
              <button
                className={`admin-support-ticket-card ${
                  selectedThread?.ticket.id === thread.ticket.id ? 'is-selected' : ''
                }`}
                key={thread.ticket.id}
                onClick={() => setSelectedTicketId(thread.ticket.id)}
                type="button"
              >
                <span>{thread.ticket.ticketNumber}</span>
                <strong>{thread.ticket.subject}</strong>
                <small>
                  {thread.ticket.customerName ?? 'Unknown customer'} ·{' '}
                  {categoryLabels[thread.ticket.category]}
                </small>
                <span className="admin-support-pill-row">
                  <b>{statusLabels[thread.ticket.status]}</b>
                  <b>{priorityLabels[thread.ticket.priority]}</b>
                </span>
              </button>
            ))
          ) : (
            <div className="admin-support-empty-state">
              <strong>No matching tickets.</strong>
              <p>Clear filters or load the inbox after entering the owner key.</p>
            </div>
          )}
        </aside>

        {selectedThread ? (
          <ThreadDetail
            busy={busy}
            onReply={payload => sendReply(selectedThread.ticket.id, payload)}
            onUpdate={patch => updateTicket(selectedThread.ticket.id, patch)}
            thread={selectedThread}
          />
        ) : (
          <div className="admin-support-thread-panel glass-panel">
            <div className="admin-support-empty-state">
              <strong>No ticket selected.</strong>
              <p>Open the inbox and choose a ticket to review its thread.</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ThreadDetail({
  busy,
  onReply,
  onUpdate,
  thread,
}: {
  busy: boolean;
  onReply: (payload: {
    action: 'escalate' | 'resolve' | 'waiting';
    body: string;
    idempotencyKey: string;
    templateId: string;
    variables: Record<string, string>;
  }) => void;
  onUpdate: (patch: {
    assignedTo?: string;
    priority?: SupportTicketPriority;
    status?: SupportTicketStatus;
  }) => void;
  thread: SupportTicketThread;
}): React.JSX.Element {
  const suggestedTemplate = useMemo(() => suggestSupportReplyTemplate(thread), [thread]);
  const [templateQuery, setTemplateQuery] = useState('');
  const [templateId, setTemplateId] = useState(suggestedTemplate.id);
  const [requestedDetails, setRequestedDetails] = useState(
    'the missing detail requested by Predicta support',
  );
  const [resolutionSummary, setResolutionSummary] = useState(
    'we reviewed your request and will guide you with the safest next step',
  );
  const variables = useMemo(
    () =>
      buildTemplateVariablesForThread(thread, {
        requestedDetails,
        resolutionSummary,
      }),
    [requestedDetails, resolutionSummary, thread],
  );
  const templates = useMemo(
    () =>
      searchSupportEmailTemplates({
        audience: 'admin',
        category: thread.ticket.category,
        query: templateQuery,
      }).templates.filter(template => template.id.startsWith('support.admin.reply.')),
    [templateQuery, thread.ticket.category],
  );
  const [replyBody, setReplyBody] = useState('');

  useEffect(() => {
    const nextTemplateId = suggestedTemplate.id;
    const nextVariables = buildTemplateVariablesForThread(thread, {
      requestedDetails,
      resolutionSummary,
    });

    setTemplateId(nextTemplateId);
    setReplyBody(
      renderSupportEmailTemplateBodyText({
        templateId: nextTemplateId,
        variables: nextVariables,
      }),
    );
  }, [suggestedTemplate.id, thread]);

  function applyTemplate(nextTemplateId: string) {
    setTemplateId(nextTemplateId);
    setReplyBody(
      renderSupportEmailTemplateBodyText({
        templateId: nextTemplateId,
        variables,
      }),
    );
  }

  function send(action: 'escalate' | 'resolve' | 'waiting') {
    onReply({
      action,
      body: replyBody,
      idempotencyKey: createSupportReplyIdempotencyKey({
        action,
        body: replyBody,
        templateId,
        threadMessageCount: thread.messages.length,
        ticketId: thread.ticket.id,
      }),
      templateId,
      variables,
    });
  }

  return (
    <article className="admin-support-thread-panel glass-panel">
      <div className="admin-support-thread-head">
        <div>
          <span className="section-title">{thread.ticket.ticketNumber}</span>
          <h2>{thread.ticket.subject}</h2>
          <p>{thread.ticket.latestMessagePreview}</p>
        </div>
        <div className="admin-support-thread-actions">
          <label>
            <span>Status</span>
            <select
              disabled={busy}
              onChange={event =>
                onUpdate({ status: event.target.value as SupportTicketStatus })
              }
              value={thread.ticket.status}
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select
              disabled={busy}
              onChange={event =>
                onUpdate({ priority: event.target.value as SupportTicketPriority })
              }
              value={thread.ticket.priority}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priorityLabels[priority]}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Assigned to</span>
            <input
              defaultValue={thread.ticket.assignedTo ?? ''}
              disabled={busy}
              onBlur={event => onUpdate({ assignedTo: event.target.value })}
              placeholder="Owner or support lead"
            />
          </label>
        </div>
      </div>

      <div className="admin-support-content-grid">
        <div className="admin-support-message-timeline">
          {thread.messages.map(message => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </div>
        <aside className="admin-support-context-panel">
          <ContextBlock title="Customer">
            <p>{thread.ticket.customerName ?? 'Name not shared'}</p>
            <p>{thread.ticket.customerEmail ?? 'Email not shared'}</p>
            <p>{thread.ticket.userId ?? 'No linked user id'}</p>
          </ContextBlock>
          <ContextBlock title="Request context">
            <p>{categoryLabels[thread.ticket.category]}</p>
            <p>{thread.ticket.route ?? 'No route captured'}</p>
            <p>{thread.ticket.sourceSurface ?? 'No source surface captured'}</p>
            <p>{thread.ticket.language ?? 'Language not shared'}</p>
          </ContextBlock>
          <ContextBlock title="Delivery">
            {thread.deliveryEvents.length ? (
              thread.deliveryEvents.map(event => (
                <p key={event.id}>
                  {event.status.replace(/_/g, ' ')} · {event.recipient}
                </p>
              ))
            ) : (
              <p>No delivery events recorded yet.</p>
            )}
          </ContextBlock>
        </aside>
      </div>

      <section className="admin-support-composer" aria-label="Admin reply composer">
        <div className="admin-support-composer-head">
          <div>
            <span className="section-title">REPLY COMPOSER</span>
            <h3>Use a template, edit it, then send.</h3>
            <p>
              Suggested template: {suggestedTemplate.heading}. Private notes are
              blocked from this customer reply composer.
            </p>
          </div>
          <label className="field-stack">
            <span className="field-label">Search templates</span>
            <input
              onChange={event => setTemplateQuery(event.target.value)}
              placeholder="Search by situation"
              value={templateQuery}
            />
          </label>
        </div>

        <div className="admin-support-template-grid">
          {templates.map(template => (
            <button
              className={`admin-support-template-card ${
                template.id === templateId ? 'is-selected' : ''
              }`}
              key={template.id}
              onClick={() => applyTemplate(template.id)}
              type="button"
            >
              <span>{template.group}</span>
              <strong>{template.heading}</strong>
              <small>{template.previewText}</small>
            </button>
          ))}
        </div>

        <div className="admin-support-composer-fields">
          <label className="field-stack">
            <span className="field-label">Requested details</span>
            <input
              onChange={event => setRequestedDetails(event.target.value)}
              value={requestedDetails}
            />
          </label>
          <label className="field-stack">
            <span className="field-label">Resolution summary</span>
            <input
              onChange={event => setResolutionSummary(event.target.value)}
              value={resolutionSummary}
            />
          </label>
        </div>

        <label className="field-stack">
          <span className="field-label">Editable customer reply</span>
          <textarea
            onChange={event => setReplyBody(event.target.value)}
            rows={12}
            value={replyBody}
          />
        </label>

        <div className="admin-support-send-actions">
          <button
            className="button"
            disabled={busy || !replyBody.trim()}
            onClick={() => send('waiting')}
            type="button"
          >
            Send and mark waiting
          </button>
          <button
            className="button secondary"
            disabled={busy || !replyBody.trim()}
            onClick={() => send('resolve')}
            type="button"
          >
            Send and resolve
          </button>
          <button
            className="button secondary"
            disabled={busy || !replyBody.trim()}
            onClick={() => send('escalate')}
            type="button"
          >
            Send and escalate
          </button>
        </div>
      </section>
    </article>
  );
}

function MessageBubble({
  message,
}: {
  message: SupportTicketMessage;
}): React.JSX.Element {
  const isPrivate = message.kind === 'internal_private_note';

  return (
    <article
      className={`admin-support-message admin-support-message--${message.kind}`}
    >
      <div>
        <span>{message.sender.displayName ?? message.sender.role}</span>
        <strong>{messageKindLabel(message.kind)}</strong>
        {isPrivate ? <b>Private note · never emailed</b> : null}
      </div>
      <p>{message.body}</p>
      <small>{message.createdAt}</small>
    </article>
  );
}

function ContextBlock({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}): React.JSX.Element {
  return (
    <section className="admin-support-context-block">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}): React.JSX.Element {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function messageKindLabel(kind: SupportTicketMessage['kind']): string {
  switch (kind) {
    case 'admin_outbound':
      return 'Admin reply';
    case 'customer_inbound':
      return 'Customer message';
    case 'internal_private_note':
      return 'Internal private note';
    case 'system_auto_reply':
      return 'System auto-reply';
  }
}

function createSupportReplyIdempotencyKey(input: {
  action: 'escalate' | 'resolve' | 'waiting';
  body: string;
  templateId: string;
  threadMessageCount: number;
  ticketId: string;
}): string {
  const value = [
    input.ticketId,
    input.threadMessageCount,
    input.templateId,
    input.action,
    input.body.replace(/\s+/g, ' ').trim(),
  ].join('|');
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return `admin-reply-${Math.abs(hash).toString(36)}`;
}
