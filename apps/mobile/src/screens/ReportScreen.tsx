import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
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
import { buildGeneratedReportMemoryContext } from '@pridicta/config/predictaMemory';
import { SUPPORTED_LANGUAGE_OPTIONS } from '@pridicta/config/language';
import { composeReportSections, type PdfSection } from '@pridicta/pdf';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncRedeemedGuestPassToUser } from '../services/firebase/passCodePersistence';
import { saveReportLanguagePreference } from '../services/preferences/languagePreferenceStorage';
import { generateHoroscopePdf } from '../services/pdf/pdfGenerator';
import { useAppStore } from '../store/useAppStore';
import type { PDFMode, PredictaSchool, ReportSchoolLaneId } from '../types/astrology';

export function ReportScreen({
  navigation,
}: RootScreenProps<typeof routes.Report>): React.JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReportId, setSelectedReportId] =
    useState<ReportMarketplaceProduct['id']>('KUNDLI');
  const [builderMode, setBuilderMode] = useState<'EVERYTHING' | 'CUSTOM'>(
    'EVERYTHING',
  );
  const [showComposerDetails, setShowComposerDetails] = useState(false);
  const [showReportMarketplace, setShowReportMarketplace] = useState(false);
  const [selectedSectionKeys, setSelectedSectionKeys] = useState<string[]>([]);
  const auth = useAppStore(state => state.auth);
  const kundli = useAppStore(state => state.activeKundli);
  const languagePreference = useAppStore(state => state.languagePreference);
  const setReportLanguagePreference = useAppStore(
    state => state.setReportLanguagePreference,
  );
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
  const synthesisProducts = useMemo(
    () => marketplaceProducts.filter(product => product.school === 'SYNTHESIS'),
    [marketplaceProducts],
  );
  const schoolProducts = useMemo(
    () => marketplaceProducts.filter(product => product.school !== 'SYNTHESIS'),
    [marketplaceProducts],
  );
  const selectedReport =
    marketplaceProducts.find(product => product.id === selectedReportId) ??
    marketplaceProducts[0];
  const reportLanguage =
    languagePreference.reportLanguage ?? languagePreference.language;

  function askFromReport(section: string) {
    const availableSections = reportPreview.sections.map(item => item.title);
    const selectedSections =
      builderMode === 'EVERYTHING'
        ? availableSections
        : sectionOptions
            .filter(option => selectedKeySet.has(option.key))
            .map(option => option.section.title);
    const generatedReport = buildGeneratedReportMemoryContext({
      availableSections,
      mode: previewMode,
      reportFocus: selectedReport.id,
      reportTitle: selectedReport.title,
      schoolLane: selectedReport.school,
      selectedSections,
      subjectName: kundli?.birthDetails.name,
    });

    setActiveChartContext({
      generatedReport,
      kundliId: kundli?.id,
      predictaSchool: mapReportLaneToPredictaSchool(selectedReport.school),
      reportAvailableSections: availableSections,
      reportFocus: selectedReport.id,
      reportMode: previewMode,
      reportSchoolLane: selectedReport.school,
      reportSectionPrompt: section,
      reportSectionTitle: selectedReport.title,
      reportSelectedSections: selectedSections,
      reportSubjectName: kundli?.birthDetails.name,
      reportType: selectedReport.title,
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
        language: reportLanguage,
        mode: previewMode,
        reportFocus: selectedReportId,
      }),
    [kundli, previewMode, reportLanguage, selectedReportId],
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
  const selectedSectionCount = kundli
    ? builderMode === 'EVERYTHING'
      ? reportPreview.sections.length
      : sectionOptions.filter(option => selectedKeySet.has(option.key)).length
    : 0;
  const inlinePreviewSections = reportPreview.sections.slice(0, 6);

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

    if (selectedReportId === 'SIGNATURE') {
      showGlassAlert({
        actions: [
          {
            label: 'Open Signature',
            onPress: () => navigation.navigate(routes.SignaturePredicta),
          },
          { label: 'Choose Different Report' },
        ],
        message:
          'Signature reports require a confirmed signature sample. Mobile report download will stay blocked until a real signature input is attached to this session.',
        title: 'Signature required',
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
        language: reportLanguage,
        mode,
        reportFocus: selectedReportId,
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

  function renderInlineReportComposer(
    product: ReportMarketplaceProduct,
  ): React.JSX.Element | null {
    if (selectedReportId !== product.id) {
      return null;
    }

    const isVedicReport = product.school === 'VEDIC';

    return (
      <View className="mt-3 rounded-[24px] border border-[#4DAFFF66] bg-[#101826] p-4">
        <AppText tone="secondary" variant="caption">
          {isVedicReport ? 'VEDIC REPORT BUILDER' : 'REPORT READY'}
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          {product.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {product.bestFor}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {kundli?.birthDetails.name ?? 'Create a Kundli first'} ·{' '}
          {selectedSectionCount}/{reportPreview.sections.length || 0} sections
        </AppText>

        {isVedicReport ? (
          <>
            <View className="mt-4 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                className={`flex-1 rounded-[18px] border p-3 ${
                  builderMode === 'EVERYTHING'
                    ? 'border-[#C8A96A] bg-[#2A2330]'
                    : 'border-[#252533] bg-[#191923]'
                }`}
                onPress={() => {
                  setBuilderMode('EVERYTHING');
                  setSelectedSectionKeys(sectionOptions.map(option => option.key));
                }}
              >
                <AppText variant="body">Recommended</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  Predicta chooses the full bundle
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                className={`flex-1 rounded-[18px] border p-3 ${
                  builderMode === 'CUSTOM'
                    ? 'border-[#C8A96A] bg-[#2A2330]'
                    : 'border-[#252533] bg-[#191923]'
                }`}
                onPress={() => {
                  setBuilderMode('CUSTOM');
                  setSelectedSectionKeys(
                    sectionOptions.slice(0, 8).map(option => option.key),
                  );
                }}
              >
                <AppText variant="body">Customize</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  Pick the sections you want
                </AppText>
              </Pressable>
            </View>
            <View className="mt-4 flex-row flex-wrap gap-2">
              {inlinePreviewSections.map(section => (
                <View
                  className="rounded-full border border-[#C8A96A55] bg-[#241F27] px-3 py-2"
                  key={`${section.eyebrow}-${section.title}`}
                >
                  <AppText variant="caption">{section.title}</AppText>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="mt-4 rounded-[18px] border border-[#252533] bg-[#191923] p-4">
            <AppText tone="secondary" variant="caption">
              WHAT YOU GET
            </AppText>
            <AppText className="mt-2" tone="secondary">
              {previewMode === 'PREMIUM'
                ? product.premiumDepth
                : product.freeDepth}
            </AppText>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          className="mt-4 rounded-[18px] border border-[#4DAFFF66] bg-[#101018] p-4"
          onPress={() => setShowComposerDetails(current => !current)}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            {showComposerDetails
              ? 'Hide language and section options'
              : 'Customize language and sections'}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Recommended by Predicta is selected by default. Open this only if
            you want to adjust the PDF.
          </AppText>
        </Pressable>

        {showComposerDetails ? (
          <View className="mt-4 gap-4">
            <View className="rounded-[18px] border border-[#252533] bg-[#191923] p-4">
              <AppText tone="secondary" variant="caption">
                REPORT LANGUAGE
              </AppText>
              <View className="mt-3 gap-3">
                {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
                  <Pressable
                    accessibilityRole="button"
                    className={`rounded-[16px] border p-3 ${
                      option.code === reportLanguage
                        ? 'border-[#4DAFFF] bg-[#172233]'
                        : 'border-[#252533] bg-[#101018]'
                    }`}
                    key={option.code}
                    onPress={() => {
                      setReportLanguagePreference(option.code);
                      saveReportLanguagePreference(option.code).catch(
                        () => undefined,
                      );
                    }}
                  >
                    <AppText variant="body">{option.nativeName}</AppText>
                    <AppText tone="secondary" variant="caption">
                      {option.englishName}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            {isVedicReport && kundli ? (
              <View className="gap-3">
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
            ) : null}
          </View>
        ) : null}

        <View className="mt-5 gap-3">
          <GlowButton
            disabled={isGenerating}
            label={isGenerating ? 'Preparing your report...' : 'Download your report'}
            loading={isGenerating}
            onPress={() => createPdf('FREE')}
          />
          <GlowButton
            disabled={isGenerating}
            label={
              userPlan === 'PREMIUM'
                ? 'Download your report'
                : 'Unlock Detailed PDF'
            }
            onPress={() => createPdf('PREMIUM')}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-4"
          onPress={() => askFromReport(product.prompt)}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            Ask Predicta from this report
          </AppText>
        </Pressable>
      </View>
    );
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="REPORTS" title="Pick the report you need" />

      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Report"
        title="Report Kundli"
      />

      <GlowCard className="mt-6" delay={80}>
        <AppText tone="secondary" variant="caption">
          REPORT COMPOSER
        </AppText>
        <AppText className="mt-2" variant="subtitle">
          Your selected report is ready
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Download from here first. Change report worlds only if you want a
          different school or a Life Atlas synthesis.
        </AppText>
        <View className="mt-4">
          <ReportProductButton
            product={selectedReport}
            selected
            onPress={() => undefined}
          />
          {renderInlineReportComposer(selectedReport)}
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-4 rounded-[18px] border border-[#4DAFFF55] bg-[#101826] p-4"
          onPress={() => setShowReportMarketplace(current => !current)}
        >
          <AppText className="font-bold text-[#4DAFFF]">
            {showReportMarketplace ? 'Hide report worlds' : 'Change report world'}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Vedic, KP, Nadi, Numerology, Signature, and Life Atlas stay in
            separate lanes.
          </AppText>
        </Pressable>
      </GlowCard>

      <View className="mt-6">
        <TrustProofPanel trust={reportPreview.trustProfile} />
      </View>

      {showReportMarketplace ? (
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

        <View className="mt-5 rounded-[22px] border border-[#C8A96A55] bg-[#201B27] p-4">
          <AppText tone="secondary" variant="caption">
            SYNTHESIS REPORTS
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Predicta Life Atlas
          </AppText>
          <AppText className="mt-2" tone="secondary">
            This is the only all-school synthesis report. It turns available
            Vedic, KP, Nadi, and Numerology data into one non-technical life
            story. Signature is optional enrichment only.
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            Signature expression layer was not included because no signature
            sample was provided. Missing signature does not block generation.
          </AppText>
          <View className="mt-4 gap-3">
            {synthesisProducts.map(product => (
              <View key={product.id}>
                <ReportProductButton
                  product={product}
                  selected={selectedReportId === product.id}
                  onPress={() => setSelectedReportId(product.id)}
                />
                {renderInlineReportComposer(product)}
              </View>
            ))}
          </View>
        </View>

        <View className="mt-5 gap-3">
          <AppText tone="secondary" variant="caption">
            SCHOOL-SPECIFIC REPORTS
          </AppText>
          <AppText tone="secondary">
            Vedic, KP, Nadi, Numerology, and Signature stay in their own lanes.
            Choose these when you want one method, not a mixed bag report.
          </AppText>
          {schoolProducts.map(product => (
            <View key={product.id}>
              <Pressable
                accessibilityRole="button"
                className={`rounded-[18px] border p-4 ${
                  selectedReportId === product.id
                    ? 'border-[#4DAFFF] bg-[#172233]'
                    : 'border-[#252533] bg-[#191923]'
                }`}
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
              {renderInlineReportComposer(product)}
            </View>
          ))}
        </View>
      </GlowCard>
      ) : null}

    </Screen>
  );
}

function ReportProductButton({
  onPress,
  product,
  selected,
}: {
  onPress: () => void;
  product: ReportMarketplaceProduct;
  selected: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      className={`rounded-[18px] border p-4 ${
        selected
          ? 'border-[#C8A96A] bg-[#2A2330]'
          : 'border-[#3D3346] bg-[#191923]'
      }`}
      onPress={onPress}
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
        {selected ? (
          <AppText className="font-bold text-[#C8A96A]" variant="caption">
            Selected
          </AppText>
        ) : null}
      </View>
      <AppText className="mt-2" tone="secondary">
        {product.bestFor}
      </AppText>
    </Pressable>
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
