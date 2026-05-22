'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getConfidenceLabel,
  getLanguageLabels,
  getLanguageOption,
  SUPPORTED_LANGUAGE_OPTIONS,
} from '@pridicta/config/language';
import {
  getReportPurchaseGuide,
  getReportMarketplaceProducts,
  type ReportPurchaseGuide,
  type ReportMarketplaceProduct,
} from '@pridicta/config/pricing';
import { getChartRenderTheme } from '@pridicta/astrology';
import {
  composeReportSections,
  type PdfChartSnapshot,
  type PdfSection,
} from '@pridicta/pdf';
import type {
  KundliData,
  SignatureAnalysisModel,
  SupportedLanguage,
} from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  formatWebChatTranscript,
  loadWebChatTranscript,
  openPrintableWebChatTranscript,
} from '../lib/web-chat-export';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { loadWebKundliStore } from '../lib/web-kundli-storage';
import { getChartThemeNote } from '../lib/chart-theme-copy';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { PlanetGlyph } from './PlanetGlyph';
import { NorthIndianChartLines } from './WebKundliChart';
import { WebTrustProofPanel } from './WebTrustProofPanel';
import { AuthDialog } from './AuthDialog';
import { getFirebaseWebAuth } from '../lib/firebase/client';

const SIGNATURE_DRAFT_STORAGE_KEY = 'pridicta.signatureDraft.v1';

type SignatureReportDraft = {
  analysisModel?: SignatureAnalysisModel;
  savedAt?: string;
};

export function WebDossierPreview(): React.JSX.Element {
  const didLoadSavedState = useRef(false);
  const reportChartPanelRef = useRef<HTMLElement | null>(null);
  const reportPreviewRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const [builderMode, setBuilderMode] = useState<'EVERYTHING' | 'CUSTOM'>(
    'EVERYTHING',
  );
  const [isReportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [selectedSectionKeys, setSelectedSectionKeys] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<
    'idle' | 'report' | 'chat' | 'empty' | 'needKundli'
  >('idle');
  const {
    language: appLanguage,
    reportLanguage,
    setReportLanguage,
  } = useLanguagePreference();
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [signatureAnalysis, setSignatureAnalysis] = useState<
    SignatureAnalysisModel | undefined
  >();
  const [user, setUser] = useState<User | null>(null);
  const labels = getLanguageLabels(appLanguage);
  const reportLabels = getLanguageLabels(reportLanguage);
  const marketplaceProducts = useMemo(() => getReportMarketplaceProducts(), []);
  const purchaseGuide = useMemo(() => getReportPurchaseGuide(), []);
  const selectedReport =
    marketplaceProducts.find(product => product.id === selectedReportId) ??
    marketplaceProducts[0];
  const localizedSelectedReport = getLocalizedReportProduct(
    selectedReport,
    appLanguage,
  );
  const localizedReportTitle = getLocalizedReportProduct(
    selectedReport,
    reportLanguage,
  );

  useEffect(() => {
    const memory = loadWebAutoSaveMemory();
    const savedReport = memory.report;
    const savedReportIsValid = marketplaceProducts.some(
      product => product.id === savedReport?.selectedReportId,
    );

    setKundli(loadWebKundliStore().activeKundli);
    setSignatureAnalysis(loadSignatureAnalysisDraft());
    if (savedReportIsValid && savedReport?.selectedReportId) {
      setSelectedReportId(savedReport.selectedReportId as ReportMarketplaceProduct['id']);
    }
    if (savedReport?.mode) {
      setMode(savedReport.mode);
    }
    if (savedReport?.builderMode) {
      setBuilderMode(savedReport.builderMode);
    }
    if (savedReport?.selectedSectionKeys?.length) {
      setSelectedSectionKeys(savedReport.selectedSectionKeys);
    }
    if (savedReport?.reportLanguage) {
      setReportLanguage(savedReport.reportLanguage);
    }

    didLoadSavedState.current = true;
  }, [marketplaceProducts, setReportLanguage]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedFocus = params.get('focus');
    const requestedMode = params.get('mode');

    if (
      requestedFocus &&
      marketplaceProducts.some(product => product.id === requestedFocus)
    ) {
      setSelectedReportId(requestedFocus as ReportMarketplaceProduct['id']);
    }

    if (requestedMode === 'FREE' || requestedMode === 'PREMIUM') {
      setMode(requestedMode);
    }
  }, [marketplaceProducts]);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseWebAuth(), setUser);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      report: {
        mode,
        builderMode,
        selectedReportId,
        selectedSectionKeys,
        reportLanguage,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [builderMode, mode, reportLanguage, selectedReportId, selectedSectionKeys]);

  const freeReport = useMemo(
    () =>
      composeReportSections({
        kundli,
        language: reportLanguage,
        mode: 'FREE',
        reportFocus: selectedReportId,
        signatureAnalysis,
      }),
    [kundli, reportLanguage, selectedReportId, signatureAnalysis],
  );
  const premiumReport = useMemo(
    () =>
      composeReportSections({
        kundli,
        language: reportLanguage,
        mode: 'PREMIUM',
        reportFocus: selectedReportId,
        signatureAnalysis,
      }),
    [kundli, reportLanguage, selectedReportId, signatureAnalysis],
  );
  const report = mode === 'PREMIUM' ? premiumReport : freeReport;
  const reportChartTheme = getChartRenderTheme(kundli?.birthDetails.time);
  const builderCopy = getReportBuilderCopy(appLanguage);
  const reportLanguageCopy = getReportLanguageCopy(appLanguage);
  const reportPrintCopy = getReportPrintCopy(reportLanguage);
  const actualSectionOptions = report.sections.map((section, index) => ({
    key: getReportSectionKey(section, index),
    section,
  }));
  const plannedSectionOptions = getComprehensiveReportSections(reportLanguage).map(
    (section, index) => ({
      key: `planned-${index}-${section.eyebrow}-${section.title}`,
      section: {
        ...section,
        body: builderCopy.plannedSectionBody,
        bullets: [
          builderCopy.plannedSectionBulletFree,
          builderCopy.plannedSectionBulletPremium,
        ],
        confidence: 'medium' as const,
        evidence: [builderCopy.plannedSectionEvidence],
        tier: 'free' as const,
      },
    }),
  );
  const sectionOptions = kundli ? actualSectionOptions : plannedSectionOptions;
  const selectedKeySet = useMemo(
    () => new Set(selectedSectionKeys),
    [selectedSectionKeys],
  );
  const visibleSections =
    builderMode === 'EVERYTHING'
      ? sectionOptions.map(option => option.section)
      : sectionOptions
          .filter(option => selectedKeySet.has(option.key))
          .map(option => option.section);
  const selectedSectionCount =
    builderMode === 'EVERYTHING'
      ? sectionOptions.length
      : sectionOptions.filter(option => selectedKeySet.has(option.key)).length;
  const differenceRows = getFreePremiumDifferenceRows(appLanguage);

  function openReportPreview(): boolean {
    if (!kundli) {
      setCopyState('needKundli');
      window.setTimeout(() => setCopyState('idle'), 3200);
      return false;
    }

    if (builderMode === 'CUSTOM' && !visibleSections.length) {
      setCopyState('empty');
      window.setTimeout(() => setCopyState('idle'), 1800);
      return false;
    }

    setReportPreviewOpen(true);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const target = reportChartPanelRef.current ?? reportPreviewRef.current;
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    return true;
  }

  function printReport() {
    const opened = openReportPreview();
    if (!opened) {
      return;
    }

    window.setTimeout(() => window.print(), 80);
  }

  function selectEverything() {
    setBuilderMode('EVERYTHING');
    setSelectedSectionKeys(sectionOptions.map(option => option.key));
  }

  function selectCustomStarter() {
    setBuilderMode('CUSTOM');
    setSelectedSectionKeys(sectionOptions.slice(0, 8).map(option => option.key));
  }

  function toggleSection(key: string) {
    const validKeys = sectionOptions.map(option => option.key);
    const validKeySet = new Set(validKeys);

    setBuilderMode('CUSTOM');
    setSelectedSectionKeys(current => {
      const cleanCurrent =
        builderMode === 'EVERYTHING'
          ? validKeys
          : current.filter(item => validKeySet.has(item));

      return cleanCurrent.includes(key)
        ? cleanCurrent.filter(item => item !== key)
        : [...cleanCurrent, key];
    });
  }

  async function copyReportSummary() {
    const text = [
      `${localizedReportTitle.title} · ${
        mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free
      }`,
      report.executiveSummary.headline,
      '',
      builderCopy.includesHeading,
      ...visibleSections.map(section => `- ${section.title}`),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopyState('report');
    window.setTimeout(() => setCopyState('idle'), 1800);
  }

  async function copyChatTranscript() {
    const transcript = formatWebChatTranscript(loadWebChatTranscript());
    await navigator.clipboard.writeText(transcript);
    setCopyState('chat');
    window.setTimeout(() => setCopyState('idle'), 1800);
  }

  useEffect(() => {
    const keys = sectionOptions.map(option => option.key);
    const keySet = new Set(keys);

    setSelectedSectionKeys(current => {
      const validCurrent = current.filter(key => keySet.has(key));
      return validCurrent.length ? validCurrent : keys;
    });
  }, [kundli?.id, report.mode, reportLanguage, selectedReportId]);

  return (
    <div className="dossier-preview">
      <WebActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Report"
        title="Report Kundli"
      />
      <section className="report-marketplace glass-panel">
        <div className="report-marketplace-header">
          <div>
            <div className="section-title">{builderCopy.marketplaceEyebrow}</div>
            <h2>{builderCopy.marketplaceTitle}</h2>
            <p>{builderCopy.marketplaceBody}</p>
          </div>
          <div className="report-marketplace-promise">
            <span>{labels.free}</span>
            <strong>{builderCopy.marketplacePromiseTitle}</strong>
            <small>{builderCopy.marketplacePromiseBody}</small>
          </div>
        </div>

        <details className="report-drawer">
          <summary>
            <span>{builderCopy.helpChoosingReport}</span>
            <strong>{builderCopy.openDrawer}</strong>
          </summary>
          <div className="report-choice-guide">
            {purchaseGuide.map(item => {
              const localizedItem = getLocalizedPurchaseGuideItem(
                item,
                appLanguage,
              );

              return (
              <div className="report-choice-card" key={item.label}>
                <span>{localizedItem.label}</span>
                <strong>{localizedItem.title}</strong>
                <p>{localizedItem.body}</p>
                <small>{localizedItem.cta}</small>
              </div>
              );
            })}
          </div>
        </details>

        <div className="report-product-grid">
          {marketplaceProducts.map(product => {
            const localizedProduct = getLocalizedReportProduct(
              product,
              appLanguage,
            );

            return (
            <button
              aria-pressed={product.id === selectedReportId}
              className={
                product.id === selectedReportId
                  ? 'report-product-card active'
                  : 'report-product-card'
              }
              key={product.id}
              onClick={() => setSelectedReportId(product.id)}
              type="button"
            >
              <span>{localizedProduct.badge}</span>
              <strong>{localizedProduct.title}</strong>
              <em>{localizedProduct.outcome}</em>
              <small>{localizedProduct.bestFor}</small>
            </button>
            );
          })}
        </div>

        <div className="report-selected-panel">
          <div>
            <div className="section-title">{builderCopy.selectedReport}</div>
            <h3>{localizedSelectedReport.title}</h3>
            <p>{localizedSelectedReport.bestFor}</p>
            <small>{localizedSelectedReport.purchaseHint}</small>
          </div>
          <div className="report-depth-grid">
            <div>
              <span>{builderCopy.freePreview}</span>
              <p>{localizedSelectedReport.freeDepth}</p>
              <ul>
                {localizedSelectedReport.freeIncludes.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>{builderCopy.premiumDepth}</span>
              <p>{localizedSelectedReport.premiumDepth}</p>
              <ul>
                {localizedSelectedReport.premiumIncludes.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="report-selected-actions">
            <button className="button" onClick={openReportPreview} type="button">
              {builderCopy.previewSelected}
            </button>
            <a
              className="button secondary"
              href={buildReportAskHref(selectedReport, kundli?.id)}
            >
              {builderCopy.askFromReport}
            </a>
          </div>
        </div>
      </section>

      <section className="report-builder glass-panel">
        <div className="report-builder-header">
          <div>
            <div className="section-title">{builderCopy.eyebrow}</div>
            <h2>{builderCopy.title}</h2>
            <p>{builderCopy.intro}</p>
          </div>
        <div className="report-builder-count">
            <span>{builderCopy.selected}</span>
            <strong>
              {selectedSectionCount}/{sectionOptions.length}
            </strong>
          </div>
        </div>

        <details className="report-drawer">
          <summary>
            <span>{builderCopy.compareDepth}</span>
            <strong>{builderCopy.differenceEyebrow}</strong>
          </summary>
          <div className="report-builder-access-row">
            <div>
              <span>{builderCopy.freeAccessLabel}</span>
              <strong>{builderCopy.freeAccessTitle}</strong>
              <p>{builderCopy.freeAccessBody}</p>
            </div>
            <div className={mode === 'PREMIUM' ? 'active' : ''}>
              <span>{builderCopy.premiumAccessLabel}</span>
              <strong>{builderCopy.premiumAccessTitle}</strong>
              <p>{builderCopy.premiumAccessBody}</p>
              <a className="button secondary" href="/dashboard/premium">
                {builderCopy.premiumAccessCta}
              </a>
            </div>
          </div>

          <div className="report-difference-table-wrap">
            <div className="section-title">{builderCopy.differenceEyebrow}</div>
            <table className="report-difference-table">
              <thead>
                <tr>
                  <th>{builderCopy.differenceColumn}</th>
                  <th>{labels.free}</th>
                  <th>{labels.premium}</th>
                </tr>
              </thead>
              <tbody>
                {differenceRows.map(row => (
                  <tr key={row.area}>
                    <td data-label={builderCopy.differenceColumn}>{row.area}</td>
                    <td data-label={labels.free}>{row.free}</td>
                    <td data-label={labels.premium}>{row.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <div className="report-builder-choice-row" role="group" aria-label={builderCopy.title}>
          <button
            aria-pressed={builderMode === 'EVERYTHING'}
            className={
              builderMode === 'EVERYTHING'
                ? 'report-builder-choice active'
                : 'report-builder-choice'
            }
            onClick={selectEverything}
            type="button"
          >
            <span>{builderCopy.everythingLabel}</span>
            <strong>{builderCopy.everythingTitle}</strong>
            <small>{builderCopy.everythingBody}</small>
          </button>
          <button
            aria-pressed={builderMode === 'CUSTOM'}
            className={
              builderMode === 'CUSTOM'
                ? 'report-builder-choice active'
                : 'report-builder-choice'
            }
            onClick={selectCustomStarter}
            type="button"
          >
            <span>{builderCopy.customLabel}</span>
            <strong>{builderCopy.customTitle}</strong>
            <small>{builderCopy.customBody}</small>
          </button>
        </div>

        <details className="report-drawer">
          <summary>
            <span>{builderCopy.seeEverythingIncluded}</span>
            <strong>{builderCopy.everythingIncludesTitle}</strong>
          </summary>
          <div className="report-included-list">
            <div>
              <div className="section-title">{builderCopy.everythingIncludesEyebrow}</div>
              <h3>{builderCopy.everythingIncludesTitle}</h3>
              <p>{builderCopy.everythingIncludesBody}</p>
            </div>
            <div className="report-included-grid">
              {getComprehensiveReportSections(reportLanguage).map(section => (
                <span key={`${section.eyebrow}-${section.title}`}>
                  {section.title}
                </span>
              ))}
            </div>
          </div>
        </details>

        <section className="report-language-panel" aria-label={reportLanguageCopy.title}>
          <div>
            <span>{reportLanguageCopy.eyebrow}</span>
            <strong>{reportLanguageCopy.title}</strong>
            <p>
              {appLanguage === reportLanguage
                ? reportLanguageCopy.body
                : reportLanguageCopy.differentBody}
            </p>
          </div>
          <div className="report-language-options" role="group" aria-label={reportLanguageCopy.title}>
            {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
              <button
                aria-pressed={option.code === reportLanguage}
                className={option.code === reportLanguage ? 'active' : ''}
                key={option.code}
                onClick={() => setReportLanguage(option.code)}
                type="button"
              >
                <span>{option.nativeName}</span>
                <small>{option.englishName}</small>
              </button>
            ))}
          </div>
        </section>

        <div className="report-builder-section-grid">
          {sectionOptions.map(({ key, section }) => (
            <label
              className={
                kundli
                  ? 'report-builder-section'
                  : 'report-builder-section preview'
              }
              key={key}
            >
              <input
                checked={builderMode === 'EVERYTHING' || selectedKeySet.has(key)}
                onChange={() => toggleSection(key)}
                type="checkbox"
              />
              <span>{formatReportSectionEyebrow(section.eyebrow, reportLanguage)}</span>
              <strong>{section.title}</strong>
              <small>
                {kundli
                  ? formatReportSectionMeta({
                      confidence: section.confidence ?? 'medium',
                      language: reportLanguage,
                      labels: reportLabels,
                      tier: section.tier ?? 'free',
                    })
                  : builderCopy.createKundliToSelect}
              </small>
            </label>
          ))}
        </div>

        <div className="report-builder-actions">
          <button className="button primary" onClick={openReportPreview} type="button">
            {builderCopy.previewBuilder}
          </button>
          <button className="button secondary" onClick={copyReportSummary} type="button">
            {copyState === 'report' ? builderCopy.copied : builderCopy.copyReport}
          </button>
        </div>
        {!user ? (
          <div className="report-account-panel">
            <div>
              <strong>{builderCopy.signInNudgeTitle}</strong>
              <p>{builderCopy.signInNudgeBody}</p>
            </div>
            <AuthDialog />
          </div>
        ) : null}
        {copyState === 'empty' ? (
          <p className="report-builder-note">{builderCopy.emptySelection}</p>
        ) : copyState === 'needKundli' ? (
          <p className="report-builder-note important">
            {builderCopy.needKundli}{' '}
            <a href="/dashboard/kundli">{builderCopy.createKundliCta}</a>
          </p>
        ) : (
          <p className="report-builder-note">{builderCopy.note}</p>
        )}
      </section>

      <div className="dossier-toolbar">
        <div className="dossier-mode-switch" aria-label={labels.reportDepth}>
          <button
            className={mode === 'FREE' ? 'active' : ''}
            onClick={() => setMode('FREE')}
            type="button"
          >
            {labels.free}
          </button>
          <button
            className={mode === 'PREMIUM' ? 'active' : ''}
            onClick={() => setMode('PREMIUM')}
            type="button"
          >
            {labels.premium}
          </button>
        </div>
      </div>

      <details
        className="report-drawer report-preview-drawer"
        onToggle={event => setReportPreviewOpen(event.currentTarget.open)}
        open={isReportPreviewOpen}
      >
        <summary>
          <span>{builderCopy.previewDrawerTitle}</span>
          <strong>{builderCopy.previewDrawerAction}</strong>
        </summary>
        <p className="report-preview-drawer-body">{builderCopy.previewDrawerBody}</p>
        {isReportPreviewOpen ? (
        <div className="report-preview-content" ref={reportPreviewRef}>
      <section
        className={
          mode === 'PREMIUM'
            ? 'report-print-cover premium'
            : 'report-print-cover free'
        }
        data-chart-theme={reportChartTheme}
      >
        <div>
          <span>{reportPrintCopy.coverEyebrow}</span>
          <h1>{localizedReportTitle.title}</h1>
          <h2>{reportPrintCopy.tagline}</h2>
          <p>{report.cover.subtitle}</p>
          <p>{report.cover.metadata.join(' • ')}</p>
        </div>
        <strong>{mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free}</strong>
      </section>

      <section
        className={
          mode === 'PREMIUM'
            ? 'report-print-brand-header premium'
            : 'report-print-brand-header free'
        }
        data-chart-theme={reportChartTheme}
      >
        <div>
          <span>PREDICTA</span>
          <p>{reportPrintCopy.brandLine}</p>
        </div>
        <strong>{localizedReportTitle.title}</strong>
      </section>

      <section className="dossier-hero glass-panel">
        <div>
          <div className="section-title">
            {localizedReportTitle.title.toUpperCase()} · DOSSIER {report.dossierVersion}
          </div>
          <h2>
            {mode === 'PREMIUM'
              ? reportPrintCopy.premiumPreview
              : reportPrintCopy.freePreview}
          </h2>
          <p>{report.executiveSummary.headline}</p>
        </div>
        <div className="dossier-confidence">
          <span>{labels.confidence}</span>
          <strong>
            {getConfidenceLabel(reportLanguage, report.executiveSummary.confidence)}
          </strong>
        </div>
      </section>

      <div className="dossier-signal-grid">
        {report.executiveSummary.keySignals.map(signal => (
          <div className="dossier-signal" key={signal}>
            <span>{labels.keySignal}</span>
            <p>{signal}</p>
          </div>
        ))}
      </div>

      <WebTrustProofPanel trust={report.trustProfile} />

      {report.chartSnapshots.length ? (
        <section className="report-chart-sync-panel glass-panel" ref={reportChartPanelRef}>
          <div className="section-title">{reportPrintCopy.chartsEyebrow}</div>
          <h2>{reportPrintCopy.chartsTitle}</h2>
          <p>{reportPrintCopy.chartsBody}</p>
          <div className="report-chart-sync-actions">
            <button className="button" onClick={printReport} type="button">
              {builderCopy.printSelected}
            </button>
          </div>
          <div className="report-chart-sync-grid">
            {report.chartSnapshots.slice(0, 4).map(snapshot => (
              <ReportChartSnapshot
                birthTime={kundli?.birthDetails.time}
                key={`${snapshot.chartType}-${snapshot.chartName}`}
                language={reportLanguage}
                snapshot={snapshot}
              />
            ))}
          </div>
        </section>
      ) : null}

      <div className="report-section-list">
        {visibleSections.map(section => (
          <DossierSection
            key={`${report.mode}-${section.title}`}
            language={reportLanguage}
            section={section}
          />
        ))}
      </div>

          <section className="report-print-safety-footer">
            <strong>{reportPrintCopy.safetyTitle}</strong>
            <p>{reportPrintCopy.safetyBody}</p>
          </section>

          <div className="report-preview-actions">
            <button className="button" onClick={printReport} type="button">
              {builderCopy.printSelected}
            </button>
            <button className="button secondary" onClick={copyReportSummary} type="button">
              {copyState === 'report' ? builderCopy.copied : builderCopy.copyReport}
            </button>
            <button className="button secondary" onClick={copyChatTranscript} type="button">
              {copyState === 'chat' ? builderCopy.copied : builderCopy.copyChat}
            </button>
            <button
              className="button secondary"
              onClick={openPrintableWebChatTranscript}
              type="button"
            >
              {builderCopy.downloadChatPdf}
            </button>
          </div>
        </div>
        ) : null}
      </details>
    </div>
  );
}

function ReportChartSnapshot({
  birthTime,
  language,
  snapshot,
}: {
  birthTime?: string;
  language: SupportedLanguage;
  snapshot: PdfChartSnapshot;
}): React.JSX.Element {
  const chartThemeNote = getChartThemeNote({
    language,
    theme: snapshot.theme,
    time: birthTime,
  });

  return (
    <article
      className="report-chart-snapshot"
      data-chart-theme={snapshot.theme}
    >
      <div className="report-chart-snapshot-header">
        <div>
          <span>{snapshot.chartType}</span>
          <strong>{snapshot.displayChartName ?? snapshot.chartName}</strong>
        </div>
        <small>{snapshot.school}</small>
      </div>
      <div
        aria-label={`${snapshot.displayChartName ?? snapshot.chartName} North Indian chart`}
        className="report-chart-mini north-chart report-chart-board"
        data-chart-presentation="report"
        data-chart-theme={snapshot.theme}
      >
        <NorthIndianChartLines />
        {snapshot.cells.map(cell => (
          <div
            className={`north-house-label north-house-label-${cell.house} north-house-label-${cell.labelDensity}`}
            data-density={cell.labelDensity}
            key={`${snapshot.chartType}-${cell.house}`}
          >
            <span className="north-house-meta">
              <span className="north-house-number">{cell.house}</span>
              <span className="north-sign-name">{cell.displaySign}</span>
              <span className="north-sign-symbol">{cell.signGlyph}</span>
              <span className="north-sign-number">{cell.signNumber}</span>
            </span>
            {cell.planets.length ? (
              <small className="north-planet-stack">
                {cell.planets.map((planet, index) => (
                  <PlanetGlyph
                    animationIndex={index}
                    animationSurface="standard"
                    key={planet.key}
                    moonPhase={snapshot.moonPhase}
                    planet={planet}
                    showDegree={cell.showPlanetDegrees}
                    showSign={cell.showPlanetSign}
                    showStatusMarks={cell.showPlanetStatusMarks}
                    size={cell.planetGlyphSize}
                  />
                ))}
                {cell.hiddenPlanetCount ? (
                  <span className="chart-overflow-counter">+{cell.hiddenPlanetCount}</span>
                ) : null}
              </small>
            ) : null}
          </div>
        ))}
      </div>
      {snapshot.moonNakshatraPada ? (
        <p>
          Moon: {snapshot.moonNakshatraPada.moonPhaseLabel}. Birth star:{' '}
          {snapshot.moonNakshatraPada.moonNakshatra}
          {snapshot.moonNakshatraPada.pada
            ? ` pada ${snapshot.moonNakshatraPada.pada}`
            : ''}
          .
        </p>
      ) : null}
      <div className="report-chart-theme-note">
        <span>{chartThemeNote.eyebrow}</span>
        <strong>{chartThemeNote.title}</strong>
        <p>{chartThemeNote.body}</p>
      </div>
      {snapshot.legend.length ? (
        <div className="report-chart-mini-legend">
          {snapshot.legend.map(item => (
            <span key={`${snapshot.chartType}-${item.code}`}>
              <b>{item.code}</b> {item.description}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function getReportSectionKey(section: PdfSection, index: number): string {
  return `${index}-${section.eyebrow}-${section.title}`;
}

function getLocalizedPurchaseGuideItem(
  item: ReportPurchaseGuide,
  language: SupportedLanguage,
): ReportPurchaseGuide {
  if (language === 'hi') {
    const map: Record<string, ReportPurchaseGuide> = {
      'One-time report': {
        body: 'जब किसी साफ जीवन सवाल के लिए एक सुंदर पीडीएफ चाहिए, इसे चुनें.',
        cta: 'एक रिपोर्ट चुनें',
        label: 'एक बार की रिपोर्ट',
        title: 'मुझे एक जवाब अच्छे से तैयार चाहिए',
      },
      Subscription: {
        body: 'जब नियमित समय मार्गदर्शन, गहरी चैट, उपाय और मासिक योजना चाहिए, इसे चुनें.',
        cta: 'प्रीमियम देखें',
        label: 'सदस्यता',
        title: 'मुझे हर महीने मार्गदर्शन चाहिए',
      },
      'Day Pass': {
        body: 'निर्णय लेने से पहले पूरा अनुभव आजमाना हो, इसे चुनें.',
        cta: 'डे पास आजमाएं',
        label: 'डे पास',
        title: 'मैं आज सब कुछ आजमाना चाहता/चाहती हूं',
      },
    };

    return map[item.label] ?? item;
  }

  if (language === 'gu') {
    const map: Record<string, ReportPurchaseGuide> = {
      'One-time report': {
        body: 'સ્પષ્ટ જીવન પ્રશ્ન માટે એક સુંદર પીડીએફ જોઈએ ત્યારે આ પસંદ કરો.',
        cta: 'એક રિપોર્ટ પસંદ કરો',
        label: 'એક વારની રિપોર્ટ',
        title: 'મને એક જવાબ સારી રીતે તૈયાર જોઈએ',
      },
      Subscription: {
        body: 'નિયમિત સમય માર્ગદર્શન, ઊંડી ચેટ, ઉપાયો અને માસિક યોજના જોઈએ ત્યારે આ પસંદ કરો.',
        cta: 'પ્રીમિયમ જુઓ',
        label: 'સભ્યતા',
        title: 'મારે દર મહિને માર્ગદર્શન જોઈએ',
      },
      'Day Pass': {
        body: 'નિર્ણય કરતા પહેલાં આખો અનુભવ અજમાવવો હોય ત્યારે આ પસંદ કરો.',
        cta: 'ડે પાસ અજમાવો',
        label: 'ડે પાસ',
        title: 'હું આજે બધું અજમાવવા માગું છું',
      },
    };

    return map[item.label] ?? item;
  }

  return item;
}

function getLocalizedReportProduct(
  product: ReportMarketplaceProduct,
  language: SupportedLanguage,
): ReportMarketplaceProduct {
  if (language === 'hi') {
    const map: Partial<Record<ReportMarketplaceProduct['id'], Partial<ReportMarketplaceProduct>>> = {
      KUNDLI: {
        badge: 'आधार',
        bestFor: 'पूरे चार्ट के लिए साफ शुरुआत.',
        freeDepth: 'कुंडली, सभी दिखने वाले चार्ट और उपयोगी चार्ट संकेत.',
        freeIncludes: ['सभी दिखने वाले चार्ट', 'कुंडली सारांश', 'वर्तमान दशा', 'उपयोगी उपाय'],
        outcome: 'उलझे बिना पूरा चार्ट समझें.',
        premiumDepth: 'सभी चार्ट, दशा, गोचर, योग और उपाय का पूरा सार.',
        premiumIncludes: ['पूरा चार्ट सार', 'दशा और गोचर समय', 'योग और बल', 'प्रीमियम पीडीएफ संरचना'],
        purchaseHint: 'जब पूरा जीवन सार चाहिए, यह सबसे अच्छी पहली रिपोर्ट है.',
        title: 'कुंडली रिपोर्ट',
      },
      VEDIC: {
        badge: 'वैदिक',
        bestFor: 'पराशरी D1, वर्ग चार्ट, दशा, गोचर और उपाय एक वैदिक रिपोर्ट में.',
        freeDepth: 'D1, मुख्य वर्ग, दशा, गोचर और उपाय से उपयोगी वैदिक रिपोर्ट.',
        freeIncludes: ['D1 प्रमाण', 'मुख्य वर्ग झलक', 'वर्तमान दशा', 'सुरक्षित उपाय दिशा'],
        outcome: 'दूसरी पद्धतियां मिलाए बिना वैदिक प्रेडिक्टा से चार्ट पढ़ें.',
        premiumDepth: 'वर्ग गहराई, समय खिड़कियां और उपाय पथ वाली विस्तृत वैदिक प्रेडिक्टा रिपोर्ट.',
        premiumIncludes: ['पूरा वर्ग सार', 'दशा और गोचर समय', 'प्रमाण तालिकाएं', 'उपाय योजना'],
        purchaseHint: 'जब साफ चार्ट प्रमाण के साथ मुख्य वैदिक ज्योतिष पढ़ाई चाहिए.',
        title: 'वैदिक प्रेडिक्टा रिपोर्ट',
      },
      KP: {
        badge: 'KP',
        bestFor: 'घटना प्रश्न, कस्प प्रमाण, स्टार लॉर्ड, सब-लॉर्ड, रूलिंग प्लैनेट और सिग्निफिकेटर.',
        freeDepth: 'कस्प और सब-लॉर्ड पर केंद्रित उपयोगी कृष्णमूर्ति पद्धति प्रमाण पथ.',
        freeIncludes: ['कृष्णमूर्ति पद्धति कस्प झलक', 'स्टार/सब-लॉर्ड प्रमाण', 'घटना भाव', 'पद्धति सीमा'],
        outcome: 'घटना प्रश्नों को कृष्णमूर्ति पद्धति प्रेडिक्टा से पढ़ें, पराशरी मिश्रण के बिना.',
        premiumDepth: 'कस्प chain, सिग्निफिकेटर, रूलिंग प्लैनेट और घटना समय वाली विस्तृत कृष्णमूर्ति पद्धति रिपोर्ट.',
        premiumIncludes: ['सभी 12 कस्प', 'सिग्निफिकेटर मानचित्र', 'रूलिंग प्लैनेट सहारा', 'समय भरोसा'],
        purchaseHint: 'नौकरी बदलाव, विवाह समय, मंजूरी या घटना-निर्णय के लिए अच्छा.',
        title: 'कृष्णमूर्ति पद्धति प्रेडिक्टा रिपोर्ट',
      },
      NADI: {
        badge: 'नाड़ी',
        bestFor: 'ग्रह कथा-संबंध, कर्म ढांचा, सत्यापन प्रश्न और समय संकेत.',
        freeDepth: 'गणना किए गए चार्ट संबंधों से उपयोगी नाड़ी ढांचा झलक.',
        freeIncludes: ['कथा-संबंध झलक', 'कर्म विषय', 'सत्यापन प्रश्न', 'सुरक्षा सीमा'],
        outcome: 'झूठे पांडुलिपि दावे के बिना ग्रह-से-ग्रह ढांचा पढ़ें.',
        premiumDepth: 'कथा-संबंध, सत्यापन, समय संकेत और चिंतन पथ वाली विस्तृत नाड़ी रिपोर्ट.',
        premiumIncludes: ['ढांचा क्रम', 'सत्यापन गहराई', 'समय संकेत', 'चिंतन अभ्यास'],
        purchaseHint: 'बार-बार आने वाले जीवन ढांचे और कर्म विषय समझने के लिए अच्छा.',
        title: 'नाड़ी प्रेडिक्टा रिपोर्ट',
      },
      CAREER: {
        badge: 'काम',
        bestFor: 'करियर दिशा, नौकरी समय और काम के दबाव.',
        freeDepth: '10वें भाव, D10, दशा और गोचर से सरल करियर ध्यान.',
        freeIncludes: ['करियर भाव', 'D10 संकेत', 'वर्तमान काम दबाव', 'एक व्यावहारिक कदम'],
        outcome: 'काम की दिशा, समय दबाव और बेहतर अगला कदम देखें.',
        premiumDepth: 'करियर समय, भूमिका मेल, पदोन्नति अवसर और कार्य योजना.',
        premiumIncludes: ['भूमिका मेल', 'पदोन्नति/बदलाव अवसर', 'D1 और D10 सार', 'मासिक कार्य योजना'],
        purchaseHint: 'नौकरी बदलाव, पदोन्नति, व्यापार या करियर दिशा के लिए अच्छा.',
        title: 'करियर रिपोर्ट',
      },
      MARRIAGE: {
        badge: 'विवाह',
        bestFor: 'विवाह संभावना, रिश्ते की परिपक्वता और जीवनसाथी संकेत.',
        freeDepth: 'D1 और D9 रिश्ते के संकेत भरोसे के साथ.',
        freeIncludes: ['D1 रिश्ते का संकेत', 'D9 झलक', 'शुक्र/बृहस्पति स्वभाव', 'नरम सावधानी'],
        outcome: 'रिश्ते की परिपक्वता, समय और साथी के संकेत समझें.',
        premiumDepth: 'D1 और D9 का सार, समय अवसर, उपाय और सावधानियां नरमी से.',
        premiumIncludes: ['D1 और D9 सार', 'समय अवसर', 'मिलान सावधानियां', 'रिश्ते के उपाय'],
        purchaseHint: 'विवाह समय, साथी स्वभाव, देरी या परिवार चर्चा के लिए अच्छा.',
        title: 'विवाह रिपोर्ट',
      },
      WEALTH: {
        badge: 'धन',
        bestFor: 'आय, बचत, धन आदतें और आर्थिक समय.',
        freeDepth: 'धन भाव, वर्तमान दशा स्वभाव और व्यावहारिक मार्गदर्शन.',
        freeIncludes: ['2/11 भाव संकेत', 'दशा धन स्वभाव', 'बचत सावधानी', 'एक जमीन से जुड़ी आदत'],
        outcome: 'धन प्रवाह, बचत आदतें और बेहतर आर्थिक समय पढ़ें.',
        premiumDepth: 'D2, दूसरे और ग्यारहवें भाव का सार, समय अवसर और मासिक योजना.',
        premiumIncludes: ['D2 धन सार', 'आय और लाभ अवसर', 'मासिक योजना', 'जोखिम और अनुशासन मानचित्र'],
        purchaseHint: 'आय, बचत, निवेश समय या कर्ज दबाव के लिए अच्छा.',
        title: 'धन रिपोर्ट',
      },
      SADESATI: {
        badge: 'शनि',
        bestFor: 'साढ़े साती चरण, दबाव अवसर, अनुशासन और सहारा.',
        freeDepth: 'वर्तमान साढ़े साती स्थिति, चरण और सरल मार्गदर्शन.',
        freeIncludes: ['वर्तमान चरण', 'शनि स्वभाव', 'सरल सावधानी', 'शनि कर्म उपाय'],
        outcome: 'शनि दबाव को डर के बिना समझें.',
        premiumDepth: 'सटीक चरण पढ़ाई, शनि गोचर तिथियां, अष्टकवर्ग सहारा और उपाय.',
        premiumIncludes: ['सटीक चरण पढ़ाई', 'शनि तिथियां', 'अष्टकवर्ग सहारा', 'उपाय और अनुशासन योजना'],
        purchaseHint: 'दबाव, देरी, जिम्मेदारी या शनि से जुड़े डर के लिए अच्छा.',
        title: 'साढ़े साती रिपोर्ट',
      },
      DASHA: {
        badge: 'समय',
        bestFor: 'जीवन अवधि, मोड़ और अभी क्या सक्रिय है.',
        freeDepth: 'वर्तमान महादशा और अंतरदशा स्वभाव सरल भाषा में.',
        freeIncludes: ['वर्तमान महादशा', 'वर्तमान अंतरदशा', 'जीवन स्वभाव', 'अगला समय संकेत'],
        outcome: 'अभी कौन सा जीवन अध्याय सक्रिय है और आगे क्या आता है, देखें.',
        premiumDepth: 'महादशा, अंतरदशा, प्रत्यंतरदशा, सक्रियता और समय मानचित्र.',
        premiumIncludes: ['दशा वृक्ष', 'प्रत्यंतरदशा विवरण', 'सक्रियता समय', 'अवसरों वाला जीवन मानचित्र'],
        purchaseHint: 'जब सवाल “अभी क्यों?” हो या जीवन समय मानचित्र चाहिए.',
        title: 'दशा Life Map',
      },
      COMPATIBILITY: {
        badge: 'मिलान',
        bestFor: 'विवाह मिलान, परिवार चर्चा और मिलान की स्पष्टता.',
        freeDepth: 'सरल मिलान स्वभाव और मुख्य सावधानी क्षेत्र.',
        freeIncludes: ['मिलान स्वभाव', 'मुख्य सहारे', 'मुख्य सावधानियां', 'नरम सार'],
        outcome: 'मिलान को परिवार के साथ समझना आसान बनाएं.',
        premiumDepth: 'अष्टकूट, मांगलिक, D1/D9 तुलना, समय और रिश्ते का मार्गदर्शन.',
        premiumIncludes: ['अष्टकूट', 'मांगलिक जांच', 'D1/D9 तुलना', 'समय और व्यावहारिक मार्गदर्शन'],
        purchaseHint: 'विवाह या परिवार मिलान बातचीत के लिए अच्छा.',
        title: 'कम्पैटिबिलिटी रिपोर्ट',
      },
      NUMEROLOGY: {
        badge: 'अंक',
        bestFor: 'नाम rhythm, जन्म अंक, भाग्य अंक और निजी समय.',
        freeDepth: 'नाम, जन्म, भाग्य और आज के निजी अंक की उपयोगी समझ.',
        freeIncludes: ['नाम अंक', 'जन्म अंक', 'भाग्य अंक', 'आज का निजी rhythm'],
        outcome: 'नाम और जन्मतिथि के अंक pattern को आसानी से समझें.',
        premiumDepth: 'नाम spelling तुलना, निजी साल/महीना/दिन map, compatibility numbers और गहरी PDF.',
        premiumIncludes: ['नाम spelling तुलना', 'निजी timing map', 'Compatibility numbers', 'अंक ज्योतिष PDF section'],
        purchaseHint: 'जब नाम, जन्मतिथि या spelling rhythm से guidance चाहिए.',
        title: 'अंक ज्योतिष रिपोर्ट',
      },
      SIGNATURE: {
        badge: 'हस्ताक्षर',
        bestFor: 'हस्ताक्षर आत्म-अभिव्यक्ति, भरोसे की शैली और सुधार मार्गदर्शन.',
        freeDepth: 'सुरक्षित आत्म-अभिव्यक्ति मार्गदर्शन के साथ हस्ताक्षर संकेतों का उपयोगी वाचन.',
        freeIncludes: ['दृश्य संकेत वाचन', 'सुरक्षा सीमा', 'ताकत और देखभाल बिंदु', 'सरल अभ्यास'],
        outcome: 'आपकी हस्ताक्षर शैली क्या दिखाती है और उसे सुरक्षित तरीके से कैसे सुधारें.',
        premiumDepth: 'सुधार योजना और वैकल्पिक अंक ज्योतिष संयुक्त सार के साथ विस्तृत हस्ताक्षर प्रेडिक्टा रिपोर्ट.',
        premiumIncludes: ['गहरी संकेत तुलना', 'सुधार योजना', 'વારંવાર હસ્તાક્ષર સમીક્ષા', 'अंक ज्योतिष + हस्ताक्षर संयुक्त सार'],
        purchaseHint: 'जब हस्ताक्षर-आधारित आत्म-अभिव्यक्ति मार्गदर्शन और सुंदर सुधार योजना चाहिए.',
        title: 'हस्ताक्षर रिपोर्ट',
      },
      REMEDIES: {
        badge: 'उपाय',
        bestFor: 'उपाय, आदतें, आध्यात्मिक अनुशासन और जमीन से जुड़ा सहारा.',
        freeDepth: 'सरल सुरक्षित उपाय और चिंतन अभ्यास.',
        freeIncludes: ['ग्रह ध्यान', 'सुरक्षित सरल उपाय', 'कर्म सीख', 'साप्ताहिक अभ्यास'],
        outcome: 'चार्ट दबाव को कर्म-आधारित कदम में बदलें.',
        premiumDepth: 'ग्रह-विशेष उपाय, समय, निरंतरता ट्रैकर और सुरक्षा नोट.',
        premiumIncludes: ['ग्रह-विशेष मार्ग', 'मंत्र/सेवा/अनुशासन', 'नियमित लय', 'सुरक्षा और रुकने के नियम'],
        purchaseHint: 'जब सिर्फ क्या होगा नहीं, क्या करना है यह चाहिए.',
        title: 'उपाय रिपोर्ट',
      },
    };

    return { ...product, ...(map[product.id] ?? {}) };
  }

  if (language === 'gu') {
    const map: Partial<Record<ReportMarketplaceProduct['id'], Partial<ReportMarketplaceProduct>>> = {
      KUNDLI: {
        badge: 'આધાર',
        bestFor: 'પૂરા ચાર્ટ માટે સ્પષ્ટ શરૂઆત.',
        freeDepth: 'કુંડળી, બધા દેખાતા ચાર્ટ્સ અને ઉપયોગી ચાર્ટ સંકેત.',
        freeIncludes: ['બધા દેખાતા ચાર્ટ્સ', 'કુંડળી સારાંશ', 'વર્તમાન દશા', 'ઉપયોગી ઉપાયો'],
        outcome: 'ગૂંચવાયા વગર આખો ચાર્ટ સમજો.',
        premiumDepth: 'બધા ચાર્ટ્સ, દશા, ગોચર, યોગ અને ઉપાયોના સંપૂર્ણ સાર.',
        premiumIncludes: ['સંપૂર્ણ ચાર્ટ સાર', 'દશા અને ગોચર સમય', 'યોગ અને બળ', 'પ્રીમિયમ પીડીએફ રચના'],
        purchaseHint: 'જ્યારે સંપૂર્ણ જીવન સાર જોઈએ ત્યારે આ સારી પ્રથમ રિપોર્ટ છે.',
        title: 'કુંડળી રિપોર્ટ',
      },
      VEDIC: {
        badge: 'વૈદિક',
        bestFor: 'પરાશરી D1, વર્ગ ચાર્ટ્સ, દશા, ગોચર અને ઉપાયો એક વૈદિક રિપોર્ટમાં.',
        freeDepth: 'D1, મુખ્ય વર્ગ, દશા, ગોચર અને ઉપાયો પરથી ઉપયોગી વૈદિક રિપોર્ટ.',
        freeIncludes: ['D1 પુરાવો', 'મુખ્ય વર્ગ ઝલક', 'વર્તમાન દશા', 'સુરક્ષિત ઉપાય દિશા'],
        outcome: 'બીજી પદ્ધતિઓ ભેળવ્યા વગર વૈદિક પ્રેડિક્ટાથી ચાર્ટ વાંચો.',
        premiumDepth: 'વર્ગ ઊંડાઈ, સમય વિન્ડો અને ઉપાય પથ સાથે વિગતવાર વૈદિક પ્રેડિક્ટા રિપોર્ટ.',
        premiumIncludes: ['સંપૂર્ણ વર્ગ સાર', 'દશા અને ગોચર સમય', 'પુરાવા કોષ્ટકો', 'ઉપાય યોજના'],
        purchaseHint: 'સ્પષ્ટ ચાર્ટ પુરાવા સાથે મુખ્ય વૈદિક જ્યોતિષ વાંચન જોઈએ ત્યારે સારું.',
        title: 'વૈદિક પ્રેડિક્ટા રિપોર્ટ',
      },
      KP: {
        badge: 'KP',
        bestFor: 'ઘટના પ્રશ્નો, cusp પુરાવો, star lord, sub-lord, ruling planets અને significators.',
        freeDepth: 'cusp અને sub-lord પર કેન્દ્રિત ઉપયોગી કૃષ્ણમૂર્તિ પદ્ધતિ પુરાવા માર્ગ.',
        freeIncludes: ['કૃષ્ણમૂર્તિ પદ્ધતિ cusp ઝલક', 'star/sub-lord પુરાવો', 'ઘટના ભાવ', 'પદ્ધતિ મર્યાદા'],
        outcome: 'ઘટના પ્રશ્નો કૃષ્ણમૂર્તિ પદ્ધતિ પ્રેડિક્ટાથી વાંચો, પરાશરી ભેળસેળ વગર.',
        premiumDepth: 'cusp chain, significators, ruling planets અને ઘટના સમય સાથે વિગતવાર કૃષ્ણમૂર્તિ પદ્ધતિ રિપોર્ટ.',
        premiumIncludes: ['બધા 12 cusp', 'significator નકશો', 'ruling planet સહારો', 'સમય વિશ્વાસ'],
        purchaseHint: 'નોકરી બદલાવ, લગ્ન સમય, મંજૂરી અથવા ઘટના નિર્ણય માટે સારું.',
        title: 'કૃષ્ણમૂર્તિ પદ્ધતિ પ્રેડિક્ટા રિપોર્ટ',
      },
      NADI: {
        badge: 'નાડી',
        bestFor: 'ગ્રહ કથા-સંબંધ, કર્મ બંધારણ, ચકાસણી પ્રશ્નો અને સમય સંકેત.',
        freeDepth: 'ગણતરી થયેલા ચાર્ટ સંબંધ પરથી ઉપયોગી નાડી બંધારણ ઝલક.',
        freeIncludes: ['કથા-સંબંધ ઝલક', 'કર્મ વિષય', 'ચકાસણી પ્રશ્નો', 'સુરક્ષા મર્યાદા'],
        outcome: 'ખોટા પાંડુલિપિ દાવા વગર ગ્રહ-થી-ગ્રહ બંધારણ વાંચો.',
        premiumDepth: 'કથા-સંબંધ, ચકાસણી, સમય સંકેત અને ચિંતન પથ સાથે વિગતવાર નાડી રિપોર્ટ.',
        premiumIncludes: ['બંધારણ ક્રમ', 'ચકાસણી ઊંડાઈ', 'સમય સંકેત', 'ચિંતન અભ્યાસ'],
        purchaseHint: 'વારંવાર આવતાં જીવન બંધારણ અને કર્મ વિષય સમજવા માટે સારું.',
        title: 'નાડી પ્રેડિક્ટા રિપોર્ટ',
      },
      CAREER: {
        badge: 'કામ',
        bestFor: 'કારકિર્દી દિશા, નોકરી સમય અને કામના દબાણ.',
        freeDepth: '10મા ભાવ, D10, દશા અને ગોચરથી સરળ કારકિર્દી ધ્યાન.',
        freeIncludes: ['કારકિર્દી ભાવ', 'D10 સંકેત', 'વર્તમાન કામ દબાણ', 'એક વ્યવહારુ પગલું'],
        outcome: 'કામની દિશા, સમય દબાણ અને સારું આગળનું પગલું જુઓ.',
        premiumDepth: 'કારકિર્દી સમય, ભૂમિકા મેળ, પ્રમોશન તક અને કાર્ય યોજના.',
        premiumIncludes: ['ભૂમિકા મેળ', 'પ્રમોશન/બદલાવ તક', 'D1 અને D10 સાર', 'માસિક કાર્ય યોજના'],
        purchaseHint: 'નોકરી બદલાવ, પ્રમોશન, વ્યવસાય અથવા કારકિર્દી દિશા માટે સારું.',
        title: 'કારકિર્દી રિપોર્ટ',
      },
      MARRIAGE: {
        badge: 'લગ્ન',
        bestFor: 'લગ્ન સંભાવના, સંબંધની પરિપક્વતા અને સાથીના સંકેતો.',
        freeDepth: 'D1 અને D9 સંબંધ સંકેતો વિશ્વાસ સાથે.',
        freeIncludes: ['D1 સંબંધ સંકેત', 'D9 ઝલક', 'શુક્ર/બૃહસ્પતિ સ્વભાવ', 'નરમ સાવધાની'],
        outcome: 'સંબંધની પરિપક્વતા, સમય અને સાથીના સંકેતો સમજો.',
        premiumDepth: 'D1 અને D9 સાર, સમય તક, ઉપાયો અને સાવધાનીઓ નરમાઈથી.',
        premiumIncludes: ['D1 અને D9 સાર', 'સમય તક', 'મિલાન સાવધાનીઓ', 'સંબંધ ઉપાયો'],
        purchaseHint: 'લગ્ન સમય, સાથી સ્વભાવ, વિલંબ અથવા પરિવાર ચર્ચા માટે સારું.',
        title: 'લગ્ન રિપોર્ટ',
      },
      WEALTH: {
        badge: 'ધન',
        bestFor: 'આવક, બચત, ધન આદતો અને આર્થિક સમય.',
        freeDepth: 'ધન ભાવ, વર્તમાન દશા સ્વભાવ અને વ્યવહારુ માર્ગદર્શન.',
        freeIncludes: ['2/11 ભાવ સંકેત', 'દશા ધન સ્વભાવ', 'બચત સાવધાની', 'એક જમીનથી જોડાયેલી આદત'],
        outcome: 'ધન પ્રવાહ, બચત આદતો અને સારો આર્થિક સમય વાંચો.',
        premiumDepth: 'D2, બીજા અને અગિયારમા ભાવનો સાર, સમય તક અને માસિક યોજના.',
        premiumIncludes: ['D2 ધન સાર', 'આવક અને લાભ તક', 'માસિક યોજના', 'જોખમ અને શિસ્ત નકશો'],
        purchaseHint: 'આવક, બચત, રોકાણ સમય અથવા દેવું દબાણ માટે સારું.',
        title: 'ધન રિપોર્ટ',
      },
      SADESATI: {
        badge: 'શનિ',
        bestFor: 'સાડેસાતી તબક્કો, દબાણ તક, શિસ્ત અને સહારો.',
        freeDepth: 'વર્તમાન સાડેસાતી સ્થિતિ, તબક્કો અને સરળ માર્ગદર્શન.',
        freeIncludes: ['વર્તમાન તબક્કો', 'શનિ સ્વભાવ', 'સરળ સાવધાની', 'શનિ કર્મ ઉપાય'],
        outcome: 'શનિ દબાણ ને ડર વગર સમજો.',
        premiumDepth: 'ચોક્કસ તબક્કા વાંચન, શનિ ગોચર તારીખો, અષ્ટકવર્ગ સહારો અને ઉપાયો.',
        premiumIncludes: ['ચોક્કસ તબક્કા વાંચન', 'શનિ તારીખો', 'અષ્ટકવર્ગ સહારો', 'ઉપાય અને શિસ્ત યોજના'],
        purchaseHint: 'દબાણ, વિલંબ, જવાબદારી અથવા શનિથી જોડાયેલા ડર માટે સારું.',
        title: 'સાડેસાતી રિપોર્ટ',
      },
      DASHA: {
        badge: 'સમય',
        bestFor: 'જીવન અવધિ, વળાંક અને હાલમાં શું સક્રિય છે.',
        freeDepth: 'વર્તમાન મહાદશા અને અંતરદશા સ્વભાવ સરળ ભાષામાં.',
        freeIncludes: ['વર્તમાન મહાદશા', 'વર્તમાન અંતરદશા', 'જીવન સ્વભાવ', 'આગલો સમય સંકેત'],
        outcome: 'હમણાં કયો જીવન અધ્યાય સક્રિય છે અને આગળ શું આવે છે, જુઓ.',
        premiumDepth: 'મહાદશા, અંતરદશા, પ્રત્યંતરદશા, સક્રિયતા અને સમય નકશો.',
        premiumIncludes: ['દશા વૃક્ષ', 'પ્રત્યંતરદશા વિગત', 'સક્રિયતા સમય', 'તકવાળો જીવન નકશો'],
        purchaseHint: 'જ્યારે “હમણાં કેમ?” એવો પ્રશ્ન હોય અથવા જીવન સમય નકશો જોઈએ.',
        title: 'દશા Life Map',
      },
      COMPATIBILITY: {
        badge: 'મિલાન',
        bestFor: 'લગ્ન મિલાન, પરિવાર ચર્ચા અને મિલાનની સ્પષ્ટતા.',
        freeDepth: 'સરળ મિલાન સ્વભાવ અને મુખ્ય સાવધાની ક્ષેત્રો.',
        freeIncludes: ['મિલાન સ્વભાવ', 'મુખ્ય સહારા', 'મુખ્ય સાવધાનીઓ', 'નરમ સાર'],
        outcome: 'મિલાનને પરિવાર સાથે સમજવું સરળ બનાવો.',
        premiumDepth: 'અષ્ટકૂટ, માંગલિક, D1/D9 સરખામણી, સમય અને સંબંધ માર્ગદર્શન.',
        premiumIncludes: ['અષ્ટકૂટ', 'માંગલિક તપાસ', 'D1/D9 સરખામણી', 'સમય અને વ્યવહારુ માર્ગદર્શન'],
        purchaseHint: 'લગ્ન અથવા પરિવાર મિલાન ચર્ચા માટે સારું.',
        title: 'કમ્પેટિબિલિટી રિપોર્ટ',
      },
      NUMEROLOGY: {
        badge: 'અંક',
        bestFor: 'નામ rhythm, જન્મ અંક, ભાગ્ય અંક અને વ્યક્તિગત સમય.',
        freeDepth: 'નામ, જન્મ, ભાગ્ય અને આજના વ્યક્તિગત અંકની ઉપયોગી સમજ.',
        freeIncludes: ['નામ અંક', 'જન્મ અંક', 'ભાગ્ય અંક', 'આજનો વ્યક્તિગત rhythm'],
        outcome: 'નામ અને જન્મ તારીખના અંક pattern ને સરળ રીતે સમજો.',
        premiumDepth: 'નામ spelling સરખામણી, વ્યક્તિગત વર્ષ/મહિનો/દિવસ map, compatibility numbers અને ઊંડી PDF.',
        premiumIncludes: ['નામ spelling સરખામણી', 'વ્યક્તિગત timing map', 'Compatibility numbers', 'અંક જ્યોતિષ PDF section'],
        purchaseHint: 'નામ, જન્મ તારીખ અથવા spelling rhythm પરથી guidance જોઈએ ત્યારે સારું.',
        title: 'અંક જ્યોતિષ રિપોર્ટ',
      },
      SIGNATURE: {
        badge: 'હસ્તાક્ષર',
        bestFor: 'હસ્તાક્ષર આત્મ-અભિવ્યક્તિ, વિશ્વાસની શૈલી અને સુધાર માર્ગદર્શન.',
        freeDepth: 'સુરક્ષિત આત્મ-અભિવ્યક્તિ માર્ગદર્શન સાથે હસ્તાક્ષર સંકેતોનું ઉપયોગી વાચન.',
        freeIncludes: ['દૃશ્ય સંકેત વાંચન', 'સુરક્ષા મર્યાદા', 'તાકાત અને કાળજી બિંદુઓ', 'સરળ અભ્યાસ'],
        outcome: 'તમારી હસ્તાક્ષર શૈલી શું બતાવે છે અને તેને સુરક્ષિત રીતે કેવી રીતે સુધારવી.',
        premiumDepth: 'સુધાર યોજના અને વૈકલ્પિક અંક જ્યોતિષ સંયુક્ત સાર સાથે વિગતવાર હસ્તાક્ષર પ્રેડિક્ટા રિપોર્ટ.',
        premiumIncludes: ['ઊંડી સંકેત સરખામણી', 'સુધાર યોજના', 'વારંવાર હસ્તાક્ષર સમીક્ષા', 'અંક જ્યોતિષ + હસ્તાક્ષર સંયુક્ત સાર'],
        purchaseHint: 'હસ્તાક્ષર-આધારિત આત્મ-અભિવ્યક્તિ માર્ગદર્શન અને સુંદર સુધાર યોજના જોઈએ ત્યારે સારું.',
        title: 'હસ્તાક્ષર રિપોર્ટ',
      },
      REMEDIES: {
        badge: 'ઉપાયો',
        bestFor: 'ઉપાયો, આદતો, આધ્યાત્મિક શિસ્ત અને જમીનથી જોડાયેલ સહારો.',
        freeDepth: 'સરળ સુરક્ષિત ઉપાયો અને વિચાર અભ્યાસ.',
        freeIncludes: ['ગ્રહ ધ્યાન', 'સુરક્ષિત સરળ ઉપાય', 'કર્મ શીખ', 'સાપ્તાહિક અભ્યાસ'],
        outcome: 'ચાર્ટ દબાણને કર્મ આધારિત પગલામાં બદલો.',
        premiumDepth: 'ગ્રહ-વિશેષ ઉપાયો, સમય, નિયમિતતા ટ્રેકર અને સુરક્ષા નોંધો.',
        premiumIncludes: ['ગ્રહ-વિશેષ માર્ગ', 'મંત્ર/સેવા/શિસ્ત', 'નિયમિત લય', 'સુરક્ષા અને રોકાવાના નિયમો'],
        purchaseHint: 'જ્યારે માત્ર શું થશે નહીં, શું કરવું તે જોઈએ.',
        title: 'ઉપાય રિપોર્ટ',
      },
    };

    return { ...product, ...(map[product.id] ?? {}) };
  }

  return product;
}

function getReportBuilderCopy(language: SupportedLanguage): {
  askFromReport: string;
  createKundliCta: string;
  createKundliToSelect: string;
  copyChat: string;
  copied: string;
  copyReport: string;
  customBody: string;
  customLabel: string;
  customTitle: string;
  compareDepth: string;
  differenceColumn: string;
  differenceEyebrow: string;
  downloadChatPdf: string;
  emptySelection: string;
  everythingBody: string;
  everythingIncludesBody: string;
  everythingIncludesEyebrow: string;
  everythingIncludesTitle: string;
  everythingLabel: string;
  everythingTitle: string;
  eyebrow: string;
  freeAccessBody: string;
  freeAccessLabel: string;
  freeAccessTitle: string;
  freePreview: string;
  helpChoosingReport: string;
  includesHeading: string;
  intro: string;
  marketplaceBody: string;
  marketplaceEyebrow: string;
  marketplacePromiseBody: string;
  marketplacePromiseTitle: string;
  marketplaceTitle: string;
  needKundli: string;
  note: string;
  openDrawer: string;
  plannedSectionBody: string;
  plannedSectionBulletFree: string;
  plannedSectionBulletPremium: string;
  plannedSectionEvidence: string;
  previewDrawerAction: string;
  previewDrawerBody: string;
  previewDrawerTitle: string;
  premiumAccessBody: string;
  premiumAccessCta: string;
  premiumAccessLabel: string;
  premiumAccessTitle: string;
  premiumDepth: string;
  previewBuilder: string;
  previewSelected: string;
  printSelected: string;
  selected: string;
  selectedReport: string;
  seeEverythingIncluded: string;
  signInNudgeBody: string;
  signInNudgeTitle: string;
  title: string;
} {
  if (language === 'hi') {
    return {
      askFromReport: 'इस रिपोर्ट से प्रेडिक्टा से पूछें',
      createKundliCta: 'कुंडली बनाएं',
      createKundliToSelect: 'यह भाग चुनने के लिए पहले कुंडली बनाएं',
      copied: 'कॉपी हो गया',
      copyChat: 'चैट कॉपी करें',
      copyReport: 'रिपोर्ट सारांश कॉपी करें',
      customBody: 'जन्म विवरण, चार्ट, दशा, उपाय, कृष्णमूर्ति पद्धति, नाड़ी या जो भाग चाहिए वही रखें.',
      customLabel: 'भाग चुनें',
      customTitle: 'रिपोर्ट के भाग खुद चुनें',
      compareDepth: 'मुफ्त और प्रीमियम देखें',
      differenceColumn: 'क्षेत्र',
      differenceEyebrow: 'मुफ्त और प्रीमियम का अंतर',
      downloadChatPdf: 'चैट पीडीएफ सेव करें',
      emptySelection: 'कम से कम एक भाग चुनें.',
      everythingBody: 'मुफ्त रिपोर्ट में जरूरी भाग आते हैं. प्रीमियम में पूरी गहरी रिपोर्ट खुलती है.',
      everythingIncludesBody:
        'प्रीमियम रिपोर्ट में यह संपूर्ण ज्योतिष कवरेज आता है. मुफ्त रिपोर्ट में जरूरी और उपयोगी भाग मिलते हैं.',
      everythingIncludesEyebrow: 'पूरी रिपोर्ट में शामिल',
      everythingIncludesTitle: 'रिपोर्ट में क्या-क्या आएगा',
      everythingLabel: 'पूरी पीडीएफ',
      everythingTitle: 'सब कुछ शामिल करें',
      eyebrow: 'रिपोर्ट डाउनलोड',
      freeAccessBody:
        'मुफ्त रिपोर्ट उपयोगी रहती है: जरूरी चार्ट प्रमाण, वर्तमान समय-संकेत, उपाय और सुरक्षा नोट मिलते हैं.',
      freeAccessLabel: 'मुफ्त रिपोर्ट',
      freeAccessTitle: 'उपयोगी समझ शामिल',
      freePreview: 'मुफ्त प्रीव्यू',
      helpChoosingReport: 'कौन-सा विकल्प चुनें?',
      includesHeading: 'शामिल भाग',
      intro:
        'मुफ्त जरूरी रिपोर्ट बनाएं या प्रीमियम में पूरी गहरी रिपोर्ट चुनें. दोनों साफ और सुंदर रहती हैं.',
      marketplaceBody:
        'जीवन के सवाल से शुरू करें. मुफ्त रिपोर्ट उपयोगी रहती है; प्रीमियम तब चुनें जब समय, गहराई या सुंदर पीडीएफ चाहिए.',
      marketplaceEyebrow: 'रिपोर्ट विकल्प',
      marketplacePromiseBody: 'प्रीमियम पूरी रिपोर्ट, समय खिड़कियां और गहरा सार जोड़ता है.',
      marketplacePromiseTitle: 'मुफ्त उपयोगी, प्रीमियम गहरा',
      marketplaceTitle: 'जरूरत के हिसाब से चुनें.',
      needKundli:
        'रिपोर्ट बनाने के लिए पहले कुंडली चाहिए. आपकी रिपोर्ट पसंद सेव हो गई है.',
      note:
        'मुफ्त रिपोर्ट जरूरी भागों तक रहती है. प्रीमियम पूरा कवरेज, गहरा समय, उपाय और सार जोड़ता है.',
      openDrawer: 'खोलें',
      plannedSectionBody:
        'यह भाग पूरी रिपोर्ट का हिस्सा है. कुंडली बनने के बाद प्रेडिक्टा इसे चार्ट प्रमाण से भरेगी.',
      plannedSectionBulletFree: 'मुफ्त में उपयोगी समझ मिलेगी.',
      plannedSectionBulletPremium: 'प्रीमियम में विस्तृत समय और गहरा सार मिलेगा.',
      plannedSectionEvidence: 'कुंडली बनने के बाद चार्ट प्रमाण जुड़ेगा.',
      previewDrawerAction: 'प्रीव्यू खोलें',
      previewDrawerBody:
        'यहां रिपोर्ट कवर, मुख्य संकेत, चार्ट और चुने हुए भाग दिखते हैं. पीडीएफ सेव करते समय पूरा प्रीव्यू अपने आप खुल जाएगा.',
      previewDrawerTitle: 'रिपोर्ट प्रीव्यू',
      premiumAccessBody:
        'प्रीमियम पीडीएफ डाउनलोड के लिए प्रीमियम सदस्यता, डे पास या एक बार वाला प्रीमियम पीडीएफ अधिकार चाहिए.',
      premiumAccessCta: 'प्रीमियम विकल्प देखें',
      premiumAccessLabel: 'प्रीमियम रिपोर्ट',
      premiumAccessTitle: 'विस्तृत गहराई के लिए प्रवेश चाहिए',
      premiumDepth: 'प्रीमियम गहराई',
      previewBuilder: 'इन बदलावों का प्रीव्यू देखें',
      previewSelected: 'पहले रिपोर्ट देखें',
      printSelected: 'चुनी हुई पीडीएफ सेव करें',
      selected: 'चुना गया',
      selectedReport: 'चुना गया',
      seeEverythingIncluded: 'पूरी रिपोर्ट में क्या आएगा?',
      signInNudgeBody:
        'साइन इन करने पर आपकी कुंडली, रिपोर्ट पसंद और सेव चैट एक ही खाते में सुरक्षित रहती हैं.',
      signInNudgeTitle: 'रिपोर्ट और कुंडली एक ही खाते में रखें',
      title: 'रिपोर्ट डाउनलोड आसान बनाएं.',
    };
  }

  if (language === 'gu') {
    return {
      askFromReport: 'આ રિપોર્ટ પરથી પ્રેડિક્ટાને પૂછો',
      createKundliCta: 'કુંડળી બનાવો',
      createKundliToSelect: 'આ ભાગ પસંદ કરવા પહેલાં કુંડળી બનાવો',
      copied: 'કૉપી થઈ ગયું',
      copyChat: 'ચેટ કૉપી કરો',
      copyReport: 'રિપોર્ટ સારાંશ કૉપી કરો',
      customBody: 'જન્મ વિગતો, ચાર્ટ્સ, દશા, ઉપાયો, કૃષ્ણમૂર્તિ પદ્ધતિ, નાડી અથવા જે ભાગ જોઈએ તે જ રાખો.',
      customLabel: 'ભાગો પસંદ કરો',
      customTitle: 'રિપોર્ટના ભાગો તમે પસંદ કરો',
      compareDepth: 'મફત અને પ્રીમિયમ જુઓ',
      differenceColumn: 'ક્ષેત્ર',
      differenceEyebrow: 'મફત અને પ્રીમિયમનો ફરક',
      downloadChatPdf: 'ચેટ પીડીએફ સેવ કરો',
      emptySelection: 'ઓછામાં ઓછો એક ભાગ પસંદ કરો.',
      everythingBody: 'મફત રિપોર્ટમાં જરૂરી ભાગો મળે છે. પ્રીમિયમમાં સંપૂર્ણ ઊંડો રિપોર્ટ ખુલે છે.',
      everythingIncludesBody:
        'પ્રીમિયમ રિપોર્ટમાં આ સંપૂર્ણ જ્યોતિષ આવરણ આવે છે. મફત રિપોર્ટમાં જરૂરી અને ઉપયોગી ભાગો મળે છે.',
      everythingIncludesEyebrow: 'સંપૂર્ણ રિપોર્ટમાં સામેલ',
      everythingIncludesTitle: 'રિપોર્ટમાં શું આવશે',
      everythingLabel: 'સંપૂર્ણ પીડીએફ',
      everythingTitle: 'બધું સામેલ કરો',
      eyebrow: 'રિપોર્ટ ડાઉનલોડ',
      freeAccessBody:
        'મફત રિપોર્ટ ઉપયોગી રહે છે: જરૂરી ચાર્ટ પુરાવો, વર્તમાન સમય સંકેત, ઉપાય અને સુરક્ષા નોંધો મળે છે.',
      freeAccessLabel: 'મફત રિપોર્ટ',
      freeAccessTitle: 'ઉપયોગી સમજ સામેલ',
      freePreview: 'મફત પ્રીવ્યૂ',
      helpChoosingReport: 'કયો વિકલ્પ પસંદ કરવો?',
      includesHeading: 'સામેલ ભાગો',
      intro:
        'મફત જરૂરી રિપોર્ટ બનાવો અથવા પ્રીમિયમમાં સંપૂર્ણ ઊંડો રિપોર્ટ પસંદ કરો. બંને સ્વચ્છ અને સુંદર રહે છે.',
      marketplaceBody:
        'જીવનના પ્રશ્નથી શરૂ કરો. મફત રિપોર્ટ ઉપયોગી રહે છે; સમય, ઊંડાઈ અથવા સુંદર પીડીએફ જોઈએ ત્યારે પ્રીમિયમ પસંદ કરો.',
      marketplaceEyebrow: 'રિપોર્ટ વિકલ્પો',
      marketplacePromiseBody: 'પ્રીમિયમ સંપૂર્ણ રિપોર્ટ, સમય ખિડકીઓ અને ઊંડો સાર ઉમેરે છે.',
      marketplacePromiseTitle: 'મફત ઉપયોગી, પ્રીમિયમ ઊંડો',
      marketplaceTitle: 'જરૂર મુજબ પસંદ કરો.',
      needKundli:
        'રિપોર્ટ બનાવવા પહેલાં કુંડળી જોઈએ. તમારી રિપોર્ટ પસંદગી સેવ થઈ ગઈ છે.',
      note:
        'મફત રિપોર્ટ જરૂરી ભાગો સુધી રહે છે. પ્રીમિયમ સંપૂર્ણ આવરણ, ઊંડો સમય, ઉપાય અને સાર ઉમેરે છે.',
      openDrawer: 'ખોલો',
      plannedSectionBody:
        'આ ભાગ સંપૂર્ણ રિપોર્ટનો હિસ્સો છે. કુંડળી બન્યા પછી પ્રેડિક્ટા તેને ચાર્ટ પુરાવા સાથે ભરે છે.',
      plannedSectionBulletFree: 'મફતમાં ઉપયોગી સમજ મળશે.',
      plannedSectionBulletPremium: 'પ્રીમિયમમાં વિગતવાર સમય અને ઊંડો સાર મળશે.',
      plannedSectionEvidence: 'કુંડળી બન્યા પછી ચાર્ટ પુરાવો જોડાશે.',
      previewDrawerAction: 'પ્રીવ્યૂ ખોલો',
      previewDrawerBody:
        'અહીં રિપોર્ટ કવર, મુખ્ય સંકેતો, ચાર્ટ્સ અને પસંદ કરેલા ભાગો દેખાય છે. પીડીએફ સેવ કરતી વખતે આખો પ્રીવ્યૂ પોતે ખુલી જશે.',
      previewDrawerTitle: 'રિપોર્ટ પ્રીવ્યૂ',
      premiumAccessBody:
        'પ્રીમિયમ પીડીએફ ડાઉનલોડ કરવા પ્રીમિયમ સભ્યપદ, ડે પાસ અથવા એક વખતનો પ્રીમિયમ પીડીએફ અધિકાર જોઈએ.',
      premiumAccessCta: 'પ્રીમિયમ વિકલ્પો જુઓ',
      premiumAccessLabel: 'પ્રીમિયમ રિપોર્ટ',
      premiumAccessTitle: 'વિગતવાર ઊંડાઈ માટે પ્રવેશ જોઈએ',
      premiumDepth: 'પ્રીમિયમ ઊંડાઈ',
      previewBuilder: 'આ બદલાવનું પ્રીવ્યૂ જુઓ',
      previewSelected: 'પહેલાં રિપોર્ટ જુઓ',
      printSelected: 'પસંદ કરેલી પીડીએફ સેવ કરો',
      selected: 'પસંદ કરેલું',
      selectedReport: 'પસંદ કરેલું',
      seeEverythingIncluded: 'સંપૂર્ણ રિપોર્ટમાં શું આવશે?',
      signInNudgeBody:
        'સાઇન ઇન કર્યા પછી તમારી કુંડળી, રિપોર્ટ પસંદગીઓ અને સેવ ચેટ એક જ ખાતા સાથે રહે છે.',
      signInNudgeTitle: 'રિપોર્ટ અને કુંડળી એક જ ખાતા સાથે રાખો',
      title: 'રિપોર્ટ ડાઉનલોડ સરળ બનાવો.',
    };
  }

  return {
    askFromReport: 'Ask Predicta from this report',
    createKundliCta: 'Create Kundli',
    createKundliToSelect: 'Create a Kundli to choose this part',
    copied: 'Copied',
    copyChat: 'Copy chat',
    copyReport: 'Copy report summary',
    customBody:
      'Keep only the birth details, charts, dasha, remedies, KP, Nadi, or parts the user wants.',
    customLabel: 'Choose parts',
    customTitle: 'Choose what to include',
    compareDepth: 'Compare what you get',
    differenceColumn: 'Area',
    differenceEyebrow: 'Choose by need',
    downloadChatPdf: 'Save chat PDF',
    emptySelection: 'Choose at least one part.',
    everythingBody:
      'Free gives the essential reading. Premium is for timing, synthesis, remedies, and a polished PDF you can keep.',
    everythingIncludesBody:
      'The complete report is for serious questions that need full Jyotish coverage, timing, and chart proof.',
    everythingIncludesEyebrow: 'Complete report includes',
    everythingIncludesTitle: 'What the full report contains',
    everythingLabel: 'Complete PDF',
    everythingTitle: 'Include everything',
    eyebrow: 'Report download',
    freeAccessBody:
      'Free reports stay useful: essential chart proof, current timing, safe remedies, and clear limits.',
    freeAccessLabel: 'Free report',
    freeAccessTitle: 'Useful insight included',
    freePreview: 'Free preview',
    helpChoosingReport: 'Need help choosing?',
    includesHeading: 'Included parts',
    intro:
      'Create a polished free essential report first. Use paid depth when the question needs timing, synthesis, or a PDF worth keeping.',
    marketplaceBody:
      'Start with the life question. Predicta keeps every free report useful, then offers paid depth only when timing, synthesis, or a polished PDF is worth it.',
    marketplaceEyebrow: 'Report choices',
    marketplacePromiseBody: 'Paid depth adds complete coverage, timing windows, and deeper synthesis.',
    marketplacePromiseTitle: 'Free useful, paid depth when needed',
    marketplaceTitle: 'Choose by outcome, not by complexity.',
    needKundli:
      'Create a Kundli first. Your report choices are saved and will be ready when the chart is created.',
    note:
      'Free report includes essential parts. Paid depth adds complete coverage, deeper timing, remedies, and synthesis.',
    openDrawer: 'Open',
    plannedSectionBody:
      'This part belongs in the complete report. Once a Kundli is active, Predicta fills it with chart proof.',
    plannedSectionBulletFree: 'Free includes useful insight.',
    plannedSectionBulletPremium: 'Paid depth adds detailed timing and synthesis.',
    plannedSectionEvidence: 'Chart evidence appears after Kundli creation.',
    previewDrawerAction: 'Open preview',
    previewDrawerBody:
      'Preview the cover, key signals, charts, and chosen sections here. Saving the PDF opens the full preview automatically.',
    previewDrawerTitle: 'Report preview',
    premiumAccessBody:
      'Detailed PDF download needs a subscription, Day Pass, or one-time report access.',
    premiumAccessCta: 'Choose access',
    premiumAccessLabel: 'Premium report',
    premiumAccessTitle: 'Choose access for detailed depth',
    premiumDepth: 'Premium depth',
    previewBuilder: 'Preview after these changes',
    previewSelected: 'Preview selected report',
    printSelected: 'Save selected PDF',
    selected: 'Selected',
    selectedReport: 'Selected',
    seeEverythingIncluded: 'See everything included',
    signInNudgeBody:
      'Sign in once and keep your Kundli, report choices, and saved chats with the same account.',
    signInNudgeTitle: 'Keep reports and Kundlis with one account',
    title: 'Make report download easy.',
  };
}

function formatReportSectionEyebrow(
  eyebrow: string,
  language: SupportedLanguage,
): string {
  if (language !== 'en') {
    return eyebrow;
  }

  return eyebrow
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatReportSectionMeta({
  confidence,
  language,
  labels,
  tier,
}: {
  confidence: 'high' | 'low' | 'medium';
  language: SupportedLanguage;
  labels: ReturnType<typeof getLanguageLabels>;
  tier: 'free' | 'premium';
}): string {
  const tierLabel = tier === 'premium' ? labels.premium : labels.free;
  const confidenceLabel = getConfidenceLabel(language, confidence);

  if (language === 'hi') {
    return `${tierLabel} · ${labels.confidence}: ${confidenceLabel}`;
  }

  if (language === 'gu') {
    return `${tierLabel} · ${labels.confidence}: ${confidenceLabel}`;
  }

  return `${tierLabel} · ${confidenceLabel.charAt(0).toUpperCase()}${confidenceLabel.slice(
    1,
  )} confidence`;
}

function getReportLanguageCopy(language: SupportedLanguage): {
  body: string;
  differentBody: string;
  eyebrow: string;
  title: string;
} {
  if (language === 'hi') {
    return {
      body:
        'पीडीएफ उसी भाषा में बनेगी जो ऐप में चुनी है. चाहें तो रिपोर्ट के लिए अलग भाषा चुनें.',
      differentBody:
        'ऐप भाषा अलग रहेगी. सिर्फ इस रिपोर्ट की पीडीएफ चुनी हुई भाषा में बनेगी.',
      eyebrow: 'पीडीएफ भाषा',
      title: 'रिपोर्ट किस भाषा में चाहिए?',
    };
  }

  if (language === 'gu') {
    return {
      body:
        'પીડીએફ એપમાં પસંદ કરેલી ભાષામાં બનશે. જરૂર હોય તો રિપોર્ટ માટે અલગ ભાષા પસંદ કરો.',
      differentBody:
        'એપ ભાષા અલગ રહેશે. ફક્ત આ રિપોર્ટની પીડીએફ પસંદ કરેલી ભાષામાં બનશે.',
      eyebrow: 'પીડીએફ ભાષા',
      title: 'રિપોર્ટ કઈ ભાષામાં જોઈએ?',
    };
  }

  return {
    body:
      'The PDF will use your current app language. You can choose another language just for this report.',
    differentBody:
      'Your app language stays the same. Only this report PDF uses the selected language.',
    eyebrow: 'PDF language',
    title: 'Choose report language',
  };
}

function getReportPrintCopy(language: SupportedLanguage): {
  brandLine: string;
  chartsBody: string;
  chartsEyebrow: string;
  chartsTitle: string;
  coverEyebrow: string;
  freePreview: string;
  premiumPreview: string;
  safetyBody: string;
  safetyTitle: string;
  tagline: string;
} {
  const languageName = getLanguageOption(language).englishName;

  if (language === 'hi') {
    return {
      brandLine:
        'चार्ट प्रमाण, समय, उपाय और साफ सुरक्षा सीमाओं के साथ होलिस्टिक वैदिक ज्योतिष.',
      chartsBody:
        'ये छपने योग्य चार्ट झलकियां वही कुंडली मॉडल, राशि, भाव, ग्रह अंश, स्थिति संकेत, चंद्र लय और जन्म-समय थीम उपयोग करती हैं जो ऐप चार्ट में है.',
      chartsEyebrow: 'इस रिपोर्ट के चार्ट',
      chartsTitle: 'चार्ट ऐप वाली कुंडली पद्धति से ही बने हैं.',
      coverEyebrow: `PREDICTA HOLISTIC ASTROLOGY REPORT · ${languageName}`,
      freePreview: 'उपयोगी मुफ्त रिपोर्ट झलक',
      premiumPreview: 'विस्तृत प्रीमियम रिपोर्ट झलक',
      safetyBody:
        'प्रेडिक्टा चिंतन और योजना के लिए है. यह चिकित्सा, कानूनी, आर्थिक, आपात या मानसिक-स्वास्थ्य विशेषज्ञों की जगह नहीं लेती. कोई भविष्यवाणी पक्की नहीं है; बड़े फैसलों में वास्तविक विवेक रखें.',
      safetyTitle: 'सुरक्षा नोट',
      tagline: 'अपनी कुंडली बनाएं. जीवन समझें. चार्ट प्रमाण के साथ पूछें.',
    };
  }

  if (language === 'gu') {
    return {
      brandLine:
        'ચાર્ટ પુરાવો, સમય, ઉપાયો અને સ્પષ્ટ સુરક્ષા સીમાઓ સાથે હોલિસ્ટિક વૈદિક જ્યોતિષ.',
      chartsBody:
        'આ છાપી શકાય તેવી ચાર્ટ ઝલકો એ જ કુંડળી મોડેલ, રાશિ, ભાવ, ગ્રહ અંશ, સ્થિતિ સંકેત, ચંદ્ર લય અને જન્મ-સમય થીમ ઉપયોગ કરે છે જે એપ ચાર્ટમાં છે.',
      chartsEyebrow: 'આ રિપોર્ટના ચાર્ટ્સ',
      chartsTitle: 'ચાર્ટ એપ જેવી કુંડળી પદ્ધતિથી જ બને છે.',
      coverEyebrow: `PREDICTA HOLISTIC ASTROLOGY REPORT · ${languageName}`,
      freePreview: 'ઉપયોગી મફત રિપોર્ટ ઝલક',
      premiumPreview: 'વિગતવાર પ્રીમિયમ રિપોર્ટ ઝલક',
      safetyBody:
        'પ્રેડિક્ટા વિચાર અને આયોજન માટે છે. તે તબીબી, કાનૂની, આર્થિક, આપાત અથવા માનસિક-આરોગ્ય નિષ્ણાતોની જગ્યાએ નથી. કોઈ આગાહી પાક્કી નથી; મોટા નિર્ણયોમાં વાસ્તવિક સમજ રાખો.',
      safetyTitle: 'સુરક્ષા નોંધ',
      tagline: 'તમારી કુંડળી બનાવો. જીવન સમજો. ચાર્ટ પુરાવા સાથે પૂછો.',
    };
  }

  return {
    brandLine:
      'Holistic Vedic astrology with chart proof, timing, remedies, and safety boundaries.',
    chartsBody:
      'These printable chart snapshots use the same Kundli model, signs, houses, planet degrees, status markers, moon rhythm, and birth-time theme as the interactive charts.',
    chartsEyebrow: 'Charts in this report',
    chartsTitle: 'Charts use the same Kundli model as the app.',
    coverEyebrow: `PREDICTA HOLISTIC ASTROLOGY REPORT · ${languageName}`,
    freePreview: 'Useful free report preview',
    premiumPreview: 'Detailed premium report preview',
    safetyBody:
      'Predicta is for reflection and planning. It does not replace medical, legal, financial, emergency, or mental-health professionals. No prediction is guaranteed; use real-world judgment for important decisions.',
    safetyTitle: 'Safety note',
    tagline: 'Create your Kundli. Understand your life. Ask with proof.',
  };
}

function getComprehensiveReportSections(language: SupportedLanguage): Array<{
  eyebrow: string;
  title: string;
}> {
  if (language === 'hi') {
    return [
      { eyebrow: 'जन्म', title: 'जन्म विवरण और गणना' },
      { eyebrow: 'चार्ट', title: 'D1 और सभी विभाजन चार्ट' },
      { eyebrow: 'चलित', title: 'भाव चलित सुधार' },
      { eyebrow: 'कृष्णमूर्ति पद्धति', title: 'कृष्णमूर्ति पद्धति कस्प और सब-लॉर्ड आधार' },
      { eyebrow: 'नाड़ी', title: 'नाड़ी pattern प्रीव्यू' },
      { eyebrow: 'अंक', title: 'अंक ज्योतिष नाम और जन्म अंक' },
      { eyebrow: 'हस्ताक्षर', title: 'हस्ताक्षर प्रेडिक्टा और सुधार योजना' },
      { eyebrow: 'संश्लेषण', title: 'अंक ज्योतिष + हस्ताक्षर संयुक्त सार' },
      { eyebrow: 'दशा', title: 'महादशा, अंतर्दशा और समय' },
      { eyebrow: 'गोचर', title: 'गोचर और साढ़े साती' },
      { eyebrow: 'वर्ष', title: 'वार्षिक राशिफल और वर्षफल' },
      { eyebrow: 'बल', title: 'ग्रह बल और योग' },
      { eyebrow: 'अष्टकवर्ग', title: 'अष्टकवर्ग सारांश' },
      { eyebrow: 'करियर', title: 'करियर और D10' },
      { eyebrow: 'विवाह', title: 'विवाह, D9 और compatibility' },
      { eyebrow: 'धन', title: 'धन, D2 और पैसे का समय' },
      { eyebrow: 'स्वास्थ्य', title: 'स्वास्थ्य सावधानी और मन की देखभाल' },
      { eyebrow: 'उपाय', title: 'कर्म-आधारित उपाय' },
      { eyebrow: 'सुरक्षा', title: 'सीमाएं, विश्वास और सुरक्षा नोट' },
    ];
  }

  if (language === 'gu') {
    return [
      { eyebrow: 'જન્મ', title: 'જન્મ વિગતો અને ગણતરી' },
      { eyebrow: 'ચાર્ટ્સ', title: 'D1 અને બધા વિભાગીય ચાર્ટ્સ' },
      { eyebrow: 'ચાલિત', title: 'ભાવ ચાલિત સુધારણું' },
      { eyebrow: 'કૃષ્ણમૂર્તિ પદ્ધતિ', title: 'કૃષ્ણમૂર્તિ પદ્ધતિ cusp અને sub-lord આધાર' },
      { eyebrow: 'નાડી', title: 'નાડી pattern પ્રીવ્યૂ' },
      { eyebrow: 'અંક', title: 'અંક જ્યોતિષ નામ અને જન્મ અંક' },
      { eyebrow: 'હસ્તાક્ષર', title: 'હસ્તાક્ષર પ્રેડિક્ટા અને સુધાર યોજના' },
      { eyebrow: 'સંશ્લેષણ', title: 'અંક જ્યોતિષ + હસ્તાક્ષર સંયુક્ત સાર' },
      { eyebrow: 'દશા', title: 'મહાદશા, અંતર્દશા અને સમય' },
      { eyebrow: 'ગોચર', title: 'ગોચર અને સાડેસાતી' },
      { eyebrow: 'વર્ષ', title: 'વાર્ષિક રાશિફળ અને વર્ષફળ' },
      { eyebrow: 'બળ', title: 'ગ્રહ બળ અને યોગ' },
      { eyebrow: 'અષ્ટકવર્ગ', title: 'અષ્ટકવર્ગ સારાંશ' },
      { eyebrow: 'કારકિર્દી', title: 'કારકિર્દી અને D10' },
      { eyebrow: 'લગ્ન', title: 'લગ્ન, D9 અને compatibility' },
      { eyebrow: 'ધન', title: 'ધન, D2 અને પૈસાનો સમય' },
      { eyebrow: 'સ્વાસ્થ્ય', title: 'સ્વાસ્થ્ય કાળજી અને મનની સંભાળ' },
      { eyebrow: 'ઉપાયો', title: 'કર્મ આધારિત ઉપાયો' },
      { eyebrow: 'સુરક્ષા', title: 'મર્યાદા, વિશ્વાસ અને સુરક્ષા નોંધ' },
    ];
  }

  return [
    { eyebrow: 'Birth', title: 'Birth details and calculation' },
    { eyebrow: 'Charts', title: 'D1 and all divisional charts' },
    { eyebrow: 'Chalit', title: 'Parashari Chalit refinement' },
    { eyebrow: 'KP', title: 'KP cusp and sub-lord foundation' },
    { eyebrow: 'Nadi', title: 'Nadi pattern preview' },
    { eyebrow: 'Numerology', title: 'Numerology name and birth numbers' },
    { eyebrow: 'Signature', title: 'Signature Predicta and improvement plan' },
    { eyebrow: 'Synthesis', title: 'Numerology + Signature synthesis' },
    { eyebrow: 'Dasha', title: 'Mahadasha, Antardasha, timing' },
    { eyebrow: 'Transit', title: 'Gochar and Sade Sati' },
    { eyebrow: 'Year', title: 'Yearly horoscope and Varshaphal' },
    { eyebrow: 'Strength', title: 'Planet strength and yogas' },
    { eyebrow: 'Ashtakavarga', title: 'Ashtakavarga summary' },
    { eyebrow: 'Career', title: 'Career and D10' },
    { eyebrow: 'Marriage', title: 'Marriage, D9, compatibility' },
    { eyebrow: 'Wealth', title: 'Wealth, D2, money timing' },
    { eyebrow: 'Wellbeing', title: 'Health caution and emotional care' },
    { eyebrow: 'Remedies', title: 'Karma-based remedies' },
    { eyebrow: 'Safety', title: 'Limits, confidence, safety notes' },
  ];
}

function getFreePremiumDifferenceRows(language: SupportedLanguage): Array<{
  area: string;
  free: string;
  premium: string;
}> {
  if (language === 'hi') {
    return [
      {
        area: 'चार्ट',
        free: 'मुख्य चार्ट प्रमाण और उपयोगी समझ.',
        premium: 'पूरा चार्ट समूह, विस्तृत सार, D1 आधार और समय.',
      },
      {
        area: 'दशा / गोचर',
        free: 'वर्तमान स्वभाव और सरल मार्गदर्शन.',
        premium: 'मासिक समय अवसर, सक्रियता समय और गहरा प्रमाण.',
      },
      {
        area: 'उपाय',
        free: 'सुरक्षित कर्म-आधारित साप्ताहिक अभ्यास.',
        premium: 'ग्रह-विशेष साधना, नियमित देखभाल और विस्तृत योजना.',
      },
      {
        area: 'अंक ज्योतिष',
        free: 'नाम, जन्म और भाग्य अंक की उपयोगी झलक.',
        premium: 'नाम spelling तुलना, निजी समय map और compatibility numbers.',
      },
      {
        area: 'हस्ताक्षर',
        free: 'हस्ताक्षर संकेतों की उपयोगी और सुरक्षित झलक.',
        premium: 'गहरी संकेत तुलना, सुधार योजना और अंक ज्योतिष + हस्ताक्षर संयुक्त सार.',
      },
      {
        area: 'पीडीएफ सुंदरता',
        free: 'प्रीमियम जैसी उपयोगी रिपोर्ट.',
        premium: 'अलग पहचान वाली पूरी गहरी रिपोर्ट, अधिक भाग और प्रमाण.',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        area: 'ચાર્ટ્સ',
        free: 'મુખ્ય ચાર્ટ પુરાવો અને ઉપયોગી સમજ.',
        premium: 'સંપૂર્ણ ચાર્ટ સમૂહ, વિગતવાર સાર, D1 આધાર અને સમય.',
      },
      {
        area: 'દશા / ગોચર',
        free: 'વર્તમાન સ્વભાવ અને સરળ માર્ગદર્શન.',
        premium: 'માસિક સમય તક, સક્રિયતા સમય અને ઊંડો પુરાવો.',
      },
      {
        area: 'ઉપાયો',
        free: 'સુરક્ષિત કર્મ આધારિત સાપ્તાહિક અભ્યાસ.',
        premium: 'ગ્રહ-વિશેષ સાધના, નિયમિત દેખરેખ અને વિગતવાર યોજના.',
      },
      {
        area: 'અંક જ્યોતિષ',
        free: 'નામ, જન્મ અને ભાગ્ય અંકની ઉપયોગી ઝલક.',
        premium: 'નામ spelling સરખામણી, વ્યક્તિગત સમય map અને compatibility numbers.',
      },
      {
        area: 'હસ્તાક્ષર',
        free: 'હસ્તાક્ષર સંકેતોની ઉપયોગી અને સુરક્ષિત ઝલક.',
        premium: 'ઊંડી સંકેત સરખામણી, સુધાર યોજના અને અંક જ્યોતિષ + હસ્તાક્ષર સંયુક્ત સાર.',
      },
      {
        area: 'પીડીએફ સુંદરતા',
        free: 'પ્રીમિયમ જેવી ઉપયોગી રિપોર્ટ.',
        premium: 'અલગ ઓળખ ધરાવતી સંપૂર્ણ ઊંડી રિપોર્ટ, વધુ ભાગો અને પુરાવો.',
      },
    ];
  }

  return [
    {
      area: 'Charts',
      free: 'Core chart proof with useful insight.',
      premium: 'Complete chart set with detailed synthesis, anchored to D1 and timing.',
    },
    {
      area: 'Dasha / Gochar',
      free: 'Current theme and simple guidance.',
      premium: 'Monthly windows, activation timing, and deeper proof.',
    },
    {
      area: 'Remedies',
      free: 'Safe karma-based weekly practice.',
      premium: 'Planet-specific sadhana, tracking, and detailed plan.',
    },
    {
      area: 'Numerology',
      free: 'Useful name, birth, and destiny number insight.',
      premium: 'Name spelling comparison, personal timing map, and compatibility numbers.',
    },
    {
      area: 'Signature',
      free: 'Useful visual-trait reading with clear safety boundaries.',
      premium: 'Detailed trait comparison, improvement plan, and optional Numerology + Signature synthesis.',
    },
    {
      area: 'PDF polish',
      free: 'Premium-looking useful report.',
      premium: 'Distinctive complete deep report with richer sections and proof.',
    },
  ];
}

function buildReportAskHref(
  product: ReportMarketplaceProduct,
  kundliId?: string,
): string {
  return buildPredictaChatHref({
    kundliId,
    prompt: product.prompt,
    selectedSection: product.title,
    sourceScreen: 'Report',
  });
}

function loadSignatureAnalysisDraft(): SignatureAnalysisModel | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(SIGNATURE_DRAFT_STORAGE_KEY);
    if (!raw) {
      return undefined;
    }

    const draft = JSON.parse(raw) as SignatureReportDraft;
    return draft.analysisModel;
  } catch {
    return undefined;
  }
}

function DossierSection({
  language,
  section,
}: {
  language: SupportedLanguage;
  section: PdfSection;
}): React.JSX.Element {
  const labels = getLanguageLabels(language);
  const tierLabel =
    section.tier === 'premium' ? labels.premium : labels.free;
  const confidence = getConfidenceLabel(
    language,
    section.confidence ?? 'medium',
  );

  return (
    <article className="dossier-section-card glass-panel">
      <div className="dossier-section-topline">
        <div className="section-title">{section.eyebrow}</div>
        <span>
          {tierLabel} · {confidence} {labels.confidence}
        </span>
      </div>
      <h2>{section.title}</h2>
      <p>{section.body}</p>

      {section.bullets.length ? (
        <ul className="report-bullet-list">
          {section.bullets.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}

      {section.evidenceTable?.length ? (
        <div className="dossier-table-wrap">
          <div className="section-title">{labels.evidenceTable}</div>
          <table className="dossier-evidence-table">
            <thead>
              <tr>
                <th>{labels.factor}</th>
                <th>{labels.observation}</th>
                <th>{labels.confidence}</th>
                <th>{labels.implication}</th>
              </tr>
            </thead>
            <tbody>
              {section.evidenceTable.map(row => (
                <tr key={`${row.factor}-${row.observation}`}>
                  <td>{row.factor}</td>
                  <td>{row.observation}</td>
                  <td>{getConfidenceLabel(language, row.confidence)}</td>
                  <td>{row.implication}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {section.decisionWindows?.length ? (
        <div className="dossier-window-wrap">
          <div className="section-title">{labels.decisionWindows}</div>
          <div className="dossier-window-grid">
            {section.decisionWindows.map(window => (
              <div className="dossier-window" key={`${window.label}-${window.window}`}>
                <span>{window.label}</span>
                <strong>{window.window}</strong>
                <p>{window.guidance}</p>
                <small>
                  {getConfidenceLabel(language, window.confidence)} {labels.confidence}
                </small>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
