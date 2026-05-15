'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  getConfidenceLabel,
  getLanguageLabels,
} from '@pridicta/config/language';
import {
  getReportPurchaseGuide,
  getReportMarketplaceProducts,
  type ReportPurchaseGuide,
  type ReportMarketplaceProduct,
} from '@pridicta/config/pricing';
import { composeReportSections, type PdfSection } from '@pridicta/pdf';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
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
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { WebTrustProofPanel } from './WebTrustProofPanel';

export function WebDossierPreview(): React.JSX.Element {
  const didLoadSavedState = useRef(false);
  const [mode, setMode] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const [builderMode, setBuilderMode] = useState<'EVERYTHING' | 'CUSTOM'>(
    'EVERYTHING',
  );
  const [selectedSectionKeys, setSelectedSectionKeys] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<
    'idle' | 'report' | 'chat' | 'empty' | 'needKundli'
  >('idle');
  const { language } = useLanguagePreference();
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const labels = getLanguageLabels(language);
  const marketplaceProducts = useMemo(() => getReportMarketplaceProducts(), []);
  const purchaseGuide = useMemo(() => getReportPurchaseGuide(), []);
  const selectedReport =
    marketplaceProducts.find(product => product.id === selectedReportId) ??
    marketplaceProducts[0];
  const localizedSelectedReport = getLocalizedReportProduct(
    selectedReport,
    language,
  );

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
    if (savedReport?.builderMode) {
      setBuilderMode(savedReport.builderMode);
    }
    if (savedReport?.selectedSectionKeys?.length) {
      setSelectedSectionKeys(savedReport.selectedSectionKeys);
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
        builderMode,
        selectedReportId,
        selectedSectionKeys,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [builderMode, mode, selectedReportId, selectedSectionKeys]);

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
  const builderCopy = getReportBuilderCopy(language);
  const actualSectionOptions = report.sections.map((section, index) => ({
    key: getReportSectionKey(section, index),
    section,
  }));
  const plannedSectionOptions = getComprehensiveReportSections(language).map(
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
  const differenceRows = getFreePremiumDifferenceRows(language);

  function printReport() {
    if (!kundli) {
      setCopyState('needKundli');
      window.setTimeout(() => setCopyState('idle'), 3200);
      return;
    }

    if (builderMode === 'CUSTOM' && !visibleSections.length) {
      setCopyState('empty');
      window.setTimeout(() => setCopyState('idle'), 1800);
      return;
    }

    window.print();
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
      `${selectedReport.title} · ${mode === 'PREMIUM' ? labels.premium : labels.free}`,
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
  }, [language, report.mode, selectedReportId, kundli?.id]);

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

        <div className="report-choice-guide">
          {purchaseGuide.map(item => {
            const localizedItem = getLocalizedPurchaseGuideItem(
              item,
              language,
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

        <div className="report-product-grid">
          {marketplaceProducts.map(product => {
            const localizedProduct = getLocalizedReportProduct(
              product,
              language,
            );

            return (
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
          <a
            className="button secondary"
            href={buildReportAskHref(selectedReport, kundli?.id)}
          >
            {builderCopy.askFromReport}
          </a>
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
                  <td>{row.area}</td>
                  <td>{row.free}</td>
                  <td>{row.premium}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="report-builder-choice-row" role="group" aria-label={builderCopy.title}>
          <button
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

        <div className="report-included-list">
          <div>
            <div className="section-title">{builderCopy.everythingIncludesEyebrow}</div>
            <h3>{builderCopy.everythingIncludesTitle}</h3>
            <p>{builderCopy.everythingIncludesBody}</p>
          </div>
          <div className="report-included-grid">
            {getComprehensiveReportSections(language).map(section => (
              <span key={`${section.eyebrow}-${section.title}`}>
                {section.title}
              </span>
            ))}
          </div>
        </div>

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
              <span>{section.eyebrow}</span>
              <strong>{section.title}</strong>
              <small>
                {kundli
                  ? `${section.tier === 'premium' ? labels.premium : labels.free} · ${getConfidenceLabel(
                      language,
                      section.confidence ?? 'medium',
                    )} ${labels.confidence}`
                  : builderCopy.createKundliToSelect}
              </small>
            </label>
          ))}
        </div>

        <div className="report-builder-actions">
          <button className="button primary" onClick={printReport} type="button">
            {builderCopy.printSelected}
          </button>
          <button className="button secondary" onClick={copyReportSummary} type="button">
            {copyState === 'report' ? builderCopy.copied : builderCopy.copyReport}
          </button>
          <button className="button secondary" onClick={copyChatTranscript} type="button">
            {copyState === 'chat' ? builderCopy.copied : builderCopy.copyChat}
          </button>
          <button className="button secondary" onClick={openPrintableWebChatTranscript} type="button">
            {builderCopy.downloadChatPdf}
          </button>
        </div>
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
        <button className="button secondary" onClick={printReport} type="button">
          Print / save PDF
        </button>
      </div>

      <section
        className={
          mode === 'PREMIUM'
            ? 'report-print-cover premium'
            : 'report-print-cover free'
        }
      >
        <div>
          <span>PREDICTA HOLISTIC ASTROLOGY REPORT</span>
          <h1>{selectedReport.title}</h1>
          <h2>Create your Kundli. Understand your life. Ask with proof.</h2>
          <p>{report.cover.subtitle}</p>
          <p>{report.cover.metadata.join(' • ')}</p>
        </div>
        <strong>{mode === 'PREMIUM' ? labels.premium : labels.free}</strong>
      </section>

      <section
        className={
          mode === 'PREMIUM'
            ? 'report-print-brand-header premium'
            : 'report-print-brand-header free'
        }
      >
        <div>
          <span>PREDICTA</span>
          <p>Holistic Vedic astrology with chart proof, timing, remedies, and safety boundaries.</p>
        </div>
        <strong>{selectedReport.title}</strong>
      </section>

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
        {visibleSections.map(section => (
          <DossierSection
            key={`${report.mode}-${section.title}`}
            language={language}
            section={section}
          />
        ))}
      </div>

      <section className="report-print-safety-footer">
        <strong>Safety note</strong>
        <p>
          Predicta is for reflection and planning. It does not replace medical,
          legal, financial, emergency, or mental-health professionals. No
          prediction is guaranteed; use real-world judgment for important
          decisions.
        </p>
      </section>
    </div>
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
        body: 'जब किसी साफ जीवन सवाल के लिए एक सुंदर PDF चाहिए, इसे चुनें.',
        cta: 'एक रिपोर्ट चुनें',
        label: 'एक बार की रिपोर्ट',
        title: 'मुझे एक जवाब अच्छे से तैयार चाहिए',
      },
      Subscription: {
        body: 'जब नियमित समय मार्गदर्शन, गहरी chat, उपाय और मासिक planning चाहिए, इसे चुनें.',
        cta: 'प्रीमियम देखें',
        label: 'Subscription',
        title: 'मुझे हर महीने मार्गदर्शन चाहिए',
      },
      'Day Pass': {
        body: 'निर्णय लेने से पहले पूरा अनुभव आजमाना हो, इसे चुनें.',
        cta: 'Day Pass आजमाएं',
        label: 'Day Pass',
        title: 'मैं आज सब कुछ आजमाना चाहता/चाहती हूं',
      },
    };

    return map[item.label] ?? item;
  }

  if (language === 'gu') {
    const map: Record<string, ReportPurchaseGuide> = {
      'One-time report': {
        body: 'સ્પષ્ટ જીવન પ્રશ્ન માટે એક સુંદર PDF જોઈએ ત્યારે આ પસંદ કરો.',
        cta: 'એક રિપોર્ટ પસંદ કરો',
        label: 'એક વારની રિપોર્ટ',
        title: 'મને એક જવાબ સારી રીતે તૈયાર જોઈએ',
      },
      Subscription: {
        body: 'નિયમિત સમય guidance, ઊંડી chat, ઉપાયો અને માસિક planning જોઈએ ત્યારે આ પસંદ કરો.',
        cta: 'પ્રીમિયમ જુઓ',
        label: 'Subscription',
        title: 'મારે દર મહિને માર્ગદર્શન જોઈએ',
      },
      'Day Pass': {
        body: 'નિર્ણય કરતા પહેલાં આખો અનુભવ અજમાવવો હોય ત્યારે આ પસંદ કરો.',
        cta: 'Day Pass અજમાવો',
        label: 'Day Pass',
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
        premiumDepth: 'सभी चार्ट, दशा, गोचर, योग और उपाय की पूरी synthesis.',
        premiumIncludes: ['पूरी चार्ट synthesis', 'दशा और गोचर समय', 'योग और बल', 'प्रीमियम PDF संरचना'],
        purchaseHint: 'जब पूरा जीवन overview चाहिए, यह सबसे अच्छी पहली रिपोर्ट है.',
        title: 'कुंडली रिपोर्ट',
      },
      CAREER: {
        badge: 'काम',
        bestFor: 'करियर दिशा, नौकरी समय और काम के दबाव.',
        freeDepth: '10वें भाव, D10, दशा और गोचर से सरल करियर focus.',
        freeIncludes: ['करियर भाव', 'D10 संकेत', 'वर्तमान काम दबाव', 'एक practical action'],
        outcome: 'काम की दिशा, समय दबाव और बेहतर अगला कदम देखें.',
        premiumDepth: 'करियर timing, role fit, promotion windows और action plan.',
        premiumIncludes: ['Role fit', 'Promotion/change windows', 'D1 plus D10 synthesis', 'मासिक action plan'],
        purchaseHint: 'Job change, promotion, business या career direction के लिए best.',
        title: 'करियर रिपोर्ट',
      },
      MARRIAGE: {
        badge: 'विवाह',
        bestFor: 'विवाह संभावना, रिश्ते की परिपक्वता और जीवनसाथी patterns.',
        freeDepth: 'D1 और D9 relationship signals confidence के साथ.',
        freeIncludes: ['D1 relationship signal', 'D9 preview', 'Venus/Jupiter tone', 'Gentle caution'],
        outcome: 'रिश्ते की परिपक्वता, समय और साथी के pattern समझें.',
        premiumDepth: 'D1 plus D9 synthesis, timing windows, remedies और red flags gently.',
        premiumIncludes: ['D1 plus D9 synthesis', 'Timing windows', 'Compatibility cautions', 'Relationship remedies'],
        purchaseHint: 'Marriage timing, partner nature, delay या family discussion के लिए best.',
        title: 'विवाह रिपोर्ट',
      },
      WEALTH: {
        badge: 'धन',
        bestFor: 'Income, बचत, धन आदतें और financial timing.',
        freeDepth: 'धन भाव, वर्तमान दशा tone और practical guidance.',
        freeIncludes: ['2nd/11th house signal', 'Dasha money tone', 'Savings caution', 'One grounded habit'],
        outcome: 'धन प्रवाह, बचत आदतें और बेहतर financial समय पढ़ें.',
        premiumDepth: 'D2, 2nd और 11th house synthesis, timing windows और monthly plan.',
        premiumIncludes: ['D2 wealth synthesis', 'Income and gains windows', 'Monthly planning', 'Risk and discipline map'],
        purchaseHint: 'Income, savings, investment timing या debt pressure के लिए best.',
        title: 'धन रिपोर्ट',
      },
      SADESATI: {
        badge: 'शनि',
        bestFor: 'साढ़े साती phase, दबाव windows, discipline और support.',
        freeDepth: 'वर्तमान साढ़े साती status, phase और सरल guidance.',
        freeIncludes: ['Current phase', 'Saturn theme', 'Simple caution', 'Saturn karma remedy'],
        outcome: 'शनि दबाव को डर के बिना समझें.',
        premiumDepth: 'Exact phase reading, Saturn transit dates, Ashtakavarga support और remedies.',
        premiumIncludes: ['Exact phase reading', 'Saturn dates', 'Ashtakavarga support', 'Remedy and discipline plan'],
        purchaseHint: 'Pressure, delay, responsibility या Saturn-related fear के लिए best.',
        title: 'साढ़े साती रिपोर्ट',
      },
      DASHA: {
        badge: 'समय',
        bestFor: 'जीवन अवधि, turning points और अभी क्या active है.',
        freeDepth: 'वर्तमान Mahadasha और Antardasha theme सरल भाषा में.',
        freeIncludes: ['Current Mahadasha', 'Current Antardasha', 'Life theme', 'Next timing cue'],
        outcome: 'अभी कौन सा जीवन chapter active है और आगे क्या आता है, देखें.',
        premiumDepth: 'Mahadasha, Antardasha, Pratyantardasha, activation और timing map.',
        premiumIncludes: ['Dasha tree', 'Pratyantardasha detail', 'Activation timing', 'Life map with windows'],
        purchaseHint: 'जब सवाल “why now?” हो या life timing map चाहिए.',
        title: 'दशा Life Map',
      },
      COMPATIBILITY: {
        badge: 'मिलान',
        bestFor: 'विवाह matching, family discussion और compatibility clarity.',
        freeDepth: 'Simple compatibility tone और major caution areas.',
        freeIncludes: ['Compatibility tone', 'Major support points', 'Major caution points', 'Gentle summary'],
        outcome: 'कम्पैटिबिलिटी को परिवार के साथ discuss करना आसान बनाएं.',
        premiumDepth: 'Ashtakoota, Manglik, D1/D9 cross-check, timing और relationship guidance.',
        premiumIncludes: ['Ashtakoota', 'Manglik check', 'D1/D9 comparison', 'Timing and practical guidance'],
        purchaseHint: 'Marriage या family compatibility conversation के लिए best.',
        title: 'कम्पैटिबिलिटी रिपोर्ट',
      },
      REMEDIES: {
        badge: 'उपाय',
        bestFor: 'उपाय, habits, spiritual discipline और grounded support.',
        freeDepth: 'Simple safe remedies और reflection practices.',
        freeIncludes: ['Planet focus', 'Safe simple remedy', 'Karma lesson', 'Weekly practice'],
        outcome: 'चार्ट दबाव को कर्म-आधारित action में बदलें.',
        premiumDepth: 'Planet-specific remedies, timing, consistency tracker और safety notes.',
        premiumIncludes: ['Planet-specific path', 'Mantra/seva/discipline', 'Tracking rhythm', 'Safety and stop rules'],
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
        premiumDepth: 'બધા ચાર્ટ્સ, દશા, ગોચર, યોગ અને ઉપાયોની સંપૂર્ણ synthesis.',
        premiumIncludes: ['સંપૂર્ણ ચાર્ટ synthesis', 'દશા અને ગોચર સમય', 'યોગ અને બળ', 'પ્રીમિયમ PDF રચના'],
        purchaseHint: 'જ્યારે સંપૂર્ણ જીવન overview જોઈએ ત્યારે આ best first report છે.',
        title: 'કુંડળી રિપોર્ટ',
      },
      CAREER: {
        badge: 'કામ',
        bestFor: 'કારકિર્દી દિશા, નોકરી સમય અને કામના દબાણ.',
        freeDepth: '10મા ભાવ, D10, દશા અને ગોચરથી સરળ કારકિર્દી focus.',
        freeIncludes: ['કારકિર્દી ભાવ', 'D10 સંકેત', 'વર્તમાન કામ દબાણ', 'એક practical action'],
        outcome: 'કામની દિશા, સમય દબાણ અને સારું આગળનું પગલું જુઓ.',
        premiumDepth: 'કારકિર્દી timing, role fit, promotion windows અને action plan.',
        premiumIncludes: ['Role fit', 'Promotion/change windows', 'D1 plus D10 synthesis', 'માસિક action plan'],
        purchaseHint: 'Job change, promotion, business અથવા career direction માટે best.',
        title: 'કારકિર્દી રિપોર્ટ',
      },
      MARRIAGE: {
        badge: 'લગ્ન',
        bestFor: 'લગ્ન સંભાવના, સંબંધની પરિપક્વતા અને spouse patterns.',
        freeDepth: 'D1 અને D9 relationship signals confidence સાથે.',
        freeIncludes: ['D1 relationship signal', 'D9 preview', 'Venus/Jupiter tone', 'Gentle caution'],
        outcome: 'સંબંધની પરિપક્વતા, સમય અને સાથીના pattern સમજો.',
        premiumDepth: 'D1 plus D9 synthesis, timing windows, remedies અને red flags gently.',
        premiumIncludes: ['D1 plus D9 synthesis', 'Timing windows', 'Compatibility cautions', 'Relationship remedies'],
        purchaseHint: 'Marriage timing, partner nature, delay અથવા family discussion માટે best.',
        title: 'લગ્ન રિપોર્ટ',
      },
      WEALTH: {
        badge: 'ધન',
        bestFor: 'Income, savings, wealth habits અને financial timing.',
        freeDepth: 'ધન ભાવ, વર્તમાન દશા tone અને practical guidance.',
        freeIncludes: ['2nd/11th house signal', 'Dasha money tone', 'Savings caution', 'One grounded habit'],
        outcome: 'ધન પ્રવાહ, બચત આદતો અને સારો financial સમય વાંચો.',
        premiumDepth: 'D2, 2nd અને 11th house synthesis, timing windows અને monthly plan.',
        premiumIncludes: ['D2 wealth synthesis', 'Income and gains windows', 'Monthly planning', 'Risk and discipline map'],
        purchaseHint: 'Income, savings, investment timing અથવા debt pressure માટે best.',
        title: 'ધન રિપોર્ટ',
      },
      SADESATI: {
        badge: 'શનિ',
        bestFor: 'સાડેસાતી phase, દબાણ windows, discipline અને support.',
        freeDepth: 'વર્તમાન સાડેસાતી status, phase અને સરળ guidance.',
        freeIncludes: ['Current phase', 'Saturn theme', 'Simple caution', 'Saturn karma remedy'],
        outcome: 'શનિ દબાણ ને ડર વગર સમજો.',
        premiumDepth: 'Exact phase reading, Saturn transit dates, Ashtakavarga support અને remedies.',
        premiumIncludes: ['Exact phase reading', 'Saturn dates', 'Ashtakavarga support', 'Remedy and discipline plan'],
        purchaseHint: 'Pressure, delay, responsibility અથવા Saturn-related fear માટે best.',
        title: 'સાડેસાતી રિપોર્ટ',
      },
      DASHA: {
        badge: 'સમય',
        bestFor: 'જીવન અવધિ, turning points અને હાલમાં શું active છે.',
        freeDepth: 'Current Mahadasha અને Antardasha theme સરળ ભાષામાં.',
        freeIncludes: ['Current Mahadasha', 'Current Antardasha', 'Life theme', 'Next timing cue'],
        outcome: 'હમણાં કયો જીવન chapter active છે અને આગળ શું આવે છે, જુઓ.',
        premiumDepth: 'Mahadasha, Antardasha, Pratyantardasha, activation અને timing map.',
        premiumIncludes: ['Dasha tree', 'Pratyantardasha detail', 'Activation timing', 'Life map with windows'],
        purchaseHint: 'જ્યારે “why now?” એવો પ્રશ્ન હોય અથવા life timing map જોઈએ.',
        title: 'દશા Life Map',
      },
      COMPATIBILITY: {
        badge: 'મિલાન',
        bestFor: 'લગ્ન matching, family discussion અને compatibility clarity.',
        freeDepth: 'Simple compatibility tone અને major caution areas.',
        freeIncludes: ['Compatibility tone', 'Major support points', 'Major caution points', 'Gentle summary'],
        outcome: 'કમ્પેટિબિલિટીને પરિવાર સાથે discuss કરવી સરળ બનાવો.',
        premiumDepth: 'Ashtakoota, Manglik, D1/D9 cross-check, timing અને relationship guidance.',
        premiumIncludes: ['Ashtakoota', 'Manglik check', 'D1/D9 comparison', 'Timing and practical guidance'],
        purchaseHint: 'Marriage અથવા family compatibility conversation માટે best.',
        title: 'કમ્પેટિબિલિટી રિપોર્ટ',
      },
      REMEDIES: {
        badge: 'ઉપાયો',
        bestFor: 'ઉપાયો, habits, spiritual discipline અને grounded support.',
        freeDepth: 'Simple safe remedies અને reflection practices.',
        freeIncludes: ['Planet focus', 'Safe simple remedy', 'Karma lesson', 'Weekly practice'],
        outcome: 'ચાર્ટ દબાણને કર્મ આધારિત action માં બદલો.',
        premiumDepth: 'Planet-specific remedies, timing, consistency tracker અને safety notes.',
        premiumIncludes: ['Planet-specific path', 'Mantra/seva/discipline', 'Tracking rhythm', 'Safety and stop rules'],
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
  includesHeading: string;
  intro: string;
  marketplaceBody: string;
  marketplaceEyebrow: string;
  marketplacePromiseBody: string;
  marketplacePromiseTitle: string;
  marketplaceTitle: string;
  needKundli: string;
  note: string;
  plannedSectionBody: string;
  plannedSectionBulletFree: string;
  plannedSectionBulletPremium: string;
  plannedSectionEvidence: string;
  premiumAccessBody: string;
  premiumAccessCta: string;
  premiumAccessLabel: string;
  premiumAccessTitle: string;
  premiumDepth: string;
  printSelected: string;
  selected: string;
  selectedReport: string;
  title: string;
} {
  if (language === 'hi') {
    return {
      askFromReport: 'इस रिपोर्ट से Predicta से पूछें',
      createKundliCta: 'कुंडली बनाएं',
      createKundliToSelect: 'यह भाग चुनने के लिए पहले कुंडली बनाएं',
      copied: 'कॉपी हो गया',
      copyChat: 'चैट कॉपी करें',
      copyReport: 'रिपोर्ट सारांश कॉपी करें',
      customBody: 'जन्म विवरण, चार्ट, दशा, उपाय, KP, Nadi या जो भाग चाहिए वही रखें.',
      customLabel: 'भाग चुनें',
      customTitle: 'रिपोर्ट के भाग खुद चुनें',
      differenceColumn: 'क्षेत्र',
      differenceEyebrow: 'मुफ्त और प्रीमियम का अंतर',
      downloadChatPdf: 'चैट PDF सेव करें',
      emptySelection: 'कम से कम एक भाग चुनें.',
      everythingBody: 'मुफ्त और प्रीमियम दोनों में पूरी रिपोर्ट मिलती है. प्रीमियम ज्यादा गहराई देता है.',
      everythingIncludesBody:
        'पूरी रिपोर्ट में यह संपूर्ण ज्योतिष कवरेज आता है. कुंडली बनने के बाद आप ठीक-ठीक भाग चुन सकते हैं.',
      everythingIncludesEyebrow: 'पूरी रिपोर्ट में शामिल',
      everythingIncludesTitle: 'रिपोर्ट में क्या-क्या आएगा',
      everythingLabel: 'पूरी PDF',
      everythingTitle: 'सब कुछ शामिल करें',
      eyebrow: 'रिपोर्ट डाउनलोड',
      freeAccessBody:
        'मुफ्त रिपोर्ट उदार रहती है: हर चार्ट और मुख्य भाग दिखता है, लेकिन समझाना संक्षिप्त रहता है.',
      freeAccessLabel: 'मुफ्त रिपोर्ट',
      freeAccessTitle: 'उपयोगी insight शामिल',
      freePreview: 'मुफ्त प्रीव्यू',
      includesHeading: 'शामिल भाग',
      intro:
        'पूरी रिपोर्ट बनाएं या सिर्फ वही भाग रखें जो आपको सच में चाहिए. मुफ्त रिपोर्ट भी सुंदर और उदार रहती है.',
      marketplaceBody:
        'जीवन के सवाल से शुरू करें. मुफ्त रिपोर्ट उपयोगी रहती है; प्रीमियम तब चुनें जब समय, गहराई या सुंदर PDF चाहिए.',
      marketplaceEyebrow: 'रिपोर्ट विकल्प',
      marketplacePromiseBody: 'प्रीमियम उन्हें गहराई से समझाता है.',
      marketplacePromiseTitle: 'सारे चार्ट दिखाई देते हैं',
      marketplaceTitle: 'जरूरत के हिसाब से चुनें.',
      needKundli:
        'रिपोर्ट बनाने के लिए पहले कुंडली चाहिए. आपकी रिपोर्ट पसंद सेव हो गई है.',
      note:
        'मुफ्त उपयोगकर्ता भी हर भाग शामिल कर सकते हैं. प्रीमियम केवल विश्लेषण की गहराई, समय, उपाय और synthesis बढ़ाता है.',
      plannedSectionBody:
        'यह भाग पूरी रिपोर्ट का हिस्सा है. कुंडली बनने के बाद Predicta इसे चार्ट प्रमाण से भरेगी.',
      plannedSectionBulletFree: 'मुफ्त में उपयोगी insight मिलेगा.',
      plannedSectionBulletPremium: 'प्रीमियम में विस्तृत समय और synthesis मिलेगा.',
      plannedSectionEvidence: 'कुंडली बनने के बाद चार्ट प्रमाण जुड़ेगा.',
      premiumAccessBody:
        'प्रीमियम PDF डाउनलोड के लिए प्रीमियम subscription, Day Pass या one-time Premium PDF access चाहिए.',
      premiumAccessCta: 'प्रीमियम विकल्प देखें',
      premiumAccessLabel: 'प्रीमियम रिपोर्ट',
      premiumAccessTitle: 'विस्तृत गहराई के लिए access चाहिए',
      premiumDepth: 'प्रीमियम गहराई',
      printSelected: 'चुनी हुई PDF सेव करें',
      selected: 'चुना गया',
      selectedReport: 'चुना गया',
      title: 'रिपोर्ट डाउनलोड आसान बनाएं.',
    };
  }

  if (language === 'gu') {
    return {
      askFromReport: 'આ રિપોર્ટ પરથી Predicta ને પૂછો',
      createKundliCta: 'કુંડળી બનાવો',
      createKundliToSelect: 'આ ભાગ પસંદ કરવા પહેલાં કુંડળી બનાવો',
      copied: 'કૉપી થઈ ગયું',
      copyChat: 'ચેટ કૉપી કરો',
      copyReport: 'રિપોર્ટ સારાંશ કૉપી કરો',
      customBody: 'જન્મ વિગતો, ચાર્ટ્સ, દશા, ઉપાયો, KP, Nadi અથવા જે ભાગ જોઈએ તે જ રાખો.',
      customLabel: 'ભાગો પસંદ કરો',
      customTitle: 'રિપોર્ટના ભાગો તમે પસંદ કરો',
      differenceColumn: 'ક્ષેત્ર',
      differenceEyebrow: 'મફત અને પ્રીમિયમનો ફરક',
      downloadChatPdf: 'ચેટ PDF સેવ કરો',
      emptySelection: 'ઓછામાં ઓછો એક ભાગ પસંદ કરો.',
      everythingBody: 'મફત અને પ્રીમિયમ બંનેમાં સંપૂર્ણ રિપોર્ટ મળે છે. પ્રીમિયમ વધુ ઊંડાઈ આપે છે.',
      everythingIncludesBody:
        'સંપૂર્ણ રિપોર્ટમાં આ સંપૂર્ણ જ્યોતિષ આવરી લેવાય છે. કુંડળી બન્યા પછી તમે ચોક્કસ ભાગો પસંદ કરી શકો છો.',
      everythingIncludesEyebrow: 'સંપૂર્ણ રિપોર્ટમાં સામેલ',
      everythingIncludesTitle: 'રિપોર્ટમાં શું આવશે',
      everythingLabel: 'સંપૂર્ણ PDF',
      everythingTitle: 'બધું સામેલ કરો',
      eyebrow: 'રિપોર્ટ ડાઉનલોડ',
      freeAccessBody:
        'મફત રિપોર્ટ ઉદાર રહે છે: દરેક ચાર્ટ અને મુખ્ય ભાગ દેખાય છે, પરંતુ સમજણ સંક્ષિપ્ત રહે છે.',
      freeAccessLabel: 'મફત રિપોર્ટ',
      freeAccessTitle: 'ઉપયોગી insight સામેલ',
      freePreview: 'મફત પ્રીવ્યૂ',
      includesHeading: 'સામેલ ભાગો',
      intro:
        'સંપૂર્ણ રિપોર્ટ બનાવો અથવા તમને જે ભાગો સાચે જોઈએ તે જ રાખો. મફત રિપોર્ટ પણ સુંદર અને ઉદાર રહે છે.',
      marketplaceBody:
        'જીવનના પ્રશ્નથી શરૂ કરો. મફત રિપોર્ટ ઉપયોગી રહે છે; સમય, ઊંડાઈ અથવા સુંદર PDF જોઈએ ત્યારે પ્રીમિયમ પસંદ કરો.',
      marketplaceEyebrow: 'રિપોર્ટ વિકલ્પો',
      marketplacePromiseBody: 'પ્રીમિયમ તેને ઊંડાઈથી સમજાવે છે.',
      marketplacePromiseTitle: 'બધા ચાર્ટ્સ દેખાય છે',
      marketplaceTitle: 'જરૂર મુજબ પસંદ કરો.',
      needKundli:
        'રિપોર્ટ બનાવવા પહેલાં કુંડળી જોઈએ. તમારી રિપોર્ટ પસંદગી સેવ થઈ ગઈ છે.',
      note:
        'મફત ઉપયોગકર્તા પણ દરેક ભાગ સામેલ કરી શકે છે. પ્રીમિયમ ફક્ત વિશ્લેષણની ઊંડાઈ, સમય, ઉપાયો અને synthesis વધારે છે.',
      plannedSectionBody:
        'આ ભાગ સંપૂર્ણ રિપોર્ટનો હિસ્સો છે. કુંડળી બન્યા પછી Predicta તેને ચાર્ટ પુરાવા સાથે ભરે છે.',
      plannedSectionBulletFree: 'મફતમાં ઉપયોગી insight મળશે.',
      plannedSectionBulletPremium: 'પ્રીમિયમમાં વિગતવાર સમય અને synthesis મળશે.',
      plannedSectionEvidence: 'કુંડળી બન્યા પછી ચાર્ટ પુરાવો જોડાશે.',
      premiumAccessBody:
        'પ્રીમિયમ PDF ડાઉનલોડ કરવા પ્રીમિયમ subscription, Day Pass અથવા one-time Premium PDF access જોઈએ.',
      premiumAccessCta: 'પ્રીમિયમ વિકલ્પો જુઓ',
      premiumAccessLabel: 'પ્રીમિયમ રિપોર્ટ',
      premiumAccessTitle: 'વિગતવાર ઊંડાઈ માટે access જોઈએ',
      premiumDepth: 'પ્રીમિયમ ઊંડાઈ',
      printSelected: 'પસંદ કરેલી PDF સેવ કરો',
      selected: 'પસંદ કરેલું',
      selectedReport: 'પસંદ કરેલું',
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
    differenceColumn: 'Area',
    differenceEyebrow: 'Free vs Premium difference',
    downloadChatPdf: 'Save chat PDF',
    emptySelection: 'Choose at least one part.',
    everythingBody:
      'Free and Premium both get a complete report. Premium adds deeper analysis.',
    everythingIncludesBody:
      'The complete report includes this full Jyotish coverage. After a Kundli is created, you can keep everything or choose exact parts.',
    everythingIncludesEyebrow: 'Complete report includes',
    everythingIncludesTitle: 'What the full report contains',
    everythingLabel: 'Complete PDF',
    everythingTitle: 'Include everything',
    eyebrow: 'Report download',
    freeAccessBody:
      'Free reports are generous: every chart and major section is available with concise useful insight.',
    freeAccessLabel: 'Free report',
    freeAccessTitle: 'Useful insight included',
    freePreview: 'Free preview',
    includesHeading: 'Included parts',
    intro:
      'Create the full report, or keep only the parts the user actually wants. Free reports stay polished and generous.',
    marketplaceBody:
      'Start with the life question. Predicta keeps every free report useful, then offers premium depth only when timing, synthesis, or a polished PDF is worth it.',
    marketplaceEyebrow: 'Report choices',
    marketplacePromiseBody: 'Premium explains them deeper.',
    marketplacePromiseTitle: 'All charts stay visible',
    marketplaceTitle: 'Choose by outcome, not by complexity.',
    needKundli:
      'Create a Kundli first. Your report choices are saved and will be ready when the chart is created.',
    note:
      'Free users can include every part. Premium adds deeper timing, remedies, synthesis, and explanation depth.',
    plannedSectionBody:
      'This part belongs in the complete report. Once a Kundli is active, Predicta fills it with chart proof.',
    plannedSectionBulletFree: 'Free includes useful insight.',
    plannedSectionBulletPremium: 'Premium adds detailed timing and synthesis.',
    plannedSectionEvidence: 'Chart evidence appears after Kundli creation.',
    premiumAccessBody:
      'Premium PDF download needs Premium subscription, Day Pass, or one-time Premium PDF access.',
    premiumAccessCta: 'See Premium options',
    premiumAccessLabel: 'Premium report',
    premiumAccessTitle: 'Detailed depth needs access',
    premiumDepth: 'Premium depth',
    printSelected: 'Save selected PDF',
    selected: 'Selected',
    selectedReport: 'Selected',
    title: 'Make report download easy.',
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
      { eyebrow: 'KP', title: 'KP कस्प और सब-लॉर्ड आधार' },
      { eyebrow: 'नाड़ी', title: 'नाड़ी pattern प्रीव्यू' },
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
      { eyebrow: 'KP', title: 'KP cusp અને sub-lord આધાર' },
      { eyebrow: 'નાડી', title: 'નાડી pattern પ્રીવ્યૂ' },
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
    { eyebrow: 'Chalit', title: 'Bhav Chalit refinement' },
    { eyebrow: 'KP', title: 'KP cusp and sub-lord foundation' },
    { eyebrow: 'Nadi', title: 'Nadi pattern preview' },
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
        free: 'सारे चार्ट दिखाई देते हैं और उपयोगी insight मिलती है.',
        premium: 'हर चार्ट की विस्तृत synthesis, D1 आधार और timing.',
      },
      {
        area: 'दशा / गोचर',
        free: 'वर्तमान theme और सरल मार्गदर्शन.',
        premium: 'मासिक समय-खिड़कियां, activation timing और गहरा प्रमाण.',
      },
      {
        area: 'उपाय',
        free: 'सुरक्षित कर्म-आधारित साप्ताहिक practice.',
        premium: 'ग्रह-विशेष साधना, tracking और विस्तृत योजना.',
      },
      {
        area: 'PDF सुंदरता',
        free: 'प्रीमियम जैसी उपयोगी रिपोर्ट.',
        premium: 'अलग पहचान वाली विस्तृत रिपोर्ट, अधिक भाग और प्रमाण.',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        area: 'ચાર્ટ્સ',
        free: 'બધા ચાર્ટ્સ દેખાય છે અને ઉપયોગી insight મળે છે.',
        premium: 'દરેક ચાર્ટની વિગતવાર synthesis, D1 આધાર અને timing.',
      },
      {
        area: 'દશા / ગોચર',
        free: 'વર્તમાન theme અને સરળ માર્ગદર્શન.',
        premium: 'માસિક સમય-ખિડકીઓ, activation timing અને ઊંડો પુરાવો.',
      },
      {
        area: 'ઉપાયો',
        free: 'સુરક્ષિત કર્મ આધારિત સાપ્તાહિક practice.',
        premium: 'ગ્રહ-વિશેષ સાધના, tracking અને વિગતવાર યોજના.',
      },
      {
        area: 'PDF સુંદરતા',
        free: 'પ્રીમિયમ જેવી ઉપયોગી રિપોર્ટ.',
        premium: 'અલગ ઓળખ ધરાવતી વિગતવાર રિપોર્ટ, વધુ ભાગો અને પુરાવો.',
      },
    ];
  }

  return [
    {
      area: 'Charts',
      free: 'All charts are visible with useful insight.',
      premium: 'Detailed synthesis for every chart, anchored to D1 and timing.',
    },
    {
      area: 'Dasha / Gochar',
      free: 'Current theme and simple guidance.',
      premium: 'Monthly windows, activation timing, and deeper proof.',
    },
    {
      area: 'Remedies',
      free: 'Safe कर्म-आधारित weekly practice.',
      premium: 'Planet-specific sadhana, tracking, and detailed plan.',
    },
    {
      area: 'PDF polish',
      free: 'Premium-looking useful report.',
      premium: 'Distinctive detailed report with richer sections and proof.',
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
