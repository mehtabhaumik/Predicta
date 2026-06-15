import type {
  KundliData,
  PredictaSchool,
  SignatureAnalysisModel,
  SupportedLanguage,
} from '@pridicta/types';
import { getPredictaChatLabel, getPredictaChatPhrase } from '@pridicta/config';
import {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
  type EventOracleEvidenceContract,
  type EventOracleEvidenceInputLayer,
  type EventOracleEvidenceLayerId,
} from './eventOracleEvidenceContract';
import {
  buildEventOraclePredictionObject,
  buildEventOracleReadingDigest,
  type EventOraclePredictionObject,
} from './eventOraclePredictionEngine';
import {
  refineEventQuestion,
  type EventQuestionRefinement,
} from './eventOracleQuestions';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { composeJaiminiInterpretation } from './jaiminiInterpretation';
import { composeKundliKarmaSnapshot } from './kundliKarmaSnapshotEngine';
import { composeLifeAtlasReport } from './lifeAtlasReport';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composeNumerologyFoundationModel } from './numerologyFoundationModel';

export type PredictaMultiSchoolConsultationStatus =
  | 'needs_kundli'
  | 'ready'
  | 'room_safe_blocked';

export type PredictaMultiSchoolConsultationInput = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  language?: SupportedLanguage;
  predictaSchool?: PredictaSchool;
  question: string;
  signatureAnalysis?: SignatureAnalysisModel;
};

export type PredictaMultiSchoolConsultation = {
  confidence: EventOraclePredictionObject['confidence'];
  consultedSchools: EventOracleEvidenceLayerId[];
  directAnswer: string;
  evidenceContract?: EventOracleEvidenceContract;
  evidenceUsed: string[];
  nextAction: string;
  prediction?: EventOraclePredictionObject;
  refinement: EventQuestionRefinement;
  reply: string;
  roomSafeBoundary?: string;
  status: PredictaMultiSchoolConsultationStatus;
};

const ROOM_SAFE_BOUNDARIES: Partial<Record<PredictaSchool, string>> = {
  JAIMINI:
    'You are inside Jaimini Predicta, so I will not silently mix KP, Vedic, Numerology, Signature, or Life Atlas here. Open main Predicta for all-school synthesis.',
  KP:
    'You are inside KP Predicta, so I will not silently mix Vedic, Jaimini, Numerology, Signature, or Life Atlas here. Open main Predicta for all-school synthesis.',
  NADI:
    'Nadi has been replaced by Jaimini in Predicta. Open Jaimini or main Predicta for the right evidence path.',
  NUMEROLOGY:
    'You are inside Numerology Predicta, so I will not silently mix Kundli schools here. Open main Predicta for all-school synthesis.',
  SIGNATURE:
    'You are inside Signature Predicta, so I will not silently mix chart schools here. Open main Predicta for all-school synthesis.',
};

export function isPredictaMultiSchoolQuestion(question: string): boolean {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return false;
  return /\b(will|when|should|likely|possible|chance|predict|prediction|timing|trigger|delay|career|job|promotion|foreign|abroad|visa|pr|relocation|marriage|relationship|love|property|money|business|education|court|legal|family|child|matching|health|wellness|guide me|no question)\b/i.test(
    normalized,
  );
}

export function composePredictaMultiSchoolConsultation({
  hasPremiumAccess = false,
  kundli,
  language = 'en',
  predictaSchool,
  question,
  signatureAnalysis,
}: PredictaMultiSchoolConsultationInput): PredictaMultiSchoolConsultation {
  const refinement = refineEventQuestion(question);
  const roomSafeBoundary = predictaSchool
    ? ROOM_SAFE_BOUNDARIES[predictaSchool]
    : undefined;

  if (roomSafeBoundary) {
    return {
      confidence: {
        evidenceBacked: true,
        explanation:
          'Room-safe mode prevents silent school mixing. Use main Predicta for all-school consultation.',
        label: 'Not enough evidence',
        level: 'not_enough_evidence',
        score: 0,
      },
      consultedSchools: [],
      directAnswer: 'Open main Predicta for all-school synthesis.',
      evidenceUsed: [],
      nextAction: 'Stay in this specialist room or open main Predicta for synthesis.',
      refinement,
      reply: roomSafeBoundary,
      roomSafeBoundary,
      status: 'room_safe_blocked',
    };
  }

  if (!kundli) {
    return {
      confidence: {
        evidenceBacked: true,
        explanation:
          'Predicta needs a selected Kundli before consulting the astrology schools.',
        label: 'Not enough evidence',
        level: 'not_enough_evidence',
        score: 0,
      },
      consultedSchools: refinement.downstream.evidenceRooms,
      directAnswer: 'Needs Kundli: select or create a Kundli first.',
      evidenceUsed: [],
      nextAction:
        'Send name, date of birth, birth time, and birth place so Predicta can calculate the evidence before predicting.',
      refinement,
      reply: [
        'Needs Kundli: I can consult Vedic, KP, Jaimini, Kundli Karma, Numerology, and optional Signature only after a Kundli is selected.',
        'Next action: send name, date of birth, birth time, and birth place. I will create the Kundli without spending an AI credit, then answer the event question.',
      ].join('\n\n'),
      status: 'needs_kundli',
    };
  }

  const evidenceContract = buildEventOracleEvidenceContract({
    layers: buildEvidenceLayers({
      hasPremiumAccess,
      kundli,
      refinement,
      signatureAnalysis,
    }),
    refinement,
  });
  const prediction = buildEventOraclePredictionObject({
    evidenceContract,
    refinement,
    timing: buildTimingInput(kundli, evidenceContract.layers.map(layer => layer.layerId)),
    trigger: {
      evidenceLayerIds: evidenceContract.layers
        .filter(layer => layer.availability !== 'missing')
        .slice(0, 3)
        .map(layer => layer.layerId),
      label: 'Most likely real-world trigger',
      summary: buildTriggerSummary(refinement.categoryId),
    },
  });
  const digest = buildEventOracleReadingDigest(
    prediction,
    hasPremiumAccess ? 'PAID' : 'FREE',
  );
  const evidenceUsed = prediction.collapsedEvidence
    .filter(item => item.availability !== 'missing')
    .map(item => `${item.label}: ${item.stance}. ${item.summary}`);
  const conflicts = prediction.collapsedEvidence
    .filter(item => item.stance === 'blocks' || item.stance === 'mixed')
    .map(item => `${item.label}: ${item.summary}`);
  const nextAction = prediction.whatToDoNow[0] ?? digest.action[0] ?? 'Ask one sharper event question.';

  return {
    confidence: prediction.confidence,
    consultedSchools: prediction.collapsedEvidence.map(item => item.layerId),
    directAnswer: prediction.directAnswer,
    evidenceContract,
    evidenceUsed,
    nextAction,
    prediction,
    refinement,
    reply: buildReply({
      conflicts,
      evidenceUsed,
      language,
      nextAction,
      prediction,
      refinement,
    }),
    status: 'ready',
  };
}

function buildEvidenceLayers({
  hasPremiumAccess,
  kundli,
  refinement,
  signatureAnalysis,
}: {
  hasPremiumAccess: boolean;
  kundli: KundliData;
  refinement: EventQuestionRefinement;
  signatureAnalysis?: SignatureAnalysisModel;
}): Partial<Record<EventOracleEvidenceLayerId, EventOracleEvidenceInputLayer>> {
  const layers: Partial<Record<EventOracleEvidenceLayerId, EventOracleEvidenceInputLayer>> = {};

  for (const layerId of refinement.downstream.evidenceRooms) {
    if (layerId === 'vedic') {
      layers.vedic = safeLayer('vedic', () => buildVedicLayer(kundli));
    }
    if (layerId === 'kp') {
      layers.kp = safeLayer('kp', () => buildKpLayer(kundli));
    }
    if (layerId === 'jaimini') {
      layers.jaimini = safeLayer('jaimini', () =>
        buildJaiminiLayer(kundli, hasPremiumAccess),
      );
    }
    if (layerId === 'kundliKarma') {
      layers.kundliKarma = safeLayer('kundliKarma', () =>
        buildKundliKarmaLayer(kundli),
      );
    }
    if (layerId === 'numerology') {
      layers.numerology = safeLayer('numerology', () => buildNumerologyLayer(kundli));
    }
    if (layerId === 'signature') {
      layers.signature = buildSignatureLayer(signatureAnalysis);
    }
  }

  layers.lifeAtlas = safeLayer('lifeAtlas', () =>
    buildLifeAtlasLayer(kundli, hasPremiumAccess, signatureAnalysis),
  );
  return layers;
}

function safeLayer(
  layerId: EventOracleEvidenceLayerId,
  build: () => EventOracleEvidenceInputLayer,
): EventOracleEvidenceInputLayer {
  try {
    return build();
  } catch (error) {
    return {
      availability: 'partial',
      confidence: 'weak',
      stance: 'mixed',
      summary: `${layerId} evidence is partially available, but one deterministic sub-module needs richer chart data before Predicta can treat it as strong.`,
      technicalPoints: [
        error instanceof Error ? error.message : 'Unknown deterministic layer issue.',
      ],
    };
  }
}

function buildVedicLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const dasha = composeMahadashaIntelligence(kundli, { depth: 'FREE' });
  const current = dasha.current;
  return createReadySupportLayer(
    'supports',
    `Vedic timing is active through ${current.mahadasha}/${current.antardasha}; D1, Moon, D9, D10, Chalit, dasha, Yog, Dosh, Shrap, and Lal Kitab remain the foundation before a prediction is finalized.`,
  );
}

function buildKpLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const kp = composeChalitBhavKpFoundation(kundli, { depth: 'FREE' }).kp;
  const stance = kp.eventJudgement.confidence === 'uncertain' ? 'mixed' : 'supports';
  const confidence =
    kp.eventJudgement.confidence === 'clear'
      ? 'strong'
      : kp.eventJudgement.confidence === 'partial'
        ? 'moderate'
        : 'weak';
  return {
    availability: kp.eventJudgement.confidence === 'uncertain' ? 'partial' : 'ready',
    confidence,
    stance,
    summary: `KP says: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
    technicalPoints: [
      kp.eventJudgement.promise,
      kp.eventJudgement.mainBlock,
      kp.eventJudgement.timingReadiness,
    ],
  };
}

function buildJaiminiLayer(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): EventOracleEvidenceInputLayer {
  const jaimini = composeJaiminiInterpretation(kundli, {
    premium: hasPremiumAccess,
  });
  const firstBlock = (hasPremiumAccess ? jaimini.premiumBlocks : jaimini.freeBlocks)[0];
  return createReadySupportLayer(
    'supports',
    firstBlock
      ? `Jaimini says: ${firstBlock.prediction}`
      : `Jaimini says: ${jaimini.summary}`,
  );
}

function buildKundliKarmaLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const snapshot = composeKundliKarmaSnapshot(kundli);
  const topCondition = snapshot.topThreeActiveConditions[0];
  const stance = topCondition?.item.module === 'SUPPORTIVE_YOG' ? 'supports' : 'mixed';
  return {
    availability: snapshot.calculationStatus === 'ready' ? 'ready' : 'partial',
    confidence: topCondition?.item.confidence === 'clear' ? 'strong' : 'moderate',
    stance,
    summary: topCondition
      ? `Kundli Karma highlights ${topCondition.item.displayName}: ${topCondition.item.meaningForUser}`
      : snapshot.summary,
    technicalPoints: [
      snapshot.strongestDosh?.item.displayName,
      snapshot.strongestShrapOrRin?.item.displayName,
      snapshot.strongestYog?.item.displayName,
      snapshot.topRemedy?.title,
    ].filter((item): item is string => Boolean(item)),
  };
}

function buildNumerologyLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const numerology =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  if (numerology.status !== 'ready') {
    return {
      availability: 'partial',
      confidence: 'weak',
      stance: 'neutral',
      summary:
        'Numerology timing color is pending because name/date number readiness is incomplete.',
    };
  }
  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Numerology timing color: ${numerology.identityDashboard.lifeThemeSentence} Current cycle asks: ${numerology.identityDashboard.bestUseOfCurrentCycle}`,
    technicalPoints: numerology.evidence.slice(0, 4),
  };
}

function buildSignatureLayer(
  signatureAnalysis: SignatureAnalysisModel | undefined,
): EventOracleEvidenceInputLayer {
  if (signatureAnalysis?.status !== 'ready') {
    return {
      availability: 'missing',
      missingReason:
        'Signature evidence is optional and no confirmed visible signature traits are available.',
      stance: 'neutral',
      summary:
        'Signature evidence is optional and was not used because no confirmed signature traits were supplied.',
    };
  }

  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Signature expression layer says: ${signatureAnalysis.summary}`,
    technicalPoints: signatureAnalysis.evidence.slice(0, 4),
  };
}

function buildLifeAtlasLayer(
  kundli: KundliData,
  hasPremiumAccess: boolean,
  signatureAnalysis: SignatureAnalysisModel | undefined,
): EventOracleEvidenceInputLayer {
  const lifeAtlas = composeLifeAtlasReport(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    signatureAnalysis,
  });
  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Life Atlas context: ${lifeAtlas.hiddenThread}`,
    technicalPoints: lifeAtlas.evidenceLayers
      .filter(layer => layer.status !== 'missing')
      .slice(0, 4)
      .map(layer => `${layer.label}: ${layer.summary}`),
  };
}

function buildTimingInput(
  kundli: KundliData,
  evidenceLayerIds: EventOracleEvidenceLayerId[],
) {
  const current = kundli.dasha.current;
  return {
    basis: `Current Vimshottari timing: ${current.mahadasha}/${current.antardasha}.`,
    endDate: current.endDate,
    evidenceLayerIds: evidenceLayerIds.slice(0, 3),
    label: `${current.mahadasha}/${current.antardasha} active window`,
    precision: 'dasha_window' as const,
    startDate: current.startDate,
  };
}

function buildTriggerSummary(categoryId: EventQuestionRefinement['categoryId']): string {
  switch (categoryId) {
    case 'foreign_travel':
      return 'The trigger may come through employer movement, document progress, client need, senior colleague change, or travel approval.';
    case 'career_move':
    case 'job_change':
    case 'promotion':
      return 'The trigger may come through manager movement, role opening, team restructuring, review cycle, recruiter contact, or visible work success.';
    case 'marriage_timing':
    case 'relationship_outcome':
      return 'The trigger may come through a serious conversation, family involvement, proposal, reconciliation, or commitment decision.';
    case 'money_property':
      return 'The trigger may come through paperwork, loan movement, buyer/seller response, cash-flow clarity, or a practical deadline.';
    default:
      return 'The trigger is likely to appear as a practical opening, conversation, approval, deadline, or responsibility shift tied to the question.';
  }
}

function buildReply({
  conflicts,
  evidenceUsed,
  language,
  nextAction,
  prediction,
  refinement,
}: {
  conflicts: string[];
  evidenceUsed: string[];
  language: SupportedLanguage;
  nextAction: string;
  prediction: EventOraclePredictionObject;
  refinement: EventQuestionRefinement;
}): string {
  if (language === 'hi' || language === 'gu') {
    const nativeAnswer = nativeEventDirectAnswer(language, refinement.categoryId);
    return [
      nativeLine(language, 'directAnswer', nativeAnswer),
      nativeLine(
        language,
        'timing',
        nativeEventTimingHonesty(language),
      ),
      nativeLine(
        language,
        'mostLikelyTrigger',
        nativeEventTrigger(language, refinement.categoryId),
      ),
      nativeLine(
        language,
        'confidence',
        `${nativeConfidence(language, prediction.confidence.label)} (${prediction.confidence.score}/100)`,
      ),
      nativeLine(language, 'actionRemedy', nativeEventAction(language, refinement.categoryId)),
      nativeLine(language, 'evidence', getPredictaChatPhrase(language, 'eventEvidenceGeneric')),
      nativeLine(
        language,
        'conflicts',
        conflicts.length
          ? nativeConflictRespect(language)
          : getPredictaChatPhrase(language, 'eventNoConflict'),
      ),
      nativeLine(language, 'nextStep', nativeEventAction(language, refinement.categoryId)),
    ].join('\n\n');
  }
  return [
    `Direct answer: ${prediction.directAnswer}`,
    `Timing: ${prediction.timingWindow.label}. ${prediction.timingWindow.honestyNote}`,
    `Most likely trigger: ${prediction.mostLikelyTrigger.summary}`,
    `Confidence: ${prediction.confidence.label} (${prediction.confidence.score}/100). ${prediction.confidence.explanation}`,
    `Action/remedy: ${nextAction}`,
    evidenceUsed.length
      ? `Evidence used:\n${evidenceUsed.slice(0, 5).map(item => `- ${item}`).join('\n')}`
      : 'Evidence used: not enough source evidence is ready yet.',
    conflicts.length
      ? `Conflicts I am respecting:\n${conflicts.slice(0, 3).map(item => `- ${item}`).join('\n')}`
      : 'Conflicts: no major conflict strong enough to downgrade the answer heavily.',
    `Next action: ${nextAction}`,
  ].join('\n\n');
}

function nativeLine(
  language: SupportedLanguage,
  labelId: Parameters<typeof getPredictaChatLabel>[1],
  value: string,
): string {
  return `${getPredictaChatLabel(language, labelId)}: ${value}`;
}

function nativeConfidence(language: SupportedLanguage, label: string): string {
  if (language === 'hi') {
    if (/high/i.test(label)) return 'उच्च';
    if (/low|not enough/i.test(label)) return 'कम';
    return 'मध्यम';
  }
  if (/high/i.test(label)) return 'ઉચ્ચ';
  if (/low|not enough/i.test(label)) return 'ઓછો';
  return 'મધ્યમ';
}

function nativeEventTimingHonesty(language: SupportedLanguage): string {
  return language === 'hi'
    ? 'समय संकेत दशा, गोचर और घटना-प्रमाण के साथ पढ़ा गया है; इसे पक्की तारीख नहीं मानना चाहिए.'
    : 'સમય સંકેત દશા, ગોચર અને ઘટના-પુરાવા સાથે વાંચવામાં આવ્યો છે; તેને ચોક્કસ તારીખ ન માનવી.';
}

function nativeConflictRespect(language: SupportedLanguage): string {
  return language === 'hi'
    ? 'कुछ संकेत सावधानी मांगते हैं, इसलिए Predicta उत्तर को ज़बरदस्ती पक्का नहीं बना रही.'
    : 'કેટલાક સંકેતો સાવધાની માંગે છે, એટલે Predicta જવાબને જબરદસ્તી પક્કો બનાવી રહી નથી.';
}

function nativeEventDirectAnswer(
  language: SupportedLanguage,
  categoryId: EventQuestionRefinement['categoryId'],
): string {
  const hi: Record<EventQuestionRefinement['categoryId'], string> = {
    business_growth: 'व्यवसाय में बढ़त संभव है, लेकिन एक साफ़ दिशा और समय-सहारा चाहिए.',
    career_move: 'करियर में अर्थपूर्ण बदलाव संभव दिखता है; इसे तैयारी और सही अवसर से मजबूत करें.',
    court_litigation: 'कानूनी मामले में जल्दबाज़ी नहीं; कागज़ और सलाह को प्राथमिकता दें.',
    education_study_stream: 'पढ़ाई की दिशा में रुचि से ज्यादा स्थिरता और अभ्यास निर्णायक रहेंगे.',
    family_child_matching: 'परिवार या मिलान में प्रगति संभव है, पर भावनात्मक दबाव को शांत रखना होगा.',
    foreign_travel: 'विदेश से जुड़ा अवसर संभव है; संकेत काम, दस्तावेज़ या संस्था के माध्यम से खुल सकते हैं.',
    guide_me: 'पहला सही सवाल वही है जहां अभी दबाव और समय-संकेत सबसे सक्रिय हैं.',
    job_change: 'नौकरी बदलने का संकेत संभव है; स्थिरता बचाकर चुनिंदा अवसरों पर ध्यान दें.',
    marriage_timing: 'विवाह की दिशा में संकेत बन सकते हैं, लेकिन परिवार, तैयारी और समय साथ आने चाहिए.',
    money_property: 'धन या संपत्ति का निर्णय संभव है, पर कागज़, नकदी और समय को दोबारा जांचें.',
    promotion: 'प्रमोशन या पहचान की संभावना है; काम को दिखाई देने लायक बनाना जरूरी है.',
    relationship_outcome: 'रिश्ते में दिशा तभी मजबूत होगी जब व्यवहार वादों से मेल खाए.',
    relocation: 'स्थान परिवर्तन संभव है; लाभ तभी बढ़ेगा जब भूमिका, घर और परिवार की जमीन साफ़ हो.',
    visa_pr: 'वीज़ा या दस्तावेज़ प्रगति संभव है; कागज़ और संस्था-सहारा सबसे अहम हैं.',
    wellness_caution: 'स्वास्थ्य में यह सावधानी का संकेत है, निदान नहीं; दिनचर्या और डॉक्टर की सलाह प्राथमिक रखें.',
  };
  const gu: Record<EventQuestionRefinement['categoryId'], string> = {
    business_growth: 'વ્યવસાયમાં વૃદ્ધિ શક્ય છે, પરંતુ સ્પષ્ટ દિશા અને સમય સહારો જોઈએ.',
    career_move: 'કરિયરમાં અર્થપૂર્ણ ફેરફાર શક્ય લાગે છે; તૈયારી અને યોગ્ય તકથી તેને મજબૂત કરો.',
    court_litigation: 'કાનૂની બાબતમાં ઉતાવળ નહીં; કાગળ અને સલાહને પ્રાથમિકતા આપો.',
    education_study_stream: 'અભ્યાસની દિશામાં રસ કરતાં સ્થિરતા અને અભ્યાસ વધારે નિર્ણાયક રહેશે.',
    family_child_matching: 'પરિવાર અથવા મેળાપમાં પ્રગતિ શક્ય છે, પણ ભાવનાત્મક દબાણ શાંત રાખવું પડશે.',
    foreign_travel: 'વિદેશ સંબંધિત તક શક્ય છે; સંકેત કામ, દસ્તાવેજ અથવા સંસ્થા મારફતે ખુલી શકે છે.',
    guide_me: 'પહેલો સાચો સવાલ ત્યાં છે જ્યાં દબાણ અને સમય સંકેત સૌથી સક્રિય છે.',
    job_change: 'નોકરી બદલવાનો સંકેત શક્ય છે; સ્થિરતા બચાવીને પસંદગીના અવસરો પર ધ્યાન આપો.',
    marriage_timing: 'લગ્નની દિશામાં સંકેતો બની શકે છે, પરંતુ પરિવાર, તૈયારી અને સમય સાથે આવવા જોઈએ.',
    money_property: 'પૈસા અથવા મિલકતનો નિર્ણય શક્ય છે, પણ કાગળ, રોકડ પ્રવાહ અને સમય ફરી તપાસો.',
    promotion: 'પ્રમોશન અથવા ઓળખની સંભાવના છે; કામને દેખાય તેવું બનાવવું જરૂરી છે.',
    relationship_outcome: 'સંબંધની દિશા ત્યારે જ મજબૂત થશે જ્યારે વર્તન વચનો સાથે મેળ ખાય.',
    relocation: 'સ્થળ બદલાવ શક્ય છે; લાભ ત્યારે વધશે જ્યારે ભૂમિકા, ઘર અને પરિવારની જમીન સ્પષ્ટ હોય.',
    visa_pr: 'વીઝા અથવા દસ્તાવેજ પ્રગતિ શક્ય છે; કાગળ અને સંસ્થા સહારો સૌથી મહત્વનું છે.',
    wellness_caution: 'સ્વાસ્થ્યમાં આ સાવચેતીનો સંકેત છે, નિદાન નહીં; રૂટિન અને ડોક્ટરની સલાહ પ્રાથમિક રાખો.',
  };
  return language === 'hi' ? hi[categoryId] : gu[categoryId];
}

function nativeEventTrigger(
  language: SupportedLanguage,
  categoryId: EventQuestionRefinement['categoryId'],
): string {
  const isHi = language === 'hi';
  if (categoryId === 'foreign_travel' || categoryId === 'visa_pr') {
    return isHi
      ? 'काम की जरूरत, दस्तावेज़, वरिष्ठ व्यक्ति, टीम बदलाव या यात्रा-स्वीकृति.'
      : 'કામની જરૂર, દસ્તાવેજ, વરિષ્ઠ વ્યક્તિ, ટીમ ફેરફાર અથવા પ્રવાસ મંજૂરી.';
  }
  if (categoryId === 'career_move' || categoryId === 'job_change' || categoryId === 'promotion') {
    return isHi
      ? 'मैनेजर बदलाव, भूमिका खुलना, समीक्षा समय, भर्ती संपर्क या दिखता हुआ काम.'
      : 'મેનેજર ફેરફાર, ભૂમિકા ખુલવી, સમીક્ષા સમય, ભરતી સંપર્ક અથવા દેખાતું કામ.';
  }
  if (categoryId === 'marriage_timing' || categoryId === 'relationship_outcome') {
    return isHi
      ? 'गंभीर बातचीत, परिवार की भागीदारी, प्रस्ताव, सुलह या प्रतिबद्धता निर्णय.'
      : 'ગંભીર વાતચીત, પરિવારની ભાગીદારી, પ્રસ્તાવ, સમાધાન અથવા પ્રતિબદ્ધતા નિર્ણય.';
  }
  if (categoryId === 'money_property') {
    return isHi
      ? 'कागज़, ऋण अपडेट, खरीददार/विक्रेता उत्तर, नकदी स्पष्टता या समय सीमा.'
      : 'કાગળ, લોન અપડેટ, ખરીદદાર/વેચનાર જવાબ, રોકડ સ્પષ્ટતા અથવા સમયમર્યાદા.';
  }
  return isHi
    ? 'व्यावहारिक अवसर, बातचीत, मंजूरी, जिम्मेदारी या समय-सीमा.'
    : 'વ્યવહારુ તક, વાતચીત, મંજૂરી, જવાબદારી અથવા સમયમર્યાદા.';
}

function nativeEventAction(
  language: SupportedLanguage,
  categoryId: EventQuestionRefinement['categoryId'],
): string {
  const isHi = language === 'hi';
  if (categoryId === 'money_property') {
    return isHi
      ? 'कागज़, बजट और नकदी सुरक्षा जांचकर ही अगला कदम लें.'
      : 'કાગળ, બજેટ અને રોકડ સુરક્ષા તપાસીને જ આગળનું પગલું લો.';
  }
  if (categoryId === 'foreign_travel' || categoryId === 'visa_pr') {
    return isHi
      ? 'दस्तावेज़ तैयार रखें और काम/संस्था से आने वाले संकेतों पर ध्यान दें.'
      : 'દસ્તાવેજ તૈયાર રાખો અને કામ/સંસ્થા તરફથી આવતા સંકેતો પર ધ્યાન આપો.';
  }
  if (categoryId === 'marriage_timing' || categoryId === 'relationship_outcome') {
    return isHi
      ? 'भावना से पहले स्पष्ट बातचीत और व्यवहार की निरंतरता देखें.'
      : 'ભાવના પહેલાં સ્પષ્ટ વાતચીત અને વર્તનની સતતતા જુઓ.';
  }
  return isHi
    ? 'तैयारी साफ़ रखें, जल्दबाज़ी न करें, और संकेत दिखते ही व्यावहारिक कदम लें.'
    : 'તૈયારી સ્પષ્ટ રાખો, ઉતાવળ ન કરો, અને સંકેત દેખાય ત્યારે વ્યવહારુ પગલું લો.';
}
