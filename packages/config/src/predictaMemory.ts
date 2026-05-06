import type {
  BirthDetailsDraft,
  BirthDetailsExtractionResult,
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

const GREETINGS: Record<SupportedLanguage, string[]> = {
  en: [
    'Namaste. I am here with you.',
    'Hello. Tell me slowly; I am listening.',
    'Pranam. Let us look at this gently.',
    'Jai Bholenath. I am with you.',
    'Om Namah Shivaya. Share what you know, and we will take the next step.',
    'Jai Maa Durga. We will keep this calm and practical.',
    'Jai Ganesh. Let us begin simply.',
    'Jai Shree Ram. Tell me what is on your mind.',
    'Ram Ram. I am listening with care.',
    'Good to see you. We can go one detail at a time.',
  ],
  hi: [
    'Namaste. मैं आपके साथ हूं.',
    'Pranam. आराम से बताइए, मैं सुन रही हूं.',
    'Jai Bholenath. चलिए धीरे से देखते हैं.',
    'Om Namah Shivaya. जो details पता हैं, वहीं से शुरू करते हैं.',
    'Jai Maa Durga. हम इसे शांत और practical रखेंगे.',
    'Jai Ganesh. आसान शुरुआत करते हैं.',
    'Jai Shree Ram. मन की बात बताइए.',
    'Ram Ram. मैं ध्यान से सुन रही हूं.',
  ],
  gu: [
    'Namaste. હું તમારી સાથે છું.',
    'Pranam. શાંતિથી કહો, હું સાંભળી રહી છું.',
    'Jai Bholenath. ચાલો ધીમેથી જોઈએ.',
    'Om Namah Shivaya. જે details ખબર છે, ત્યાંથી શરૂ કરીએ.',
    'Jai Maa Durga. આપણે આને શાંત અને practical રાખીશું.',
    'Jai Ganesh. સરળ શરૂઆત કરીએ.',
    'Jai Shree Ram. મનની વાત કહો.',
    'Ram Ram. હું ધ્યાનથી સાંભળી રહી છું.',
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
        first.options?.length ? `${copy.options}: ${first.options.join(' / ')}` : '',
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
        `${copy.need}: ${missingFields.map(field => copy.fields[field] ?? field).join(', ')}.`,
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
    text: [
      copy.ready,
      formatDraftSummary(draft, copy),
      copy.verify,
    ].join('\n\n'),
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
      Object.entries(extracted).filter(([, value]) => value !== undefined),
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
  return ['date', 'time', 'am_pm', 'birth_place', 'city', 'state', 'country']
    .filter(field => missing.has(field));
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
        'अच्छा, मैंने details संभाल ली हैं. बस एक बात confirm करनी है.',
      fields: {
        am_pm: 'AM या PM',
        birth_place: 'जन्म स्थान',
        city: 'शहर',
        country: 'देश',
        date: 'जन्म तारीख',
        name: 'नाम',
        state: 'राज्य',
        time: 'जन्म समय',
      } as Record<string, string>,
      need: 'अब kundli के लिए चाहिए',
      options: 'Options',
      progress: 'ठीक है, मुझे पिछली बात याद है. अभी तक मैंने यह समझा',
      ready: 'सुंदर. अब Kundli बनाने के लिए जरूरी details मिल गई हैं.',
      unknownTime:
        'अगर exact time नहीं पता, “time unknown” लिख दें. मैं birth-time detective mode से guide कर दूंगी.',
      verify:
        'अब Kundli screen पर जाकर place और timezone verify कर लें, फिर मैं chart proof से बात करूंगी.',
    };
  }

  if (language === 'gu') {
    return {
      confirmation:
        'સારું, મેં details સાચવી છે. ફક્ત એક બાબત confirm કરવી છે.',
      fields: {
        am_pm: 'AM કે PM',
        birth_place: 'જન્મ સ્થળ',
        city: 'શહેર',
        country: 'દેશ',
        date: 'જન્મ તારીખ',
        name: 'નામ',
        state: 'રાજ્ય',
        time: 'જન્મ સમય',
      } as Record<string, string>,
      need: 'હવે kundli માટે જોઈએ',
      options: 'Options',
      progress: 'બરાબર, મને અગાઉની વાત યાદ છે. અત્યાર સુધી મેં આ સમજ્યું',
      ready: 'સુંદર. હવે Kundli બનાવવા માટે જરૂરી details મળી ગઈ છે.',
      unknownTime:
        'જો exact time ખબર ન હોય, “time unknown” લખો. હું birth-time detective mode થી guide કરીશ.',
      verify:
        'હવે Kundli screen પર place અને timezone verify કરો, પછી હું chart proof થી વાત કરીશ.',
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
      'Next, verify the place and timezone on the Kundli screen. Then I can speak from real chart proof.',
  };
}

function hashText(text: string): number {
  return Array.from(text).reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) | 0,
    7,
  );
}
