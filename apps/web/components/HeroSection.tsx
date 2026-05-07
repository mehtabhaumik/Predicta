'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { FloatingInsightCard } from './FloatingInsightCard';

export function HeroSection(): React.JSX.Element {
  const reduceMotion = useReducedMotion();

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
        <div className="section-title">VEDIC ASTROLOGY + AI</div>
        <h1>Your personal Vedic intelligence system</h1>
        <p>
          Generate your kundli, explore deeper chart patterns, and ask Predicta
          for calm, chart-aware guidance from one spacious desktop experience.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/dashboard">
            Enter Predicta
          </Link>
          <Link className="button secondary" href="#intelligence">
            Explore Intelligence
          </Link>
        </div>
      </motion.div>
      <div className="hero-visual" aria-label="Predicta preview">
        <div className="chart-orbit" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} style={{ transform: `rotate(${index * 30}deg)` }} />
          ))}
        </div>
        <FloatingInsightCard
          delay={0.2}
          eyebrow="D10 CAREER"
          title="Career timing is active"
        >
          Follow-up questions stay focused on the part of life you are exploring.
        </FloatingInsightCard>
        <FloatingInsightCard
          delay={0.38}
          eyebrow="CURRENT DASHA"
          title="Saturn / Mercury"
        >
          Predicta keeps guidance focused so deep readings stay calm and clear.
        </FloatingInsightCard>
      </div>
    </section>
  );
}
