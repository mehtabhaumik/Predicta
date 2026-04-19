import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  createReportLibraryItem,
  decideReportEntitlement,
  getReportProducts,
} from '@pridicta/pdf';
import { getProductUpgradePrompt } from '@pridicta/monetization';
import type { OneTimeProductType, ReportProductType } from '@pridicta/types';

import {
  AnimatedHeader,
  AppText,
  GlowCard,
  GradientOutlineCard,
  Screen,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { getOneTimeProduct, getPremiumPdfProduct } from '../config/pricing';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncRedeemedGuestPassToUser } from '../services/firebase/passCodePersistence';
import { generateHoroscopePdf } from '../services/pdf/pdfGenerator';
import { useAppStore } from '../store/useAppStore';

const sections = [
  {
    copy: 'Prioritize decisions that reduce ambiguity before committing new energy.',
    context: 'Career report',
    title: 'Career',
  },
  {
    copy: 'A direct conversation lands better than waiting for perfect timing.',
    context: 'Relationship report',
    title: 'Relationships',
  },
  {
    copy: 'Keep recovery visible in the calendar so intensity does not become drift.',
    context: 'Wellbeing report',
    title: 'Wellbeing',
  },
];

const reportProducts = getReportProducts().filter(report => report.available);

export function ReportScreen({
  navigation,
}: RootScreenProps<typeof routes.Report>): React.JSX.Element {
  const [isGenerating, setIsGenerating] = useState(false);
  const auth = useAppStore(state => state.auth);
  const kundli = useAppStore(state => state.activeKundli);
  const canGeneratePdf = useAppStore(state => state.canGeneratePdf);
  const consumeGuestPdfQuota = useAppStore(state => state.consumeGuestPdfQuota);
  const consumePremiumPdfCredit = useAppStore(
    state => state.consumePremiumPdfCredit,
  );
  const consumeOneTimeReportCredit = useAppStore(
    state => state.consumeOneTimeReportCredit,
  );
  const addGeneratedReport = useAppStore(state => state.addGeneratedReport);
  const generatedReports = useAppStore(state => state.generatedReports);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const hasPremiumPdfCredit = useAppStore(state => state.hasPremiumPdfCredit);
  const preferredLanguage = useAppStore(state => state.preferredLanguage);
  const recordPdfGeneration = useAppStore(state => state.recordPdfGeneration);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const activeAccess = getResolvedAccess();

  function askFromReport(section: string) {
    setActiveChartContext({
      selectedSection: section,
      sourceScreen: 'Report',
    });
    navigation.navigate(routes.Chat);
  }

  function navigateToReportProduct(productType?: OneTimeProductType) {
    if (!productType) {
      navigation.navigate(routes.Paywall, { source: 'report_studio' });
      return;
    }

    const prompt = getProductUpgradePrompt(productType);
    trackAnalyticsEvent({
      eventName: 'product_selected',
      metadata: {
        productId: prompt.productId ?? null,
        productType,
        source: 'report_studio',
      },
      userId: auth.userId,
    });
    navigation.navigate(routes.Paywall, {
      source: 'report_studio',
      suggestedProductId: prompt.productId,
      title: prompt.title,
    });
  }

  async function createPdf(reportType: ReportProductType) {
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
    const decision = decideReportEntitlement({
      hasPremiumAccess: premiumAccess,
      kundli,
      oneTimeEntitlements: useAppStore.getState().monetization.oneTimeEntitlements,
      reportType,
    });
    const product = getReportProducts().find(report => report.id === reportType);
    const reportPrice = decision.productType
      ? getOneTimeProduct(decision.productType)
      : getPremiumPdfProduct();

    const premiumPdfCreditAvailable = hasPremiumPdfCredit(kundli.id);

    if (!decision.canGenerate) {
      showGlassAlert({
        actions: [
          { label: 'Keep Free Report' },
          {
            label: decision.productType
              ? `${reportPrice.label} - ${reportPrice.displayPrice}`
              : 'View Premium',
            onPress: () => navigateToReportProduct(decision.productType),
          },
        ],
        message: decision.message,
        title: product?.title ?? 'Report Studio',
      });
      return;
    }

    if (
      !canGeneratePdf() &&
      decision.reason !== 'ONE_TIME_CREDIT' &&
      !(decision.mode === 'PREMIUM' && premiumPdfCreditAvailable)
    ) {
      showGlassAlert({
        actions: [
          { label: 'Try Later' },
          {
            label: 'View Options',
            onPress: () => navigateToReportProduct('PREMIUM_PDF'),
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
        language: preferredLanguage,
        mode: decision.mode,
        reportType,
      });
      addGeneratedReport(
        createReportLibraryItem({
          filePath: result.filePath,
          generatedAt: result.generatedAt,
          kundli,
          language: preferredLanguage,
          mode: decision.mode,
          reportType,
        }),
      );
      trackAnalyticsEvent({
        eventName: 'report_generated',
        metadata: {
          mode: decision.mode,
          reportType,
        },
        userId: auth.userId,
      });
      if (access.source === 'guest_pass' && !access.hasUnrestrictedAppAccess) {
        consumeGuestPdfQuota();
        syncGuestPassUsage(auth.userId);
      } else if (!access.hasUnrestrictedAppAccess) {
        recordPdfGeneration();
      }

      if (
        decision.mode === 'PREMIUM' &&
        !premiumAccess &&
        access.source !== 'guest_pass' &&
        decision.productType
      ) {
        const consumed = consumeOneTimeReportCredit(
          decision.productType,
          kundli.id,
        );

        if (!consumed && decision.productType === 'PREMIUM_PDF') {
          consumePremiumPdfCredit(kundli.id);
        }
      }
      showGlassAlert({
        actions:
          decision.mode === 'FREE' && !premiumAccess
            ? [
                { label: 'Keep Free Report' },
                {
                  label: 'Unlock Full Report',
                  onPress: () => {
                    trackAnalyticsEvent({
                      eventName: 'pdf_upgrade_prompt_viewed',
                      metadata: {
                        productId: getProductUpgradePrompt('PREMIUM_PDF').productId ?? null,
                        source: 'free_pdf_complete',
                      },
                      userId: auth.userId,
                    });
                    navigateToReportProduct('PREMIUM_PDF');
                  },
                },
              ]
            : undefined,
        message: `Saved to ${result.filePath}`,
        title: `${product?.title ?? 'Report'} generated`,
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

      <View style={styles.sectionList}>
        {sections.map((section, index) => (
          <Pressable
            accessibilityRole="button"
            key={section.title}
            onPress={() => askFromReport(section.context)}
          >
            <GlowCard delay={120 + index * 80}>
              <AppText variant="subtitle">{section.title}</AppText>
              <AppText style={styles.cardCopy} tone="secondary">
                {section.copy}
              </AppText>
              <AppText style={styles.sectionLink} tone="secondary" variant="caption">
                Ask Predicta from this section
              </AppText>
            </GlowCard>
          </Pressable>
        ))}
      </View>

      <GradientOutlineCard style={styles.reportCard} delay={420}>
        <AppText tone="secondary" variant="caption">
          REPORT STUDIO
        </AppText>
        <AppText style={styles.cardCopy} variant="subtitle">
          Choose the report depth that fits this kundli
        </AppText>
        <AppText style={styles.reportCopy} tone="secondary">
          Free and Premium reports share the same dark branded design. Premium
          expands chart depth and interpretation detail.
        </AppText>
        <View style={styles.reportProductList}>
          {reportProducts.map((report, index) => {
            const locked = report.premiumRequired && !activeAccess.hasPremiumAccess;
            return (
              <Pressable
                accessibilityRole="button"
                disabled={isGenerating}
                key={report.id}
                onPress={() => createPdf(report.id)}
                style={styles.reportProduct}
              >
                <View style={styles.reportProductHeader}>
                  <AppText variant="subtitle">{report.title}</AppText>
                  <AppText tone="secondary" variant="caption">
                    {report.estimatedMinutes} min
                  </AppText>
                </View>
                <AppText style={styles.reportCopy} tone="secondary">
                  {report.subtitle}
                </AppText>
                <AppText style={styles.sectionLink} tone="secondary" variant="caption">
                  {isGenerating && index === 0
                    ? 'Generating...'
                    : locked && report.productType
                    ? `${getOneTimeProduct(report.productType).displayPrice} or Premium`
                    : 'Generate report'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </GradientOutlineCard>

      {generatedReports.length > 0 ? (
        <GlowCard style={styles.panelSpacing} delay={480}>
          <AppText tone="secondary" variant="caption">
            REPORT LIBRARY
          </AppText>
          {generatedReports.slice(0, 4).map(report => (
            <View key={report.id} style={styles.libraryRow}>
              <AppText>{report.title}</AppText>
              <AppText tone="secondary" variant="caption">
                {report.generatedAt.slice(0, 10)} • {report.mode}
              </AppText>
            </View>
          ))}
        </GlowCard>
      ) : null}

      <GlowCard style={styles.panelSpacing} delay={520}>
        <AppText tone="secondary" variant="caption">
          CURRENT DASHA
        </AppText>
        <AppText style={styles.cardCopy} variant="subtitle">
          {kundli
            ? `${kundli.dasha.current.mahadasha} / ${kundli.dasha.current.antardasha}`
            : 'No kundli generated'}
        </AppText>
        <AppText style={styles.cardCopy} tone="secondary">
          {kundli
            ? `${kundli.dasha.current.startDate} to ${kundli.dasha.current.endDate}`
            : 'Generate a real kundli before opening dasha insights.'}
        </AppText>
        <Pressable
          accessibilityRole="button"
          onPress={() => askFromReport('Current Dasha')}
          style={styles.inlineLink}
        >
          <AppText style={styles.inlineLinkText}>
            Ask Predicta about this dasha
          </AppText>
        </Pressable>
      </GlowCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardCopy: {
    marginTop: 8,
  },
  inlineLink: {
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  inlineLinkText: {
    color: '#4DAFFF',
    fontWeight: '800',
  },
  panelSpacing: {
    marginTop: 24,
  },
  reportCard: {
    marginTop: 32,
  },
  reportCopy: {
    marginTop: 12,
  },
  reportProduct: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  reportProductHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  reportProductList: {
    gap: 14,
    marginTop: 22,
  },
  libraryRow: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    gap: 6,
    marginTop: 16,
    paddingTop: 16,
  },
  sectionLink: {
    marginTop: 16,
  },
  sectionList: {
    gap: 16,
    marginTop: 32,
  },
});

function syncGuestPassUsage(userId?: string): void {
  const pass = useAppStore.getState().redeemedGuestPass;

  if (!userId || !pass) {
    return;
  }

  syncRedeemedGuestPassToUser(userId, pass).catch(() => undefined);
}
