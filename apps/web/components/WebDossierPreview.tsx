'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { hasPremiumPdfCredit } from '@pridicta/monetization';
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
import { buildGeneratedReportMemoryContext } from '@pridicta/config/predictaMemory';
import {
  PREDICTA_INTELLIGENCE_UI_RHYTHM,
  getChartRenderTheme,
  getPredictaSchoolIntelligencePattern,
} from '@pridicta/astrology';
import {
  composeReportSections,
  type PdfChartSnapshot,
  type PdfSection,
} from '@pridicta/pdf';
import type {
  KundliData,
  MonetizationState,
  PredictaSchool,
  RedeemedGuestPass,
  ReportSchoolLaneId,
  ResolvedAccess,
  SignatureAnalysisModel,
  SupportedLanguage,
} from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { loadWebKundliStore } from '../lib/web-kundli-storage';
import { getChartThemeNote } from '../lib/chart-theme-copy';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { PlanetGlyph } from './PlanetGlyph';
import { NorthIndianChartLines } from './WebKundliChart';
import { AuthDialog } from './AuthDialog';
import { PredictaButton } from './ui/DesignSystemPrimitives';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import {
  loadWebMonetizationState,
  loadWebRedeemedGuestPass,
  resolveWebAccess,
} from '../lib/web-access-state';
import { createInitialMonetizationState } from '@pridicta/monetization';

const SIGNATURE_DRAFT_STORAGE_KEY = 'pridicta.signatureDraft.v1';

type SignatureReportDraft = {
  analysisModel?: SignatureAnalysisModel;
  savedAt?: string;
};

type ReportSchoolLane = {
  bestFor: string;
  boundary: string;
  freeDepth: string;
  id: ReportMarketplaceProduct['school'];
  premiumDepth: string;
  productIds: ReportMarketplaceProduct['id'][];
  promise: string;
  readinessRequirement: string;
  title: string;
};

const REPORT_SCHOOL_LANES: ReportSchoolLane[] = [
  {
    bestFor: 'Classical Kundli, charts, dasha, panchang, varga, remedies, and life-area Vedic reports.',
    boundary:
      'Vedic reports use Parashari Jyotish only. KP, Nadi, Numerology, and Signature stay outside this lane.',
    freeDepth:
      'Free gives a useful chart-backed Vedic reading with clear limits and dignity.',
    id: 'VEDIC',
    premiumDepth:
      'Premium adds deeper varga synthesis, timing windows, evidence tables, and remedy planning.',
    productIds: [
      'KUNDLI',
      'VEDIC',
      'CAREER',
      'MARRIAGE',
      'WEALTH',
      'SADESATI',
      'DASHA',
      'COMPATIBILITY',
      'REMEDIES',
    ],
    promise: 'A classical Vedic report without method mixing.',
    readinessRequirement: 'Needs a valid Kundli with birth date, time, and place.',
    title: 'Vedic Reports',
  },
  {
    bestFor: 'Event judgement, promise/block, timing readiness, ruling planets, and proof for a specific question.',
    boundary:
      'KP reports use cusps, star lords, sub lords, sub-sub lords where available, significators, ruling planets, dasha support, and transit triggers. They do not become Vedic personality reports.',
    freeDepth:
      'Free gives useful event promise and timing-readiness insight.',
    id: 'KP',
    premiumDepth:
      'Premium gives full event proof, significator hierarchy, confidence, limitations, and timing reasoning.',
    productIds: ['KP'],
    promise: 'An event-answer lane for specific questions.',
    readinessRequirement: 'Needs a valid Kundli; works best after the user selects or asks one clear event question.',
    title: 'KP Reports',
  },
  {
    bestFor: 'Karmic story threads, planet-to-planet links, Rahu/Ketu axis, validation, and activation timing.',
    boundary:
      'Nadi reports use planetary story links, karaka themes, karmic patterns, validation questions, and activation timing. They do not use KP cusp logic and never claim palm-leaf manuscript access.',
    freeDepth:
      'Free gives the strongest story-thread preview, gift, caution, validation questions, and gentle guidance.',
    id: 'NADI',
    premiumDepth:
      'Premium gives deeper sequencing, validation-based deepening, activation windows, and practices.',
    productIds: ['NADI'],
    promise: 'A karmic story lane with explicit source boundaries.',
    readinessRequirement: 'Needs a valid Kundli; deeper reading should validate patterns before strong timing.',
    title: 'Nadi Reports',
  },
  {
    bestFor: 'Name/date number rhythm, name number, birth number, destiny number, cycles, and name refinement.',
    boundary:
      'Numerology reports use number logic only. They do not include Kundli judgement unless a future synthesis report explicitly says so.',
    freeDepth:
      'Free gives core numbers, simple meaning, current cycle, strengths, cautions, and practical guidance.',
    id: 'NUMEROLOGY',
    premiumDepth:
      'Premium adds detailed interpretation, timing calendar, compatibility, and name-spelling or brand-name comparison.',
    productIds: ['NUMEROLOGY'],
    promise: 'A number-led identity and timing lane.',
    readinessRequirement: 'Needs a saved name and birth date from the active profile.',
    title: 'Numerology Reports',
  },
  {
    bestFor: 'Confirmed signature traits, self-expression, confidence rhythm, consistency, and improvement guidance.',
    boundary:
      'Signature reports use confirmed visible traits only. They do not include Numerology or Vedic synthesis unless a future synthesis report explicitly says so.',
    freeDepth:
      'Free gives reflective visible-trait insight with privacy and safety framing.',
    id: 'SIGNATURE',
    premiumDepth:
      'Premium adds multi-sample comparison, before/after guidance, and a signature refinement plan.',
    productIds: ['SIGNATURE'],
    promise: 'A reflective self-expression lane, not forensic proof.',
    readinessRequirement: 'Needs a signature sample or confirmed manual-observation state.',
    title: 'Signature Reports',
  },
];

const REPORT_SYNTHESIS_LANE: ReportSchoolLane = {
  bestFor:
    'A non-technical life journey, soul purpose, hidden thread, current chapter, gifts, lessons, and next direction.',
  boundary:
    'Predicta Life Atlas is the only approved all-school synthesis report. It is not a Vedic, KP, Nadi, Numerology, or Signature report.',
  freeDepth:
    'Free gives a useful soul portrait, life journey summary, current chapter, gifts, lessons, and a closing letter.',
  id: 'SYNTHESIS',
  premiumDepth:
    'Premium adds deeper life narrative, soul-purpose synthesis, karmic pattern map, integration practices, and a memorable closing letter.',
  productIds: ['LIFE_ATLAS'],
  promise: 'Flagship synthesis without technical clutter.',
  readinessRequirement:
    'Needs a valid Kundli/profile. Signature is optional enrichment only and missing signature does not block generation.',
  title: 'Synthesis Reports',
};

export function WebDossierPreview(): React.JSX.Element {
  const didLoadSavedState = useRef(false);
  const downloadDialogRef = useRef<HTMLElement | null>(null);
  const downloadDialogPrimaryRef = useRef<HTMLButtonElement | null>(null);
  const inlineComposerRef = useRef<HTMLDivElement | null>(null);
  const reportChartPanelRef = useRef<HTMLElement | null>(null);
  const reportPreviewRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const [builderMode, setBuilderMode] = useState<'EVERYTHING' | 'CUSTOM'>(
    'EVERYTHING',
  );
  const [isReportPreviewOpen, setReportPreviewOpen] = useState(false);
  const [isDownloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [isReportMarketplaceOpen, setReportMarketplaceOpen] = useState(false);
  const [showStickyReportBar, setShowStickyReportBar] = useState(false);
  const [selectedSectionKeys, setSelectedSectionKeys] = useState<string[]>([]);
  const [reportSurfaceState, setReportSurfaceState] = useState<
    'idle' | 'purchase' | 'ready' | 'signin'
  >('idle');
  const [isPdfDownloading, setIsPdfDownloading] = useState(false);
  const [reportDownloadError, setReportDownloadError] = useState<string | null>(
    null,
  );
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<
    'idle' | 'report' | 'empty' | 'needKundli'
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
  const [monetization, setMonetization] = useState<MonetizationState>(
    createInitialMonetizationState(),
  );
  const [redeemedGuestPass, setRedeemedGuestPass] = useState<
    RedeemedGuestPass | undefined
  >();
  const [isAccessLoading, setIsAccessLoading] = useState(false);
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
  const signatureReportBlocked =
    selectedReportId === 'SIGNATURE' &&
    !hasReadySignatureReport(signatureAnalysis);

  useDialogFocusTrap(downloadDialogRef, {
    active: isDownloadDialogOpen && reportSurfaceState === 'ready',
    initialFocusRef: downloadDialogPrimaryRef,
    onClose: cancelDownloadDialog,
  });

  const selectedReportLane =
    selectedReport.school === 'SYNTHESIS'
      ? REPORT_SYNTHESIS_LANE
      : REPORT_SCHOOL_LANES.find(lane => lane.id === selectedReport.school) ??
        REPORT_SCHOOL_LANES[0];
  const reportLaneNavItems = useMemo(
    () => [
      ...REPORT_SCHOOL_LANES.map(lane => ({
        anchorId: `report-lane-${lane.id.toLowerCase()}`,
        label: lane.id === 'VEDIC' ? 'Vedic' : lane.title.replace(' Reports', ''),
        lane,
        productId: lane.productIds[0],
      })),
      {
        anchorId: 'report-lane-life-atlas',
        label: 'Life Atlas',
        lane: REPORT_SYNTHESIS_LANE,
        productId: 'LIFE_ATLAS' as ReportMarketplaceProduct['id'],
      },
    ],
    [],
  );

  const openReportLane = (item: (typeof reportLaneNavItems)[number]) => {
    setReportMarketplaceOpen(true);
    setSelectedReportId(item.productId);
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document
          .getElementById(item.anchorId)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 40);
    });
  };

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
    setRedeemedGuestPass(loadWebRedeemedGuestPass());
  }, []);

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
    if (!user?.uid) {
      setMonetization(createInitialMonetizationState());
      setIsAccessLoading(false);
      return;
    }

    let cancelled = false;
    setIsAccessLoading(true);

    loadWebMonetizationState(user.uid)
      .then(state => {
        if (!cancelled) {
          setMonetization(state);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsAccessLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    const existingGeneratedContext =
      loadWebAutoSaveMemory().report?.generatedReportContext;

    saveWebAutoSaveMemory({
      report: {
        mode,
        builderMode,
        generatedReportContext:
          existingGeneratedContext?.reportFocus === selectedReportId
            ? existingGeneratedContext
            : undefined,
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
  const authState = useMemo(
    () => ({
      email: user?.email ?? undefined,
      isLoggedIn: Boolean(user),
      provider:
        user?.providerData?.[0]?.providerId?.includes('google')
          ? 'google'
          : user?.providerData?.[0]?.providerId?.includes('password')
            ? 'password'
            : user?.providerData?.[0]?.providerId?.includes('apple')
              ? 'apple'
              : user?.providerData?.[0]?.providerId?.includes('microsoft')
                ? 'microsoft'
                : null,
      userId: user?.uid ?? undefined,
    }),
    [user],
  );
  const resolvedAccess = useMemo<ResolvedAccess>(
    () =>
      resolveWebAccess({
        auth: authState,
        monetization,
        redeemedGuestPass,
      }),
    [authState, monetization, redeemedGuestPass],
  );
  const hasDetailedReportAccess = useMemo(
    () =>
      resolvedAccess.hasPremiumAccess ||
      hasPremiumPdfCredit(monetization.oneTimeEntitlements, kundli?.id),
    [kundli?.id, monetization.oneTimeEntitlements, resolvedAccess.hasPremiumAccess],
  );
  const builderCopy = getReportBuilderCopy(appLanguage);
  const resultCopy = getReportResultCopy(appLanguage);
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
  const generatedSummaryLabel = generatedAt
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(generatedAt))
    : null;

  function buildCurrentReportMemoryContext(generatedAtOverride?: string) {
    return buildGeneratedReportMemoryContext({
      availableSections: sectionOptions.map(option => option.section.title),
      generatedAt: generatedAtOverride ?? generatedAt ?? undefined,
      mode,
      reportFocus: selectedReport.id,
      reportTitle: localizedSelectedReport.title,
      schoolLane: selectedReport.school,
      selectedSections: visibleSections.map(section => section.title),
      subjectName: kundli?.birthDetails.name,
    });
  }

  function buildCurrentReportAskHref(section?: PdfSection): string {
    const sectionTitle = section?.title ?? localizedSelectedReport.title;
    const sectionPrompt = section
      ? `Explain this report section: ${section.title}`
      : localizedSelectedReport.prompt;

    return buildReportAskHref({
      availableSections: sectionOptions.map(option => option.section.title),
      generatedAt: generatedAt ?? undefined,
      kundliId: kundli?.id,
      mode,
      product: selectedReport,
      reportTitle: localizedSelectedReport.title,
      section,
      sectionPrompt,
      sectionTitle,
      selectedSections: visibleSections.map(item => item.title),
      subjectName: kundli?.birthDetails.name,
    });
  }

  function scrollToGeneratedResult() {
    if (typeof window === 'undefined') {
      return;
    }

    window.setTimeout(() => {
      const target = reportPreviewRef.current ?? reportChartPanelRef.current;

      if (!target) {
        return;
      }

      const top = target.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({
        behavior: 'smooth',
        top: Math.max(top, 0),
      });
    }, 80);
  }

  useEffect(() => {
    const node = inlineComposerRef.current;

    if (!node || typeof IntersectionObserver === 'undefined') {
      setShowStickyReportBar(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyReportBar(!entry.isIntersecting && window.scrollY > 160);
      },
      { threshold: 0.12 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [selectedReportId, builderMode, mode, selectedSectionCount]);

  function openReportPreview({
    showDialog = true,
  }: { showDialog?: boolean } = {}): boolean {
    if (!kundli) {
      setCopyState('needKundli');
      window.setTimeout(() => setCopyState('idle'), 3200);
      return false;
    }

    if (signatureReportBlocked) {
      setReportDownloadError(
        'Upload, draw, and confirm a signature sample before generating a Signature report.',
      );
      setReportPreviewOpen(false);
      setDownloadDialogOpen(false);
      window.setTimeout(() => setReportDownloadError(null), 4200);
      return false;
    }

    if (builderMode === 'CUSTOM' && !visibleSections.length) {
      setCopyState('empty');
      window.setTimeout(() => setCopyState('idle'), 1800);
      return false;
    }

    if (mode === 'PREMIUM' && !hasDetailedReportAccess) {
      setReportPreviewOpen(true);
      setDownloadDialogOpen(false);
      setReportSurfaceState(user ? 'purchase' : 'signin');
      scrollToGeneratedResult();
      return false;
    }

    const nextGeneratedAt = new Date().toISOString();
    setGeneratedAt(nextGeneratedAt);
    saveWebAutoSaveMemory({
      report: {
        builderMode,
        generatedReportContext: buildCurrentReportMemoryContext(nextGeneratedAt),
        mode,
        reportLanguage,
        selectedReportId,
        selectedSectionKeys,
        updatedAt: nextGeneratedAt,
      },
    });
    setReportPreviewOpen(true);
    setDownloadDialogOpen(showDialog);
    setReportSurfaceState('ready');
    scrollToGeneratedResult();
    return true;
  }

  async function downloadReportPdf() {
    if (!kundli) {
      openReportPreview({ showDialog: true });
      return;
    }

    if (signatureReportBlocked) {
      setReportDownloadError(
        'Signature report download is blocked until a confirmed signature sample is available.',
      );
      return;
    }

    if (builderMode === 'CUSTOM' && !visibleSections.length) {
      openReportPreview({ showDialog: true });
      return;
    }

    try {
      setIsPdfDownloading(true);
      setReportDownloadError(null);

      const response = await fetch('/api/report/pdf', {
        body: JSON.stringify({
          kundli,
          language: reportLanguage,
          mode,
          reportFocus: selectedReportId,
          sectionKeys:
            builderMode === 'CUSTOM' ? selectedSectionKeys : undefined,
          signatureAnalysis,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Predicta could not prepare the PDF right now.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download =
        parseDownloadFilename(response.headers.get('Content-Disposition')) ??
        `predicta-${selectedReportId.toLowerCase()}-${mode.toLowerCase()}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setDownloadDialogOpen(false);
      saveWebAutoSaveMemory({
        report: {
          builderMode,
          generatedReportContext: buildCurrentReportMemoryContext(
            new Date().toISOString(),
          ),
          mode,
          reportLanguage,
          selectedReportId,
          selectedSectionKeys,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      setReportDownloadError(
        error instanceof Error
          ? error.message
          : 'Predicta could not prepare the PDF right now.',
      );
    } finally {
      setIsPdfDownloading(false);
    }
  }

  function printReport() {
    void downloadReportPdf();
  }

  function cancelDownloadDialog() {
    setDownloadDialogOpen(false);
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

  function renderInlineReportComposer(
    product: ReportMarketplaceProduct,
    {
      attachStickyRef = false,
      surface = 'inline',
    }: { attachStickyRef?: boolean; surface?: 'inline' | 'primary' } = {},
  ): React.JSX.Element | null {
    if (product.id !== selectedReportId) {
      return null;
    }

    const isVedicReport = product.school === 'VEDIC';
    const summarySections = visibleSections.slice(0, 8);

    return (
      <div
        className={
          isVedicReport
            ? `report-inline-composer vedic ${surface}`
            : `report-inline-composer direct ${surface}`
        }
        data-phase13-report-composer-contract={surface}
        ref={attachStickyRef ? inlineComposerRef : undefined}
      >
        <div className="report-inline-composer-top">
          <div>
            <div className="section-title">
              {selectedReportLane.title} · {builderCopy.selectedReport}
            </div>
            <h3>{localizedSelectedReport.title}</h3>
            <p>{localizedSelectedReport.bestFor}</p>
            <small>
              {kundli?.birthDetails.name ?? builderCopy.needKundli} ·{' '}
              {mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free}
            </small>
          </div>
          <div className="report-inline-mode-card">
            <span>{labels.reportDepth}</span>
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
        </div>

        <div className="report-inline-actions">
          <PredictaButton
            disabled={signatureReportBlocked}
            onClick={() => openReportPreview()}
            type="button"
            variant="primary"
          >
            {builderCopy.previewSelected}
          </PredictaButton>
          <PredictaButton href={buildCurrentReportAskHref()} variant="secondary">
            {builderCopy.askFromReport}
          </PredictaButton>
          <PredictaButton onClick={copyReportSummary} type="button" variant="secondary">
            {copyState === 'report' ? builderCopy.copied : builderCopy.copyReport}
          </PredictaButton>
        </div>

        {isVedicReport ? (
          <>
            <div className="report-inline-recommended">
              <div>
                <span>Recommended by Predicta</span>
                <strong>
                  {builderMode === 'EVERYTHING'
                    ? 'Complete Vedic bundle'
                    : 'Custom Vedic bundle'}
                </strong>
                <p>
                  Predicta will include the most important sections for this
                  report. Customize only if you want a narrower PDF.
                </p>
              </div>
              <div className="report-builder-count">
                <span>{builderCopy.selected}</span>
                <strong>
                  {selectedSectionCount}/{sectionOptions.length}
                </strong>
              </div>
            </div>
            <div className="report-inline-chip-grid" aria-label="Selected Vedic sections">
              {summarySections.map(section => (
                <span key={`${section.eyebrow}-${section.title}`}>
                  {section.title}
                </span>
              ))}
              {visibleSections.length > summarySections.length ? (
                <span>+{visibleSections.length - summarySections.length} more</span>
              ) : null}
            </div>
            <details className="report-drawer report-inline-customize">
              <summary>
                <span>{builderCopy.customLabel}</span>
                <strong>{builderCopy.customTitle}</strong>
              </summary>
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
              <div className="report-builder-section-grid">
                {sectionOptions.map(({ key, section }) => (
                  <button
                    aria-pressed={builderMode === 'EVERYTHING' || selectedKeySet.has(key)}
                    className={
                      kundli
                        ? 'report-builder-section'
                        : 'report-builder-section preview'
                    }
                    key={key}
                    onClick={() => toggleSection(key)}
                    type="button"
                  >
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
                  </button>
                ))}
              </div>
            </details>
          </>
        ) : (
          <div className="report-depth-grid inline">
            <div>
              <span>{builderCopy.freePreview}</span>
              <p>{localizedSelectedReport.freeDepth}</p>
            </div>
            <div>
              <span>{builderCopy.premiumDepth}</span>
              <p>
                {isAccessLoading
                  ? resultCopy.loadingBody
                  : hasDetailedReportAccess
                    ? localizedSelectedReport.premiumDepth
                    : resultCopy.premiumLockedBody}
              </p>
            </div>
          </div>
        )}

        <details className="report-drawer report-inline-language">
          <summary>
            <span>{reportLanguageCopy.eyebrow}</span>
            <strong>{reportLanguageCopy.title}</strong>
          </summary>
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
        </details>

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
      </div>
    );
  }

  useEffect(() => {
    const keys = sectionOptions.map(option => option.key);
    const keySet = new Set(keys);

    setSelectedSectionKeys(current => {
      const validCurrent = current.filter(key => keySet.has(key));
      return validCurrent.length ? validCurrent : keys;
    });
  }, [kundli?.id, report.mode, reportLanguage, selectedReportId]);

  useEffect(() => {
    if (!isReportPreviewOpen) {
      return;
    }

    if (mode === 'PREMIUM' && !hasDetailedReportAccess) {
      setReportSurfaceState(user ? 'purchase' : 'signin');
      return;
    }

    setReportSurfaceState('ready');
  }, [hasDetailedReportAccess, isReportPreviewOpen, mode, user]);

  useEffect(() => {
    if (!isReportPreviewOpen) {
      return;
    }

    scrollToGeneratedResult();
  }, [generatedAt, isReportPreviewOpen, reportSurfaceState]);

  return (
    <div className="dossier-preview">
      <WebActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Report"
        title="Report Kundli"
      />
      <section
        className="report-quick-composer glass-panel"
        data-phase13-first-screen-primary-action="true"
      >
        <div className="report-selected-choice">
          <div className="report-product-card active report-selected-product-card">
            <span>{localizedSelectedReport.badge}</span>
            <strong>{localizedSelectedReport.title}</strong>
            <em>{localizedSelectedReport.outcome}</em>
            <small>{localizedSelectedReport.bestFor}</small>
          </div>
          {renderInlineReportComposer(selectedReport, {
            attachStickyRef: true,
            surface: 'primary',
          })}
        </div>

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

        <button
          className="report-change-world-button"
          onClick={() => setReportMarketplaceOpen(current => !current)}
          type="button"
        >
          {isReportMarketplaceOpen ? 'Hide report worlds' : 'Change report world'}
        </button>

        <nav
          aria-label="Report school navigation"
          className="report-school-subnav"
        >
          {reportLaneNavItems.map(item => {
            const isActive =
              item.lane.id === selectedReportLane.id &&
              item.productId === selectedReport.id;

            return (
              <button
                aria-current={isActive ? 'true' : undefined}
                className={isActive ? 'active' : ''}
                key={item.anchorId}
                onClick={() => openReportLane(item)}
                type="button"
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </section>

      <section className="report-marketplace glass-panel">
        <details
          className="report-marketplace-selector"
          onToggle={event => setReportMarketplaceOpen(event.currentTarget.open)}
          open={isReportMarketplaceOpen}
        >
          <summary>
            <span>School-separated marketplace</span>
            <strong>
              Choose a different Vedic, KP, Nadi, Numerology, Signature, or Life
              Atlas report
            </strong>
          </summary>
          <div className="report-marketplace-expanded">

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

        <section
          aria-label="Choose your report world"
          className="report-school-marketplace"
        >
          <article
            className={
              selectedReport.school === 'SYNTHESIS'
                ? 'report-school-lane synthesis active'
                : 'report-school-lane synthesis'
            }
            id="report-lane-life-atlas"
          >
            <div className="report-school-lane-header">
              <div>
                <span>{REPORT_SYNTHESIS_LANE.promise}</span>
                <h4>{REPORT_SYNTHESIS_LANE.title}</h4>
                <p>{REPORT_SYNTHESIS_LANE.bestFor}</p>
              </div>
              <strong
                className={
                  kundli
                    ? 'report-lane-readiness ready'
                    : 'report-lane-readiness pending'
                }
              >
                {kundli ? 'Profile ready' : 'Needs Kundli'}
              </strong>
            </div>
            <div className="report-lane-depth-row">
              <div>
                <span>Free/basic</span>
                <p>{REPORT_SYNTHESIS_LANE.freeDepth}</p>
              </div>
              <div>
                <span>Premium/paid</span>
                <p>{REPORT_SYNTHESIS_LANE.premiumDepth}</p>
              </div>
              <div>
                <span>Required input</span>
                <p>
                  {kundli
                    ? 'Core Vedic, KP, Nadi, and Numerology inputs can be synthesized. Signature remains optional enrichment only.'
                    : REPORT_SYNTHESIS_LANE.readinessRequirement}
                </p>
              </div>
            </div>
            <div className="report-lane-boundary">
              <span>Synthesis boundary</span>
              <p>{REPORT_SYNTHESIS_LANE.boundary}</p>
            </div>
            <div
              className="predicta-intelligence-pattern report-life-atlas-rhythm"
              data-audit1-phase7f-intelligence-pattern="life-atlas"
            >
              {PREDICTA_INTELLIGENCE_UI_RHYTHM.map(step => {
                const pattern = getPredictaSchoolIntelligencePattern('LIFE_ATLAS');
                const copy = {
                  action: pattern.action,
                  evidence: pattern.evidence,
                  prediction: pattern.prediction,
                  safety: pattern.safety,
                };

                return (
                  <article className="predicta-intelligence-step" key={step.id}>
                    <span>{step.label}</span>
                    <strong>{copy[step.id]}</strong>
                  </article>
                );
              })}
            </div>
            <div className="report-lane-boundary">
              <span>Signature privacy</span>
              <p>
                {signatureAnalysis?.status === 'ready'
                  ? 'Confirmed visible signature traits can enrich Life Atlas for this session.'
                  : 'Signature expression layer was not included because no signature sample was provided. Missing signature does not block Life Atlas.'}
              </p>
            </div>
            <div className="report-product-grid lane-products">
              {marketplaceProducts
                .filter(product => product.school === 'SYNTHESIS')
                .map(product => {
                  const localizedProduct = getLocalizedReportProduct(
                    product,
                    appLanguage,
                  );

                  return (
                    <Fragment key={product.id}>
                      <button
                        aria-pressed={product.id === selectedReportId}
                        className={
                          product.id === selectedReportId
                            ? 'report-product-card active'
                            : 'report-product-card'
                        }
                        onClick={() => setSelectedReportId(product.id)}
                        type="button"
                      >
                        <span>{localizedProduct.badge}</span>
                        <strong>{localizedProduct.title}</strong>
                        <em>{localizedProduct.outcome}</em>
                        <small>{localizedProduct.bestFor}</small>
                      </button>
                      {renderInlineReportComposer(product)}
                    </Fragment>
                  );
                })}
            </div>
          </article>

          <div className="report-school-heading">
            <div className="section-title">School-separated reports</div>
            <h3>Choose your report world</h3>
            <p>
              Each lane keeps its own method clean. Choose Vedic, KP, Nadi,
              Numerology, or Signature without accidentally buying a mixed bag
              report.
            </p>
          </div>
          {REPORT_SCHOOL_LANES.map(lane => {
            const laneProducts = marketplaceProducts.filter(
              product =>
                product.school === lane.id &&
                lane.productIds.includes(product.id),
            );
            const readiness = getReportLaneReadiness({
              kundli,
              lane,
              signatureAnalysis,
            });
            const isActiveLane = lane.id === selectedReportLane.id;

            return (
              <article
                className={
                  isActiveLane
                    ? 'report-school-lane active'
                    : 'report-school-lane'
                }
                id={`report-lane-${lane.id.toLowerCase()}`}
                key={lane.id}
              >
                <div className="report-school-lane-header">
                  <div>
                    <span>{lane.promise}</span>
                    <h4>{lane.title}</h4>
                    <p>{lane.bestFor}</p>
                  </div>
                  <strong
                    className={
                      readiness.ready
                        ? 'report-lane-readiness ready'
                        : 'report-lane-readiness pending'
                    }
                  >
                    {readiness.label}
                  </strong>
                </div>
                <div className="report-lane-depth-row">
                  <div>
                    <span>Free/basic</span>
                    <p>{lane.freeDepth}</p>
                  </div>
                  <div>
                    <span>Premium/paid</span>
                    <p>{lane.premiumDepth}</p>
                  </div>
                  <div>
                    <span>Required input</span>
                    <p>{readiness.detail}</p>
                  </div>
                </div>
                <div className="report-lane-boundary">
                  <span>Method boundary</span>
                  <p>{lane.boundary}</p>
                </div>
                <div className="report-product-grid lane-products">
                  {laneProducts.map(product => {
                    const localizedProduct = getLocalizedReportProduct(
                      product,
                      appLanguage,
                    );

                    return (
                      <Fragment key={product.id}>
                        <button
                          aria-pressed={product.id === selectedReportId}
                          className={
                            product.id === selectedReportId
                              ? 'report-product-card active'
                              : 'report-product-card'
                          }
                          onClick={() => setSelectedReportId(product.id)}
                          type="button"
                        >
                          <span>{localizedProduct.badge}</span>
                          <strong>{localizedProduct.title}</strong>
                          <em>{localizedProduct.outcome}</em>
                          <small>{localizedProduct.bestFor}</small>
                        </button>
                        {renderInlineReportComposer(product)}
                      </Fragment>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </section>
          </div>
        </details>
      </section>

      {showStickyReportBar ? (
        <div className="report-sticky-mini-bar" role="status">
          <div>
            <span>{localizedSelectedReport.title}</span>
            <strong>
              {selectedSectionCount} sections ·{' '}
              {mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free}
            </strong>
          </div>
          <PredictaButton
            disabled={signatureReportBlocked}
            onClick={() => openReportPreview()}
            type="button"
            variant="primary"
          >
            {builderCopy.previewSelected}
          </PredictaButton>
        </div>
      ) : null}

      {isReportPreviewOpen ? (
        <section className="report-download-stage glass-panel" ref={reportPreviewRef}>
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
            <strong>
              {mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free}
            </strong>
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

          {reportSurfaceState === 'ready' ? (
            <>
              <section className="report-download-hero">
                <div>
                  <div className="section-title">
                    {localizedReportTitle.title.toUpperCase()} · DOSSIER{' '}
                    {report.dossierVersion}
                  </div>
                  <h2>
                    {mode === 'PREMIUM'
                      ? resultCopy.readyPremiumTitle
                      : resultCopy.readyFreeTitle}
                  </h2>
                  <p>{report.executiveSummary.headline}</p>
                </div>
                <div className="dossier-confidence">
                  <span>{labels.confidence}</span>
                  <strong>
                    {getConfidenceLabel(
                      reportLanguage,
                      report.executiveSummary.confidence,
                    )}
                  </strong>
                </div>
              </section>

              <div className="report-download-actions">
                <PredictaButton
                  disabled={isPdfDownloading || signatureReportBlocked}
                  loading={isPdfDownloading}
                  onClick={printReport}
                  type="button"
                  variant="primary"
                >
                  {isPdfDownloading
                    ? resultCopy.preparingPdf
                    : builderCopy.printSelected}
                </PredictaButton>
                <PredictaButton
                  onClick={copyReportSummary}
                  type="button"
                  variant="secondary"
                >
                  {copyState === 'report'
                    ? builderCopy.copied
                    : builderCopy.copyReport}
                </PredictaButton>
                <PredictaButton href={buildCurrentReportAskHref()} variant="secondary">
                  {builderCopy.askFromReport}
                </PredictaButton>
              </div>
              {reportDownloadError ? (
                <p className="report-builder-note important">
                  {reportDownloadError}
                </p>
              ) : null}

              <div className="report-result-grid compact">
                <section className="report-result-card">
                  <span>{resultCopy.keySignalsEyebrow}</span>
                  <strong>{resultCopy.keySignalsTitle}</strong>
                  <div className="report-result-list">
                    {report.executiveSummary.keySignals.map(signal => (
                      <p key={signal}>{signal}</p>
                    ))}
                  </div>
                </section>
                <section className="report-result-card">
                  <span>{reportPrintCopy.chartsEyebrow}</span>
                  <strong>{reportPrintCopy.chartsTitle}</strong>
                  <div className="report-result-list">
                    <p>{reportPrintCopy.chartsBody}</p>
                    <p>
                      {report.chartSnapshots.length}{' '}
                      {resultCopy.chartPreviewCount}
                    </p>
                  </div>
                </section>
                <section className="report-result-card">
                  <span>{builderCopy.includesHeading}</span>
                  <strong>{resultCopy.includedTitle}</strong>
                  <div className="report-included-grid compact">
                    {visibleSections.map(section => (
                      <span key={`${report.mode}-${section.title}`}>
                        {section.title}
                      </span>
                    ))}
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section className="report-gate-panel">
              <div className="section-title">{resultCopy.lockedEyebrow}</div>
              <h2>
                {reportSurfaceState === 'signin'
                  ? resultCopy.signInTitle
                  : resultCopy.purchaseTitle}
              </h2>
              <p>
                {reportSurfaceState === 'signin'
                  ? resultCopy.signInBody
                  : resultCopy.purchaseBody}
              </p>
              <div className="report-download-actions">
                {reportSurfaceState === 'signin' ? (
                  <AuthDialog />
                ) : (
                  <>
                    <PredictaButton href="/checkout?productId=pridicta_premium_pdf" variant="primary">
                      {resultCopy.purchasePrimary}
                    </PredictaButton>
                    <PredictaButton href="/checkout?productId=pridicta_day_pass_24h" variant="secondary">
                      {resultCopy.purchaseSecondary}
                    </PredictaButton>
                  </>
                )}
                <PredictaButton
                  onClick={() => setMode('FREE')}
                  type="button"
                  variant="secondary"
                >
                  {resultCopy.fallbackFreeCta}
                </PredictaButton>
              </div>
            </section>
          )}
        </section>
      ) : null}
      {isDownloadDialogOpen && reportSurfaceState === 'ready' ? (
        <div
          className="report-download-dialog-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              cancelDownloadDialog();
            }
          }}
          role="presentation"
        >
          <section
            aria-describedby="report-download-dialog-body"
            aria-labelledby="report-download-dialog-title"
            aria-modal="true"
            className="report-download-dialog"
            ref={downloadDialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <div className="report-download-dialog-orb" aria-hidden="true" />
            <div className="section-title">{builderCopy.dialogEyebrow}</div>
            <h2 id="report-download-dialog-title">
              {builderCopy.dialogTitle}
            </h2>
            <p id="report-download-dialog-body">{builderCopy.dialogBody}</p>
            <div className="report-download-dialog-card">
              <span>{localizedReportTitle.title}</span>
              <strong>{kundli?.birthDetails.name ?? 'Predicta'}</strong>
              <small>
                {mode === 'PREMIUM' ? reportLabels.premium : reportLabels.free}
                {' · '}
                {report.cover.metadata.slice(0, 2).join(' · ')}
              </small>
            </div>
            <div className="report-download-dialog-preview">
              <strong>{report.executiveSummary.headline}</strong>
              <ul>
                {report.executiveSummary.keySignals.slice(0, 3).map(signal => (
                  <li key={signal}>{signal}</li>
                ))}
              </ul>
            </div>
            <div className="report-download-dialog-actions">
              <button
                className="predicta-button predicta-button--primary predicta-button--md"
                disabled={isPdfDownloading || signatureReportBlocked}
                data-loading={isPdfDownloading ? 'true' : undefined}
                onClick={printReport}
                ref={downloadDialogPrimaryRef}
                type="button"
              >
                {isPdfDownloading
                  ? resultCopy.preparingPdf
                  : builderCopy.printSelected}
              </button>
              <PredictaButton
                disabled={isPdfDownloading}
                onClick={cancelDownloadDialog}
                type="button"
                variant="secondary"
              >
                {builderCopy.cancelDownload}
              </PredictaButton>
            </div>
            {reportDownloadError ? (
              <p className="report-builder-note important">
                {reportDownloadError}
              </p>
            ) : null}
          </section>
        </div>
      ) : null}
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
          <span>{formatReportPreviewChartRole(snapshot)}</span>
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

function formatReportPreviewChartRole(snapshot: PdfChartSnapshot): string {
  if (snapshot.chartRole === 'MOON') {
    return 'Moon / Chandra Lagna';
  }

  if (snapshot.chartRole === 'CHALIT') {
    return 'Chalit';
  }

  return snapshot.chartType;
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
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c3fd9505e6"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.37bac83a8d"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a4403dd4e4"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.93ce110a50"),
      },
      Subscription: {
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.75fb46da2e"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.58c75c2e00"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.597355aef3"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.265ca6864f"),
      },
      'Day Pass': {
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c6608ee536"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bfe67ba47e"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ec32113b0b"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7a712380e3"),
      },
    };

    return map[item.label] ?? item;
  }

  if (language === 'gu') {
    const map: Record<string, ReportPurchaseGuide> = {
      'One-time report': {
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8d7456d290"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.72eedd6de0"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.329efc60f2"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bdaa3fd255"),
      },
      Subscription: {
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6ed2ad503f"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.23df8c32af"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ddc01a560a"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5ba388bc38"),
      },
      'Day Pass': {
        body: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0d9969ff38"),
        cta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.95ea9365f4"),
        label: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.039eabd9e9"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e148986a92"),
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
      LIFE_ATLAS: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ec5a77f492"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9f4e6180b3"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c44e0b12bb"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.50c0329fd6"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f46cc01efb"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f03ec78f55"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dc5f2e88d8")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.73c4de2af1"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.fe6e0e23af"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6c30b0958a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.192e5cfb94"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.77f2689ce0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5ba7533de6"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6e77070ec2")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0d9d2685ea"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1a7a112c1d"),
      },
      KUNDLI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d3e05004d0"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.283dd40df7"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8640c8972d"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e6da7dd411"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.db83742272"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.707cae2e26"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6b97c73965")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.352ee9ff3e"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5128aa9309"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.fc46371c1b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9fabb7fc58"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.420a75de98"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0503fc3b55")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ddfd861497"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c982ce7cd1"),
      },
      VEDIC: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0a41d55d52"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c90700ec63"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.515a962f50"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bfe1a6c7ce"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f4eba547bc"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.707cae2e26"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.42faf5f74e")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f7a4b28cab"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f21b404b42"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8243a1d9ea"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9fabb7fc58"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.978b1c7051"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2f34a81559")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dd4b8fb9aa"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.07064e0def"),
      },
      KP: {
        badge: 'KP',
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9e9b16faa6"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b861ee2b52"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5d07519e47"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a900193d76"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b995655642"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.88a34b9560")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a32cbca216"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6abe2044ab"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.746528d17b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2c648ff234"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2bac7c2da3"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bb1af42c9e")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9c5269fed4"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.97e327ed4c"),
      },
      NADI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1849d6330d"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.84cb1ad143"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.859be74ed1"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.19f4718b20"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3230cc0a15"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5726a341e6"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.54403cfc12")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.71d1962c9c"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1ab05a6bb2"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1b255eadf4"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.416dcb92ab"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.41e67626ad"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.262ed94e34")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.21352b89b7"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.091bf60195"),
      },
      CAREER: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a0201660d1"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f65479d6ca"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.20dd5d0d1b"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.290227bc9d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.09ea9ea694"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.386916202f"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6fc6bc733f")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.33c2671726"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5a7ba9b365"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9be2ebc98b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cca7769ad5"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5d9ba9f21f"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.546703d303")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6c48d7e466"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e4e277f1e5"),
      },
      MARRIAGE: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.54a2597751"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.daeaa086e5"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.83144f12d5"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e7b874d080"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.75895c8889"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c3294a685b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d155b470b7")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.511b6a0af7"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4bf9cb55e7"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.94c53f63ac"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.08020228d5"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.551d456d5f"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0792f65323")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.baeebf2d65"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.db1a2d287c"),
      },
      WEALTH: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4a727823f0"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.64c4133941"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5e87dc067c"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e25e4c505a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8ff4b8e25d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dfea8b472a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9729f42da0")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a71287ed0b"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2de4ad0d27"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9cfa12d024"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c4f3422dec"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.557199b0ee"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5023f9d66e")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.97fa1ea985"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9a3affe427"),
      },
      SADESATI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.76e8e9058e"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b278c6bcd7"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a2f2092040"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7af24bb4bc"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.501e6e8895"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.86fc24b935"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.220f0ff3f4")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8cafa3a995"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b363f1f597"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9aaa55944f"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.83550fbd85"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c644abab51"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a3c805fd3b")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.44bbfe76f6"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.510b04f5e8"),
      },
      DASHA: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7457c45e9e"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.df71d4f4b6"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.862b6fc4ac"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a87e4ba705"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c030eb2eea"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dfa9441b5a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9584c0869c")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9189813ef9"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.74f7bcd608"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d7c5438d89"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dd1b12e263"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3406176ffe"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1302eb50be")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e671694376"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c9d3bb72a5"),
      },
      COMPATIBILITY: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bc7d4af211"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1ac3ca7054"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d0ae000c4d"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e344a89475"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4424895cb4"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.09aeca2df2"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9d640b08a6")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0296d10c9e"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.83d3e223eb"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f20be31cd8"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.410727c198"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aedc1910a0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ecf1216f39")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0fed036941"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d8fb1adccb"),
      },
      NUMEROLOGY: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cc84d821e7"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.97dd908661"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e73d4b4afc"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d4e6e08b40"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.303818982c"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2a4f32db58"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7aec190edc")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d3829d9665"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1b63f58469"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6d9b5132af"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bc8849d05e"), 'Compatibility numbers', getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8688f46807")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1e12eefa3f"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b7eda313a6"),
      },
      SIGNATURE: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3bd079967d"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ce1270daa4"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.deaac3bcb8"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.990390eb7a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.54403cfc12"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6a1ddea763"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.626e2fe6b4")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ed36820ec8"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.015a9a6ad4"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.19fa8f90a3"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.29dd201438"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e0dd1daa6b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.59906b0d79")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9cd8476505"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5e1c94d0c4"),
      },
      REMEDIES: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a05042b6ab"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ea4478d431"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ddb62100e8"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c91c0274ec"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.868b021b98"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6450daf950"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c4fadfc589")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6c2b213718"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ac6ed690f6"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c4b211eb76"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.13a3126b5b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.38ca9690f6"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e40d018fea")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6466ad8491"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5accb95e76"),
      },
    };

    return { ...product, ...(map[product.id] ?? {}) };
  }

  if (language === 'gu') {
    const map: Partial<Record<ReportMarketplaceProduct['id'], Partial<ReportMarketplaceProduct>>> = {
      LIFE_ATLAS: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c456569f48"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b83a59f4cd"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6cb0222388"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ff15be0114"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8842995687"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.265a903aa3"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.40802dd548")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3ba80429f7"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c8d2d6aee3"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7ce908330a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f879d0a4fc"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb76fff9a0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.238354c97a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.627cfbff49")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aa3c7ee9e3"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dd4ea89348"),
      },
      KUNDLI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.391d646779"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d35e46f971"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.856fb6ea35"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.967684a960"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2cc13696bb"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.59cd2b3d64"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8f0441b5a0")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9d3c03c392"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.05b0744024"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.eda996af51"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6cceebc57a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5ff22b46e1"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2e0dd877a0")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.205b7dfde1"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.11005575f1"),
      },
      VEDIC: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e653aaf5e6"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.54dbe460e9"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.958e8dd8e2"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7cdfeda04b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9534ee5adf"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.59cd2b3d64"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.35d619c197")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4c0419e09c"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2dfde274fc"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.826cfdcf7e"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6cceebc57a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e9e808bbfa"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.db48d07d20")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c7bcdfae92"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.21585c4b22"),
      },
      KP: {
        badge: 'KP',
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9067105e36"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dac0781a7d"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c61d55b473"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.205daa0d86"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4a4189acfd"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5810ca514c")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c69b5e1251"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bf677b1031"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.eabd9cd728"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e06755441b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.47b27d59e4"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3d7accac42")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.00b92431cd"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4f80d08646"),
      },
      NADI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d653d63a61"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.047ae59353"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a5c1df9f21"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4129489096"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e44f2408e9"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2c26849274"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0e1b7075b8")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.650f64b4e3"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9b158eb32f"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.359fd1e2f6"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.300b0d086e"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.470c6a9ba1"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5494069342")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6b4f7e4239"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4203c7842e"),
      },
      CAREER: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aa10e069f6"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ff923f900b"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a204063fc5"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.272e71a954"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e175b821e1"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5abf6cbcb7"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.06dabdceda")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4c2e153f25"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.537a9a2a38"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4942e5b3ea"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b20d972b0c"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.80e18d0ad5"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e115c9dbce")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dca2230378"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.96d46aa306"),
      },
      MARRIAGE: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8a6353c98a"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cfb250ba96"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4e7a09242d"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0ebb19986b"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cea2099aba"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8d8a8fbe8c"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.135276f719")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d3551580dd"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c31ec75abf"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.edf5a41ba3"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.62c5666a3d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2aefc35b2d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f37e010442")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a973853038"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ad04697025"),
      },
      WEALTH: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a0cf33e8c0"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e8225cfc9e"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.df1962482c"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b443aa51bd"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.177a9002c8"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9d0f2c6ee0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8f7747e93a")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.de7e3d7d1a"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d8b2cf4185"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1fb18452c4"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.196ab970df"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d2ce577900"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4dcf587cab")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.08d4fbecc3"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3f96e5a5bf"),
      },
      SADESATI: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4b0976b0f5"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7ff7d1493d"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f8eee71497"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6d43159be9"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.81823e34e4"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7e75caf132"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0cfa0d7acc")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.602c3e5eca"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.72b6710114"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.32a0e92c7a"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aec2c35c50"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b4e8f32b20"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2c22d7b660")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d44b90ebf9"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9d920974bd"),
      },
      DASHA: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.82e44a590f"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f0f85ecc2f"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.16a93c387f"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5179583bac"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4784261360"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bda7363edb"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.66e817e4af")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.18797c08b9"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d4e7ece4d7"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f1f5ba9b8e"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d4e5e6362c"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5844d06361"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2da3102a1e")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a078e0faa0"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d02dc74dca"),
      },
      COMPATIBILITY: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bcef294a0d"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a5d7101002"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.68c3912699"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8eb19f502e"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f875e7df12"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7451626834"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a667a173ec")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aa3d74f690"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3585a3813a"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b9425ccb1d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c8d42bcbb8"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d6d4502a63"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c8849b279e")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1cf8599542"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.79ba9fc513"),
      },
      NUMEROLOGY: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b746e1f8f4"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.040ab99262"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.622b534566"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.31df714f16"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4bb1057cab"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.022dc14707"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.945b1dc116")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.49d510f032"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.77c047763e"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.67708784d0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c62c9354a1"), 'Compatibility numbers', getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f9be68dc35")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c49fdca0ff"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d498b4e35e"),
      },
      SIGNATURE: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.caf99f4fa3"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d7547c78c3"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.795d3c0be5"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.36f0c6b4b8"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0e1b7075b8"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.88732da165"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.211cb41b57")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1a88488e2f"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.15ed486340"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a97db1a896"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9621d06b8d"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7b35f84cfa"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.383928580c")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e0c80eb5ce"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bf10111b20"),
      },
      REMEDIES: {
        badge: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d701b81bf4"),
        bestFor: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f4ba5dc240"),
        freeDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.011603cd9d"),
        freeIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1644d64a74"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.348fce061c"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e74fc2b7b3"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.da9ef5f481")],
        outcome: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4851e205ac"),
        premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.fa625ad2c7"),
        premiumIncludes: [getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b14c5c75d0"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.84120334bd"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b4164a79cf"), getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.eed7a10037")],
        purchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2b1613e251"),
        title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7a0f29d9b6"),
      },
    };

    return { ...product, ...(map[product.id] ?? {}) };
  }

  return product;
}

function getReportBuilderCopy(language: SupportedLanguage): {
  askFromReport: string;
  cancelDownload: string;
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
  dialogBody: string;
  dialogEyebrow: string;
  dialogTitle: string;
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
      askFromReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.87fe284f4f"),
      cancelDownload: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0d554cb396"),
      createKundliCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7cacfebde9"),
      createKundliToSelect: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2e17fc9403"),
      copied: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d6758a813a"),
      copyChat: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.fdc04664fa"),
      copyReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.279bb28b3a"),
      customBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ec931042b8"),
      customLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f2ff1421c7"),
      customTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7dc9b251d2"),
      compareDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b2aa4c87dd"),
      differenceColumn: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.16de472f9f"),
      differenceEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e7a02f7a33"),
      dialogBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c5397f98a2"),
      dialogEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dc35537316"),
      dialogTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7856b8ca62"),
      downloadChatPdf: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.76162615d9"),
      emptySelection: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7d456caf59"),
      everythingBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8f54596926"),
      everythingIncludesBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3976b2368e"),
      everythingIncludesEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ac494a38b3"),
      everythingIncludesTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cd07800b66"),
      everythingLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b96000b7d0"),
      everythingTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e8bd233169"),
      eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ef24827354"),
      freeAccessBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8476cdcafb"),
      freeAccessLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8b7015933e"),
      freeAccessTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.32fb48ea91"),
      freePreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f0a9320f9e"),
      helpChoosingReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bb08974374"),
      includesHeading: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bdf1928ec1"),
      intro:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d8b45eeb22"),
      marketplaceBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.50c4bba132"),
      marketplaceEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8572feff58"),
      marketplacePromiseBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ae2d2ec87b"),
      marketplacePromiseTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3cd9c8ccb1"),
      marketplaceTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e5469ea1a3"),
      needKundli:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.376aab0e23"),
      note:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a7629df5d9"),
      openDrawer: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.901879c422"),
      plannedSectionBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a0ca7b2a7e"),
      plannedSectionBulletFree: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bcdea7095b"),
      plannedSectionBulletPremium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.775b453252"),
      plannedSectionEvidence: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e32e8fc1f9"),
      previewDrawerAction: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.607b3718ce"),
      previewDrawerBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.712f4a4c75"),
      previewDrawerTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5c7d6d39bb"),
      premiumAccessBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.83afb09036"),
      premiumAccessCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e9704d7ad0"),
      premiumAccessLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5d2cb4ee10"),
      premiumAccessTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5c37a35fe8"),
      premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.63dcfe5bd9"),
      previewBuilder: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb9158f8e7"),
      previewSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb9158f8e7"),
      printSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7856b8ca62"),
      selected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0593802992"),
      selectedReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0593802992"),
      seeEverythingIncluded: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b40a65a7db"),
      signInNudgeBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5b06eeb1fe"),
      signInNudgeTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c222a628b7"),
      title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.199ff21a3b"),
    };
  }

  if (language === 'gu') {
    return {
      askFromReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.033ccd9b48"),
      cancelDownload: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.206fc4704d"),
      createKundliCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c0e4dc5abd"),
      createKundliToSelect: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.709ad626be"),
      copied: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2e020f4ba5"),
      copyChat: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.90974a0b58"),
      copyReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7b28f8d8fd"),
      customBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.fd59b9fb58"),
      customLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a1b3e26d45"),
      customTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.334588f513"),
      compareDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6a63c9e264"),
      differenceColumn: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1ba0846d56"),
      differenceEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2c596d6804"),
      dialogBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6bd3079144"),
      dialogEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6f9f38dc9c"),
      dialogTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f37d5e4ec5"),
      downloadChatPdf: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1963597f21"),
      emptySelection: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9b8160e846"),
      everythingBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7559ea0fe3"),
      everythingIncludesBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d9b1bf1436"),
      everythingIncludesEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1b83739ad5"),
      everythingIncludesTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9335e10eb4"),
      everythingLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7e534a5f97"),
      everythingTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7c9a9f9eeb"),
      eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e812b67b54"),
      freeAccessBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7134bd477d"),
      freeAccessLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e29c49272b"),
      freeAccessTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.eea2963116"),
      freePreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0914c5ea7d"),
      helpChoosingReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f182727d39"),
      includesHeading: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c333199579"),
      intro:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e266a6118b"),
      marketplaceBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb3319decf"),
      marketplaceEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7c460df222"),
      marketplacePromiseBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0ae3d4f974"),
      marketplacePromiseTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.86fc0a2dc6"),
      marketplaceTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b987b3ed16"),
      needKundli:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.95caaca3f5"),
      note:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.77842a95f9"),
      openDrawer: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e0185a82d6"),
      plannedSectionBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cf7936ce7e"),
      plannedSectionBulletFree: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1a26b9126f"),
      plannedSectionBulletPremium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1bba4449bc"),
      plannedSectionEvidence: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.767dc66f8f"),
      previewDrawerAction: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.387508867d"),
      previewDrawerBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.48a17ef994"),
      previewDrawerTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bb34d4ccaf"),
      premiumAccessBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3c670b3684"),
      premiumAccessCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e9b9dc885f"),
      premiumAccessLabel: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4ddc7e41f3"),
      premiumAccessTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1513cec097"),
      premiumDepth: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4677a10417"),
      previewBuilder: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.17bafdf2ef"),
      previewSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.17bafdf2ef"),
      printSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f37d5e4ec5"),
      selected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.14cd4f3b08"),
      selectedReport: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.14cd4f3b08"),
      seeEverythingIncluded: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0f8ac3d061"),
      signInNudgeBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1c6510f38c"),
      signInNudgeTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b2cff17dd6"),
      title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.da67997a4c"),
    };
  }

  return {
    askFromReport: 'Ask Predicta from this report',
    cancelDownload: 'Cancel',
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
    dialogBody:
      'Your report is ready. Review the person, report type, and chart-backed preview before downloading.',
    dialogEyebrow: 'Report ready',
    dialogTitle: 'Download your report',
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
    marketplaceTitle: 'Choose your report world',
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
      'Preview the cover, key signals, charts, and chosen sections here. Downloading the PDF opens a clean confirmation first.',
    previewDrawerTitle: 'Report preview',
    premiumAccessBody:
      'Detailed PDF download needs a subscription, Day Pass, or one-time report access.',
    premiumAccessCta: 'Choose access',
    premiumAccessLabel: 'Premium report',
    premiumAccessTitle: 'Choose access for detailed depth',
    premiumDepth: 'Premium depth',
    previewBuilder: 'Download your report',
    previewSelected: 'Download your report',
    printSelected: 'Download your report',
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

function parseDownloadFilename(contentDisposition: string | null): string | null {
  if (!contentDisposition) {
    return null;
  }

  const match = contentDisposition.match(/filename="([^"]+)"/i);
  return match?.[1] ?? null;
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
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.41db3af9ea"),
      differentBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.962a3cca85"),
      eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ebc23a8610"),
      title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7609a0ad18"),
    };
  }

  if (language === 'gu') {
    return {
      body:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a82ab1fcf7"),
      differentBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3ca1219aac"),
      eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cdd0c5eab0"),
      title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.70b6d319ea"),
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
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b46971275d"),
      chartsBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.79a27a6508"),
      chartsEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4cc5360d0b"),
      chartsTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2dd7980f8b"),
      coverEyebrow: `PREDICTA HOLISTIC ASTROLOGY REPORT · ${languageName}`,
      freePreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.53f9037253"),
      premiumPreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.396b402e53"),
      safetyBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1c648b2c44"),
      safetyTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cebed2c362"),
      tagline: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aa326f2864"),
    };
  }

  if (language === 'gu') {
    return {
      brandLine:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.473a1240fb"),
      chartsBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d65c13fa3e"),
      chartsEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d21ffdfef4"),
      chartsTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b97b50eef5"),
      coverEyebrow: `PREDICTA HOLISTIC ASTROLOGY REPORT · ${languageName}`,
      freePreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9e2089ff17"),
      premiumPreview: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0b07ea72b3"),
      safetyBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.389e65d6f8"),
      safetyTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.573e8afda0"),
      tagline: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb6ac4f37c"),
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

function getReportResultCopy(language: SupportedLanguage): {
  compareBody: string;
  compareHeadline: string;
  chartPreviewCount: string;
  deliveryEyebrow: string;
  deliveryFreeBody: string;
  deliveryPremiumBody: string;
  deliveryTitle: string;
  fallbackFreeCta: string;
  generatedAtLabel: (label: string) => string;
  includedTitle: string;
  keySignalsEyebrow: string;
  keySignalsTitle: string;
  loadingBody: string;
  lockedEyebrow: string;
  premiumGuestBody: string;
  premiumLockedBody: string;
  premiumPurchaseHint: string;
  premiumReadyBody: string;
  premiumReadyTag: string;
  premiumSignInHint: string;
  preparingPdf: string;
  purchaseBody: string;
  purchasePrimary: string;
  purchaseSecondary: string;
  purchaseTitle: string;
  readyFreeTitle: string;
  readyPremiumTitle: string;
  sectionsSelected: string;
  signInBody: string;
  signInTitle: string;
} {
  if (language === 'hi') {
    return {
      compareBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5fcce72961"),
      compareHeadline: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6d17664a19"),
      chartPreviewCount: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.daa03d57df"),
      deliveryEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9d8ff69dce"),
      deliveryFreeBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.15559ad6a2"),
      deliveryPremiumBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.089ab65e19"),
      deliveryTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.01d3054f16"),
      fallbackFreeCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a7263c1c84"),
      generatedAtLabel: label => formatNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb9cc67f94", [label]),
      includedTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.398f822137"),
      keySignalsEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.17dd50e509"),
      keySignalsTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4473b197f5"),
      loadingBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6bc0c8cbec"),
      lockedEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a8cbf899bc"),
      premiumGuestBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.53a02eb9d2"),
      premiumLockedBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6dfefb5e6d"),
      premiumPurchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2c839b4d3f"),
      premiumReadyBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c79e735f85"),
      premiumReadyTag: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8984ea2be2"),
      premiumSignInHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ca7f2370a1"),
      preparingPdf: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3e646ef2af"),
      purchaseBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e16f0f5b9f"),
      purchasePrimary: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.783fa2dc0d"),
      purchaseSecondary: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.93ed07b789"),
      purchaseTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9bd5dc174a"),
      readyFreeTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.551d2ce6bc"),
      readyPremiumTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4080639e89"),
      sectionsSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3cdc278acc"),
      signInBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.95d718fa0b"),
      signInTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d8f844718f"),
    };
  }

  if (language === 'gu') {
    return {
      compareBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aa681e56a8"),
      compareHeadline: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a04fd544b1"),
      chartPreviewCount: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e8343ee0f5"),
      deliveryEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4b9179890f"),
      deliveryFreeBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f525b767cd"),
      deliveryPremiumBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d82dfc3b65"),
      deliveryTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e700aa30d9"),
      fallbackFreeCta: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9c80d851a8"),
      generatedAtLabel: label => formatNativeCopy("native.apps.web.components.WebDossierPreview.tsx.28a5b0434d", [label]),
      includedTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ca32a015e4"),
      keySignalsEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c420df1dbe"),
      keySignalsTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c36ed28bd2"),
      loadingBody: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dc50060bcf"),
      lockedEyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9872d9a673"),
      premiumGuestBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a07af16186"),
      premiumLockedBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9173ea442b"),
      premiumPurchaseHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e88d7dae85"),
      premiumReadyBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a609903bb8"),
      premiumReadyTag: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4d4ab33028"),
      premiumSignInHint: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8527ef4e0a"),
      preparingPdf: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.87acac17a7"),
      purchaseBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dd028c5ced"),
      purchasePrimary: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7954cde633"),
      purchaseSecondary: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dafcfb5f70"),
      purchaseTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b8bf5405ba"),
      readyFreeTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f10486ffbf"),
      readyPremiumTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ee07423409"),
      sectionsSelected: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.673ef1e1f4"),
      signInBody:
        getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8ecc77d728"),
      signInTitle: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e1361b82a6"),
    };
  }

  return {
    compareBody:
      'Free stays genuinely useful. Premium keeps the same dignity and adds deeper timing, fuller synthesis, remedies, and a richer PDF.',
    compareHeadline: 'Free is useful. Premium is deeper.',
    chartPreviewCount: 'chart previews will go into this PDF',
    deliveryEyebrow: 'Report delivery',
    deliveryFreeBody:
      'This free insight report is ready as a polished PDF with charts, key signals, and useful life guidance.',
    deliveryPremiumBody:
      'This detailed analysis report is ready as a polished PDF with full chart synthesis, timing, remedies, and deeper explanation.',
    deliveryTitle: 'Now the next step is simple.',
    fallbackFreeCta: 'Stay with free report',
    generatedAtLabel: label => `Prepared: ${label}`,
    includedTitle: 'Included in this PDF',
    keySignalsEyebrow: 'Key signals',
    keySignalsTitle: 'What this report wants you to notice first',
    loadingBody: 'Checking your report access now.',
    lockedEyebrow: 'Detailed report access',
    premiumGuestBody:
      'Sign in before opening a detailed report. After that, Predicta can show the correct purchase path cleanly.',
    premiumLockedBody:
      'Detailed analysis, timing windows, remedies, and full synthesis open here when detailed access is available.',
    premiumPurchaseHint:
      'Purchase the detailed report path and this full PDF will unlock here.',
    premiumReadyBody:
      'You already have detailed report access. This page is ready to deliver the full PDF.',
    premiumReadyTag: 'Detailed report ready',
    premiumSignInHint:
      'Sign in first, then Predicta can open the detailed report path cleanly.',
    preparingPdf: 'Preparing PDF...',
    purchaseBody:
      'You are signed in. Choose a detailed report purchase or a Day Pass to unlock the full PDF path.',
    purchasePrimary: 'Unlock detailed PDF',
    purchaseSecondary: 'Try a Day Pass first',
    purchaseTitle: 'Choose access for the detailed report',
    readyFreeTitle: 'Here is your free insight report.',
    readyPremiumTitle: 'Here is your detailed analysis report.',
    sectionsSelected: 'sections selected',
    signInBody:
      'You chose the detailed report path. Sign in first, then continue into purchase or an existing access path.',
    signInTitle: 'Sign in for the detailed report path',
  };
}

function getComprehensiveReportSections(language: SupportedLanguage): Array<{
  eyebrow: string;
  title: string;
}> {
  if (language === 'hi') {
    return [
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d7d8a5c275"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.00d40823a4") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7857059ece"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.bfeb330172") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.80d88aaddd"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.efe398cf72") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7e907cebdf"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4066862213") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1849d6330d"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9a06e72e7c") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cc84d821e7"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7e54de063a") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3bd079967d"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b87f4d8544") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.353a1e152a"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.163d50e822") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.615ced522a"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7fbf0b462e") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f5468073bd"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.19940d7830") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.74cda4f604"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.205a1cfb30") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b444cfa935"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c54ddcaaa6") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3968c1424c"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5503c70cbf") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.54a2597751"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7caf7f38ec") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4a727823f0"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.34a5daf673") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c6ed8f708a"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.707c5c9217") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a05042b6ab"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c2a7fd10e4") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cb4800046a"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4a39088a9a") },
    ];
  }

  if (language === 'gu') {
    return [
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7742cd425c"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.dd78a19b8e") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ed1b3ccb82"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4f9790b585") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a99901ec5c"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.77caefc4de") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.70d983ba08"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a7c6f0caec") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d653d63a61"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.6a51febb1e") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.b746e1f8f4"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e0f43efc33") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.caf99f4fa3"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d3504b4112") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.060885d1eb"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8e790a5cfb") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ea5bfa6948"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f3c3014077") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.9b58ef19b7"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a7c4c5f37c") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cf1099b4c5"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.5123701c4d") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d3efbfe399"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1462f11f6a") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.0de6a39828"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.27b21c02ab") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8a6353c98a"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.f13a727931") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a0cf33e8c0"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.23438b1f0e") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8648ceb3b0"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2d18b83f56") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d701b81bf4"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.42b2e89de1") },
      { eyebrow: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8c1ae6f5ea"), title: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c717de90b3") },
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
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.7857059ece"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d2322fad8b"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3a8945d56e"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.df8559aaa0"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.15383232df"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cfbfe75ba9"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a05042b6ab"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.846e2132ba"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.a1b54bfabf"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.922f2ff605"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c2d62967d3"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.341f634fe1"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3bd079967d"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.3e571f4df7"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ec50a9b6bd"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.458808bc15"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.725e3e0e72"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.625285af6c"),
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.ed1b3ccb82"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.503868e22e"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.c1ffe6d782"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.8d6802232c"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.aae7eaf172"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.760f65992b"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.d701b81bf4"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.46da1ccc5b"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.70834c0853"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.cf14f25c86"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.2635e7329c"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.1dda705991"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.caf99f4fa3"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.76f059f50e"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.19516a9158"),
      },
      {
        area: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.49ee2267e6"),
        free: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.e4a08d754d"),
        premium: getNativeCopy("native.apps.web.components.WebDossierPreview.tsx.4d34da2d11"),
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
      premium: 'Detailed trait comparison, repeated review, and signature refinement plan.',
    },
    {
      area: 'PDF polish',
      free: 'Premium-looking useful report.',
      premium: 'Distinctive complete deep report with richer sections and proof.',
    },
  ];
}

function buildReportAskHref(
  {
    availableSections,
    generatedAt,
    kundliId,
    mode,
    product,
    reportTitle,
    section,
    sectionPrompt,
    sectionTitle,
    selectedSections,
    subjectName,
  }: {
    availableSections: string[];
    generatedAt?: string;
    kundliId?: string;
    mode: 'FREE' | 'PREMIUM';
    product: ReportMarketplaceProduct;
    reportTitle: string;
    section?: PdfSection;
    sectionPrompt: string;
    sectionTitle: string;
    selectedSections: string[];
    subjectName?: string;
  },
): string {
  return buildPredictaChatHref({
    kundliId,
    prompt: sectionPrompt,
    reportAvailableSections: availableSections,
    reportFocus: product.id,
    reportGeneratedAt: generatedAt,
    reportMode: mode,
    reportSchoolLane: product.school,
    reportSectionId: section ? getReportSectionKey(section, 0) : undefined,
    reportSectionPrompt: sectionPrompt,
    reportSectionTitle: sectionTitle,
    reportSelectedSections: selectedSections,
    reportSubjectName: subjectName,
    reportType: reportTitle,
    school: mapReportLaneToPredictaSchool(product.school),
    selectedSection: sectionTitle,
    sourceScreen: 'Report',
  });
}

function mapReportLaneToPredictaSchool(
  school: ReportSchoolLaneId,
): PredictaSchool | undefined {
  if (school === 'VEDIC') {
    return 'PARASHARI';
  }

  if (school === 'SYNTHESIS') {
    return undefined;
  }

  return school;
}

function getReportLaneReadiness({
  kundli,
  lane,
  signatureAnalysis,
}: {
  kundli?: KundliData;
  lane: ReportSchoolLane;
  signatureAnalysis?: SignatureAnalysisModel;
}): {
  detail: string;
  label: string;
  ready: boolean;
} {
  if (lane.id === 'SIGNATURE') {
    if (!kundli) {
      return {
        detail:
          'Pending: create or select a Kundli/profile, then add a signature sample for Signature report generation.',
        label: 'Needs profile',
        ready: false,
      };
    }

    if (hasReadySignatureReport(signatureAnalysis)) {
      return {
        detail: 'Signature traits are available for this session.',
        label: 'Ready',
        ready: true,
      };
    }

    return {
      detail:
        'Pending: upload, draw, or confirm a signature sample before generating a Signature report.',
      label: 'Needs signature',
      ready: false,
    };
  }

  if (!kundli) {
    return {
      detail: `Pending: ${lane.readinessRequirement}`,
      label: 'Needs Kundli',
      ready: false,
    };
  }

  if (lane.id === 'KP') {
    return {
      detail:
        'Active Kundli found. For best KP accuracy, choose one clear event question before report generation.',
      label: 'Kundli ready',
      ready: true,
    };
  }

  if (lane.id === 'NADI') {
    return {
      detail:
        'Active Kundli found. Deeper Nadi timing should validate story patterns with the user first.',
      label: 'Kundli ready',
      ready: true,
    };
  }

  if (lane.id === 'NUMEROLOGY') {
    return {
      detail: kundli.birthDetails.name
        ? 'Saved name and birth date are available for Numerology.'
        : 'Pending: add a name and birth date for Numerology.',
      label: kundli.birthDetails.name ? 'Profile ready' : 'Needs profile',
      ready: Boolean(kundli.birthDetails.name),
    };
  }

  return {
    detail: 'Active Kundli found for Vedic report preparation.',
    label: 'Kundli ready',
    ready: true,
  };
}

function hasReadySignatureReport(
  signatureAnalysis: SignatureAnalysisModel | undefined,
): boolean {
  return Boolean(
    signatureAnalysis?.status === 'ready' &&
      signatureAnalysis.observedTraits.some(
        trait => trait.confirmationState === 'confirmed',
      ),
  );
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
