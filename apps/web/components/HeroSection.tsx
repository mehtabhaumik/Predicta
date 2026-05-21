'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  getChartSurfacePreset,
  getChartRenderTheme,
  NORTH_INDIAN_HOUSE_POSITIONS,
  type ChartRenderTheme,
} from '@pridicta/astrology';
import type { SupportedLanguage } from '@pridicta/types';
import {
  getKundliAnimationStyle,
  getKundliAnimationSurfaceProps,
} from '../lib/kundli-animation-contract';
import { useLanguagePreference } from '../lib/language-preference';
import { FloatingInsightCard } from './FloatingInsightCard';
import { NorthIndianChartLines } from './WebKundliChart';
import { PlanetGlyph } from './PlanetGlyph';

export function HeroSection(): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const [heroChartTheme, setHeroChartTheme] = useState<ChartRenderTheme>('unknown');
  const { language } = useLanguagePreference();
  const copy = heroCopy[language] ?? heroCopy.en;
  const landingPreset = getChartSurfacePreset('landing');

  useEffect(() => {
    const updateHeroTheme = () => {
      setHeroChartTheme(getSystemTimeChartTheme());
    };

    updateHeroTheme();
    const timer = window.setInterval(updateHeroTheme, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-section">
      <motion.div
        aria-hidden
        className="hero-ambient"
        animate={reduceMotion ? undefined : { opacity: [0.42, 0.66, 0.42] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
      />
      <motion.div
        className="hero-copy"
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="section-title">{copy.eyebrow}</div>
        <h1>{copy.title}</h1>
        <p>{copy.body}</p>
        <div className="hero-actions">
          <Link className="button" href="/dashboard">
            {copy.primary}
          </Link>
          <Link className="button secondary" href="/dashboard/vedic/chat">
            {copy.secondary}
          </Link>
        </div>
      </motion.div>
      <div className="hero-visual kundli-hero-visual" aria-label="North Indian Kundli preview">
        <div
          className="hero-kundli-board"
          data-chart-presentation="landing"
          data-chart-school="parashari"
          data-chart-theme={heroChartTheme}
          {...getKundliAnimationSurfaceProps('landing')}
          aria-hidden
        >
          <NorthIndianChartLines surface="landing" />
          {heroHouses.map((house, index) => (
            <span
              className={`hero-chart-label hero-chart-label-${house.house} ${
                house.planets.length >= 3 ? 'crowded' : ''
              }`}
              data-kundli-animation-part="signs"
              key={house.house}
              style={{
                ['--chart-cell-index' as string]: index,
                ...getKundliAnimationStyle(index, 'signs', 'landing'),
                ['--house-x' as string]: `${house.x}%`,
                ['--house-y' as string]: `${house.y}%`,
              } as CSSProperties}
            >
              <small className="hero-sign-meta">
                <span className="hero-sign-number">{house.signNumber}</span>
                <span className="hero-sign-name">{house.sign}</span>
                <span className="hero-sign-symbol" aria-hidden>
                  {house.signGlyph}
                </span>
              </small>
              {house.planets.length ? (
                <span
                  className="hero-chart-planet-stack"
                  data-kundli-animation-part="planets"
                >
                  {house.planets
                    .slice(0, landingPreset.maxVisiblePlanets)
                    .map((planet, planetIndex) => (
                    <PlanetGlyph
                      animationIndex={planetIndex}
                      animationSurface="landing"
                      key={planet.name}
                      moonPhase="waxing"
                      planet={planet}
                      showDegree={landingPreset.showPlanetDegrees}
                      showSign={landingPreset.showPlanetSign}
                      showStatusMarks={landingPreset.showPlanetStatusMarks}
                      size={landingPreset.planetGlyphSize}
                    />
                  ))}
                  {house.planets.length > landingPreset.maxVisiblePlanets ? (
                    <span className="chart-overflow-counter">
                      +{house.planets.length - landingPreset.maxVisiblePlanets}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </span>
          ))}
        </div>
        <FloatingInsightCard
          delay={0.2}
          eyebrow={copy.cardOneEyebrow}
          title={copy.cardOneTitle}
        >
          {copy.cardOneBody}
        </FloatingInsightCard>
        <FloatingInsightCard
          delay={0.38}
          eyebrow={copy.cardTwoEyebrow}
          title={copy.cardTwoTitle}
        >
          {copy.cardTwoBody}
        </FloatingInsightCard>
      </div>
    </section>
  );
}

function getSystemTimeChartTheme(date = new Date()): ChartRenderTheme {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return getChartRenderTheme(`${hours}:${minutes}`);
}

const heroCopy: Record<
  SupportedLanguage,
  {
    body: string;
    cardOneBody: string;
    cardOneEyebrow: string;
    cardOneTitle: string;
    cardTwoBody: string;
    cardTwoEyebrow: string;
    cardTwoTitle: string;
    eyebrow: string;
    primary: string;
    secondary: string;
    title: string;
  }
> = {
  en: {
    body: 'Generate your kundli, read chart proof, and ask Predicta for calm holistic astrology guidance across timing, karma, remedies, and daily life.',
    cardOneBody: 'Follow-up questions stay focused on the part of life you are exploring.',
    cardOneEyebrow: 'D10 Career',
    cardOneTitle: 'Career timing is active',
    cardTwoBody: 'Predicta joins timing, chart proof, and practical remedies without fear.',
    cardTwoEyebrow: 'Holistic timing',
    cardTwoTitle: 'Dasha + Gochar + Karma',
    eyebrow: 'Holistic Vedic astrology + AI',
    primary: 'Enter Predicta',
    secondary: 'Explore Intelligence',
    title: 'Your personal holistic astrology companion',
  },
  hi: {
    body: 'अपनी कुंडली बनाएं, चार्ट प्रमाण पढ़ें, और समय, कर्म, उपाय और दैनिक जीवन पर शांत समग्र ज्योतिष मार्गदर्शन पूछें.',
    cardOneBody: 'आगे के सवाल उसी जीवन क्षेत्र पर केंद्रित रहते हैं जिसे आप समझ रहे हैं.',
    cardOneEyebrow: 'D10 करियर',
    cardOneTitle: 'करियर समय सक्रिय है',
    cardTwoBody: 'प्रेडिक्टा समय, चार्ट प्रमाण और व्यावहारिक उपायों को डर के बिना जोड़ती है.',
    cardTwoEyebrow: 'समग्र समय',
    cardTwoTitle: 'दशा + गोचर + कर्म',
    eyebrow: 'समग्र वैदिक ज्योतिष + एआई',
    primary: 'प्रेडिक्टा खोलें',
    secondary: 'बुद्धि देखें',
    title: 'आपकी निजी समग्र ज्योतिष साथी',
  },
  gu: {
    body: 'તમારી કુંડળી બનાવો, ચાર્ટ પુરાવો વાંચો, અને સમય, કર્મ, ઉપાયો અને દૈનિક જીવન માટે શાંત સમગ્ર જ્યોતિષ માર્ગદર્શન પૂછો.',
    cardOneBody: 'આગળના પ્રશ્નો તમે જે જીવન ક્ષેત્ર સમજી રહ્યા છો ત્યાં જ કેન્દ્રિત રહે છે.',
    cardOneEyebrow: 'D10 કરિયર',
    cardOneTitle: 'કરિયર સમય સક્રિય છે',
    cardTwoBody: 'પ્રેડિક્ટા સમય, ચાર્ટ પુરાવો અને વ્યવહારુ ઉપાયોને ડર વિના જોડે છે.',
    cardTwoEyebrow: 'સમગ્ર સમય',
    cardTwoTitle: 'દશા + ગોચર + કર્મ',
    eyebrow: 'સમગ્ર વૈદિક જ્યોતિષ + એઆઈ',
    primary: 'પ્રેડિક્ટા ખોલો',
    secondary: 'બુદ્ધિ જુઓ',
    title: 'તમારી ખાનગી સમગ્ર જ્યોતિષ સાથી',
  },
};

const heroHouses = [
  heroHouse(1, 'Leo', '♌', 5, [heroPlanet('Sun', 5.5), heroPlanet('Mercury', 0.9)]),
  heroHouse(2, 'Virgo', '♍', 6, [heroPlanet('Jupiter', 22.4)]),
  heroHouse(3, 'Libra', '♎', 7, [heroPlanet('Mars', 1.8)]),
  heroHouse(4, 'Scorpio', '♏', 8, []),
  heroHouse(5, 'Sagittarius', '♐', 9, [heroPlanet('Moon', 11.8)]),
  heroHouse(6, 'Capricorn', '♑', 10, []),
  heroHouse(7, 'Aquarius', '♒', 11, [heroPlanet('Ketu', 26.6, true)]),
  heroHouse(8, 'Pisces', '♓', 12, []),
  heroHouse(9, 'Aries', '♈', 1, []),
  heroHouse(10, 'Taurus', '♉', 2, [heroPlanet('Saturn', 2.7)]),
  heroHouse(11, 'Gemini', '♊', 3, [heroPlanet('Venus', 19.8)]),
  heroHouse(12, 'Cancer', '♋', 4, [heroPlanet('Rahu', 26.6, true)]),
] as const;

function heroHouse(
  house: number,
  sign: string,
  signGlyph: string,
  signNumber: number,
  planets: ReturnType<typeof heroPlanet>[],
) {
  const position = NORTH_INDIAN_HOUSE_POSITIONS[house];
  return {
    house,
    planets,
    sign,
    signGlyph,
    signNumber,
    x: position.x,
    y: position.y,
  };
}

function heroPlanet(name: string, degree: number, retrograde = false) {
  return {
    absoluteLongitude: degree,
    degree,
    house: 1,
    nakshatra: '',
    name,
    pada: 1,
    retrograde,
    sign: '',
  };
}
