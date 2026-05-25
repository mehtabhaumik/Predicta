'use client';

import { getNativeCopy } from '@pridicta/config';
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
  const [heroChartTheme, setHeroChartTheme] = useState<ChartRenderTheme>(() =>
    typeof window === 'undefined' ? 'night' : getSystemTimeChartTheme(),
  );
  const [heroChartReady, setHeroChartReady] = useState(false);
  const { language } = useLanguagePreference();
  const copy = heroCopy[language] ?? heroCopy.en;
  const landingPreset = getChartSurfacePreset('landing');

  useEffect(() => {
    const updateHeroTheme = () => {
      setHeroChartTheme(getSystemTimeChartTheme());
    };

    updateHeroTheme();
    const paintReady = window.requestAnimationFrame(() => {
      setHeroChartReady(true);
    });
    const timer = window.setInterval(updateHeroTheme, 60_000);
    return () => {
      window.cancelAnimationFrame(paintReady);
      window.clearInterval(timer);
    };
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
        {!heroChartReady ? (
          <div className="hero-kundli-loading" aria-hidden="true">
            <span>{copy.cardTwoTitle}</span>
          </div>
        ) : null}
        <div
          aria-busy={!heroChartReady}
          className="hero-kundli-board"
          data-chart-presentation="landing"
          data-chart-ready={heroChartReady ? 'true' : 'false'}
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
    body: getNativeCopy("native.apps.web.components.HeroSection.tsx.684af6c175"),
    cardOneBody: getNativeCopy("native.apps.web.components.HeroSection.tsx.6e19291dba"),
    cardOneEyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.6e9568694f"),
    cardOneTitle: getNativeCopy("native.apps.web.components.HeroSection.tsx.d76db00ccf"),
    cardTwoBody: getNativeCopy("native.apps.web.components.HeroSection.tsx.53d1c7574a"),
    cardTwoEyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.f07eb187ad"),
    cardTwoTitle: getNativeCopy("native.apps.web.components.HeroSection.tsx.1936f96aa0"),
    eyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.d82843d577"),
    primary: getNativeCopy("native.apps.web.components.HeroSection.tsx.0ebae40818"),
    secondary: getNativeCopy("native.apps.web.components.HeroSection.tsx.4ba099bfd8"),
    title: getNativeCopy("native.apps.web.components.HeroSection.tsx.0308e9287f"),
  },
  gu: {
    body: getNativeCopy("native.apps.web.components.HeroSection.tsx.5bd3e36092"),
    cardOneBody: getNativeCopy("native.apps.web.components.HeroSection.tsx.10e8e47d6d"),
    cardOneEyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.8c76810d2f"),
    cardOneTitle: getNativeCopy("native.apps.web.components.HeroSection.tsx.e9226c777d"),
    cardTwoBody: getNativeCopy("native.apps.web.components.HeroSection.tsx.235982ebff"),
    cardTwoEyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.c5e06910c2"),
    cardTwoTitle: getNativeCopy("native.apps.web.components.HeroSection.tsx.8d114f0a80"),
    eyebrow: getNativeCopy("native.apps.web.components.HeroSection.tsx.fe61b52345"),
    primary: getNativeCopy("native.apps.web.components.HeroSection.tsx.c3f0d6a611"),
    secondary: getNativeCopy("native.apps.web.components.HeroSection.tsx.29fbbda133"),
    title: getNativeCopy("native.apps.web.components.HeroSection.tsx.5ea804eebb"),
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
