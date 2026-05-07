import { Image } from 'react-native';
import {
  composeReportSections,
  type PdfComposition,
  type PdfDecisionWindow,
  type PdfEvidenceRow,
  type PdfSection,
} from '@pridicta/pdf';

import { colors } from '../../theme/colors';
import type { KundliData, PDFMode, SupportedLanguage } from '../../types/astrology';

const predictaLogo = require('../../assets/predicta-logo.png');

export type HoroscopePdfResult = {
  filePath: string;
  generatedAt: string;
  mode: PDFMode;
};

type GenerateHoroscopePdfInput = {
  kundli: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function section(title: string, body: string): string {
  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA DOSSIER</span>
        <span>${escapeHtml(title)}</span>
      </div>
      <h2>${escapeHtml(title)}</h2>
      ${body}
      ${footer()}
    </section>
  `;
}

function footer(): string {
  return `
    <footer>
      <div>Designed &amp; Engineered by Bhaumik Mehta</div>
      <div>Powered by AI</div>
      <div>© 2026</div>
    </footer>
  `;
}

function reportSectionBody(reportSection: PdfSection): string {
  return `
    <div class="card">
      <div class="section-meta">
        <div class="eyebrow">${escapeHtml(reportSection.eyebrow)}</div>
        <span>${escapeHtml(reportSection.tier ?? 'free')} · ${escapeHtml(reportSection.confidence ?? 'medium')} confidence</span>
      </div>
      <p>${escapeHtml(reportSection.body)}</p>
      ${
        reportSection.bullets.length
          ? `<ul>${reportSection.bullets
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul>`
          : ''
      }
      ${
        reportSection.evidence.length
          ? `<div class="evidence"><h3>Chart evidence</h3><ul>${reportSection.evidence
              .map(item => `<li>${escapeHtml(item)}</li>`)
              .join('')}</ul></div>`
          : ''
      }
      ${reportSection.evidenceTable?.length ? evidenceTable(reportSection.evidenceTable) : ''}
      ${reportSection.decisionWindows?.length ? decisionWindows(reportSection.decisionWindows) : ''}
    </div>
  `;
}

function evidenceTable(rows: PdfEvidenceRow[]): string {
  return `
    <div class="evidence-table">
      <h3>Evidence table</h3>
      <table>
        <thead>
          <tr>
            <th>Factor</th>
            <th>Observation</th>
            <th>Confidence</th>
            <th>Implication</th>
          </tr>
        </thead>
        <tbody>
          ${rows
            .map(
              row => `
                <tr>
                  <td>${escapeHtml(row.factor)}</td>
                  <td>${escapeHtml(row.observation)}</td>
                  <td>${escapeHtml(row.confidence)}</td>
                  <td>${escapeHtml(row.implication)}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function decisionWindows(windows: PdfDecisionWindow[]): string {
  return `
    <div class="decision-windows">
      <h3>Decision windows</h3>
      ${windows
        .map(
          item => `
            <div class="window">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.window)} · ${escapeHtml(item.confidence)} confidence</span>
              <p>${escapeHtml(item.guidance)}</p>
              <ul>${item.evidence.map(line => `<li>${escapeHtml(line)}</li>`).join('')}</ul>
            </div>
          `,
        )
        .join('')}
    </div>
  `;
}

function executiveSummary(report: PdfComposition): string {
  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA DOSSIER 2.0</span>
        <span>${escapeHtml(report.mode)}</span>
      </div>
      <h2>Executive intelligence summary</h2>
      <div class="card hero-card">
        <div class="section-meta">
          <div class="eyebrow">EXECUTIVE SUMMARY</div>
          <span>${escapeHtml(report.executiveSummary.confidence)} confidence</span>
        </div>
        <h3>${escapeHtml(report.executiveSummary.headline)}</h3>
        <ul>
          ${report.executiveSummary.keySignals
            .map(signal => `<li>${escapeHtml(signal)}</li>`)
            .join('')}
        </ul>
      </div>
      ${footer()}
    </section>
  `;
}

function trustPanel(report: PdfComposition): string {
  const trust = report.trustProfile;

  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA TRUST LAYER</span>
        <span>${escapeHtml(trust.confidenceLabel)}</span>
      </div>
      <h2>Trust, safety, and proof</h2>
      <div class="card hero-card">
        <div class="section-meta">
          <div class="eyebrow">WHAT PREDICTA KNOWS</div>
          <span>${escapeHtml(trust.confidenceLabel)}</span>
        </div>
        <h3>${escapeHtml(trust.summary)}</h3>
        <p>${escapeHtml(trust.safetyNotes.join(' '))}</p>
      </div>
      <div class="card">
        <div class="eyebrow">Evidence used</div>
        <ul>${trust.evidence.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="eyebrow">Limitations</div>
        <ul>${trust.limitations.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      <div class="card">
        <div class="eyebrow">Audit trace</div>
        <ul>${trust.auditTrace.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
      ${footer()}
    </section>
  `;
}

export function buildHoroscopePdfHtml({
  kundli,
  language = 'en',
  mode,
}: GenerateHoroscopePdfInput): string {
  const logoUri = Image.resolveAssetSource(predictaLogo).uri;
  const report = composeReportSections({ kundli, language, mode });

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: ${colors.background};
            color: ${colors.primaryText};
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          .page {
            min-height: 1122px;
            padding: 58px 54px 82px;
            position: relative;
            overflow: hidden;
            page-break-after: always;
          }
          .page::before {
            content: "PREDICTA";
            position: absolute;
            inset: 270px 0 auto 0;
            color: rgba(255,255,255,0.035);
            font-size: 86px;
            font-weight: 900;
            letter-spacing: 14px;
            text-align: center;
            transform: rotate(-18deg);
          }
          .cover {
            align-items: center;
            display: flex;
            justify-content: center;
            text-align: center;
          }
          .seal {
            background: radial-gradient(circle, rgba(123,97,255,0.36), rgba(77,175,255,0.18), rgba(255,77,166,0.14), transparent 68%);
            border-radius: 220px;
            height: 440px;
            position: absolute;
            top: 120px;
            width: 440px;
          }
          .logo {
            border-radius: 28px;
            height: 180px;
            margin-bottom: 34px;
            position: relative;
            width: 180px;
          }
          h1 {
            font-size: 54px;
            letter-spacing: 12px;
            margin: 0;
          }
          h2 {
            font-size: 34px;
            margin: 36px 0 22px;
          }
          h3 {
            font-size: 20px;
            line-height: 1.35;
            margin: 8px 0 14px;
          }
          p, li, td {
            color: ${colors.secondaryText};
            font-size: 15px;
            line-height: 1.65;
          }
          strong { color: ${colors.primaryText}; }
          .gradient-text {
            background: linear-gradient(100deg, #7B61FF, #4DAFFF, #FF4DA6);
            -webkit-background-clip: text;
            color: transparent;
          }
          .card {
            background: linear-gradient(140deg, rgba(18,18,26,0.95), rgba(25,25,35,0.88));
            border: 1px solid rgba(123,97,255,0.34);
            border-radius: 18px;
            box-shadow: 0 18px 44px rgba(123,97,255,0.18);
            margin: 18px 0;
            padding: 22px;
          }
          .eyebrow, .page-header {
            color: ${colors.secondaryText};
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 2px;
            text-transform: uppercase;
          }
          .section-meta {
            align-items: center;
            display: flex;
            gap: 12px;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .section-meta span {
            background: rgba(255,255,255,0.07);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 999px;
            color: ${colors.primaryText};
            font-size: 11px;
            font-weight: 800;
            padding: 7px 10px;
            text-transform: uppercase;
          }
          .hero-card h3 {
            font-size: 24px;
            margin-top: 0;
          }
          .page-header {
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.08);
            display: flex;
            justify-content: space-between;
            padding-bottom: 14px;
          }
          table {
            border-collapse: collapse;
            overflow: hidden;
            width: 100%;
          }
          th {
            color: ${colors.primaryText};
            font-size: 12px;
            letter-spacing: 1px;
            padding: 12px;
            text-align: left;
            text-transform: uppercase;
          }
          td {
            border-top: 1px solid rgba(255,255,255,0.08);
            padding: 12px;
          }
          .evidence {
            background: rgba(77,175,255,0.07);
            border: 1px solid rgba(77,175,255,0.18);
            border-radius: 14px;
            margin-top: 18px;
            padding: 16px;
          }
          .evidence h3 {
            font-size: 15px;
            margin: 0 0 8px;
          }
          .evidence-table,
          .decision-windows {
            margin-top: 18px;
          }
          .decision-windows .window {
            background: rgba(255,255,255,0.045);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 12px;
            margin-top: 10px;
            padding: 14px;
          }
          .decision-windows .window span {
            color: ${colors.secondaryText};
            display: block;
            font-size: 12px;
            margin-top: 4px;
          }
          footer {
            border-top: 1px solid rgba(255,255,255,0.08);
            bottom: 34px;
            color: rgba(255,255,255,0.54);
            display: flex;
            font-size: 11px;
            justify-content: space-between;
            left: 54px;
            padding-top: 12px;
            position: absolute;
            right: 54px;
          }
        </style>
      </head>
      <body>
        <section class="page cover">
          <div class="seal"></div>
          <div>
            <img class="logo" src="${logoUri}" />
            <h1 class="gradient-text">PREDICTA</h1>
            <p>${escapeHtml(report.cover.subtitle)}</p>
            <p>${report.cover.metadata.map(escapeHtml).join(' • ')}</p>
          </div>
          ${footer()}
        </section>
        ${executiveSummary(report)}
        ${trustPanel(report)}
        ${report.sections
          .map(reportSection =>
            section(reportSection.title, reportSectionBody(reportSection)),
          )
          .join('')}
      </body>
    </html>
  `;
}

export async function generateHoroscopePdf({
  kundli,
  language = 'en',
  mode,
}: GenerateHoroscopePdfInput): Promise<HoroscopePdfResult> {
  const generatedAt = new Date().toISOString();
  const { generatePDF } = await import('react-native-html-to-pdf');
  const result = await generatePDF({
    bgColor: colors.background,
    directory: 'Documents',
    fileName: `pridicta-${
      kundli.birthDetails.name
    }-${mode.toLowerCase()}-${Date.now()}`,
    html: buildHoroscopePdfHtml({ kundli, language, mode }),
    shouldPrintBackgrounds: true,
  });

  return {
    filePath: result.filePath,
    generatedAt,
    mode,
  };
}
