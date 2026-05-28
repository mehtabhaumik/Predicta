'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { PredictaWorldFrame } from '../../../components/PredictaWorldFrame';
import { WebVedicIntelligencePanel } from '../../../components/WebVedicIntelligencePanel';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';
import { demoAccess } from '../../../lib/demo-state';
import { useLanguagePreference } from '../../../lib/language-preference';
import { useWebKundliLibrary } from '../../../lib/use-web-kundli-library';

type VedicWorldCopy = {
  actions: {
    birthTime: string;
    chat: string;
    charts: string;
    create: string;
    reports: string;
  };
  report: {
    body: string;
    cta: string;
    title: string;
  };
  cards: Array<{
    body: string;
    title: string;
  }>;
  hero: {
    body: string;
    eyebrow: string;
    title: string;
  };
  note: {
    body: string;
    title: string;
  };
};

const VEDIC_WORLD_COPY: Record<SupportedLanguage, VedicWorldCopy> = {
  en: {
    actions: {
      birthTime: 'Check birth time',
      chat: 'Chat with Vedic Predicta',
      charts: 'Open charts',
      create: 'Create Kundli',
      reports: 'Create report',
    },
    cards: [
      {
        body: 'D1, Chalit, varga charts, dasha, gochar, and house proof stay together.',
        title: 'Chart proof first',
      },
      {
        body: 'Ask about career, money, marriage, health caution, family, timing, and remedies.',
        title: 'Life questions',
      },
      {
        body: 'Karma-based remedies, Purushartha balance, Panchang, and daily guidance stay in this Vedic world.',
        title: 'Holistic support',
      },
    ],
    hero: {
      body:
        'Use this world for the main Vedic reading: Kundli, charts, dasha, gochar, remedies, timing, and report-ready guidance.',
      eyebrow: 'VEDIC WORLD',
      title: 'Your main Vedic Predicta space.',
    },
    note: {
      body:
        'KP, Nadi, Numerology, and Signature now have their own worlds. Vedic Predicta stays focused on the core Jyotish reading.',
      title: 'Separate worlds, shared Kundli',
    },
    report: {
      body:
        'Turn the Vedic reading into a polished Kundli, career, marriage, wealth, remedies, or timing report.',
      cta: 'Build Vedic report',
      title: 'Vedic report path',
    },
  },
  hi: {
    actions: {
      birthTime: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.8d490f9dcd"),
      chat: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a67d2686b8"),
      charts: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.39fccd39c2"),
      create: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.7cacfebde9"),
      reports: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a5f7053738"),
    },
    cards: [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.d3e377e0cd"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a39a7c203f"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.3154fb8261"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.f6e23b2e8c"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.d5e1ee77c9"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.2d88fadbfc"),
      },
    ],
    hero: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.19648f7ce7"),
      eyebrow: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.4433fb4239"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.861a634c9e"),
    },
    note: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9fea2d66c9"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.dc31b7a777"),
    },
    report: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.73516f089d"),
      cta: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a11279c170"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.df38e07305"),
    },
  },
  gu: {
    actions: {
      birthTime: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.00a76e817b"),
      chat: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.64b1ebeafa"),
      charts: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.dcc1de4a22"),
      create: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.c0e4dc5abd"),
      reports: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.729dc16940"),
    },
    cards: [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.bedf1278a5"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.5293d2cbd1"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.b4a139d262"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.31c681c292"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.5a8c51908d"),
        title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.775de3163b"),
      },
    ],
    hero: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.49e6c07c4c"),
      eyebrow: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.eee556bafa"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9daf86316e"),
    },
    note: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.c8fff2bb92"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.16901fb4aa"),
    },
    report: {
      body:
        getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.bf62cc104e"),
      cta: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.224efad342"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.bfeb531ede"),
    },
  },
};

export default function VedicPredictaPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli } = useWebKundliLibrary();
  const copy = VEDIC_WORLD_COPY[language] ?? VEDIC_WORLD_COPY.en;
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    kundliId: activeKundli?.id,
    prompt:
      'Read my Vedic chart using D1, varga support, dasha, gochar, remedies, and current life timing.',
    school: 'PARASHARI',
    sourceScreen: 'Vedic Predicta',
  });

  return (
    <section className="dashboard-page">
      <div className="predicta-world-page predicta-world-page--vedic">
        <PredictaWorldFrame
          badge={copy.hero.eyebrow}
          body={copy.hero.body}
          chatHref={chatHref}
          chatLabel={copy.actions.chat}
          eyebrow={copy.hero.eyebrow}
          heroInteraction={
            <div
              className="specialist-hero-interaction vedic-chart-first"
              data-audit1-phase6-hero-interaction="vedic"
            >
              {[
                [
                  'D1',
                  language === 'hi'
                    ? getNativeCopy('audit1.phase6.vedic.d1.hi')
                    : language === 'gu'
                      ? getNativeCopy('audit1.phase6.vedic.d1.gu')
                      : 'Lagna first',
                ],
                [
                  'Moon',
                  language === 'hi'
                    ? getNativeCopy('audit1.phase6.vedic.moon.hi')
                    : language === 'gu'
                      ? getNativeCopy('audit1.phase6.vedic.moon.gu')
                      : 'Mind and lived feeling',
                ],
                [
                  'D9',
                  language === 'hi'
                    ? getNativeCopy('audit1.phase6.vedic.d9.hi')
                    : language === 'gu'
                      ? getNativeCopy('audit1.phase6.vedic.d9.gu')
                      : 'Dharma and marriage depth',
                ],
                [
                  'D10',
                  language === 'hi'
                    ? getNativeCopy('audit1.phase6.vedic.d10.hi')
                    : language === 'gu'
                      ? getNativeCopy('audit1.phase6.vedic.d10.gu')
                      : 'Career delivery',
                ],
                [
                  'Chalit',
                  language === 'hi'
                    ? getNativeCopy('audit1.phase6.vedic.chalit.hi')
                    : language === 'gu'
                      ? getNativeCopy('audit1.phase6.vedic.chalit.gu')
                      : 'House-level reality',
                ],
              ].map(([label, body]) => (
                <span key={label}>
                  <strong>{label}</strong>
                  <small>{body}</small>
                </span>
              ))}
            </div>
          }
          localActions={[
            {
              href: '/dashboard/charts',
              label: copy.actions.charts,
              note:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.7afa44a32b")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.8fe0ca1d9c")
                    : 'Open D1, Chalit, and varga charts inside the same Vedic flow.',
            },
            {
              href: '/dashboard/remedies',
              label:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a05042b6ab")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.d701b81bf4")
                    : 'Remedies',
              note:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9cc2d93136")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.4d227d1381")
                    : 'Keep remedies, Purushartha balance, and practical next steps here.',
            },
            {
              href: '/dashboard/birth-time',
              label: copy.actions.birthTime,
              note:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.8f16c0ec72")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.0cb5af4e58")
                    : 'Resolve time uncertainty before going deeper into the main chart.',
            },
            {
              href: '/dashboard/report',
              label: copy.report.cta,
              note:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.27aeb2c1ff")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.2f4f66b64a")
                    : 'Move into a polished Vedic report when the reading needs structure.',
            },
          ]}
          localEyebrow={
            language === 'hi'
              ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.632a8980f0")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.859c796ba9")
                : 'World structure'
          }
          localTitle={copy.note.title}
          pillars={[
            {
              label:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a1f243119f")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.18192a2e16")
                    : 'Chart root',
              value: 'D1 + Varga',
            },
            {
              label:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.7457c45e9e")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.82e44a590f")
                    : 'Timing',
              value:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.2b210d2200")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.16a08b64b2")
                    : 'Dasha + Gochar',
            },
            {
              label:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.0d095ae4b3")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.1410444e8b")
                    : 'Guidance',
              value:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.1b21812771")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.3cc7fb68e7")
                    : 'Remedies + balance',
            },
          ]}
          proofCards={copy.cards}
          proofLabel={
            language === 'hi'
              ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a571b7b906")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.b63b0a3dab")
                : 'Vedic proof'
          }
          reportLabel={copy.report.cta}
          reportNote={copy.report.body}
          theme="vedic"
          title={copy.hero.title}
        />

        <section className="glass-panel predicta-world-focus-panel">
          <div className="predicta-world-focus-copy">
            <p className="section-title">{copy.report.title}</p>
            <h2>{copy.report.title}</h2>
            <p>{copy.note.body}</p>
          </div>
          <div className="predicta-world-focus-grid">
            <article>
              <span>{copy.actions.create}</span>
              <strong>
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.2d2e8499b0")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.5bf245ba8a")
                    : 'Keep the root chart ready from Kundli.'}
              </strong>
            </article>
            <article>
              <span>{copy.actions.charts}</span>
              <strong>
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.2740516bfe")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.e21d98254c")
                    : 'Read every answer with chart evidence when needed.'}
              </strong>
            </article>
            <article>
              <span>{copy.actions.reports}</span>
              <strong>
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.076fe71e40")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.85ad1af2de")
                    : 'Build the report when timing, remedies, or a decision summary is needed.'}
              </strong>
            </article>
          </div>
          <div className="action-row">
            <Link className="button secondary" href="/dashboard/kundli">
              {copy.actions.create}
            </Link>
            <Link className="button secondary" href="/dashboard/charts">
              {copy.actions.charts}
            </Link>
            <Link className="button secondary" href="/dashboard/birth-time">
              {copy.actions.birthTime}
            </Link>
            <Link className="button primary" href="/dashboard/report">
              {copy.report.cta}
            </Link>
          </div>
        </section>

        <WebVedicIntelligencePanel
          hasPremiumAccess={demoAccess.hasPremiumAccess}
          kundli={activeKundli}
        />
      </div>
    </section>
  );
}
