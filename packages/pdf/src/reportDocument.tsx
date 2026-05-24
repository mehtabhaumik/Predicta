import { existsSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import {
  Document,
  type DocumentProps,
  Font,
  Image,
  Page,
  Path,
  Rect,
  Svg,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer';

import type {
  PDFMode,
  KundliData,
  SignatureAnalysisModel,
  SupportedLanguage,
} from '@pridicta/types';

import {
  composeReportSections,
  type PdfChartSnapshot,
  type PdfChartSnapshotCell,
  type PdfComposition,
  type PdfReportFocus,
  type PdfSection,
} from './index';

export type PdfGenerationRequest = {
  kundli: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
  reportFocus?: PdfReportFocus;
  sectionKeys?: string[];
  signatureAnalysis?: SignatureAnalysisModel;
};

type PdfBuildResult = {
  planningSections: PdfSection[];
  report: PdfComposition;
  reportFocus: PdfReportFocus;
  sections: PdfSection[];
};

type PdfRenderOptions = {
  logoSrc?: string;
};

type ThemePalette = {
  accent: string;
  accentSoft: string;
  background: string;
  border: string;
  note: string;
  outline: string;
  panel: string;
};

type ReportScope = 'broad' | 'focused' | 'full';

type PlannedSection = {
  index: number;
  planning: PdfSection;
  section: PdfSection;
};

type PlannedSpread = {
  eyebrow: string;
  title: string;
  lead: string;
  sections: PlannedSection[];
  proofItems?: string[];
  proofTitle?: string;
};

const PDF_PREPARED_BY_TEXT = 'Prepared by Predicta @2026';

const PDF_PAGE_TEMPLATES = {
  cover: {
    background: '#07101F',
    blueGlow: '#1F6FFF',
    greenGlow: '#32D18D',
    magentaGlow: '#D93695',
  },
  interior: {
    background: '#F7F7F2',
    border: '#D9D1BF',
    ink: '#151925',
    muted: '#5B6677',
    panel: '#FFFFFF',
  },
  watermark: {
    opacity: 0.045,
    textOpacity: 0.055,
  },
} as const;

Font.register({
  family: 'Predicta Devanagari',
  src: resolvePdfFontPath('NotoSerifDevanagari-Regular.ttf'),
});

Font.register({
  family: 'Predicta Gujarati',
  src: resolvePdfFontPath('NotoSerifGujarati-Regular.ttf'),
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: PDF_PAGE_TEMPLATES.interior.background,
    color: PDF_PAGE_TEMPLATES.interior.ink,
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingBottom: 62,
    paddingHorizontal: 34,
    paddingTop: 38,
  },
  coverPage: {
    backgroundColor: PDF_PAGE_TEMPLATES.cover.background,
    color: '#F8FBFF',
    fontFamily: 'Helvetica',
    paddingBottom: 56,
    paddingHorizontal: 40,
    paddingTop: 48,
  },
  coverAuroraMagenta: {
    backgroundColor: PDF_PAGE_TEMPLATES.cover.magentaGlow,
    borderRadius: 180,
    height: 240,
    left: -70,
    opacity: 0.24,
    position: 'absolute',
    top: 42,
    width: 240,
  },
  coverAuroraBlue: {
    backgroundColor: PDF_PAGE_TEMPLATES.cover.blueGlow,
    borderRadius: 190,
    height: 270,
    opacity: 0.22,
    position: 'absolute',
    right: -92,
    top: 110,
    width: 270,
  },
  coverAuroraGreen: {
    backgroundColor: PDF_PAGE_TEMPLATES.cover.greenGlow,
    borderRadius: 170,
    bottom: 90,
    height: 210,
    opacity: 0.16,
    position: 'absolute',
    right: 66,
    width: 210,
  },
  coverTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  coverLogo: {
    height: 54,
    width: 54,
  },
  coverBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.8,
    marginBottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  coverWordmark: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: 3.2,
    marginBottom: 6,
  },
  coverTitle: {
    fontSize: 30,
    fontWeight: 800,
    lineHeight: 1.2,
    marginBottom: 10,
  },
  coverSubtitle: {
    color: '#D7E3F4',
    fontSize: 13,
    lineHeight: 1.55,
    marginBottom: 24,
  },
  coverMetaCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  coverMetaLine: {
    color: '#DCE7F7',
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  coverTagline: {
    color: '#F3F7FF',
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.45,
    marginBottom: 16,
  },
  pageHeader: {
    alignItems: 'center',
    borderBottomColor: '#D5DCE8',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingBottom: 10,
  },
  pageHeaderEyebrow: {
    color: '#6A7B98',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  pageHeaderTitle: {
    color: '#20304D',
    fontSize: 10,
    fontWeight: 700,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: 10,
  },
  pageLead: {
    color: '#55657E',
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 16,
  },
  panel: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  panelEyebrow: {
    color: '#6C7E9B',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  panelBody: {
    color: '#4D5E78',
    fontSize: 11,
    lineHeight: 1.65,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    color: '#20304D',
    fontSize: 9,
    fontWeight: 700,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  halfCard: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 98,
    padding: 12,
    width: '48.5%',
  },
  fullCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
    width: '100%',
  },
  cardLabel: {
    color: '#6C7D97',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardText: {
    color: '#1D2C45',
    fontSize: 10.5,
    lineHeight: 1.55,
  },
  cardSubtext: {
    color: '#586A85',
    fontSize: 9.5,
    lineHeight: 1.5,
    marginTop: 8,
  },
  sectionStory: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  sectionStoryBody: {
    color: '#31415A',
    fontSize: 11,
    lineHeight: 1.68,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 90,
    padding: 12,
    width: '48.5%',
  },
  evidenceCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  evidenceTitle: {
    fontSize: 10.5,
    fontWeight: 800,
    marginBottom: 6,
  },
  evidenceText: {
    color: '#546681',
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  confidenceChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    color: '#20304D',
    fontSize: 8,
    fontWeight: 800,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    textTransform: 'uppercase',
  },
  chartRow: {
    flexDirection: 'row',
    gap: 14,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  chartCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    width: '100%',
  },
  chartHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartHeaderType: {
    color: '#6B7E9B',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartHeaderTitle: {
    fontSize: 13,
    fontWeight: 800,
    marginTop: 2,
  },
  chartHeaderSchool: {
    color: '#667A97',
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  chartBoard: {
    borderRadius: 14,
    borderWidth: 1,
    height: 430,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  chartCell: {
    alignItems: 'center',
    position: 'absolute',
  },
  signChip: {
    borderRadius: 999,
    borderWidth: 1,
    color: '#20304D',
    fontSize: 8.4,
    fontWeight: 800,
    marginBottom: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    textAlign: 'center',
  },
  planetChip: {
    borderRadius: 999,
    borderWidth: 1,
    color: '#20304D',
    fontSize: 7.4,
    fontWeight: 700,
    marginBottom: 3,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    textAlign: 'center',
  },
  chartNote: {
    color: '#556680',
    fontSize: 9.5,
    lineHeight: 1.55,
    marginBottom: 8,
  },
  chartThemeNote: {
    color: '#31415C',
    fontSize: 9,
    lineHeight: 1.5,
  },
  footer: {
    alignItems: 'center',
    borderTopColor: '#D9D1BF',
    borderTopWidth: 0.5,
    bottom: 18,
    color: '#667086',
    flexDirection: 'row',
    fontSize: 8.5,
    justifyContent: 'space-between',
    left: 34,
    paddingTop: 7,
    position: 'absolute',
    right: 34,
  },
  footerLeft: {
    textAlign: 'left',
    width: '33%',
  },
  footerCenter: {
    textAlign: 'center',
    width: '34%',
  },
  footerRight: {
    textAlign: 'right',
    width: '33%',
  },
  watermarkLogo: {
    height: 260,
    left: '50%',
    marginLeft: -130,
    opacity: PDF_PAGE_TEMPLATES.watermark.opacity,
    position: 'absolute',
    top: '35%',
    width: 260,
  },
  watermarkText: {
    color: '#151925',
    fontSize: 48,
    fontWeight: 900,
    left: 0,
    letterSpacing: 7,
    opacity: PDF_PAGE_TEMPLATES.watermark.textOpacity,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: '44%',
  },
  noteRow: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
  },
  sectionStack: {
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    padding: 14,
  },
  sectionCardEyebrow: {
    color: '#6C7E9B',
    fontSize: 8.2,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionCardTitle: {
    color: '#1D2C45',
    fontSize: 12,
    fontWeight: 800,
    lineHeight: 1.35,
    marginBottom: 7,
  },
  sectionCardBody: {
    color: '#4D5E78',
    fontSize: 9.8,
    lineHeight: 1.58,
  },
  sectionBulletList: {
    marginTop: 9,
  },
  sectionBullet: {
    color: '#31415A',
    fontSize: 9.3,
    lineHeight: 1.45,
    marginBottom: 5,
  },
  closingTitle: {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.25,
    marginBottom: 12,
  },
  closingBody: {
    color: '#4D5E78',
    fontSize: 12,
    lineHeight: 1.7,
    marginBottom: 14,
  },
});

export function buildPredictaPdfResult(
  request: PdfGenerationRequest,
): PdfBuildResult {
  const report = composeReportSections({
    kundli: request.kundli,
    language: request.language,
    mode: request.mode,
    reportFocus: request.reportFocus,
    signatureAnalysis: request.signatureAnalysis,
  });
  const planningReport =
    request.language === 'en'
      ? report
      : composeReportSections({
          kundli: request.kundli,
          language: 'en',
          mode: request.mode,
          reportFocus: request.reportFocus,
          signatureAnalysis: request.signatureAnalysis,
        });

  const selectedIndexes = request.sectionKeys?.length
    ? new Set(
        request.sectionKeys
          .map(key => Number.parseInt(key.split('-', 1)[0] ?? '', 10))
          .filter(index => Number.isInteger(index) && index >= 0),
      )
    : null;

  const sections = selectedIndexes
    ? report.sections.filter((_, index) => selectedIndexes.has(index))
    : report.sections;
  const planningSections = selectedIndexes
    ? planningReport.sections.filter((_, index) => selectedIndexes.has(index))
    : planningReport.sections;

  return {
    planningSections,
    report,
    reportFocus: request.reportFocus ?? 'KUNDLI',
    sections,
  };
}

export function PredictaReportPdfDocument({
  planningSections,
  report,
  reportFocus,
  sections,
}: PdfBuildResult, options: PdfRenderOptions = {}): React.ReactElement<DocumentProps> {
  const palette = getModePalette(report.mode);
  const plannedSpreads = buildPlannedSpreads({
    planningSections,
    report,
    reportFocus,
    sections,
  });
  const chartCards = buildChartCards(report.chartSnapshots);
  const chartRows = chunk(chartCards, 1);
  const subjectName = getReportSubjectName(report);
  const documentFontFamily = getDocumentFontFamily(report.language);
  const templateCopy = getPdfTemplateCopy(report.language, report.mode);

  return (
    <Document
      author="Predicta"
      creator="Predicta"
      language={report.language}
      subject={report.cover.subtitle}
      title={`${report.cover.subtitle} | Predicta`}
    >
      <Page size="A4" style={[styles.coverPage, { fontFamily: documentFontFamily }]}>
        <PdfCoverAtmosphere />
        <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
        <PdfFooter subjectName={subjectName} />
        <View style={styles.coverTopRow}>
          {options.logoSrc ? (
            <Image src={options.logoSrc} style={styles.coverLogo} />
          ) : (
            <Text style={[styles.coverWordmark, { color: palette.accent, marginBottom: 0 }]}>
              PREDICTA
            </Text>
          )}
          <View
            style={[
              styles.coverBadge,
              {
                backgroundColor: palette.accentSoft,
                borderColor: palette.border,
                color: palette.accent,
                marginBottom: 0,
              },
            ]}
          >
            <Text>{report.mode === 'PREMIUM' ? 'Premium' : 'Free insight report'}</Text>
          </View>
        </View>
        <Text style={[styles.coverWordmark, { color: '#F8FBFF' }]}>PREDICTA</Text>
        <Text style={styles.coverTitle}>{report.cover.subtitle}</Text>
        <Text style={styles.coverSubtitle}>{report.executiveSummary.headline}</Text>
        <Text style={styles.coverTagline}>
          A polished astrology report built like a keepsake dossier: clear on
          first read, chart-rooted, and calm to move through.
        </Text>
        <View
          style={[
            styles.coverMetaCard,
            {
              backgroundColor: palette.panel,
              borderColor: palette.border,
            },
          ]}
        >
          {report.cover.metadata.map(line => (
            <Text key={line} style={styles.coverMetaLine}>
              {line}
            </Text>
          ))}
        </View>
      </Page>

      <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
        <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
        <PdfFooter subjectName={subjectName} />
        <PdfPageHeader
          eyebrow={templateCopy.summaryEyebrow}
          title={templateCopy.reportModeLabel}
        />
        <Text style={styles.pageTitle}>{templateCopy.summaryTitle}</Text>
        <Text style={styles.pageLead}>
          {templateCopy.summaryLead}
        </Text>

        <View
          style={[
            styles.panel,
            {
              backgroundColor: palette.panel,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={styles.panelEyebrow}>{templateCopy.executiveSummary}</Text>
          <Text style={styles.panelTitle}>{report.executiveSummary.headline}</Text>
          <Text style={styles.panelBody}>{report.summary}</Text>
          <View style={styles.pillRow}>
            {report.executiveSummary.keySignals.slice(0, 5).map(signal => (
              <Text
                key={signal}
                style={[
                  styles.pill,
                  {
                    backgroundColor: palette.accentSoft,
                    borderColor: palette.border,
                  },
                ]}
              >
                {signal}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.cardGrid}>
          <View
            style={[
              styles.halfCard,
              {
                backgroundColor: '#FFFFFF',
                borderColor: '#D6DDE9',
              },
            ]}
          >
            <Text style={styles.cardLabel}>{templateCopy.confidence}</Text>
            <Text style={styles.cardText}>{report.trustProfile.confidenceLabel}</Text>
            <Text style={styles.cardSubtext}>{report.trustProfile.summary}</Text>
          </View>
          <View
            style={[
              styles.halfCard,
              {
                backgroundColor: '#FFFFFF',
                borderColor: '#D6DDE9',
              },
            ]}
          >
            <Text style={styles.cardLabel}>{templateCopy.readAs}</Text>
            <Text style={styles.cardText}>
              {report.mode === 'PREMIUM'
                ? 'a premium dossier with deeper timing, synthesis, and planning guidance'
                : 'a substantial free report with real insight and clear next steps'}
            </Text>
            <Text style={styles.cardSubtext}>
              {report.mode === 'PREMIUM'
                ? 'Premium keeps the full Predicta depth, but the layout removes repetition before it removes substance.'
                : 'Free keeps the reading meaningful without turning the PDF into a teaser or a wall of raw proof.'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.noteRow,
            {
              backgroundColor: '#FFFFFF',
              borderColor: '#D6DDE9',
            },
          ]}
        >
          <Text style={styles.cardLabel}>{templateCopy.trustLimits}</Text>
          {report.trustProfile.limitations.slice(0, 4).map(item => (
            <Text key={item} style={styles.evidenceText}>
              • {item}
            </Text>
          ))}
        </View>
      </Page>

      {plannedSpreads.showOnboarding ? (
        <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
          <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
          <PdfFooter subjectName={subjectName} />
          <PdfPageHeader
            eyebrow={report.mode === 'PREMIUM' ? 'How to use this dossier' : 'How to use this report'}
            title={plannedSpreads.scope === 'focused' ? 'Focused reading guide' : 'Reading guide'}
          />
          <Text style={styles.pageTitle}>
            {report.mode === 'PREMIUM' ? 'How to use this dossier' : 'How to read this report'}
          </Text>
          <Text style={styles.pageLead}>
            {plannedSpreads.scope === 'focused'
              ? 'This is a focused reading. Move from the chart spread into the specific outcome pages first, then use the trust and guidance pages last.'
              : 'This is a broader reading. Move from the summary into the charts, then through the life spreads, and leave the proof-heavy appendix material for the end.'}
          </Text>
          <View style={styles.cardGrid}>
            {plannedSpreads.onboardingCards.map(card => (
              <View
                key={card.title}
                style={[
                  styles.halfCard,
                  {
                    backgroundColor: '#FFFFFF',
                    borderColor: '#D6DDE9',
                  },
                ]}
              >
                <Text style={styles.cardLabel}>{card.eyebrow}</Text>
                <Text style={styles.cardText}>{card.title}</Text>
                <Text style={styles.cardSubtext}>{card.body}</Text>
              </View>
            ))}
          </View>
        </Page>
      ) : null}

      {chartRows.map((row, rowIndex) => (
        <Page key={`charts-${rowIndex}`} size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
          <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
          <PdfFooter subjectName={subjectName} />
          <PdfPageHeader
            eyebrow="Chart proof"
            title={report.mode === 'PREMIUM' ? 'Chart spread' : 'Charts in your report'}
          />
          <Text style={styles.pageTitle}>The charts, in the same language as Predicta</Text>
          <Text style={styles.pageLead}>
            These charts use the same house structure, signs, planets, degrees,
            status marks, and birth-time theme logic as the real Kundli
            surfaces. The PDF does not switch to a different chart vocabulary.
          </Text>
          <View style={styles.chartRow}>
            {row.map(snapshot => (
              <PdfChartCard
                key={`${snapshot.snapshot.chartType}-${snapshot.snapshot.chartName}`}
                birthTime={report.cover.metadata[0] ?? ''}
                showThemeNote={snapshot.showThemeNote}
                snapshot={snapshot.snapshot}
              />
            ))}
          </View>
        </Page>
      ))}

      {plannedSpreads.spreads.map((spread, index) => (
        <Page key={`${spread.eyebrow}-${spread.title}-${index}`} size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
          <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
          <PdfFooter subjectName={subjectName} />
          <PdfPageHeader
            eyebrow={spread.eyebrow}
            title={report.mode === 'PREMIUM' ? 'Premium analysis spread' : 'Insight spread'}
          />
          <Text style={styles.pageTitle}>{spread.title}</Text>
          <Text style={styles.pageLead}>{spread.lead}</Text>

          <View style={styles.sectionStack}>
            {spread.sections.map(item => (
              <View
                key={`${item.index}-${item.section.title}`}
                style={[
                  styles.sectionCard,
                  {
                    backgroundColor: item.section.tier === 'premium' ? palette.note : '#FFFFFF',
                    borderColor: '#D6DDE9',
                  },
                ]}
              >
                <Text style={styles.sectionCardEyebrow}>{item.section.eyebrow}</Text>
                <Text style={styles.sectionCardTitle}>{item.section.title}</Text>
                <Text style={styles.sectionCardBody}>{item.section.body}</Text>
                {item.section.bullets.length ? (
                  <View style={styles.sectionBulletList}>
                    {item.section.bullets.slice(0, 4).map(bullet => (
                      <Text key={bullet} style={styles.sectionBullet}>
                        • {bullet}
                      </Text>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>

          {spread.proofItems?.length ? (
            <View
              style={[
                styles.noteRow,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#D6DDE9',
                },
              ]}
            >
              <Text style={styles.cardLabel}>{spread.proofTitle ?? 'Why Predicta is saying this'}</Text>
              {spread.proofItems.map(item => (
                <Text key={item} style={styles.evidenceText}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </Page>
      ))}

      <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
        <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
        <PdfFooter subjectName={subjectName} />
        <PdfPageHeader
          eyebrow={report.mode === 'PREMIUM' ? 'Close the dossier well' : 'Use the report well'}
          title={report.mode === 'PREMIUM' ? 'Next steps' : 'What to do next'}
        />
        <Text style={styles.closingTitle}>
          {report.mode === 'PREMIUM'
            ? 'Use this dossier as a planning instrument, not as a one-line fate statement.'
            : 'Use this report as a real starting point, not as a teaser.'}
        </Text>
        <Text style={styles.closingBody}>
          {report.mode === 'PREMIUM'
            ? 'The premium dossier keeps the full Predicta depth, but it works best when you move from the chart spread into the relevant life spreads and save proof-heavy material for the end.'
            : 'The free report is meant to leave you with meaningful insight, clear guidance, and enough chart context to understand why Predicta is saying what it is saying.'}
        </Text>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: palette.panel,
              borderColor: palette.border,
            },
          ]}
        >
          <Text style={styles.panelEyebrow}>Fun chart note</Text>
          <Text style={styles.panelTitle}>
            {buildThemeFunFact(report.chartSnapshots[0]?.theme ?? 'unknown', report.cover.metadata[0] ?? '')}
          </Text>
          <Text style={styles.panelBody}>
            Predicta keeps the same time-of-day chart atmosphere in the PDF so
            the document still feels like your Kundli, not like a disconnected
            export.
          </Text>
        </View>
        <View
          style={[
            styles.noteRow,
            {
              backgroundColor: '#FFFFFF',
              borderColor: '#D6DDE9',
            },
          ]}
        >
          <Text style={styles.cardLabel}>Keep in mind</Text>
          {report.trustProfile.limitations.slice(0, 3).map(item => (
            <Text key={item} style={styles.evidenceText}>
              • {item}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export function createPredictaReportPdfElement(
  result: PdfBuildResult,
  options?: PdfRenderOptions,
): React.ReactElement<DocumentProps> {
  return PredictaReportPdfDocument(result, options);
}

function buildPlannedSpreads({
  planningSections,
  report,
  reportFocus,
  sections,
}: PdfBuildResult): {
  onboardingCards: Array<{ body: string; eyebrow: string; title: string }>;
  scope: ReportScope;
  showOnboarding: boolean;
  spreads: PlannedSpread[];
} {
  const scope = determineReportScope(report.mode, reportFocus, sections.length);
  const plannedSections = sections.map((section, index) => ({
    index,
    planning: planningSections[index] ?? section,
    section,
  }));
  const used = new Set<number>();
  const spreads: PlannedSpread[] = [];
  const isFocusedRoom = ['KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus);

  const pull = (kinds: string[], maxCards: number): PlannedSection[] => {
    const kindSet = new Set(kinds);
    const matches = plannedSections.filter(item => {
      if (used.has(item.index)) {
        return false;
      }
      return kindSet.has(classifySectionKind(item.planning));
    });

    for (const item of matches.slice(0, maxCards)) {
      used.add(item.index);
    }

    return matches.slice(0, maxCards);
  };

  const addSpread = (
    eyebrow: string,
    title: string,
    lead: string,
    kinds: string[],
    maxCards: number,
    proofTitle?: string,
  ): void => {
    const selected = pull(kinds, maxCards);

    if (!selected.length) {
      return;
    }

    spreads.push({
      eyebrow,
      lead,
      proofItems: extractProofItems(selected, 4),
      proofTitle,
      sections: selected,
      title,
    });
  };

  if (isFocusedRoom) {
    addSpread(
      'Focused synthesis',
      report.mode === 'PREMIUM' ? 'What this specialist reading is saying' : 'What this focused reading is saying',
      'This report stays with the selected method instead of mixing rooms. It surfaces the main meaning first, then the proof that matters.',
      [`focus-${reportFocus.toLowerCase()}`, 'executive', 'holistic'],
      2,
      'Core proof',
    );
    addSpread(
      'Focused interpretation',
      'The chart or method details that matter most',
      'These are the parts of the reading that change the practical meaning, not just the technical description.',
      ['foundation', 'chart-synthesis', 'planets', 'timing', 'transits', 'rectification'],
      2,
      'Why this reading holds',
    );
    addSpread(
      'Practical guidance',
      'What to do with this reading',
      'Guidance and limits sit together so the report stays useful without overclaiming.',
      ['guidance', 'remedies', 'trust'],
      2,
      'Boundaries and next steps',
    );
  } else {
    addSpread(
      'Core synthesis',
      'Life direction and chart promise',
      'Start with the main promise, the chart-backed personality direction, and the strongest pressure or support visible right now.',
      ['focus-vedic', 'executive', 'holistic', 'planets'],
      3,
      'Primary proof',
    );
    addSpread(
      'Foundation',
      'How the chart is grounded',
      'This spread keeps the reading anchored in birth data, chart structure, and calculation confidence before the life-area pages deepen the story.',
      ['foundation', 'chart-synthesis', 'rectification'],
      2,
      'Chart grounding',
    );
    addSpread(
      'Timing',
      'Timing and current cycle',
      'This is where active periods, current motion, and near-term planning windows are condensed into one readable view.',
      ['timing', 'timeline', 'transits', 'yearly'],
      report.mode === 'PREMIUM' ? 3 : 2,
      'Timing proof',
    );
    addSpread(
      'Life areas',
      'Career, relationships, wealth, and life balance',
      'These spreads translate the chart into human outcomes instead of making the user decode technical fragments on their own.',
      ['area-career', 'area-relationship', 'area-wealth', 'area-wellbeing', 'area-spiritual'],
      report.mode === 'PREMIUM' ? 3 : 2,
      'Life-area support',
    );

    if (report.mode === 'PREMIUM') {
      addSpread(
        'Advanced Vedic',
        'Deeper chart layers and synthesis',
        'Premium keeps the advanced chart coverage, but it groups those layers into one cleaner spread before moving into appendices.',
        ['chalit', 'ashtakavarga', 'yogas', 'advanced', 'full-coverage'],
        3,
        'Advanced proof',
      );
    }

    addSpread(
      'Guidance and limits',
      'Guidance, remedies, and limits',
      'The report closes the main reading flow with practical alignment, honest limits, and only the proof that still adds value.',
      ['guidance', 'remedies', 'trust'],
      2,
      'Use this well',
    );
  }

  const remaining = plannedSections.filter(item => !used.has(item.index));
  for (const row of chunk(remaining, 2)) {
    spreads.push({
      eyebrow: report.mode === 'PREMIUM' ? 'Appendix' : 'Additional notes',
      lead: report.mode === 'PREMIUM'
        ? 'These sections are kept late so the dossier preserves depth without forcing repetition into the main reading flow.'
        : 'These extra notes stay at the end so the free report remains readable before it becomes technical.',
      proofItems: extractProofItems(row, 3),
      proofTitle: 'Supporting proof',
      sections: row,
      title: report.mode === 'PREMIUM' ? 'Appendix and supporting proof' : 'Additional chart-backed notes',
    });
  }

  return {
    onboardingCards: buildOnboardingCards(report.mode, scope),
    scope,
    showOnboarding: scope !== 'focused' || report.mode === 'PREMIUM' || sections.length > 7,
    spreads,
  };
}

function buildOnboardingCards(
  mode: PDFMode,
  scope: ReportScope,
): Array<{ body: string; eyebrow: string; title: string }> {
  return [
    {
      body: scope === 'focused'
        ? 'Go straight from the chart spread into the focused interpretation pages, then use the trust page last.'
        : 'Read the summary first, then the chart spread, then the life-area spreads before you open late proof pages.',
      eyebrow: 'Start here',
      title: 'Use the spreads in order',
    },
    {
      body: 'The PDF keeps the same sign, planet, degree, and status-mark language as the app so the charts still feel like your Kundli.',
      eyebrow: 'Charts',
      title: 'The PDF does not switch chart vocabulary',
    },
    {
      body: mode === 'PREMIUM'
        ? 'Premium keeps the deeper synthesis and timing, but the layout removes repeated scaffolding before it removes substance.'
        : 'Free still gives real insight, practical guidance, and enough chart proof to feel complete.',
      eyebrow: mode === 'PREMIUM' ? 'Premium depth' : 'Free value',
      title: mode === 'PREMIUM' ? 'Depth stays, clutter goes' : 'Free is not a teaser',
    },
    {
      body: 'Use proof pages to support decisions, not to replace context, judgment, or professional help in serious matters.',
      eyebrow: 'Boundaries',
      title: 'Keep the trust pages in mind',
    },
  ];
}

function determineReportScope(
  mode: PDFMode,
  reportFocus: PdfReportFocus,
  sectionCount: number,
): ReportScope {
  if (['KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus)) {
    return 'focused';
  }

  if (reportFocus === 'KUNDLI') {
    return sectionCount > 10 || mode === 'PREMIUM' ? 'full' : 'broad';
  }

  if (reportFocus === 'VEDIC') {
    return 'broad';
  }

  return sectionCount > 8 ? 'broad' : 'focused';
}

function classifySectionKind(section: PdfSection): string {
  const title = section.title.toLowerCase();
  const eyebrow = section.eyebrow.toUpperCase();

  if (title === 'executive summary') {
    return 'executive';
  }
  if (title === 'birth and calculation foundation') {
    return 'foundation';
  }
  if (eyebrow === 'HOLISTIC SYNTHESIS') {
    return 'holistic';
  }
  if (eyebrow === 'CHART SYNTHESIS') {
    return 'chart-synthesis';
  }
  if (eyebrow === 'PLANETS') {
    return 'planets';
  }
  if (eyebrow === 'TIMING') {
    return 'timing';
  }
  if (eyebrow === 'TIMELINE') {
    return 'timeline';
  }
  if (eyebrow === 'TRANSITS') {
    return 'transits';
  }
  if (eyebrow === 'YEARLY') {
    return 'yearly';
  }
  if (eyebrow === 'RECTIFICATION') {
    return 'rectification';
  }
  if (eyebrow === 'ASHTAKAVARGA') {
    return 'ashtakavarga';
  }
  if (eyebrow === 'YOGAS') {
    return 'yogas';
  }
  if (eyebrow === 'ADVANCED') {
    return 'advanced';
  }
  if (eyebrow === 'FULL COVERAGE') {
    return 'full-coverage';
  }
  if (eyebrow === 'CHALIT') {
    return 'chalit';
  }
  if (eyebrow === 'GUIDANCE') {
    return 'guidance';
  }
  if (eyebrow === 'REMEDIES') {
    return 'remedies';
  }
  if (eyebrow === 'TRUST') {
    return 'trust';
  }
  if (eyebrow === 'KP PREDICTA') {
    return 'focus-kp';
  }
  if (eyebrow === 'NADI') {
    return 'focus-nadi';
  }
  if (eyebrow === 'NUMEROLOGY') {
    return title.includes('synthesis') ? 'signature-numerology' : 'focus-numerology';
  }
  if (eyebrow === 'SIGNATURE') {
    return 'focus-signature';
  }
  if (eyebrow === 'SIGNATURE + NUMEROLOGY') {
    return 'signature-numerology';
  }
  if (eyebrow === 'VEDIC PREDICTA') {
    if (title.includes('career')) {
      return 'focus-career';
    }
    if (title.includes('wealth')) {
      return 'focus-wealth';
    }
    if (title.includes('marriage') || title.includes('compatibility')) {
      return 'focus-relationship';
    }
    if (title.includes('dasha')) {
      return 'focus-dasha';
    }
    if (title.includes('remedy')) {
      return 'focus-remedies';
    }
    if (title.includes('sade sati')) {
      return 'focus-sadesati';
    }
    return 'focus-vedic';
  }
  if (title === 'career') {
    return 'area-career';
  }
  if (title === 'relationship') {
    return 'area-relationship';
  }
  if (title === 'wealth') {
    return 'area-wealth';
  }
  if (title === 'wellbeing') {
    return 'area-wellbeing';
  }
  if (title === 'spiritual practice') {
    return 'area-spiritual';
  }
  if (eyebrow === 'DECISION ORACLE') {
    return 'decision';
  }

  return 'other';
}

function extractProofItems(items: PlannedSection[], maxItems: number): string[] {
  const proof = items.flatMap(item => [
    ...item.section.evidence.slice(0, 2),
    ...(item.section.decisionWindows?.slice(0, 1).map(window => `${window.label}: ${window.window}. ${window.guidance}`) ?? []),
    ...(item.section.evidenceTable?.slice(0, 1).map(row => `${row.factor}: ${row.implication}`) ?? []),
  ]);

  return uniqueStrings(proof).slice(0, maxItems);
}

function uniqueStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const item of items) {
    const key = item.trim();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
}

function buildChartCards(
  snapshots: PdfChartSnapshot[],
): Array<{ showThemeNote: boolean; snapshot: PdfChartSnapshot }> {
  const seenThemes = new Set<PdfChartSnapshot['theme']>();

  return snapshots.map(snapshot => {
    const showThemeNote = !seenThemes.has(snapshot.theme);
    seenThemes.add(snapshot.theme);

    return { showThemeNote, snapshot };
  });
}

function PdfPageHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderEyebrow}>{eyebrow}</Text>
      <Text style={styles.pageHeaderTitle}>{title}</Text>
    </View>
  );
}

function PdfCoverAtmosphere(): React.JSX.Element {
  return (
    <>
      <View fixed style={styles.coverAuroraMagenta} />
      <View fixed style={styles.coverAuroraBlue} />
      <View fixed style={styles.coverAuroraGreen} />
    </>
  );
}

function PdfWatermark({
  logoSrc,
  watermark,
}: {
  logoSrc?: string;
  watermark: string;
}): React.JSX.Element {
  if (logoSrc) {
    return <Image fixed src={logoSrc} style={styles.watermarkLogo} />;
  }

  return (
    <Text fixed style={styles.watermarkText}>
      {watermark}
    </Text>
  );
}

function PdfFooter({ subjectName }: { subjectName: string }): React.JSX.Element {
  return (
    <View fixed style={styles.footer}>
      <Text style={styles.footerLeft}>{PDF_PREPARED_BY_TEXT}</Text>
      <Text style={styles.footerCenter}>{subjectName}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        style={styles.footerRight}
      />
    </View>
  );
}

function getDocumentFontFamily(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Predicta Devanagari';
  }

  if (language === 'gu') {
    return 'Predicta Gujarati';
  }

  return 'Helvetica';
}

function getPdfTemplateCopy(
  language: SupportedLanguage,
  mode: PDFMode,
): {
  confidence: string;
  executiveSummary: string;
  readAs: string;
  reportModeLabel: string;
  summaryEyebrow: string;
  summaryLead: string;
  summaryTitle: string;
  trustLimits: string;
} {
  if (language === 'hi') {
    return {
      confidence: 'विश्वास',
      executiveSummary: 'मुख्य सारांश',
      readAs: 'इस रिपोर्ट को ऐसे पढ़ें',
      reportModeLabel: mode === 'PREMIUM' ? 'विस्तृत विश्लेषण रिपोर्ट' : 'मुफ़्त अंतर्दृष्टि रिपोर्ट',
      summaryEyebrow: 'प्रेडिक्टा सारांश',
      summaryLead:
        'सबसे पहले जीवन-दिशा, समय और मुख्य दबाव को समझें। आगे के पृष्ठ चार्ट से जुड़े रहते हैं, लेकिन पढ़ने में शांत और संपादकीय हैं।',
      summaryTitle: 'यह रिपोर्ट सबसे पहले क्या कह रही है',
      trustLimits: 'विश्वास और सीमाएँ',
    };
  }

  if (language === 'gu') {
    return {
      confidence: 'વિશ્વાસ',
      executiveSummary: 'મુખ્ય સારાંશ',
      readAs: 'આ રિપોર્ટ આ રીતે વાંચો',
      reportModeLabel: mode === 'PREMIUM' ? 'વિગતવાર વિશ્લેષણ રિપોર્ટ' : 'મફત ઇનસાઇટ રિપોર્ટ',
      summaryEyebrow: 'પ્રેડિક્ટા સારાંશ',
      summaryLead:
        'સૌથી પહેલા જીવનની દિશા, સમય અને મુખ્ય દબાણને સમજો. આગળના પાનાં ચાર્ટ સાથે જોડાયેલા રહે છે, પરંતુ વાંચવામાં શાંત અને સંપાદકીય છે.',
      summaryTitle: 'આ રિપોર્ટ સૌથી પહેલા શું કહે છે',
      trustLimits: 'વિશ્વાસ અને મર્યાદાઓ',
    };
  }

  return {
    confidence: 'Confidence',
    executiveSummary: 'Executive summary',
    readAs: 'Read this report as',
    reportModeLabel: mode === 'PREMIUM' ? 'Detailed analysis report' : 'Free insight report',
    summaryEyebrow: 'Predicta summary',
    summaryLead:
      'Start with the life direction, timing, and pressure that matter most. The spreads that follow stay rooted in the chart while keeping the reading editorial, not technical-first.',
    summaryTitle: 'What this report is saying first',
    trustLimits: 'Trust and limits',
  };
}

function resolvePdfFontPath(fileName: string): string {
  const workspaceCandidates = [
    path.join(process.cwd(), 'packages', 'pdf', 'assets', 'fonts', fileName),
    path.join(process.cwd(), '..', '..', 'packages', 'pdf', 'assets', 'fonts', fileName),
    path.join(process.cwd(), 'assets', 'fonts', fileName),
  ];
  const fontPath = workspaceCandidates.find(candidate => existsSync(candidate));

  return fontPath ?? workspaceCandidates[0];
}

function getReportSubjectName(report: PdfComposition): string {
  const subtitleMatch = /\bfor\s+(.+)$/i.exec(report.cover.subtitle);
  const candidate = subtitleMatch?.[1]?.trim();

  return candidate || report.cover.subtitle;
}

function PdfChartCard({
  birthTime,
  showThemeNote = true,
  snapshot,
}: {
  birthTime: string;
  showThemeNote?: boolean;
  snapshot: PdfChartSnapshot;
}): React.JSX.Element {
  const themePalette = getChartThemePalette(snapshot.theme);
  const chartWidth = 432;
  const chartHeight = 430;

  return (
    <View
      wrap={false}
      style={[
        styles.chartCard,
        {
          backgroundColor: themePalette.background,
          borderColor: themePalette.border,
        },
      ]}
    >
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartHeaderType}>{snapshot.chartType}</Text>
          <Text style={styles.chartHeaderTitle}>
            {snapshot.displayChartName ?? snapshot.chartName}
          </Text>
        </View>
        <Text style={styles.chartHeaderSchool}>{snapshot.school}</Text>
      </View>

      <View
        style={[
          styles.chartBoard,
          {
            backgroundColor: themePalette.panel,
            borderColor: themePalette.border,
          },
        ]}
      >
        <Svg height={chartHeight} width={chartWidth}>
          <Rect
            fill="transparent"
            height={chartHeight}
            stroke={themePalette.outline}
            strokeWidth={1}
            width={chartWidth}
            x={0}
            y={0}
          />
          <Path d={`M0 0 L${chartWidth} ${chartHeight}`} stroke={themePalette.outline} strokeWidth={1} />
          <Path d={`M${chartWidth} 0 L0 ${chartHeight}`} stroke={themePalette.outline} strokeWidth={1} />
          <Path
            d={`M${chartWidth / 2} 0 L${chartWidth} ${chartHeight / 2} L${chartWidth / 2} ${chartHeight} L0 ${chartHeight / 2} Z`}
            fill="transparent"
            stroke={themePalette.outline}
            strokeWidth={1}
          />
        </Svg>

        {snapshot.cells.map(cell => (
          <PdfChartCell
            key={cell.signNumber}
            cell={cell}
            palette={themePalette}
            boardHeight={chartHeight}
            boardWidth={chartWidth}
          />
        ))}
      </View>

      {snapshot.moonNakshatraPada ? (
        <Text style={styles.chartNote}>
          Moon: {snapshot.moonNakshatraPada.moonPhaseLabel}. Birth star:{' '}
          {snapshot.moonNakshatraPada.moonNakshatra ?? 'not available'}
          {snapshot.moonNakshatraPada.pada
            ? ` pada ${snapshot.moonNakshatraPada.pada}`
            : ''}
          .
        </Text>
      ) : null}

      {showThemeNote ? (
        <Text style={styles.chartThemeNote}>
          {describeTheme(snapshot.theme, birthTime)}
        </Text>
      ) : null}
    </View>
  );
}

function PdfChartCell({
  boardHeight,
  boardWidth,
  cell,
  palette,
}: {
  boardHeight: number;
  boardWidth: number;
  cell: PdfChartSnapshotCell;
  palette: ThemePalette;
}): React.JSX.Element {
  const point = houseLabelPoint(cell.house);
  const cellWidth = cell.labelDensity === 'stacked' ? 112 : 100;
  const rawLeft = (point.x / 100) * boardWidth - cellWidth / 2;
  const rawTop = (point.y / 100) * boardHeight - 20;
  const left = clamp(rawLeft, 8, boardWidth - cellWidth - 8);
  const top = clamp(rawTop, 8, boardHeight - 74);

  return (
    <View style={[styles.chartCell, { left, top, width: cellWidth }]}>
      <Text
        style={[
          styles.signChip,
          {
            backgroundColor: palette.accentSoft,
            borderColor: palette.accent,
          },
        ]}
      >
        {cell.signNumber} {cell.displaySignShort}
      </Text>
      {cell.planets.map(planet => (
        <Text
          key={planet.key}
          style={[
            styles.planetChip,
            {
              backgroundColor: palette.note,
              borderColor: palette.border,
              fontSize: cell.labelDensity === 'stacked' ? 6.9 : 7.4,
            },
          ]}
        >
          {planet.displayAbbreviation} {cell.showPlanetDegrees ? planet.degreeLabel : ''}
          {planet.status.retrograde ? ' R' : ''}
          {planet.status.exalted ? ' E' : ''}
          {planet.status.debilitated ? ' D' : ''}
          {planet.status.combust ? ' C' : ''}
        </Text>
      ))}
    </View>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

function getModePalette(mode: PDFMode): ThemePalette {
  if (mode === 'PREMIUM') {
    return {
      accent: '#FFC56C',
      accentSoft: '#FFF4D9',
      background: '#ECEFF4',
      border: '#E2C785',
      note: '#FFF9ED',
      outline: '#CFAF6A',
      panel: '#FFFFFF',
    };
  }

  return {
    accent: '#7BB7FF',
    accentSoft: '#EAF3FF',
    background: '#ECEFF4',
    border: '#C5D7F0',
    note: '#F6FAFF',
    outline: '#8AAAD3',
    panel: '#FFFFFF',
  };
}

function getChartThemePalette(theme: PdfChartSnapshot['theme']): ThemePalette {
  switch (theme) {
    case 'sunrise':
      return {
        accent: '#D78B35',
        accentSoft: '#FFF1D9',
        background: '#FFF7EA',
        border: '#E0C29A',
        note: '#FFFDFC',
        outline: '#C9A071',
        panel: '#FFF9F1',
      };
    case 'morning':
      return {
        accent: '#A38C2A',
        accentSoft: '#F7F1D1',
        background: '#FBF9EC',
        border: '#D6CEA3',
        note: '#FFFDFC',
        outline: '#BCAF76',
        panel: '#FFFDF6',
      };
    case 'afternoon':
      return {
        accent: '#4A78B8',
        accentSoft: '#E8F1FF',
        background: '#F5F8FD',
        border: '#CAD7EC',
        note: '#FFFFFF',
        outline: '#A8BAD7',
        panel: '#FAFCFF',
      };
    case 'sunset':
      return {
        accent: '#C87457',
        accentSoft: '#FBE7DF',
        background: '#FFF4F0',
        border: '#E4C1B6',
        note: '#FFFFFF',
        outline: '#C89A8B',
        panel: '#FFF8F5',
      };
    case 'night':
    case 'unknown':
    default:
      return {
        accent: '#5A76B3',
        accentSoft: '#EAF0FF',
        background: '#F4F6FB',
        border: '#CDD5E6',
        note: '#FFFFFF',
        outline: '#A6B1C8',
        panel: '#FAFBFE',
      };
  }
}

function houseLabelPoint(house?: number): { x: number; y: number } {
  const points: Record<number, { x: number; y: number }> = {
    1: { x: 50, y: 18 },
    2: { x: 25, y: 14 },
    3: { x: 11, y: 31 },
    4: { x: 25, y: 50 },
    5: { x: 11, y: 69 },
    6: { x: 25, y: 86 },
    7: { x: 50, y: 82 },
    8: { x: 75, y: 86 },
    9: { x: 89, y: 69 },
    10: { x: 75, y: 50 },
    11: { x: 89, y: 31 },
    12: { x: 75, y: 14 },
  };

  return points[house ?? 1] ?? points[1];
}

function describeTheme(theme: PdfChartSnapshot['theme'], birthTime: string): string {
  const timeLine = birthTime ? `Born at ${birthTime}. ` : '';

  switch (theme) {
    case 'sunrise':
      return `${timeLine}This sunrise palette reflects an early-day birth window and keeps the chart feeling like first light, beginnings, and activation.`;
    case 'morning':
      return `${timeLine}This day palette reflects a clear daylight birth window and keeps the chart bright, steady, and readable.`;
    case 'afternoon':
      return `${timeLine}This afternoon palette reflects a high-day birth window with a clearer, cooler chart atmosphere.`;
    case 'sunset':
      return `${timeLine}This sunset palette reflects an evening birth window, so the chart carries a warmer dusk tone.`;
    case 'night':
      return `${timeLine}This night palette reflects a later birth window, giving the chart a darker, more reflective tone.`;
    default:
      return 'This chart uses Predicta’s neutral chart palette because the birth-time window could not be classified cleanly.';
  }
}

function buildThemeFunFact(
  theme: PdfChartSnapshot['theme'],
  birthTime: string,
): string {
  const timeLine = birthTime ? `Because you were born at ${birthTime}, ` : '';

  switch (theme) {
    case 'sunrise':
      return `${timeLine}Predicta keeps the chart in a sunrise hue to echo first-light momentum and beginnings.`;
    case 'morning':
      return `${timeLine}Predicta keeps the chart in a daylight hue so the reading feels open, steady, and easy to track.`;
    case 'afternoon':
      return `${timeLine}Predicta keeps the chart in an afternoon hue to mirror a brighter high-day atmosphere.`;
    case 'sunset':
      return `${timeLine}Predicta keeps the chart in a sunset hue so the PDF carries a warmer dusk character.`;
    case 'night':
      return `${timeLine}Predicta keeps the chart in a night hue to reflect a quieter and more reflective birth window.`;
    default:
      return 'Predicta keeps a neutral chart hue when the birth-time window cannot be classified cleanly.';
  }
}
