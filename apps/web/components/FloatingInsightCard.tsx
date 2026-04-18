'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export function FloatingInsightCard({
  eyebrow,
  title,
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className="floating-insight-card glass-panel"
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -4 }}
    >
      <div className="section-title">{eyebrow}</div>
      <h3>{title}</h3>
      <p>{children}</p>
    </motion.article>
  );
}
