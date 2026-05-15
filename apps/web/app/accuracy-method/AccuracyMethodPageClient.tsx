'use client';

import Link from 'next/link';
import { getAccuracyMethodCopy } from '@pridicta/config/accuracyMethod';
import { getLanguageLabels } from '@pridicta/config/language';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

export function AccuracyMethodPageClient(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getAccuracyMethodCopy(language);
  const labels = getLanguageLabels(language);

  return (
    <>
      <WebHeader />
      <main className="method-page">
        <div className="page-heading compact method-heading">
          <StatusPill label={copy.hero.eyebrow} tone="premium" />
          <h1 className="gradient-text">{copy.hero.title}</h1>
          <p>{copy.hero.body}</p>
        </div>

        <section className="method-pillar-grid">
          {copy.pillars.map(pillar => (
            <Card className="method-pillar-card" key={pillar.title}>
              <div className="card-content">
                <h2>{pillar.title}</h2>
                <p>{pillar.body}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="method-section glass-panel">
          <div className="method-section-copy">
            <div className="section-title">{copy.calculation.eyebrow}</div>
            <h2>{copy.calculation.title}</h2>
            <p>{copy.calculation.body}</p>
          </div>
          <div className="method-fact-grid">
            {copy.calculation.items.map(item => (
              <div className="method-fact" key={`${item.label}-${item.value}`}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="method-schools">
          <div className="method-section-copy">
            <div className="section-title">{copy.schools.eyebrow}</div>
            <h2>{copy.schools.title}</h2>
            <p>{copy.schools.body}</p>
          </div>
          <div className="method-school-grid">
            {copy.schools.items.map(school => (
              <Card className="method-school-card" key={school.name}>
                <div className="card-content">
                  <h3>{school.name}</h3>
                  <p>{school.summary}</p>
                  <ul>
                    {school.proof.map(proof => (
                      <li key={proof}>{proof}</li>
                    ))}
                  </ul>
                  <div className="method-caution">{school.caution}</div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="method-depth glass-panel">
          <div className="method-section-copy">
            <div className="section-title">{copy.depth.eyebrow}</div>
            <h2>{copy.depth.title}</h2>
            <p>{copy.depth.body}</p>
          </div>
          <div className="method-depth-grid">
            <div>
              <strong>{labels.free}</strong>
              <ul>
                {copy.depth.free.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>{labels.premium}</strong>
              <ul>
                {copy.depth.premium.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="method-boundaries glass-panel">
          <div className="method-section-copy">
            <div className="section-title">{copy.boundaries.eyebrow}</div>
            <h2>{copy.boundaries.title}</h2>
            <p>{copy.boundaries.body}</p>
          </div>
          <ul>
            {copy.boundaries.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="method-cta">
          <p>{copy.cta.note}</p>
          <div>
            <Link className="button primary" href="/dashboard/kundli">
              {copy.cta.primary}
            </Link>
            <Link className="button secondary" href="/safety">
              {copy.cta.secondary}
            </Link>
          </div>
        </section>
      </main>
      <WebFooter />
    </>
  );
}
