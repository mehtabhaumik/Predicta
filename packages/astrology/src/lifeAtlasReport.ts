import type {
  KundliData,
  LifeAtlasDepth,
  LifeAtlasEvidenceLayer,
  LifeAtlasReport,
  LifeAtlasReportSection,
  SignatureAnalysisModel,
} from '@pridicta/types';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { composeNadiJyotishPlan } from './nadiJyotishPlan';
import { composeNumerologyFoundationModel } from './numerologyFoundationModel';
import { composePurusharthaLifeBalance } from './purusharthaLifeBalance';

export const LIFE_ATLAS_MISSING_SIGNATURE_NOTE =
  'Signature expression layer was not included because no signature sample was provided.';

export const LIFE_ATLAS_SIGNATURE_ENRICHMENT_INVITE =
  'Add your signature to enrich the expression and self-presentation layer.';

type LifeAtlasOptions = {
  depth?: LifeAtlasDepth;
  signatureAnalysis?: SignatureAnalysisModel;
};

export function composeLifeAtlasReport(
  kundli?: KundliData,
  options: LifeAtlasOptions = {},
): LifeAtlasReport {
  const depth = options.depth ?? 'FREE';

  if (!kundli) {
    return buildPendingLifeAtlas(depth);
  }

  const numerology =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  const kp = composeChalitBhavKpFoundation(kundli, { depth }).kp;
  const nadi = composeNadiJyotishPlan(kundli, { depth });
  const purushartha = composePurusharthaLifeBalance(kundli);
  const signatureReady = options.signatureAnalysis?.status === 'ready';
  const signatureNote = signatureReady
    ? 'Signature expression layer was included from confirmed visible traits in this session.'
    : LIFE_ATLAS_MISSING_SIGNATURE_NOTE;
  const numberTone =
    numerology.status === 'ready'
      ? numerology.identityDashboard.lifeThemeSentence
      : 'The number pattern is pending name and birth-date readiness.';
  const hiddenThread = buildHiddenThread({
    numberTone,
    purusharthaLead: humanizeLifeAim(purushartha.dominant.label),
  });
  const currentFocus = buildCurrentFocus({
    purusharthaCare: humanizeLifeAim(purushartha.needsCare.label),
  });
  const lifeThemeSentence =
    numerology.status === 'ready'
      ? numerology.identityDashboard.lifeThemeSentence
      : 'Your available Predicta data points toward a life that matures through self-understanding, timing, responsibility, and conscious choice.';
  const evidenceLayers = buildEvidenceLayers({
    kpSummary: kp.digest.latestReportSummary,
    nadiSummary: nadi.digest.latestReportSummary,
    numerologyReady: numerology.status === 'ready',
    numberTone,
    signatureReady,
  });
  const sections = buildLifeAtlasSections({
    currentFocus,
    depth,
    hiddenThread,
    lifeThemeSentence,
    nadiPractice:
      'Validate the repeating pattern in real life before drawing conclusions, then choose one calmer response when it appears again.',
    numberCycle:
      numerology.status === 'ready'
        ? numerology.identityDashboard.bestUseOfCurrentCycle
        : 'Use this phase for steady observation until the number layer is ready.',
    purusharthaCare: humanizeLifeAim(purushartha.needsCare.label),
    purusharthaLead: humanizeLifeAim(purushartha.dominant.label),
    signatureNote,
  });

  return {
    currentFocus,
    depth,
    evidenceLayers,
    freePromise:
      'Free Life Atlas gives a useful soul portrait, life journey summary, current chapter, top gifts, top lessons, focus-now guidance, and a closing letter.',
    guardrails: buildLifeAtlasGuardrails(),
    hiddenThread,
    lifeThemeSentence,
    limitations: [
      'Predicta Life Atlas is reflective guidance, not a guarantee of fixed fate.',
      'It does not claim Akashic Records, palm-leaf manuscripts, spirit guides, or divine archives.',
      'It avoids raw technical proof in the main reading so the report stays human and understandable.',
      signatureReady
        ? 'Signature enrichment used only confirmed visible traits from this session.'
        : LIFE_ATLAS_MISSING_SIGNATURE_NOTE,
    ],
    memoryDigest: {
      activeKundliId: kundli.id,
      dataPoweredBy: evidenceLayers
        .filter(layer => layer.status === 'ready')
        .map(layer => layer.label),
      omittedData: evidenceLayers
        .filter(layer => layer.status !== 'ready')
        .map(layer => layer.label),
      reportBoundary:
        'Predicta Life Atlas is the approved all-school synthesis report. Vedic, KP, Nadi, Numerology, and Signature reports remain separate.',
      userCanAsk: [
        'What is my Life Atlas report?',
        'How is this different from my Vedic report?',
        'Why does this report use multiple schools?',
        'Why is signature not included?',
        'What does my hidden thread mean?',
        'What should I focus on now?',
        'What changes in Premium?',
      ],
    },
    name: 'Predicta Life Atlas',
    ownerName: kundli.birthDetails.name,
    positioning:
      'Predicta Life Atlas is a mystical, emotional, practical, non-technical life report.',
    premiumPromise:
      'Premium Life Atlas adds deep life journey narrative, soul-purpose synthesis, love/work/money/purpose guidance, karmic pattern map, shadow-to-gift transformation, integration practices, and a sacred closing letter.',
    sections,
    signatureNote,
    status: 'ready',
    synthesisFraming: signatureReady
      ? 'Predicta synthesized your birth profile, timing rhythm, number pattern, and available expression signals into one life story.'
      : 'Predicta synthesized your birth profile, timing rhythm, and number pattern into one life story.',
  };
}

function buildPendingLifeAtlas(depth: LifeAtlasDepth): LifeAtlasReport {
  return {
    currentFocus: 'Create or select a Kundli before Predicta prepares the Life Atlas.',
    depth,
    evidenceLayers: [
      {
        id: 'vedic',
        label: 'Vedic',
        role: 'Life architecture and current chapter',
        status: 'missing',
        summary: 'Birth details are required.',
      },
      {
        id: 'kp',
        label: 'KP',
        role: 'Concrete decision zones and timing confidence',
        status: 'missing',
        summary: 'Kundli preparation is required.',
      },
      {
        id: 'nadi',
        label: 'Nadi',
        role: 'Story links and repeated karmic themes',
        status: 'missing',
        summary: 'Kundli preparation is required.',
      },
      {
        id: 'numerology',
        label: 'Numerology',
        role: 'Name rhythm and life-path tone',
        status: 'missing',
        summary: 'Name and birth date are required.',
      },
      {
        id: 'signature',
        label: 'Signature',
        role: 'Optional expression enrichment',
        status: 'optional',
        summary: LIFE_ATLAS_MISSING_SIGNATURE_NOTE,
      },
    ],
    freePromise:
      'Free Life Atlas becomes useful after a Kundli/profile exists.',
    guardrails: buildLifeAtlasGuardrails(),
    hiddenThread: 'Pending calculated profile.',
    lifeThemeSentence: 'Create a Kundli before Predicta writes a life story.',
    limitations: [
      'No Kundli/profile is active.',
      LIFE_ATLAS_MISSING_SIGNATURE_NOTE,
    ],
    memoryDigest: {
      dataPoweredBy: [],
      omittedData: ['Vedic', 'KP', 'Nadi', 'Numerology', 'Signature'],
      reportBoundary:
        'Predicta Life Atlas is the approved all-school synthesis report. School-specific reports remain separate.',
      userCanAsk: ['What is my Life Atlas report?', 'What data is missing?'],
    },
    name: 'Predicta Life Atlas',
    ownerName: 'Predicta User',
    positioning:
      'Predicta Life Atlas is a mystical, emotional, practical, non-technical life report.',
    premiumPromise:
      'Premium Life Atlas adds depth after the profile is ready.',
    sections: [],
    signatureNote: LIFE_ATLAS_MISSING_SIGNATURE_NOTE,
    status: 'pending',
    synthesisFraming:
      'Predicta needs a birth profile and number pattern before preparing this life story.',
  };
}

function buildEvidenceLayers({
  kpSummary,
  nadiSummary,
  numerologyReady,
  numberTone,
  signatureReady,
}: {
  kpSummary: string;
  nadiSummary: string;
  numerologyReady: boolean;
  numberTone: string;
  signatureReady: boolean;
}): LifeAtlasEvidenceLayer[] {
  return [
    {
      id: 'vedic',
      label: 'Vedic',
      role: 'Life architecture, soul-purpose direction, current chapter, and timing rhythm.',
      status: 'ready',
      summary:
        'Birth profile and calculated Kundli are available as the inner architecture layer.',
    },
    {
      id: 'kp',
      label: 'KP',
      role: 'Concrete decision zones, event-readiness, and practical timing confidence.',
      status: 'ready',
      summary: kpSummary,
    },
    {
      id: 'nadi',
      label: 'Nadi',
      role: 'Story links, repeated karmic themes, and validation-aware narrative.',
      status: 'ready',
      summary: nadiSummary,
    },
    {
      id: 'numerology',
      label: 'Numerology',
      role: 'Name rhythm, destiny number, life-path tone, and personal cycle language.',
      status: numerologyReady ? 'ready' : 'missing',
      summary: numberTone,
    },
    {
      id: 'signature',
      label: 'Signature',
      role: 'Optional outer-expression and self-presentation enrichment.',
      status: signatureReady ? 'ready' : 'optional',
      summary: signatureReady
        ? 'Confirmed visible signature traits are available for expression enrichment.'
        : LIFE_ATLAS_MISSING_SIGNATURE_NOTE,
    },
  ];
}

function buildLifeAtlasSections({
  currentFocus,
  depth,
  hiddenThread,
  lifeThemeSentence,
  nadiPractice,
  numberCycle,
  purusharthaCare,
  purusharthaLead,
  signatureNote,
}: {
  currentFocus: string;
  depth: LifeAtlasDepth;
  hiddenThread: string;
  lifeThemeSentence: string;
  nadiPractice: string;
  numberCycle: string;
  purusharthaCare: string;
  purusharthaLead: string;
  signatureNote: string;
}): LifeAtlasReportSection[] {
  const premium = depth === 'PREMIUM';
  const sections: LifeAtlasReportSection[] = [
    {
      body:
        'Your Life Atlas begins by translating the available Predicta signals into a human portrait: how you carry pressure, where your path asks for maturity, and what kind of inner direction keeps returning.',
      bullets: [
        lifeThemeSentence,
        `Your present pattern is asking for ${purusharthaLead.toLowerCase()} to lead with more grace.`,
        premium
          ? 'Premium expands this opening into a fuller portrait with emotional texture, repeating life chapters, and practical integration.'
          : 'Free keeps the portrait clear and useful without turning it into a teaser.',
      ],
      evidence: ['Synthesized from the available Predicta birth profile, timing rhythm, number pattern, and story layer.'],
      id: 'opening-soul-portrait',
      tier: 'free',
      title: 'Opening Soul Portrait',
    },
    {
      body:
        'This life appears to invite you toward steadier self-trust, wiser responsibility, and a deeper ability to turn pressure into meaningful contribution.',
      bullets: [
        'Your purpose is not framed as one fixed job or one fixed outcome.',
        'The clearer invitation is to become more conscious, useful, and internally aligned as life matures.',
        premium
          ? 'Premium adds the deeper soul-purpose synthesis and shows how the same theme repeats across relationships, work, money, family, and inner healing.'
          : 'Free gives the core purpose tone in plain language.',
      ],
      evidence: ['Purpose is synthesized as a life-language pattern, not as raw technical proof.'],
      id: 'why-you-came-here',
      tier: 'free',
      title: 'Why You Came Here',
    },
    {
      body:
        'Your life journey reads like a path from instinctive survival and early shaping into a more deliberate form of authorship. The work is to stop only reacting to pressure and begin designing from it.',
      bullets: [
        'Childhood imprint: learning what safety, approval, or belonging required.',
        'Growth path: turning effort into identity instead of exhaustion.',
        'Future arc: maturity through clearer choices, cleaner boundaries, and more grounded courage.',
      ],
      evidence: ['Life journey arc uses broad timing rhythm and repeated-story signals without exposing technical mechanics.'],
      id: 'life-journey-arc',
      tier: premium ? 'premium' : 'free',
      title: 'Your Life Journey Arc',
    },
    {
      body:
        'Life keeps steering you toward a direction where self-respect, service, discipline, and meaningful visibility must work together instead of fighting each other.',
      bullets: [
        `Destiny direction: ${lifeThemeSentence}`,
        'Resistance pattern: delaying your own authority until every condition feels perfectly safe.',
        premium
          ? 'Premium maps the shadow-to-gift path so the repeated pattern becomes usable instead of tiring.'
          : 'Free names the main direction and the most practical point of resistance.',
      ],
      evidence: ['Destiny pattern is framed as direction and invitation, not fixed fate.'],
      id: 'destiny-pattern',
      tier: 'free',
      title: 'Destiny Pattern',
    },
    {
      body: currentFocus,
      bullets: [
        `Lead with ${purusharthaLead.toLowerCase()}; care for ${purusharthaCare.toLowerCase()}.`,
        numberCycle,
        'Do not confuse delay with denial; this chapter works better when you refine your response.',
      ],
      evidence: ['Current chapter is synthesized from available timing rhythm, life-balance signal, and number cycle.'],
      id: 'current-life-chapter',
      tier: 'free',
      title: 'Current Life Chapter',
    },
    {
      body:
        'The gifts you carry are not only talents. They are survival skills that can become wisdom when used with intention.',
      bullets: [
        'Gift one: seeing patterns that others miss.',
        'Gift two: rebuilding after pressure with more maturity than before.',
        'Gift three: guiding others once your own rhythm becomes steady.',
        premium
          ? 'Premium expands the gifts into leadership, love, work, money, purpose, and self-expression applications.'
          : 'Free gives the top three gifts clearly.',
      ],
      evidence: ['Gift language is synthesized from the strongest available identity, story, and number signals.'],
      id: 'gifts-you-carry',
      tier: 'free',
      title: 'Gifts You Carry',
    },
    {
      body:
        'The karmic lesson is not punishment. It is the repeating classroom where your awareness becomes stronger than your old reflex.',
      bullets: [
        'Lesson one: respond instead of proving yourself through pressure.',
        'Lesson two: let boundaries protect tenderness rather than harden it.',
        'Lesson three: choose consistency before intensity.',
        premium
          ? 'Premium turns these into a karmic pattern map with shadow-to-gift transformation and integration practices.'
          : 'Free keeps the lessons practical and non-frightening.',
      ],
      evidence: ['Karmic language is kept reflective and non-fatalistic.'],
      id: 'karmic-lessons',
      tier: 'free',
      title: 'Karmic Lessons',
    },
    {
      body:
        'Love, work, money, and purpose are treated as one life ecosystem. When one area becomes reactive, the others often ask for calmer structure.',
      bullets: [
        'Love: practice honest closeness without losing your center.',
        'Work: build visible value through disciplined contribution.',
        'Money: use structure to reduce emotional decision-making.',
        'Purpose: let service and self-respect grow together.',
      ],
      evidence: ['Major life-area guidance stays non-technical and practical.'],
      id: 'love-work-money-purpose',
      tier: premium ? 'premium' : 'free',
      title: 'Love, Work, Money, Purpose',
    },
    {
      body: hiddenThread,
      bullets: [
        'This is the wow line that ties the reading together.',
        'When you remember this thread, separate problems begin to feel like one understandable pattern.',
        premium
          ? 'Premium deepens this into a personal chapter with examples, cautions, practices, and future maturation cues.'
          : 'Free gives the hidden thread in one memorable form.',
      ],
      evidence: ['Hidden Thread uses the approved Life Atlas synthesis path only.'],
      id: 'hidden-thread',
      tier: 'free',
      title: 'The Hidden Thread',
    },
    {
      body:
        'What is intended for you is not a forced destiny. It is a more aligned version of your life where your gifts are used cleanly, your timing is respected, and your energy is no longer spent fighting your own growth.',
      bullets: [
        'More alignment, less self-betrayal.',
        'More meaningful contribution, less scattered proving.',
        'More calm responsibility, less fear-led urgency.',
      ],
      evidence: ['Future language is hopeful and grounded, not guaranteed.'],
      id: 'what-is-intended',
      tier: 'free',
      title: 'What Is Intended For You',
    },
    {
      body:
        'The next 12 to 24 months are best used as a refinement period: make the path cleaner, reduce avoidable drama, and take practical steps that your future self can build on.',
      bullets: [
        'Start what needs clean structure.',
        'Repair what still leaks energy.',
        'Wait where impatience would create a mess.',
        premium
          ? 'Premium turns this into a deeper integration calendar without pretending exact events are guaranteed.'
          : 'Free gives the current focus without technical timing language.',
      ],
      evidence: ['Timing is stated as guidance and readiness, not certainty.'],
      id: 'next-12-24-months',
      tier: 'free',
      title: 'Next 12-24 Months',
    },
    {
      body:
        'Soul practices are the bridge between insight and change. They are simple, repeatable actions that help the reading become lived, not merely admired.',
      bullets: [
        nadiPractice,
        'Journal the same repeating lesson for seven days before trying to solve it.',
        'Choose one weekly act of service, repair, or discipline that makes your life cleaner.',
        signatureNote,
      ],
      evidence: ['Practices are behavior-first and safe; they do not replace professional care or personal agency.'],
      id: 'soul-practices',
      tier: 'free',
      title: 'Soul Practices',
    },
    {
      body:
        'Dear one, your path does not need to become louder to become more powerful. It needs to become truer. Let this report be a mirror, not a cage. Use what feels honest, test it through action, and keep choosing the version of yourself that can hold both softness and strength.',
      bullets: [
        premium
          ? 'Premium closing letter is written to feel personal, sacred, and memorable.'
          : 'Free closing letter stays warm, useful, and complete.',
      ],
      evidence: ['The closing letter preserves agency and avoids fear.'],
      id: 'final-letter',
      tier: 'free',
      title: 'Final Letter From Predicta',
    },
  ];

  if (premium) {
    sections.push({
      body:
        'Predicta built this reading from available birth profile intelligence, timing rhythm, Nadi-style story intelligence, number pattern, and optional confirmed expression signals. The main reading hides raw proof so the Life Atlas stays human.',
      bullets: [
        'Vedic: life architecture, current chapter, dharma direction, and timing rhythm.',
        'KP: practical decision zones and timing confidence, translated without cusp jargon.',
        'Nadi: repeated story thread, validation-aware pattern, and practice direction.',
        'Numerology: name rhythm, life-path tone, and personal cycle language.',
        signatureNote,
      ],
      evidence: [
        'Appendix remains user-friendly and technical-light by contract.',
        'School-specific reports remain separate from Life Atlas.',
      ],
      id: 'how-predicta-built-this-reading',
      tier: 'premium',
      title: 'How Predicta Built This Reading',
    });
  }

  return sections;
}

function buildHiddenThread({
  numberTone,
  purusharthaLead,
}: {
  numberTone: string;
  purusharthaLead: string;
}): string {
  return `The hidden thread is this: your life keeps asking you to turn ${purusharthaLead.toLowerCase()} into mature self-direction, while repeated pressure becomes clearer only when you pause, validate the pattern, and respond differently. The number rhythm adds: ${numberTone}`;
}

function buildCurrentFocus({
  purusharthaCare,
}: {
  purusharthaCare: string;
}): string {
  return `Your current chapter is asking you to make ${purusharthaCare.toLowerCase()} cleaner and more conscious. The repeating lesson underneath it is to stop treating familiar pressure as a life sentence and start treating it as a practice ground.`;
}

function buildLifeAtlasGuardrails(): string[] {
  return [
    'Predicta Life Atlas does not claim Akashic Records, palm-leaf manuscripts, spirit guides, divine archives, or any unsupported source.',
    'It does not guarantee events, fixed destiny, death, illness, wealth, marriage, divorce, childbirth, or irreversible outcomes.',
    'It uses mystical but grounded language and preserves user agency.',
    'Signature traits are included only when a real signature sample or confirmed manual observation exists.',
    'School-specific reports stay separate; Life Atlas is the approved all-school synthesis path.',
  ];
}

function humanizeLifeAim(label: string): string {
  const normalized = label.toLowerCase();

  if (normalized.includes('dharma')) {
    return 'purpose and right action';
  }
  if (normalized.includes('artha')) {
    return 'security, skill, and meaningful resources';
  }
  if (normalized.includes('kama')) {
    return 'love, joy, and healthy desire';
  }
  if (normalized.includes('moksha')) {
    return 'release, peace, and inner freedom';
  }

  return label;
}
