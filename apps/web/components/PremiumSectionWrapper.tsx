'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PremiumSectionWrapper({
  children,
  eyebrow,
  id,
  title,
  intro,
  variant = 'default',
}: {
  children: ReactNode;
  eyebrow: string;
  id?: string;
  intro?: string;
  title: string;
  variant?: 'default' | 'wide' | 'split';
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      className={`premium-section ${variant}`}
      id={id}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-80px' }}
    >
      <div className="section-heading">
        <div className="section-title">{eyebrow}</div>
        <h2>{title}</h2>
        {intro ? <p>{intro}</p> : null}
      </div>
      {children}
    </motion.section>
  );
}
