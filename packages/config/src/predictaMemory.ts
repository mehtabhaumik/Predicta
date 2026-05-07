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
