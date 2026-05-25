'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const safetyCopy: Record<
  SupportedLanguage,
  {
    checks: string[];
    commitments: Array<{ body: string; title: string }>;
    final: string;
    founderPromise: string;
    hero: {
      body: string;
      eyebrow: string;
      title: string;
    };
    policyCta: string;
    proof: {
      body: string;
      eyebrow: string;
      title: string;
    };
    standard: {
      body: string;
      eyebrow: string;
      title: string;
    };
    checksSection: {
      body: string;
      eyebrow: string;
      title: string;
    };
  }
> = {
  en: {
    checks: [
      'Self-harm and crisis handling',
      'Medical, legal, financial, behavior, abuse, and emergency safeguards',
      'Unsafe instructions and illegal requests',
      'Fear-based and fatalistic predictions',
      'Hindi, Gujarati, English, and mixed-language questions',
      'Clear separation between Regular, KP, and Nadi Predicta',
      'Easy reporting when an answer feels concerning',
      'A clear stop before unsafe changes reach users',
    ],
    checksSection: {
      body: 'Predicta is prepared for crisis language, serious decisions, mixed languages, school confusion, and answers that need a calmer tone.',
      eyebrow: 'WHAT WE PREPARE FOR',
      title: 'Predicta is prepared for risky real-world questions.',
    },
    commitments: [
      {
        body: 'Predicta answers serious astrology questions as reflection, not a replacement for qualified help or real-world judgment.',
        title: 'Guidance, not replacement',
      },
      {
        body: 'If danger appears, care comes first. Any astrology reflection stays gentle, protective, and non-fatalistic.',
        title: 'Crisis comes first',
      },
      {
        body: 'Finance, medical, legal, behavior, and family questions are allowed with clear limits.',
        title: 'Serious topics are allowed with safeguards',
      },
      {
        body: 'Predicta blocks harmful instructions, illegal actions, sexual content involving minors, violent guidance, and other unsafe requests.',
        title: 'Unsafe requests are blocked',
      },
      {
        body: 'No guaranteed death, divorce, illness, bankruptcy, or disaster predictions.',
        title: 'No fear-based predictions',
      },
      {
        body: 'Scary or overconfident answers are softened into calmer guidance.',
        title: 'Unsafe answers are softened',
      },
      {
        body: 'Predicta is prepared for messy language, mixed languages, and difficult real-life questions.',
        title: 'Prepared for difficult questions',
      },
      {
        body: 'Regular Predicta, KP Predicta, and Nadi Predicta are kept separate so each school speaks from its own tradition.',
        title: 'Different astrology schools stay separate',
      },
      {
        body: 'Nadi Predicta is not allowed to falsely claim it found or accessed a real ancient palm-leaf record.',
        title: 'Clear Nadi claims',
      },
      {
        body: 'Users can report a concerning answer from chat.',
        title: 'Users can report concerns',
      },
      {
        body: 'Reports avoid full chat text and exact birth details.',
        title: 'Privacy stays protected',
      },
      {
        body: 'Unsafe changes should not reach users.',
        title: 'Safety comes before public sharing',
      },
    ],
    final:
      'Use Predicta as a spiritual timing lens alongside qualified support for serious decisions.',
    founderPromise:
      'Predicta should stay useful, beautiful, and respectful during uncertain moments. Safety stays non-negotiable.',
    hero: {
      body: 'Ask serious Jyotish questions with calm guidance, chart proof, and clear limits.',
      eyebrow: 'Public safety promise',
      title: 'Predicta is built to guide, not scare.',
    },
    policyCta: 'Read Policies',
    proof: {
      body: 'Guidance should stay calm, responsible, and useful before it reaches anyone.',
      eyebrow: 'Public promise',
      title: 'Safety comes first',
    },
    standard: {
      body: 'Predicta gives guidance without fear, guarantees, or crisis overreach. The goal is care, not unnecessary denial.',
      eyebrow: 'OUR STANDARD',
      title: 'Safety is part of the product, not a footnote.',
    },
  },
  hi: {
    checks: [
      getNativeCopy("native.apps.web.app.safety.page.tsx.8b5a65b372"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.40dc148fb7"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.a6ceeb2c42"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.87370744fc"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.45e7daddb9"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.0a697fb830"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.80efce20d6"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.bc5dac443a"),
    ],
    checksSection: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.88c2d492ba"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.ab4e05eeae"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.5e7351e0ea"),
    },
    commitments: [
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.e442757f23"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.9943407e08"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.02d750e441"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.fdded43054"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.9809a5d624"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.659e78c889"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.8f24259153"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.d5e8df42e7"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.4ffac68bad"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.5046a5e7fd"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.97390db08a"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.883e6becbb"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.38064e4b98"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.7e8b7658db"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.6a03fb912c"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.f2bb625f7d"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.a0acd8c3f3"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.64dee7ecf7"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.6c43885acb"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.5fb0436579"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.cc3616de6d"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.53011a0911"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.2d967bb81d"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.cebbd67418"),
      },
    ],
    final:
      getNativeCopy("native.apps.web.app.safety.page.tsx.f1cd75d447"),
    founderPromise:
      getNativeCopy("native.apps.web.app.safety.page.tsx.5fe46f43a8"),
    hero: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.e0f4efea97"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.87020d49f7"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.2c72bb2be0"),
    },
    policyCta: getNativeCopy("native.apps.web.app.safety.page.tsx.e9003ca9b9"),
    proof: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.97ec070828"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.048b389df9"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.752c20579a"),
    },
    standard: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.3774ca9e37"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.0863bfcd64"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.b4e62bb129"),
    },
  },
  gu: {
    checks: [
      getNativeCopy("native.apps.web.app.safety.page.tsx.477d5b82e2"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.b6cde2c2aa"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.d8de9bfeb9"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.8b94f35fc2"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.2b8e745ed4"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.6cf5d45581"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.7ef24cf57d"),
      getNativeCopy("native.apps.web.app.safety.page.tsx.a90331e54b"),
    ],
    checksSection: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.748c5f9198"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.13101aa71a"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.3e505804f1"),
    },
    commitments: [
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.13d745e300"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.e630e09c70"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.1a4477d710"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.1cc3d41c36"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.df5e334322"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.cc4c0d7a68"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.52373ff99e"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.c1e5205f09"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.17e0764d44"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.02f049acc3"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.3d0ef1d281"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.3ab9654351"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.960f6f8641"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.4cb9889dc8"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.0ad04361eb"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.6141d6e613"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.925d94c5cf"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.a222498d59"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.e50cf5b4b6"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.ea2d8cc7de"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.e3c8ae1ee6"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.b776f2617d"),
      },
      {
        body: getNativeCopy("native.apps.web.app.safety.page.tsx.a26279891e"),
        title: getNativeCopy("native.apps.web.app.safety.page.tsx.ecee21d053"),
      },
    ],
    final:
      getNativeCopy("native.apps.web.app.safety.page.tsx.67908dbba2"),
    founderPromise:
      getNativeCopy("native.apps.web.app.safety.page.tsx.08426c4730"),
    hero: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.a03a5d0a39"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.48246ea17a"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.47c93abf51"),
    },
    policyCta: getNativeCopy("native.apps.web.app.safety.page.tsx.60f826fa78"),
    proof: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.9ca22d63b3"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.973e2b33bc"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.016a495eb4"),
    },
    standard: {
      body: getNativeCopy("native.apps.web.app.safety.page.tsx.d1005cea4a"),
      eyebrow: getNativeCopy("native.apps.web.app.safety.page.tsx.13e10e0102"),
      title: getNativeCopy("native.apps.web.app.safety.page.tsx.9c4e0e1fcd"),
    },
  },
};

export default function SafetyPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = safetyCopy[language] ?? safetyCopy.en;

  return (
    <>
      <WebHeader />
      <main className="safety-page">
        <div className="page-heading compact safety-heading">
          <StatusPill label={copy.hero.eyebrow} tone="premium" />
          <h1 className="gradient-text">{copy.hero.title}</h1>
          <p>{copy.hero.body}</p>
        </div>

        <section className="safety-hero glass-panel">
          <div>
            <div className="section-title">{copy.standard.eyebrow}</div>
            <h2>{copy.standard.title}</h2>
            <p>{copy.standard.body}</p>
          </div>
          <div className="safety-proof-card">
            <span>{copy.proof.eyebrow}</span>
            <strong>{copy.proof.title}</strong>
            <p>{copy.proof.body}</p>
          </div>
        </section>

        <section className="safety-commitments">
          {copy.commitments.map((item, index) => (
            <Card className="safety-commitment-card" key={item.title}>
              <div className="card-content">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="safety-checks glass-panel">
          <div>
            <div className="section-title">{copy.checksSection.eyebrow}</div>
            <h2>{copy.checksSection.title}</h2>
            <p>{copy.checksSection.body}</p>
          </div>
          <ul>
            {copy.checks.map(check => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </section>

        <section className="founder-promise">
          <div className="section-title">FOUNDER PROMISE</div>
          <p>{copy.founderPromise}</p>
          <FounderSignature />
        </section>

        <div className="legal-footer-note">
          <p>{copy.final}</p>
          <Link className="button secondary" href="/legal">
            {copy.policyCta}
          </Link>
        </div>
      </main>
      <WebFooter />
    </>
  );
}
