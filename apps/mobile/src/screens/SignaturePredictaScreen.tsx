import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  SIGNATURE_PRIVACY_COPY,
  SIGNATURE_SHORT_PRIVACY_COPY,
  composeSignatureAnalysisModel,
  extractSignatureTraitObservations,
} from '@pridicta/astrology';
import { getNativeCopy } from '@pridicta/config';
import type {
  SignatureTraitKey,
  SignatureTraitValue,
  SupportedLanguage,
} from '@pridicta/types';

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
type SignatureMobileCopy = {
  actions: {
    clear: string;
    looksRight: string;
    redraw: string;
    reupload: string;
    upload: string;
    useDrawing: string;
  };
  detectionBody: string;
  missing: string;
  notAssessed: string;
  onlyConfirmed: string;
  privacyShort: string;
  ready: string;
  reducedMotion: string;
  scanned: string;
  scanning: string;
  scanLabels: string[];
  signatureScan: string;
  stickyReady: string;
  traitMap: string;
  uncertain: string;
};

const SIGNATURE_MOBILE_COPY: Record<SupportedLanguage, SignatureMobileCopy> = {
  en: {
    actions: {
      clear: 'Clear signature',
      looksRight: 'Looks right',
      redraw: 'Re-draw signature',
      reupload: 'Re-upload signature',
      upload: 'Upload signature',
      useDrawing: 'Use this drawing',
    },
    detectionBody:
      'Predicta detected these visible traits from your current signature. Please confirm or adjust anything that looks off.',
    missing:
      'Your previous signature image was not stored. Please re-upload or re-draw it to continue.',
    notAssessed: 'Not assessed',
    onlyConfirmed: 'Only confirmed traits will flow to chat or reports.',
    privacyShort: SIGNATURE_SHORT_PRIVACY_COPY,
    ready: 'Signature traits ready. Please confirm what looks right.',
    reducedMotion:
      'Reduced-motion mode shows staged progress instead of a moving scan beam.',
    scanned: 'Signature scanned',
    scanning: 'Scanning your signature expression...',
    scanLabels: [
      'Baseline detected',
      'Slant measured',
      'Rhythm mapped',
      'Legibility checked',
      'Flourish noted',
    ],
    signatureScan: 'SIGNATURE SCAN',
    stickyReady: 'Signature ready · Not stored · Continue',
    traitMap: 'TRAIT MAP',
    uncertain: 'uncertain',
  },
  hi: {
    actions: {
      clear: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8d381a4bbc'),
      looksRight: getNativeCopy('signature.receipt.looksRight.hi'),
      redraw: getNativeCopy('signature.receipt.actions.redraw.hi'),
      reupload: getNativeCopy('signature.receipt.actions.reupload.hi'),
      upload: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9e30f80456'),
      useDrawing: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.136b9a7b32'),
    },
    detectionBody: getNativeCopy('signature.receipt.detectedBody.hi'),
    missing: getNativeCopy('signature.receipt.missing.hi'),
    notAssessed: getNativeCopy('signature.receipt.notAssessed.hi'),
    onlyConfirmed: getNativeCopy('signature.mobile.receipt.onlyConfirmed.hi'),
    privacyShort: getNativeCopy('signature.receipt.privacyShort.hi'),
    ready: getNativeCopy('signature.receipt.ready.hi'),
    reducedMotion: getNativeCopy('signature.mobile.receipt.reducedMotion.hi'),
    scanned: getNativeCopy('signature.receipt.scanned.hi'),
    scanning: getNativeCopy('signature.receipt.scanning.hi'),
    scanLabels: [
      getNativeCopy('signature.receipt.scan.baseline.hi'),
      getNativeCopy('signature.receipt.scan.slant.hi'),
      getNativeCopy('signature.receipt.scan.rhythm.hi'),
      getNativeCopy('signature.receipt.scan.legibility.hi'),
      getNativeCopy('signature.receipt.scan.flourish.hi'),
    ],
    signatureScan: getNativeCopy('signature.mobile.receipt.signatureScan.hi'),
    stickyReady: getNativeCopy('signature.mobile.receipt.stickyReady.hi'),
    traitMap: getNativeCopy('signature.mobile.receipt.traitMap.hi'),
    uncertain: getNativeCopy('signature.receipt.uncertainConfidence.hi'),
  },
  gu: {
    actions: {
      clear: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b890629137'),
      looksRight: getNativeCopy('signature.receipt.looksRight.gu'),
      redraw: getNativeCopy('signature.receipt.actions.redraw.gu'),
      reupload: getNativeCopy('signature.receipt.actions.reupload.gu'),
      upload: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4a40d077ff'),
      useDrawing: getNativeCopy('native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.17ba897714'),
    },
    detectionBody: getNativeCopy('signature.receipt.detectedBody.gu'),
    missing: getNativeCopy('signature.receipt.missing.gu'),
    notAssessed: getNativeCopy('signature.receipt.notAssessed.gu'),
    onlyConfirmed: getNativeCopy('signature.mobile.receipt.onlyConfirmed.gu'),
    privacyShort: getNativeCopy('signature.receipt.privacyShort.gu'),
    ready: getNativeCopy('signature.receipt.ready.gu'),
    reducedMotion: getNativeCopy('signature.mobile.receipt.reducedMotion.gu'),
    scanned: getNativeCopy('signature.receipt.scanned.gu'),
    scanning: getNativeCopy('signature.receipt.scanning.gu'),
    scanLabels: [
      getNativeCopy('signature.receipt.scan.baseline.gu'),
      getNativeCopy('signature.receipt.scan.slant.gu'),
      getNativeCopy('signature.receipt.scan.rhythm.gu'),
      getNativeCopy('signature.receipt.scan.legibility.gu'),
      getNativeCopy('signature.receipt.scan.flourish.gu'),
    ],
    signatureScan: getNativeCopy('signature.mobile.receipt.signatureScan.gu'),
    stickyReady: getNativeCopy('signature.mobile.receipt.stickyReady.gu'),
    traitMap: getNativeCopy('signature.mobile.receipt.traitMap.gu'),
    uncertain: getNativeCopy('signature.receipt.uncertainConfidence.gu'),
  },
};

export function SignaturePredictaScreen({
  navigation,
}: RootScreenProps<typeof routes.SignaturePredicta>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const language = useAppStore(state => state.languagePreference.language);
  const copy = SIGNATURE_MOBILE_COPY[language] ?? SIGNATURE_MOBILE_COPY.en;
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
              label={mode === 'upload' && hasSignature ? copy.actions.reupload : copy.actions.upload}
              onPress={() => startScan('upload')}
            />
            <GlowButton
              label={mode === 'draw' && hasSignature ? copy.actions.redraw : copy.actions.useDrawing}
              onPress={() => startScan('draw')}
            />
          </View>
          <AppText className="mt-3" tone="secondary" variant="caption">
            {copy.privacyShort}
          </AppText>
        </GlowCard>

        <GlowCard delay={150}>
          <AppText tone="secondary" variant="caption">
            {copy.signatureScan}
          </AppText>
          <View style={styles.previewBox}>
            <AppText variant="subtitle">
              {scanStatus === 'empty'
                ? copy.missing
                : scanStatus === 'scanning'
                  ? copy.scanning
                  : copy.scanned}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {scanStatus === 'scanning'
                ? copy.reducedMotion
                : copy.ready}
            </AppText>
          </View>
          <View style={styles.chipRow}>
            {copy.scanLabels.map(label => (
              <View key={label} style={styles.chip}>
                <AppText variant="caption">{label}</AppText>
              </View>
            ))}
          </View>
        </GlowCard>

        <GlowCard delay={170}>
          <AppText tone="secondary" variant="caption">
            {copy.traitMap}
          </AppText>
          <AppText className="mt-2" tone="secondary">
            {copy.detectionBody}
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
                <AppText variant="subtitle">{copy.notAssessed}</AppText>
                <AppText tone="secondary" variant="caption">
                  {copy.uncertain}
                </AppText>
              </View>
            ) : null}
          </View>
          <View className="mt-5">
            <GlowButton
              label={copy.actions.looksRight}
              onPress={confirmTraits}
            />
          </View>
          <View className="mt-3">
            <GlowButton label={copy.actions.clear} onPress={clearSignature} />
          </View>
        </GlowCard>

        {confirmedTraitRows.length ? (
          <GlowCard delay={180} style={styles.stickyReady}>
            <AppText variant="subtitle">
              {copy.stickyReady}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {copy.onlyConfirmed}
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
