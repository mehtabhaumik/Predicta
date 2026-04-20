import type { GuestPassUsageSummary } from '@pridicta/types';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildAdminMonetizationSummary } from '@pridicta/monetization';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  SkeletonStack,
} from '../components';
import { listActiveGuestPassCodes } from '../services/firebase/passCodePersistence';
import { useAppStore } from '../store/useAppStore';

export function AdminAccessScreen(): React.JSX.Element {
  const monetization = useAppStore(state => state.monetization);
  const generatedReports = useAppStore(state => state.generatedReports);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const usage = useAppStore(state => state.usage);
  const userPlan = useAppStore(state => state.userPlan);
  const [guestPasses, setGuestPasses] = useState<GuestPassUsageSummary[]>([]);
  const [loadingPasses, setLoadingPasses] = useState(false);
  const [backendMessage, setBackendMessage] = useState('');
  const summary = buildAdminMonetizationSummary({
    generatedReports,
    monetization,
    resolvedAccess: getResolvedAccess(),
    usage,
    userPlan,
  });

  async function refreshBackendPasses() {
    try {
      setLoadingPasses(true);
      setBackendMessage('');
      setGuestPasses(await listActiveGuestPassCodes());
    } catch (error) {
      setBackendMessage(
        error instanceof Error
          ? error.message
          : 'Admin controls could not be reached right now.',
      );
    } finally {
      setLoadingPasses(false);
    }
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="OWNER TOOLS" title="Admin access" />

      <View style={styles.stack}>
        <GlowCard delay={80}>
          <AppText variant="subtitle">Monetization control</AppText>
          <AppText style={styles.cardCopy} tone="secondary">
            {summary.accessStatus} · {summary.costPosture.replace('_', ' ')}
          </AppText>
          <View style={styles.metricGrid}>
            <AdminMetric label="Reports" value={String(summary.conversionSignals.generatedReports)} />
            <AdminMetric label="Questions" value={`${summary.usage.questionsToday}/${summary.usage.questionsLimit}`} />
            <AdminMetric label="PDFs" value={`${summary.usage.pdfsThisMonth}/${summary.usage.pdfsLimit}`} />
          </View>
        </GlowCard>
        <GlowCard delay={100}>
          <AppText variant="subtitle">Guest pass foundation</AppText>
          <AppText style={styles.cardCopy} tone="secondary">
            Create, review, and revoke guest passes from one protected owner
            space. New codes appear once so they can be shared with the right
            person.
          </AppText>
          <View style={styles.actionBlock}>
            <GlowButton
              label={loadingPasses ? 'Loading...' : 'Load Guest Passes'}
              loading={loadingPasses}
              onPress={refreshBackendPasses}
            />
          </View>
          {backendMessage ? (
            <AppText style={styles.cardCopy} tone="secondary">
              {backendMessage}
            </AppText>
          ) : null}
          {loadingPasses ? (
            <SkeletonStack rows={2} style={styles.passSkeleton} />
          ) : null}
          {guestPasses.length ? (
            <View style={styles.passList}>
              {guestPasses.slice(0, 4).map(pass => (
                <View style={styles.passRow} key={pass.codeId}>
                  <View style={styles.passCopy}>
                    <AppText variant="subtitle">{pass.label}</AppText>
                    <AppText tone="secondary" variant="caption">
                      {pass.type.replace('_', ' ')} · {pass.redemptionCount}/
                      {pass.maxRedemptions} redeemed
                    </AppText>
                  </View>
                  <AppText tone="secondary" variant="caption">
                    {pass.accessLevel.replace('_', ' ')}
                  </AppText>
                </View>
              ))}
            </View>
          ) : null}
        </GlowCard>
        <GlowCard delay={180}>
          <AppText variant="subtitle">Cost protection</AppText>
          <AppText style={styles.cardCopy} tone="secondary">
            Admin accounts have unrestricted app access, with safeguards kept
            available for unusual activity.
          </AppText>
        </GlowCard>
      </View>
    </Screen>
  );
}

function AdminMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.metricBox}>
      <AppText variant="subtitle">{value}</AppText>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  actionBlock: {
    marginTop: 18,
  },
  cardCopy: {
    marginTop: 8,
  },
  metricBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  passCopy: {
    flex: 1,
    gap: 3,
  },
  passList: {
    gap: 10,
    marginTop: 18,
  },
  passRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 14,
  },
  passSkeleton: {
    marginTop: 18,
  },
  stack: {
    gap: 16,
    marginTop: 32,
  },
});
