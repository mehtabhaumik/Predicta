'use client';

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
      dashboard: 'Predicta खोलें',
      safety: 'Safety Promise पढ़ें',
      start: 'Predicta से शुरू करें',
    },
    final:
      'Predicta उन लोगों के लिए है जो spiritual guidance को useful, safe, premium और respectful महसूस करना चाहते हैं.',
    hero: {
      body: 'मैंने Predicta इसलिए बनाया कि Vedic astrology precise, private, calm और useful लगे.',
      eyebrow: 'Founder vision',
      title: 'Predicta उन लोगों के लिए बन रहा है जो noise के बिना clarity चाहते हैं.',
    },
    letter: {
      body: [
        'Deep chart wisdom confusing, intimidating या cheaply packaged नहीं लगनी चाहिए. Kundli personal context रखती है और thoughtful experience deserve करती है.',
        'Goal tradition को calmer voice, clear structure और confident chart exploration के साथ honor करना है.',
        'Predicta chart-backed, safety-aware, mobile-first और हर answer में careful है.',
      ],
      eyebrow: 'Predicta क्यों exists करता है',
      title:
        'Astrology भरोसे लायक grounded और use करने में simple लगनी चाहिए.',
    },
    portrait:
      'Predicta intelligent, polished, private और human feel होनी चाहिए. यही standard हर जगह लागू है.',
    principles: [
      {
        copy: 'Birth details, saved Kundlis और personal guidance को restraint, clarity और respect के साथ handle करना चाहिए.',
        title: 'Privacy by temperament',
      },
      {
        copy: 'Predicta chart patterns calmly explain करे. Fear, certainty या dependency sell न करे.',
        title: 'Guidance without pressure',
      },
      {
        copy: 'Regular Predicta, KP Predicta और Nadi Predicta method, purpose और safety boundaries में clear रहें.',
        title: 'Clear astrology schools',
      },
      {
        copy: 'Product नए user के लिए easy रहे, और serious Jyotish depth background में बनी रहे.',
        title: 'Depth without confusion',
      },
    ],
    principlesHeader: {
      eyebrow: 'Product principles',
      title: 'एक deeply personal subject के लिए calm technology.',
    },
    vision: {
      eyebrow: 'The vision',
      points: [
        'Vedic tradition को respect करते हुए modern engineering से उसे समझना आसान बनाना.',
        'Noisy astrology apps का calmer alternative बनाना, premium design और clear user control के साथ.',
        'Predicta ज्यादा लोगों तक पहुंचे उससे पहले public safety visible और protected रखना.',
        'Mobile और web पर same personal, careful product signature खोए बिना grow करना.',
      ],
      title: 'Mobile और web पर trusted astrology companion.',
    },
  },
  gu: {
    actions: {
      dashboard: 'Predicta ખોલો',
      safety: 'Safety Promise વાંચો',
      start: 'Predicta થી શરૂ કરો',
    },
    final:
      'Predicta એવા લોકો માટે છે જેમને spiritual guidance useful, safe, premium અને respectful લાગવી જોઈએ.',
    hero: {
      body: 'મેં Predicta એ માટે બનાવ્યું કે Vedic astrology precise, private, calm અને useful લાગે.',
      eyebrow: 'Founder vision',
      title: 'Predicta એવા લોકો માટે બની રહ્યું છે જેમને noise વગર clarity જોઈએ છે.',
    },
    letter: {
      body: [
        'Deep chart wisdom confusing, intimidating અથવા cheaply packaged ન લાગવી જોઈએ. Kundli personal context ધરાવે છે અને thoughtful experience deserve કરે છે.',
        'Goal tradition ને calmer voice, clear structure અને confident chart exploration સાથે honor કરવાનો છે.',
        'Predicta chart-backed, safety-aware, mobile-first અને દરેક answer માં careful છે.',
      ],
      eyebrow: 'Predicta કેમ exists કરે છે',
      title:
        'Astrology trust કરવા જેવી grounded અને use કરવા simple લાગવી જોઈએ.',
    },
    portrait:
      'Predicta intelligent, polished, private અને human feel થવી જોઈએ. આ standard દરેક જગ્યાએ લાગુ પડે છે.',
    principles: [
      {
        copy: 'Birth details, saved Kundlis અને personal guidance ને restraint, clarity અને respect સાથે handle કરવી જોઈએ.',
        title: 'Privacy by temperament',
      },
      {
        copy: 'Predicta chart patterns calmly explain કરે. Fear, certainty અથવા dependency sell ન કરે.',
        title: 'Guidance without pressure',
      },
      {
        copy: 'Regular Predicta, KP Predicta અને Nadi Predicta method, purpose અને safety boundaries માં clear રહે.',
        title: 'Clear astrology schools',
      },
      {
        copy: 'Product નવા user માટે easy રહે, અને serious Jyotish depth background માં રહે.',
        title: 'Depth without confusion',
      },
    ],
    principlesHeader: {
      eyebrow: 'Product principles',
      title: 'Deeply personal subject માટે calm technology.',
    },
    vision: {
      eyebrow: 'The vision',
      points: [
        'Vedic tradition ને respect કરીને modern engineering થી સમજવું સરળ બનાવવું.',
        'Noisy astrology apps નો calmer alternative બનાવવો, premium design અને clear user control સાથે.',
        'Predicta વધારે લોકો સુધી પહોંચે તે પહેલાં public safety visible અને protected રાખવી.',
        'Mobile અને web પર same personal, careful product signature ગુમાવ્યા વગર grow કરવું.',
      ],
      title: 'Mobile અને web પર trusted astrology companion.',
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
