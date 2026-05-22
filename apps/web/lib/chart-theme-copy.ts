import type { SupportedLanguage } from '@pridicta/types';
import type { ChartRenderTheme } from '@pridicta/astrology';

type ChartThemeNote = {
  eyebrow: string;
  title: string;
  body: string;
};

export function getChartThemeNote({
  language,
  theme,
  time,
}: {
  language: SupportedLanguage;
  theme: ChartRenderTheme;
  time?: string;
}): ChartThemeNote {
  const timeLabel = time?.trim() ? time.trim() : undefined;

  if (language === 'hi') {
    return getHindiThemeNote(theme, timeLabel);
  }

  if (language === 'gu') {
    return getGujaratiThemeNote(theme, timeLabel);
  }

  return getEnglishThemeNote(theme, timeLabel);
}

function getEnglishThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? `You were born at ${time}` : 'Your recorded birth time';

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: 'Birth-time theme',
      title: 'Afternoon chart light',
      body: `${timeLead}, so this chart uses Predicta's afternoon palette. Fun fact: afternoon charts feel clearer and more matter-of-fact, which suits charts where practical life delivery matters.`,
    },
    morning: {
      eyebrow: 'Birth-time theme',
      title: 'Morning chart light',
      body: `${timeLead}, so this chart uses Predicta's morning palette. Fun fact: morning charts often feel fresh, building, and growth-oriented because the day is still unfolding.`,
    },
    night: {
      eyebrow: 'Birth-time theme',
      title: 'Night chart light',
      body: `${timeLead}, so this chart uses Predicta's night palette. Fun fact: night charts naturally feel quieter and more inward, which makes hidden motives and inner timing easier to feel.`,
    },
    sunrise: {
      eyebrow: 'Birth-time theme',
      title: 'Sunrise chart light',
      body: `${timeLead}, so this chart uses Predicta's sunrise palette. Fun fact: sunrise charts tend to feel like first-light stories: emergence, visibility, and a life that keeps asking to begin again with clarity.`,
    },
    sunset: {
      eyebrow: 'Birth-time theme',
      title: 'Sunset chart light',
      body: `${timeLead}, so this chart uses Predicta's sunset palette. Fun fact: sunset charts often carry transition energy, where duty, closure, and ripening results become more visible.`,
    },
    unknown: {
      eyebrow: 'Birth-time theme',
      title: 'Default chart light',
      body: 'Predicta could not confidently place this chart into a sunrise, day, sunset, or night band, so it is using the neutral default palette.',
    },
  };

  return notes[theme];
}

function getHindiThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? `आपका जन्म समय ${time} है` : 'दिया गया जन्म समय';

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: 'जन्म-समय थीम',
      title: 'दोपहर की चार्ट रोशनी',
      body: `${timeLead}, इसलिए यह कुंडली Predicta की afternoon palette में दिखाई जाती है. मज़ेदार बात: दोपहर वाले चार्ट ज़्यादा साफ और practical महसूस होते हैं, इसलिए जीवन की सीधी डिलीवरी समझना आसान लगता है.`,
    },
    morning: {
      eyebrow: 'जन्म-समय थीम',
      title: 'सुबह की चार्ट रोशनी',
      body: `${timeLead}, इसलिए यह कुंडली Predicta की morning palette में दिखाई जाती है. मज़ेदार बात: सुबह वाले चार्ट अक्सर growth, शुरुआत और build-up की energy देते हैं.`,
    },
    night: {
      eyebrow: 'जन्म-समय थीम',
      title: 'रात की चार्ट रोशनी',
      body: `${timeLead}, इसलिए यह कुंडली Predicta की night palette में दिखाई जाती है. मज़ेदार बात: रात वाले चार्ट अंदरूनी मन, छिपे कारण और गहरे timing संकेतों को अधिक शांत ढंग से महसूस कराते हैं.`,
    },
    sunrise: {
      eyebrow: 'जन्म-समय थीम',
      title: 'सूर्योदय की चार्ट रोशनी',
      body: `${timeLead}, इसलिए यह कुंडली Predicta की sunrise palette में दिखाई जाती है. मज़ेदार बात: सूर्योदय वाले चार्ट अक्सर नई शुरुआत, visibility और fresh momentum की कहानी सुनाते हैं.`,
    },
    sunset: {
      eyebrow: 'जन्म-समय थीम',
      title: 'सूर्यास्त की चार्ट रोशनी',
      body: `${timeLead}, इसलिए यह कुंडली Predicta की sunset palette में दिखाई जाती है. मज़ेदार बात: सूर्यास्त वाले चार्ट transition, जिम्मेदारी और पकते हुए परिणामों को उभारते हैं.`,
    },
    unknown: {
      eyebrow: 'जन्म-समय थीम',
      title: 'डिफॉल्ट चार्ट रोशनी',
      body: 'Predicta इस कुंडली को किसी साफ sunrise, day, sunset या night band में नहीं रख पाया, इसलिए neutral default palette दिखाई जा रही है.',
    },
  };

  return notes[theme];
}

function getGujaratiThemeNote(
  theme: ChartRenderTheme,
  time?: string,
): ChartThemeNote {
  const timeLead = time ? `તમારો જન્મ સમય ${time} છે` : 'આપેલ જન્મ સમય';

  const notes: Record<ChartRenderTheme, ChartThemeNote> = {
    afternoon: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'બપોરનો ચાર્ટ પ્રકાશ',
      body: `${timeLead}, તેથી આ કુંડળી Predicta ની afternoon palette માં દેખાય છે. રસપ્રદ વાત: બપોરના ચાર્ટ સામાન્ય રીતે વધુ સ્પષ્ટ અને practical લાગે છે, એટલે જીવનની actual delivery વધુ સીધી લાગે છે.`,
    },
    morning: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'સવારનો ચાર્ટ પ્રકાશ',
      body: `${timeLead}, તેથી આ કુંડળી Predicta ની morning palette માં દેખાય છે. રસપ્રદ વાત: સવારના ચાર્ટમાં growth, શરૂઆત અને unfolding energy વધારે અનુભવે છે.`,
    },
    night: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'રાતનો ચાર્ટ પ્રકાશ',
      body: `${timeLead}, તેથી આ કુંડળી Predicta ની night palette માં દેખાય છે. રસપ્રદ વાત: રાતના ચાર્ટ અંદરની પ્રેરણા, છુપાયેલી વાતો અને ઊંડા timing સંકેતોને વધારે શાંતિથી બતાવે છે.`,
    },
    sunrise: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'સૂર્યોદયનો ચાર્ટ પ્રકાશ',
      body: `${timeLead}, તેથી આ કુંડળી Predicta ની sunrise palette માં દેખાય છે. રસપ્રદ વાત: સૂર્યોદયના ચાર્ટ નવી શરૂઆત, visibility અને fresh momentum ની લાગણી આપે છે.`,
    },
    sunset: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'સૂર્યાસ્તનો ચાર્ટ પ્રકાશ',
      body: `${timeLead}, તેથી આ કુંડળી Predicta ની sunset palette માં દેખાય છે. રસપ્રદ વાત: સૂર્યાસ્તના ચાર્ટ transition, જવાબદારી અને પકવાયેલા પરિણામોને વધારે સ્પષ્ટ કરે છે.`,
    },
    unknown: {
      eyebrow: 'જન્મ-સમય થીમ',
      title: 'ડિફોલ્ટ ચાર્ટ પ્રકાશ',
      body: 'Predicta આ કુંડળીને ચોક્કસ sunrise, day, sunset અથવા night band માં મૂકી શક્યો નથી, તેથી neutral default palette બતાવવામાં આવી રહી છે.',
    },
  };

  return notes[theme];
}
