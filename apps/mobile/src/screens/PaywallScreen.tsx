import React, { useMemo, useState } from 'react';
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
  PREMIUM_FEATURE_STORY,
  formatInr,
  getDayPassProduct,
  getPricingPlans,
} from '@pridicta/config/pricing';
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

const features = PREMIUM_FEATURE_STORY.map(feature => feature.title);

export function PaywallScreen({
  navigation,
}: RootScreenProps<typeof routes.Paywall>): React.JSX.Element {
  const pricingPlans = useMemo(() => getPricingPlans(), []);
  const dayPass = useMemo(() => getDayPassProduct(), []);
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

  async function startPurchase(productId: string) {
    try {
      setLoadingProductId(productId);
      await trackAnalyticsEvent({
        eventName: 'purchase_started',
        metadata: { productId },
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
          metadata: { productId, status: result.status },
          userId: auth.userId,
        });
        showGlassAlert({
          actions: [{ label: 'Continue', onPress: () => navigation.goBack() }],
          message: result.oneTimeEntitlement
            ? 'Your Pridicta access has been added.'
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
        metadata: { productId },
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
          ? 'Your Pridicta purchases were restored.'
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
        title="Unlock Deeper Insights"
      />

      <GlowCard className="mt-7" delay={120}>
        <GradientText variant="title">
          Premium guidance, calmly unlocked
        </GradientText>
        <AppText className="mt-3" tone="secondary">
          Go beyond the surface with richer chart interpretation, deeper
          Pridicta guidance, and premium reports.
        </AppText>
        <View className="mt-5 gap-3">
          {features.map(feature => (
            <View className="flex-row items-center gap-3" key={feature}>
              <View style={styles.featureDot} />
              <AppText tone="secondary">{feature}</AppText>
            </View>
          ))}
        </View>
      </GlowCard>

      <View className="mt-7 gap-4">
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
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <AppText variant="subtitle">{plan.label}</AppText>
                      {plan.badge ? (
                        <AppText className="text-[#4DAFFF]" variant="caption">
                          {plan.badge}
                        </AppText>
                      ) : null}
                    </View>
                    <AppText className="mt-2" tone="secondary">
                      {plan.billingCopy}
                      {plan.monthlyEquivalent
                        ? ` • ${plan.monthlyEquivalent}`
                        : ''}
                    </AppText>
                    {plan.regularPriceInr ? (
                      <AppText
                        className="mt-1"
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

      <View className="mt-7">
        <GlowButton
          label="Unlock Premium"
          loading={loadingProductId === selectedPlan.productId}
          onPress={() => startPurchase(selectedPlan.productId)}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        className="mt-5"
        onPress={() => startPurchase(dayPass.productId)}
      >
        <GlowCard delay={520}>
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <AppText variant="subtitle">Try Premium for 24 hours</AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {dayPass.description}
              </AppText>
            </View>
            <AppText className="text-[#4DAFFF]" variant="subtitle">
              {dayPass.displayPrice}
            </AppText>
          </View>
        </GlowCard>
      </Pressable>

      <View className="mt-6 gap-3">
        <GlowButton label="Continue Free" onPress={() => navigation.goBack()} />
        <Pressable accessibilityRole="button" onPress={restore}>
          <AppText className="text-center text-[#4DAFFF]">
            Restore Purchases
          </AppText>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={manage}>
          <AppText className="text-center" tone="secondary" variant="caption">
            Manage Subscription
          </AppText>
        </Pressable>
        <AppText className="text-center" tone="secondary" variant="caption">
          Cancel anytime. Terms and Privacy apply.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  featureDot: {
    backgroundColor: colors.gradient[1],
    borderRadius: 4,
    height: 8,
    width: 8,
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
});
