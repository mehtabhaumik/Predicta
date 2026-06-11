'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { WebEvidenceRoomEntry } from '../../../components/WebEvidenceRoomEntry';
import { WebVedicIntelligencePanelLoader } from '../../../components/WebVedicIntelligencePanelLoader';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';
import { useLanguagePreference } from '../../../lib/language-preference';
import { useLightweightKundliSnapshot } from '../../../lib/use-lightweight-kundli-snapshot';
import { getNativeCopy } from '../../../../../packages/config/src/nativeCopy';

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
        body: 'D1, Moon, D9, D10, Chalit, varga charts, dasha, gochar, and house proof stay available under the answer.',
        title: 'Evidence under the answer',
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
        'Start here when you want the main Kundli answer: what the chart is asking from you now, what supports you, what needs maturity, and what to do next.',
      eyebrow: 'VEDIC WORLD',
      title: 'Your main Vedic Predicta space.',
    },
    note: {
      body:
        'KP, Jaimini, Numerology, and Signature now have their own worlds. Vedic Predicta stays focused on the core Jyotish reading.',
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
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.19648f7ce7"),
      eyebrow: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.4433fb4239"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.861a634c9e"),
    },
    note: {
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9fea2d66c9"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.dc31b7a777"),
    },
    report: {
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.73516f089d"),
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
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.49e6c07c4c"),
      eyebrow: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.eee556bafa"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9daf86316e"),
    },
    note: {
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.c8fff2bb92"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.16901fb4aa"),
    },
    report: {
      body: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.bf62cc104e"),
      cta: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.224efad342"),
      title: getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.bfeb531ede"),
    },
  },
};

export default function VedicPredictaPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli } = useLightweightKundliSnapshot();
  const copy = VEDIC_WORLD_COPY[language] ?? VEDIC_WORLD_COPY.en;
  const chatHref = buildPredictaChatHref({
    kundliId: activeKundli?.id,
    prompt:
      'Read my Vedic chart using D1, varga support, dasha, gochar, remedies, and current life timing.',
    school: 'PARASHARI',
    sourceScreen: 'Vedic Predicta',
  });
  const focusCharts = [
    ['D1', getFocusChartCopy(language, 'd1')],
    [getMoonLabel(language), getFocusChartCopy(language, 'moon')],
    ['D9', getFocusChartCopy(language, 'd9')],
    ['D10', getFocusChartCopy(language, 'd10')],
    ['Chalit', getFocusChartCopy(language, 'chalit')],
  ];

  return (
    <section className="dashboard-page">
      <WebEvidenceRoomEntry askHref={chatHref} room="vedic" />
      <div className="predicta-world-page predicta-world-page--vedic">
        <section className="predicta-world-frame predicta-world--vedic">
          <div className="predicta-world-hero glass-panel">
            <div className="predicta-world-hero-copy">
              <p className="section-title">{copy.hero.eyebrow}</p>
              <h1 className="gradient-text">{copy.hero.title}</h1>
              <p>{copy.hero.body}</p>
              <div
                className="predicta-world-primary-guidance"
                data-competitor-response-phase4-primary-guidance="vedic"
              >
                <span>START HERE</span>
                <strong>
                  {activeKundli
                    ? 'Read the answer first; open chart proof only when you want it.'
                    : 'Your Vedic prediction appears after a Kundli is active.'}
                </strong>
                <p>
                  {activeKundli
                    ? 'The useful reading appears here; the PDF remains the full dossier.'
                    : 'Create or select a Kundli first. Predicta will lead with the real reading instead of making you study tables.'}
                </p>
              </div>
              <div className="predicta-world-actions">
                <Link className="button primary" href={chatHref}>
                  {copy.actions.chat}
                </Link>
                <Link className="button secondary" href="/dashboard/report">
                  {copy.report.cta}
                </Link>
              </div>
            </div>
            <div
              className="specialist-hero-interaction vedic-chart-first"
              data-audit1-phase6-hero-interaction="vedic"
            >
              {focusCharts.map(([label, body]) => (
                <span key={label}>
                  <strong>{label}</strong>
                  <small>{body}</small>
                </span>
              ))}
            </div>
          </div>

          <div className="predicta-world-local glass-panel">
            <div className="predicta-world-local-copy">
              <p className="section-title">{getWorldStructureLabel(language)}</p>
              <h2>{copy.note.title}</h2>
              <p>{copy.note.body}</p>
            </div>
            <div className="predicta-world-local-actions">
              <Link href="/dashboard/charts">
                <strong>{copy.actions.charts}</strong>
                <span>{getLocalActionNote(language, 'charts')}</span>
              </Link>
              <Link href="/dashboard/remedies">
                <strong>{getRemediesLabel(language)}</strong>
                <span>{getLocalActionNote(language, 'remedies')}</span>
              </Link>
              <Link href="/dashboard/birth-time">
                <strong>{copy.actions.birthTime}</strong>
                <span>{getLocalActionNote(language, 'birthTime')}</span>
              </Link>
              <Link href="/dashboard/report">
                <strong>{copy.report.cta}</strong>
                <span>{copy.report.body}</span>
              </Link>
            </div>
          </div>

          <section className="glass-panel predicta-world-focus-panel">
            <div className="predicta-world-focus-copy">
              <p className="section-title">{copy.report.title}</p>
              <h2>{copy.report.title}</h2>
              <p>{copy.note.body}</p>
            </div>
            <div className="predicta-world-focus-grid">
              {copy.cards.map(card => (
                <article key={card.title}>
                  <span>{card.title}</span>
                  <strong>{card.body}</strong>
                </article>
              ))}
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
        </section>

        <WebVedicIntelligencePanelLoader />
      </div>
    </section>
  );
}

function getWorldStructureLabel(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.632a8980f0");
  }

  if (language === 'gu') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.859c796ba9");
  }

  return 'World structure';
}

function getRemediesLabel(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.a05042b6ab");
  }

  if (language === 'gu') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.d701b81bf4");
  }

  return 'Remedies';
}

function getLocalActionNote(
  language: SupportedLanguage,
  action: 'birthTime' | 'charts' | 'remedies',
): string {
  if (action === 'charts') {
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.7afa44a32b");
    }

    if (language === 'gu') {
      return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.8fe0ca1d9c");
    }

    return 'D1, Moon, D9, D10, Chalit, and varga charts';
  }

  if (action === 'remedies') {
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.9cc2d93136");
    }

    if (language === 'gu') {
      return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.4d227d1381");
    }

    return 'Practical balance and dharma-based next steps';
  }

  if (language === 'hi') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.8f16c0ec72");
  }

  if (language === 'gu') {
    return getNativeCopy("native.apps.web.app.dashboard.vedic.page.tsx.0cb5af4e58");
  }

  return 'Resolve time uncertainty before deeper timing';
}

function getMoonLabel(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy('audit1.phase6.vedic.moon.label.hi');
  }

  if (language === 'gu') {
    return getNativeCopy('audit1.phase6.vedic.moon.label.gu');
  }

  return 'Moon';
}

function getFocusChartCopy(
  language: SupportedLanguage,
  chart: 'chalit' | 'd1' | 'd10' | 'd9' | 'moon',
): string {
  if (language === 'hi') {
    return getNativeCopy(`audit1.phase6.vedic.${chart}.hi`);
  }

  if (language === 'gu') {
    return getNativeCopy(`audit1.phase6.vedic.${chart}.gu`);
  }

  const en: Record<typeof chart, string> = {
    chalit: 'House-level reality',
    d1: 'Lagna first',
    d10: 'Career delivery',
    d9: 'Dharma and marriage depth',
    moon: 'Mind and lived feeling',
  };

  return en[chart];
}
