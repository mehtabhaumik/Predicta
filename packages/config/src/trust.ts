import type {
  ConfidenceLevel,
  KundliData,
  SupportedLanguage,
  TrustProfile,
  TrustSurface,
} from '@pridicta/types';

const HIGH_STAKES_PATTERN =
  /\b(health|medical|medicine|doctor|surgery|pregnancy|disease|legal|court|lawsuit|contract|police|tax|finance|financial|investment|stock|crypto|loan|debt|insurance|self-harm|suicide|violence|abuse|emergency)\b/i;

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
        label: 'ઊંચો વિશ્વાસ',
        meaning: 'ઘણા chart factors એક જ દિશામાં બતાવે છે.',
      },
      low: {
        label: 'ઓછો વિશ્વાસ',
        meaning: 'Evidence missing, weak અથવા birth-time sensitive છે.',
      },
      medium: {
        label: 'મધ્યમ વિશ્વાસ',
        meaning: 'Useful signal છે, પણ evidence mixed અથવા incomplete છે.',
      },
    },
    hi: {
      high: {
        label: 'ऊंचा विश्वास',
        meaning: 'कई chart factors एक ही दिशा दिखाते हैं.',
      },
      low: {
        label: 'कम विश्वास',
        meaning: 'Evidence missing, weak या birth-time sensitive है.',
      },
      medium: {
        label: 'मध्यम विश्वास',
        meaning: 'Useful signal है, पर evidence mixed या incomplete है.',
      },
    },
  };

  return copy[language][confidence];
}

export function getSafetyBoundaryCopy(
  language: SupportedLanguage = 'en',
): string {
  if (language === 'hi') {
    return 'Predicta reflection और timing support देता है. Medical, legal, financial या safety decisions के लिए qualified professional से सलाह लें.';
  }
  if (language === 'gu') {
    return 'Predicta reflection અને timing support આપે છે. Medical, legal, financial અથવા safety decisions માટે qualified professional ની સલાહ લો.';
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
