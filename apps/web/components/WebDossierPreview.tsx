'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getConfidenceLabel,
  getLanguageLabels,
} from '@pridicta/config/language';
import {
  getReportMarketplaceProducts,
  type ReportMarketplaceProduct,
} from '@pridicta/config/pricing';
import { composeReportSections, type PdfSection } from '@pridicta/pdf';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { loadWebKundliStore } from '../lib/web-kundli-storage';
import { WebTrustProofPanel } from './WebTrustProofPanel';

export function WebDossierPreview(): React.JSX.Element {
  const didLoadSavedState = useRef(false);
  const [mode, setMode] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const { language } = useLanguagePreference();
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const labels = getLanguageLabels(language);
  const marketplaceProducts = useMemo(() => getReportMarketplaceProducts(), []);
  const selectedReport =
    marketplaceProducts.find(product => product.id === selectedReportId) ??
    marketplaceProducts[0];

  useEffect(() => {
    const memory = loadWebAutoSaveMemory();
    const savedReport = memory.report;
    const savedReportIsValid = marketplaceProducts.some(
      product => product.id === savedReport?.selectedReportId,
    );

    setKundli(loadWebKundliStore().activeKundli);
    if (savedReportIsValid && savedReport?.selectedReportId) {
      setSelectedReportId(savedReport.selectedReportId as ReportMarketplaceProduct['id']);
    }
    if (savedReport?.mode) {
      setMode(savedReport.mode);
    }

    didLoadSavedState.current = true;
  }, [marketplaceProducts]);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      report: {
        mode,
        selectedReportId,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [mode, selectedReportId]);

  const freeReport = useMemo(
    () =>
      composeReportSections({
        kundli,
        language,
        mode: 'FREE',
      }),
    [kundli, language],
  );
  const premiumReport = useMemo(
    () =>
      composeReportSections({
        kundli,
        language,
        mode: 'PREMIUM',
      }),
    [kundli, language],
  );
  const report = mode === 'PREMIUM' ? premiumReport : freeReport;

  function printReport() {
    window.print();
  }

  return (
    <div className="dossier-preview">
      <section className="report-marketplace glass-panel">
        <div className="report-marketplace-header">
          <div>
            <div className="section-title">REPORT MARKETPLACE</div>
            <h2>Choose by outcome, not by jargon.</h2>
            <p>
              Every report starts with a useful preview. Premium adds depth,
              timing, synthesis, and polished PDF sections.
            </p>
          </div>
          <div className="report-marketplace-promise">
            <span>Free</span>
            <strong>All charts stay visible</strong>
            <small>Premium explains them deeper.</small>
          </div>
        </div>

        <div className="report-product-grid">
          {marketplaceProducts.map(product => (
            <button
              className={
                product.id === selectedReportId
                  ? 'report-product-card active'
                  : 'report-product-card'
              }
              key={product.id}
              onClick={() => setSelectedReportId(product.id)}
              type="button"
            >
              <span>{product.badge}</span>
              <strong>{product.title}</strong>
              <small>{product.bestFor}</small>
            </button>
          ))}
        </div>

        <div className="report-selected-panel">
          <div>
            <div className="section-title">SELECTED</div>
            <h3>{selectedReport.title}</h3>
            <p>{selectedReport.bestFor}</p>
          </div>
          <div className="report-depth-grid">
            <div>
              <span>Free preview</span>
              <p>{selectedReport.freeDepth}</p>
            </div>
            <div>
              <span>Premium depth</span>
              <p>{selectedReport.premiumDepth}</p>
            </div>
          </div>
          <a
            className="button secondary"
            href={buildReportAskHref(selectedReport, kundli?.id)}
          >
            Ask Predicta from this report
          </a>
        </div>
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
        <button className="button secondary" onClick={printReport} type="button">
          Print / save PDF
        </button>
      </div>

      <section className="dossier-hero glass-panel">
        <div>
          <div className="section-title">
            {selectedReport.title.toUpperCase()} · DOSSIER {report.dossierVersion}
          </div>
          <h2>
            {mode === 'PREMIUM'
              ? 'Detailed report preview'
              : 'Useful free preview'}
          </h2>
          <p>{report.executiveSummary.headline}</p>
        </div>
        <div className="dossier-confidence">
          <span>{labels.confidence}</span>
          <strong>
            {getConfidenceLabel(language, report.executiveSummary.confidence)}
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

      <div className="report-section-list">
        {report.sections.map(section => (
          <DossierSection
            key={`${report.mode}-${section.title}`}
            language={language}
            section={section}
          />
        ))}
      </div>
    </div>
  );
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
