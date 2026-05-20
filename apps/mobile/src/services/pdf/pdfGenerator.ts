import { Image } from 'react-native';
import {
  composeReportSections,
  type PdfComposition,
  type PdfChartSnapshot,
  type PdfDecisionWindow,
  type PdfEvidenceRow,
  type PdfReportFocus,
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
  reportFocus?: PdfReportFocus;
  sectionKeys?: string[];
};

function getPdfSectionKey(section: PdfSection, index: number): string {
  return `${index}-${section.eyebrow}-${section.title}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getPdfCopy(language: SupportedLanguage): {
  coverModeFree: string;
  coverModePremium: string;
  evidenceTable: string;
  footerLines: [string, string, string];
  tagline: string;
} {
  if (language === 'hi') {
    return {
      coverModeFree: 'मुफ्त उपयोगी रिपोर्ट',
      coverModePremium: 'प्रीमियम विस्तृत रिपोर्ट',
      evidenceTable: 'Chart evidence',
      footerLines: [
        'Predicta reflection और planning के लिए है.',
        'यह professional या emergency help की जगह नहीं है.',
        'कोई prediction guaranteed नहीं है.',
      ],
      tagline: 'अपनी Kundli बनाएं. जीवन समझें. Chart proof के साथ पूछें.',
    };
  }

  if (language === 'gu') {
    return {
      coverModeFree: 'મફત ઉપયોગી રિપોર્ટ',
      coverModePremium: 'પ્રીમિયમ વિગતવાર રિપોર્ટ',
      evidenceTable: 'Chart evidence',
      footerLines: [
        'Predicta reflection અને planning માટે છે.',
        'તે professional અથવા emergency help ની જગ્યાએ નથી.',
        'કોઈ prediction guaranteed નથી.',
      ],
      tagline: 'તમારી Kundli બનાવો. જીવન સમજો. Chart proof સાથે પૂછો.',
    };
  }

  return {
    coverModeFree: 'Free generous report',
    coverModePremium: 'Premium detailed report',
    evidenceTable: 'Chart evidence',
    footerLines: [
      'Predicta is for reflection and planning.',
      'Not a replacement for professional or emergency help.',
      'No prediction is guaranteed.',
    ],
    tagline: 'Create your Kundli. Understand your life. Ask with proof.',
  };
}

function section(title: string, body: string, language: SupportedLanguage): string {
  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA HOLISTIC ASTROLOGY</span>
        <span>${escapeHtml(title)}</span>
      </div>
      <h2>${escapeHtml(title)}</h2>
      ${body}
      ${footer(language)}
    </section>
  `;
}

function footer(language: SupportedLanguage): string {
  const copy = getPdfCopy(language);

  return `
    <footer>
      <div>${escapeHtml(copy.footerLines[0])}</div>
      <div>${escapeHtml(copy.footerLines[1])}</div>
      <div>${escapeHtml(copy.footerLines[2])}</div>
    </footer>
  `;
}

function reportSectionBody(
  reportSection: PdfSection,
  language: SupportedLanguage,
): string {
  const copy = getPdfCopy(language);

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
          ? `<div class="evidence"><h3>${escapeHtml(copy.evidenceTable)}</h3><ul>${reportSection.evidence
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
        <span>PREDICTA HOLISTIC ASTROLOGY</span>
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
      ${footer(report.language)}
    </section>
  `;
}

function trustPanel(report: PdfComposition): string {
  const trust = report.trustProfile;

  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA SAFETY PROMISE</span>
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
        <div class="eyebrow">Review note</div>
        <p>Predicta checked chart proof, limits, and safety notes before preparing this guidance.</p>
      </div>
      ${footer(report.language)}
    </section>
  `;
}

function chartSnapshotPages(report: PdfComposition): string {
  if (!report.chartSnapshots.length) {
    return '';
  }

  return `
    <section class="page">
      <div class="page-header">
        <span>PREDICTA CHART PROOF</span>
        <span>${escapeHtml(report.mode)}</span>
      </div>
      <h2>Charts in this report</h2>
      <p>These chart snapshots use the same Kundli model, signs, houses, degrees, planet status markers, moon rhythm, and birth-time theme as the app charts.</p>
      <div class="chart-snapshot-grid">
        ${report.chartSnapshots.slice(0, 4).map(chartSnapshot).join('')}
      </div>
      ${footer(report.language)}
    </section>
  `;
}

function chartSnapshot(snapshot: PdfChartSnapshot): string {
  return `
    <article class="chart-snapshot ${escapeHtml(snapshot.theme)}">
      <div class="chart-snapshot-head">
        <span>${escapeHtml(snapshot.chartType)}</span>
        <strong>${escapeHtml(snapshot.displayChartName ?? snapshot.chartName)}</strong>
        <em>${escapeHtml(snapshot.school)}</em>
      </div>
      <div class="chart-mini">
        <svg class="chart-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 0 H100 V100 H0 Z" />
          <path d="M0 0 L100 100" />
          <path d="M100 0 L0 100" />
          <path d="M50 0 L100 50 L50 100 L0 50 Z" />
        </svg>
        ${snapshot.cells.map(snapshotCell).join('')}
      </div>
      ${
        snapshot.moonNakshatraPada
          ? `<p class="chart-note">Moon: ${escapeHtml(snapshot.moonNakshatraPada.moonPhaseLabel)}. Birth star: ${escapeHtml(snapshot.moonNakshatraPada.moonNakshatra ?? 'not available')}${
              snapshot.moonNakshatraPada.pada
                ? ` pada ${snapshot.moonNakshatraPada.pada}`
                : ''
            }.</p>`
          : ''
      }
      ${
        snapshot.legend.length
          ? `<div class="chart-mini-legend">${snapshot.legend
              .map(item => `<span><b>${escapeHtml(item.code)}</b> ${escapeHtml(item.description)}</span>`)
              .join('')}</div>`
          : ''
      }
    </article>
  `;
}

function snapshotCell(cell: PdfChartSnapshot['cells'][number]): string {
  const point = houseLabelPoint(cell.house);

  return `
    <div class="chart-mini-cell" style="left:${point.x}%;top:${point.y}%;">
      <span class="chart-sign">${cell.signNumber} ${escapeHtml(cell.displaySign ?? cell.sign)}</span>
      ${cell.planets
        .slice(0, 5)
        .map(
          planet => `
            <span class="chart-planet">
              ${escapeHtml(planet.displayName ?? planet.name)} ${escapeHtml(planet.degreeLabel)}${planet.status.retrograde ? ' R' : ''}${planet.status.exalted ? ' E' : ''}${planet.status.debilitated ? ' D' : ''}${planet.status.combust ? ' C' : ''}
            </span>
          `,
        )
        .join('')}
      ${
        cell.planets.length > 5
          ? `<span class="chart-planet">+${cell.planets.length - 5} more</span>`
          : ''
      }
    </div>
  `;
}

function houseLabelPoint(house?: number): { x: number; y: number } {
  const points: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 20 },
    2: { x: 25, y: 14 },
    3: { x: 12, y: 30 },
    4: { x: 26, y: 50 },
    5: { x: 12, y: 70 },
    6: { x: 25, y: 86 },
    7: { x: 50, y: 80 },
    8: { x: 75, y: 86 },
    9: { x: 88, y: 70 },
    10: { x: 74, y: 50 },
    11: { x: 88, y: 30 },
    12: { x: 75, y: 14 },
  };

  return points[house ?? 1] ?? points[1];
}

export function buildHoroscopePdfHtml({
  kundli,
  language = 'en',
  mode,
  reportFocus,
  sectionKeys,
}: GenerateHoroscopePdfInput): string {
  const logoUri = Image.resolveAssetSource(predictaLogo).uri;
  const report = composeReportSections({ kundli, language, mode, reportFocus });
  const copy = getPdfCopy(report.language);
  const premium = mode === 'PREMIUM';
  const selectedKeySet = sectionKeys?.length ? new Set(sectionKeys) : undefined;
  const reportSections = selectedKeySet
    ? report.sections.filter((sectionItem, index) =>
        selectedKeySet.has(getPdfSectionKey(sectionItem, index)),
      )
    : report.sections;

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
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
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
            background:
              radial-gradient(circle at 18% 16%, ${premium ? 'rgba(255,195,77,0.34)' : 'rgba(123,97,255,0.34)'}, transparent 34%),
              radial-gradient(circle at 82% 22%, ${premium ? 'rgba(255,77,166,0.2)' : 'rgba(77,175,255,0.22)'}, transparent 36%),
              linear-gradient(145deg, ${premium ? '#19131f' : '#151522'}, #09090f 74%);
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
            font-size: ${premium ? '62px' : '54px'};
            letter-spacing: 12px;
            margin: 0;
          }
          .tagline {
            color: ${colors.primaryText};
            font-size: 22px;
            font-weight: 800;
            line-height: 1.28;
            margin: 22px auto 12px;
            max-width: 620px;
          }
          .mode-pill {
            background: ${premium ? 'rgba(255,195,77,0.16)' : 'rgba(77,175,255,0.14)'};
            border: 1px solid ${premium ? 'rgba(255,195,77,0.48)' : 'rgba(77,175,255,0.4)'};
            border-radius: 999px;
            color: ${colors.primaryText};
            display: inline-block;
            font-size: 13px;
            font-weight: 900;
            letter-spacing: 1.4px;
            margin-top: 24px;
            padding: 10px 16px;
            text-transform: uppercase;
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
            border: 1px solid ${premium ? 'rgba(255,195,77,0.34)' : 'rgba(123,97,255,0.34)'};
            border-radius: ${premium ? '22px' : '18px'};
            box-shadow: 0 18px 44px ${premium ? 'rgba(255,195,77,0.16)' : 'rgba(123,97,255,0.18)'};
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
          .chart-snapshot-grid {
            display: grid;
            gap: 16px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            margin-top: 18px;
          }
          .chart-snapshot {
            background:
              radial-gradient(circle at 20% 14%, rgba(92,80,255,0.18), transparent 30%),
              radial-gradient(circle at 76% 22%, rgba(77,175,255,0.12), transparent 34%),
              linear-gradient(145deg, #080914, #101426 48%, #070812);
            border: 1px solid rgba(166,186,255,0.28);
            border-radius: 16px;
            padding: 14px;
          }
          .chart-snapshot.sunrise {
            background:
              radial-gradient(circle at 18% 16%, rgba(255,170,64,0.22), transparent 32%),
              linear-gradient(145deg, #24150f, #101421 72%);
          }
          .chart-snapshot.morning {
            background:
              radial-gradient(circle at 18% 16%, rgba(255,218,96,0.2), transparent 32%),
              linear-gradient(145deg, #242016, #101421 72%);
          }
          .chart-snapshot.afternoon {
            background:
              radial-gradient(circle at 50% 14%, rgba(255,255,255,0.12), transparent 30%),
              linear-gradient(145deg, #151b24, #090d14 74%);
          }
          .chart-snapshot.sunset {
            background:
              radial-gradient(circle at 18% 18%, rgba(255,129,76,0.22), transparent 32%),
              linear-gradient(145deg, #2c1213, #09090f 74%);
          }
          .chart-snapshot-head span,
          .chart-snapshot-head em {
            color: ${colors.secondaryText};
            display: block;
            font-size: 10px;
            font-style: normal;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          .chart-snapshot-head strong {
            color: ${colors.primaryText};
            display: block;
            font-size: 16px;
            margin: 3px 0;
          }
          .chart-mini {
            aspect-ratio: 1.38;
            border: 1px solid rgba(255,255,255,0.18);
            border-radius: 14px;
            height: 260px;
            margin-top: 10px;
            overflow: hidden;
            position: relative;
          }
          .chart-lines {
            height: 100%;
            inset: 0;
            position: absolute;
            width: 100%;
          }
          .chart-lines path {
            fill: none;
            stroke: rgba(205,216,255,0.5);
            stroke-width: 0.24;
          }
          .chart-mini-cell {
            align-items: center;
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
            justify-content: center;
            max-width: 25%;
            min-width: 76px;
            position: absolute;
            transform: translate(-50%, -50%);
          }
          .chart-sign,
          .chart-planet {
            background: rgba(13,33,53,0.82);
            border: 1px solid rgba(77,175,255,0.34);
            border-radius: 999px;
            color: ${colors.primaryText};
            display: inline-block;
            font-size: 8px;
            font-weight: 900;
            padding: 3px 5px;
            white-space: nowrap;
          }
          .chart-planet {
            background: rgba(255,255,255,0.07);
            border-color: rgba(255,255,255,0.16);
          }
          .chart-note {
            font-size: 11px;
            margin: 10px 0 0;
          }
          .chart-mini-legend {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 8px;
          }
          .chart-mini-legend span {
            color: ${colors.secondaryText};
            font-size: 10px;
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
            <div class="tagline">${escapeHtml(copy.tagline)}</div>
            <p>${escapeHtml(report.cover.subtitle)}</p>
            <p>${report.cover.metadata.map(escapeHtml).join(' • ')}</p>
            <div class="mode-pill">${escapeHtml(
              premium ? copy.coverModePremium : copy.coverModeFree,
            )}</div>
          </div>
          ${footer(report.language)}
        </section>
        ${executiveSummary(report)}
        ${trustPanel(report)}
        ${chartSnapshotPages(report)}
        ${reportSections
          .map(reportSection =>
            section(
              reportSection.title,
              reportSectionBody(reportSection, report.language),
              report.language,
            ),
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
  reportFocus,
  sectionKeys,
}: GenerateHoroscopePdfInput): Promise<HoroscopePdfResult> {
  const generatedAt = new Date().toISOString();
  const { generatePDF } = await import('react-native-html-to-pdf');
  const result = await generatePDF({
    bgColor: colors.background,
    directory: 'Documents',
    fileName: `pridicta-${
      kundli.birthDetails.name
    }-${mode.toLowerCase()}-${Date.now()}`,
    html: buildHoroscopePdfHtml({ kundli, language, mode, reportFocus, sectionKeys }),
    shouldPrintBackgrounds: true,
  });

  return {
    filePath: result.filePath,
    generatedAt,
    mode,
  };
}
