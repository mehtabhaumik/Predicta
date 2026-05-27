import { getNativeCopy } from '@pridicta/config';
import { existsSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import {
  Circle,
  Document,
  type DocumentProps,
  Font,
  Image,
  Line,
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
  type PdfHouseWisePlanetRow,
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
  watermarkSrc?: string;
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
    panel: '#FDFCF8',
  },
  watermark: {
    opacity: 0.032,
    textOpacity: 0.055,
  },
} as const;

Font.register({
  family: 'Predicta Editorial Display',
  fonts: [
    {
      src: resolvePdfFontPath('CormorantGaramond-SemiBold.ttf'),
      fontWeight: 600,
    },
    {
      src: resolvePdfFontPath('CormorantGaramond-Bold.ttf'),
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: 'Predicta Editorial Body',
  fonts: [
    {
      src: resolvePdfFontPath('SourceSerif4-Regular.ttf'),
      fontWeight: 400,
    },
    {
      src: resolvePdfFontPath('SourceSerif4-SemiBold.ttf'),
      fontWeight: 600,
    },
    {
      src: resolvePdfFontPath('SourceSerif4-Bold.ttf'),
      fontWeight: 700,
    },
  ],
});

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
    fontFamily: 'Predicta Editorial Body',
    fontSize: 11,
    paddingBottom: 62,
    paddingHorizontal: 34,
    paddingTop: 38,
  },
  coverPage: {
    backgroundColor: PDF_PAGE_TEMPLATES.cover.background,
    color: '#F8FBFF',
    fontFamily: 'Predicta Editorial Body',
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
    marginBottom: 24,
  },
  coverLogo: {
    height: 42,
    width: 42,
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
    color: '#F7F1E3',
    fontSize: 18,
    fontWeight: 900,
    letterSpacing: 3.8,
    marginBottom: 6,
  },
  coverTitle: {
    color: '#F9F4E8',
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1.05,
    marginBottom: 14,
  },
  coverSubtitle: {
    color: '#D4DEEF',
    fontSize: 11,
    lineHeight: 1.55,
    marginBottom: 10,
  },
  coverDescriptor: {
    color: '#F4E7C8',
    fontSize: 12,
    letterSpacing: 1.1,
    lineHeight: 1.4,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  coverHeroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  coverHeroCopy: {
    width: '59%',
  },
  coverSealWrap: {
    alignItems: 'center',
    height: 220,
    justifyContent: 'center',
    width: '38%',
  },
  coverDetailBlock: {
    marginBottom: 18,
    width: '100%',
  },
  coverDetailRow: {
    borderBottomColor: '#C8A96A',
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    paddingVertical: 9,
  },
  coverDetailLabel: {
    color: '#C8A96A',
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    width: '25%',
  },
  coverDetailValue: {
    color: '#F7F1E3',
    fontSize: 12,
    lineHeight: 1.35,
    width: '75%',
  },
  coverSignatureRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  coverSignaturePill: {
    borderColor: '#C8A96A',
    borderRadius: 999,
    borderWidth: 0.7,
    color: '#F8EBCB',
    fontSize: 9.5,
    letterSpacing: 0.4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  coverPreparationLine: {
    borderLeftColor: '#C8A96A',
    borderLeftWidth: 1,
    color: '#D4DEEF',
    fontSize: 10.5,
    lineHeight: 1.45,
    paddingLeft: 10,
    width: '72%',
  },
  coverReportType: {
    color: '#F8EBCB',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  pageHeader: {
    alignItems: 'center',
    borderBottomColor: '#D9D1BF',
    borderBottomWidth: 0.7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    paddingBottom: 10,
  },
  pageHeaderEyebrow: {
    color: '#6F7481',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  pageHeaderTitle: {
    color: '#262A36',
    fontSize: 10,
    fontWeight: 700,
  },
  pageTitle: {
    fontSize: 23,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 10,
  },
  pageLead: {
    color: '#5B6677',
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
    color: '#7A7467',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  panelBody: {
    color: '#465166',
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
    color: '#2F3440',
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
    color: '#7A7467',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  cardText: {
    color: '#202532',
    fontSize: 10.5,
    lineHeight: 1.55,
  },
  cardSubtext: {
    color: '#5B6677',
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
    color: '#3D4658',
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
    color: '#4F5A6E',
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  confidenceChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    color: '#303542',
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
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    width: '100%',
  },
  chartHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartHeaderType: {
    color: '#7A7467',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chartHeaderTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 2,
  },
  chartHeaderSchool: {
    color: '#7A7467',
    fontSize: 8.5,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  chartBoard: {
    borderRadius: 16,
    borderWidth: 1,
    height: 450,
    marginBottom: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  chartFloatingChip: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'absolute',
    textAlign: 'center',
  },
  signChip: {
    color: '#2F3440',
    fontSize: 7.2,
    fontWeight: 800,
    textAlign: 'center',
  },
  planetChip: {
    color: '#2F3440',
    fontSize: 6.6,
    fontWeight: 700,
    textAlign: 'center',
  },
  nodePlanetChip: {
    backgroundColor: '#EEF3F6',
    borderColor: '#7A8C99',
    color: '#24313F',
  },
  moonPhaseRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  moonPhaseLabel: {
    color: '#5B6677',
    fontSize: 8.8,
    lineHeight: 1.35,
  },
  chartNote: {
    color: '#5B6677',
    fontSize: 9.5,
    lineHeight: 1.55,
    marginBottom: 8,
  },
  chartThemeNote: {
    color: '#3E4658',
    fontSize: 8.6,
    lineHeight: 1.5,
  },
  placementTable: {
    borderColor: '#D4C39A',
    borderRadius: 16,
    borderWidth: 0.8,
    overflow: 'hidden',
  },
  placementTableHeader: {
    backgroundColor: '#EEE7D8',
    borderBottomColor: '#D4C39A',
    borderBottomWidth: 0.6,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  placementTableRow: {
    borderBottomColor: '#E3DDCE',
    borderBottomWidth: 0.45,
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  placementTableHeaderCell: {
    color: '#776A54',
    fontSize: 6,
    fontWeight: 800,
    letterSpacing: 0.4,
    lineHeight: 1.25,
    textTransform: 'uppercase',
  },
  placementTableCell: {
    color: '#2E3442',
    fontSize: 7.2,
    lineHeight: 1.25,
  },
  placementGrahaCell: {
    fontWeight: 800,
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
  coverFooter: {
    borderTopColor: 'rgba(248, 235, 203, 0.42)',
    color: '#DDE5F4',
  },
  watermarkLogo: {
    height: 188,
    left: '50%',
    marginLeft: -94,
    opacity: PDF_PAGE_TEMPLATES.watermark.opacity,
    position: 'absolute',
    top: '37%',
    width: 188,
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
    borderWidth: 0.8,
    marginBottom: 10,
    padding: 12,
  },
  sectionStack: {
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 0.8,
    marginBottom: 10,
    padding: 14,
  },
  sectionCardEyebrow: {
    color: '#7A7467',
    fontSize: 8.2,
    fontWeight: 700,
    letterSpacing: 1,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  sectionCardTitle: {
    color: '#202532',
    fontSize: 13.5,
    fontWeight: 700,
    lineHeight: 1.35,
    marginBottom: 7,
  },
  sectionCardBody: {
    color: '#465166',
    fontSize: 9.8,
    lineHeight: 1.58,
  },
  sectionBulletList: {
    marginTop: 9,
  },
  sectionBullet: {
    color: '#3D4658',
    fontSize: 9.3,
    lineHeight: 1.45,
    marginBottom: 5,
  },
  closingTitle: {
    fontSize: 27,
    fontWeight: 700,
    lineHeight: 1.25,
    marginBottom: 12,
  },
  closingBody: {
    color: '#465166',
    fontSize: 12,
    lineHeight: 1.7,
    marginBottom: 14,
  },
  evidenceTable: {
    borderColor: '#DED6C7',
    borderRadius: 12,
    borderWidth: 0.6,
    marginTop: 10,
    overflow: 'hidden',
  },
  evidenceTableHeader: {
    backgroundColor: '#EFE9DC',
    borderBottomColor: '#D8CDBA',
    borderBottomWidth: 0.6,
    flexDirection: 'row',
    minHeight: 24,
  },
  evidenceTableRow: {
    backgroundColor: '#FDFBF6',
    borderBottomColor: '#E8E1D4',
    borderBottomWidth: 0.4,
    flexDirection: 'row',
    minHeight: 34,
  },
  evidenceTableHeaderCell: {
    color: '#6F6657',
    fontSize: 7.6,
    fontWeight: 700,
    letterSpacing: 0.6,
    lineHeight: 1.35,
    paddingHorizontal: 7,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  evidenceTableCell: {
    color: '#384154',
    fontSize: 8.1,
    lineHeight: 1.45,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },
  evidenceTableCellWide: {
    width: '40%',
  },
  evidenceTableCellNarrow: {
    width: '20%',
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
  const chartMeaningSpreads = plannedSpreads.spreads.filter(spread =>
    spread.sections.some(item => item.section.eyebrow === 'CORE CHARTS FIRST'),
  );
  const narrativeSpreads = plannedSpreads.spreads.filter(
    spread => !spread.sections.some(item => item.section.eyebrow === 'CORE CHARTS FIRST'),
  );
  const chartCards = buildChartCards(report.chartSnapshots);
  const chartRows = chunk(chartCards, 1);
  const subjectName = getReportSubjectName(report);
  const documentFontFamily = getDocumentFontFamily(report.language);
  const displayTextStyle = getDisplayTextStyle(report.language);
  const templateCopy = getPdfTemplateCopy(report.language, report.mode);
  const lifeAtlasFinalLetter =
    reportFocus === 'LIFE_ATLAS'
      ? sections.find(section => section.title === 'Final Letter From Predicta')
      : undefined;
  // Phase 4 legacy gate anchor: <PdfWatermark logoSrc={options.logoSrc} watermark={report.watermark} />
  // Phase 4A legacy gate anchor: <PdfEvidenceTable rows={item.section.evidenceTable.slice(0, 4)} />

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
        <PdfWatermark logoSrc={options.watermarkSrc ?? options.logoSrc} watermark={report.watermark} />
        <PdfCoverFooter subjectName={subjectName} />
        <View style={styles.coverTopRow}>
          {options.logoSrc ? (
            <Image src={options.logoSrc} style={styles.coverLogo} />
          ) : (
            <Text style={[styles.coverWordmark, { marginBottom: 0 }]}>
              PREDICTA
            </Text>
          )}
          <View
            style={[
              styles.coverBadge,
              {
                backgroundColor: 'transparent',
                borderColor: '#C8A96A',
                color: '#F8EBCB',
                marginBottom: 0,
              },
            ]}
          >
            <Text>{report.cover.reportType}</Text>
          </View>
        </View>

        <View style={styles.coverHeroRow}>
          <View style={styles.coverHeroCopy}>
            <Text style={styles.coverWordmark}>PREDICTA</Text>
            <Text style={styles.coverReportType}>{report.cover.reportType}</Text>
            <Text style={[styles.coverTitle, displayTextStyle]}>
              {report.cover.subjectName}
            </Text>
            <Text style={styles.coverDescriptor}>{report.cover.descriptor}</Text>
            <Text style={styles.coverSubtitle}>{report.cover.subtitle}</Text>
          </View>
          <View style={styles.coverSealWrap}>
            <PdfCelestialSeal />
          </View>
        </View>

        <View style={styles.coverDetailBlock}>
          <View style={styles.coverDetailRow}>
            <Text style={styles.coverDetailLabel}>Date of birth</Text>
            <Text style={styles.coverDetailValue}>{report.cover.dateOfBirth}</Text>
          </View>
          <View style={styles.coverDetailRow}>
            <Text style={styles.coverDetailLabel}>Birth time</Text>
            <Text style={styles.coverDetailValue}>{report.cover.birthTime}</Text>
          </View>
          <View style={styles.coverDetailRow}>
            <Text style={styles.coverDetailLabel}>Birth place</Text>
            <Text style={styles.coverDetailValue}>{report.cover.birthPlace}</Text>
          </View>
        </View>

        <View style={styles.coverSignatureRow}>
          {report.cover.birthMomentSignature.map(item => (
            <Text key={item} style={styles.coverSignaturePill}>
              {item}
            </Text>
          ))}
        </View>

        <Text style={styles.coverPreparationLine}>{report.cover.preparationLine}</Text>
      </Page>

      <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
        <PdfWatermark logoSrc={options.watermarkSrc ?? options.logoSrc} watermark={report.watermark} />
        <PdfFooter subjectName={subjectName} />
        <PdfPageHeader
          eyebrow={templateCopy.summaryEyebrow}
          title={
            reportFocus === 'LIFE_ATLAS'
              ? 'Personal life map'
              : reportFocus === 'KP'
                ? 'KP event answer'
                : reportFocus === 'NUMEROLOGY'
                  ? 'Number identity'
                : templateCopy.reportModeLabel
          }
        />
        <Text style={[styles.pageTitle, displayTextStyle]}>
          {reportFocus === 'LIFE_ATLAS'
            ? 'Your Life Atlas begins here'
            : reportFocus === 'KP'
              ? 'Your KP verdict comes first'
              : reportFocus === 'NUMEROLOGY'
                ? 'Your Number Signature comes first'
              : templateCopy.summaryTitle}
        </Text>
        <Text style={styles.pageLead}>
          {reportFocus === 'LIFE_ATLAS'
            ? 'Start with the hidden thread, current chapter, and life invitation. This report is meant to feel like a personal mirror, not a technical proof file.'
            : reportFocus === 'KP'
              ? 'Start with the event verdict, then read the KP cusp chart, significators, ruling planets, and timing proof. This report stays KP-only and does not become a Vedic chart reading.'
              : reportFocus === 'NUMEROLOGY'
                ? 'Start with the Number Signature, name rhythm, birth code, current cycle, and missing/repeated number grid. This report stays Numerology-only and does not become a Kundli chart report.'
            : templateCopy.summaryLead}
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
          <Text style={[styles.panelTitle, displayTextStyle]}>{report.executiveSummary.headline}</Text>
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
                backgroundColor: '#FDFCF8',
                borderColor: '#D6DDE9',
              },
            ]}
          >
            <Text style={styles.cardLabel}>{templateCopy.confidence}</Text>
            <Text style={[styles.cardText, displayTextStyle]}>{report.trustProfile.confidenceLabel}</Text>
            <Text style={styles.cardSubtext}>{report.trustProfile.summary}</Text>
          </View>
          <View
            style={[
              styles.halfCard,
              {
                backgroundColor: '#FDFCF8',
                borderColor: '#D6DDE9',
              },
            ]}
          >
            <Text style={styles.cardLabel}>{templateCopy.readAs}</Text>
            <Text style={[styles.cardText, displayTextStyle]}>
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

        {reportFocus === 'LIFE_ATLAS' ? null : (
          <View
            style={[
              styles.noteRow,
              {
                backgroundColor: '#FDFCF8',
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
        )}
      </Page>

      {plannedSpreads.showOnboarding ? (
        <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
          <PdfWatermark logoSrc={options.watermarkSrc ?? options.logoSrc} watermark={report.watermark} />
          <PdfFooter subjectName={subjectName} />
          <PdfPageHeader
            eyebrow={report.mode === 'PREMIUM' ? 'How to use this dossier' : 'How to use this report'}
            title={
              reportFocus === 'LIFE_ATLAS'
                ? 'Life Atlas guide'
                : plannedSpreads.scope === 'focused'
                  ? 'Focused reading guide'
                  : 'Reading guide'
            }
          />
          <Text style={[styles.pageTitle, displayTextStyle]}>
            {reportFocus === 'LIFE_ATLAS'
              ? 'How to carry this Life Atlas'
              : report.mode === 'PREMIUM'
                ? 'How to use this dossier'
                : 'How to read this report'}
          </Text>
          <Text style={styles.pageLead}>
            {reportFocus === 'LIFE_ATLAS'
              ? 'Read it like a personal mirror: begin with the soul portrait, notice the repeated life thread, choose one practice, and return to the closing letter when you need steadiness.'
              : plannedSpreads.scope === 'focused'
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
                    backgroundColor: '#FDFCF8',
                    borderColor: '#D6DDE9',
                  },
                ]}
              >
                <Text style={styles.cardLabel}>{card.eyebrow}</Text>
                <Text style={[styles.cardText, displayTextStyle]}>{card.title}</Text>
                <Text style={styles.cardSubtext}>{card.body}</Text>
              </View>
            ))}
          </View>
          {reportFocus === 'LIFE_ATLAS' ? (
            <View
              style={[
                styles.noteRow,
                {
                  backgroundColor: '#FDFCF8',
                  borderColor: '#D6DDE9',
                },
              ]}
            >
              <Text style={styles.cardLabel}>Before you begin</Text>
              {[
                'Read for recognition first, then action. The most useful line is the one that changes a real choice.',
                'The report stays mystical in tone, but it does not claim fixed fate, hidden archives, or impossible certainty.',
                'If a sentence feels true, test it gently in the next seven days instead of turning it into pressure.',
              ].map(item => (
                <Text key={item} style={styles.evidenceText}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </Page>
      ) : null}

      {chartRows.map((row, rowIndex) => (
        <Page key={`charts-${rowIndex}`} size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
          <PdfWatermark logoSrc={options.watermarkSrc ?? options.logoSrc} watermark={report.watermark} />
          <PdfFooter subjectName={subjectName} />
          <PdfPageHeader
            eyebrow={
              reportFocus === 'KP'
                ? 'KP chart'
                : reportFocus === 'NADI'
                  ? 'Nadi chart'
                  : 'Chart proof'
            }
            title={
              reportFocus === 'KP'
                ? 'KP Bhav Chalit cusp chart'
                : reportFocus === 'NADI'
                  ? 'Nadi story anchor chart'
                : report.mode === 'PREMIUM'
                  ? 'Chart spread'
                  : 'Charts in your report'
            }
          />
          <View style={styles.chartRow}>
            {row.map(snapshot => (
              <PdfChartCard
                key={`${snapshot.snapshot.chartRole}-${snapshot.snapshot.chartName}`}
                birthTime={report.cover.metadata[0] ?? ''}
                showThemeNote={snapshot.showThemeNote}
                snapshot={snapshot.snapshot}
              />
            ))}
          </View>
        </Page>
      ))}

      {chartMeaningSpreads.map((spread, index) => (
        <PdfReportSpreadPage
          key={`${spread.eyebrow}-${spread.title}-${index}`}
          displayTextStyle={displayTextStyle}
          documentFontFamily={documentFontFamily}
          logoSrc={options.watermarkSrc ?? options.logoSrc}
          mode={report.mode}
          palette={palette}
          spread={spread}
          subjectName={subjectName}
          watermark={report.watermark}
        />
      ))}

      {report.houseWisePlanetRows.length ? (
        <PdfHouseWisePlanetTablePage
          displayTextStyle={displayTextStyle}
          documentFontFamily={documentFontFamily}
          logoSrc={options.watermarkSrc ?? options.logoSrc}
          rows={report.houseWisePlanetRows}
          subjectName={subjectName}
          watermark={report.watermark}
        />
      ) : null}

      {narrativeSpreads.map((spread, index) => (
        <PdfReportSpreadPage
          key={`${spread.eyebrow}-${spread.title}-${index}`}
          displayTextStyle={displayTextStyle}
          documentFontFamily={documentFontFamily}
          logoSrc={options.watermarkSrc ?? options.logoSrc}
          mode={report.mode}
          palette={palette}
          spread={spread}
          subjectName={subjectName}
          watermark={report.watermark}
        />
      ))}

      <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
        <PdfWatermark logoSrc={options.watermarkSrc ?? options.logoSrc} watermark={report.watermark} />
        <PdfFooter subjectName={subjectName} />
        <PdfPageHeader
          eyebrow={
            reportFocus === 'LIFE_ATLAS'
              ? 'Final integration'
              : report.mode === 'PREMIUM'
                ? 'Close the dossier well'
                : 'Use the report well'
          }
          title={
            reportFocus === 'LIFE_ATLAS'
              ? 'Carry the Life Atlas gently'
              : report.mode === 'PREMIUM'
                ? 'Next steps'
                : 'What to do next'
          }
        />
        <Text style={[styles.closingTitle, displayTextStyle]}>
          {reportFocus === 'LIFE_ATLAS'
            ? 'Use this Life Atlas as a mirror for alignment, not as a cage around your future.'
            : report.mode === 'PREMIUM'
            ? 'Use this dossier as a planning instrument, not as a one-line fate statement.'
            : reportFocus === 'NUMEROLOGY'
              ? 'Use this Number Identity Dossier as a practical rhythm map, not as a fear score.'
              : 'Use this report as a real starting point, not as a teaser.'}
        </Text>
        <Text style={styles.closingBody}>
          {reportFocus === 'LIFE_ATLAS'
            ? 'Return to the hidden thread, current chapter, practices, and closing letter when life feels noisy. Predicta keeps your agency in the center: insight is useful only when it helps you choose with more honesty and calm.'
            : report.mode === 'PREMIUM'
            ? 'The premium dossier keeps the full Predicta depth, but it works best when you move from the main reading into the relevant life spreads and save proof-heavy material for the end.'
            : reportFocus === 'NUMEROLOGY'
              ? 'The free Numerology report is meant to leave you with a clear number signature, current cycle, practical guidance, and enough number evidence to understand the pattern without turning it into chart proof.'
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
          <Text style={styles.panelEyebrow}>
            {reportFocus === 'LIFE_ATLAS'
              ? 'A final note from Predicta'
              : reportFocus === 'KP'
                ? 'KP next step'
                : reportFocus === 'NUMEROLOGY'
                  ? 'Numerology next step'
                : reportFocus === 'NADI'
                  ? 'Nadi next step'
                : 'Fun chart note'}
          </Text>
          <Text style={[styles.panelTitle, displayTextStyle]}>
            {reportFocus === 'LIFE_ATLAS'
              ? 'Your life is not reduced to a report.'
              : reportFocus === 'KP'
                ? 'Ask one exact event question next.'
                : reportFocus === 'NUMEROLOGY'
                  ? 'Use the current cycle this week.'
                : reportFocus === 'NADI'
                  ? 'Answer the validation questions next.'
                : buildThemeFunFact(report.chartSnapshots[0]?.theme ?? 'unknown', report.cover.metadata[0] ?? '')}
          </Text>
          <Text style={styles.panelBody}>
            {reportFocus === 'LIFE_ATLAS'
              ? lifeAtlasFinalLetter?.body ?? 'Life Atlas is a mirror for purpose, chapter, gifts, lessons, and next direction. Keep what feels honest, test it through action, and let the reading make your choices calmer.'
              : reportFocus === 'KP'
                ? 'KP becomes strongest when the question is concrete: one event, one time window, and one outcome. The next report can then move from readiness into a sharper likely/delayed/blocked judgement.'
                : reportFocus === 'NUMEROLOGY'
                  ? 'Numerology works best when the number insight becomes a small practical choice: use the current cycle, strengthen what repeats, and practice what feels missing without turning numbers into fear.'
                : reportFocus === 'NADI'
                  ? 'Nadi becomes strongest when the story is validated through real recognition. Answer the validation questions, notice which pattern repeats in life, and then ask Predicta to deepen only the thread that feels true.'
                : 'Predicta keeps the same time-of-day chart atmosphere in the PDF so the document still feels like your Kundli, not like a disconnected export.'}
          </Text>
        </View>
        <View
          style={[
            styles.noteRow,
            {
              backgroundColor: '#FDFCF8',
              borderColor: '#D6DDE9',
            },
          ]}
        >
          <Text style={styles.cardLabel}>
            {reportFocus === 'LIFE_ATLAS' ? 'Use it this week' : 'Keep in mind'}
          </Text>
          {reportFocus === 'LIFE_ATLAS'
            ? [
                'Return to the hidden thread before reacting to familiar pressure.',
                'Choose one cleaner response and repeat it for seven days.',
                'Use the closing letter as a compass, not a fixed verdict.',
              ].map(item => (
                <Text key={item} style={styles.evidenceText}>
                  • {item}
                </Text>
              ))
            : report.trustProfile.limitations.slice(0, 3).map(item => (
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
  const isLifeAtlas = reportFocus === 'LIFE_ATLAS';
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

  if (isLifeAtlas) {
    addSpread(
      'Life Atlas',
      'Personal snapshot and soul portrait',
      'Begin with the cleanest overview: the life pattern, current weather, and the soul portrait that makes the rest of the atlas personal.',
      ['life-atlas-snapshot', 'life-atlas-portrait'],
      2,
      'Life mirror',
    );
    addSpread(
      'Life strategy',
      'Purpose and strategic abstract',
      'This spread turns the mystical reading into a usable map: why this life keeps repeating certain themes and what the wiser strategy looks like.',
      ['life-atlas-strategy', 'life-atlas-purpose'],
      2,
      'Purpose map',
    );
    addSpread(
      'Life journey',
      'Journey arc and current chapter',
      'Your arc is read as a living path: early imprint, current chapter, and the repeated invitation underneath pressure.',
      ['life-atlas-arc', 'life-atlas-current'],
      2,
      'Life arc',
    );
    addSpread(
      'Destiny pattern',
      'The direction life keeps returning to',
      'Destiny is treated as a pattern of growth, not a fixed sentence. This page names the direction and the places where alignment becomes practical.',
      ['life-atlas-destiny', 'life-atlas-areas'],
      2,
      'Living direction',
    );
    addSpread(
      'Gifts and lessons',
      'The strengths and classrooms you carry',
      'The Life Atlas becomes useful when it names both the gifts you carry and the lessons that keep asking for a wiser response.',
      ['life-atlas-gifts', 'life-atlas-lessons'],
      2,
      'Gifts into practice',
    );
    addSpread(
      'Shadow map',
      'From shadow to gift',
      'Premium names the exact conversion path: where pressure, sensitivity, ambition, and repetition become trained strengths instead of repeating loops.',
      ['life-atlas-shadow'],
      1,
      'Transformation map',
    );
    addSpread(
      'Premium life chapters',
      'Relationship, work, money, and mission',
      'Premium adds focused life chapters that stay non-technical but become more precise about where the Life Atlas should change daily choices.',
      ['life-atlas-relationship', 'life-atlas-mission'],
      2,
      'Premium application',
    );
    addSpread(
      'Hidden thread',
      'What life keeps asking from you',
      'This is the memorable through-line: the one pattern that connects separate life areas and turns the report into a usable compass.',
      ['life-atlas-hidden'],
      1,
      'Direction',
    );
    addSpread(
      'Future direction',
      'What life is guiding you toward',
      'Future language stays hopeful, grounded, and practical: it points toward alignment without pretending life is fixed.',
      ['life-atlas-next'],
      2,
      'Next direction',
    );
    addSpread(
      'Integration',
      'Practices and integration',
      'Close the main reading with small actions and clear agency so the Life Atlas becomes lived instead of merely admired.',
      ['life-atlas-practices'],
      2,
      'Carry it well',
    );
  } else if (reportFocus === 'NUMEROLOGY') {
    addSpread(
      'Number identity',
      'Your Number Signature',
      'Start with the number mandala, life theme sentence, and current cycle. This is the Numerology wow moment, not a chart proof page.',
      ['numerology-signature'],
      1,
      'Number mandala',
    );
    addSpread(
      'Name and birth code',
      'Name rhythm, birth code, and destiny direction',
      'This spread turns the name number, birth number, and destiny number into practical identity guidance instead of definitions.',
      ['numerology-name', 'numerology-birth'],
      2,
      'Number evidence',
    );
    addSpread(
      'Cycle and pattern grid',
      'Current cycle and missing/repeated numbers',
      'Numerology becomes useful when the user knows what to lean into now and what number patterns need conscious practice.',
      ['numerology-cycle', 'numerology-grid'],
      2,
      'Number rhythm',
    );
    addSpread(
      'Practical numerology',
      'Strengths, cautions, and life areas',
      'This spread keeps the reading focused on choices: work, relationships, money, self-expression, and the next action.',
      ['numerology-life-areas'],
      1,
      'Practical guidance',
    );
    if (report.mode === 'PREMIUM') {
      addSpread(
        'Premium numerology',
        'Name fit, compatibility, and timing map',
        'Premium adds refinement, comparison, supportive tools, and a full personal-year timeline while staying Numerology-only.',
        ['numerology-premium', 'numerology-timeline'],
        3,
        'Premium number proof',
      );
    }
    addSpread(
      'Number boundary',
      'What Numerology can and cannot claim',
      'Keep method boundaries late and concise: useful guidance, no fear tactics, no chart mixing, and no guaranteed outcomes.',
      ['numerology-boundary'],
      1,
      'Boundary',
    );
  } else if (isFocusedRoom) {
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
      'Chart meaning',
      'What the focus charts say about you',
      'Read this immediately after the chart plates. Each focus chart gets a plain-language prediction before the report moves into tables and proof.',
      ['chart-synthesis'],
      1,
      'Chart evidence',
    );
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

  const remaining = plannedSections.filter(item => {
    if (used.has(item.index)) {
      return false;
    }
    if (isLifeAtlas && classifySectionKind(item.planning) === 'life-atlas-letter') {
      return false;
    }
    return true;
  });
  for (const row of chunk(remaining, 2)) {
    const rowTitle = row
      .map(item => item.section.title)
      .filter(Boolean)
      .join(' + ');

    spreads.push({
      eyebrow: isLifeAtlas
        ? 'Life Atlas continuation'
        : isFocusedRoom
          ? 'Method proof'
        : report.mode === 'PREMIUM'
          ? 'Appendix'
          : 'Classical proof',
      lead: isLifeAtlas
        ? 'These remaining Life Atlas notes continue the human reading without turning it into technical proof.'
        : isFocusedRoom
          ? 'These proof pages stay inside the selected school and keep technical material after the main answer.'
        : report.mode === 'PREMIUM'
          ? 'These sections are kept late so the dossier preserves depth without forcing repetition into the main reading flow.'
          : 'These proof layers stay late so the free report remains readable before it becomes technical.',
      proofItems: extractProofItems(row, 3),
      proofTitle: isLifeAtlas ? 'Supporting meaning' : isFocusedRoom ? 'Method support' : 'Supporting proof',
      sections: row,
      title: rowTitle || (isLifeAtlas
        ? 'Additional Life Atlas guidance'
        : isFocusedRoom
          ? 'Method proof appendix'
        : report.mode === 'PREMIUM'
          ? 'Appendix and supporting proof'
          : 'Classical supporting proof'),
    });
  }

  return {
    onboardingCards: buildOnboardingCards(report.mode, scope, reportFocus),
    scope,
    showOnboarding: scope !== 'focused' || report.mode === 'PREMIUM' || sections.length > 7,
    spreads,
  };
}

function buildOnboardingCards(
  mode: PDFMode,
  scope: ReportScope,
  reportFocus: PdfReportFocus,
): Array<{ body: string; eyebrow: string; title: string }> {
	  if (reportFocus === 'LIFE_ATLAS') {
	    return [
	      {
	        body: 'Read this as a personal life story. Start with the soul portrait, then move through purpose, life journey, gifts, lessons, and the hidden thread.',
	        eyebrow: 'Start here',
	        title: 'Begin with the soul portrait',
	      },
	      {
	        body: 'The reading uses Predicta intelligence quietly in the background, but the pages speak in human language: what life is asking from you and how to respond.',
	        eyebrow: 'Tone',
	        title: 'Human first, proof later',
	      },
	      {
	        body: mode === 'PREMIUM'
	          ? 'Premium adds deeper life narrative, karmic pattern map, integration practices, and a more personal closing letter.'
	          : 'Free gives a real soul portrait, current chapter, gifts, lessons, hidden thread, practices, and a closing letter.',
	        eyebrow: mode === 'PREMIUM' ? 'Premium depth' : 'Free value',
	        title: mode === 'PREMIUM' ? 'Depth without fatalism' : 'Complete enough to matter',
	      },
	      {
	        body: 'Mystical language stays grounded. The report should open possibility, not trap you inside fear, fate, or impossible certainty.',
	        eyebrow: 'Agency',
	        title: 'Mirror, not cage',
	      },
	    ];
	  }

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
  // Life Atlas is the approved synthesis path.
  if (reportFocus === 'LIFE_ATLAS') {
    return mode === 'PREMIUM' || sectionCount > 10 ? 'full' : 'broad';
  }

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
  if (eyebrow === 'CORE CHARTS FIRST') {
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
    if (title.includes('number signature')) {
      return 'numerology-signature';
    }
    if (title.includes('name rhythm')) {
      return 'numerology-name';
    }
    if (title.includes('birth code')) {
      return 'numerology-birth';
    }
    if (title.includes('current cycle')) {
      return 'numerology-cycle';
    }
    if (title.includes('missing') || title.includes('repeated')) {
      return 'numerology-grid';
    }
    if (title.includes('strengths') || title.includes('life areas')) {
      return 'numerology-life-areas';
    }
    if (title.includes('timeline')) {
      return 'numerology-timeline';
    }
    if (title.includes('fit') || title.includes('compatibility') || title.includes('toolkit')) {
      return 'numerology-premium';
    }
    if (title.includes('boundary') || title.includes('appendix')) {
      return 'numerology-boundary';
    }
    return title.includes('synthesis') ? 'signature-numerology' : 'focus-numerology';
  }
  if (eyebrow === 'SIGNATURE') {
    return 'focus-signature';
  }
  if (eyebrow === 'SIGNATURE + NUMEROLOGY') {
    return 'signature-numerology';
  }
  if (eyebrow === 'LIFE ATLAS') {
    if (title.includes('personal snapshot')) {
      return 'life-atlas-snapshot';
    }
    if (title.includes('strategic')) {
      return 'life-atlas-strategy';
    }
    if (title.includes('opening') || title.includes('soul portrait')) {
      return 'life-atlas-portrait';
    }
    if (title.includes('why you came')) {
      return 'life-atlas-purpose';
    }
    if (title.includes('journey')) {
      return 'life-atlas-arc';
    }
    if (title.includes('destiny')) {
      return 'life-atlas-destiny';
    }
    if (title.includes('current')) {
      return 'life-atlas-current';
    }
    if (title.includes('gifts')) {
      return 'life-atlas-gifts';
    }
    if (title.includes('shadow')) {
      return 'life-atlas-shadow';
    }
    if (title.includes('lessons')) {
      return 'life-atlas-lessons';
    }
    if (title.includes('relationship')) {
      return 'life-atlas-relationship';
    }
    if (title.includes('mission') || title.includes('blueprint')) {
      return 'life-atlas-mission';
    }
    if (title.includes('love') || title.includes('work') || title.includes('money')) {
      return 'life-atlas-areas';
    }
    if (title.includes('hidden thread')) {
      return 'life-atlas-hidden';
    }
    if (title.includes('next') || title.includes('intended')) {
      return 'life-atlas-next';
    }
    if (title.includes('practices') || title.includes('integration')) {
      return 'life-atlas-practices';
    }
    if (title.includes('letter')) {
      return 'life-atlas-letter';
    }
    return 'life-atlas-core';
  }
  if (eyebrow === 'LIFE ATLAS APPENDIX' || eyebrow === 'LIFE ATLAS TRUST') {
    return 'life-atlas-trust';
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

  return uniqueStrings(proof).slice(0, maxItems).map(item => compactProofText(item));
}

function compactProofText(value: string): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  const maxLength = 155;

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}...`;
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

function PdfReportSpreadPage({
  displayTextStyle,
  documentFontFamily,
  logoSrc,
  mode,
  palette,
  spread,
  subjectName,
  watermark,
}: {
  displayTextStyle: { fontFamily?: string };
  documentFontFamily: string;
  logoSrc?: string;
  mode: PDFMode;
  palette: ThemePalette;
  spread: PlannedSpread;
  subjectName: string;
  watermark: string;
}): React.JSX.Element {
  return (
    <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
      <PdfWatermark logoSrc={logoSrc} watermark={watermark} />
      <PdfFooter subjectName={subjectName} />
      <PdfPageHeader
        eyebrow={spread.eyebrow}
        title={mode === 'PREMIUM' ? 'Premium analysis spread' : 'Insight spread'}
      />
      <Text style={[styles.pageTitle, displayTextStyle]}>{spread.title}</Text>
      <Text style={styles.pageLead}>{spread.lead}</Text>

      <View style={styles.sectionStack}>
        {spread.sections.map(item => {
          const section = prepareSectionForPdfCard(item.section, mode);

          return (
            <View
              key={`${item.index}-${item.section.title}`}
              wrap={false}
              style={[
                styles.sectionCard,
                {
                  backgroundColor: section.tier === 'premium' ? palette.note : '#FDFCF8',
                  borderColor: '#D6DDE9',
                },
              ]}
            >
              <Text style={styles.sectionCardEyebrow}>{section.eyebrow}</Text>
              <Text style={[styles.sectionCardTitle, displayTextStyle]}>{section.title}</Text>
              <Text style={styles.sectionCardBody}>{section.body}</Text>
              {section.bullets.length ? (
                <View style={styles.sectionBulletList}>
                  {section.bullets.map(bullet => (
                    <Text key={bullet} style={styles.sectionBullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ) : null}
              {section.evidenceTable?.length ? (
                <PdfEvidenceTable rows={section.evidenceTable} />
              ) : null}
            </View>
          );
        })}
      </View>

      {/*
        Keep supporting proof inside each card/table. Separate proof boxes were
        creating orphan continuation pages in free PDFs and made the report feel
        like engine output instead of a polished reading.
      */}
    </Page>
  );
}

function prepareSectionForPdfCard(section: PdfSection, mode: PDFMode): PdfSection {
  const rows = prepareEvidenceRows(section.evidenceTable ?? [], mode);
  const isLifeAtlas =
    section.eyebrow === 'LIFE ATLAS' ||
    section.eyebrow === 'LIFE ATLAS APPENDIX' ||
    section.eyebrow === 'LIFE ATLAS TRUST';
  const bodyLimit = isLifeAtlas
    ? mode === 'PREMIUM'
      ? 620
      : 500
    : mode === 'PREMIUM'
      ? 360
      : 300;
  const bulletLimit = isLifeAtlas
    ? mode === 'PREMIUM'
      ? 230
      : 180
    : mode === 'PREMIUM'
      ? 185
      : 150;
  const bulletCount = isLifeAtlas
    ? mode === 'PREMIUM'
      ? 4
      : 3
    : mode === 'PREMIUM'
      ? 4
      : 3;

  return {
    ...section,
    body: compactPdfRenderText(section.body, bodyLimit),
    bullets: section.bullets
      .map(bullet => compactPdfRenderText(bullet, bulletLimit))
      .slice(0, bulletCount),
    evidenceTable: rows.length ? rows : undefined,
  };
}

function prepareEvidenceRows(
  rows: NonNullable<PdfSection['evidenceTable']>,
  mode: PDFMode,
): NonNullable<PdfSection['evidenceTable']> {
  const maxRows = mode === 'PREMIUM' ? 4 : 3;

  return rows
    .filter(row => row.factor.trim() && (row.observation.trim() || row.implication.trim()))
    .map(row => {
      const observation = compactPdfRenderText(row.observation, 120);
      const implication = compactPdfRenderText(
        row.implication === row.observation
          ? 'Use this as supporting evidence, not as a separate prediction.'
          : row.implication,
        130,
      );

      return {
        ...row,
        factor: compactPdfRenderText(row.factor, 44),
        implication,
        observation,
      };
    })
    .slice(0, maxRows);
}

function compactPdfRenderText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
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

function PdfCelestialSeal(): React.JSX.Element {
  const gold = '#C8A96A';
  const mutedGold = '#8E7446';
  const blue = '#67B7FF';
  const magenta = '#E45AA2';
  const green = '#42D99A';

  return (
    <Svg height={210} width={210}>
      <Circle cx={105} cy={105} fill="transparent" r={92} stroke={gold} strokeWidth={1.2} />
      <Circle cx={105} cy={105} fill="transparent" opacity={0.42} r={78} stroke={blue} strokeWidth={0.7} />
      <Circle cx={105} cy={105} fill="transparent" opacity={0.34} r={61} stroke={magenta} strokeWidth={0.6} />
      <Path
        d="M42 105 C58 52 150 40 170 96 C189 151 112 180 66 150 C44 136 36 122 42 105"
        fill="transparent"
        opacity={0.42}
        stroke={green}
        strokeWidth={0.8}
      />
      <Rect fill="transparent" height={108} opacity={0.62} stroke={mutedGold} strokeWidth={0.7} width={108} x={51} y={51} />
      <Line opacity={0.66} stroke={mutedGold} strokeWidth={0.7} x1={51} x2={159} y1={51} y2={159} />
      <Line opacity={0.66} stroke={mutedGold} strokeWidth={0.7} x1={159} x2={51} y1={51} y2={159} />
      <Path
        d="M105 51 L159 105 L105 159 L51 105 Z"
        fill="transparent"
        opacity={0.78}
        stroke={gold}
        strokeWidth={0.8}
      />
      <Circle cx={70} cy={52} fill={gold} opacity={0.72} r={1.2} />
      <Circle cx={151} cy={70} fill={blue} opacity={0.7} r={1.1} />
      <Circle cx={165} cy={129} fill={gold} opacity={0.68} r={1.3} />
      <Circle cx={62} cy={145} fill={green} opacity={0.68} r={1.1} />
      <Circle cx={114} cy={33} fill={magenta} opacity={0.64} r={1} />
      <Circle cx={101} cy={105} fill="transparent" opacity={0.36} r={28} stroke={gold} strokeWidth={0.6} />
      <Path
        d="M96 84 C115 89 124 103 120 121 C108 118 99 110 94 99 C92 94 93 89 96 84"
        fill={gold}
        opacity={0.18}
      />
    </Svg>
  );
}

function PdfHouseWisePlanetTablePage({
  displayTextStyle,
  documentFontFamily,
  logoSrc,
  rows,
  subjectName,
  watermark,
}: {
  displayTextStyle: { fontFamily?: string };
  documentFontFamily: string;
  logoSrc?: string;
  rows: PdfHouseWisePlanetRow[];
  subjectName: string;
  watermark: string;
}): React.JSX.Element {
  const columns: Array<{
    key: keyof PdfHouseWisePlanetRow;
    label: string;
    width: string;
  }> = [
    { key: 'graha', label: 'Graha', width: '11%' },
    { key: 'house', label: 'House', width: '6%' },
    { key: 'sign', label: 'Sign', width: '11%' },
    { key: 'degree', label: 'Degree', width: '8%' },
    { key: 'nakshatraPada', label: 'Nakshatra / Pada', width: '18%' },
    { key: 'retrograde', label: 'Retro', width: '7%' },
    { key: 'combust', label: 'Combust', width: '8%' },
    { key: 'exaltation', label: 'Exalted', width: '8%' },
    { key: 'debilitation', label: 'Debilitated', width: '10%' },
    { key: 'dignity', label: 'Dignity', width: '13%' },
  ];

  return (
    <Page size="A4" style={[styles.page, { fontFamily: documentFontFamily }]}>
      <PdfWatermark logoSrc={logoSrc} watermark={watermark} />
      <PdfFooter subjectName={subjectName} />
      <PdfPageHeader
        eyebrow="Chart proof"
        title="House-wise graha placement"
      />
      <Text style={[styles.pageTitle, displayTextStyle]}>
        Where each graha sits in the chart
      </Text>
      <Text style={styles.pageLead}>
        This table keeps every classical graha readable after the chart pages:
        house, sign, degree, nakshatra/pada, retrogression, combustion,
        exaltation, debilitation, and dignity are shown without crowding the
        Kundli plate.
      </Text>

      <View style={styles.placementTable} wrap={false}>
        <View style={styles.placementTableHeader}>
          {columns.map(column => (
            <Text
              key={column.key}
              style={[styles.placementTableHeaderCell, { width: column.width }]}
            >
              {column.label}
            </Text>
          ))}
        </View>
        {rows.map(row => (
          <View key={`${row.graha}-${row.house}-${row.degree}`} style={styles.placementTableRow}>
            {columns.map(column => (
              <Text
                key={column.key}
                style={[
                  styles.placementTableCell,
                  ...(column.key === 'graha' ? [styles.placementGrahaCell] : []),
                  { width: column.width },
                ]}
              >
                {row[column.key]}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </Page>
  );
}

function PdfMoonPhaseDisc({
  phase,
}: {
  phase: PdfChartSnapshot['moonPhase'];
}): React.JSX.Element {
  const fill =
    phase === 'dark'
      ? '#252A34'
      : phase === 'full'
        ? '#F8F1DA'
        : '#D8CCAC';
  const shadow =
    phase === 'waxing'
      ? 'M11 3 C5 6 5 18 11 21 C7 16 7 8 11 3'
      : phase === 'waning'
        ? 'M13 3 C19 6 19 18 13 21 C17 16 17 8 13 3'
        : '';

  return (
    <Svg height={24} width={24}>
      <Circle cx={12} cy={12} fill={fill} r={9} stroke="#C8A96A" strokeWidth={0.8} />
      {phase === 'dark' ? (
        <Circle cx={12} cy={12} fill="#151925" opacity={0.72} r={8} />
      ) : null}
      {shadow ? (
        <Path d={shadow} fill="#1B2230" opacity={0.45} />
      ) : null}
      {phase === 'unknown' ? (
        <Circle cx={12} cy={12} fill="transparent" opacity={0.5} r={4} stroke="#7A7467" strokeWidth={0.8} />
      ) : null}
    </Svg>
  );
}

function PdfEvidenceTable({ rows }: { rows: NonNullable<PdfSection['evidenceTable']> }): React.JSX.Element {
  return (
    <View style={styles.evidenceTable}>
      <View style={styles.evidenceTableHeader}>
        <Text style={[styles.evidenceTableHeaderCell, styles.evidenceTableCellNarrow]}>
          Factor
        </Text>
        <Text style={[styles.evidenceTableHeaderCell, styles.evidenceTableCellWide]}>
          Observation
        </Text>
        <Text style={[styles.evidenceTableHeaderCell, styles.evidenceTableCellWide]}>
          Meaning
        </Text>
      </View>
      {rows.map(row => (
        <View key={`${row.factor}-${row.observation}`} style={styles.evidenceTableRow}>
          <Text style={[styles.evidenceTableCell, styles.evidenceTableCellNarrow]}>
            {row.factor}
          </Text>
          <Text style={[styles.evidenceTableCell, styles.evidenceTableCellWide]}>
            {row.observation}
          </Text>
          <Text style={[styles.evidenceTableCell, styles.evidenceTableCellWide]}>
            {row.implication}
          </Text>
        </View>
      ))}
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

function PdfCoverFooter({ subjectName }: { subjectName: string }): React.JSX.Element {
  return (
    <View fixed style={[styles.footer, styles.coverFooter]}>
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

  return 'Predicta Editorial Body';
}

function getDisplayTextStyle(language: SupportedLanguage): { fontFamily?: string } {
  if (language === 'en') {
    return { fontFamily: 'Predicta Editorial Display' };
  }

  return {};
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
  // Native copy audit anchors; runtime translations still come from dedicated config JSON: प्रेडिक्टा सारांश / પ્રેડિક્ટા સારાંશ.
  if (language === 'hi') {
    return {
      confidence: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.479e87c228"),
      executiveSummary: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.35b4e52eb3"),
      readAs: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.756e040946"),
      reportModeLabel: mode === 'PREMIUM' ? getNativeCopy("native.packages.pdf.src.reportDocument.tsx.5f6159ace7") : getNativeCopy("native.packages.pdf.src.reportDocument.tsx.2acd08b1c1"),
      summaryEyebrow: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.e629fe5a2f"),
      summaryLead:
        getNativeCopy("native.packages.pdf.src.reportDocument.tsx.aee140ba30"),
      summaryTitle: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.b69a152c39"),
      trustLimits: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.73c57a19ae"),
    };
  }

  if (language === 'gu') {
    return {
      confidence: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.712cb1a1bc"),
      executiveSummary: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.138b9610f4"),
      readAs: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.ae41ad2104"),
      reportModeLabel: mode === 'PREMIUM' ? getNativeCopy("native.packages.pdf.src.reportDocument.tsx.23047de708") : getNativeCopy("native.packages.pdf.src.reportDocument.tsx.36154469b2"),
      summaryEyebrow: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.722c11f016"),
      summaryLead:
        getNativeCopy("native.packages.pdf.src.reportDocument.tsx.b8e19c0e77"),
      summaryTitle: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.3279003ba8"),
      trustLimits: getNativeCopy("native.packages.pdf.src.reportDocument.tsx.9b399c0b9b"),
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
  const chartWidth = 492;
  const chartHeight = 450;

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
          <Text style={styles.chartHeaderType}>
            {formatPdfChartRole(snapshot)}
          </Text>
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
            fill={themePalette.panel}
            height={chartHeight}
            stroke={themePalette.outline}
            strokeWidth={1}
            width={chartWidth}
            x={0}
            y={0}
          />
          <Path d={`M0 0 L${chartWidth} ${chartHeight}`} fill="none" stroke={themePalette.outline} strokeWidth={1} />
          <Path d={`M${chartWidth} 0 L0 ${chartHeight}`} fill="none" stroke={themePalette.outline} strokeWidth={1} />
          <Path
            d={`M${chartWidth / 2} 0 L${chartWidth} ${chartHeight / 2} L${chartWidth / 2} ${chartHeight} L0 ${chartHeight / 2} Z`}
            fill="none"
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

      {snapshot.school === 'KP' || snapshot.chartRole === 'KP' ? (
        <>
          <Text style={styles.chartNote}>
            KP chart: houses are read as cusp-led event delivery zones. Use this chart with sub lords,
            significators, ruling planets, and the selected event question.
          </Text>
          <Text style={styles.chartThemeNote}>
            This is not a Parashari D1/D9 personality plate. It is the KP Bhav Chalit cusp chart used for event judgement.
          </Text>
        </>
      ) : snapshot.school === 'NADI' || snapshot.chartRole === 'NADI' ? (
        <>
          <Text style={styles.chartNote}>
            Nadi chart: this is a story-anchor chart for planetary links, Rahu/Ketu axis themes,
            validation questions, and activation timing.
          </Text>
          <Text style={styles.chartThemeNote}>
            This is not a Parashari D1/D9 chart page. It supports the Nadi karmic story without turning the report into a Vedic dossier.
          </Text>
        </>
      ) : (
        <>
          <View style={styles.moonPhaseRow}>
            <PdfMoonPhaseDisc phase={snapshot.moonPhase} />
            <Text style={styles.moonPhaseLabel}>
              {snapshot.moonNakshatraPada?.moonPhaseLabel ?? 'Moon phase pending'}
            </Text>
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
        </>
      )}
    </View>
  );
}

function formatPdfChartRole(snapshot: PdfChartSnapshot): string {
  if (snapshot.chartRole === 'MOON') {
    return 'Moon / Chandra Lagna';
  }

  if (snapshot.chartRole === 'CHALIT') {
    return 'Chalit';
  }

  if (snapshot.chartRole === 'SWAMSA') {
    return 'Swamsa';
  }

  if (snapshot.chartRole === 'KARAKAMSHA') {
    return 'Karakamsha';
  }

  if (snapshot.chartRole === 'KP') {
    return 'KP Cusp Chart';
  }

  if (snapshot.chartRole === 'NADI') {
    return 'Nadi Story Chart';
  }

  return snapshot.chartType;
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
  const labels = buildPolygonAwareChartLabels(cell, boardWidth, boardHeight);

  return (
    <React.Fragment>
      {labels.map(label => (
        <Text
          key={label.key}
          style={[
            styles.chartFloatingChip,
            label.kind === 'sign' ? styles.signChip : styles.planetChip,
            {
              backgroundColor: label.kind === 'sign' ? palette.accentSoft : palette.note,
              borderColor: label.kind === 'sign' ? palette.accent : palette.border,
              fontSize: label.fontSize,
              height: label.height,
              left: label.left,
              lineHeight: label.lineHeight,
              top: label.top,
              width: label.width,
            },
            ...(label.kind === 'planet' && (label.planetName === 'Rahu' || label.planetName === 'Ketu')
              ? [styles.nodePlanetChip]
              : []),
          ]}
        >
          {label.text}
        </Text>
      ))}
    </React.Fragment>
  );
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
      accentSoft: '#F3ECE0',
      background: PDF_PAGE_TEMPLATES.interior.background,
      border: '#D3BE8A',
      note: '#FDF8ED',
      outline: '#CFAF6A',
      panel: PDF_PAGE_TEMPLATES.interior.panel,
    };
  }

  return {
    accent: '#7BB7FF',
    accentSoft: '#EEF3F5',
    background: PDF_PAGE_TEMPLATES.interior.background,
    border: '#C9D5DE',
    note: '#F6F8F8',
    outline: '#8AAAD3',
    panel: PDF_PAGE_TEMPLATES.interior.panel,
  };
}

function getChartThemePalette(theme: PdfChartSnapshot['theme']): ThemePalette {
  const pearl = {
    accentSoft: '#F6EFE2',
    background: '#F7F3EA',
    border: '#D6B879',
    note: '#FFFDF8',
    panel: '#FDF9F1',
  };

  switch (theme) {
    case 'sunrise':
      return {
        ...pearl,
        accent: '#B87532',
        outline: '#B9874E',
      };
    case 'morning':
      return {
        ...pearl,
        accent: '#9B8436',
        outline: '#B9A161',
      };
    case 'afternoon':
      return {
        ...pearl,
        accent: '#6C8BAA',
        outline: '#AA9A7A',
      };
    case 'sunset':
      return {
        ...pearl,
        accent: '#B96F52',
        outline: '#BA835F',
      };
    case 'night':
    case 'unknown':
    default:
      return {
        ...pearl,
        accent: '#657A9E',
        outline: '#A78F68',
      };
  }
}

type ChartLabelBox = { height: number; left: number; top: number; width: number };
type ChartPoint = { x: number; y: number };
const CHART_LABEL_MIN_EDGE_CLEARANCE = 6.8;
type ChartFloatingLabel = ChartLabelBox & {
  fontSize: number;
  key: string;
  kind: 'planet' | 'sign';
  lineHeight: number;
  planetName?: string;
  text: string;
};

function buildPolygonAwareChartLabels(
  cell: PdfChartSnapshotCell,
  boardWidth: number,
  boardHeight: number,
): ChartFloatingLabel[] {
  const house = cell.house ?? 1;
  const polygon = northIndianHousePolygon(house, boardWidth, boardHeight);
  const occupied: ChartLabelBox[] = [];
  const signLabel = makeSignFloatingLabel(cell, boardWidth, boardHeight);
  const labels: ChartFloatingLabel[] = [
    placeChartLabelInsideHouse(
      signLabel,
      polygon,
      occupied,
      preferredHousePoint(house, boardWidth, boardHeight, 'sign'),
    ),
  ];

  occupied.push(labels[0]);

  for (const planet of cell.planets) {
    const planetLabel = makePlanetFloatingLabel({
      boardHeight,
      boardWidth,
      cell,
      planet,
    });
    const placed = placeChartLabelInsideHouse(
      planetLabel,
      polygon,
      occupied,
      preferredHousePoint(house, boardWidth, boardHeight, 'planet'),
    );

    labels.push(placed);
    occupied.push(placed);
  }

  return labels;
}

function makeSignFloatingLabel(
  cell: PdfChartSnapshotCell,
  boardWidth: number,
  boardHeight: number,
): ChartFloatingLabel {
  return {
    fontSize: 7.2,
    height: Math.max(13, boardHeight * 0.034),
    key: `sign-${cell.signNumber}`,
    kind: 'sign',
    left: 0,
    lineHeight: 1,
    text: String(cell.signNumber),
    top: 0,
    width: Math.max(18, boardWidth * 0.046),
  };
}

function makePlanetFloatingLabel({
  boardHeight,
  boardWidth,
  cell,
  planet,
}: {
  boardHeight: number;
  boardWidth: number;
  cell: PdfChartSnapshotCell;
  planet: PdfChartSnapshotCell['planets'][number];
}): ChartFloatingLabel {
  const compact = usesCompactPlanetLabels(cell.house);
  const text = formatChartPlanetChipLabel(planet, cell.showPlanetDegrees, compact);
  const lineCount = text.includes('\n') ? 2 : 1;
  const fontSize = getChartPlanetChipFontSize(cell.planets.length, cell.labelDensity);
  const longestLineLength = Math.max(...text.split('\n').map(line => line.length));
  const estimatedWidth = compact
    ? Math.max(28, Math.min(44, longestLineLength * fontSize * 0.72 + 9))
    : Math.max(34, Math.min(72, text.length * fontSize * 0.56 + 11));

  return {
    fontSize,
    height: Math.max(lineCount === 2 ? 22 : 13, boardHeight * (lineCount === 2 ? 0.049 : 0.03)),
    key: planet.key,
    kind: 'planet',
    left: 0,
    lineHeight: lineCount === 2 ? 1.02 : 1,
    planetName: planet.name,
    text,
    top: 0,
    width: Math.min(estimatedWidth, boardWidth * (compact ? 0.09 : 0.145)),
  };
}

function placeChartLabelInsideHouse(
  label: ChartFloatingLabel,
  polygon: ChartPoint[],
  occupied: ChartLabelBox[],
  preferred: ChartPoint,
): ChartFloatingLabel {
  const variants = [label, shrinkChartLabel(label, 0.92), shrinkChartLabel(label, 0.84)];
  const ranked = variants.flatMap(variant =>
    chartLabelCandidates(variant, polygon).map(candidate => {
      const box = { ...variant, left: candidate.x - variant.width / 2, top: candidate.y - variant.height / 2 };
      const edgeClearance = rectEdgeClearance(box, polygon);
      const collisionCount = occupied.filter(item => rectsOverlap(box, item)).length;
      const preferencePenalty = distance(candidate, preferred) * 0.42;

      return {
        box,
        collisionCount,
        score: edgeClearance * 4 - preferencePenalty - collisionCount * 1000,
      };
    }),
  ).sort((first, second) => second.score - first.score);

  return (ranked.find(candidate => candidate.collisionCount === 0) ?? ranked[0] ?? {
    box: forceTinyLabelInsideHouse(label, polygon),
  }).box;
}

function chartLabelCandidates(label: ChartFloatingLabel, polygon: ChartPoint[]): ChartPoint[] {
  const bounds = polygonBounds(polygon);
  const step = label.kind === 'sign' ? 3 : 4;
  const candidates: ChartPoint[] = [];

  for (let y = bounds.minY + label.height / 2; y <= bounds.maxY - label.height / 2; y += step) {
    for (let x = bounds.minX + label.width / 2; x <= bounds.maxX - label.width / 2; x += step) {
      const box = { height: label.height, left: x - label.width / 2, top: y - label.height / 2, width: label.width };

      if (rectInsidePolygon(box, polygon, CHART_LABEL_MIN_EDGE_CLEARANCE)) {
        candidates.push({ x, y });
      }
    }
  }

  return candidates;
}

function shrinkChartLabel(label: ChartFloatingLabel, ratio: number): ChartFloatingLabel {
  return {
    ...label,
    fontSize: Math.max(label.kind === 'sign' ? 5.8 : 5.4, label.fontSize * ratio),
    height: Math.max(label.kind === 'sign' ? 11 : 12, label.height * ratio),
    width: Math.max(label.kind === 'sign' ? 14 : 24, label.width * ratio),
  };
}

function forceTinyLabelInsideHouse(label: ChartFloatingLabel, polygon: ChartPoint[]): ChartFloatingLabel {
  const bounds = polygonBounds(polygon);
  const centroid = polygonCentroid(polygon);
  const tinyLabel = shrinkChartLabel(label, label.kind === 'sign' ? 0.72 : 0.68);
  const centeredBox = {
    ...tinyLabel,
    left: centroid.x - tinyLabel.width / 2,
    top: centroid.y - tinyLabel.height / 2,
  };

  if (rectInsidePolygon(centeredBox, polygon, 1.8)) {
    return centeredBox;
  }

  return {
    ...tinyLabel,
    left: Math.min(Math.max(bounds.minX + 2, centroid.x - tinyLabel.width / 2), bounds.maxX - tinyLabel.width - 2),
    top: Math.min(Math.max(bounds.minY + 2, centroid.y - tinyLabel.height / 2), bounds.maxY - tinyLabel.height - 2),
  };
}

function northIndianHousePolygon(house: number, boardWidth: number, boardHeight: number): ChartPoint[] {
  const w = boardWidth;
  const h = boardHeight;
  const halfW = w / 2;
  const halfH = h / 2;
  const quarterW = w / 4;
  const quarterH = h / 4;
  const threeQuarterW = (w * 3) / 4;
  const threeQuarterH = (h * 3) / 4;
  const polygons: Record<number, ChartPoint[]> = {
    1: [{ x: halfW, y: 0 }, { x: threeQuarterW, y: quarterH }, { x: halfW, y: halfH }, { x: quarterW, y: quarterH }],
    2: [{ x: 0, y: 0 }, { x: halfW, y: 0 }, { x: quarterW, y: quarterH }],
    3: [{ x: 0, y: 0 }, { x: quarterW, y: quarterH }, { x: 0, y: halfH }],
    4: [{ x: 0, y: halfH }, { x: quarterW, y: quarterH }, { x: halfW, y: halfH }, { x: quarterW, y: threeQuarterH }],
    5: [{ x: 0, y: halfH }, { x: quarterW, y: threeQuarterH }, { x: 0, y: h }],
    6: [{ x: 0, y: h }, { x: quarterW, y: threeQuarterH }, { x: halfW, y: h }],
    7: [{ x: halfW, y: h }, { x: quarterW, y: threeQuarterH }, { x: halfW, y: halfH }, { x: threeQuarterW, y: threeQuarterH }],
    8: [{ x: halfW, y: h }, { x: threeQuarterW, y: threeQuarterH }, { x: w, y: h }],
    9: [{ x: w, y: h }, { x: threeQuarterW, y: threeQuarterH }, { x: w, y: halfH }],
    10: [{ x: w, y: halfH }, { x: threeQuarterW, y: quarterH }, { x: halfW, y: halfH }, { x: threeQuarterW, y: threeQuarterH }],
    11: [{ x: w, y: 0 }, { x: w, y: halfH }, { x: threeQuarterW, y: quarterH }],
    12: [{ x: halfW, y: 0 }, { x: w, y: 0 }, { x: threeQuarterW, y: quarterH }],
  };

  return polygons[house] ?? polygons[1];
}

function preferredHousePoint(
  house: number,
  boardWidth: number,
  boardHeight: number,
  kind: ChartFloatingLabel['kind'],
): ChartPoint {
  const preferred: Record<number, { planet: [number, number]; sign: [number, number] }> = {
    1: { sign: [50, 18], planet: [50, 27] },
    2: { sign: [28, 10], planet: [27, 17] },
    3: { sign: [9, 30], planet: [8, 38] },
    4: { sign: [25, 50], planet: [26, 60] },
    5: { sign: [9, 70], planet: [8, 62] },
    6: { sign: [28, 90], planet: [27, 83] },
    7: { sign: [50, 82], planet: [50, 73] },
    8: { sign: [72, 90], planet: [73, 83] },
    9: { sign: [91, 70], planet: [92, 62] },
    10: { sign: [75, 50], planet: [74, 60] },
    11: { sign: [91, 30], planet: [92, 38] },
    12: { sign: [72, 10], planet: [73, 17] },
  };
  const [x, y] = preferred[house]?.[kind] ?? preferred[1][kind];

  return { x: (x / 100) * boardWidth, y: (y / 100) * boardHeight };
}

function polygonBounds(polygon: ChartPoint[]): { maxX: number; maxY: number; minX: number; minY: number } {
  return {
    maxX: Math.max(...polygon.map(point => point.x)),
    maxY: Math.max(...polygon.map(point => point.y)),
    minX: Math.min(...polygon.map(point => point.x)),
    minY: Math.min(...polygon.map(point => point.y)),
  };
}

function polygonCentroid(polygon: ChartPoint[]): ChartPoint {
  return {
    x: polygon.reduce((total, point) => total + point.x, 0) / polygon.length,
    y: polygon.reduce((total, point) => total + point.y, 0) / polygon.length,
  };
}

function rectInsidePolygon(rect: ChartLabelBox, polygon: ChartPoint[], minClearance: number): boolean {
  const corners = rectCorners(rect);

  return corners.every(point => pointInPolygon(point, polygon)) && rectEdgeClearance(rect, polygon) >= minClearance;
}

function rectCorners(rect: ChartLabelBox): ChartPoint[] {
  return [
    { x: rect.left, y: rect.top },
    { x: rect.left + rect.width, y: rect.top },
    { x: rect.left + rect.width, y: rect.top + rect.height },
    { x: rect.left, y: rect.top + rect.height },
  ];
}

function rectEdgeClearance(rect: ChartLabelBox, polygon: ChartPoint[]): number {
  return Math.min(
    ...rectCorners(rect).flatMap(point =>
      polygon.map((current, index) =>
        distanceToSegment(point, current, polygon[(index + 1) % polygon.length]),
      ),
    ),
  );
}

function pointInPolygon(point: ChartPoint, polygon: ChartPoint[]): boolean {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];
    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x < ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
        (previousPoint.y - currentPoint.y || 1) + currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function distanceToSegment(point: ChartPoint, start: ChartPoint, end: ChartPoint): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t = lengthSquared === 0
    ? 0
    : Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const projection = { x: start.x + t * dx, y: start.y + t * dy };

  return distance(point, projection);
}

function distance(first: ChartPoint, second: ChartPoint): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function rectsOverlap(first: ChartLabelBox, second: ChartLabelBox): boolean {
  const gap = 2;

  return !(
    first.left + first.width + gap < second.left ||
    second.left + second.width + gap < first.left ||
    first.top + first.height + gap < second.top ||
    second.top + second.height + gap < first.top
  );
}

function getChartPlanetChipFontSize(
  planetCount: number,
  labelDensity: PdfChartSnapshotCell['labelDensity'],
): number {
  if (planetCount >= 6) {
    return 5.6;
  }

  if (planetCount >= 4) {
    return 5.9;
  }

  if (labelDensity === 'stacked') {
    return 6.1;
  }

  return 6.4;
}

function usesCompactPlanetLabels(house?: number): boolean {
  return house === 3 || house === 5 || house === 9 || house === 11;
}

function formatChartPlanetChipLabel(
  planet: PdfChartSnapshotCell['planets'][number],
  showDegree: boolean,
  compact: boolean,
): string {
  const status = [
    planet.status.retrograde ? 'R' : '',
    planet.status.exalted ? 'E' : '',
    planet.status.debilitated ? 'D' : '',
    planet.status.combust ? 'C' : '',
  ].filter(Boolean).join(' ');
  const degree = showDegree ? `${planet.degreeLabel}${status ? ` ${status}` : ''}` : status;

  if (!degree) {
    return planet.displayName;
  }

  return compact ? `${planet.displayName}\n${degree}` : `${planet.displayName} ${degree}`;
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
