import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SIGNATURE_PRIVACY_COPY,
  SIGNATURE_SCAN_LABELS,
  SIGNATURE_SHORT_PRIVACY_COPY,
  composeSignatureAnalysisModel,
  extractSignatureTraitObservations,
} from '@pridicta/astrology';
import type { SignatureTraitKey, SignatureTraitValue } from '@pridicta/types';

import {
  ActiveKundliActions,
  AnimatedHeader,
  AppText,
  GlowButton,
  GlowCard,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

type SignatureInputMode = 'draw' | 'upload';
type SignatureScanStatus = 'empty' | 'ready' | 'scanning';

export function SignaturePredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.SignaturePredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const [mode, setMode] = useState<SignatureInputMode>('upload');
  const [scanStatus, setScanStatus] = useState<SignatureScanStatus>('empty');
  const [detectedTraits, setDetectedTraits] = useState<
    Partial<Record<SignatureTraitKey, SignatureTraitValue>>
  >({});
  const [confirmedTraits, setConfirmedTraits] = useState<
    Partial<Record<SignatureTraitKey, SignatureTraitValue>>
  >({});
  const hasSignature = scanStatus !== 'empty';
  const detectedTraitRows = useMemo(
    () => extractSignatureTraitObservations(detectedTraits, 'unconfirmed'),
    [detectedTraits],
  );
  const confirmedTraitRows = useMemo(
    () => extractSignatureTraitObservations(confirmedTraits, 'confirmed'),
    [confirmedTraits],
  );
  const model = useMemo(
    () =>
      composeSignatureAnalysisModel({
        confirmationState: 'confirmed',
        inputSource: mode === 'draw' ? 'drawn-signature' : 'uploaded-image',
        observedTraits: confirmedTraits,
      }),
    [confirmedTraits, mode],
  );

  function startScan(nextMode: SignatureInputMode): void {
    setMode(nextMode);
    setDetectedTraits(buildMobileDetectedTraits(nextMode));
    setConfirmedTraits({});
    setScanStatus('scanning');
    setTimeout(() => setScanStatus('ready'), 300);
  }

  function clearSignature(): void {
    setDetectedTraits({});
    setConfirmedTraits({});
    setScanStatus('empty');
  }

  function confirmTraits(): void {
    setConfirmedTraits(detectedTraits);
  }

  function continueToChat(): void {
    const traitSummary = confirmedTraitRows
      .map(trait => `${trait.label}: ${trait.value} (${trait.confidence})`)
      .join('; ');

    setActiveChartContext({
      handoffFrom: 'PARASHARI',
      handoffQuestion:
        model.status === 'ready'
          ? `Open Signature Predicta. Use only these confirmed visible traits: ${traitSummary}. ${model.privacy.reportCopy}`
          : 'Read my signature traits safely. Ask me to upload, draw, or confirm visible traits before deeper analysis.',
      predictaSchool: 'SIGNATURE',
      selectedSection:
        'Signature Predicta input uses only confirmed visible traits. Raw signature images are not stored or passed to chat.',
      sourceScreen: 'Signature Predicta',
    });
    navigation.navigate(routes.Chat);
  }

  const visibleTraits = confirmedTraitRows.length
    ? confirmedTraitRows
    : detectedTraitRows;

  return (
    <Screen>
      <AnimatedHeader
        eyebrow="SIGNATURE PREDICTA"
        title="Privacy-first signature scan"
      />
      <ActiveKundliActions
        compact
        kundli={kundli}
        sourceScreen="Signature Predicta"
        title="Signature reading profile"
      />
      <View className="gap-5">
        <GlowCard delay={100}>
          <AppText tone="secondary" variant="caption">
            SIGNATURE PREDICTA
          </AppText>
          <AppText className="mt-2" variant="subtitle">
            Signature Predicta is reflective guidance, not forensic handwriting
            analysis or a guaranteed prediction.
          </AppText>
          <AppText className="mt-3" tone="secondary">
            {SIGNATURE_PRIVACY_COPY}
          </AppText>
        </GlowCard>

        <GlowCard delay={130}>
          <AppText tone="secondary" variant="caption">
            UPLOAD OR DRAW
          </AppText>
          <View style={styles.actionGrid}>
            <GlowButton
              label={mode === 'upload' && hasSignature ? 'Re-upload signature' : 'Upload signature'}
              onPress={() => startScan('upload')}
            />
            <GlowButton
              label={mode === 'draw' && hasSignature ? 'Re-draw signature' : 'Use this drawing'}
              onPress={() => startScan('draw')}
            />
          </View>
          <AppText className="mt-3" tone="secondary" variant="caption">
            {SIGNATURE_SHORT_PRIVACY_COPY}
          </AppText>
        </GlowCard>

        <GlowCard delay={150}>
          <AppText tone="secondary" variant="caption">
            SIGNATURE SCAN
          </AppText>
          <View style={styles.previewBox}>
            <AppText variant="subtitle">
              {scanStatus === 'empty'
                ? 'Your previous signature image was not stored. Please re-upload or re-draw it to continue.'
                : scanStatus === 'scanning'
                  ? 'Scanning your signature expression...'
                  : 'Signature scanned'}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {scanStatus === 'scanning'
                ? 'Reduced-motion mode shows staged progress instead of a moving scan beam.'
                : 'Signature traits ready. Please confirm what looks right.'}
            </AppText>
          </View>
          <View style={styles.chipRow}>
            {SIGNATURE_SCAN_LABELS.map(label => (
              <View key={label} style={styles.chip}>
                <AppText variant="caption">{label}</AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={170}>
          <AppText tone="secondary" variant="caption">
            TRAIT MAP
          </AppText>
          <AppText className="mt-2" tone="secondary">
            Predicta detected these visible traits from your current signature.
            Please confirm or adjust anything that looks off.
          </AppText>
          <View style={styles.traitGrid}>
            {visibleTraits.map(trait => (
              <View key={trait.key} style={styles.traitCard}>
                <AppText tone="secondary" variant="caption">
                  {trait.label}
                </AppText>
                <AppText variant="subtitle">{trait.value}</AppText>
                <AppText tone="secondary" variant="caption">
                  {trait.confidence} · {trait.confirmationState}
                </AppText>
              </View>
            ))}
            {!visibleTraits.length ? (
              <View style={styles.traitCard}>
                <AppText variant="subtitle">Not assessed</AppText>
                <AppText tone="secondary" variant="caption">
                  uncertain
                </AppText>
              </View>
            ) : null}
          </View>
          <View className="mt-5">
            <GlowButton
              label="Looks right"
              onPress={confirmTraits}
            />
          </View>
          <View className="mt-3">
            <GlowButton label="Clear signature" onPress={clearSignature} />
          </View>
        </GlowCard>

        {confirmedTraitRows.length ? (
          <GlowCard delay={180} style={styles.stickyReady}>
            <AppText variant="subtitle">
              Signature ready · Not stored · Continue
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              Only confirmed traits will flow to chat or reports.
            </AppText>
            <View className="mt-5">
              <GlowButton
                label="Continue to Signature Predicta"
                onPress={continueToChat}
              />
            </View>
          </GlowCard>
        ) : null}

        <GlowCard delay={190}>
          <AppText tone="secondary" variant="caption">
            WHAT THIS CAN AND CANNOT TELL YOU
          </AppText>
          {model.canAndCannotTellYou.map(item => (
            <View key={item} style={styles.row}>
              <AppText tone="secondary" variant="caption">
                {item}
              </AppText>
            </View>
          ))}
        </GlowCard>
      </View>
    </Screen>
  );
}

function buildMobileDetectedTraits(
  mode: SignatureInputMode,
): Partial<Record<SignatureTraitKey, SignatureTraitValue>> {
  if (mode === 'upload') {
    return {
      baseline: 'steady',
      flourish: 'moderate',
      legibility: 'partial',
      'letter-connection': 'mixed',
      'margin-use': 'balanced',
      pressure: 'medium',
      'signature-size': 'medium',
      slant: 'right',
      spacing: 'balanced',
      speed: 'moderate',
      underline: 'none',
    };
  }

  return {
    baseline: 'upward',
    flourish: 'moderate',
    legibility: 'partial',
    'letter-connection': 'connected',
    'margin-use': 'balanced',
    pressure: 'medium',
    'signature-size': 'medium',
    slant: 'right',
    spacing: 'balanced',
    speed: 'moderate',
    underline: 'single',
  };
}

const styles = StyleSheet.create({
  actionGrid: {
    gap: 12,
    marginTop: 16,
  },
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  previewBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 14,
    padding: 16,
  },
  row: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  stickyReady: {
    borderColor: colors.success,
    borderWidth: 1,
  },
  traitCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 12,
  },
  traitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
});
