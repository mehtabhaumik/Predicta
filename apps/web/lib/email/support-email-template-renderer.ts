import type { SupportTicketCategory, SupportTicketThread } from '@pridicta/types';
import catalog from './support-email-template-catalog.json';

export type SupportEmailTemplateAudience = 'admin' | 'customer' | 'system';

export type SupportEmailTemplateCta = {
  label: string;
  url: string;
};

export type SupportEmailTemplate = {
  audience: SupportEmailTemplateAudience;
  bodyParagraphs: string[];
  categoryHints: SupportTicketCategory[];
  cta: SupportEmailTemplateCta;
  footer: string;
  group: string;
  heading: string;
  id: string;
  locale: string;
  previewText: string;
  requiredVariables: string[];
  subject: string;
};

export type RenderedSupportTemplate = {
  html: string;
  previewText: string;
  subject: string;
  templateId: string;
  text: string;
};

export type SupportTemplateSearchResult = {
  groups: Array<{
    group: string;
    templates: SupportEmailTemplate[];
  }>;
  templates: SupportEmailTemplate[];
};

export class SupportTemplateRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SupportTemplateRenderError';
  }
}

export function listSupportEmailTemplates(
  audience?: SupportEmailTemplateAudience,
): SupportEmailTemplate[] {
  return normalizeCatalogTemplates().filter(
    template => !audience || template.audience === audience,
  );
}

export function getSupportEmailTemplate(templateId: string): SupportEmailTemplate {
  const template = normalizeCatalogTemplates().find(item => item.id === templateId);

  if (!template) {
    throw new SupportTemplateRenderError(`Unknown support email template: ${templateId}`);
  }

  return template;
}

export function searchSupportEmailTemplates(input: {
  audience?: SupportEmailTemplateAudience;
  category?: SupportTicketCategory;
  query?: string;
}): SupportTemplateSearchResult {
  const query = input.query?.trim().toLowerCase();
  const templates = listSupportEmailTemplates(input.audience).filter(template => {
    const categoryMatch =
      !input.category || template.categoryHints.includes(input.category);
    const queryMatch =
      !query ||
      [
        template.id,
        template.group,
        template.heading,
        template.subject,
        template.previewText,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);

    return categoryMatch && queryMatch;
  });
  const groupNames = Array.from(new Set(templates.map(template => template.group))).sort();

  return {
    groups: groupNames.map(group => ({
      group,
      templates: templates.filter(template => template.group === group),
    })),
    templates,
  };
}

export function suggestSupportReplyTemplate(
  thread: SupportTicketThread,
): SupportEmailTemplate {
  const [template] = searchSupportEmailTemplates({
    audience: 'admin',
    category: thread.ticket.category,
  }).templates.filter(item => item.id.startsWith('support.admin.reply.'));

  return template ?? getSupportEmailTemplate('support.admin.reply.need_more_details.v1');
}

export function buildTemplateVariablesForThread(
  thread: SupportTicketThread,
  overrides: Record<string, string> = {},
): Record<string, string> {
  return {
    appUrl: 'https://predicta.rudraix.com',
    category: sentenceCase(thread.ticket.category),
    createdAt: thread.ticket.createdAt,
    customerEmail: thread.ticket.customerEmail ?? 'not shared',
    customerName: thread.ticket.customerName?.trim() || 'there',
    reportType: thread.ticket.related?.reportType ?? 'Predicta report',
    requestedDetails: 'the missing detail requested by Predicta support',
    resolutionSummary:
      'we reviewed your request and will guide you with the safest next step',
    supportEmail: 'care@predicta.rudraix.com',
    ticketNumber: thread.ticket.ticketNumber,
    ...overrides,
  };
}

export function renderSupportEmailTemplate(input: {
  templateId: string;
  variables: Record<string, string | undefined>;
}): RenderedSupportTemplate {
  const template = getSupportEmailTemplate(input.templateId);
  const variables = normalizeVariables(input.variables);
  const missing = template.requiredVariables.filter(
    variable => !variables[variable]?.trim(),
  );

  if (missing.length) {
    throw new SupportTemplateRenderError(
      `Missing required template variables: ${missing.join(', ')}`,
    );
  }

  const subject = renderTemplateString(template.subject, variables);
  const previewText = renderTemplateString(template.previewText, variables);
  const heading = renderTemplateString(template.heading, variables);
  const bodyParagraphs = template.bodyParagraphs.map(paragraph =>
    renderTemplateString(paragraph, variables),
  );
  const cta = {
    label: renderTemplateString(template.cta.label, variables),
    url: renderTemplateString(template.cta.url, variables),
  };
  const footer = renderTemplateString(template.footer, variables);

  return {
    html: wrapPredictaEmailHtml({
      bodyParagraphs,
      cta,
      footer,
      heading,
      previewText,
    }),
    previewText,
    subject,
    templateId: template.id,
    text: renderTemplateText({
      bodyParagraphs,
      cta,
      footer,
      heading,
    }),
  };
}

export function renderSupportEmailTemplateBodyText(input: {
  templateId: string;
  variables: Record<string, string | undefined>;
}): string {
  return renderSupportEmailTemplate(input).text;
}

function normalizeCatalogTemplates(): SupportEmailTemplate[] {
  return catalog.templates as SupportEmailTemplate[];
}

function normalizeVariables(
  variables: Record<string, string | undefined>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(variables).map(([key, value]) => [key, value ?? '']),
  );
}

function renderTemplateString(
  value: string,
  variables: Record<string, string>,
): string {
  return value.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_, key: string) => {
    const variable = variables[key];

    if (variable === undefined) {
      throw new SupportTemplateRenderError(
        `Missing template variable while rendering: ${key}`,
      );
    }

    return variable;
  });
}

function wrapPredictaEmailHtml(input: {
  bodyParagraphs: string[];
  cta: SupportEmailTemplateCta;
  footer: string;
  heading: string;
  previewText: string;
}): string {
  return [
    '<!doctype html>',
    '<html>',
    '<body style="margin:0;background:#f6f5f0;color:#151925;font-family:Georgia,serif;">',
    `<span style="display:none;opacity:0;overflow:hidden;">${escapeHtml(input.previewText)}</span>`,
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f5f0;padding:28px 12px;">',
    '<tr><td align="center">',
    '<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border-radius:28px;overflow:hidden;background:#fffdf7;border:1px solid #d8c28a;">',
    '<tr><td style="background:#151925;color:#ffffff;padding:28px 30px;">',
    '<div style="letter-spacing:0.22em;text-transform:uppercase;color:#7ddfc9;font-size:12px;">Predicta</div>',
    `<h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;">${escapeHtml(input.heading)}</h1>`,
    '</td></tr>',
    `<tr><td style="padding:30px;font-size:16px;line-height:1.65;">${input.bodyParagraphs
      .map(paragraph => `<p>${escapeHtml(paragraph)}</p>`)
      .join('')}<p><a href="${escapeHtml(input.cta.url)}" style="display:inline-block;margin-top:12px;background:#151925;color:#ffffff;text-decoration:none;border-radius:999px;padding:12px 18px;font-weight:700;">${escapeHtml(
      input.cta.label,
    )}</a></p></td></tr>`,
    `<tr><td style="border-top:1px solid #e4d6b1;padding:20px 30px;color:#536070;font-size:13px;line-height:1.55;">${escapeHtml(input.footer)}<br>Prepared by Predicta.</td></tr>`,
    '</table>',
    '</td></tr>',
    '</table>',
    '</body>',
    '</html>',
  ].join('');
}

function renderTemplateText(input: {
  bodyParagraphs: string[];
  cta: SupportEmailTemplateCta;
  footer: string;
  heading: string;
}): string {
  return [
    input.heading,
    '',
    ...input.bodyParagraphs.flatMap(paragraph => [paragraph, '']),
    `${input.cta.label}: ${input.cta.url}`,
    '',
    input.footer,
    'Prepared by Predicta.',
  ].join('\n');
}

function sentenceCase(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, char => char.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
