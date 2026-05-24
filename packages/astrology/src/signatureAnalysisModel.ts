import type {
  SignatureAnalysisModel,
  SignatureInputSource,
  SignatureInterpretationCard,
  SignatureTraitKey,
  SignatureTraitObservation,
  SignatureTraitValue,
} from '@pridicta/types';

export type SignatureAnalysisInput = {
  inputSource?: SignatureInputSource;
  observedTraits?: Partial<Record<SignatureTraitKey, SignatureTraitValue>>;
  confirmationState?: 'confirmed' | 'unconfirmed';
};

type SignatureTraitMeaning = {
  caution: string;
  label: string;
  meaning: string;
  strengths: string[];
};

type SignatureTraitRule = {
  evidence: string;
  label: string;
  values: Partial<Record<SignatureTraitValue, SignatureTraitMeaning>>;
};

export const SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES = [
  'Signature analysis is for reflection and self-understanding only.',
  'It must not be used as identity verification, handwriting forensics, legal proof, hiring advice, medical diagnosis, or mental-health diagnosis.',
  'Treat every interpretation as a soft tendency, not a fixed truth about character or future events.',
  'Use confirmed personal context before giving strong guidance, and avoid shame, fear, or certainty language.',
  'Signature Predicta helps you reflect on self-expression, presentation, confidence rhythm, consistency, and improvement practices. It does not predict the future.',
];

export const SIGNATURE_PRIVACY_COPY =
  'Predicta does not store your signature image. It stays only in this session so we can prepare your reading. If you close this tab or leave the session, you may need to re-upload or re-draw it.';

export const SIGNATURE_SHORT_PRIVACY_COPY =
  'Not stored by Predicta. If you close this session, you may need to re-upload or re-draw.';

export const SIGNATURE_REPORT_PRIVACY_COPY =
  'Predicta did not store your signature image. This section uses only confirmed visible traits from your current session.';

export const SIGNATURE_CAN_AND_CANNOT_TELL_YOU = [
  'It reads visible expression cues from confirmed traits only.',
  'It is not forensic proof.',
  'It is not identity verification.',
  'It is not prediction.',
  'It is not diagnosis.',
  'It should support reflection, not replace judgment.',
];

export const SIGNATURE_SCAN_LABELS = [
  'Baseline detected',
  'Slant measured',
  'Rhythm mapped',
  'Legibility checked',
  'Flourish noted',
];

const SIGNATURE_TRAIT_RULES: Record<SignatureTraitKey, SignatureTraitRule> = {
  baseline: {
    evidence: 'Baseline shows how the signature moves across the page.',
    label: 'Baseline',
    values: {
      downward: {
        caution:
          'Watch for tired timing, self-doubt, or losing energy before finishing.',
        label: 'Downward baseline',
        meaning:
          'can suggest a more cautious or emotionally loaded phase of self-expression',
        strengths: ['sensitivity', 'realism', 'awareness of pressure'],
      },
      mixed: {
        caution:
          'Keep important decisions grounded when mood or confidence keeps changing.',
        label: 'Mixed baseline',
        meaning:
          'can suggest changing confidence, changing rhythm, or uneven emotional pacing',
        strengths: ['adaptability', 'range', 'responsiveness'],
      },
      steady: {
        caution:
          'A steady presentation still needs flexibility when life demands a new approach.',
        label: 'Steady baseline',
        meaning:
          'can suggest consistency, grounded presentation, and controlled pacing',
        strengths: ['stability', 'follow-through', 'calm presentation'],
      },
      upward: {
        caution:
          'Keep ambition practical so enthusiasm does not outrun preparation.',
        label: 'Upward baseline',
        meaning:
          'can suggest optimism, aspiration, and a forward-moving public style',
        strengths: ['hope', 'ambition', 'momentum'],
      },
    },
  },
  'capital-emphasis': {
    evidence: 'Capital emphasis shows how strongly the first impression is marked.',
    label: 'Capital emphasis',
    values: {
      high: {
        caution:
          'Strong presence works best when it does not become dominance or over-control.',
        label: 'Strong capital emphasis',
        meaning:
          'can suggest strong identity projection, pride in name, or desire to be noticed',
        strengths: ['presence', 'confidence', 'clear first impression'],
      },
      low: {
        caution:
          'Avoid shrinking your voice when the moment needs clear self-advocacy.',
        label: 'Low capital emphasis',
        meaning:
          'can suggest modest presentation, privacy, or less need to dominate attention',
        strengths: ['humility', 'softness', 'low-ego communication'],
      },
      medium: {
        caution:
          'Balanced presentation still benefits from direct communication when stakes are high.',
        label: 'Balanced capital emphasis',
        meaning:
          'can suggest a balanced public identity without excessive show or withdrawal',
        strengths: ['balance', 'professional tone', 'measured confidence'],
      },
    },
  },
  flourish: {
    evidence: 'Flourish shows extra movement added beyond the readable name.',
    label: 'Flourish',
    values: {
      expansive: {
        caution:
          'Expression should stay meaningful instead of becoming over-decoration or over-promising.',
        label: 'Expansive flourish',
        meaning:
          'can suggest expressive style, image awareness, creativity, or a desire for impact',
        strengths: ['style', 'charisma', 'creative projection'],
      },
      moderate: {
        caution:
          'Use expressive polish without hiding the simple message underneath.',
        label: 'Moderate flourish',
        meaning:
          'can suggest controlled style, social polish, and personal branding instinct',
        strengths: ['taste', 'social ease', 'presentation skill'],
      },
      none: {
        caution:
          'Directness is useful, but overly plain presentation can undersell strengths.',
        label: 'Minimal flourish',
        meaning:
          'can suggest practical communication, privacy, or preference for substance over show',
        strengths: ['clarity', 'simplicity', 'practical tone'],
      },
    },
  },
  legibility: {
    evidence: 'Legibility shows how easily the written identity can be read.',
    label: 'Legibility',
    values: {
      abstract: {
        caution:
          'Make sure important people can understand your intent when clarity matters.',
        label: 'Abstract signature',
        meaning:
          'can suggest privacy, personal shorthand, speed, or a more protected public self',
        strengths: ['privacy', 'style', 'selective disclosure'],
      },
      clear: {
        caution:
          'Clear presentation should still leave room for boundaries and privacy.',
        label: 'Clear signature',
        meaning:
          'can suggest openness, direct self-presentation, and clear public identity',
        strengths: ['transparency', 'directness', 'approachability'],
      },
      partial: {
        caution:
          'Clarify expectations in serious conversations so people do not misread you.',
        label: 'Partly readable signature',
        meaning:
          'can suggest a mix of openness and guardedness depending on setting',
        strengths: ['discernment', 'social range', 'controlled openness'],
      },
    },
  },
  'letter-connection': {
    evidence: 'Letter connection shows how the signature links its parts together.',
    label: 'Letter connection',
    values: {
      connected: {
        caution:
          'Connected thinking still needs pauses before important commitments.',
        label: 'Connected letters',
        meaning:
          'can suggest continuity, relational thinking, and connected decision flow',
        strengths: ['continuity', 'relationship awareness', 'flow'],
      },
      disconnected: {
        caution:
          'Independent thinking should not turn into avoidable isolation.',
        label: 'Separated letters',
        meaning:
          'can suggest independent thinking, compartmentalization, or careful boundaries',
        strengths: ['independence', 'analysis', 'boundary sense'],
      },
      mixed: {
        caution:
          'Mixed rhythm benefits from clear priorities when several choices compete.',
        label: 'Mixed connection',
        meaning:
          'can suggest switching between connected intuition and independent analysis',
        strengths: ['flexibility', 'range', 'context awareness'],
      },
    },
  },
  'margin-use': {
    evidence: 'Space use shows how much room the signature takes on the page.',
    label: 'Space use',
    values: {
      balanced: {
        caution:
          'Balanced space use should still adapt to different social or professional settings.',
        label: 'Balanced space use',
        meaning:
          'can suggest measured presence and awareness of the space around you',
        strengths: ['proportion', 'social awareness', 'steady presentation'],
      },
      compact: {
        caution:
          'Avoid making yourself too small when the situation needs visibility.',
        label: 'Compact space use',
        meaning:
          'can suggest restraint, privacy, or economical self-expression',
        strengths: ['focus', 'discipline', 'privacy'],
      },
      expansive: {
        caution:
          'Expansive presence works best with practical follow-through.',
        label: 'Expansive space use',
        meaning:
          'can suggest visibility, large presence, or desire to leave a stronger mark',
        strengths: ['presence', 'boldness', 'expressive confidence'],
      },
    },
  },
  pressure: {
    evidence: 'Pressure is read from stroke darkness, thickness, and consistency.',
    label: 'Pressure',
    values: {
      heavy: {
        caution:
          'Intensity needs recovery time so pressure does not turn into strain.',
        label: 'Heavy pressure',
        meaning:
          'can suggest intensity, strong will, emotional force, or high effort',
        strengths: ['determination', 'commitment', 'force of will'],
      },
      light: {
        caution:
          'Soft effort may need firmer boundaries when the situation demands strength.',
        label: 'Light pressure',
        meaning:
          'can suggest sensitivity, lighter attachment, adaptability, or lower confrontation',
        strengths: ['gentleness', 'adaptability', 'subtlety'],
      },
      medium: {
        caution:
          'Moderate pressure is stable, but stress can still change expression over time.',
        label: 'Medium pressure',
        meaning:
          'can suggest balanced energy, steady effort, and practical emotional control',
        strengths: ['balance', 'stamina', 'controlled effort'],
      },
    },
  },
  'signature-size': {
    evidence: 'Signature size shows the visual scale of public self-presentation.',
    label: 'Signature size',
    values: {
      large: {
        caution:
          'Visibility should stay grounded so confidence does not look like excess.',
        label: 'Large signature',
        meaning:
          'can suggest confidence, public presence, and stronger self-projection',
        strengths: ['visibility', 'leadership', 'confidence'],
      },
      medium: {
        caution:
          'Measured presentation still needs directness when a clear stand is required.',
        label: 'Medium signature',
        meaning:
          'can suggest balanced public presence and practical confidence',
        strengths: ['balance', 'professional tone', 'adaptability'],
      },
      small: {
        caution:
          'Do not hide strengths when visibility would help the outcome.',
        label: 'Small signature',
        meaning:
          'can suggest privacy, restraint, concentration, or selective visibility',
        strengths: ['focus', 'modesty', 'precision'],
      },
    },
  },
  slant: {
    evidence: 'Slant shows the direction of movement in the writing.',
    label: 'Slant',
    values: {
      left: {
        caution:
          'Protective distance is useful, but do not avoid support when it is needed.',
        label: 'Left slant',
        meaning:
          'can suggest reserved expression, self-protection, or reflective emotional style',
        strengths: ['reflection', 'privacy', 'careful response'],
      },
      mixed: {
        caution:
          'Changing response style benefits from slower decisions under pressure.',
        label: 'Mixed slant',
        meaning:
          'can suggest emotional variability or different styles in different contexts',
        strengths: ['range', 'adaptability', 'situational awareness'],
      },
      right: {
        caution:
          'Warm expression should still keep boundaries and timing in mind.',
        label: 'Right slant',
        meaning:
          'can suggest outward expression, warmth, social movement, or faster emotional response',
        strengths: ['warmth', 'initiative', 'social openness'],
      },
      steady: {
        caution:
          'Controlled expression should not become emotional suppression.',
        label: 'Upright slant',
        meaning:
          'can suggest emotional control, measured response, and practical self-management',
        strengths: ['control', 'objectivity', 'measured communication'],
      },
    },
  },
  spacing: {
    evidence: 'Spacing shows how much distance appears between parts of the signature.',
    label: 'Spacing',
    values: {
      balanced: {
        caution:
          'Balanced spacing should still be supported by clear boundaries in real life.',
        label: 'Balanced spacing',
        meaning:
          'can suggest healthy room between connection, identity, and practical concerns',
        strengths: ['balance', 'clear pacing', 'social awareness'],
      },
      tight: {
        caution:
          'Tight spacing may need more breathing room in relationships or work planning.',
        label: 'Tight spacing',
        meaning:
          'can suggest urgency, closeness, compact thinking, or pressure around time',
        strengths: ['focus', 'speed', 'concentration'],
      },
      wide: {
        caution:
          'Wide spacing can become distance if communication is not intentional.',
        label: 'Wide spacing',
        meaning:
          'can suggest independence, space needs, and preference for personal room',
        strengths: ['independence', 'perspective', 'boundary awareness'],
      },
    },
  },
  speed: {
    evidence: 'Speed is read from stroke simplicity, rhythm, and repeated motion.',
    label: 'Writing rhythm',
    values: {
      fast: {
        caution:
          'Fast expression should slow down for commitments, contracts, and emotional talks.',
        label: 'Fast rhythm',
        meaning:
          'can suggest quick response, impatience with delay, or fast-moving thought',
        strengths: ['quickness', 'initiative', 'mental movement'],
      },
      moderate: {
        caution:
          'Moderate rhythm still needs rest when the workload grows.',
        label: 'Moderate rhythm',
        meaning:
          'can suggest controlled pace, practical timing, and balanced response',
        strengths: ['pace control', 'consistency', 'steady action'],
      },
      slow: {
        caution:
          'Careful pace should not turn into hesitation when action is needed.',
        label: 'Slow rhythm',
        meaning:
          'can suggest carefulness, thoughtfulness, or preference for deliberate action',
        strengths: ['patience', 'care', 'precision'],
      },
    },
  },
  underline: {
    evidence: 'Underline shows how the signature supports or asserts itself.',
    label: 'Underline',
    values: {
      high: {
        caution:
          'Strong assertion should stay humble and clear.',
        label: 'Strong underline',
        meaning:
          'can suggest self-assertion, desire for recognition, or reinforced identity',
        strengths: ['assertion', 'self-belief', 'clear personal mark'],
      },
      none: {
        caution:
          'A simple signature can still benefit from visible confidence in important settings.',
        label: 'No underline',
        meaning:
          'can suggest less need for extra assertion or a cleaner self-presentation',
        strengths: ['simplicity', 'ease', 'low drama'],
      },
      single: {
        caution:
          'A clean assertion works best when action supports the promise.',
        label: 'Single underline',
        meaning:
          'can suggest steady self-support and a clear finishing statement',
        strengths: ['focus', 'completion', 'self-support'],
      },
    },
  },
};

export function composeSignatureAnalysisModel(
  input?: SignatureAnalysisInput,
): SignatureAnalysisModel {
  const observedTraits = extractSignatureTraitObservations(
    input?.observedTraits,
    input?.confirmationState ?? 'confirmed',
  ).filter(trait => trait.confirmationState === 'confirmed');

  if (!observedTraits.length) {
    return buildPendingSignatureAnalysisModel(input?.inputSource);
  }

  const interpretationCards = observedTraits.map(buildInterpretationCard);
  const strengths = uniqueList(
    observedTraits.flatMap(observation => {
      const meaning = getTraitMeaning(observation.key, observation.value);
      return meaning?.strengths ?? [];
    }),
  ).slice(0, 7);
  const cautions = uniqueList(
    interpretationCards.map(card => card.caution).filter(Boolean),
  ).slice(0, 5);
  const featured = interpretationCards.slice(0, 3).map(card => card.title);
  const rhythm = buildWritingRhythm(observedTraits);
  const confidenceExpression = buildConfidenceExpression(observedTraits);
  const consistency = buildConsistencyProfile(observedTraits);
  const improvementPlan = buildImprovementPlan(
    observedTraits,
    rhythm,
    confidenceExpression,
    consistency,
  );

  return {
    cautions,
    confidenceExpression,
    consistency,
    evidence: observedTraits.map(
      trait => `${trait.label}: ${trait.value} (${trait.confidence} confidence).`,
    ),
    improvementPlan,
    inputSource: input?.inputSource ?? 'manual-observation',
    interpretationCards,
    limitations: [
      'Signature traits can change with mood, pen, surface, time pressure, and language script.',
      'A real reading should use a recent natural signature and confirmed user context.',
      'This model interprets user-confirmed visual traits; it does not verify identity or authenticate documents.',
      SIGNATURE_REPORT_PRIVACY_COPY,
    ],
    method: {
      extraction: 'USER_CONFIRMED_VISUAL_TRAITS',
      interpretation: 'REFLECTIVE_SIGNATURE_ANALYSIS_RULES',
      safety: 'NO_FORENSIC_IDENTITY_OR_DIAGNOSIS',
    },
    observedTraits,
    practicePrompts: buildPracticePrompts(observedTraits),
    rhythm,
    safetyBoundaries: SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES,
    canAndCannotTellYou: SIGNATURE_CAN_AND_CANNOT_TELL_YOU,
    privacy: {
      reportCopy: SIGNATURE_REPORT_PRIVACY_COPY,
      sessionBehavior:
        'Raw signature images stay only in current in-memory interaction state. Closing or reloading may require re-upload or re-draw.',
      storage: 'raw-image-not-stored',
    },
    status: 'ready',
    strengths,
    synthesisReadiness: {
      numerology: 'available-on-request',
      rule:
        'Signature and Numerology stay separate unless the user explicitly asks for synthesis.',
    },
    suggestedQuestions: [
      'What does this signature show about my self-expression?',
      'What should I improve in my signature without making fear-based changes?',
      'Compare this signature with my name number and birth chart.',
      'Give me a practical confidence practice from this signature reading.',
    ],
    summary: `Signature reading is ready from ${observedTraits.length} visual trait${
      observedTraits.length === 1 ? '' : 's'
    }. Main signals: ${featured.join(', ')}.`,
  };
}

export function extractSignatureTraitObservations(
  traits?: Partial<Record<SignatureTraitKey, SignatureTraitValue>>,
  confirmationState: SignatureTraitObservation['confirmationState'] = 'confirmed',
): SignatureTraitObservation[] {
  if (!traits) {
    return [];
  }

  return (Object.keys(SIGNATURE_TRAIT_RULES) as SignatureTraitKey[])
    .map(key => {
      const value = traits[key];
      const rule = SIGNATURE_TRAIT_RULES[key];

      if (!value || !rule.values[value]) {
        return undefined;
      }

      return {
        confidence: inferTraitConfidence(key, value),
        confirmationState,
        evidence: rule.evidence,
        key,
        label: rule.label,
        value,
      } satisfies SignatureTraitObservation;
    })
    .filter((trait): trait is SignatureTraitObservation => Boolean(trait));
}

export function getSignatureTraitRules(): Record<
  SignatureTraitKey,
  SignatureTraitRule
> {
  return SIGNATURE_TRAIT_RULES;
}

export function buildSignaturePredictaPromptContext(
  model: SignatureAnalysisModel,
): string {
  if (model.status !== 'ready') {
    return [
      'Signature Predicta is waiting for a clear signature input or confirmed visual traits.',
      SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES[0],
      SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES[1],
    ].join(' ');
  }

  return [
    'Signature Predicta context:',
    model.summary,
    `Observed traits: ${model.observedTraits
      .map(trait => `${trait.label} ${trait.value} (${trait.confidence}, ${trait.confirmationState})`)
      .join('; ')}.`,
    model.privacy.reportCopy,
    `What this can and cannot tell you: ${model.canAndCannotTellYou.join(' ')}`,
    `Writing rhythm: ${model.rhythm.summary} Care: ${model.rhythm.care}`,
    `Confidence expression: ${model.confidenceExpression.summary} Care: ${model.confidenceExpression.care}`,
    `Consistency: ${model.consistency.summary} Care: ${model.consistency.care}`,
    `Improvement plan: ${model.improvementPlan.join(' ')}`,
    `Synthesis rule: ${model.synthesisReadiness.rule}`,
    `Use safe language: ${SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES.join(' ')}`,
  ].join(' ');
}

function buildPendingSignatureAnalysisModel(
  inputSource: SignatureInputSource = 'manual-observation',
): SignatureAnalysisModel {
  return {
    cautions: [],
    evidence: ['Add a signature image, drawing, or confirmed visual traits to prepare a reading.'],
    inputSource,
    interpretationCards: [],
    confidenceExpression: {
      care: 'Confirm signature size, capital emphasis, and underline before reading confidence expression.',
      level: 'balanced',
      summary: 'Confidence expression is waiting for confirmed visual traits.',
    },
    limitations: [
      'Signature analysis needs visible signature traits before interpretation.',
      SIGNATURE_PRIVACY_COPY,
    ],
    method: {
      extraction: 'USER_CONFIRMED_VISUAL_TRAITS',
      interpretation: 'REFLECTIVE_SIGNATURE_ANALYSIS_RULES',
      safety: 'NO_FORENSIC_IDENTITY_OR_DIAGNOSIS',
    },
    observedTraits: [],
    consistency: {
      care: 'Confirm baseline, spacing, and letter connection before reading consistency.',
      level: 'variable',
      summary: 'Consistency profile is waiting for confirmed visual traits.',
    },
    improvementPlan: [
      'Confirm visible traits first, then choose one small signature improvement.',
    ],
    practicePrompts: [
      'Upload or draw a recent natural signature.',
      'Confirm the visible traits before asking for interpretation.',
    ],
    rhythm: {
      care: 'Confirm writing speed, pressure, and slant before reading rhythm.',
      pace: 'measured',
      summary: 'Writing rhythm is waiting for confirmed visual traits.',
    },
    safetyBoundaries: SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES,
    canAndCannotTellYou: SIGNATURE_CAN_AND_CANNOT_TELL_YOU,
    privacy: {
      reportCopy: SIGNATURE_REPORT_PRIVACY_COPY,
      sessionBehavior:
        'Raw signature images stay only in current in-memory interaction state. Closing or reloading may require re-upload or re-draw.',
      storage: 'raw-image-not-stored',
    },
    status: 'pending',
    strengths: [],
    synthesisReadiness: {
      numerology: 'needs-name-and-dob',
      rule:
        'Signature and Numerology can be compared only after name, date of birth, and confirmed signature traits are ready.',
    },
    suggestedQuestions: [
      'What signature traits should I confirm first?',
      'How does Signature Predicta read a signature safely?',
    ],
    summary: 'Signature reading is waiting for confirmed visual traits.',
  };
}

function buildInterpretationCard(
  observation: SignatureTraitObservation,
): SignatureInterpretationCard {
  const meaning = getTraitMeaning(observation.key, observation.value);

  return {
    caution:
      meaning?.caution ??
      'Keep this as a soft reflection, not a fixed judgment.',
    evidence: [observation.evidence],
    key: observation.key,
    plainMeaning:
      meaning?.meaning ??
      'can suggest a soft self-expression tendency when confirmed with context',
    title: meaning?.label ?? observation.label,
  };
}

function getTraitMeaning(
  key: SignatureTraitKey,
  value: SignatureTraitValue,
): SignatureTraitMeaning | undefined {
  return SIGNATURE_TRAIT_RULES[key].values[value];
}

function inferTraitConfidence(
  key: SignatureTraitKey,
  value: SignatureTraitValue,
): SignatureTraitObservation['confidence'] {
  if (
    key === 'pressure' ||
    key === 'speed' ||
    value === 'mixed' ||
    value === 'partial'
  ) {
    return 'partial';
  }

  if (value === 'abstract') {
    return 'uncertain';
  }

  return 'clear';
}

function buildPracticePrompts(
  observedTraits: SignatureTraitObservation[],
): string[] {
  const prompts = [
    'Write the signature three times slowly and notice which version feels natural, not forced.',
    'Keep one version for daily use and one practice version for confidence work.',
  ];

  if (observedTraits.some(trait => trait.key === 'baseline' && trait.value === 'downward')) {
    prompts.push('Practice a steady baseline for one week and observe whether finishing energy improves.');
  }

  if (observedTraits.some(trait => trait.key === 'legibility' && trait.value === 'abstract')) {
    prompts.push('Try one slightly clearer version for professional situations where trust and clarity matter.');
  }

  if (observedTraits.some(trait => trait.key === 'pressure' && trait.value === 'heavy')) {
    prompts.push('Use a lighter grip for a few practice signatures to reduce unnecessary strain.');
  }

  return prompts;
}

function buildWritingRhythm(
  observedTraits: SignatureTraitObservation[],
): SignatureAnalysisModel['rhythm'] {
  const speed = findTrait(observedTraits, 'speed');
  const pressure = findTrait(observedTraits, 'pressure');
  const slant = findTrait(observedTraits, 'slant');

  if (speed?.value === 'fast' || pressure?.value === 'heavy') {
    return {
      care:
        'Slow down before important signatures, agreements, or emotional decisions so speed does not become pressure.',
      pace: 'fast',
      summary:
        'The signature rhythm looks active and forceful; it can show quick response and strong effort.',
    };
  }

  if (speed?.value === 'slow' || slant?.value === 'left') {
    return {
      care:
        'Use deliberate pace as a strength, but do not let caution delay necessary action.',
      pace: 'calm',
      summary:
        'The signature rhythm looks careful and inward; it can show thoughtfulness and protected expression.',
    };
  }

  if (speed?.value === 'moderate' || pressure?.value === 'medium') {
    return {
      care:
        'Keep the same rhythm across repeated signatures so the public mark feels stable.',
      pace: 'measured',
      summary:
        'The signature rhythm looks measured; it can show controlled timing and steady effort.',
    };
  }

  return {
    care:
      'Confirm speed, pressure, and slant from a recent natural signature before making rhythm claims.',
    pace: 'variable',
    summary:
      'The rhythm signal is incomplete; more confirmed traits are needed for a sharper reading.',
  };
}

function buildConfidenceExpression(
  observedTraits: SignatureTraitObservation[],
): SignatureAnalysisModel['confidenceExpression'] {
  const size = findTrait(observedTraits, 'signature-size');
  const capital = findTrait(observedTraits, 'capital-emphasis');
  const underline = findTrait(observedTraits, 'underline');
  const flourish = findTrait(observedTraits, 'flourish');

  if (
    size?.value === 'large' ||
    capital?.value === 'high' ||
    underline?.value === 'high' ||
    flourish?.value === 'expansive'
  ) {
    return {
      care:
        'Keep the visible confidence supported by follow-through, clarity, and humility.',
      level: 'visible',
      summary:
        'The signature projects visible confidence and a stronger public mark.',
    };
  }

  if (size?.value === 'small' || capital?.value === 'low') {
    return {
      care:
        'Practice a slightly clearer and more visible version for moments where trust and presence matter.',
      level: 'reserved',
      summary:
        'The signature expresses confidence more privately, with restraint and selective visibility.',
    };
  }

  return {
    care:
      'Use a clean, repeatable version so confidence feels natural rather than forced.',
    level: 'balanced',
    summary:
      'The confidence expression looks balanced or still needs more confirmed traits.',
  };
}

function buildConsistencyProfile(
  observedTraits: SignatureTraitObservation[],
): SignatureAnalysisModel['consistency'] {
  const baseline = findTrait(observedTraits, 'baseline');
  const spacing = findTrait(observedTraits, 'spacing');
  const connection = findTrait(observedTraits, 'letter-connection');
  const slant = findTrait(observedTraits, 'slant');

  if (
    baseline?.value === 'steady' &&
    spacing?.value === 'balanced' &&
    connection?.value !== 'mixed'
  ) {
    return {
      care:
        'Steady presentation still needs flexibility when the situation changes.',
      level: 'steady',
      summary:
        'The signature has a stable structure and can show repeatable self-presentation.',
    };
  }

  if (
    baseline?.value === 'mixed' ||
    slant?.value === 'mixed' ||
    connection?.value === 'mixed'
  ) {
    return {
      care:
        'Choose one consistent practice version for important documents and professional settings.',
      level: 'variable',
      summary:
        'The signature shows changing rhythm, which can feel adaptable but inconsistent.',
    };
  }

  return {
    care:
      'Keep enough structure that the signature remains recognizable across repeated use.',
    level: 'flexible',
    summary:
      'The consistency profile is flexible; it can adapt but should remain recognizable.',
  };
}

function buildImprovementPlan(
  observedTraits: SignatureTraitObservation[],
  rhythm: SignatureAnalysisModel['rhythm'],
  confidenceExpression: SignatureAnalysisModel['confidenceExpression'],
  consistency: SignatureAnalysisModel['consistency'],
): string[] {
  const plan = [
    'Keep the signature natural; do not force a new style suddenly.',
    rhythm.care,
    confidenceExpression.care,
    consistency.care,
  ];

  if (
    observedTraits.some(
      trait => trait.key === 'legibility' && trait.value !== 'clear',
    )
  ) {
    plan.push(
      'Make one professional version slightly clearer so important people can read your intent.',
    );
  }

  if (
    observedTraits.some(
      trait => trait.key === 'spacing' && trait.value === 'tight',
    )
  ) {
    plan.push(
      'Add a little breathing room between name parts to reduce visual pressure.',
    );
  }

  if (
    observedTraits.some(
      trait => trait.key === 'baseline' && trait.value === 'downward',
    )
  ) {
    plan.push(
      'Practice a steadier baseline for one week and compare how it feels.',
    );
  }

  return uniqueList(plan).slice(0, 6);
}

function findTrait(
  observedTraits: SignatureTraitObservation[],
  key: SignatureTraitKey,
): SignatureTraitObservation | undefined {
  return observedTraits.find(trait => trait.key === key);
}

function uniqueList(items: string[]): string[] {
  return [...new Set(items)];
}
