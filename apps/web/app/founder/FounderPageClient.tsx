'use client';

import { getNativeCopy } from '@pridicta/config';
import Image from 'next/image';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const founderCopy: Record<
  SupportedLanguage,
  {
    actions: {
      dashboard: string;
      safety: string;
      start: string;
    };
    hero: {
      body: string;
      eyebrow: string;
      title: string;
    };
    letter: {
      body: string[];
      eyebrow: string;
      title: string;
    };
    portrait: string;
    principles: Array<{ copy: string; title: string }>;
    principlesHeader: {
      eyebrow: string;
      title: string;
    };
    vision: {
      eyebrow: string;
      points: string[];
      title: string;
    };
    final: string;
  }
> = {
  en: {
    actions: {
      dashboard: 'Enter Predicta',
      safety: 'Read Safety Promise',
      start: 'Begin with Predicta',
    },
    final:
      'Predicta is for people who want spiritual guidance to feel useful, safe, premium, and respectful.',
    hero: {
      body: 'I built Predicta to make Vedic astrology precise, private, calm, and useful.',
      eyebrow: 'Founder vision',
      title: 'Building Predicta for people who want clarity without noise.',
    },
    letter: {
      body: [
        'Deep chart wisdom should not feel confusing, intimidating, or cheaply packaged. A Kundli carries personal context and deserves a thoughtful experience.',
        'The goal is to honor tradition with a calmer voice, clearer structure, and confident chart exploration.',
        'Predicta is chart-backed, safety-aware, mobile-first, and careful with every answer.',
      ],
      eyebrow: 'Why Predicta exists',
      title:
        'Astrology should feel grounded enough to trust and simple enough to use.',
    },
    portrait:
      'Predicta should feel intelligent, polished, private, and human. That standard applies everywhere.',
    principles: [
      {
        copy: 'Birth details, saved Kundlis, and personal guidance must be handled with restraint, clarity, and respect.',
        title: 'Privacy by temperament',
      },
      {
        copy: 'Predicta should explain chart patterns calmly. It should not sell fear, certainty, or dependency.',
        title: 'Guidance without pressure',
      },
      {
        copy: 'Regular Predicta, KP Predicta, and Nadi Predicta should stay clear in method, purpose, and safety boundaries.',
        title: 'Clear astrology schools',
      },
      {
        copy: 'The product must be easy enough for a new user while keeping serious Jyotish depth in the background.',
        title: 'Depth without confusion',
      },
    ],
    principlesHeader: {
      eyebrow: 'Product principles',
      title: 'Calm technology for a deeply personal subject.',
    },
    vision: {
      eyebrow: 'The vision',
      points: [
        'Respect Vedic tradition while using modern engineering to make it easier to understand.',
        'Build a calmer alternative to noisy astrology apps, with premium design and clear user control.',
        'Keep public safety visible and protected before Predicta reaches more people.',
        'Grow across mobile and web without losing the same personal, careful product signature.',
      ],
      title: 'A trusted astrology companion across mobile and web.',
    },
  },
  hi: {
    actions: {
      dashboard: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.0ebae40818"),
      safety: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.b8f6668b7c"),
      start: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.80a469aaf0"),
    },
    final:
      getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.734085cf91"),
    hero: {
      body: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f754d1f03e"),
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.829157fb64"),
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.584d826205"),
    },
    letter: {
      body: [
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.5775c74335"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.33d2f51a2a"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.681f1c40e0"),
      ],
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.8ce8973c3e"),
      title:
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.9c1d7f47d2"),
    },
    portrait:
      getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.c55e6b6759"),
    principles: [
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.0b39d6ba7a"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.ce89af439f"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.01dbe124dd"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f6b0d2f181"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.923f36c6fa"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.959bc1a7fd"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.7820fc0752"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.2401d07279"),
      },
    ],
    principlesHeader: {
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.c48f0040b1"),
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.11fe97de27"),
    },
    vision: {
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.7807aec563"),
      points: [
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.8b1db6f66e"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.6cc3927e9e"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.343ecbe7b2"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.87e5974b0d"),
      ],
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f9df5722c1"),
    },
  },
  gu: {
    actions: {
      dashboard: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.c3f0d6a611"),
      safety: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.910f52e371"),
      start: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.803ce5680f"),
    },
    final:
      getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.980abeecce"),
    hero: {
      body: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.6e7533514e"),
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.6f8fb18a5e"),
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.3d0ba446f8"),
    },
    letter: {
      body: [
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.d780f1bfd1"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.6d76751ebb"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f643679fc2"),
      ],
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.c40fbdeb43"),
      title:
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f691ec3887"),
    },
    portrait:
      getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.2d71e3b4e7"),
    principles: [
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.8885c326a3"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.4a3c00299b"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.b7220e3b24"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.8624e26772"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.8e87cee046"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.3017a41456"),
      },
      {
        copy: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.7f19e8dc4f"),
        title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.f38c1bdaba"),
      },
    ],
    principlesHeader: {
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.df4313ab44"),
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.4f4e068c6a"),
    },
    vision: {
      eyebrow: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.9f36b8a09b"),
      points: [
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.c58f03d86f"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.6a498c9854"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.39711492c8"),
        getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.7d054981b0"),
      ],
      title: getNativeCopy("native.apps.web.app.founder.FounderPageClient.tsx.1f83fef4a3"),
    },
  },
};

export function FounderPageClient(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = founderCopy[language] ?? founderCopy.en;

  return (
    <>
      <WebHeader />
      <main className="founder-page">
        <section className="founder-hero" aria-labelledby="founder-title">
          <div className="founder-copy">
            <StatusPill label={copy.hero.eyebrow} tone="premium" />
            <h1 id="founder-title" className="gradient-text">
              {copy.hero.title}
            </h1>
            <p className="founder-lede">{copy.hero.body}</p>
            <div className="founder-actions">
              <Link className="button" href="/dashboard">
                {copy.actions.dashboard}
              </Link>
              <Link className="button secondary" href="/safety">
                {copy.actions.safety}
              </Link>
            </div>
          </div>

          <div className="founder-portrait-card glass-panel">
            <div className="founder-portrait-frame">
              <Image
                alt="Bhaumik Mehta"
                fill
                priority
                sizes="(max-width: 820px) 78vw, 420px"
                src="/founder-bhaumik-mehta.png"
              />
            </div>
            <div className="founder-portrait-copy">
              <p>{copy.portrait}</p>
            </div>
          </div>
        </section>

        <section className="founder-section founder-letter glass-panel">
          <div className="founder-letter-grid">
            <div className="founder-letter-heading">
              <span className="section-title">{copy.letter.eyebrow}</span>
              <h2>{copy.letter.title}</h2>
            </div>
            <div className="founder-letter-copy">
              {copy.letter.body.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="founder-section founder-principles">
          <div className="founder-section-heading">
            <span className="section-title">
              {copy.principlesHeader.eyebrow}
            </span>
            <h2>{copy.principlesHeader.title}</h2>
          </div>
          <div className="founder-principle-grid">
            {copy.principles.map(principle => (
              <Card className="founder-principle" key={principle.title}>
                <div className="card-content">
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="founder-section founder-vision glass-panel">
          <div>
            <span className="section-title">{copy.vision.eyebrow}</span>
            <h2>{copy.vision.title}</h2>
          </div>
          <div className="founder-vision-list">
            {copy.vision.points.map(point => (
              <div className="founder-vision-item" key={point}>
                <span aria-hidden="true" />
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="founder-final">
          <p>{copy.final}</p>
          <FounderSignature />
          <Link className="button" href="/dashboard">
            {copy.actions.start}
          </Link>
        </section>
      </main>
      <WebFooter />
    </>
  );
}
