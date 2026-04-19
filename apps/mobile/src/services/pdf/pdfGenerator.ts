import { Image } from 'react-native';
import { getPdfLanguageLabel } from '@pridicta/config';
import { getReportProduct } from '@pridicta/pdf';
import type { AppLocale, ReportProductType } from '@pridicta/types';

import { CHART_REGISTRY } from '../../data/chartRegistry';
import { colors } from '../../theme/colors';
import type { KundliData, PDFMode } from '../../types/astrology';

const predictaLogo = require('../../assets/predicta-logo.png');

export type HoroscopePdfResult = {
  filePath: string;
  generatedAt: string;
  mode: PDFMode;
};

type GenerateHoroscopePdfInput = {
  kundli: KundliData;
  language?: AppLocale;
  mode: PDFMode;
  reportType?: ReportProductType;
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
        <span>PRIDICTA DOSSIER</span>
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

function chartBody(kundli: KundliData, chartType: 'D1' | 'D9' | 'D10'): string {
  const config = CHART_REGISTRY.find(chart => chart.id === chartType);
  const chart = kundli.charts[chartType];

  if (!chart.supported) {
    return `
      <div class="card">
        <div class="eyebrow">${chartType} • ${escapeHtml(
      config?.name ?? chartType,
    )}</div>
        <h3>Chart not enabled</h3>
        <p>${escapeHtml(
          chart.unsupportedReason ??
            'This chart is not available in this report.',
        )}</p>
      </div>
    `;
  }

  return `
    <div class="card">
      <div class="eyebrow">${chartType} • ${escapeHtml(
    config?.name ?? chartType,
  )}</div>
      <h3>${escapeHtml(config?.purpose ?? chart.name)}</h3>
      <p>Ascendant: <strong>${escapeHtml(chart.ascendantSign)}</strong></p>
      <ul>${Object.entries(chart.housePlacements)
        .filter(([, planets]) => planets.length)
        .map(
          ([house, planets]) =>
            `<li>House ${house}: ${escapeHtml(planets.join(', '))}</li>`,
        )
        .join('')}</ul>
    </div>
  `;
}

function planetaryRows(kundli: KundliData, mode: PDFMode): string {
  const limit = mode === 'FREE' ? 6 : kundli.planets.length;

  return kundli.planets
    .slice(0, limit)
    .map(
      planet => `
        <tr>
          <td>${escapeHtml(planet.name)}</td>
          <td>${escapeHtml(planet.sign)}</td>
          <td>${planet.house}</td>
          <td>${escapeHtml(planet.nakshatra)}</td>
          <td>${planet.degree.toFixed(2)}° ${planet.retrograde ? 'R' : ''}</td>
        </tr>
      `,
    )
    .join('');
}

function predictions(kundli: KundliData, mode: PDFMode): string {
  const premiumDepth =
    mode === 'PREMIUM'
      ? '<p>The premium reading also weaves D2, D4, D7, D12, D16, D20, D24, D30, D40, D45, and D60 signals to separate temporary pressure from deeper karmic texture.</p>'
      : '<p>The full report expands this into advanced divisional chart insights while keeping the same premium visual quality.</p>';

  return `
    <div class="card">
      <p>The current ${escapeHtml(
        `${kundli.dasha.current.mahadasha} Mahadasha and ${kundli.dasha.current.antardasha} Antardasha`,
      )} period favors mature commitments, patient wealth-building, and deliberate professional visibility.</p>
      <p>The strongest support appears around houses ${kundli.ashtakavarga.strongestHouses.join(
        ', ',
      )}, which points toward self-led effort, public contribution, and helpful networks.</p>
      <p>Over the next cycle, Pridicta would guide you to reduce emotional overextension, protect sleep and clarity, and say yes only to paths that strengthen dignity.</p>
      ${premiumDepth}
    </div>
  `;
}

export function buildHoroscopePdfHtml({
  kundli,
  language = 'en',
  mode,
  reportType = mode === 'PREMIUM'
    ? 'PREMIUM_KUNDLI_REPORT'
    : 'FREE_KUNDLI_SUMMARY',
}: GenerateHoroscopePdfInput): string {
  const logoUri = Image.resolveAssetSource(predictaLogo).uri;
  const reportProduct = getReportProduct(reportType);
  const languageLabel = getPdfLanguageLabel(language);
  const advancedCharts =
    mode === 'PREMIUM'
      ? CHART_REGISTRY.filter(chart => chart.category === 'advanced')
          .slice(0, 8)
          .map(
            chart =>
              `<li>${chart.id} ${escapeHtml(chart.name)}: ${escapeHtml(
                chart.purpose,
              )}</li>`,
          )
          .join('')
      : '<li>Advanced chart coverage is reserved for the full-depth report.</li>';

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
            content: "PRIDICTA";
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
            <h1 class="gradient-text">PRIDICTA</h1>
            <p>${escapeHtml(reportProduct.title)} for ${escapeHtml(
              kundli.birthDetails.name,
            )}</p>
            <p>${escapeHtml(kundli.birthDetails.date)} • ${escapeHtml(
    kundli.birthDetails.time,
  )} • ${escapeHtml(kundli.birthDetails.place)}</p>
            <p>Language preference: ${escapeHtml(languageLabel)}</p>
          </div>
          ${footer()}
        </section>
        ${section(
          'Introduction',
          `<div class="card"><p>${escapeHtml(
            reportProduct.subtitle,
          )}</p><p>Language preference: <strong>${escapeHtml(
            languageLabel,
          )}</strong>. This phase keeps the generated report structure language-ready while full translated report generation can be unlocked through Premium depth or report credits later.</p><p>This dossier reads your kundli with a calm Jyotish lens, joining classical chart logic with clear modern language. The aim is not fear or certainty, but grounded timing, self-knowledge, and wiser action under Mahadev's quiet grace.</p></div>`,
        )}
        ${section(
          'Birth Details',
          `<div class="card"><p>Name: <strong>${escapeHtml(
            kundli.birthDetails.name,
          )}</strong></p><p>Date: <strong>${escapeHtml(
            kundli.birthDetails.date,
          )}</strong></p><p>Time: <strong>${escapeHtml(
            kundli.birthDetails.time,
          )}</strong></p><p>Place: <strong>${escapeHtml(
            kundli.birthDetails.place,
          )}</strong></p><p>Lagna: <strong>${
            kundli.lagna
          }</strong> • Moon: <strong>${
            kundli.moonSign
          }</strong> • Nakshatra: <strong>${
            kundli.nakshatra
          }</strong></p></div>`,
        )}
        ${section('D1 Chart', chartBody(kundli, 'D1'))}
        ${section('D9 Chart', chartBody(kundli, 'D9'))}
        ${section('D10 Chart', chartBody(kundli, 'D10'))}
        ${section(
          'Planetary Positions',
          `<div class="card"><table><thead><tr><th>Planet</th><th>Sign</th><th>House</th><th>Nakshatra</th><th>Condition</th></tr></thead><tbody>${planetaryRows(
            kundli,
            mode,
          )}</tbody></table></div>`,
        )}
        ${section(
          'Yogas',
          `<div class="card"><ul>${kundli.yogas
            .slice(0, mode === 'FREE' ? 3 : kundli.yogas.length)
            .map(
              yoga =>
                `<li><strong>${escapeHtml(yoga.name)}</strong> (${
                  yoga.strength
                }): ${escapeHtml(yoga.meaning)}</li>`,
            )
            .join('')}</ul></div>`,
        )}
        ${section(
          'Ashtakavarga',
          `<div class="card"><p>Total bindus: <strong>${
            kundli.ashtakavarga.totalScore
          }</strong></p><p>Strongest houses: <strong>${kundli.ashtakavarga.strongestHouses.join(
            ', ',
          )}</strong></p><p>Weakest houses: <strong>${kundli.ashtakavarga.weakestHouses.join(
            ', ',
          )}</strong></p></div>`,
        )}
        ${section(
          'Current Dasha',
          `<div class="card"><p><strong>${escapeHtml(
            `${kundli.dasha.current.mahadasha} Mahadasha - ${kundli.dasha.current.antardasha} Antardasha`,
          )}</strong></p><p>${escapeHtml(
            kundli.dasha.current.startDate,
          )} to ${escapeHtml(kundli.dasha.current.endDate)}</p></div>`,
        )}
        ${section('Predictions', predictions(kundli, mode))}
        ${section(
          'Guidance / Remedies',
          `<div class="card"><p>Keep a steady Saturday discipline, simplify commitments, and offer a quiet prayer to Mahadev before major decisions. For this chart, remedies work best when they create consistency rather than emotional urgency.</p><ul><li>Journal one practical decision every Monday morning.</li><li>Keep financial promises small, written, and trackable.</li><li>Use mantra, silence, or breathwork to settle Moon-driven intensity before conversations.</li></ul></div>`,
        )}
        ${section(
          'Closing Note',
          `<div class="card"><p>Your kundli is not a cage. It is a map of tendencies, timing, and inner work. Walk it with patience, clean intention, and steady courage; Bholenath favors sincerity more than noise.</p><ul>${advancedCharts}</ul></div>`,
        )}
      </body>
    </html>
  `;
}

export async function generateHoroscopePdf({
  kundli,
  language = 'en',
  mode,
  reportType = mode === 'PREMIUM'
    ? 'PREMIUM_KUNDLI_REPORT'
    : 'FREE_KUNDLI_SUMMARY',
}: GenerateHoroscopePdfInput): Promise<HoroscopePdfResult> {
  const generatedAt = new Date().toISOString();
  const reportProduct = getReportProduct(reportType);
  const { generatePDF } = await import('react-native-html-to-pdf');
  const result = await generatePDF({
    bgColor: colors.background,
    directory: 'Documents',
    fileName: `pridicta-${reportProduct.id.toLowerCase()}-${
      kundli.birthDetails.name
    }-${mode.toLowerCase()}-${Date.now()}`,
    html: buildHoroscopePdfHtml({ kundli, language, mode, reportType }),
    shouldPrintBackgrounds: true,
  });

  return {
    filePath: result.filePath,
    generatedAt,
    mode,
  };
}
