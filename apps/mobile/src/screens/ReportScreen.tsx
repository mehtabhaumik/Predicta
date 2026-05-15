import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  GradientOutlineCard,
  Screen,
  TrustProofPanel,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  getPremiumPdfProduct,
  getReportPurchaseGuide,
  getReportMarketplaceProducts,
  type ReportMarketplaceProduct,
} from '@pridicta/config/pricing';
import { composeReportSections, type PdfSection } from '@pridicta/pdf';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncRedeemedGuestPassToUser } from '../services/firebase/passCodePersistence';
import { generateHoroscopePdf } from '../services/pdf/pdfGenerator';
import { useAppStore } from '../store/useAppStore';
import type { PDFMode } from '../types/astrology';

const fallbackSections = [
  {
    copy: 'Generate a kundli to unlock chart-derived timeline, transit, rectification, and remedy cards.',
    context: 'Report overview',
    title: 'Report insights',
  },
];

export function ReportScreen({
  navigation,
}: RootScreenProps<typeof routes.Report>): React.JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const [builderMode, setBuilderMode] = useState<'EVERYTHING' | 'CUSTOM'>(
    'EVERYTHING',
  );
  const [selectedSectionKeys, setSelectedSectionKeys] = useState<string[]>([]);
  const auth = useAppStore(state => state.auth);
  const kundli = useAppStore(state => state.activeKundli);
  const languagePreference = useAppStore(state => state.languagePreference);
  const userPlan = useAppStore(state => state.userPlan);
  const canGeneratePdf = useAppStore(state => state.canGeneratePdf);
  const consumeGuestPdfQuota = useAppStore(state => state.consumeGuestPdfQuota);
  const consumePremiumPdfCredit = useAppStore(
    state => state.consumePremiumPdfCredit,
  );
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const hasPremiumPdfCredit = useAppStore(state => state.hasPremiumPdfCredit);
  const recordPdfGeneration = useAppStore(state => state.recordPdfGeneration);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const marketplaceProducts = useMemo(() => getReportMarketplaceProducts(), []);
  const purchaseGuide = useMemo(() => getReportPurchaseGuide(), []);
  const selectedReport =
    marketplaceProducts.find(product => product.id === selectedReportId) ??
    marketplaceProducts[0];

  function askFromReport(section: string) {
    setActiveChartContext({
      selectedSection: section,
      sourceScreen: 'Report',
    });
    navigation.navigate(routes.Chat);
  }

  const previewMode: PDFMode = userPlan === 'PREMIUM' ? 'PREMIUM' : 'FREE';
  const reportPreview = useMemo(
    () =>
      composeReportSections({
        kundli,
        language: languagePreference.language,
        mode: previewMode,
      }),
    [kundli, languagePreference.language, previewMode],
  );
  const sectionOptions = useMemo(
    () =>
      kundli
        ? reportPreview.sections.map((section, index) => ({
            key: getReportSectionKey(section, index),
            section,
          }))
        : [],
    [kundli, reportPreview.sections],
  );
  const selectedKeySet = useMemo(
    () => new Set(selectedSectionKeys),
    [selectedSectionKeys],
  );
  const sections = kundli
    ? builderMode === 'EVERYTHING'
      ? reportPreview.sections
      : sectionOptions
          .filter(option => selectedKeySet.has(option.key))
          .map(option => option.section)
    : fallbackSections;
  const selectedSectionCount = kundli
    ? builderMode === 'EVERYTHING'
      ? reportPreview.sections.length
      : sections.length
    : 0;

  useEffect(() => {
    if (!kundli) {
      return;
    }

    setSelectedSectionKeys(sectionOptions.map(option => option.key));
  }, [kundli?.id, previewMode, selectedReportId, sectionOptions]);

  async function createPdf(mode: PDFMode) {
    if (!kundli) {
      showGlassAlert({
        message:
          'A real calculated kundli is required before creating a horoscope PDF.',
        title: 'Generate kundli first',
      });
      return;
    }
    if (builderMode === 'CUSTOM' && !selectedSectionKeys.length) {
      showGlassAlert({
        message: 'Choose at least one section before creating the PDF.',
        title: 'No section selected',
      });
      return;
    }

    const access = getResolvedAccess();
    const premiumAccess = access.hasPremiumAccess;
    const premiumPdfProduct = getPremiumPdfProduct();

    const premiumPdfCreditAvailable = hasPremiumPdfCredit(kundli.id);

    if (mode === 'PREMIUM' && !premiumAccess && !premiumPdfCreditAvailable) {
      showGlassAlert({
        actions: [
          { label: 'Keep Free Report' },
          {
            label: `${premiumPdfProduct.label} - ${premiumPdfProduct.displayPrice}`,
            onPress: () => navigation.navigate(routes.Paywall),
          },
        ],
        message:
          'Unlock one premium-depth PDF for this kundli, or try Premium for 24 hours.',
        title: 'Premium PDF',
      });
      return;
    }

    if (
      !canGeneratePdf() &&
      !(mode === 'PREMIUM' && premiumPdfCreditAvailable)
    ) {
      showGlassAlert({
        actions: [
          { label: 'Try Later' },
          {
            label: 'View Options',
            onPress: () => navigation.navigate(routes.Paywall),
          },
        ],
        message:
          'Your free report limit has reset protection. You can unlock one Premium PDF or try Premium for 24 hours.',
        title: 'Monthly PDF limit reached',
      });
      return;
    }

    try {
      setIsGenerating(true);
      const result = await generateHoroscopePdf({
        kundli,
        language: languagePreference.language,
        mode,
        sectionKeys:
          builderMode === 'CUSTOM' ? selectedSectionKeys : undefined,
      });
      if (access.source === 'guest_pass' && !access.hasUnrestrictedAppAccess) {
        consumeGuestPdfQuota();
        syncGuestPassUsage(auth.userId);
      } else if (!access.hasUnrestrictedAppAccess) {
        recordPdfGeneration();
      }

      if (
        mode === 'PREMIUM' &&
        !premiumAccess &&
        access.source !== 'guest_pass'
      ) {
        consumePremiumPdfCredit(kundli.id);
      }
      showGlassAlert({
        actions:
          mode === 'FREE' && !premiumAccess
            ? [
                { label: 'Keep Free Report' },
                {
                  label: 'Unlock Full Report',
                  onPress: () => {
                    trackAnalyticsEvent({
                      eventName: 'pdf_upgrade_prompt_viewed',
                      userId: auth.userId,
                    });
                    navigation.navigate(routes.Paywall);
                  },
                },
              ]
            : undefined,
        message: `Saved to ${result.filePath}`,
        title: 'PDF generated',
      });
    } catch (error) {
      showGlassAlert({
        message: error instanceof Error ? error.message : 'Please try again.',
        title: 'PDF generation failed',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="REPORTS" title="Pick the report you need" />

      <View className="mt-8">
        <TrustProofPanel trust={reportPreview.trustProfile} />
      </View>

      <GlowCard className="mt-8" delay={100}>
        <AppText tone="secondary" variant="caption">
          REPORT MARKETPLACE
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Choose by outcome, not by jargon.
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Start with the life question. Free previews stay useful. Premium adds
          depth only when timing, synthesis, or a polished PDF is worth it.
        </AppText>

        <View className="mt-5 gap-3">
          {purchaseGuide.map(item => (
            <View
              className="rounded-[18px] border border-[#252533] bg-[#191923] p-4"
              key={item.label}
            >
              <AppText tone="secondary" variant="caption">
                {item.label.toUpperCase()}
              </AppText>
              <AppText className="mt-1" variant="body">
                {item.title}
              </AppText>
              <AppText className="mt-2" tone="secondary">
                {item.body}
              </AppText>
              <AppText className="mt-3 font-bold text-[#4DAFFF]" variant="caption">
                {item.cta}
              </AppText>
            </View>
          ))}
        </View>

        <View className="mt-5 gap-3">
          {marketplaceProducts.map(product => (
            <Pressable
              accessibilityRole="button"
              className={`rounded-[18px] border p-4 ${
                selectedReportId === product.id
                  ? 'border-[#4DAFFF] bg-[#172233]'
                  : 'border-[#252533] bg-[#191923]'
              }`}
              key={product.id}
              onPress={() => setSelectedReportId(product.id)}
            >
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <AppText tone="secondary" variant="caption">
                    {product.badge.toUpperCase()}
                  </AppText>
                  <AppText className="mt-1" variant="body">
                    {product.title}
                  </AppText>
                  <AppText className="mt-2" variant="caption">
                    {product.outcome}
                  </AppText>
                </View>
                {selectedReportId === product.id ? (
                  <AppText className="font-bold text-[#4DAFFF]" variant="caption">
                    Selected
                  </AppText>
                ) : null}
              </View>
              <AppText className="mt-2" tone="secondary">
                {product.bestFor}
              </AppText>
            </Pressable>
          ))}
        </View>
      </GlowCard>

      <GradientOutlineCard className="mt-6" delay={160}>
        <AppText tone="secondary" variant="caption">
          SELECTED REPORT
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {selectedReport.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {selectedReport.purchaseHint}
        </AppText>
        <View className="mt-4 gap-3">
          <View className="rounded-[18px] border border-[#252533] bg-[#191923] p-4">
            <AppText tone="secondary" variant="caption">
              FREE PREVIEW
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {selectedReport.freeDepth}
            </AppText>
            <View className="mt-3 gap-2">
              {selectedReport.freeIncludes.map(item => (
                <AppText key={item} tone="secondary" variant="caption">
                  • {item}
                </AppText>
              ))}
            </View>
          </View>
          <View className="rounded-[18px] border border-[#252533] bg-[#191923] p-4">
            <AppText tone="secondary" variant="caption">
              PREMIUM DEPTH
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {selectedReport.premiumDepth}
            </AppText>
            <View className="mt-3 gap-2">
              {selectedReport.premiumIncludes.map(item => (
                <AppText key={item} tone="secondary" variant="caption">
                  • {item}
                </AppText>
              ))}
            </View>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-5"
          onPress={() => askFromReport(selectedReport.prompt)}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            Ask Predicta from this report
          </AppText>
        </Pressable>
      </GradientOutlineCard>

      <GlowCard className="mt-6" delay={220}>
        <AppText tone="secondary" variant="caption">
          REPORT BUILDER
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Choose everything or pick sections
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Free and Premium can include every section. Premium changes the depth,
          timing, remedies, and synthesis.
        </AppText>
        <View className="mt-4 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            className={`flex-1 rounded-[18px] border p-4 ${
              builderMode === 'EVERYTHING'
                ? 'border-[#4DAFFF] bg-[#172233]'
                : 'border-[#252533] bg-[#191923]'
            }`}
            onPress={() => {
              setBuilderMode('EVERYTHING');
              setSelectedSectionKeys(sectionOptions.map(option => option.key));
            }}
          >
            <AppText variant="body">Complete report</AppText>
            <AppText className="mt-1" tone="secondary" variant="caption">
              Include all sections
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className={`flex-1 rounded-[18px] border p-4 ${
              builderMode === 'CUSTOM'
                ? 'border-[#4DAFFF] bg-[#172233]'
                : 'border-[#252533] bg-[#191923]'
            }`}
            onPress={() => {
              setBuilderMode('CUSTOM');
              setSelectedSectionKeys(
                sectionOptions.slice(0, 8).map(option => option.key),
              );
            }}
          >
            <AppText variant="body">Pick sections</AppText>
            <AppText className="mt-1" tone="secondary" variant="caption">
              {selectedSectionCount}/{reportPreview.sections.length || 0} selected
            </AppText>
          </Pressable>
        </View>

        {kundli ? (
          <View className="mt-4 gap-3">
            {sectionOptions.map(({ key, section }) => (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{
                  checked:
                    builderMode === 'EVERYTHING' || selectedKeySet.has(key),
                  disabled: builderMode === 'EVERYTHING',
                }}
                className={`rounded-[18px] border p-4 ${
                  builderMode === 'EVERYTHING' || selectedKeySet.has(key)
                    ? 'border-[#4DAFFF] bg-[#172233]'
                    : 'border-[#252533] bg-[#191923]'
                }`}
                disabled={builderMode === 'EVERYTHING'}
                key={key}
                onPress={() => {
                  setBuilderMode('CUSTOM');
                  setSelectedSectionKeys(current =>
                    current.includes(key)
                      ? current.filter(item => item !== key)
                      : [...current, key],
                  );
                }}
              >
                <AppText tone="secondary" variant="caption">
                  {section.eyebrow}
                </AppText>
                <AppText className="mt-1" variant="body">
                  {section.title}
                </AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {(section.tier ?? 'free').toUpperCase()} ·{' '}
                  {section.confidence ?? 'medium'} confidence
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <AppText className="mt-4" tone="secondary">
            Create a kundli first, then the report sections will appear here.
          </AppText>
        )}
      </GlowCard>

      <View className="mt-8 gap-4">
        {sections.map((section, index) => (
          <Pressable
            accessibilityRole="button"
            key={section.title}
            onPress={() =>
              askFromReport(
                'context' in section
                  ? section.context
                  : `${section.title}: ${section.body}`,
              )
            }
          >
            <GlowCard delay={120 + index * 80}>
              <AppText variant="subtitle">{section.title}</AppText>
              <AppText className="mt-2" tone="secondary">
                {'copy' in section ? section.copy : section.body}
              </AppText>
              {'confidence' in section ? (
                <AppText className="mt-3" tone="secondary" variant="caption">
                  {section.tier?.toUpperCase()} · {section.confidence} confidence ·{' '}
                  {section.evidenceTable?.length ?? 0} evidence rows
                </AppText>
              ) : null}
              <AppText className="mt-4" tone="secondary" variant="caption">
                Ask Predicta from this section
              </AppText>
            </GlowCard>
          </Pressable>
        ))}
      </View>

      <GradientOutlineCard className="mt-8" delay={420}>
        <AppText tone="secondary" variant="caption">
          HOROSCOPE PDF
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Premium PDF bundle
        </AppText>
        <AppText className="mt-3" tone="secondary">
          Free gives a useful preview. Premium turns the full report into
          deeper timing, chart proof, remedies, and a polished PDF.
        </AppText>
        <View className="mt-5 gap-4">
          <GlowButton
            disabled={isGenerating}
            label={isGenerating ? 'Generating...' : 'Generate Free PDF'}
            loading={isGenerating}
            onPress={() => createPdf('FREE')}
          />
          <GlowButton
            disabled={isGenerating}
            label={
              userPlan === 'PREMIUM'
                ? 'Create Detailed PDF'
                : 'See Detailed PDF Option'
            }
            onPress={() => createPdf('PREMIUM')}
          />
        </View>
      </GradientOutlineCard>

      <GlowCard className="mt-6" delay={520}>
        <AppText tone="secondary" variant="caption">
          CURRENT DASHA
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {kundli
            ? `${kundli.dasha.current.mahadasha} / ${kundli.dasha.current.antardasha}`
            : 'No kundli generated'}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {kundli
            ? `${kundli.dasha.current.startDate} to ${kundli.dasha.current.endDate}`
            : 'Generate a real kundli before opening dasha insights.'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          className="mt-4"
          onPress={() => askFromReport('Current Dasha')}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            Ask Predicta about this dasha
          </AppText>
        </Pressable>
      </GlowCard>
    </Screen>
  );
}

function syncGuestPassUsage(userId?: string): void {
  const pass = useAppStore.getState().redeemedGuestPass;

  if (!userId || !pass) {
    return;
  }

  syncRedeemedGuestPassToUser(userId, pass).catch(() => undefined);
}

function getReportSectionKey(section: PdfSection, index: number): string {
  return `${index}-${section.eyebrow}-${section.title}`;
}
