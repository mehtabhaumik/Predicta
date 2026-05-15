'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { getWebGrowthAdvantageCopy } from '@pridicta/config/webGrowthAdvantage';
import { useLanguagePreference } from '../lib/language-preference';

export function WebGrowthAdvantage(): React.JSX.Element {
  const reduceMotion = useReducedMotion();
  const { language } = useLanguagePreference();
  const copy = getWebGrowthAdvantageCopy(language);
  const [copied, setCopied] = useState(false);
  const inviteUrl = useMemo(
    () =>
      typeof window === 'undefined'
        ? 'https://predicta.app'
        : `${window.location.origin}/dashboard/redeem-pass?source=family-friends`,
    [],
  );

  async function copyInviteLink() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.section
      className="web-growth-section"
      id="web-growth"
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

      <div className="web-growth-grid">
        {copy.advantages.map(item => (
          <article className="web-growth-card" key={item.title}>
            <span>{item.proof}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="web-growth-loop glass-panel">
        <div className="web-growth-loop-copy">
          <div className="section-title">{copy.launchLoop.title}</div>
          <p>{copy.launchLoop.body}</p>
          <div className="web-growth-actions">
            <button className="button primary" onClick={copyInviteLink} type="button">
              {copied ? copy.actions.copied : copy.actions.copyInvite}
            </button>
            <Link className="button secondary" href="/dashboard">
              {copy.actions.openDashboard}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.actions.openReports}
            </Link>
            <Link className="button secondary" href="/dashboard/redeem-pass">
              {copy.actions.redeemPass}
            </Link>
          </div>
        </div>

        <div className="web-growth-step-list">
          {copy.launchLoop.steps.map(step => (
            <article className="web-growth-step" key={step.title}>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
