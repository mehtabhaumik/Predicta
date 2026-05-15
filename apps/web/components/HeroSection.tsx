'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { FloatingInsightCard } from './FloatingInsightCard';

export function HeroSection(): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const { language } = useLanguagePreference();
  const copy = heroCopy[language] ?? heroCopy.en;

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
          <Link className="button secondary" href="/dashboard/chat">
            {copy.secondary}
          </Link>
        </div>
      </motion.div>
      <div className="hero-visual kundli-hero-visual" aria-label="North Indian Kundli preview">
        <div className="hero-kundli-board" aria-hidden>
          {heroHouses.map((house, index) => (
            <span className="hero-kundli-house" key={house.label}>
              <small>{house.label}</small>
              <strong>{house.sign}</strong>
              {house.planet ? <em>{house.planet}</em> : null}
              <i style={{ animationDelay: `${index * 120}ms` }} />
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
    body: 'अपनी Kundli बनाएं, chart proof पढ़ें, और timing, karma, remedies और daily life पर calm holistic astrology guidance पूछें.',
    cardOneBody: 'Follow-up questions उसी life area पर focused रहते हैं जिसे आप explore कर रहे हैं.',
    cardOneEyebrow: 'D10 Career',
    cardOneTitle: 'Career timing active है',
    cardTwoBody: 'Predicta timing, chart proof और practical remedies को fear के बिना जोड़ती है.',
    cardTwoEyebrow: 'Holistic timing',
    cardTwoTitle: 'Dasha + Gochar + Karma',
    eyebrow: 'Holistic Vedic astrology + AI',
    primary: 'Predicta खोलें',
    secondary: 'Intelligence देखें',
    title: 'आपकी personal holistic astrology companion',
  },
  gu: {
    body: 'તમારી Kundli બનાવો, chart proof વાંચો, અને timing, karma, remedies અને daily life માટે calm holistic astrology guidance પૂછો.',
    cardOneBody: 'Follow-up questions તમે જે life area explore કરો છો ત્યાં focused રહે છે.',
    cardOneEyebrow: 'D10 Career',
    cardOneTitle: 'Career timing active છે',
    cardTwoBody: 'Predicta timing, chart proof અને practical remedies ને fear વગર જોડે છે.',
    cardTwoEyebrow: 'Holistic timing',
    cardTwoTitle: 'Dasha + Gochar + Karma',
    eyebrow: 'Holistic Vedic astrology + AI',
    primary: 'Predicta ખોલો',
    secondary: 'Intelligence જુઓ',
    title: 'તમારી personal holistic astrology companion',
  },
};

const heroHouses = [
  { label: '1', planet: 'Su', sign: 'Leo' },
  { label: '2', sign: 'Vir' },
  { label: '3', planet: 'Me', sign: 'Lib' },
  { label: '4', sign: 'Sco' },
  { label: '5', planet: 'Ke', sign: 'Sag' },
  { label: '6', sign: 'Cap' },
  { label: '7', planet: 'Mo', sign: 'Aqu' },
  { label: '8', sign: 'Pis' },
  { label: '9', planet: 'Ju', sign: 'Ari' },
  { label: '10', planet: 'Sa', sign: 'Tau' },
  { label: '11', sign: 'Gem' },
  { label: '12', planet: 'Ve', sign: 'Can' },
];
