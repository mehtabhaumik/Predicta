import type { ChartContext, KundliData } from '@pridicta/types';
import { detectDecisionIntent } from './decisionMirror';

const SMALL_TALK_ONLY_PATTERN =
  /^(?:hi|hello|hey|hey there|hello there|hi there|yo|namaste|good morning|good afternoon|good evening|good night|how are you|how are you doing|are you there|thanks|thank you|ok|okay|cool|nice)(?:\s+(?:predicta|pridicta))?[!?.\s]*$/i;

const ASTROLOGY_CUE_PATTERN =
  /\b(chart|kundli|horoscope|dasha|lagna|nakshatra|career|marriage|relationship|love|planet|report|pdf|prediction|predict|future|transit|remed(?:y|ies))\b/i;

function normalizePrompt(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

type BirthDetailProgress = {
  date?: string;
  place?: string;
  time?: string;
};

type BirthDetailContext = {
  hasAllBirthDetails: boolean;
  justSharedBirthDetails: boolean;
  missingFields: Array<'date' | 'time' | 'place'>;
  progress: BirthDetailProgress;
};

const PREDICTA_INTRO_MESSAGES = [
  'Hello. I am Predicta. Ask a life question, explore a report, or share your birth details when you are ready.',
  'Welcome. I can help with chart questions, timing patterns, report guidance, or a focused life decision.',
  'Hello. Start with what feels most important right now, and I will keep the guidance calm and clear.',
  'I am here for thoughtful chart guidance, practical timing questions, and steady follow-up.',
  'Bring me a chart question, a life crossroads, or your birth details, and we can begin from there.',
  'Hello. We can start with your kundli, a relationship question, a work decision, or a report you want to understand.',
  'If something feels unclear, ask directly. I will help you sort the signal from the noise.',
  'I am here to make deep astrology easier to follow, without turning it into pressure or confusion.',
  'Ask about timing, career, relationships, a report section, or the bigger pattern you are trying to understand.',
  'Hello. If your chart is ready, I can read from it. If not, I can still help you frame the right next question.',
  'You can begin with one clear question. I will keep the answer grounded, useful, and easy to revisit.',
  'If you are unsure where to begin, tell me what has been on your mind lately and I will help narrow the focus.',
  'I can help with chart interpretation, life direction, report clarity, and decision support when the question is honest and specific.',
  'Hello. We can take this one layer at a time, from a simple question to a deeper reading.',
  'Bring me the question behind the noise. I will keep the guidance steady and practical.',
  'If you want a true chart reading, we can start from your birth details. If not, begin with the life question itself.',
  'Ask from the heart or ask from the chart. Either way, I will keep the reading thoughtful and clear.',
  'Hello. I am here to help you understand patterns, timing, and choices without turning the reading into theatre.',
];

const CHART_READY_SUFFIXES = [
  'Your chart is open, so I can anchor the guidance to it when needed.',
  'I already have your kundli in view, so we can go straight to the meaningful part.',
  'Your chart is ready, which means I can keep the reading tied to real placements and timing.',
  'I have your kundli available, so chart-specific questions can stay grounded in the actual data.',
];

function getRandomItem(items: string[]): string {
  return items[Math.floor(Math.random() * items.length)];
}

function normalizeYear(year: string): string {
  if (year.length === 4) {
    return year;
  }

  const numericYear = Number(year);
  return numericYear > 30 ? `19${year}` : `20${year}`;
}

function formatDateParts(year: string, month: string, day: string): string {
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function extractDate(input: string): string | undefined {
  const normalized = normalizePrompt(input);
  const monthMap: Record<string, string> = {
    apr: '04',
    april: '04',
    aug: '08',
    august: '08',
    dec: '12',
    december: '12',
    feb: '02',
    february: '02',
    jan: '01',
    january: '01',
    jul: '07',
    july: '07',
    jun: '06',
    june: '06',
    mar: '03',
    march: '03',
    may: '05',
    nov: '11',
    november: '11',
    oct: '10',
    october: '10',
    sep: '09',
    sept: '09',
    september: '09',
  };

  const iso = normalized.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (iso) {
    return formatDateParts(iso[1], iso[2], iso[3]);
  }

  const numeric = normalized.match(/\b(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})\b/);
  if (numeric) {
    return formatDateParts(normalizeYear(numeric[3]), numeric[2], numeric[1]);
  }

  const named = normalized.match(/\b(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{2,4})\b/i);
  if (named) {
    const month = monthMap[named[2].toLowerCase()];
    if (month) {
      return formatDateParts(normalizeYear(named[3]), month, named[1]);
    }
  }

  return undefined;
}

function extractTime(input: string): string | undefined {
  const normalized = normalizePrompt(input);
  const time =
    normalized.match(
      /\b(?:time|born at|birth time is|at)\s*:?\s*(\d{1,2})(?::(\d{2}))?\s*(?:in the\s+)?(am|pm|morning|evening|night)?\b/i,
    ) ?? normalized.match(/\b(\d{1,2}):(\d{2})\s*(am|pm|morning|evening|night)?\b/i);

  if (!time) {
    return undefined;
  }

  let hours = Number(time[1]);
  const minutes = Number(time[2] ?? '00');
  const meridiemText = time[3]?.toLowerCase();
  const meridiem =
    meridiemText === 'am' || meridiemText === 'morning'
      ? 'AM'
      : meridiemText === 'pm' ||
          meridiemText === 'evening' ||
          meridiemText === 'night'
        ? 'PM'
        : undefined;

  if (meridiem === 'PM' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'AM' && hours === 12) {
    hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    return undefined;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function extractPlace(input: string): string | undefined {
  const normalized = normalizePrompt(input);
  const labeled = normalized.match(
    /\b(?:birth place|birthplace|place)\s*(?:is|:)?\s*([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b/i,
  );

  if (labeled?.[1]) {
    return labeled[1].trim();
  }

  const bornIn = normalized.match(
    /\b(?:born in|from)\s+([A-Za-z][A-Za-z\s.-]+(?:,\s*[A-Za-z][A-Za-z\s.-]+){0,2})\b/i,
  );

  if (bornIn?.[1]) {
    return bornIn[1].trim();
  }

  return undefined;
}

function extractBirthDetailProgress(input: string): BirthDetailProgress {
  return {
    date: extractDate(input),
    place: extractPlace(input),
    time: extractTime(input),
  };
}

function describeCollectedBirthDetails(progress: BirthDetailProgress): string {
  const parts: string[] = [];

  if (progress.date) {
    parts.push(`date of birth ${progress.date}`);
  }

  if (progress.time) {
    parts.push(`birth time ${progress.time}`);
  }

  if (progress.place) {
    parts.push(`birth place ${progress.place}`);
  }

  if (parts.length === 0) {
    return '';
  }

  if (parts.length === 1) {
    return parts[0];
  }

  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}

function describeMissingBirthFields(
  fields: Array<'date' | 'time' | 'place'>,
): string {
  const labels = fields.map(field =>
    field === 'date'
      ? 'date of birth'
      : field === 'time'
        ? 'birth time'
        : 'birth place',
  );

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return `${labels[0]}, ${labels[1]}, and ${labels[2]}`;
}

function resolveBirthDetailContext(
  input: string,
  history?: Array<{ role: string; text: string }>,
): BirthDetailContext {
  const allPrompts = [...(history ?? []).map(turn => turn.text), input];
  const progress: BirthDetailProgress = {};
  const current = extractBirthDetailProgress(input);

  for (const prompt of allPrompts) {
    const extracted = extractBirthDetailProgress(prompt);
    progress.date ||= extracted.date;
    progress.time ||= extracted.time;
    progress.place ||= extracted.place;
  }

  const missingFields: Array<'date' | 'time' | 'place'> = [];

  if (!progress.date) {
    missingFields.push('date');
  }
  if (!progress.time) {
    missingFields.push('time');
  }
  if (!progress.place) {
    missingFields.push('place');
  }

  return {
    hasAllBirthDetails: missingFields.length === 0,
    justSharedBirthDetails: Boolean(current.date || current.time || current.place),
    missingFields,
    progress,
  };
}

export function getRandomPredictaIntro(options?: {
  hasKundli?: boolean;
}): string {
  const intro = getRandomItem(PREDICTA_INTRO_MESSAGES);

  if (!options?.hasKundli) {
    return intro;
  }

  return `${intro} ${getRandomItem(CHART_READY_SUFFIXES)}`;
}

export function isSmallTalkPrompt(input: string): boolean {
  const normalized = normalizePrompt(input);
  if (!normalized) {
    return false;
  }

  if (ASTROLOGY_CUE_PATTERN.test(normalized)) {
    return false;
  }

  return SMALL_TALK_ONLY_PATTERN.test(normalized);
}

export function buildSmallTalkResponse(
  input: string,
  options?: {
    hasKundli?: boolean;
    chartContext?: ChartContext;
  },
): string {
  const normalized = normalizePrompt(input).toLowerCase();
  const hasKundli = Boolean(options?.hasKundli);
  const chartLabel =
    options?.chartContext?.chartType ?? options?.chartContext?.chartName;
  const guidanceHint = hasKundli
    ? chartLabel
      ? `If you want, we can look at ${chartLabel} or any life question you want to explore.`
      : 'If you want, we can look at your chart or any life question you want to explore.'
    : 'If you want, tell me your birth details or ask a focused life question and I will guide you from there.';

  if (normalized.includes('how are you')) {
    return `I am here and ready with you. ${guidanceHint}`;
  }

  if (normalized.includes('thank')) {
    return 'Always. Take your time, and ask when you are ready.';
  }

  return `Hello. I’m here. ${guidanceHint}`;
}

export function buildNoKundliResponse(
  input: string,
  options?: {
    history?: Array<{ role: string; text: string }>;
  },
): string {
  const normalized = normalizePrompt(input);
  const birthDetailContext = resolveBirthDetailContext(normalized, options?.history);
  const collected = describeCollectedBirthDetails(birthDetailContext.progress);
  const missing = describeMissingBirthFields(birthDetailContext.missingFields);

  if (isSmallTalkPrompt(normalized)) {
    return buildSmallTalkResponse(normalized, {
      hasKundli: false,
    });
  }

  if (birthDetailContext.justSharedBirthDetails) {
    if (birthDetailContext.hasAllBirthDetails) {
      return collected
        ? `Thank you. I now have your ${collected}. The next step is to create your kundli so I can read from the real chart instead of guessing.`
        : 'Thank you. I have enough to begin, and the next step is to create your kundli so I can read from the real chart instead of guessing.';
    }

    if (collected && missing) {
      return `Got it. I now have your ${collected}. I still need your ${missing} before I can give you a real chart reading.`;
    }
  }

  if (/\b(chart|kundli|horoscope|reading|analy[sz]e|analysis|birth chart)\b/i.test(normalized)) {
    if (collected && missing) {
      return `I’m not going to guess from a chart I do not have. I already have your ${collected}; I still need your ${missing} before I can read the real kundli.`;
    }

    return 'I do not have your kundli yet, and I do not want to pretend otherwise. Share your birth date, exact birth time, and birth place when you are ready, and I will read from the real chart after that.';
  }

  if (/\b(dasha|lagna|nakshatra|planet|house|placement|D\d+)\b/i.test(normalized)) {
    return 'I can explain what those chart factors mean in general, but I cannot call them yours until your kundli is ready. Share your birth date, exact birth time, and birth place if you want a real chart-based reading.';
  }

  if (collected && missing) {
    return `I have your ${collected} so far. Send your ${missing}, and then I can move with you into a real chart reading.`;
  }

  return 'I can help with a focused life question right away. If you want a real chart reading, start by sharing your birth date, exact birth time, and birth place.';
}

export function buildPredictaWaitingMessage(
  input: string,
  chartContext?: ChartContext,
  options?: {
    hasKundli?: boolean;
  },
): string {
  const normalized = normalizePrompt(input);
  const hasKundli = options?.hasKundli ?? true;

  if (isSmallTalkPrompt(normalized)) {
    return 'Listening...';
  }

  if (!hasKundli) {
    if (/\b(chart|kundli|horoscope|reading|analy[sz]e|analysis)\b/i.test(normalized)) {
      return 'Getting clear on what you want to explore first...';
    }

    if (/\b(date|time|place|birth)\b/i.test(normalized)) {
      return 'Reading the birth details you shared...';
    }

    return 'Thinking through the best place to begin...';
  }

  if (/\b(pdf|report|summary|download)\b/i.test(normalized)) {
    return 'Pulling the clearest points into one summary...';
  }

  if (
    chartContext?.chartType &&
    (/\b(d\d+|chart|show|placement|planet|house|lagna|nakshatra|dasha|timing|career|relationship)\b/i.test(
      normalized,
    ) ||
      normalized.includes(chartContext.chartType.toLowerCase()))
  ) {
    return `Checking the ${chartContext.chartType} signals that matter most...`;
  }

  const decisionIntent = detectDecisionIntent(normalized, chartContext);
  if (decisionIntent.isDecisionQuestion) {
    return 'Weighing both sides of your question...';
  }

  if (/\bdasha|timing|period\b/i.test(normalized)) {
    return 'Checking the timing patterns around your question...';
  }

  if (/\bcareer|job|work|business|profession\b/i.test(normalized)) {
    return 'Tracing the strongest work and timing signals...';
  }

  if (/\blove|marriage|relationship|partner\b/i.test(normalized)) {
    return 'Looking at the emotional and relationship patterns around this...';
  }

  return 'Thinking through your question...';
}

export function buildLocalPredictaFallback(
  message: string,
  kundli?: KundliData,
  chartContext?: ChartContext,
  options?: {
    history?: Array<{ role: string; text: string }>;
  },
): string {
  if (isSmallTalkPrompt(message)) {
    return buildSmallTalkResponse(message, {
      chartContext,
      hasKundli: Boolean(kundli),
    });
  }

  if (!kundli) {
    return buildNoKundliResponse(message, {
      history: options?.history,
    });
  }

  const currentDasha = kundli.dasha.current;
  const strongestHouses = kundli.ashtakavarga.strongestHouses.join(', ');
  const hasSelectedChart =
    Boolean(chartContext?.chartType) &&
    Boolean(chartContext?.chartType && kundli.charts[chartContext.chartType]);
  const opening = hasSelectedChart && chartContext?.chartType
    ? `I will begin from ${chartContext.chartType}, because that is the clearest lens for this question.`
    : 'I will start from the birth chart and quietly cross-check the supporting chart factors.';

  return [
    opening,
    `The current ${currentDasha.mahadasha} / ${currentDasha.antardasha} period asks for steady choices, clear boundaries, and actions that can hold over time.`,
    `Your strongest ashtakavarga support is around houses ${strongestHouses}, so progress is more reliable when it comes from structure and visible effort rather than pressure.`,
    `On your question, "${normalizePrompt(
      message,
    )}", the calm reading is this: choose the next step that reduces confusion, protects dignity, and keeps your long-term direction intact.`,
  ].join('\n\n');
}
