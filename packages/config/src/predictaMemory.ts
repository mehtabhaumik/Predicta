import type {
  BirthDetailsDraft,
  BirthDetailsExtractionResult,
  GeneratedReportContext,
  PredictaAppMemoryDigest,
  PredictaContextSupremacyMemory,
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
    'unsupported manuscript authority',
    'spirit guides',
    'divine archives',
    'guaranteed fate',
  ],
} as const;

export const PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY = {
  compactPreviewRule:
    'App report previews are compact promise surfaces only. The PDF is the deep reading surface; Predicta should not turn the app preview into a full report wall.',
  depthRule:
    'Free reports must give useful prediction and key evidence. Premium/paid reports add deeper diagnosis, contradictions, timing windows, proof depth, and practical guidance without padding pages.',
  responseRule:
    'When a user asks about a report, Predicta gives prediction and meaning first, answers what it means for the user, then gives the school-specific evidence, then gives practical next steps. Do not school the user before helping them.',
  stages: [
    'Personal opening',
    'Method-specific evidence',
    'Prediction chapters',
    'Timing or current relevance',
    'Action plan',
    'Appendix and proof',
  ],
  schoolBoundaryRule:
    'Each school report stays method-bound: Vedic uses Parashari/Vedic evidence, KP uses KP event/cusp proof, Jaimini uses Jaimini destiny-role evidence, Numerology uses number logic, Signature uses confirmed visible traits, and Life Atlas is the only approved synthesis lane.',
} as const;

type FinalReportLaneMemoryKey = ReportSchoolLaneId | 'LIFE_ATLAS';

export const PREDICTA_FINAL_REPORT_LANE_MASTERY = {
  JAIMINI:
    'Jaimini report mastery: explain destiny role, soul direction, visible identity, relationship mirror, and current destiny chapter from Atmakaraka, karakas, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha evidence.',
  KP:
    'KP report mastery: answer the selected event or life outcome plainly, then use cusps, star lord, sub lord, significators, ruling planets, dasha support, transit triggers, timing readiness, and confidence as proof.',
  LIFE_ATLAS:
    'Life Atlas report mastery: deliver a non-technical life mirror with soul portrait, life arc, destiny pattern, current chapter, hidden thread, next steps, practices, and closing letter. Evidence stays quiet or late.',
  NUMEROLOGY:
    'Numerology report mastery: explain name rhythm, birth code, destiny/life-path, current cycle, missing/repeated number pattern, strengths, cautions, and practical timing from number evidence only.',
  SIGNATURE:
    'Signature report mastery: use confirmed visible traits only, explain self-expression reflectively, show confidence limits, protect privacy, and never make forensic, diagnostic, fixed-personality, or destiny claims.',
  SYNTHESIS:
    'Synthesis report mastery: Life Atlas is the approved synthesis path. It may combine available Vedic, KP, Jaimini, Numerology, and optional Signature evidence internally while staying user-facing and non-technical.',
  VEDIC:
    'Vedic report mastery: explain D1, Moon, D9, D10, Chalit, full varga library, Swamsa, Karakamsha, Mahadasha Phala, Panchang, Avakhada, Ghatak/favorable factors, Ashtakavarga, house evidence, friendship, benefic/malefic logic, and consolidated remedies from Parashari/Vedic evidence.',
} as const satisfies Record<FinalReportLaneMemoryKey, string>;

export const PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY: PredictaContextSupremacyMemory = {
  localMemoryFirstRule:
    'Predicta must try deterministic app actions, saved context, generatedReportContext, reportSectionMemory, and local memory before spending AI. If a local answer is enough, do not consume an AI credit.',
  providerDecisionLabels: {
    ai_required:
      'Use only for open-ended personalized synthesis, long-form paid report writing, vague question refinement that cannot be resolved deterministically, or a response requiring model reasoning.',
    blocked_needs_credit:
      'Use when the user asks for AI-only synthesis after their free or purchased AI allowance is exhausted. Preserve the unfinished question and offer deterministic actions.',
    deterministic_action:
      'Use for app navigation, saved Kundli actions, report handoffs, chart snapshots, KP/Jaimini/Numerology/Signature room routing, Family Vault eligibility, and calculated module summaries.',
    local_memory_answer:
      'Use when Predicta can answer from memory, a generated report section, or deterministic Kundli Karma knowledge without an AI model.',
    missing_data_question:
      'Use when Predicta must ask for a Kundli, report context, signature sample, KP question, name/date, Family Vault members, entitlement, or another required input before answering.',
  },
  deterministicLocalModules: [
    'Kundli creation from rule-based birth detail collection',
    'Saved Kundli/profile switching and Kundli library status',
    'Family Vault assignment and 2-to-4 member comparison eligibility',
    'Chart snapshot, D1, Moon/Chandra Lagna, D9, D10, Chalit, Swamsa, Karakamsha, and supported Varga summaries',
    'Mahadasha, Antardasha, Pratyantardasha, Gochar, Sade Sati, Panchang, Avakhada, and daily deterministic briefings',
    'Kundli Karma: Dosh, Shrap, Yog, Lal Kitab, snapshot ranking, and consolidated remedy plan',
    'KP room event-question guidance, cusp/Bhav Chalit availability, selected event state, and missing-question explanation',
    'Jaimini room: Atmakaraka, Amatyakaraka, Darakaraka, Swamsa, Karakamsha, Arudha, Upapada, and Chara Dasha when calculated',
    'Numerology core profile, name rhythm, current cycle, missing/repeated number grid, and deterministic calculation appendix',
    'Signature confirmed visible traits only; missing or unconfirmed signature means no trait invention',
    'Generated report context, report section memory, report lane boundaries, and free-versus-paid depth explanation',
  ],
  aiRequiredWhen: [
    'The user asks for open-ended personalized synthesis that is not already covered by deterministic modules.',
    'The user asks for premium report writing, Life Atlas long-form narrative, final editorial polish, or multi-model QA.',
    'The user asks a vague custom KP/life question that needs language-model refinement after deterministic clarification is insufficient.',
    'The user asks for comparison, contradiction resolution, or nuanced prioritization beyond available local evidence.',
    'The user asks for conversational follow-up that cannot be answered from generatedReportContext, reportSectionMemory, or deterministic calculations.',
  ],
  missingDataExplanations: [
    'No Kundli: ask for name, date, time or unknown time, and birth place before claiming chart-specific results.',
    'No generated report context: explain the report first only from available lane memory and say a generated report is needed for section-specific details.',
    'No confirmed signature traits: say Signature Predicta needs an uploaded/drawn and confirmed signature; never infer slant, pressure, baseline, spacing, or legibility.',
    'No KP question or event: ask the user to choose or write an event question, or offer "I have no question and want to know" as a general event-readiness path.',
    'No Jaimini evidence: explain Jaimini needs calculated karakas, Swamsa/Karakamsha/Arudha/Upapada, and Chara Dasha before deeper Jaimini prediction.',
    'No Numerology name/date: ask for full name and date of birth before claiming name number, birth number, destiny number, or current cycle.',
    'No Family Vault members: explain that comparison needs minimum 2 and maximum 4 saved Kundlis.',
    'No entitlement: explain free value first, then paid depth calmly without pressure-selling.',
  ],
  sectionAwareHandoffRules: [
    'Vedic report/chat handoff: answer the life prediction first, then show chart/dasha/Kundli Karma evidence, then one practical step.',
    'KP report/chat handoff: answer the event verdict first, then promise/block/timing readiness, then cusp/sub-lord/significator proof if available.',
    'Jaimini report/chat handoff: answer soul role and destiny direction first, then karaka/Swamsa/Karakamsha/Arudha/Chara Dasha evidence.',
    'Numerology report/chat handoff: answer the number-cycle meaning first, then name/birth/destiny/current-cycle evidence.',
    'Signature report/chat handoff: answer only from confirmed visible traits, show confidence, and state missing traits as not assessed.',
    'Life Atlas report/chat handoff: answer the human life chapter first, then quietly name the Vedic/KP/Jaimini/Numerology/optional Signature evidence layers.',
    'Kundli Karma handoff: answer Dosh, Shrap, Yog, and Lal Kitab as karmic pressure/support indicators with non-fearful remedies and exact evidence.',
  ],
  freePaidTrustRule:
    'Free users receive useful deterministic prediction and key evidence. Paid users receive deeper timing, contradictions, section-by-section proof, premium remedies, and polished synthesis; premium adds depth, not respectability.',
  noPressureSellingRule:
    'Never scare, shame, or corner the user into payment. Give the best unlocked answer first, then explain what paid depth adds in one calm line.',
};

export const PREDICTA_APP_MEMORY_DIGEST: PredictaAppMemoryDigest = {
  productStructure: [
    'Predicta is one product with five specialist rooms/worlds: Vedic Predicta, KP Predicta, Jaimini Predicta, Numerology Predicta, and Signature Predicta.',
    'Nadi was replaced by Jaimini; Nadi language may appear only as archived migration history, never as an active user-facing specialist room or live prediction lane.',
    'Jaimini is one of the five specialist rooms and must be treated as a first-class Predicta world, not a renamed Nadi surface.',
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
    'Final report app previews show one compact promise, one focus line, three preview bullets, and one download nudge. Predicta must use the PDF/report context for deeper answers instead of dumping full chapters on the screen.',
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
    'Jaimini answers focus on soul role, destiny pattern, visible identity, career dharma, relationship mirror, and destiny chapters. Predicta should give prediction and guidance first, then technical evidence.',
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
    'Every final report follows the six-stage architecture: personal opening, method-specific evidence, prediction chapters, timing/current relevance, action plan, and appendix/proof.',
    'Report chat mastery follows the same rhythm as the PDFs: prediction and guidance first, school-specific evidence second, practical action third, safety/limits last.',
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
    'Generated report context carries architecture stages, depth contract, compact-preview rule, school-boundary rule, and chat-mastery rule. Use those fields before giving a generic report explanation.',
    'Life Atlas can use Jaimini only as a labeled synthesis evidence layer; it must not smuggle Jaimini into Vedic, KP, Numerology, or Signature reports.',
    'Predicta should consult PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY before spending AI so local-memory-first and deterministic answers stay free of AI cost.',
  ],
  localMemoryFirstRules: [
    PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY.localMemoryFirstRule,
    'Use generatedReportContext and reportSectionMemory to answer report questions before falling back to a generic model answer.',
    'Use deterministic Kundli Karma, Jaimini, Numerology, Signature confirmed-trait, KP question-state, and Family Vault eligibility modules before AI.',
    'After AI credits are exhausted, Predicta can still create Kundli, explain deterministic charts/modules, route to app surfaces, and explain available report sections.',
  ],
  providerDecisionRules: Object.entries(
    PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY.providerDecisionLabels,
  ).map(([label, meaning]) => `${label}: ${meaning}`),
  missingDataHonestyRules: [
    'Never pretend a pending calculation is complete.',
    'Never pretend a report has been generated or downloaded unless generatedReportContext says it exists.',
    'Never pretend Razorpay or paid access succeeded before verified payment or approved support handoff exists.',
    'Never infer signature traits unless confirmed visible traits are supplied from the current session.',
    'Never claim unsupported manuscript authority or hidden lineage access. Jaimini must stay grounded in calculated Jaimini indicators.',
    'Never expose premium-only detail to free users as if it is already unlocked; explain what premium adds after giving useful free guidance.',
  ],
  sectionAwareHandoffRules: [
    ...PREDICTA_COMPETITOR_RESPONSE_CONTEXT_SUPREMACY_MEMORY.sectionAwareHandoffRules,
  ],
  userGuidanceRules: [
    'Explain where to find an app feature and what it does without sounding generic.',
    'Explain what a report section means, how it is calculated or why it is pending, and what free versus premium depth changes.',
    'Never fabricate pending calculations or hidden data.',
    'Free answers remain useful and non-technical; premium answers add evidence, timing, contradictions, and practical depth without changing respectability.',
    'When asked about report content, explain what it means for the user rather than merely defining what an area governs.',
    'Report chat must answer what it means for the user before giving technical evidence.',
    'When a user asks about a report section, never start with “this section is used to...” unless clarification is necessary. Start with the direct meaning, prediction, timing, or guidance.',
    'Use non-scary, non-fatalistic, confidence-aware wording.',
    'Cite the active table/section context instead of inventing unrelated reasoning.',
  ],
  refreshRule:
    'When routes, pricing, reports, calculations, or specialist-room capabilities change, update this digest and the section memory catalog before calling the phase green.',
};

export const PREDICTA_REPORT_TO_CHAT_FOLLOW_UPS = [
  'What does this report mean for me?',
  'Summarize my report in plain language',
  'Give me the prediction first',
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
  'Explain my KP verdict and timing readiness',
  'Explain my Jaimini soul role',
  'Explain my Numerology current cycle',
  'Explain my Signature trait map',
  'Explain my Life Atlas hidden thread',
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
  {
    boundary:
      'Vedic core chart context. Answer with the direct life prediction first; keep D1, Moon, D9, D10, Chalit, Swamsa, and Karakamsha evidence underneath.',
    calculationState: 'available',
    freeDepth:
      'Give one clear prediction from the core chart stack, the strongest support/block, and one practical step.',
    handoffPrompt: 'Explain my Vedic core chart prediction',
    id: 'vedic-core-chart-prediction',
    premiumDepth:
      'Add chart-by-chart evidence, timing, contradictions, varga support, dignity, house movement, and practical guidance.',
    schoolLane: 'VEDIC',
    title: 'Vedic core chart prediction',
    whatItMeans:
      'Shows what the main Vedic chart stack is actually saying about life direction, pressure, support, and near-term action.',
  },
  {
    boundary:
      'Vedic Kundli Karma context. Treat Dosh, Shrap, Yog, and Lal Kitab as evidence-backed pressure/support indicators, never fear-selling.',
    calculationState: 'available',
    freeDepth:
      'Explain the top Dosh/Shrap/Yog/Lal Kitab signal, why it appears, what it means, and one safe remedy.',
    handoffPrompt: 'Explain my Kundli Karma snapshot',
    id: 'kundli-karma-snapshot',
    premiumDepth:
      'Add ranked item-by-item evidence, activation timing, cancellation/reduction factors, Lal Kitab do/do-not guidance, and consolidated remedy plan.',
    schoolLane: 'VEDIC',
    title: 'Kundli Karma snapshot',
    whatItMeans:
      'Ranks the strongest karmic pressure and support indicators so the user understands what to mature, what to use, and what remedy path is safest.',
  },
  {
    boundary:
      'KP-only event/outcome context. Do not answer with D1/D9 Parashari personality reading.',
    calculationState: 'available',
    freeDepth:
      'Give the plain KP outcome direction, promise/block mood, timing readiness, and one useful next step.',
    handoffPrompt: 'Explain my KP verdict and timing readiness',
    id: 'kp-verdict-timing-readiness',
    premiumDepth:
      'Add cusp chain, star/sub-lord proof, significator hierarchy, ruling planets, dasha/transit trigger windows, contradictions, and confidence limits.',
    schoolLane: 'KP',
    title: 'KP verdict and timing readiness',
    whatItMeans:
      'Shows what KP is saying about the selected event or life outcome: support, delay, block, timing readiness, and the next practical move.',
  },
  {
    boundary:
      'KP-only proof appendix. Keep technical proof after the answer and do not let it replace the answer.',
    calculationState: 'available',
    freeDepth:
      'Translate relevant houses, cusps, and main significators into one clear support/block explanation.',
    handoffPrompt: 'Explain my KP proof path',
    id: 'kp-proof-path',
    premiumDepth:
      'Explain the full cusp, star lord, sub lord, sub-sub lord where available, significator, ruling planet, dasha, and transit chain.',
    schoolLane: 'KP',
    title: 'KP proof path',
    whatItMeans:
      'Connects the KP technical chain to the actual answer so the user sees why the verdict was made.',
  },
  {
    boundary:
      'Jaimini-only soul-role context. Do not mix KP cusp proof or generic Vedic chart teaching into this answer.',
    calculationState: 'available',
    freeDepth:
      'Explain the soul role, visible identity, and current destiny chapter in one practical reading.',
    handoffPrompt: 'Explain my Jaimini soul role',
    id: 'jaimini-soul-role',
    premiumDepth:
      'Add Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, Chara Dasha, contradictions, and timing relevance.',
    schoolLane: 'JAIMINI',
    title: 'Jaimini soul role and destiny chapter',
    whatItMeans:
      'Shows the role the chart asks the user to mature into, how they become visible, and what the active destiny chapter is asking from them.',
  },
  {
    boundary:
      'Jaimini-only relationship/public-image context. Keep it guidance-first and avoid fatalistic labels.',
    calculationState: 'available',
    freeDepth:
      'Explain Arudha/Upapada-style visible identity and relationship mirror in plain language.',
    handoffPrompt: 'Explain my Jaimini relationship mirror',
    id: 'jaimini-arudha-upapada',
    premiumDepth:
      'Add public image, partner mirror, role tension, Chara Dasha relevance, and practical integration guidance.',
    schoolLane: 'JAIMINI',
    title: 'Jaimini Arudha and Upapada mirror',
    whatItMeans:
      'Shows how the user is perceived, what relationship mirrors back, and where destiny asks for maturity in partnership and public life.',
  },
  {
    boundary:
      'Numerology-only context unless the user explicitly asks for Life Atlas or approved Vedic-plus-Numerology synthesis.',
    calculationState: 'available',
    freeDepth:
      'Explain name rhythm, birth code, destiny/life-path, and current cycle as practical guidance.',
    handoffPrompt: 'Explain my Numerology current cycle',
    id: 'numerology-number-signature',
    premiumDepth:
      'Add name scanner, missing/repeated grid, personal year/month/day timeline, compatibility, name fit, and refinement guidance.',
    schoolLane: 'NUMEROLOGY',
    title: 'Numerology number signature and current cycle',
    whatItMeans:
      'Shows the user’s number identity, how the name projects, what the birth code asks for, and what cycle is active now.',
  },
  {
    boundary:
      'Numerology-only name refinement context. Never scare the user into changing a name.',
    calculationState: 'available',
    freeDepth:
      'Explain the current name rhythm and whether it supports expression, steadiness, or timing in simple terms.',
    handoffPrompt: 'Explain my name rhythm',
    id: 'numerology-name-rhythm',
    premiumDepth:
      'Compare supplied name options, show fit score components carefully, and explain benefits/cautions without guarantees.',
    schoolLane: 'NUMEROLOGY',
    title: 'Numerology name rhythm',
    whatItMeans:
      'Shows how a name carries number rhythm and how that rhythm can support or complicate expression, identity, and timing.',
  },
  {
    boundary:
      'Signature-only confirmed-trait context. Never infer from missing, blank, or unconfirmed signature data.',
    calculationState: 'optional',
    freeDepth:
      'Explain confirmed visible traits, confidence rhythm, consistency, and one self-expression practice.',
    handoffPrompt: 'Explain my Signature trait map',
    id: 'signature-trait-map',
    premiumDepth:
      'Add multi-trait synthesis, comparison if multiple samples exist, improvement plan, privacy note, and confidence limits.',
    schoolLane: 'SIGNATURE',
    title: 'Signature trait map',
    whatItMeans:
      'Reflects visible self-expression traits from a confirmed signature sample while staying non-forensic and non-diagnostic.',
  },
  {
    boundary:
      'Signature privacy/safety context. Do not claim storage, identity verification, diagnosis, or guaranteed prediction.',
    calculationState: 'optional',
    freeDepth:
      'Explain what was used, what was not stored, and what the user may need to re-upload or redraw.',
    handoffPrompt: 'Explain my Signature privacy note',
    id: 'signature-privacy-boundary',
    premiumDepth:
      'Add confirmed-trait evidence, comparison boundary, and refinement steps without storing raw signature images by default.',
    schoolLane: 'SIGNATURE',
    title: 'Signature privacy and safety boundary',
    whatItMeans:
      'Tells the user that Signature Predicta uses only confirmed visible traits from the current session and stays reflective, not forensic.',
  },
  {
    boundary:
      'Life Atlas synthesis context. It is the only approved all-school synthesis lane and should stay non-technical in the main answer.',
    calculationState: 'available',
    freeDepth:
      'Explain the soul portrait, current chapter, hidden thread, gifts, lessons, and next honest step in human language.',
    handoffPrompt: 'Explain my Life Atlas hidden thread',
    id: 'life-atlas-hidden-thread',
    premiumDepth:
      'Add deeper life arc, destiny pattern, love/work/money/purpose synthesis, practices, shadow-to-gift map, and closing-letter depth.',
    schoolLane: 'SYNTHESIS',
    title: 'Life Atlas hidden thread and current chapter',
    whatItMeans:
      'Names the life pattern tying the user’s journey together and translates available evidence into a non-technical life mirror.',
  },
  {
    boundary:
      'Life Atlas evidence appendix context. Evidence stays after the human reading and must not replace the soul portrait.',
    calculationState: 'available',
    freeDepth:
      'Explain which evidence layers were used at a high level without turning the answer technical.',
    handoffPrompt: 'Explain how Predicta built my Life Atlas',
    id: 'life-atlas-evidence-appendix',
    premiumDepth:
      'Name Vedic, KP, Jaimini, Numerology, and optional Signature evidence layers with boundaries, contradictions, and confidence limits.',
    schoolLane: 'SYNTHESIS',
    title: 'How Predicta built this Life Atlas',
    whatItMeans:
      'Shows the evidence layers behind the Life Atlas while keeping the main report focused on life guidance, not method schooling.',
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
  const mastery = buildFinalReportMemoryMastery({
    mode,
    reportFocus,
    schoolLane,
  });

  return {
    architectureStages: [...PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.stages],
    availableSections,
    chatMasteryRule: mastery.chatMasteryRule,
    compactPreviewRule:
      PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.compactPreviewRule,
    depthContract: mastery.depthContract,
    freePaidDepthRule: PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.depthRule,
    generatedAt,
    mode,
    reportFocus,
    reportTitle,
    schoolLane,
    selectedSections,
    schoolBoundaryRule: mastery.schoolBoundaryRule,
    subjectName,
  };
}

function buildFinalReportMemoryMastery({
  mode,
  reportFocus,
  schoolLane,
}: {
  mode: ReportMemoryDepth;
  reportFocus: string;
  schoolLane: ReportSchoolLaneId;
}): {
  chatMasteryRule: string;
  depthContract: string;
  schoolBoundaryRule: string;
} {
  const laneKey: FinalReportLaneMemoryKey =
    reportFocus === 'LIFE_ATLAS'
      ? 'LIFE_ATLAS'
      : schoolLane;
  const laneMastery = PREDICTA_FINAL_REPORT_LANE_MASTERY[laneKey];
  const activeDepth =
    mode === 'PREMIUM'
      ? 'Active report mode is Premium/paid: add deeper evidence, timing, contradictions, and practical depth while staying user-facing.'
      : 'Active report mode is Free: give useful prediction and key evidence without teasing or exposing paid-only dossier depth.';

  return {
    chatMasteryRule: `${PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.responseRule} ${laneMastery}`,
    depthContract: `${activeDepth} ${PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.depthRule}`,
    schoolBoundaryRule: `${PREDICTA_FINAL_REPORT_ARCHITECTURE_MEMORY.schoolBoundaryRule} Active report focus is ${reportFocus}; active school lane is ${schoolLane}.`,
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
