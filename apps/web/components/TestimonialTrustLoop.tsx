'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { getTestimonialTrustCopy } from '@pridicta/config/testimonialTrust';
import { useLanguagePreference } from '../lib/language-preference';

export function TestimonialTrustLoop(): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const { language } = useLanguagePreference();
  const copy = getTestimonialTrustCopy(language);

  return (
    <motion.section
      className="testimonial-trust-section"
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: '-80px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <div className="section-heading">
        <div className="section-title">{copy.eyebrow}</div>
        <h2>{copy.title}</h2>
        <p>{copy.intro}</p>
      </div>

      <div className="testimonial-signal-grid">
        {copy.signals.map(signal => (
          <article className="testimonial-signal-card" key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.value}</strong>
            <p>{signal.detail}</p>
          </article>
        ))}
      </div>

      <div className="testimonial-loop glass-panel">
        <div className="testimonial-loop-copy">
          <div className="section-title">{copy.testerLoop.title}</div>
          <p>{copy.testerLoop.body}</p>
        </div>
        <div className="testimonial-step-list">
          {copy.testerLoop.steps.map(step => (
            <article className="testimonial-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="testimonial-wall">
        <div className="testimonial-wall-intro">
          <h3>{copy.testimonialWall.title}</h3>
          <p>{copy.testimonialWall.body}</p>
        </div>
        <div className="testimonial-quote-grid">
          {copy.testimonialWall.placeholders.map(item => (
            <figure className="testimonial-quote" key={item.role}>
              <blockquote>{item.quote}</blockquote>
              <figcaption>{item.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <div className="testimonial-actions">
        <p>{copy.cta.note}</p>
        <div>
          <Link className="button primary" href="/dashboard">
            {copy.cta.primary}
          </Link>
          <Link
            className="button secondary"
            href="/feedback?source=family-friends&area=general&from=trust-loop"
          >
            {copy.cta.secondary}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
