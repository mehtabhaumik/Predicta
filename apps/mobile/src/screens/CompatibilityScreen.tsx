import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  buildCompatibilityCacheKey,
  buildCompatibilityPairKey,
  buildCompatibilityReport,
} from '@pridicta/astrology';
import {
  getProductUpgradePrompt,
  hasCompatibilityReportCredit,
} from '@pridicta/monetization';
import type { CompatibilityReport, SavedKundliRecord } from '@pridicta/types';

import {
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
  useGlassAlert,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { listSavedKundlis } from '../services/kundli/kundliRepository';
import {
  loadCachedCompatibilityReport,
  saveCachedCompatibilityReport,
} from '../services/storage/localCompatibilityStorage';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export function CompatibilityScreen({
  navigation,
}: RootScreenProps<typeof routes.Compatibility>): React.JSX.Element {
  const monetization = useAppStore(state => state.monetization);
  const auth = useAppStore(state => state.auth);
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const [records, setRecords] = useState<SavedKundliRecord[]>([]);
  const [primaryId, setPrimaryId] = useState<string>();
  const [partnerId, setPartnerId] = useState<string>();
  const [report, setReport] = useState<CompatibilityReport>();
  const { glassAlert, showGlassAlert } = useGlassAlert();
  const primary = records.find(record => record.summary.id === primaryId);
  const partner = records.find(record => record.summary.id === partnerId);
  const pairKey =
    primary && partner
      ? buildCompatibilityPairKey(primary.summary.id, partner.summary.id)
      : undefined;
  const access = getResolvedAccess();
  const hasFullAccess =
    access.hasPremiumAccess ||
    access.hasUnrestrictedAppAccess ||
    hasCompatibilityReportCredit(monetization.oneTimeEntitlements, pairKey);
  const compatibilityPrompt = getProductUpgradePrompt(
    'MARRIAGE_COMPATIBILITY_REPORT',
  );

  useEffect(() => {
    listSavedKundlis()
      .then(saved => {
        setRecords(saved);
        setPrimaryId(saved[0]?.summary.id);
        setPartnerId(saved.find(item => item.summary.id !== saved[0]?.summary.id)?.summary.id);
      })
      .catch(() => {
        showGlassAlert({
          message: 'Saved kundlis could not be loaded from this device.',
          title: 'Compatibility unavailable',
        });
      });
  }, [showGlassAlert]);

  const canCompare = Boolean(primary && partner && primary.summary.id !== partner.summary.id);

  const preview = useMemo(() => {
    if (!primary || !partner || primary.summary.id === partner.summary.id) {
      return undefined;
    }

    return buildCompatibilityReport({
      hasFullAccess,
      partnerKundli: partner.kundliData,
      primaryKundli: primary.kundliData,
    });
  }, [hasFullAccess, partner, primary]);

  async function generateReport() {
    if (!primary || !partner || primary.summary.id === partner.summary.id) {
      showGlassAlert({
        message: 'Choose two different saved kundlis to prepare compatibility.',
        title: 'Select two kundlis',
      });
      return;
    }

    try {
      const cacheKey = buildCompatibilityCacheKey(
        primary.kundliData,
        partner.kundliData,
      );
      const cached = await loadCachedCompatibilityReport(cacheKey);
      if (cached && cached.depth === (hasFullAccess ? 'FULL' : 'FREE')) {
        setReport(cached);
        return;
      }

      const nextReport = buildCompatibilityReport({
        hasFullAccess,
        partnerKundli: partner.kundliData,
        primaryKundli: primary.kundliData,
      });
      await saveCachedCompatibilityReport(nextReport);
      setReport(nextReport);
    } catch {
      showGlassAlert({
        message:
          'Compatibility could not be prepared. Your saved kundlis were not changed.',
        title: 'Report failed',
      });
    }
  }

  function askFromCompatibility() {
    setActiveChartContext({
      selectedSection: 'Compatibility Report',
      sourceScreen: 'Compatibility',
    });
    navigation.navigate(routes.Chat);
  }

  function openCompatibilityOffer() {
    trackAnalyticsEvent({
      eventName: 'product_selected',
      metadata: {
        productId: compatibilityPrompt.productId ?? null,
        productType: compatibilityPrompt.productType ?? null,
        source: 'compatibility',
      },
      userId: auth.userId,
    });
    navigation.navigate(routes.Paywall, {
      source: 'compatibility',
      suggestedProductId: compatibilityPrompt.productId,
      title: compatibilityPrompt.title,
    });
  }

  return (
    <Screen>
      {glassAlert}
      <AnimatedHeader eyebrow="RELATIONSHIP INTELLIGENCE" title="Compatibility" />

      <GlowCard style={styles.panelSpacing} delay={100}>
        <AppText tone="secondary" variant="caption">
          TWO KUNDLIS
        </AppText>
        <AppText style={styles.copy} variant="subtitle">
          Choose two saved kundlis for a calm, practical compatibility reading.
        </AppText>
        <AppText style={styles.copy} tone="secondary">
          Predicta does not reduce the relationship to one score. Guna Milan
          appears only when verified matching data is available.
        </AppText>
      </GlowCard>

      {records.length < 2 ? (
        <GlowCard style={styles.panelSpacing} delay={180}>
          <AppText variant="subtitle">Two saved kundlis are needed</AppText>
          <AppText style={styles.copy} tone="secondary">
            Save another kundli locally first. Compatibility reports never
            upload kundlis automatically.
          </AppText>
          <View style={styles.buttonSpacing}>
            <GlowButton
              label="Open Kundli"
              onPress={() => navigation.navigate(routes.Kundli)}
            />
          </View>
        </GlowCard>
      ) : (
        <GlowCard style={styles.panelSpacing} delay={180}>
          <AppText variant="subtitle">Select pair</AppText>
          <AppText style={styles.label} tone="secondary" variant="caption">
            FIRST PERSON
          </AppText>
          <View style={styles.choiceList}>
            {records.map(record => (
              <PersonChoice
                active={primaryId === record.summary.id}
                key={`primary-${record.summary.id}`}
                onPress={() => setPrimaryId(record.summary.id)}
                record={record}
              />
            ))}
          </View>
          <AppText style={styles.label} tone="secondary" variant="caption">
            SECOND PERSON
          </AppText>
          <View style={styles.choiceList}>
            {records.map(record => (
              <PersonChoice
                active={partnerId === record.summary.id}
                disabled={primaryId === record.summary.id}
                key={`partner-${record.summary.id}`}
                onPress={() => setPartnerId(record.summary.id)}
                record={record}
              />
            ))}
          </View>
          <View style={styles.buttonSpacing}>
            <GlowButton
              label={hasFullAccess ? 'Generate Full Report' : 'Generate Preview'}
              onPress={generateReport}
            />
          </View>
        </GlowCard>
      )}

      {(report ?? preview) && canCompare ? (
        <CompatibilityReportCard
          hasFullAccess={hasFullAccess}
          onAsk={askFromCompatibility}
          onUnlock={openCompatibilityOffer}
          report={(report ?? preview) as CompatibilityReport}
        />
      ) : null}
    </Screen>
  );
}

function PersonChoice({
  active,
  disabled,
  onPress,
  record,
}: {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
  record: SavedKundliRecord;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.personChoice,
        active ? styles.personChoiceActive : undefined,
        disabled ? styles.personChoiceDisabled : undefined,
      ]}
    >
      <AppText variant="subtitle">{record.summary.name}</AppText>
      <AppText tone="secondary" variant="caption">
        {record.summary.birthPlace} · {record.summary.moonSign} Moon
      </AppText>
    </Pressable>
  );
}

function CompatibilityReportCard({
  hasFullAccess,
  onAsk,
  onUnlock,
  report,
}: {
  hasFullAccess: boolean;
  onAsk: () => void;
  onUnlock: () => void;
  report: CompatibilityReport;
}): React.JSX.Element {
  const sections = [
    report.emotionalCompatibility,
    report.communicationPattern,
    report.familyLifeIndicators,
    report.timingConsiderations,
    report.cautionAreas,
    report.practicalGuidance,
  ];

  return (
    <GlowCard style={styles.panelSpacing} delay={260}>
      <AppText tone="secondary" variant="caption">
        {report.depth} COMPATIBILITY
      </AppText>
      <AppText style={styles.copy} variant="subtitle">
        {report.primary.name} + {report.partner.name}
      </AppText>
      <AppText style={styles.copy} tone="secondary">
        {report.summary}
      </AppText>
      <View style={styles.ashtakootaBox}>
        <AppText variant="subtitle">Guna Milan</AppText>
        <AppText style={styles.copy} tone="secondary">
          {report.ashtakoota.unavailableReason ??
            'Verified Ashtakoota score is available.'}
        </AppText>
      </View>
      {sections.map(section => (
        <View key={section.title} style={styles.reportSection}>
          <AppText variant="subtitle">{section.title}</AppText>
          <AppText style={styles.copy} tone="secondary">
            {section.summary}
          </AppText>
          {section.indicators.slice(0, hasFullAccess ? 3 : 2).map(indicator => (
            <AppText key={indicator} style={styles.indicator} tone="secondary">
              • {indicator}
            </AppText>
          ))}
        </View>
      ))}
      {!hasFullAccess ? (
        <View style={styles.lockedBox}>
          <AppText variant="subtitle">Full compatibility depth</AppText>
          <AppText style={styles.copy} tone="secondary">
            Unlock the one-time compatibility report for deeper timing,
            caution, and practical guidance.
          </AppText>
          <View style={styles.buttonSpacing}>
            <GlowButton
              label="Unlock Compatibility Report"
              onPress={onUnlock}
            />
          </View>
        </View>
      ) : null}
      <Pressable accessibilityRole="button" onPress={onAsk} style={styles.inlineLink}>
        <AppText style={styles.inlineLinkText}>Ask Predicta about this pair</AppText>
      </Pressable>
    </GlowCard>
  );
}

const styles = StyleSheet.create({
  ashtakootaBox: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  buttonSpacing: {
    marginTop: 18,
  },
  choiceList: {
    gap: 12,
    marginTop: 12,
  },
  copy: {
    marginTop: 10,
  },
  indicator: {
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
  label: {
    marginTop: 22,
  },
  lockedBox: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 20,
    padding: 18,
  },
  panelSpacing: {
    marginTop: 24,
  },
  personChoice: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    padding: 16,
  },
  personChoiceActive: {
    borderColor: colors.borderGlow,
  },
  personChoiceDisabled: {
    opacity: 0.45,
  },
  reportSection: {
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopWidth: 1,
    marginTop: 20,
    paddingTop: 20,
  },
});
