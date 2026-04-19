import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  GradientText,
  Screen,
  useGlassAlert,
} from '../components';
import {
  formatInr,
  getDayPassProduct,
  getOneTimeProducts,
  getPricingPlans,
} from '../config/pricing';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  manageSubscription,
  purchaseProduct,
  restorePurchases,
} from '../services/billing/billingService';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncEntitlementToFirebase } from '../services/firebase/subscriptionSync';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { PricingPlan } from '../types/subscription';

const features = [
  'More Predicta questions',
  'Deeper chart analysis',
  'Advanced dasha and varga insights',
  'Premium kundli report depth',
  'Save and revisit richer guidance',
];

export function PaywallScreen({
  navigation,
  route,
}: RootScreenProps<typeof routes.Paywall>): React.JSX.Element {
  const pricingPlans = useMemo(() => getPricingPlans(), []);
  const dayPass = useMemo(() => getDayPassProduct(), []);
  const oneTimeProducts = useMemo(() => getOneTimeProducts(), []);
  const focusedProduct = useMemo(
    () =>
      oneTimeProducts.find(
        product => product.productId === route.params?.suggestedProductId,
      ),
    [oneTimeProducts, route.params?.suggestedProductId],
  );
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>(
    pricingPlans.find(plan => plan.recommended) ?? pricingPlans[1],
  );
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const setEntitlement = useAppStore(state => state.setEntitlement);
  const addOneTimeEntitlement = useAppStore(
    state => state.addOneTimeEntitlement,
  );
  const monetization = useAppStore(state => state.monetization);
  const auth = useAppStore(state => state.auth);
  const { glassAlert, showGlassAlert } = useGlassAlert();

  useEffect(() => {
    trackAnalyticsEvent({
      eventName: 'paywall_viewed',
      metadata: {
        productId: focusedProduct?.productId ?? null,
        source: route.params?.source ?? null,
      },
      userId: auth.userId,
    });
  }, [auth.userId, focusedProduct?.productId, route.params?.source]);

  async function startPurchase(productId: string) {
    try {
      setLoadingProductId(productId);
      await trackAnalyticsEvent({
        eventName: 'purchase_started',
        metadata: { productId, source: route.params?.source ?? null },
        userId: auth.userId,
      });
      const result = await purchaseProduct(productId);

      if (result.status === 'SUCCESS' || result.status === 'RESTORED') {
        if (result.entitlement) {
          setEntitlement(result.entitlement);
        }

        if (result.oneTimeEntitlement) {
          addOneTimeEntitlement(result.oneTimeEntitlement);
        }

        if (auth.userId) {
          await syncEntitlementToFirebase(auth.userId, {
            entitlement: result.entitlement ?? monetization.entitlement,
            oneTimeEntitlements: result.oneTimeEntitlement
              ? [result.oneTimeEntitlement, ...monetization.oneTimeEntitlements]
              : monetization.oneTimeEntitlements,
          }).catch(() => undefined);
        }

        await trackAnalyticsEvent({
          eventName: 'purchase_completed',
          metadata: {
            productId,
            source: route.params?.source ?? null,
            status: result.status,
          },
          userId: auth.userId,
        });
        if (result.oneTimeEntitlement) {
          const productType = result.oneTimeEntitlement.productType;
          await trackAnalyticsEvent({
            eventName:
              productType === 'LIFE_TIMELINE_REPORT'
                ? 'life_timeline_report_unlocked'
                : productType === 'MARRIAGE_COMPATIBILITY_REPORT'
                ? 'compatibility_report_unlocked'
                : productType === 'PREMIUM_PDF'
                ? 'premium_pdf_unlocked'
                : productType === 'FIVE_QUESTIONS'
                ? 'one_time_product_selected'
                : 'product_selected',
            metadata: {
              productId,
              productType,
              source: route.params?.source ?? null,
            },
            userId: auth.userId,
          });
        }
        showGlassAlert({
          actions: [{ label: 'Continue', onPress: () => navigation.goBack() }],
          message: result.oneTimeEntitlement
            ? 'Your Predicta access has been added.'
            : 'Premium guidance is now active.',
          title: 'Premium ready',
        });
        return;
      }

      await trackAnalyticsEvent({
        eventName:
          result.status === 'CANCELED'
            ? 'purchase_canceled'
            : 'purchase_failed',
        metadata: { productId, status: result.status },
        userId: auth.userId,
      });
      showGlassAlert({
        message:
          result.errorMessage ??
          'No changes were made. You can try again anytime.',
        title: 'Purchase not completed',
      });
    } catch (error) {
      await trackAnalyticsEvent({
        eventName: 'purchase_failed',
        metadata: { productId, source: route.params?.source ?? null },
        userId: auth.userId,
      });
      showGlassAlert({
        message:
          error instanceof Error
            ? error.message
            : 'Billing is not available right now.',
        title: 'Billing unavailable',
      });
    } finally {
      setLoadingProductId(null);
    }
  }

  async function restore() {
    try {
      setLoadingProductId('restore');
      await trackAnalyticsEvent({
        eventName: 'restore_started',
        userId: auth.userId,
      });
      const restored = await restorePurchases();

      restored.forEach(item => {
        if (item.entitlement) {
          setEntitlement(item.entitlement);
        }

        if (item.oneTimeEntitlement) {
          addOneTimeEntitlement(item.oneTimeEntitlement);
        }
      });

      await trackAnalyticsEvent({
        eventName: 'restore_completed',
        metadata: { count: restored.length },
        userId: auth.userId,
      });
      showGlassAlert({
        message: restored.length
          ? 'Your Predicta purchases were restored.'
          : 'No previous purchases were found on this device.',
        title: 'Restore complete',
      });
    } catch (error) {
      await trackAnalyticsEvent({
        eventName: 'restore_failed',
        userId: auth.userId,
      });
      showGlassAlert({
        message:
          error instanceof Error ? error.message : 'Please try again later.',
        title: 'Restore failed',
      });
    } finally {
      setLoadingProductId(null);
    }
  }

  async function manage() {
    try {
      await manageSubscription();
      showGlassAlert({
        message:
          'Store subscription management will open here once billing is connected.',
        title: 'Subscription settings',
      });
    } catch (error) {
      showGlassAlert({
        message:
          error instanceof Error ? error.message : 'Please try again later.',
        title: 'Subscription settings',
      });
    }
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader
        eyebrow="PRIDICTA PREMIUM"
        title={route.params?.title ?? 'Unlock Deeper Insights'}
      />

      <GlowCard style={styles.heroPanel} delay={120}>
        <GradientText variant="title">
          Premium guidance, calmly unlocked
        </GradientText>
        <AppText style={styles.heroCopy} tone="secondary">
          Go beyond the surface with richer chart interpretation, deeper
          Predicta guidance, and premium reports.
        </AppText>
        <View style={styles.featureList}>
          {features.map(feature => (
            <View style={styles.featureRow} key={feature}>
              <View style={styles.featureDot} />
              <AppText tone="secondary">{feature}</AppText>
            </View>
          ))}
        </View>
      </GlowCard>

      {focusedProduct ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            trackAnalyticsEvent({
              eventName: 'product_selected',
              metadata: {
                productId: focusedProduct.productId,
                productType: focusedProduct.id,
                source: route.params?.source ?? null,
              },
              userId: auth.userId,
            });
            startPurchase(focusedProduct.productId);
          }}
          style={styles.focusedOfferPressable}
        >
          <GlowCard delay={180}>
            <View style={styles.dayPassRow}>
              <View style={styles.planCopy}>
                <AppText tone="secondary" variant="caption">
                  SUGGESTED OPTION
                </AppText>
                <AppText style={styles.planDescription} variant="subtitle">
                  {focusedProduct.label}
                </AppText>
                <AppText
                  style={styles.planDescription}
                  tone="secondary"
                  variant="caption"
                >
                  {focusedProduct.description}
                </AppText>
              </View>
              <AppText style={styles.dayPassPrice} variant="subtitle">
                {focusedProduct.displayPrice}
              </AppText>
            </View>
          </GlowCard>
        </Pressable>
      ) : null}

      <View style={styles.planList}>
        {pricingPlans.map((plan, index) => {
          const selected = selectedPlan.productId === plan.productId;

          return (
            <Pressable
              accessibilityRole="button"
              key={plan.productId}
              onPress={() => {
                setSelectedPlan(plan);
                trackAnalyticsEvent({
                  eventName: 'pricing_plan_selected',
                  metadata: { productId: plan.productId },
                  userId: auth.userId,
                });
              }}
            >
              <GlowCard delay={220 + index * 60}>
                <View style={styles.planRow}>
                  <View style={styles.planCopy}>
                    <View style={styles.planTitleRow}>
                      <AppText variant="subtitle">{plan.label}</AppText>
                      {plan.badge ? (
                        <AppText style={styles.badgeText} variant="caption">
                          {plan.badge}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText style={styles.planDescription} tone="secondary">
                      {plan.billingCopy}
                      {plan.monthlyEquivalent
                        ? ` • ${plan.monthlyEquivalent}`
                        : ''}
                    </AppText>
                    {plan.regularPriceInr ? (
                      <AppText
                        style={styles.regularPrice}
                        tone="secondary"
                        variant="caption"
                      >
                        Normally {formatInr(plan.regularPriceInr)}
                      </AppText>
                    ) : null}
                  </View>
                  <View
                    style={[
                      styles.radio,
                      selected ? styles.radioSelected : undefined,
                    ]}
                  />
                </View>
              </GlowCard>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.unlockButton}>
        <GlowButton
          label="Unlock Premium"
          loading={loadingProductId === selectedPlan.productId}
          onPress={() => startPurchase(selectedPlan.productId)}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => startPurchase(dayPass.productId)}
        style={styles.dayPassPressable}
      >
        <GlowCard delay={520}>
          <View style={styles.dayPassRow}>
            <View style={styles.planCopy}>
              <AppText variant="subtitle">Try Premium for 24 hours</AppText>
              <AppText style={styles.planDescription} tone="secondary" variant="caption">
                {dayPass.description}
              </AppText>
            </View>
            <AppText style={styles.dayPassPrice} variant="subtitle">
              {dayPass.displayPrice}
            </AppText>
          </View>
        </GlowCard>
      </Pressable>

      <View style={styles.footerActions}>
        <GlowButton label="Continue Free" onPress={() => navigation.goBack()} />
        <Pressable accessibilityRole="button" onPress={restore}>
          <AppText style={styles.footerLink}>
            Restore Purchases
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={manage}>
          <AppText style={styles.footerText} tone="secondary" variant="caption">
            Manage Subscription
          </AppText>
        </Pressable>
        <AppText style={styles.footerText} tone="secondary" variant="caption">
          Cancel anytime. Terms and Privacy apply.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  badgeText: {
    color: colors.success,
  },
  dayPassPressable: {
    marginTop: 20,
  },
  dayPassPrice: {
    color: colors.success,
  },
  dayPassRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  featureDot: {
    backgroundColor: colors.gradient[1],
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  featureList: {
    gap: 12,
    marginTop: 22,
  },
  featureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  focusedOfferPressable: {
    marginTop: 24,
  },
  footerActions: {
    gap: 13,
    marginTop: 24,
  },
  footerLink: {
    color: colors.success,
    fontWeight: '800',
    textAlign: 'center',
  },
  footerText: {
    textAlign: 'center',
  },
  heroCopy: {
    marginTop: 12,
  },
  heroPanel: {
    marginTop: 28,
  },
  planCopy: {
    flex: 1,
  },
  planDescription: {
    marginTop: 8,
  },
  planList: {
    gap: 16,
    marginTop: 28,
  },
  planRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  planTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  radio: {
    borderColor: colors.borderGlow,
    borderRadius: 10,
    borderWidth: 1,
    height: 20,
    width: 20,
  },
  radioSelected: {
    backgroundColor: colors.gradient[0],
  },
  regularPrice: {
    marginTop: 4,
  },
  unlockButton: {
    marginTop: 28,
  },
});
