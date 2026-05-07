import type {
  ConfidenceLevel,
  KundliData,
  SupportedLanguage,
  TrustProfile,
  TrustSurface,
} from '@pridicta/types';

const HIGH_STAKES_PATTERN =
  /\b(health|medical|medicine|doctor|surgery|pregnancy|disease|legal|court|lawsuit|contract|police|tax|finance|financial|invest|investing|investment|savings|stock|crypto|loan|debt|insurance|paisa|paise|money|nana|dhan|karz|udhar|self-harm|suicide|violence|violent|abuse|emergency)\b/i;

export function getConfidenceCopy(
  confidence: ConfidenceLevel,
  language: SupportedLanguage = 'en',
): { label: string; meaning: string } {
  const copy: Record<SupportedLanguage, Record<ConfidenceLevel, { label: string; meaning: string }>> = {
    en: {
      high: {
        label: 'High confidence',
        meaning: 'Multiple chart factors point in the same direction.',
      },
      low: {
        label: 'Low confidence',
        meaning: 'Evidence is missing, weak, or birth-time sensitive.',
      },
      medium: {
        label: 'Medium confidence',
        meaning: 'Useful signal exists, but there is mixed or incomplete evidence.',
      },
    },
    gu: {
      high: {
        label: 'High confidence',
        meaning: 'Ghana chart factors ek j direction batave chhe.',
      },
      low: {
        label: 'Low confidence',
        meaning: 'Evidence missing, weak athva birth-time sensitive chhe.',
      },
      medium: {
        label: 'Medium confidence',
        meaning: 'Useful signal chhe, pan evidence mixed athva incomplete chhe.',
      },
    },
    hi: {
      high: {
        label: 'High confidence',
        meaning: 'Kai chart factors ek hi direction dikhate hain.',
      },
      low: {
        label: 'Low confidence',
        meaning: 'Evidence missing, weak ya birth-time sensitive hai.',
      },
      medium: {
        label: 'Medium confidence',
        meaning: 'Useful signal hai, par evidence mixed ya incomplete hai.',
      },
    },
  };

  return copy[language][confidence];
}

export function getSafetyBoundaryCopy(
  language: SupportedLanguage = 'en',
): string {
  if (language === 'hi') {
    return 'Predicta reflection aur timing support deti hai. Medical, legal, financial ya safety decisions ke liye qualified professional se salah lein.';
  }
  if (language === 'gu') {
    return 'Predicta reflection ane timing support aape chhe. Medical, legal, financial athva safety decisions mate qualified professional ni salah lo.';
  }
  return 'Predicta provides reflection and timing support. For medical, legal, financial, or safety decisions, consult a qualified professional.';
}

export function hasHighStakesLanguage(text?: string): boolean {
  return HIGH_STAKES_PATTERN.test(text ?? '');
}

export function buildTrustProfile({
  evidence = [],
  kundli,
  language = 'en',
  limitations = [],
  query,
  surface,
}: {
  evidence?: string[];
  kundli?: KundliData;
  language?: SupportedLanguage;
  limitations?: string[];
  query?: string;
  surface: TrustSurface;
}): TrustProfile {
  const highStakes = hasHighStakesLanguage(query);
  const trustLimitations = [
    ...(kundli?.birthDetails.isTimeApproximate
      ? ['Birth time is approximate, so house-sensitive and fine-timing judgments need caution.']
      : []),
    ...limitations,
  ].filter(Boolean);
  const confidence = resolveConfidence(evidence.length, trustLimitations.length, highStakes);
  const confidenceCopy = getConfidenceCopy(confidence, language);
  const safetyNotes = [
    'No fatalistic certainty or guaranteed outcomes.',
    ...(highStakes ? [getSafetyBoundaryCopy(language)] : []),
  ];

  return {
    auditTrace: [
      `surface:${surface}`,
      `evidence:${evidence.length}`,
      `limitations:${trustLimitations.length}`,
      `highStakes:${highStakes ? 'yes' : 'no'}`,
      kundli ? `inputHash:${kundli.calculationMeta.inputHash}` : 'kundli:missing',
    ],
    confidence,
    confidenceLabel: confidenceCopy.label,
    evidence: evidence.length ? evidence : ['No chart evidence is active yet.'],
    highStakes,
    limitations: trustLimitations.length
      ? trustLimitations
      : ['This is guidance, not certainty. Interpretations should be checked against lived reality.'],
    safetyNotes,
    summary: confidenceCopy.meaning,
    surface,
  };
}

function resolveConfidence(
  evidenceCount: number,
  limitationCount: number,
  highStakes: boolean,
): ConfidenceLevel {
  if (highStakes || evidenceCount < 2) {
    return 'low';
  }

  if (limitationCount > 0 || evidenceCount < 4) {
    return 'medium';
  }

  return 'high';
}
