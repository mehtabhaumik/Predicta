import React from 'react';
import {
  Document,
  type DocumentProps,
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
  type PdfDecisionWindow,
  type PdfEvidenceRow,
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
  report: PdfComposition;
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

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ECEFF4',
    color: '#172033',
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingBottom: 48,
    paddingHorizontal: 34,
    paddingTop: 38,
  },
  coverPage: {
    backgroundColor: '#F3F6FB',
    color: '#172033',
    paddingBottom: 56,
    paddingHorizontal: 40,
    paddingTop: 48,
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
    color: '#4E5E79',
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
    color: '#53627D',
    fontSize: 10,
    lineHeight: 1.6,
    marginBottom: 6,
  },
  coverTagline: {
    color: '#20304D',
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
    width: '48%',
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
    height: 290,
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
    bottom: 20,
    color: '#72829C',
    flexDirection: 'row',
    fontSize: 8.5,
    justifyContent: 'space-between',
    left: 34,
    position: 'absolute',
    right: 34,
  },
  footerCenter: {
    textAlign: 'center',
  },
  noteRow: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    padding: 12,
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

  const selectedKeySet = request.sectionKeys?.length
    ? new Set(request.sectionKeys)
    : null;

  const sections = selectedKeySet
    ? report.sections.filter((section, index) =>
        selectedKeySet.has(getPdfSectionKey(section, index)),
      )
    : report.sections;

  return {
    report,
    sections,
  };
}

export function PredictaReportPdfDocument({
  report,
  sections,
}: PdfBuildResult, options: PdfRenderOptions = {}): React.ReactElement<DocumentProps> {
  const palette = getModePalette(report.mode);
  const chartRows = chunk(report.chartSnapshots, 2);

  return (
    <Document
      author="Predicta"
      creator="Predicta"
      language={report.language}
      subject={report.cover.subtitle}
      title={`${report.cover.subtitle} | Predicta`}
    >
      <Page size="A4" style={styles.coverPage}>
        <PdfFooter footer={report.footer} />
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
        <Text style={[styles.coverWordmark, { color: '#20304D' }]}>PREDICTA</Text>
        <Text style={styles.coverTitle}>{report.cover.subtitle}</Text>
        <Text style={styles.coverSubtitle}>{report.executiveSummary.headline}</Text>
        <Text style={styles.coverTagline}>
          A polished astrology report built to feel crisp, premium, and easy to
          read.
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

      <Page size="A4" style={styles.page}>
        <PdfFooter footer={report.footer} />
        <PdfPageHeader
          eyebrow="Predicta summary"
          title={report.mode === 'PREMIUM' ? 'Detailed analysis report' : 'Free insight report'}
        />
        <Text style={styles.pageTitle}>What this report is saying first</Text>
        <Text style={styles.pageLead}>
          Start with the life direction, timing, and pressure that matter most.
          The deeper sections that follow stay rooted in the chart but remain
          readable, not technical-first.
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
          <Text style={styles.panelEyebrow}>Executive summary</Text>
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
            <Text style={styles.cardLabel}>Confidence</Text>
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
            <Text style={styles.cardLabel}>Read this report as</Text>
            <Text style={styles.cardText}>
              {report.mode === 'PREMIUM'
                ? 'a full planning dossier with deeper timing and synthesis'
                : 'a substantial insight report with meaningful guidance'}
            </Text>
            <Text style={styles.cardSubtext}>
              {report.mode === 'PREMIUM'
                ? 'Premium adds chart synthesis, timing windows, and richer life-area coverage.'
                : 'Free still keeps real insight, proof, and practical next steps.'}
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
          <Text style={styles.cardLabel}>Trust and limits</Text>
          {report.trustProfile.limitations.slice(0, 4).map(item => (
            <Text key={item} style={styles.evidenceText}>
              • {item}
            </Text>
          ))}
        </View>
      </Page>

      {chartRows.map((row, rowIndex) => (
        <Page key={`charts-${rowIndex}`} size="A4" style={styles.page}>
          <PdfFooter footer={report.footer} />
          <PdfPageHeader
            eyebrow="Chart proof"
            title={report.mode === 'PREMIUM' ? 'Chart spread' : 'Charts in your report'}
          />
          <Text style={styles.pageTitle}>The charts, in the same language as Predicta</Text>
          <Text style={styles.pageLead}>
            These charts use the same house structure, signs, planets, degrees,
            status marks, and birth-time theme logic as the real Kundli
            surfaces.
          </Text>
          <View style={styles.chartRow}>
            {row.map(snapshot => (
              <PdfChartCard
                key={`${snapshot.chartType}-${snapshot.chartName}`}
                palette={palette}
                snapshot={snapshot}
                birthTime={report.cover.metadata[0] ?? ''}
              />
            ))}
          </View>
        </Page>
      ))}

      {sections.map((section, index) => (
        <Page key={`${section.eyebrow}-${section.title}-${index}`} size="A4" style={styles.page}>
          <PdfFooter footer={report.footer} />
          <PdfPageHeader
            eyebrow={section.eyebrow}
            title={section.tier === 'premium' ? 'Premium analysis spread' : 'Insight spread'}
          />
          <Text style={styles.pageTitle}>{section.title}</Text>

          <View
            style={[
              styles.sectionStory,
              {
                backgroundColor: palette.panel,
                borderColor: palette.border,
              },
            ]}
          >
            <Text style={styles.panelEyebrow}>{section.eyebrow}</Text>
            <Text style={styles.sectionStoryBody}>{section.body}</Text>
            <Text
              style={[
                styles.confidenceChip,
                {
                  backgroundColor: palette.accentSoft,
                  borderColor: palette.border,
                },
              ]}
            >
              {section.tier ?? 'free'} · {section.confidence ?? 'medium'} confidence
            </Text>
          </View>

          {section.bullets.length ? (
            <View style={styles.infoGrid}>
              {section.bullets.slice(0, 6).map(item => (
                <View
                    key={item}
                    style={[
                      styles.insightCard,
                      {
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D6DDE9',
                      },
                    ]}
                  >
                  <Text style={styles.cardLabel}>Insight</Text>
                  <Text style={styles.cardText}>{item}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {section.decisionWindows?.length ? (
            <View style={{ marginBottom: 10 }}>
              {section.decisionWindows.slice(0, 4).map(window => (
                <PdfDecisionWindowCard
                  key={`${window.label}-${window.window}`}
                  item={window}
                  palette={palette}
                />
              ))}
            </View>
          ) : null}

          {section.evidenceTable?.length ? (
            <View style={{ marginBottom: 8 }}>
              {section.evidenceTable.slice(0, 4).map(row => (
                <PdfEvidenceCard
                  key={`${row.factor}-${row.observation}`}
                  row={row}
                  palette={palette}
                />
              ))}
            </View>
          ) : null}

          {section.evidence.length ? (
            <View
            style={[
              styles.noteRow,
              {
                backgroundColor: '#FFFFFF',
                borderColor: '#D6DDE9',
              },
            ]}
          >
              <Text style={styles.cardLabel}>Why Predicta is saying this</Text>
              {section.evidence.slice(0, 5).map(item => (
                <Text key={item} style={styles.evidenceText}>
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </Page>
      ))}
    </Document>
  );
}

export function createPredictaReportPdfElement(
  result: PdfBuildResult,
  options?: PdfRenderOptions,
): React.ReactElement<DocumentProps> {
  return PredictaReportPdfDocument(result, options);
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

function PdfFooter({ footer }: { footer: string }): React.JSX.Element {
  return (
    <View fixed style={styles.footer}>
      <Text>{footer}</Text>
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
        style={styles.footerCenter}
      />
    </View>
  );
}

function PdfDecisionWindowCard({
  item,
  palette,
}: {
  item: PdfDecisionWindow;
  palette: ThemePalette;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.fullCard,
        {
          backgroundColor: '#FFFFFF',
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={styles.cardLabel}>Decision window</Text>
      <Text style={styles.evidenceTitle}>{item.label}</Text>
      <Text style={styles.cardText}>{item.window}</Text>
      <Text style={styles.cardSubtext}>{item.guidance}</Text>
      {item.evidence.slice(0, 3).map(line => (
        <Text key={line} style={styles.evidenceText}>
          • {line}
        </Text>
      ))}
      <Text
        style={[
          styles.confidenceChip,
          {
            backgroundColor: palette.accentSoft,
            borderColor: palette.border,
          },
        ]}
      >
        {item.confidence} confidence
      </Text>
    </View>
  );
}

function PdfEvidenceCard({
  row,
  palette,
}: {
  row: PdfEvidenceRow;
  palette: ThemePalette;
}): React.JSX.Element {
  return (
    <View
      style={[
        styles.evidenceCard,
        {
          backgroundColor: '#FFFFFF',
          borderColor: palette.border,
        },
      ]}
    >
      <Text style={styles.cardLabel}>Evidence factor</Text>
      <Text style={styles.evidenceTitle}>{row.factor}</Text>
      <Text style={styles.evidenceText}>{row.observation}</Text>
      <Text style={styles.cardSubtext}>{row.implication}</Text>
      <Text
        style={[
          styles.confidenceChip,
          {
            backgroundColor: palette.accentSoft,
            borderColor: palette.border,
          },
        ]}
      >
        {row.confidence} confidence
      </Text>
    </View>
  );
}

function PdfChartCard({
  birthTime,
  palette,
  snapshot,
}: {
  birthTime: string;
  palette: ThemePalette;
  snapshot: PdfChartSnapshot;
}): React.JSX.Element {
  const themePalette = getChartThemePalette(snapshot.theme);
  const chartWidth = 238;
  const chartHeight = 290;

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

      <Text style={styles.chartThemeNote}>
        {describeTheme(snapshot.theme, birthTime)}
      </Text>
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
  const cellWidth = cell.labelDensity === 'stacked' ? 92 : 84;
  const left = (point.x / 100) * boardWidth - cellWidth / 2;
  const top = (point.y / 100) * boardHeight - 18;

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
      {cell.hiddenPlanetCount > 0 ? (
        <Text
          style={[
            styles.planetChip,
            {
              backgroundColor: palette.note,
              borderColor: palette.border,
            },
          ]}
        >
          +{cell.hiddenPlanetCount}
        </Text>
      ) : null}
    </View>
  );
}

function getPdfSectionKey(section: PdfSection, index: number): string {
  return `${index}-${section.eyebrow}-${section.title}`;
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
        accent: '#FFCA72',
        accentSoft: '#53361F',
        background: '#22170F',
        border: '#86654A',
        note: '#2C1C13',
        outline: '#9D7B5B',
        panel: '#1F1712',
      };
    case 'morning':
      return {
        accent: '#E8D57D',
        accentSoft: '#3F3A1E',
        background: '#1E1E16',
        border: '#767147',
        note: '#232417',
        outline: '#8B8656',
        panel: '#181B14',
      };
    case 'afternoon':
      return {
        accent: '#CFE5FF',
        accentSoft: '#243148',
        background: '#111721',
        border: '#50617B',
        note: '#151C27',
        outline: '#687C99',
        panel: '#0D121B',
      };
    case 'sunset':
      return {
        accent: '#FFB488',
        accentSoft: '#4B241D',
        background: '#251114',
        border: '#87524A',
        note: '#2B1718',
        outline: '#99635B',
        panel: '#1D1115',
      };
    case 'night':
    case 'unknown':
    default:
      return {
        accent: '#98B8FF',
        accentSoft: '#1C2540',
        background: '#0E1019',
        border: '#45516E',
        note: '#171B29',
        outline: '#65708D',
        panel: '#0B101A',
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
