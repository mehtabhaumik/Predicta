import type {
  KundliData,
  LifeAtlasDepth,
  LifeAtlasEvidenceLayer,
  LifeAtlasReport,
  LifeAtlasReportSection,
  SignatureAnalysisModel,
} from '@pridicta/types';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { composeJaiminiInterpretation } from './jaiminiInterpretation';
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

type JaiminiLifeAtlasContribution = {
  soulRole: string;
  visibleIdentity: string;
  careerDharma: string;
  relationshipMirror: string;
  currentDestinyChapter: string;
  practice: string;
  appendixEvidence: string[];
  synthesisSummary: string;
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
  const jaimini = composeJaiminiInterpretation(kundli, {
    premium: depth === 'PREMIUM',
  });
  const jaiminiContribution = buildJaiminiLifeAtlasContribution(jaimini);
  const purushartha = composePurusharthaLifeBalance(kundli);
  const firstName = kundli.birthDetails.name.split(/\s+/)[0] || kundli.birthDetails.name;
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
  const timingTone = buildTimingTone(kundli);
  const lifeThemeSentence =
    numerology.status === 'ready'
      ? numerology.identityDashboard.lifeThemeSentence
      : 'Your available Predicta data points toward a life that matures through self-understanding, timing, responsibility, and conscious choice.';
  const evidenceLayers = buildEvidenceLayers({
    jaiminiAppendixEvidence: jaiminiContribution.appendixEvidence,
    jaiminiSummary: jaiminiContribution.synthesisSummary,
    kpSummary: kp.digest.latestReportSummary,
    numerologyReady: numerology.status === 'ready',
    numberTone,
    signatureReady,
  });
  const sections = buildLifeAtlasSections({
    currentFocus,
    depth,
    firstName,
    hiddenThread,
    jaiminiContribution,
    kpSummary: kp.digest.latestReportSummary,
    lifeThemeSentence,
    numberCycle:
      numerology.status === 'ready'
        ? numerology.identityDashboard.bestUseOfCurrentCycle
        : 'Use this phase for steady observation until the number layer is ready.',
    purusharthaCare: humanizeLifeAim(purushartha.needsCare.label),
    purusharthaLead: humanizeLifeAim(purushartha.dominant.label),
    signatureNote,
    timingTone,
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
        'Predicta Life Atlas is the approved all-school synthesis report. Vedic, KP, Jaimini, Numerology, and Signature reports remain separate.',
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
      'Predicta Life Atlas is a personal life map: mystical in tone, practical in use, and written without asking you to decode astrology jargon.',
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

function buildJaiminiLifeAtlasContribution(
  jaimini: ReturnType<typeof composeJaiminiInterpretation>,
): JaiminiLifeAtlasContribution {
  const blockById = (id: string) => jaimini.blocks.find(block => block.id === id);
  const soulRole = humanizeJaiminiBlock(blockById('soul-planet-reading'));
  const visibleIdentity = humanizeJaiminiBlock(blockById('visible-identity-reading'));
  const careerDharma = humanizeJaiminiBlock(blockById('career-dharma-reading'));
  const relationshipMirror = humanizeJaiminiBlock(blockById('relationship-mirror-reading'));
  const currentDestinyChapter = humanizeJaiminiBlock(blockById('current-destiny-chapter'));
  const focusNow = humanizeJaiminiBlock(blockById('what-to-focus-on-now'));

  return {
    appendixEvidence: jaimini.technicalEvidence,
    careerDharma,
    currentDestinyChapter,
    practice:
      focusNow ||
      'Choose one calmer decision that makes your duty, visibility, work direction, and relationships cleaner.',
    relationshipMirror,
    soulRole,
    synthesisSummary: [
      `Soul role: ${soulRole}`,
      `Visible identity: ${visibleIdentity}`,
      `Career dharma: ${careerDharma}`,
      `Relationship mirror: ${relationshipMirror}`,
      `Current destiny chapter: ${currentDestinyChapter}`,
    ].join(' '),
    visibleIdentity,
  };
}

function humanizeJaiminiBlock(
  block: ReturnType<typeof composeJaiminiInterpretation>['blocks'][number] | undefined,
): string {
  if (!block) {
    return 'This layer stays careful until calculated Jaimini evidence is ready.';
  }

  return `${block.headline} ${block.guidance}`.replace(/\s+/g, ' ').trim();
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
        id: 'jaimini',
        label: 'Jaimini',
        role: 'Soul-role, visible identity, relationship mirror, and destiny chapter signals',
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
      omittedData: ['Vedic', 'KP', 'Jaimini', 'Numerology', 'Signature'],
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
  jaiminiSummary,
  jaiminiAppendixEvidence,
  kpSummary,
  numerologyReady,
  numberTone,
  signatureReady,
}: {
  jaiminiSummary: string;
  jaiminiAppendixEvidence: string[];
  kpSummary: string;
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
      id: 'jaimini',
      label: 'Jaimini',
      role: 'Soul role, visible identity, relationship mirror, career dharma, and destiny chapters.',
      status: 'ready',
      summary: jaiminiSummary,
      technicalEvidence: jaiminiAppendixEvidence,
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
  firstName,
  hiddenThread,
  jaiminiContribution,
  kpSummary,
  lifeThemeSentence,
  numberCycle,
  purusharthaCare,
  purusharthaLead,
  signatureNote,
  timingTone,
}: {
  currentFocus: string;
  depth: LifeAtlasDepth;
  firstName: string;
  hiddenThread: string;
  jaiminiContribution: JaiminiLifeAtlasContribution;
  kpSummary: string;
  lifeThemeSentence: string;
  numberCycle: string;
  purusharthaCare: string;
  purusharthaLead: string;
  signatureNote: string;
  timingTone: string;
}): LifeAtlasReportSection[] {
  const premium = depth === 'PREMIUM';
  const sections: LifeAtlasReportSection[] = [
    {
      body:
        `${firstName}, the immediate pattern is clear: your life works best when purpose, structure, and emotional honesty are kept in the same room. You are not here only to survive pressure; you are here to become the person who can turn pressure into cleaner choices, steadier work, and more conscious relationships.`,
      bullets: [
        `Primary life tone: ${lifeThemeSentence}`,
        `Current timing weather: ${timingTone}`,
        `Best current use: ${numberCycle}`,
        `Core integration: let ${purusharthaLead.toLowerCase()} lead without abandoning ${purusharthaCare.toLowerCase()}.`,
      ],
      evidence: [
        `Life theme: ${lifeThemeSentence}`,
        `Current timing tone: ${timingTone}`,
      ],
      id: 'personal-snapshot',
      tier: 'free',
      title: 'Personal Snapshot',
    },
    {
      body:
        `${firstName}, your Life Atlas does not begin with planets. It begins with the pattern your life keeps repeating: pressure arrives, your inner compass sharpens, and you are asked to become more deliberate instead of merely stronger. The deeper message is not that life is against you; it is that your soul learns fastest when responsibility, love, and self-direction are brought into the same room.`,
      bullets: [
        `Core life sentence: ${lifeThemeSentence}`,
        `What your current season is asking for: let ${purusharthaLead.toLowerCase()} lead, but do not neglect ${purusharthaCare.toLowerCase()}.`,
        'The mirror: stop proving your worth through pressure; start choosing your response before pressure chooses it for you.',
        premium
          ? 'Premium expands this portrait into childhood patterning, relationship mirrors, work identity, timing rhythm, and integration practices.'
          : 'Free keeps the portrait complete enough to feel useful, not like a teaser.',
      ],
      evidence: [
        `Life theme: ${lifeThemeSentence}`,
        `Current chapter: ${currentFocus}`,
      ],
      id: 'opening-soul-portrait',
      tier: 'free',
      title: 'Opening Soul Portrait',
    },
    {
      body:
        `Strategically, this Life Atlas says your growth is not random. It moves through a repeatable sequence: you notice a pattern, you try to carry too much of it alone, then life asks you to build a cleaner system around it. The winning move is not intensity. The winning move is precision: name the pressure, choose the next honest action, and protect the rhythm that makes that action repeatable.`,
      bullets: [
        'Main strength: seeing structure inside emotional or practical complexity.',
        'Main risk: treating urgency as destiny and overcommitting before the inner signal is settled.',
        'Best correction: slower decisions, clearer boundaries, and one practical next step instead of five dramatic ones.',
        premium
          ? 'Premium expands this abstract into relationship, work, money, timing, and shadow-to-gift chapters.'
          : 'Free gives the strategic shape so the report feels usable immediately.',
      ],
      evidence: [
        `KP practical signal: ${kpSummary}`,
        `Jaimini soul-role signal: ${jaiminiContribution.soulRole}`,
      ],
      id: 'strategic-life-abstract',
      tier: 'free',
      title: 'Strategic Life Abstract',
    },
    {
      body:
        `${firstName}, the Jaimini layer in this Life Atlas points to a life that wants the inner role and the outer signal to stop fighting each other. This layer carries five signals: Soul role, Visible identity, Career dharma, Relationship mirror, and Current destiny chapter. The repeated invitation is to act from the role your soul keeps rehearsing, become easier to trust publicly, choose work that carries real direction, and let relationships reveal where maturity is still being built.`,
      bullets: [
        `Soul role: ${jaiminiContribution.soulRole}`,
        `Visible identity: ${jaiminiContribution.visibleIdentity}`,
        `Career dharma: ${jaiminiContribution.careerDharma}`,
        `Relationship mirror: ${jaiminiContribution.relationshipMirror}`,
        `Current destiny chapter: ${jaiminiContribution.currentDestinyChapter}`,
      ],
      evidence: [
        'Jaimini is used here as life-language: role, visibility, work direction, relationship mirror, and active chapter.',
        `Jaimini synthesis: ${jaiminiContribution.synthesisSummary}`,
      ],
      id: 'jaimini-destiny-thread',
      tier: 'free',
      title: 'Jaimini Destiny Thread',
    },
    {
      body:
        'This life appears to invite you to turn intensity into clean purpose. Your path is not about escaping duty or becoming hard; it is about learning how to carry power without losing softness, how to build stability without becoming trapped by it, and how to make your choices more conscious than your old reflexes.',
      bullets: [
        'Your soul purpose is not one fixed job. It is a way of becoming: useful, self-respecting, emotionally cleaner, and harder to knock off center.',
        `The practical doorway is ${purusharthaLead.toLowerCase()}; the growth edge is caring for ${purusharthaCare.toLowerCase()} without delay.`,
        'When you are aligned, your life works best through mature contribution rather than dramatic proving.',
        premium
          ? 'Premium traces how this purpose repeats through family patterns, work choices, love, money, and private healing.'
          : 'Free gives the central purpose tone in plain language.',
      ],
      evidence: [
        `Purpose lead: ${purusharthaLead}`,
        `Purpose care point: ${purusharthaCare}`,
      ],
      id: 'why-you-came-here',
      tier: 'free',
      title: 'Why You Came Here',
    },
    {
      body:
        'Your life journey reads like a movement from survival intelligence into authorship. Earlier chapters may have trained you to watch the room, carry more than you named, or wait until the conditions felt safe. The maturing arc is different: build the room, name the pattern, and stop asking life for permission to become steady.',
      bullets: [
        'Early imprint: learning what safety, approval, or belonging required before your own rhythm could relax.',
        'Growth path: turning effort into identity without letting exhaustion become your personality.',
        'Future arc: clearer choices, cleaner boundaries, visible competence, and courage that does not need noise.',
      ],
      evidence: [
        `Jaimini destiny signal: ${jaiminiContribution.currentDestinyChapter}`,
        `Timing rhythm: ${numberCycle}`,
      ],
      id: 'life-journey-arc',
      tier: premium ? 'premium' : 'free',
      title: 'Your Life Journey Arc',
    },
    {
      body:
        'Life keeps steering you toward a direction where self-respect, service, discipline, and meaningful visibility have to work together. Whenever one of these is missing, the same lesson returns in another costume. The destiny pattern is not punishment; it is repetition asking to become wisdom.',
      bullets: [
        `Destiny direction: ${lifeThemeSentence}`,
        'Resistance pattern: delaying your own authority until every condition feels perfectly safe.',
        'Breakthrough pattern: decide from values first, then let timing and structure support the decision.',
        premium
          ? 'Premium maps the shadow-to-gift path so the repeated pattern becomes usable instead of tiring.'
          : 'Free names the main direction and the most practical point of resistance.',
      ],
      evidence: [
        `Numerology tone: ${lifeThemeSentence}`,
        `KP decision signal: ${kpSummary}`,
      ],
      id: 'destiny-pattern',
      tier: 'free',
      title: 'Destiny Pattern',
    },
    {
      body: currentFocus,
      bullets: [
        `Lead with ${purusharthaLead.toLowerCase()}; care for ${purusharthaCare.toLowerCase()}.`,
        numberCycle,
        'What to stop doing: treating every familiar pressure as proof that nothing is changing.',
        'What to start doing: choose one cleaner response, repeat it until your nervous system believes the new pattern.',
      ],
      evidence: [
        currentFocus,
        numberCycle,
      ],
      id: 'current-life-chapter',
      tier: 'free',
      title: 'Current Life Chapter',
    },
    {
      body:
        'The gifts you carry are not just talents. They are survival skills that become wisdom when they are used with intention. Your strongest gifts are pattern vision, recovery after pressure, and the ability to make other people feel oriented once you have become oriented yourself.',
      bullets: [
        'Gift one: seeing the hidden structure inside messy situations.',
        'Gift two: rebuilding after pressure without needing the same wound to define you.',
        'Gift three: becoming a stabilizing presence for others after you stop abandoning your own center.',
        'Use these gifts in work, love, money, and family only after your boundaries are clear enough to protect them.',
        premium
          ? 'Premium expands the gifts into leadership, love, work, money, purpose, and self-expression applications.'
          : 'Free gives the top three gifts clearly.',
      ],
      evidence: [
        `Soul-role gift: ${jaiminiContribution.soulRole}`,
        `Number gift: ${lifeThemeSentence}`,
      ],
      id: 'gifts-you-carry',
      tier: 'free',
      title: 'Gifts You Carry',
    },
    {
      body:
        'The karmic lesson is not punishment. It is the repeating classroom where awareness must become stronger than reflex. The same pressure may return through people, deadlines, responsibility, or emotional expectation until your response becomes calmer, cleaner, and less hungry for external confirmation.',
      bullets: [
        'Lesson one: respond instead of proving yourself through pressure.',
        'Lesson two: let boundaries protect tenderness rather than harden it.',
        'Lesson three: choose consistency before intensity.',
        'Lesson four: stop confusing emotional urgency with destiny.',
        premium
          ? 'Premium turns these into a karmic pattern map with shadow-to-gift transformation and integration practices.'
          : 'Free keeps the lessons practical and non-frightening.',
      ],
      evidence: [
        `Jaimini practice: ${jaiminiContribution.practice}`,
        'Karmic language stays reflective, not fatalistic.',
      ],
      id: 'karmic-lessons',
      tier: 'free',
      title: 'Karmic Lessons',
    },
    {
      body:
        'Love, work, money, and purpose are not separate islands in this Life Atlas. They behave like one ecosystem. When love becomes reactive, work asks for steadiness. When money becomes emotional, purpose asks for structure. When purpose becomes heavy, love and joy need to return so the path does not become dry.',
      bullets: [
        'Love: practice honest closeness without losing your center.',
        'Work: build visible value through disciplined contribution, not scattered proving.',
        'Money: use structure to reduce emotional decision-making.',
        'Purpose: let service and self-respect grow together, so giving does not become depletion.',
      ],
      evidence: [
        `Life ecosystem lead: ${purusharthaLead}`,
        `Life ecosystem care point: ${purusharthaCare}`,
      ],
      id: 'love-work-money-purpose',
      tier: premium ? 'premium' : 'free',
      title: 'Love, Work, Money, Purpose',
    },
    {
      body: hiddenThread,
      bullets: [
        'This is the line to return to when separate problems start feeling disconnected.',
        'If the same pressure appears in love, work, money, or family, do not ask only “why is this happening?” Ask “what response is this training in me?”',
        'The hidden thread becomes useful when it changes one daily decision, not when it stays beautiful on paper.',
        premium
          ? 'Premium deepens this into a personal chapter with examples, cautions, practices, and future maturation cues.'
          : 'Free gives the hidden thread in one memorable form.',
      ],
      evidence: [
        hiddenThread,
        `Number rhythm: ${lifeThemeSentence}`,
      ],
      id: 'hidden-thread',
      tier: 'free',
      title: 'The Hidden Thread',
    },
    {
      body:
        'What is intended for you is not a fixed script. It is a more aligned version of your life where your gifts are used cleanly, your timing is respected, and your energy is no longer spent fighting your own growth. The intended path feels less like drama and more like honest strength.',
      bullets: [
        'More alignment, less self-betrayal.',
        'More meaningful contribution, less scattered proving.',
        'More calm responsibility, less fear-led urgency.',
        'More intimacy with your real path, less negotiation with old patterns.',
      ],
      evidence: [
        `Intended direction: ${lifeThemeSentence}`,
        'Future language is hopeful and grounded, not guaranteed.',
      ],
      id: 'what-is-intended',
      tier: 'free',
      title: 'What Is Intended For You',
    },
    {
      body:
        'The next 12 to 24 months are best used as a refinement period: make the path cleaner, reduce avoidable drama, and take practical steps your future self can trust. This is not a season for proving everything at once. It is a season for building a cleaner operating system.',
      bullets: [
        'Start what needs clean structure.',
        'Repair what still leaks energy.',
        'Wait where impatience would create a mess.',
        'Choose the boring action that makes your life easier six months from now.',
        premium
          ? 'Premium turns this into a deeper integration calendar without pretending exact events are guaranteed.'
          : 'Free gives the current focus without technical timing language.',
      ],
      evidence: [
        numberCycle,
        `KP readiness tone: ${kpSummary}`,
      ],
      id: 'next-12-24-months',
      tier: 'free',
      title: 'Next 12-24 Months',
    },
    {
      body:
        'Soul practices are the bridge between insight and change. They should be small enough to repeat and honest enough to change behavior. Do not turn this report into a mood. Turn it into a practice.',
      bullets: [
        jaiminiContribution.practice,
        'For seven days, write the same repeating lesson in one sentence. Then write the calmer response you are choosing instead.',
        'Choose one weekly act of service, repair, or discipline that makes your life cleaner.',
        'When pressure rises, pause before speech, spending, promises, and major emotional conclusions.',
        signatureNote,
      ],
      evidence: [
        jaiminiContribution.practice,
        signatureNote,
      ],
      id: 'soul-practices',
      tier: 'free',
      title: 'Soul Practices',
    },
    {
      body:
        `Dear ${firstName}, your path does not need to become louder to become more powerful. It needs to become truer. There is a version of you that no longer treats pressure as proof of failure, no longer waits for perfect safety before choosing, and no longer spends sacred energy convincing life that you deserve a place in it. Let this report be a mirror, not a cage. Keep what feels honest. Test it through action. Let softness and strength stand together. The life ahead is not asking you to become someone else; it is asking you to stop abandoning the self that already knows the way.`,
      bullets: [
        'Return to this letter when life feels noisy.',
        'Use the hidden thread as a compass, not a verdict.',
        premium
          ? 'Premium closing letter is written to feel personal, sacred, and memorable.'
          : 'Free closing letter stays warm, useful, and complete.',
      ],
      evidence: [
        'The closing letter preserves agency and avoids fear.',
      ],
      id: 'final-letter',
      tier: 'free',
      title: 'Final Letter From Predicta',
    },
  ];

  if (premium) {
    const finalLetterIndex = sections.findIndex(section => section.id === 'final-letter');
    const premiumSections: LifeAtlasReportSection[] = [
      {
        body:
          'Your relationship mirror is one of the clearest places where the Life Atlas becomes practical. You are not being asked to become less deep; you are being asked to stop confusing intensity with intimacy. The healthier pattern is honest closeness with boundaries, not rescue, testing, withdrawal, or silent endurance.',
        bullets: [
          'Where you attract growth: relationships that reveal your emotional reflexes quickly.',
          'Where you must stay awake: over-responsibility, control, delayed honesty, or waiting for others to guess what you need.',
          'Premium practice: name the need before it becomes a test, and name the boundary before it becomes resentment.',
          'Better love pattern: warmth plus structure, devotion plus self-respect, closeness plus personal rhythm.',
        ],
        evidence: [
          `Relationship mirror signal: ${jaiminiContribution.relationshipMirror}`,
          `Emotional care point: ${purusharthaCare}`,
        ],
        id: 'relationship-mirror',
        tier: 'premium',
        title: 'Relationship Mirror',
      },
      {
        body:
          'Your work and money path becomes stronger when skill, credibility, and emotional steadiness are built together. The Life Atlas does not point toward scattered proving. It points toward a body of work, a visible standard, and a calmer relationship with value. Money improves when decisions are less reactive and your offer becomes clearer.',
        bullets: [
          'Work signal: build repeatable value instead of chasing every urgent opportunity.',
          'Money signal: use structure to reduce emotional spending, underpricing, or overgiving.',
          'Mission signal: your contribution grows when usefulness and self-respect move together.',
          'Premium application: define one offer, one audience, one operating rhythm, and one six-month stability metric.',
        ],
        evidence: [
          `Work and timing signal: ${kpSummary}`,
          `Life theme: ${lifeThemeSentence}`,
        ],
        id: 'work-money-mission-blueprint',
        tier: 'premium',
        title: 'Work, Money, and Mission Blueprint',
      },
      {
        body:
          'The shadow-to-gift map is simple but not easy: pressure becomes self-command, sensitivity becomes clean perception, ambition becomes service, and repetition becomes wisdom. The shadow is not an enemy. It is the untrained version of a strength that wants discipline, language, and a safer container.',
        bullets: [
          'Pressure shadow: proving, rushing, or hardening. Gift: disciplined self-command.',
          'Sensitivity shadow: absorbing too much. Gift: accurate perception with boundaries.',
          'Ambition shadow: tying worth to outcomes. Gift: durable contribution without self-abandonment.',
          'Repetition shadow: feeling stuck. Gift: recognizing the lesson sooner and responding differently.',
        ],
        evidence: [
          `Jaimini soul-role signal: ${jaiminiContribution.soulRole}`,
          `Hidden thread: ${hiddenThread}`,
        ],
        id: 'shadow-to-gift-map',
        tier: 'premium',
        title: 'Shadow-to-Gift Map',
      },
      {
        body:
          'For the next phase, do not try to transform everything at once. Build a small operating system: one grounding practice, one relationship honesty practice, one work/money structure, and one weekly review. This is how the Life Atlas becomes lived instead of admired.',
        bullets: [
          'Daily: pause before reactive speech, spending, promises, or emotional conclusions.',
          'Weekly: review where the hidden thread appeared and what response you chose.',
          'Monthly: simplify one commitment, repair one leak, and strengthen one stabilizing habit.',
          'Premium success marker: life starts feeling less dramatic because your response becomes more consistent.',
        ],
        evidence: [
          `Current focus: ${currentFocus}`,
          `Timing tone: ${timingTone}`,
        ],
        id: 'integration-plan',
        tier: 'premium',
        title: 'Premium Integration Plan',
      },
    ];

    sections.splice(finalLetterIndex >= 0 ? finalLetterIndex : sections.length, 0, ...premiumSections);
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

function buildTimingTone(kundli: KundliData): string {
  const current = kundli.dasha?.current;

  if (!current?.mahadasha || !current?.antardasha) {
    return 'Use this period for careful observation, steady choices, and cleaner routines until the timing layer is complete.';
  }

  return `The active life rhythm is asking you to blend the larger ${current.mahadasha} chapter with the more immediate ${current.antardasha} lesson, so long-range desire and present discipline do not work against each other.`;
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
