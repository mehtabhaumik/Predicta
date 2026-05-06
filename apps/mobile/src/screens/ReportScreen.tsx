import React, { useState } from 'react';
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
import { getPremiumPdfProduct } from '@pridicta/config/pricing';
import { composeReportSections } from '@pridicta/pdf';
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

  function askFromReport(section: string) {
    setActiveChartContext({
      selectedSection: section,
      sourceScreen: 'Report',
    });
    navigation.navigate(routes.Chat);
  }

  const previewMode: PDFMode = userPlan === 'PREMIUM' ? 'PREMIUM' : 'FREE';
  const reportPreview = composeReportSections({
    kundli,
    language: languagePreference.language,
    mode: previewMode,
  });
  const sections = kundli ? reportPreview.sections.slice(0, 6) : fallbackSections;

  async function createPdf(mode: PDFMode) {
    if (!kundli) {
      showGlassAlert({
        message:
          'A real calculated kundli is required before creating a horoscope PDF.',
        title: 'Generate kundli first',
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
      <AnimatedHeader eyebrow="PERSONAL DOSSIER" title="Daily report" />

      <View className="mt-8">
        <TrustProofPanel trust={reportPreview.trustProfile} />
      </View>

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
                Ask Pridicta from this section
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
          Premium handbook export
        </AppText>
        <AppText className="mt-3" tone="secondary">
          Free and Premium reports share the same dark branded design. Premium
          expands evidence tables, decision windows, area intelligence, and
          advanced chart verification.
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
                ? 'Generate Premium PDF'
                : 'Premium PDF Depth'
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
            Ask Pridicta about this dasha
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
