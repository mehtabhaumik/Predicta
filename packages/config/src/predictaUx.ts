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
  const greeting = getRandomPredictaGreeting(language);

  if (language === 'hi') {
    return [
      greeting,
      'आराम से बताइए, कोई जल्दी नहीं.',
      'अगर आप Kundli बनाना चाहते हैं, तो बस date of birth, birth time, और birth place लिख दें. अगर केवल DOB पता है, वह भी भेज दीजिए; मैं बाकी चीजें प्यार से पूछ लूंगी.',
      'अगर Kundli बन चुकी है, तो career, marriage, money, timing, remedies या मन की उलझन पर एक सवाल पूछिए. मैं chart proof के साथ सरल भाषा में समझाऊंगी.',
    ].join('\n');
  }

  if (language === 'gu') {
    return [
      greeting,
      'શાંતિથી કહો, કોઈ ઉતાવળ નથી.',
      'જો Kundli બનાવવી હોય તો date of birth, birth time અને birth place લખો. ફક્ત DOB ખબર હોય તો પણ મોકલો; બાકીની વિગતો હું પ્રેમથી પૂછી લઈશ.',
      'જો Kundli બની ગઈ હોય, તો career, marriage, money, timing, remedies અથવા મનની મૂંઝવણ પર એક પ્રશ્ન પૂછો. હું chart proof સાથે સરળ ભાષામાં સમજાવીશ.',
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
    return `${greeting} अपनी जन्म तारीख किसी भी format में लिखें. फिर birth time और birth place बताएं. अगर अभी केवल DOB पता है, भेज दीजिए; मैं बाकी details धीरे से पूछ लूंगी.`;
  }
  if (language === 'gu') {
    return `${greeting} તમારી જન્મ તારીખ કોઈપણ format માં લખો. પછી birth time અને birth place જણાવો. જો હાલમાં ફક્ત DOB ખબર હોય, મોકલો; બાકીની વિગતો હું ધીમેથી પૂછી લઈશ.`;
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
      'जन्म स्थान और timezone मिलाकर देख रही हूं...',
      'Lagna और मुख्य chart factors तैयार कर रही हूं...',
      'Nakshatra, dasha और transit context देख रही हूं...',
      'जवाब देने से पहले chart evidence पढ़ रही हूं...',
      'धीरे से calculation कर रही हूं ताकि बात grounded रहे...',
    ],
    gu: [
      'જન્મ સ્થળ અને timezone મેળવી રહી છું...',
      'Lagna અને મુખ્ય chart factors તૈયાર કરી રહી છું...',
      'Nakshatra, dasha અને transit context જોઈ રહી છું...',
      'જવાબ પહેલાં chart evidence વાંચી રહી છું...',
      'શાંતિથી calculation કરી રહી છું જેથી માર્ગદર્શન grounded રહે...',
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
      'मैंने कोशिश की, लेकिन details साफ़ तरह से पढ़ नहीं पाई. कोई बात नहीं.',
      'कृपया ऐसे भेजें:',
      'DOB: 22/08/1980',
      'Time: 6:30 AM',
      'Place: Mumbai, India',
      'अगर time नहीं पता, “time unknown” लिख दें. मैं आगे guide कर दूंगी.',
    ].join('\n');
  }
  if (language === 'gu') {
    return [
      'મેં પ્રયત્ન કર્યો, પણ details સ્પષ્ટ રીતે વાંચી શકી નહીં. કોઈ વાત નહીં.',
      'કૃપા કરીને આ રીતે મોકલો:',
      'DOB: 22/08/1980',
      'Time: 6:30 AM',
      'Place: Mumbai, India',
      'જો time ખબર નથી, “time unknown” લખો. હું આગળ guide કરીશ.',
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
  return /^(hi|hello|hey|namaste|namaskar|pranam|jai shree krishna|kem cho|kaise ho)[!.\s]*$/i.test(
    message.trim(),
  );
}
