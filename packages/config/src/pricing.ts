import type {
  BillingPeriod,
  OneTimeProduct,
  OneTimeProductType,
  PricingPlan,
} from '@pridicta/types';
import { getMonetizationProductCopy } from './monetizationCopy';

export const SUBSCRIPTION_PRICING = {
  monthly: 299,
  quarterly: 799,
  weekly: 99,
  yearly: 1999,
  yearlyRegular: 2999,
} as const;

export const ONE_TIME_PRICING = {
  aiQuestions10: 199,
  aiQuestions25: 449,
  aiQuestions100: 1499,
  dayPass: 49,
  detailedKundliReport: 399,
  fiveQuestions: 149,
  jaiminiReport: 249,
  marriageCompatibilityReport: 499,
  premiumPdf: 249,
  precisionFollowUpPack: 149,
  precisionReading: 399,
  reportBundle: 999,
  reportSingle: 299,
} as const;

export const PREMIUM_FEATURE_STORY = [
  {
    body: 'Turn a serious question into chart proof, confidence, timing context, and next steps.',
    title: 'Get a deeper answer',
  },
  {
    body: 'See the month-by-month dasha and transit windows behind the current life phase.',
    title: 'Plan timing clearly',
  },
  {
    body: 'Keep family Kundlis together, compare patterns, and ask Predicta with the right profile selected.',
    title: 'Understand family charts',
  },
  {
    body: 'Create focused PDFs for Kundli, Career, Marriage, Wealth, Child, and Remedies.',
    title: 'Create polished reports',
  },
  {
    body: 'Open varga, dasha, transit, Ashtakavarga, and evidence tables when you want the full reasoning.',
    title: 'Check the deeper proof',
  },
] as const;

export type ReportMarketplaceProduct = {
  badge: string;
  bestFor: string;
  freeIncludes: string[];
  freeDepth: string;
  id:
    | 'KUNDLI'
    | 'VEDIC'
    | 'KP'
    | 'JAIMINI'
    | 'CAREER'
    | 'MARRIAGE'
    | 'WEALTH'
    | 'SADESATI'
    | 'DASHA'
    | 'COMPATIBILITY'
    | 'LIFE_ATLAS'
    | 'NUMEROLOGY'
    | 'SIGNATURE'
    | 'REMEDIES';
  outcome: string;
  premiumIncludes: string[];
  premiumDepth: string;
  prompt: string;
  purchaseHint: string;
  school: 'JAIMINI' | 'KP' | 'NUMEROLOGY' | 'SIGNATURE' | 'SYNTHESIS' | 'VEDIC';
  title: string;
  userWillLearn: string;
  premiumAdds: string;
};

export type ReportPurchaseGuide = {
  body: string;
  cta: string;
  label: string;
  title: string;
};

export type ReportPreviewAlignment = {
  compactPromise: string;
  downloadNudge: string;
  focusLine: string;
  previewBullets: string[];
};

const REPORT_MARKETPLACE_PRODUCTS: ReportMarketplaceProduct[] = [
  {
    badge: 'Flagship',
    bestFor: 'A non-technical life journey, soul purpose, hidden thread, current chapter, gifts, lessons, and next direction. Signature is optional enrichment only.',
    freeIncludes: ['Soul portrait', 'Life journey summary', 'Current chapter', 'Top gifts and lessons'],
    freeDepth: 'Useful Life Atlas with a clear soul portrait, life journey arc, current focus, gifts, lessons, and a closing letter.',
    id: 'LIFE_ATLAS',
    outcome: 'Understand your life story without reading planet, cusp, or technical proof.',
    premiumIncludes: ['Deep life narrative', 'Soul-purpose synthesis', 'Karmic pattern map', 'Integration practices', 'Premium closing letter'],
    premiumDepth: 'Flagship synthesis report with deeper life journey, destiny direction, love/work/money/purpose guidance, shadow-to-gift transformation, and practical practices.',
    prompt:
      'Create my Predicta Life Atlas as a non-technical synthesis report. Use Vedic, KP, Jaimini, and Numerology as internal evidence, include Signature only if confirmed traits exist, and do not mix this into any school-specific report.',
    purchaseHint: 'Best when you want Predicta to turn all available data into one non-technical life story.',
    school: 'SYNTHESIS',
    title: 'Predicta Life Atlas',
    userWillLearn:
      'You will learn the life theme Predicta sees, the chapter you are in now, the hidden thread behind repeated patterns, and the next honest direction to follow.',
    premiumAdds:
      'Premium adds a deeper soul-purpose narrative, contradictions between life areas, timing relevance, integration practices, and a memorable closing letter.',
  },
  {
    badge: 'Foundation',
    bestFor: 'A clean starting point for the whole chart.',
    freeIncludes: ['All visible charts', 'Kundli summary', 'Current dasha', 'Useful remedies'],
    freeDepth: 'Kundli, all visible charts, and useful chart signals.',
    id: 'KUNDLI',
    outcome: 'Understand the whole chart without getting lost.',
    premiumIncludes: ['Full chart synthesis', 'Dasha and Gochar timing', 'Yogas and strengths', 'Premium PDF structure'],
    premiumDepth: 'Full synthesis across charts, dasha, gochar, yogas, and remedies.',
    prompt:
      'Create a complete Kundli report preview with useful insights first, then show what a detailed premium PDF would add.',
    purchaseHint: 'Best first report when you want one complete life overview.',
    school: 'VEDIC',
    title: 'Kundli Report',
    userWillLearn:
      'You will learn the main chart direction, the strongest current timing signal, the life areas needing attention, and one practical remedy path.',
    premiumAdds:
      'Premium adds chart-by-chart prediction, house and planet evidence, contradictions, Mahadasha timing, classical tables, and a consolidated remedy plan.',
  },
  {
    badge: 'Vedic',
    bestFor: 'Parashari D1, varga charts, dasha, gochar, and remedies in one Vedic report.',
    freeIncludes: ['D1 proof', 'Key varga preview', 'Current dasha', 'Safe remedy direction'],
    freeDepth: 'Useful Vedic report from D1, key vargas, dasha, gochar, and remedies.',
    id: 'VEDIC',
    outcome: 'Read the chart through Vedic Predicta without mixing other methods.',
    premiumIncludes: ['Full varga synthesis', 'Dasha and Gochar timing', 'Evidence tables', 'Remedy planning'],
    premiumDepth: 'Detailed Vedic Predicta report with varga depth, timing windows, and remedy path.',
    prompt:
      'Create my Vedic Predicta report using D1, key varga charts, dasha, gochar, remedies, and holistic life balance. Do not mix KP, Jaimini, Numerology, or Signature unless I ask.',
    purchaseHint: 'Best when you want the main Vedic astrology reading with clear chart proof.',
    school: 'VEDIC',
    title: 'Vedic Predicta Report',
    userWillLearn:
      'You will learn what the Vedic chart is actually saying about life direction, timing pressure, strengths, blocks, and what to do next.',
    premiumAdds:
      'Premium adds deeper varga prediction, Mahadasha and Gochar timing, chart evidence, cancellation/contradiction handling, and detailed remedy guidance.',
  },
  {
    badge: 'KP',
    bestFor: 'Event questions, cusp proof, star lord, sub lord, ruling planets, and significators.',
    freeIncludes: ['KP cusp preview', 'Star/sub-lord proof', 'Event houses', 'Method boundary'],
    freeDepth: 'Useful KP proof path with cusp and sub-lord focus.',
    id: 'KP',
    outcome: 'Judge event questions through KP Predicta without casual Parashari mixing.',
    premiumIncludes: ['All 12 cusps', 'Significator map', 'Ruling planet support', 'Timing confidence'],
    premiumDepth: 'Detailed KP Predicta report with cusp chain, significators, ruling planets, and event timing.',
    prompt:
      'Create my KP Predicta report using cusps, star lord, sub lord, ruling planets, significators, and event timing. Stay in KP method only.',
    purchaseHint: 'Best for event-oriented questions like job change, marriage timing, approval, or outcome judgment.',
    school: 'KP',
    title: 'KP Predicta Report',
    userWillLearn:
      'You will learn whether the chosen event looks supported, delayed, blocked, or unclear, plus the main support, caution, and next practical step.',
    premiumAdds:
      'Premium adds cusp chains, sub-lord proof, significator hierarchy, ruling planets, timing windows, confidence limits, and practical reality checks.',
  },
  {
    badge: 'Jaimini',
    bestFor: 'Soul role, visible identity, career dharma, relationship mirror, and destiny chapters.',
    freeIncludes: ['Soul-role snapshot', 'Visible identity', 'Career dharma', 'Current destiny chapter'],
    freeDepth: 'Useful Jaimini preview from classical soul and destiny indicators.',
    id: 'JAIMINI',
    outcome: 'Understand the role your chart asks you to grow into.',
    premiumIncludes: ['Karaka council', 'Karakamsha and Swamsa', 'Arudha and Upapada', 'Chara Dasha life map'],
    premiumDepth: 'Detailed Jaimini Predicta report with karakas, visible destiny, relationship mirror, and destiny timing.',
    prompt:
      'Create my Jaimini Predicta report using Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha where calculated evidence is available.',
    purchaseHint: 'Best when you want soul role, public path, relationship mirror, and destiny chapter guidance.',
    school: 'JAIMINI',
    title: 'Jaimini Predicta Report',
    userWillLearn:
      'You will learn the soul-role your life asks you to mature into, how your path becomes visible, and which destiny chapter is active now.',
    premiumAdds:
      'Premium adds full karaka council interpretation, Karakamsha and Swamsa depth, Arudha/Upapada mirrors, Chara Dasha timing, and practical role guidance.',
  },
  {
    badge: 'Work',
    bestFor: 'Career direction, job timing, and professional pressure points.',
    freeIncludes: ['Career houses', 'D10 signal', 'Current work pressure', 'One practical action'],
    freeDepth: 'Simple career focus from the 10th house, D10, dasha, and gochar.',
    id: 'CAREER',
    outcome: 'See work direction, timing pressure, and better next moves.',
    premiumIncludes: ['Role fit', 'Promotion/change windows', 'D1 plus D10 synthesis', 'Monthly action plan'],
    premiumDepth: 'Detailed career timing, role fit, promotion windows, and action plan.',
    prompt:
      'Create my career report using D1, D10, 10th house, dasha, gochar, and clear timing evidence.',
    purchaseHint: 'Best when the question is job change, promotion, business, or career direction.',
    school: 'VEDIC',
    title: 'Career Report',
    userWillLearn:
      'You will learn the work direction to trust, the pressure point to manage, and the next career move that is most practical right now.',
    premiumAdds:
      'Premium adds D10 synthesis, role-fit evidence, promotion or change windows, contradiction checks, and a monthly action plan.',
  },
  {
    badge: 'Marriage',
    bestFor: 'Marriage prospects, relationship maturity, and spouse patterns.',
    freeIncludes: ['D1 relationship signal', 'D9 preview', 'Venus/Jupiter tone', 'Gentle caution'],
    freeDepth: 'Useful D1 and D9 relationship signals with confidence.',
    id: 'MARRIAGE',
    outcome: 'Understand relationship maturity, timing, and partner patterns.',
    premiumIncludes: ['D1 plus D9 synthesis', 'Timing windows', 'Compatibility cautions', 'Relationship remedies'],
    premiumDepth: 'Deep D1 plus D9 synthesis, timing windows, remedies, and red flags gently.',
    prompt:
      'Create my marriage report using D1, D9, 7th house, Venus, Jupiter, dasha, and transit timing.',
    purchaseHint: 'Best for marriage timing, partner nature, delay, or family discussion.',
    school: 'VEDIC',
    title: 'Marriage Report',
    userWillLearn:
      'You will learn the relationship pattern, maturity requirement, likely delay/support signal, and the tone of partner or marriage timing.',
    premiumAdds:
      'Premium adds D1/D9 synthesis, timing windows, partner-pattern evidence, contradiction handling, compatibility cautions, and gentle remedies.',
  },
  {
    badge: 'Money',
    bestFor: 'Income, savings, wealth habits, and financial timing.',
    freeIncludes: ['2nd/11th house signal', 'Dasha money tone', 'Savings caution', 'One grounded habit'],
    freeDepth: 'Money houses, current dasha tone, and practical guidance.',
    id: 'WEALTH',
    outcome: 'Read money flow, saving habits, and better financial timing.',
    premiumIncludes: ['D2 wealth synthesis', 'Income and gains windows', 'Monthly planning', 'Risk and discipline map'],
    premiumDepth: 'D2, 2nd and 11th house synthesis, timing windows, and monthly plan.',
    prompt:
      'Create my wealth report using D1, D2, 2nd house, 11th house, dasha, gochar, and savings guidance.',
    purchaseHint: 'Best when you ask about income, savings, investment timing, or debt pressure.',
    school: 'VEDIC',
    title: 'Wealth Report',
    userWillLearn:
      'You will learn the money rhythm, where income can grow, where leakage or pressure appears, and the financial habit to strengthen first.',
    premiumAdds:
      'Premium adds D2 evidence, income/gains windows, risk and discipline map, debt/savings cautions, and grounded planning guidance.',
  },
  {
    badge: 'Saturn',
    bestFor: 'Sade Sati phase, pressure windows, discipline, and support.',
    freeIncludes: ['Current phase', 'Saturn theme', 'Simple caution', 'Saturn karma remedy'],
    freeDepth: 'Current Sade Sati status, phase, and simple guidance.',
    id: 'SADESATI',
    outcome: 'Understand Saturn pressure without fear.',
    premiumIncludes: ['Exact phase reading', 'Saturn dates', 'Ashtakavarga support', 'Remedy and discipline plan'],
    premiumDepth: 'Exact phase reading, Saturn transit dates, Ashtakavarga support, and remedies.',
    prompt:
      'Create my Sade Sati report with current phase, Saturn transit, Moon chart impact, Ashtakavarga support, and remedies.',
    purchaseHint: 'Best when you feel pressure, delay, responsibility, or Saturn-related fear.',
    school: 'VEDIC',
    title: 'Sade Sati Report',
    userWillLearn:
      'You will learn what Saturn is pressuring, what discipline it is asking for, and how to respond without fear.',
    premiumAdds:
      'Premium adds exact phase context, Saturn transit dates, Moon-chart impact, Ashtakavarga support, remedy rhythm, and stop-doing cautions.',
  },
  {
    badge: 'Timing',
    bestFor: 'Life periods, turning points, and what is active now.',
    freeIncludes: ['Current Mahadasha', 'Current Antardasha', 'Life theme', 'Next timing cue'],
    freeDepth: 'Current Mahadasha and Antardasha theme in simple words.',
    id: 'DASHA',
    outcome: 'See what life chapter is active now and what comes next.',
    premiumIncludes: ['Dasha tree', 'Pratyantardasha detail', 'Activation timing', 'Life map with windows'],
    premiumDepth: 'Mahadasha, Antardasha, Pratyantardasha, activation, and timing map.',
    prompt:
      'Create my Dasha Life Map with Mahadasha, Antardasha, Pratyantardasha, active themes, and practical timing.',
    purchaseHint: 'Best when you ask “why now?” or want a life timing map.',
    school: 'VEDIC',
    title: 'Dasha Life Map',
    userWillLearn:
      'You will learn what life chapter is active now, why this period feels the way it does, and what timing cue matters next.',
    premiumAdds:
      'Premium adds full Mahadasha Phala, current Antardasha and Pratyantardasha analysis, activation windows, and a practical timing map.',
  },
  {
    badge: 'Match',
    bestFor: 'Marriage matching, family discussion, and compatibility clarity.',
    freeIncludes: ['Compatibility tone', 'Major support points', 'Major caution points', 'Gentle summary'],
    freeDepth: 'Simple compatibility tone and major caution areas.',
    id: 'COMPATIBILITY',
    outcome: 'Make compatibility easier to discuss with family.',
    premiumIncludes: ['Ashtakoota', 'Manglik check', 'D1/D9 comparison', 'Timing and practical guidance'],
    premiumDepth: 'Ashtakoota, Manglik, D1/D9 cross-check, timing, and relationship guidance.',
    prompt:
      'Create a compatibility report with Ashtakoota, Manglik, D1 and D9 comparison, timing, and gentle guidance.',
    purchaseHint: 'Best for a focused marriage or family compatibility conversation.',
    school: 'VEDIC',
    title: 'Compatibility Report',
    userWillLearn:
      'You will learn the relationship support points, caution points, and the practical conversation that needs to happen before decisions.',
    premiumAdds:
      'Premium adds Ashtakoota, Manglik, D1/D9 cross-checks, timing context, family-ready summary, and careful contradiction handling.',
  },
  {
    badge: 'Care',
    bestFor: 'Remedies, habits, spiritual discipline, and grounded support.',
    freeIncludes: ['Planet focus', 'Safe simple remedy', 'Karma lesson', 'Weekly practice'],
    freeDepth: 'Simple safe remedies and reflection practices.',
    id: 'REMEDIES',
    outcome: 'Turn chart pressure into karma-based action.',
    premiumIncludes: ['Planet-specific path', 'Mantra/seva/discipline', 'Tracking rhythm', 'Safety and stop rules'],
    premiumDepth: 'Planet-specific remedies, timing, consistency tracker, and safety notes.',
    prompt:
      'Create my remedies report with safe practical remedies, planet focus, timing, and a simple consistency plan.',
    purchaseHint: 'Best when you want what to do, not only what may happen.',
    school: 'VEDIC',
    title: 'Remedies Report',
    userWillLearn:
      'You will learn the one pressure to work with first, the safest practical remedy, and the weekly habit that supports change.',
    premiumAdds:
      'Premium adds planet-specific remedies, timing, mantra/seva/discipline options, tracking rhythm, safety notes, and avoid-list guidance.',
  },
  {
    badge: 'Numbers',
    bestFor: 'Name rhythm, birth number, destiny number, and personal timing.',
    freeIncludes: ['Name number', 'Birth number', 'Destiny number', 'Today’s rhythm'],
    freeDepth: 'Useful number profile with name, birth, destiny, and current personal day.',
    id: 'NUMEROLOGY',
    outcome: 'Understand the number pattern behind name, birth date, and current timing.',
    premiumIncludes: ['Name spelling comparison', 'Personal year/month/day map', 'Compatibility numbers', 'Numerology PDF section'],
    premiumDepth: 'Detailed number synthesis, spelling rhythm, timing cycles, and compatibility guidance.',
    prompt:
      'Create my numerology report using name number, birth number, destiny number, personal year, personal month, personal day, and name rhythm.',
    purchaseHint: 'Best when you want number-based guidance or name spelling comparison without mixing methods.',
    school: 'NUMEROLOGY',
    title: 'Numerology Report',
    userWillLearn:
      'You will learn what your name and birth numbers emphasize, what cycle you are in now, and how to use that rhythm practically.',
    premiumAdds:
      'Premium adds name scanner depth, missing/repeated number map, cycle timeline, compatibility lens, name refinement, and supportive toolkit.',
  },
  {
    badge: 'Signature',
    bestFor: 'Signature self-expression, confidence style, and improvement guidance.',
    freeIncludes: ['Visual-trait reading', 'Safety boundaries', 'Strengths and care points', 'Simple practice'],
    freeDepth: 'Useful signature trait reading with safe self-expression guidance.',
    id: 'SIGNATURE',
    outcome: 'Understand what your signature style reflects and how to improve it safely.',
    premiumIncludes: ['Detailed trait comparison', 'Improvement plan', 'Repeated signature review', 'Signature refinement plan'],
    premiumDepth: 'Detailed Signature Predicta report with visible-trait depth, repeated-sample comparison, and refinement guidance.',
    prompt:
      'Create my Signature Predicta report using confirmed signature traits, improvement suggestions, and safety boundaries only. Do not mix Numerology or Vedic synthesis.',
    purchaseHint: 'Best when you want signature-based self-expression guidance and a polished improvement plan.',
    school: 'SIGNATURE',
    title: 'Signature Report',
    userWillLearn:
      'You will learn what the confirmed visible traits may reflect about expression, confidence rhythm, consistency, and improvement focus.',
    premiumAdds:
      'Premium adds deeper confirmed-trait analysis, multi-sample comparison where available, refinement guidance, practice plan, and safety boundaries.',
  },
];

const REPORT_PREVIEW_ALIGNMENT: Record<ReportMarketplaceProduct['id'], ReportPreviewAlignment> = {
  CAREER: {
    compactPromise: 'Career direction, pressure points, and next practical move stay visible here; the full PDF carries the deeper evidence.',
    downloadNudge: 'Download the Career report when you want timing, D10 synthesis, and a clearer action plan.',
    focusLine: 'Work direction without drowning the page in chart proof.',
    previewBullets: ['Role direction', 'Current work pressure', 'Timing cue'],
  },
  COMPATIBILITY: {
    compactPromise: 'Preview the compatibility tone and major support/caution points without turning the page into a matching dossier.',
    downloadNudge: 'Download the Compatibility report for Ashtakoota, Manglik, D1/D9 comparison, and family-ready guidance.',
    focusLine: 'Relationship clarity for discussion, not panic.',
    previewBullets: ['Support points', 'Caution points', 'Family-ready summary'],
  },
  DASHA: {
    compactPromise: 'Preview the active life chapter and why this period feels the way it does.',
    downloadNudge: 'Download the Dasha report for Mahadasha, Antardasha, Pratyantardasha, and timing windows.',
    focusLine: 'What is active now, in plain language.',
    previewBullets: ['Current Mahadasha', 'Active sub-period', 'Next timing cue'],
  },
  JAIMINI: {
    compactPromise: 'Preview soul role, visible identity, work direction, relationship mirror, and current destiny chapter.',
    downloadNudge: 'Download the Jaimini report for Swamsa/Karakamsha, karaka council, Arudha/Upapada, and Chara Dasha depth.',
    focusLine: 'Destiny-role guidance without mixing KP or Vedic report flow.',
    previewBullets: ['Atmakaraka role', 'Visible identity', 'Current destiny chapter'],
  },
  KP: {
    compactPromise: 'Preview the KP outcome direction, promise/block mood, and timing readiness without turning the screen into a proof table.',
    downloadNudge: 'Download the KP report for cusp chains, significators, ruling planets, and timing proof.',
    focusLine: 'Event-answer preview first; proof comes in the PDF.',
    previewBullets: ['Verdict direction', 'Promise/block', 'Timing readiness'],
  },
  KUNDLI: {
    compactPromise: 'Preview the core Kundli reading, focus charts, current timing, and next practical direction.',
    downloadNudge: 'Download the Kundli report for full chart order, house evidence, Mahadasha, classical tables, and remedies.',
    focusLine: 'Whole-chart clarity without a long page wall.',
    previewBullets: ['D1/Moon/D9/D10/Chalit', 'Current timing', 'One remedy path'],
  },
  LIFE_ATLAS: {
    compactPromise: 'Preview the soul portrait, hidden thread, current chapter, gifts, lessons, and next honest step.',
    downloadNudge: 'Download the Life Atlas when you want the flagship non-technical life story and closing letter.',
    focusLine: 'Your life mirror first; evidence stays late in the PDF.',
    previewBullets: ['Soul portrait', 'Hidden thread', 'Current chapter'],
  },
  MARRIAGE: {
    compactPromise: 'Preview relationship maturity, partner pattern, and timing tone without fear-heavy language.',
    downloadNudge: 'Download the Marriage report for D1/D9 synthesis, timing windows, compatibility cautions, and remedies.',
    focusLine: 'Marriage guidance that stays practical and gentle.',
    previewBullets: ['Relationship signal', 'D9 preview', 'Timing tone'],
  },
  NUMEROLOGY: {
    compactPromise: 'Preview name rhythm, birth code, destiny direction, current cycle, and number-led action.',
    downloadNudge: 'Download the Numerology report for mandala, name scanner, missing/repeated grid, timeline, and refinement depth.',
    focusLine: 'Number identity without Kundli mixing.',
    previewBullets: ['Name rhythm', 'Current cycle', 'Missing/repeated pattern'],
  },
  REMEDIES: {
    compactPromise: 'Preview the safe remedy direction and one grounded practice without duplicating remedies across the page.',
    downloadNudge: 'Download the Remedies report for planet-specific path, consistency rhythm, and safety notes.',
    focusLine: 'What to do, calmly and safely.',
    previewBullets: ['Planet focus', 'Safe practice', 'Weekly rhythm'],
  },
  SADESATI: {
    compactPromise: 'Preview Saturn pressure, current phase, discipline need, and support without fear.',
    downloadNudge: 'Download the Sade Sati report for phase detail, Saturn dates, Ashtakavarga support, and remedy plan.',
    focusLine: 'Saturn pressure explained without panic.',
    previewBullets: ['Current phase', 'Discipline focus', 'Support/remedy'],
  },
  SIGNATURE: {
    compactPromise: 'Preview confirmed visible traits, confidence rhythm, consistency, and one authentic practice.',
    downloadNudge: 'Download the Signature report only after confirmed traits are ready; raw signature images are not stored in the report by default.',
    focusLine: 'Reflective expression guidance, not identity proof.',
    previewBullets: ['Trait map', 'Confidence/rhythm', 'Practice plan'],
  },
  VEDIC: {
    compactPromise: 'Preview the Vedic reading, focus charts, dasha, classical evidence, and remedy direction while the PDF carries the depth.',
    downloadNudge: 'Download the Vedic report for full Parashari coverage, vargas, Mahadasha, Chalit, tables, and remedy plan.',
    focusLine: 'Parashari prediction first; proof follows in the PDF.',
    previewBullets: ['Focus charts', 'Dasha meaning', 'Classical tables'],
  },
  WEALTH: {
    compactPromise: 'Preview income/gains signal, savings habit, and financial timing tone without overpromising money outcomes.',
    downloadNudge: 'Download the Wealth report for D2, money houses, timing windows, discipline map, and planning guidance.',
    focusLine: 'Money rhythm with grounded caution.',
    previewBullets: ['Income/gains', 'Savings caution', 'Planning cue'],
  },
};

export function getReportMarketplaceProducts(): ReportMarketplaceProduct[] {
  return REPORT_MARKETPLACE_PRODUCTS.map(product => ({
    ...product,
    freeIncludes: [...product.freeIncludes],
    premiumIncludes: [...product.premiumIncludes],
  }));
}

export function getReportPreviewAlignment(
  reportFocus: ReportMarketplaceProduct['id'],
): ReportPreviewAlignment {
  return {
    ...REPORT_PREVIEW_ALIGNMENT[reportFocus],
    previewBullets: [...REPORT_PREVIEW_ALIGNMENT[reportFocus].previewBullets],
  };
}

export function getReportPurchaseGuide(): ReportPurchaseGuide[] {
  return [
    {
      body: 'Pick this when you want one polished PDF for a clear life question.',
      cta: 'Choose one report',
      label: 'One-time report',
      title: 'I need one answer prepared well',
    },
    {
      body: 'Pick this when you want ongoing timing, deeper chat, remedies, and monthly planning.',
      cta: 'See Premium',
      label: 'Subscription',
      title: 'I want guidance every month',
    },
    {
      body: 'Pick this when you want to try the full experience before committing.',
      cta: 'Try Day Pass',
      label: 'Day Pass',
      title: 'I want to test everything today',
    },
  ];
}

const subscriptionProductIds: Record<BillingPeriod, string> = {
  MONTHLY: 'pridicta_premium_monthly',
  QUARTERLY: 'pridicta_premium_quarterly',
  WEEKLY: 'pridicta_premium_weekly',
  YEARLY: 'pridicta_premium_yearly_founder',
};

const oneTimeProductIds: Record<OneTimeProductType, string> = {
  AI_QUESTIONS_10: 'pridicta_10_questions',
  AI_QUESTIONS_25: 'pridicta_25_questions',
  AI_QUESTIONS_100: 'pridicta_100_questions',
  DAY_PASS: 'pridicta_day_pass_24h',
  DETAILED_KUNDLI_REPORT: 'pridicta_detailed_kundli_report',
  FIVE_QUESTIONS: 'pridicta_five_questions',
  JAIMINI_REPORT: 'pridicta_jaimini_report',
  MARRIAGE_COMPATIBILITY_REPORT: 'pridicta_marriage_compatibility_report',
  PREMIUM_PDF: 'pridicta_premium_pdf',
  PRECISION_FOLLOW_UP_PACK: 'pridicta_precision_follow_up_pack',
  PRECISION_READING: 'pridicta_precision_reading',
  REPORT_BUNDLE: 'pridicta_report_bundle',
  REPORT_SINGLE: 'pridicta_single_report',
};

export function formatInr(amount: number): string {
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
}

export function getPricingPlans(): PricingPlan[] {
  return [
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.weekly)} / week`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.weekly),
      id: 'WEEKLY',
      label: 'Weekly',
      priceInr: SUBSCRIPTION_PRICING.weekly,
      productId: subscriptionProductIds.WEEKLY,
    },
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.monthly)} / month`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.monthly),
      id: 'MONTHLY',
      label: 'Monthly',
      priceInr: SUBSCRIPTION_PRICING.monthly,
      productId: subscriptionProductIds.MONTHLY,
      recommended: false,
    },
    {
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.quarterly)} / 3 months`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.quarterly),
      id: 'QUARTERLY',
      label: 'Quarterly',
      monthlyEquivalent: `${formatInr(
        Math.round(SUBSCRIPTION_PRICING.quarterly / 3),
      )}/mo`,
      priceInr: SUBSCRIPTION_PRICING.quarterly,
      productId: subscriptionProductIds.QUARTERLY,
    },
    {
      badge: 'Founder price',
      billingCopy: `${formatInr(SUBSCRIPTION_PRICING.yearly)} / year`,
      displayPrice: formatInr(SUBSCRIPTION_PRICING.yearly),
      id: 'YEARLY',
      label: 'Yearly',
      monthlyEquivalent: `${formatInr(
        Math.round(SUBSCRIPTION_PRICING.yearly / 12),
      )}/mo`,
      priceInr: SUBSCRIPTION_PRICING.yearly,
      productId: subscriptionProductIds.YEARLY,
      recommended: true,
      regularPriceInr: SUBSCRIPTION_PRICING.yearlyRegular,
    },
  ];
}

export function getOneTimeProducts(): OneTimeProduct[] {
  return [
    {
      badge: '24 hours',
      description: getEnglishOneTimeProductCopy('DAY_PASS').description,
      displayPrice: formatInr(ONE_TIME_PRICING.dayPass),
      id: 'DAY_PASS',
      label: getEnglishOneTimeProductCopy('DAY_PASS').label,
      priceInr: ONE_TIME_PRICING.dayPass,
      productId: oneTimeProductIds.DAY_PASS,
    },
    {
      badge: 'Non-expiring',
      description: getEnglishOneTimeProductCopy('AI_QUESTIONS_10').description,
      displayPrice: formatInr(ONE_TIME_PRICING.aiQuestions10),
      id: 'AI_QUESTIONS_10',
      label: getEnglishOneTimeProductCopy('AI_QUESTIONS_10').label,
      priceInr: ONE_TIME_PRICING.aiQuestions10,
      productId: oneTimeProductIds.AI_QUESTIONS_10,
    },
    {
      badge: 'Popular',
      description: getEnglishOneTimeProductCopy('AI_QUESTIONS_25').description,
      displayPrice: formatInr(ONE_TIME_PRICING.aiQuestions25),
      id: 'AI_QUESTIONS_25',
      label: getEnglishOneTimeProductCopy('AI_QUESTIONS_25').label,
      priceInr: ONE_TIME_PRICING.aiQuestions25,
      productId: oneTimeProductIds.AI_QUESTIONS_25,
    },
    {
      badge: 'Best value',
      description: getEnglishOneTimeProductCopy('AI_QUESTIONS_100').description,
      displayPrice: formatInr(ONE_TIME_PRICING.aiQuestions100),
      id: 'AI_QUESTIONS_100',
      label: getEnglishOneTimeProductCopy('AI_QUESTIONS_100').label,
      priceInr: ONE_TIME_PRICING.aiQuestions100,
      productId: oneTimeProductIds.AI_QUESTIONS_100,
    },
    {
      badge: 'One question',
      description: getEnglishOneTimeProductCopy('PRECISION_READING').description,
      displayPrice: formatInr(ONE_TIME_PRICING.precisionReading),
      id: 'PRECISION_READING',
      label: getEnglishOneTimeProductCopy('PRECISION_READING').label,
      priceInr: ONE_TIME_PRICING.precisionReading,
      productId: oneTimeProductIds.PRECISION_READING,
    },
    {
      badge: 'Same thread',
      description: getEnglishOneTimeProductCopy('PRECISION_FOLLOW_UP_PACK').description,
      displayPrice: formatInr(ONE_TIME_PRICING.precisionFollowUpPack),
      id: 'PRECISION_FOLLOW_UP_PACK',
      label: getEnglishOneTimeProductCopy('PRECISION_FOLLOW_UP_PACK').label,
      priceInr: ONE_TIME_PRICING.precisionFollowUpPack,
      productId: oneTimeProductIds.PRECISION_FOLLOW_UP_PACK,
    },
    {
      badge: 'One report',
      description: getEnglishOneTimeProductCopy('REPORT_SINGLE').description,
      displayPrice: formatInr(ONE_TIME_PRICING.reportSingle),
      id: 'REPORT_SINGLE',
      label: getEnglishOneTimeProductCopy('REPORT_SINGLE').label,
      priceInr: ONE_TIME_PRICING.reportSingle,
      productId: oneTimeProductIds.REPORT_SINGLE,
    },
    {
      badge: 'Non-expiring',
      description: getEnglishOneTimeProductCopy('REPORT_BUNDLE').description,
      displayPrice: formatInr(ONE_TIME_PRICING.reportBundle),
      id: 'REPORT_BUNDLE',
      label: getEnglishOneTimeProductCopy('REPORT_BUNDLE').label,
      priceInr: ONE_TIME_PRICING.reportBundle,
      productId: oneTimeProductIds.REPORT_BUNDLE,
    },
    {
      badge: 'Jaimini',
      description: getEnglishOneTimeProductCopy('JAIMINI_REPORT').description,
      displayPrice: formatInr(ONE_TIME_PRICING.jaiminiReport),
      id: 'JAIMINI_REPORT',
      label: getEnglishOneTimeProductCopy('JAIMINI_REPORT').label,
      priceInr: ONE_TIME_PRICING.jaiminiReport,
      productId: oneTimeProductIds.JAIMINI_REPORT,
    },
    {
      description: getEnglishOneTimeProductCopy('DETAILED_KUNDLI_REPORT').description,
      displayPrice: formatInr(ONE_TIME_PRICING.detailedKundliReport),
      id: 'DETAILED_KUNDLI_REPORT',
      label: getEnglishOneTimeProductCopy('DETAILED_KUNDLI_REPORT').label,
      priceInr: ONE_TIME_PRICING.detailedKundliReport,
      productId: oneTimeProductIds.DETAILED_KUNDLI_REPORT,
    },
    {
      description: getEnglishOneTimeProductCopy('MARRIAGE_COMPATIBILITY_REPORT').description,
      displayPrice: formatInr(ONE_TIME_PRICING.marriageCompatibilityReport),
      id: 'MARRIAGE_COMPATIBILITY_REPORT',
      label: getEnglishOneTimeProductCopy('MARRIAGE_COMPATIBILITY_REPORT').label,
      priceInr: ONE_TIME_PRICING.marriageCompatibilityReport,
      productId: oneTimeProductIds.MARRIAGE_COMPATIBILITY_REPORT,
    },
  ];
}

function getEnglishOneTimeProductCopy(productType: OneTimeProductType): {
  description: string;
  label: string;
} {
  return getMonetizationProductCopy(productType, 'en');
}

export function getRecommendedPricingPlan(): PricingPlan {
  return (
    getPricingPlans().find(plan => plan.recommended) ?? getPricingPlans()[1]
  );
}

export function getDayPassProduct(): OneTimeProduct {
  return getOneTimeProduct('DAY_PASS');
}

export function getPremiumPdfProduct(): OneTimeProduct {
  return getOneTimeProduct('REPORT_SINGLE');
}

export function getOneTimeProduct(
  productType: OneTimeProductType,
): OneTimeProduct {
  if (productType === 'FIVE_QUESTIONS') {
    return getOneTimeProduct('AI_QUESTIONS_10');
  }

  if (productType === 'PREMIUM_PDF') {
    return getOneTimeProduct('REPORT_SINGLE');
  }

  const product = getOneTimeProducts().find(item => item.id === productType);

  if (!product) {
    throw new Error(`Unknown one-time product: ${productType}`);
  }

  return product;
}
