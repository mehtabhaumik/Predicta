import type { SupportedLanguage } from '@pridicta/types';

export type PredictaJourneyStep = {
  id: 'create' | 'summary' | 'ask';
  title: string;
  body: string;
  action: string;
};

export const PREDICTA_JOURNEY_STEPS: PredictaJourneyStep[] = [
  {
    action: 'Create Kundli',
    body: 'Enter birth date, time, and place. Predicta calculates quietly.',
    id: 'create',
    title: 'Step 1',
  },
  {
    action: 'See My Summary',
    body: 'Read the simple version first. Chart terms stay behind proof buttons.',
    id: 'summary',
    title: 'Step 2',
  },
  {
    action: 'Ask Pridicta',
    body: 'Ask one question at a time. Predicta answers from your chart evidence.',
    id: 'ask',
    title: 'Step 3',
  },
];

export function getFriendlyGreetingReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'Namaste. मैं आपकी मदद कर सकता हूं.',
      'सबसे आसान रास्ता:',
      '1. पहले अपनी Kundli बनाएं.',
      '2. फिर simple summary पढ़ें.',
      '3. उसके बाद career, marriage, money या timing पर एक सवाल पूछें.',
      'Sanskrit/Jyotish शब्द आएंगे तो मैं उनका आसान मतलब भी बताऊंगा.',
    ].join('\n');
  }

  if (language === 'gu') {
    return [
      'Namaste. હું તમારી મદદ કરી શકું છું.',
      'સૌથી સરળ રસ્તો:',
      '1. પહેલા તમારી Kundli બનાવો.',
      '2. પછી simple summary વાંચો.',
      '3. ત્યાર પછી career, marriage, money અથવા timing પર એક પ્રશ્ન પૂછો.',
      'Sanskrit/Jyotish શબ્દ આવે તો હું તેનો સરળ અર્થ પણ સમજાવીશ.',
    ].join('\n');
  }

  return [
    'Namaste. I can help.',
    'Easiest path:',
    '1. Create your Kundli.',
    '2. Read the simple summary.',
    '3. Ask one question about career, marriage, money, or timing.',
    'When Sanskrit or Jyotish terms appear, I will explain them in plain language.',
  ].join('\n');
}

export function isSimpleGreeting(message: string): boolean {
  return /^(hi|hello|hey|namaste|namaskar|pranam|jai shree krishna|kem cho|kaise ho)[!.\s]*$/i.test(
    message.trim(),
  );
}
