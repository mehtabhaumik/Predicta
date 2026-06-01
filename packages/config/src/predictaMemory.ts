import type {
  BirthDetailsDraft,
  BirthDetailsExtractionResult,
  GeneratedReportContext,
  PredictaAppMemoryDigest,
  PredictaReportSectionMemory,
  ReportMemoryDepth,
  ReportSchoolLaneId,
  SupportedLanguage,
} from '@pridicta/types';

export type PredictaBirthMemory = {
  draft?: BirthDetailsDraft;
  updatedAt?: string;
};

export type BirthIntakeReply = {
  draft: BirthDetailsDraft;
  isReady: boolean;
  missingFields: string[];
  text: string;
};

export const PREDICTA_LIFE_ATLAS_MEMORY_CONTRACT = {
  approvedReportName: 'Predicta Life Atlas',
  boundary:
    'Predicta Life Atlas is the flagship synthesis report and the approved place for all-school synthesis. Vedic, KP, Jaimini, Numerology, and Signature reports remain separate.',
  coreEvidenceLayers: ['Vedic', 'KP', 'Jaimini', 'Numerology'],
  optionalEvidenceLayers: ['Signature'],
  missingSignatureNote:
    'Signature expression layer was not included because no signature sample was provided.',
  positioning:
    'A mystical, emotional, practical, non-technical life report about life journey, soul purpose, destiny direction, current chapter, gifts, lessons, and next steps.',
  premiumBoundary:
    'Free gives useful insight. Premium/paid gives deeper, more powerful, more comprehensive synthesis without guaranteeing fate.',
  safeAnswers: [
    'What is my Life Atlas report?',
    'How is this different from my Vedic report?',
    'Why does this report use multiple schools?',
    'Why is signature not included?',
    'What does my hidden thread mean?',
    'What should I focus on now?',
    'What changes in Premium?',
  ],
  unsupportedClaims: [
    'Akashic Records',
    'palm-leaf manuscript access',
    'spirit guides',
    'divine archives',
    'guaranteed fate',
  ],
} as const;

export const PREDICTA_APP_MEMORY_DIGEST: PredictaAppMemoryDigest = {
  productStructure: [
    'Predicta is one product with five specialist rooms/worlds: Vedic Predicta, KP Predicta, Jaimini Predicta, Numerology Predicta, and Signature Predicta.',
    'Shared Kundli/profile context can travel between rooms, but answers must remain bounded to the active room.',
    'The Reports page has separated Vedic, KP, Jaimini, Numerology, Signature, and approved Synthesis report lanes.',
    'Predicta Life Atlas is the approved Synthesis Reports lane and the only all-school synthesis path.',
  ],
  coreUserFlows: [
    'Create Kundli from birth details, open saved Kundlis, ask chat questions, switch specialist rooms, generate reports, and download PDFs.',
    'Open remedies, review birth-time confidence, use family/relationship surfaces where available, and use premium/day-pass/report purchase flows.',
    'When a user switches Kundli or report, Predicta must carry the active subject, selected report lane, and available section list into chat.',
  ],
  featureCatalog: [
    'Dashboard cards guide users into Kundli, charts, reports, remedies, specialist rooms, saved context, and purchase surfaces.',
    'Vedic world contains charts, dasha, gochar, Panchang, Ashtakavarga, remedies, and report-grade evidence tables.',
    'Charts page opens with the focus order D1, Moon/Chandra Lagna, D9, D10, Chalit, then keeps the full Varga library selectable with prediction-first summaries for every supported chart.',
    'Swamsa and Karakamsha are first-class Vedic soul-direction chart surfaces, not optional hidden notes.',
    'Report marketplace options are school-separated; method-specific reports must not become mixed-bag reports.',
    'PDF reports are the complete dossier surface; app screens stay progressive, clean, and CTA-led so users are not forced through a long reading wall.',
    'Language preferences, safety/legal guidance, and saved recovery behavior must be explained calmly when asked.',
  ],
  appSurfaceAwareness: [
    'Login and account surfaces explain saved context, guest state, recovery behavior, and what happens when the user signs in without sounding lost.',
    'Settings controls language, account preferences, notification-style expectations, support links, and safe reset/recovery guidance.',
    'Family Center carries active family/member context, relationship labels, family comparison surfaces, and privacy boundaries without blame language.',
    'Pricing explains free, day-pass, report purchase, premium, and support boundaries with respect for free users.',
    'Payment flow must not throw while Razorpay is not wired; Predicta must say the secure checkout is being connected and no paid access is marked until payment or approved support handoff is verified.',
    'Support can explain what went wrong, what information is missing, and what the user can do next without exposing internals, debug labels, private tokens, or server details.',
  ],
  astrologyCapabilityMap: [
    'Parashari/Vedic: D1, Moon/Chandra Lagna, D9, D10, Chalit, full Varga library, selected-chart prediction behavior, Swamsa, Karakamsha, dasha, Mahadasha Phala, gochar, Sade Sati, consolidated remedy plan, Panchang, Ashtakavarga, Prastarashtakavarga, Avakhada, dignity, combustion, retrogression, benefic/malefic logic, friendship tables, and house-wise planet evidence.',
    'Main Vedic report chart plates exclude micro/special points and outer planets from the visible graha set; Predicta can explain those points only in advanced technical contexts when evidence exists.',
    'KP: event-first judgement using cusps, star lords, sub lords, sub-sub lords where available, significators, ruling planets, dasha support, transit triggers, and confidence limits. KP must use Bhav Chalit/cusp-oriented evidence where a chart is needed and must not use D1 as the primary KP chart surface.',
    'Jaimini: classical Jyotish soul-role interpretation using Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha once deterministic Jaimini calculations are available.',
    'Numerology: name number, birth number, destiny/life-path number, personal year/month/day, name rhythm, missing/repeated number patterns, compatibility, and optional name refinement.',
    'Signature: confirmed visible signature traits only, privacy-first session handling, reflective self-expression guidance, and no forensic/diagnostic claims.',
  ],
  reportLanes: [
    'Vedic Reports use Parashari/Vedic evidence only.',
    'KP Reports use KP event proof only.',
    'Jaimini Reports use Jaimini soul-role, visible-identity, relationship-mirror, and Chara Dasha logic only.',
    'Numerology Reports use number logic only unless the user explicitly requests approved Vedic-plus-Numerology combination.',
    'Signature Reports use confirmed signature traits only unless the user explicitly requests approved Vedic-plus-Signature combination.',
    'Synthesis Reports are clearly labeled; Predicta Life Atlas can combine available Vedic, KP, Jaimini, Numerology, and optional Signature data.',
  ],
  roomBoundaries: [
    'Vedic Predicta answers from Parashari/Vedic context only.',
    'KP Predicta answers from Krishnamurti KP context only.',
    'Jaimini Predicta answers from Jaimini context only.',
    'Numerology Predicta can answer Numerology-only or Vedic-plus-Numerology when the user asks for combination.',
    'Signature Predicta can answer Signature-only or Vedic-plus-Signature when the user asks for combination.',
    'If the user asks for another method from the wrong room, Predicta should hand off or ask whether an approved combined reading is wanted.',
  ],
  deeperContextAwareness: [
    'Predicta may know calculated report/charts/tables that are not visible on the immediate card; she should use supplied digest data before giving a generic answer.',
    'Predicta should remember the active subject, active Kundli, selected chart, selected report, generated report context, and family/member context when supplied.',
    'Predicta can explain deeper available data such as Mahadasha, KP event carriers, Jaimini soul-role indicators, Numerology cycle, confirmed Signature traits, Life Atlas synthesis, and downloaded report sections even when the screen only shows a compact preview.',
  ],
  missingDataHonestyRules: [
    'Never pretend a pending calculation is complete.',
    'Never pretend a report has been generated or downloaded unless generatedReportContext says it exists.',
    'Never pretend Razorpay or paid access succeeded before verified payment or approved support handoff exists.',
    'Never infer signature traits unless confirmed visible traits are supplied from the current session.',
    'Never expose premium-only detail to free users as if it is already unlocked; explain what premium adds after giving useful free guidance.',
  ],
  userGuidanceRules: [
    'Explain where to find an app feature and what it does without sounding generic.',
    'Explain what a report section means, how it is calculated or why it is pending, and what free versus premium depth changes.',
    'Never fabricate pending calculations or hidden data.',
    'Free answers remain useful and non-technical; premium answers add evidence, timing, contradictions, and practical depth without changing respectability.',
    'When asked about report content, explain what it means for the user rather than merely defining what an area governs.',
    'Use non-scary, non-fatalistic, confidence-aware wording.',
    'Cite the active table/section context instead of inventing unrelated reasoning.',
  ],
  refreshRule:
    'When routes, pricing, reports, calculations, or specialist-room capabilities change, update this digest and the section memory catalog before calling the phase green.',
};

export const PREDICTA_REPORT_TO_CHAT_FOLLOW_UPS = [
  'Explain my friendship table',
  'Explain my functional benefics and malefics',
  'Explain my Chalit shifts',
  'Explain my Moon chart',
  'Explain my Swamsa chart',
  'Explain my Karakamsha chart',
  'Explain my Mahadasha Phala',
  'Explain my current Mahadasha, Antardasha, and Pratyantardasha',
  'Explain my Avakhada chakra',
  'Explain my Ashtakavarga score',
  'Explain my Ghatak and favorable factors',
] as const;

export const PREDICTA_REPORT_SECTION_MEMORY_CATALOG: PredictaReportSectionMemory[] = [
  {
    boundary:
    'Vedic-only chart context. Do not answer Moon chart questions with KP cusp logic or Jaimini soul-role logic.',
    calculationState: 'available',
    freeDepth:
      'Explain Moon chart as the emotional and lived-experience lens in simple language.',
    handoffPrompt: 'Explain my Moon chart',
    id: 'moon-chart',
    premiumDepth:
      'Add D1 comparison, Moon sign/nakshatra evidence, timing relevance, and confidence limits.',
    schoolLane: 'VEDIC',
    title: 'Moon chart / Chandra Lagna chart',
    whatItMeans:
      'Shows the chart counted from the Moon so the user can understand mind, emotional rhythm, lived experience, and how timing feels internally.',
  },
  {
    boundary:
      'Vedic-only dasha context. Past Mahadashas stay Mahadasha-level; current dasha can be layered.',
    calculationState: 'available',
    freeDepth:
      'Summarize past Mahadashas and explain the current Mahadasha, Antardasha, and Pratyantardasha in useful plain language.',
    handoffPrompt: 'Explain my Mahadasha Phala',
    id: 'mahadasha-phala',
    premiumDepth:
      'Use chart evidence, dignity, house, sign, nakshatra, strength, support/caution, and one-paragraph Pratyantardasha limits without overclaiming exact events.',
    schoolLane: 'VEDIC',
    title: 'Mahadasha Phala and Meaning',
    whatItMeans:
      'Explains the major life chapter, the active delivery channel, and the fine timing layer while keeping past periods summarized.',
  },
  {
    boundary:
      'Vedic-only placement evidence. Do not turn this table into a fatalistic judgement.',
    calculationState: 'available',
    freeDepth:
      'Explain planet, house, sign, degree, nakshatra/pada, retrograde, combust, exalted/debilitated, and dignity in beginner language.',
    handoffPrompt: 'Explain my house-wise planet table',
    id: 'house-wise-planet-table',
    premiumDepth:
      'Cross-reference dignity, house delivery, dasha relevance, and contradictions in a readable evidence path.',
    schoolLane: 'VEDIC',
    title: 'House-wise planet placement table',
    whatItMeans:
      'Shows where each graha is placed and what condition it carries before interpretations are made.',
  },
  {
    boundary:
      'Vedic relationship-of-grahas table. Explain support/tension without fear language.',
    calculationState: 'available',
    freeDepth:
      'Explain natural, temporary, and compound relationship as how planets cooperate or create friction.',
    handoffPrompt: 'Explain my friendship table',
    id: 'planet-friendship-table',
    premiumDepth:
      'Add compound relationship nuance, house relevance, dignity, and where the relationship helps or complicates life areas.',
    schoolLane: 'VEDIC',
    title: 'Planet friendship table',
    whatItMeans:
      'Shows how each planet relates to other planets in the Kundli so support and tension are visible.',
  },
  {
    boundary:
      'Vedic Lagna-specific classification. Natural and functional labels can differ and must be explained.',
    calculationState: 'available',
    freeDepth:
      'Explain which planets are natural benefics/malefics and which become functional benefics/malefics by Lagna.',
    handoffPrompt: 'Explain my functional benefics and malefics',
    id: 'benefic-malefic-classification',
    premiumDepth:
      'Add house lordship, chart condition, contradiction handling, timing relevance, and practical guidance.',
    schoolLane: 'VEDIC',
    title: 'Natural and functional benefics/malefics',
    whatItMeans:
      'Separates a planet’s natural temperament from its role for the user’s Lagna.',
  },
  {
    boundary:
      'Vedic Chalit/Bhav Chalit delivery context. Keep D1 and Chalit differences clear.',
    calculationState: 'available',
    freeDepth:
      'Explain whether a planet shifts from its D1 house to Chalit house and what practical delivery changes.',
    handoffPrompt: 'Explain my Chalit shifts',
    id: 'chalit-table',
    premiumDepth:
      'Add cusp proximity, shifted/unchanged meaning, life-area delivery, and dasha cross-reference.',
    schoolLane: 'VEDIC',
    title: 'Chalit table',
    whatItMeans:
      'Shows how house delivery can shift in Bhav Chalit even when the sign placement remains anchored in D1.',
  },
  {
    boundary:
      'Vedic Panchang context. Birth Panchang and current personal Panchang should not be confused.',
    calculationState: 'available',
    freeDepth:
      'Explain weekday, tithi, Moon rhythm, favorable actions, cautions, and remedy tone simply.',
    handoffPrompt: 'Explain my Panchang',
    id: 'panchang',
    premiumDepth:
      'Add birth-vs-current distinction, timing relevance, and practical action planning.',
    schoolLane: 'VEDIC',
    title: 'Panchang',
    whatItMeans:
      'Describes the lunar day and calendar rhythm that colors birth or current timing.',
  },
  {
    boundary:
      'Vedic module that may be pending depending on deterministic support. Never fabricate if unavailable.',
    calculationState: 'pending',
    freeDepth:
      'Explain what Samsa means and state honestly if the calculation is pending.',
    handoffPrompt: 'Explain my Samsa',
    id: 'samsa',
    premiumDepth:
      'When available, add detailed meaning and evidence; when pending, explain the limitation clearly.',
    schoolLane: 'VEDIC',
    title: 'Samsa',
    whatItMeans:
      'A classical identity/support factor that needs deterministic calculation before deeper interpretation.',
  },
  {
    boundary:
      'Vedic caution/support module. Caution must be practical, not scary.',
    calculationState: 'available',
    freeDepth:
      'Explain Ghatak caution signals and favorable supports in gentle language.',
    handoffPrompt: 'Explain my Ghatak and favorable factors',
    id: 'ghatak-favorable',
    premiumDepth:
      'Add timing relevance, practical safeguards, and supportive factors that balance the caution.',
    schoolLane: 'VEDIC',
    title: 'Ghatak and favorable factors',
    whatItMeans:
      'Highlights traditional caution markers and supportive factors so the user can act calmly.',
  },
  {
    boundary:
      'Vedic Jaimini soul-direction context. Explain Swamsa from verified Navamsha/self-direction evidence and do not mix it with KP or unsupported story claims.',
    calculationState: 'available',
    freeDepth:
      'Explain Swamsa as the inner self-direction chart in one clear, practical paragraph.',
    handoffPrompt: 'Explain my Swamsa chart',
    id: 'swamsa',
    premiumDepth:
      'Add Atmakaraka/Navamsha comparison, purpose pattern, strength/caution, timing relevance, and integration guidance.',
    schoolLane: 'VEDIC',
    title: 'Swamsa',
    whatItMeans:
      'Shows the self-direction lens derived through Jaimini/Navamsha context so the user can understand inner calling and soul effort.',
  },
  {
    boundary:
      'Vedic Atmakaraka/Navamsha context. Explain purpose without overclaiming destiny.',
    calculationState: 'available',
    freeDepth:
      'Explain Atmakaraka basis and Karakamsha purpose in simple, dharma-oriented language.',
    handoffPrompt: 'Explain my Karakamsha',
    id: 'karakamsha',
    premiumDepth:
      'Add Navamsha evidence, dharma implications, contradictions, and integration guidance.',
    schoolLane: 'VEDIC',
    title: 'Karakamsha',
    whatItMeans:
      'Uses Atmakaraka and Navamsha context to describe purpose, inner calling, and dharma direction.',
  },
  {
    boundary:
      'Vedic strength scoring. Explain score bands as support levels, not guarantees.',
    calculationState: 'available',
    freeDepth:
      'Explain SAV/BAV score bands, strongest houses, weakest houses, and practical support/caution.',
    handoffPrompt: 'Explain my Ashtakavarga score',
    id: 'ashtakavarga',
    premiumDepth:
      'Add planet-level BAV, transit relevance, contradictions, and practical timing use.',
    schoolLane: 'VEDIC',
    title: 'Ashtakavarga',
    whatItMeans:
      'Shows numerical support patterns by house and planet for strength and transit judgment.',
  },
  {
    boundary:
      'Vedic bindu-source table. If detailed bindu source data is not present, say pending.',
    calculationState: 'pending',
    freeDepth:
      'Explain what Prastarashtakavarga is and whether bindu source rows are available.',
    handoffPrompt: 'Explain my Prastarashtakavarga',
    id: 'prastarashtakavarga',
    premiumDepth:
      'When available, explain bindu sources and how they support strength/transit judgment.',
    schoolLane: 'VEDIC',
    title: 'Prastarashtakavarga',
    whatItMeans:
      'Breaks Ashtakavarga bindus down by source so the reason behind a score can be understood.',
  },
  {
    boundary:
      'Vedic birth-star identity context. Keep it beginner-friendly and avoid overwhelming lists.',
    calculationState: 'available',
    freeDepth:
      'Explain gana, yoni, nadi, varna, vashya, tatva, and related fields as identity context.',
    handoffPrompt: 'Explain my Avakhada chakra',
    id: 'avakhada-chakra',
    premiumDepth:
      'Add detailed interpretation, compatibility relevance, and practical meaning for the user.',
    schoolLane: 'VEDIC',
    title: 'Avakhada chakra',
    whatItMeans:
      'Summarizes traditional birth-star identity fields so the user understands their Nakshatra profile.',
  },
];

export function buildGeneratedReportMemoryContext({
  availableSections,
  generatedAt,
  mode,
  reportFocus,
  reportTitle,
  schoolLane,
  selectedSections,
  subjectName,
}: {
  availableSections: string[];
  generatedAt?: string;
  mode: ReportMemoryDepth;
  reportFocus: string;
  reportTitle: string;
  schoolLane: ReportSchoolLaneId;
  selectedSections?: string[];
  subjectName?: string;
}): GeneratedReportContext {
  return {
    availableSections,
    generatedAt,
    mode,
    reportFocus,
    reportTitle,
    schoolLane,
    selectedSections,
    subjectName,
  };
}

export function findPredictaReportSectionMemory(
  query: string | undefined,
): PredictaReportSectionMemory | undefined {
  if (!query) {
    return undefined;
  }

  const normalized = normalizeMemoryQuery(query);

  return PREDICTA_REPORT_SECTION_MEMORY_CATALOG.find(section => {
    const candidates = [
      section.id,
      section.title,
      section.handoffPrompt,
      section.whatItMeans,
    ].map(normalizeMemoryQuery);

    return candidates.some(candidate => {
      return (
        candidate.includes(normalized) ||
        normalized.includes(candidate) ||
        hasMeaningfulTokenOverlap(candidate, normalized)
      );
    });
  });
}

function hasMeaningfulTokenOverlap(candidate: string, query: string): boolean {
  const candidateTokens = new Set(
    candidate.split(' ').filter(token => token.length > 3),
  );
  const queryTokens = query.split(' ').filter(token => token.length > 3);

  return queryTokens.filter(token => candidateTokens.has(token)).length >= 2;
}

function normalizeMemoryQuery(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const GREETINGS: Record<SupportedLanguage, string[]> = {
  en: [
    'Namaste. I am here with you.',
    'Hello. Tell me slowly; I am here with you.',
    'Pranam. Let us look at this gently.',
    'Jai Bholenath. I am with you.',
    'Om Namah Shivaya. Share what you know, and we will take the next step.',
    'Jai Maa Durga. We will keep this calm and practical.',
    'Jai Ganesh. Let us begin simply.',
    'Jai Shree Ram. Tell me what is on your mind.',
    'Ram Ram. We will take this one step at a time.',
    'Good to see you. We can go one detail at a time.',
  ],
  hi: [
    'Namaste. Main aapke saath hoon.',
    'Pranam. Aaram se bataye, main saath hoon.',
    'Jai Bholenath. Chaliye dheere se dekhte hain.',
    'Om Namah Shivaya. Jo details pata hain, wahi se start karte hain.',
    'Jai Maa Durga. Isko calm aur practical rakhte hain.',
    'Jai Ganesh. Simple start karte hain.',
    'Jai Shree Ram. Mann ki baat bataye.',
    'Ram Ram. Isko pyaar se samajhte hain.',
  ],
  gu: [
    'Namaste. Hu tamari sathe chhu.',
    'Pranam. Shanti thi kaho, hu tamari sathe chhu.',
    'Jai Bholenath. Chalo dhime thi joie.',
    'Om Namah Shivaya. Je details khabar chhe, tyan thi start kariye.',
    'Jai Maa Durga. Aapde aa calm ane practical rakhishu.',
    'Jai Ganesh. Simple sharu kariye.',
    'Jai Shree Ram. Mann ni vaat kaho.',
    'Ram Ram. Aapde aa pyaar thi samajhiye.',
  ],
};

export function getRandomPredictaGreeting(
  language: SupportedLanguage,
  seed = `${Date.now()}-${Math.random()}`,
): string {
  const greetings = GREETINGS[language] ?? GREETINGS.en;
  const index = Math.abs(hashText(seed)) % greetings.length;

  return greetings[index];
}

export function mergeBirthMemory(
  memory: PredictaBirthMemory | undefined,
  result: BirthDetailsExtractionResult,
  rawInput: string,
): PredictaBirthMemory {
  return {
    draft: mergeBirthDetailsDraft(memory?.draft, result.extracted, rawInput),
    updatedAt: new Date().toISOString(),
  };
}

export function buildBirthIntakeReply({
  language,
  memory,
  result,
  rawInput,
}: {
  language: SupportedLanguage;
  memory?: PredictaBirthMemory;
  result: BirthDetailsExtractionResult;
  rawInput: string;
}): BirthIntakeReply {
  const nextMemory = mergeBirthMemory(memory, result, rawInput);
  const draft = nextMemory.draft ?? {};
  const missingFields = getMissingBirthFields(draft, result);
  const isReady = missingFields.length === 0;
  const copy = getBirthIntakeCopy(language);

  if (result.ambiguities.length > 0) {
    const first = result.ambiguities[0];

    return {
      draft,
      isReady: false,
      missingFields,
      text: [
        copy.confirmation,
        formatDraftSummary(draft, copy),
        first.issue,
        first.options?.length
          ? `${copy.options}: ${first.options.join(' / ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n\n'),
    };
  }

  if (!isReady) {
    return {
      draft,
      isReady,
      missingFields,
      text: [
        copy.progress,
        formatDraftSummary(draft, copy),
        `${copy.need}: ${missingFields
          .map(field => copy.fields[field] ?? field)
          .join(', ')}.`,
        copy.unknownTime,
      ]
        .filter(Boolean)
        .join('\n\n'),
    };
  }

  return {
    draft,
    isReady,
    missingFields,
    text: [copy.ready, formatDraftSummary(draft, copy), copy.verify].join(
      '\n\n',
    ),
  };
}

export function mergeBirthDetailsDraft(
  current: BirthDetailsDraft | undefined,
  extracted: BirthDetailsDraft,
  rawInput: string,
): BirthDetailsDraft {
  const merged = {
    ...current,
    ...Object.fromEntries(
      Object.entries(extracted).filter(
        ([, value]) => value !== undefined && value !== null,
      ),
    ),
  } as BirthDetailsDraft;
  const meridiem = rawInput.match(/\b(am|pm|morning|evening|night)\b/i)?.[1];

  if (merged.time && meridiem) {
    merged.time = applyMeridiemToTime(merged.time, meridiem);
    merged.meridiem =
      meridiem.toLowerCase() === 'am' || meridiem.toLowerCase() === 'morning'
        ? 'AM'
        : 'PM';
  }

  return merged;
}

export function getMissingBirthFields(
  draft: BirthDetailsDraft,
  result?: BirthDetailsExtractionResult,
): string[] {
  const missing = new Set<string>(result?.missingFields ?? []);

  if (!draft.date) {
    missing.add('date');
  } else {
    missing.delete('date');
  }

  if (!draft.time) {
    missing.add('time');
  } else {
    missing.delete('time');
  }

  if (!draft.city && !draft.placeText) {
    missing.add('birth_place');
  } else {
    missing.delete('birth_place');
    missing.delete('city');
    missing.delete('state');
    missing.delete('country');
  }

  missing.delete('name');
  return [
    'date',
    'time',
    'am_pm',
    'birth_place',
    'city',
    'state',
    'country',
  ].filter(field => missing.has(field));
}

function applyMeridiemToTime(time: string, meridiem: string): string {
  const [hourText, minuteText = '00'] = time.split(':');
  let hour = Number(hourText);
  const normalized = meridiem.toLowerCase();

  if (
    (normalized === 'pm' ||
      normalized === 'evening' ||
      normalized === 'night') &&
    hour < 12
  ) {
    hour += 12;
  }

  if ((normalized === 'am' || normalized === 'morning') && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minuteText.padStart(2, '0')}`;
}

function formatDraftSummary(
  draft: BirthDetailsDraft,
  copy: ReturnType<typeof getBirthIntakeCopy>,
): string {
  return [
    draft.name ? `${copy.fields.name}: ${draft.name}` : '',
    draft.date ? `${copy.fields.date}: ${draft.date}` : '',
    draft.time ? `${copy.fields.time}: ${draft.time}` : '',
    draft.city || draft.placeText
      ? `${copy.fields.birth_place}: ${[
          draft.city ?? draft.placeText,
          draft.state,
          draft.country,
        ]
          .filter(Boolean)
          .join(', ')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function getBirthIntakeCopy(language: SupportedLanguage) {
  if (language === 'hi') {
    return {
      confirmation:
        'Achha, maine details sambhal li hain. Bas ek baat confirm karni hai.',
      fields: {
        am_pm: 'AM ya PM',
        birth_place: 'birth place',
        city: 'city',
        country: 'country',
        date: 'date of birth',
        name: 'name',
        state: 'state',
        time: 'birth time',
      } as Record<string, string>,
      need: 'Ab Kundli ke liye chahiye',
      options: 'Options',
      progress: 'Theek hai, mujhe pichli baat yaad hai. Abhi tak maine yeh samjha',
      ready: 'Sundar. Ab Kundli banane ke liye zaroori details mil gayi hain.',
      unknownTime:
        'Agar exact time nahi pata, “time unknown” likh dein. Main birth-time detective mode se guide kar dungi.',
      verify:
        'Ab main yahin chat mein Kundli banaungi aur next question ke liye chart active rakhungi.',
    };
  }

  if (language === 'gu') {
    return {
      confirmation:
        'Saru, maine details save kari chhe. Fakat ek vaat confirm karvi chhe.',
      fields: {
        am_pm: 'AM ke PM',
        birth_place: 'birth place',
        city: 'city',
        country: 'country',
        date: 'date of birth',
        name: 'name',
        state: 'state',
        time: 'birth time',
      } as Record<string, string>,
      need: 'Have Kundli mate joye',
      options: 'Options',
      progress: 'Barabar, mane agavni vaat yaad chhe. Atyar sudhi maine aa samjhyu',
      ready: 'Sundar. Have Kundli banava mate jaruri details mali gayi chhe.',
      unknownTime:
        'Jo exact time khabar nathi, “time unknown” lakho. Hu birth-time detective mode thi guide karish.',
      verify:
        'Have hu ahi chat ma Kundli banaish ane next question mate chart active rakhish.',
    };
  }

  return {
    confirmation:
      'Good, I saved what you shared. One small thing needs confirmation.',
    fields: {
      am_pm: 'AM or PM',
      birth_place: 'birth place',
      city: 'city',
      country: 'country',
      date: 'date of birth',
      name: 'name',
      state: 'state or province',
      time: 'birth time',
    } as Record<string, string>,
    need: 'Now I need',
    options: 'Options',
    progress: 'Got it, I remember the earlier detail. So far I have',
    ready: 'Beautiful. I now have the details needed to create the Kundli.',
    unknownTime:
      'If the exact time is unknown, write “time unknown” and I will guide you through birth-time detective mode.',
    verify:
      'I will create it here in chat and keep this chart active for your next question.',
  };
}

function hashText(text: string): number {
  return Array.from(text).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) | 0,
    7,
  );
}
