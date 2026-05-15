import type { SupportedLanguage } from '@pridicta/types';
import { getRandomPredictaGreeting } from './predictaMemory';

export type PredictaJourneyStep = {
  id: 'create' | 'summary' | 'ask';
  title: string;
  body: string;
  action: string;
};

export const PREDICTA_JOURNEY_STEPS: PredictaJourneyStep[] = [
  {
    action: 'Create Kundli',
    body: 'Enter birth date, time, and place.',
    id: 'create',
    title: 'Step 1',
  },
  {
    action: 'See My Summary',
    body: 'Read the simple version first.',
    id: 'summary',
    title: 'Step 2',
  },
  {
    action: 'Ask Predicta',
    body: 'Ask one clear question.',
    id: 'ask',
    title: 'Step 3',
  },
];

export type PredictaOutcomeEntry = {
  id:
    | 'money'
    | 'career'
    | 'marriage'
    | 'health'
    | 'family'
    | 'today'
    | 'remedies'
    | 'report';
  title: string;
  body: string;
  proof: string;
  prompt: string;
  cta: string;
};

export const PREDICTA_OUTCOME_ENTRIES: PredictaOutcomeEntry[] = [
  {
    body: 'Money flow, savings, gains, pressure, and practical timing.',
    cta: 'Ask about money',
    id: 'money',
    prompt:
      'Read my money and financial future using D1, D2, 2nd house, 11th house, current dasha, Gochar, confidence, and one practical next step.',
    proof: 'D1 + D2 + 2nd/11th + Dasha',
    title: 'Money',
  },
  {
    body: 'Work direction, growth windows, job changes, and reputation.',
    cta: 'Ask about career',
    id: 'career',
    prompt:
      'Read my career direction using D1, D10, 10th house, current dasha, Gochar, confidence, and one practical next step.',
    proof: 'D1 + D10 + 10th + Gochar',
    title: 'Career',
  },
  {
    body: 'Marriage, partner patterns, compatibility signals, and timing.',
    cta: 'Ask about marriage',
    id: 'marriage',
    prompt:
      'Read my marriage and relationship prospects using D1, D9, 7th house, Venus, Jupiter, current dasha, Gochar, confidence, and grounded guidance.',
    proof: 'D1 + D9 + 7th + Venus/Jupiter',
    title: 'Marriage',
  },
  {
    body: 'Astrology-based wellness cautions, stress patterns, and safe habits.',
    cta: 'Ask health caution',
    id: 'health',
    prompt:
      'Give me astrology-based health caution guidance using D1, relevant houses, Moon, dasha, Gochar, confidence, and safe practical habits. Do not diagnose or replace medical advice.',
    proof: 'D1 + Moon + 6th/8th/12th',
    title: 'Health caution',
  },
  {
    body: 'Family Kundlis, household patterns, and shared guidance.',
    cta: 'Open Family Vault',
    id: 'family',
    prompt:
      'Use Family Vault context and explain what I can understand about family patterns, saved Kundlis, and the next best family-focused reading.',
    proof: 'Family Vault + saved Kundlis',
    title: 'Family',
  },
  {
    body: 'Today’s best action, caution, mood, and simple remedy.',
    cta: 'Ask about today',
    id: 'today',
    prompt:
      'Give me today’s holistic astrology guidance using Panchang, Moon, dasha, Gochar, life balance, one caution, and one practical action.',
    proof: 'Panchang + Moon + Gochar',
    title: 'Today',
  },
  {
    body: 'Karma-based practices, seva, mantra, discipline, and devotion.',
    cta: 'Ask for remedies',
    id: 'remedies',
    prompt:
      'Suggest karma-based remedies from my chart using active planets, dasha, Gochar, conduct correction, seva, mantra or prayer, and one simple weekly practice.',
    proof: 'Planet karma + Dasha + Gochar',
    title: 'Remedies',
  },
  {
    body: 'Turn a life question into a polished free or premium report.',
    cta: 'Make a report',
    id: 'report',
    prompt:
      'Help me choose the right Predicta report for my current need: career, marriage, wealth, health caution, family, Sade Sati, Dasha Life Map, or full Kundli.',
    proof: 'Report choices + chart proof',
    title: 'Report',
  },
];

export function getFriendlyGreetingReply(language: SupportedLanguage): string {
  const greeting = getRandomPredictaGreeting(language);

  if (language === 'hi') {
    return [
      greeting,
      'Aaram se bataye, koi jaldi nahi.',
      'Agar aap Kundli banana chahte hain, to bas date of birth, birth time, aur birth place likh dein. Agar sirf DOB pata hai, woh bhi bhej dijiye; baaki main pyaar se pooch lungi.',
      'Agar Kundli ready hai, to career, marriage, money, timing, remedies ya mann ki uljhan par ek sawal poochiye. Main chart proof ke saath simple language mein samjhaungi.',
    ].join('\n');
  }

  if (language === 'gu') {
    return [
      greeting,
      'Shanti thi kaho, koi utaval nathi.',
      'Jo Kundli banavvi hoy to date of birth, birth time ane birth place lakho. Fakat DOB khabar hoy to pan moklo; baaki hu pyaar thi poochi laish.',
      'Jo Kundli ready chhe, to career, marriage, money, timing, remedies athva mann ni munjvan par ek sawal poochho. Hu chart proof sathe simple rite samjhavish.',
    ].join('\n');
  }

  return [
    greeting,
    'Share slowly; we do not have to rush this.',
    'If you want to create your Kundli, send your date of birth, birth time, and birth place. If you only know the DOB, send that first and I will gently ask for the rest.',
    'If your Kundli is already ready, ask me one thing about career, marriage, money, timing, remedies, or whatever is weighing on your mind. I will keep it practical and show chart proof.',
  ].join('\n');
}

export function getBirthIntakeWelcome(language: SupportedLanguage): string {
  const greeting = getRandomPredictaGreeting(
    language,
    `birth-intake-${language}`,
  );

  if (language === 'hi') {
    return `${greeting} Apni birth date kisi bhi format mein likhiye. Phir birth time aur birth place bataye. Agar abhi sirf DOB pata hai, bhej dijiye; main baaki details dheere se pooch lungi.`;
  }
  if (language === 'gu') {
    return `${greeting} Tamari birth date koi pan format ma lakho. Pachhi birth time ane birth place janavo. Jo haal ma fakat DOB khabar hoy, moklo; baaki details hu dhime thi poochi laish.`;
  }
  return `${greeting} Tell me your date of birth in any format, then birth time and birth place. If you only know the DOB right now, send it first; I will gently ask for the rest.`;
}

export function getListeningMicrocopy(language: SupportedLanguage): string {
  const options: Record<SupportedLanguage, string[]> = {
    en: [
      'Resolving the birth place and timezone...',
      'Preparing the Lagna and core chart factors...',
      'Checking nakshatra, dasha, and transit context...',
      'Reading the chart evidence before I answer...',
      'Calculating quietly so the guidance stays grounded...',
    ],
    hi: [
      'Birth place aur timezone resolve kar rahi hoon...',
      'Lagna, Moon aur core chart factors check kar rahi hoon...',
      'Nakshatra, dasha aur transit context dekh rahi hoon...',
      'Answer se pehle chart proof padh rahi hoon...',
      'Grounded guidance ke liye calculation quietly kar rahi hoon...',
    ],
    gu: [
      'Birth place ane timezone resolve kari rahi chhu...',
      'Lagna, Moon ane core chart factors check kari rahi chhu...',
      'Nakshatra, dasha ane transit context joi rahi chhu...',
      'Answer pehla chart proof vanchi rahi chhu...',
      'Grounded guidance mate calculation quietly kari rahi chhu...',
    ],
  };
  const items = options[language] ?? options.en;
  const index = Math.floor(Math.random() * items.length);

  return items[index] ?? items[0];
}

export function getBirthExtractionFailureReply(
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return [
      'Maine try kiya, lekin details clearly read nahi ho paayi. Koi baat nahi.',
      'Please aise bheje:',
      'DOB: 22/08/1980',
      'Time: 6:30 AM',
      'Place: Mumbai, India',
      'Agar time nahi pata, “time unknown” likh dein. Main aage guide kar dungi.',
    ].join('\n');
  }
  if (language === 'gu') {
    return [
      'Maine try karyu, pan details clearly read nahi thai. Koi vaat nahi.',
      'Please aa rite moklo:',
      'DOB: 22/08/1980',
      'Time: 6:30 AM',
      'Place: Mumbai, India',
      'Jo time khabar nathi, “time unknown” lakho. Hu aagal guide karish.',
    ].join('\n');
  }
  return [
    'I tried to read the details, but they were not clear enough. No stress.',
    'Send them like this:',
    'DOB: 22/08/1980',
    'Time: 6:30 AM',
    'Place: Mumbai, India',
    'If you do not know the time, write “time unknown” and I will guide you from there.',
  ].join('\n');
}

export function isSimpleGreeting(message: string): boolean {
  return /^(hi|hello|hey|namaste|namaskar|pranam|ram ram|jai shree krishna|kem cho|kaise ho|kaise ho predicta|su chale|shu chale)[!.\s]*$/i.test(
    message.trim(),
  );
}
