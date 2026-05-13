'use client';

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
        title: 'No fake Nadi claims',
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
      body: 'Guidance should stay calm, responsible, and useful before users see it.',
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
      'Self-harm और crisis language',
      'Medical, legal, financial, behavior, abuse और emergency safeguards',
      'Unsafe instructions और illegal requests',
      'डराने वाली या fatalistic predictions',
      'Hindi, Gujarati, English और mixed-language questions',
      'Regular, KP और Nadi Predicta की साफ separation',
      'चिंताजनक answer report करने का आसान तरीका',
      'Unsafe बदलाव users तक पहुंचने से पहले रोकना',
    ],
    checksSection: {
      body: 'Predicta crisis language, serious decisions, mixed languages, school confusion और calm tone वाली answers के लिए prepared है.',
      eyebrow: 'हम किसके लिए तैयार हैं',
      title: 'Predicta real-world risky questions के लिए prepared है.',
    },
    commitments: [
      {
        body: 'Predicta serious astrology questions को reflection की तरह answer करती है, qualified help या real-world judgment के replacement की तरह नहीं.',
        title: 'Guidance, replacement नहीं',
      },
      {
        body: 'अगर danger दिखता है, care पहले आती है. Astrology reflection gentle, protective और non-fatalistic रहती है.',
        title: 'Crisis पहले',
      },
      {
        body: 'Finance, medical, legal, behavior और family questions clear limits के साथ allowed हैं.',
        title: 'Serious topics safeguards के साथ allowed',
      },
      {
        body: 'Predicta harmful instructions, illegal actions, minors से जुड़ी sexual content, violent guidance और unsafe requests block करती है.',
        title: 'Unsafe requests block होती हैं',
      },
      {
        body: 'Guaranteed death, divorce, illness, bankruptcy या disaster predictions नहीं.',
        title: 'Fear-based predictions नहीं',
      },
      {
        body: 'Scary या overconfident answers को calmer guidance में soften किया जाता है.',
        title: 'Unsafe answers calm किए जाते हैं',
      },
      {
        body: 'Predicta messy language, mixed languages और difficult real-life questions के लिए prepared है.',
        title: 'Difficult questions के लिए ready',
      },
      {
        body: 'Regular Predicta, KP Predicta और Nadi Predicta अलग रखे जाते हैं ताकि हर school अपनी tradition से बोले.',
        title: 'Astrology schools अलग रहते हैं',
      },
      {
        body: 'Nadi Predicta fake claim नहीं करेगी कि उसे real ancient palm-leaf record मिला या access हुआ.',
        title: 'Fake Nadi claims नहीं',
      },
      {
        body: 'Users chat से concerning answer report कर सकते हैं.',
        title: 'Concern report कर सकते हैं',
      },
      {
        body: 'Reports full chat text और exact birth details avoid करते हैं.',
        title: 'Privacy protected रहती है',
      },
      {
        body: 'Unsafe changes users तक नहीं पहुंचने चाहिए.',
        title: 'Public sharing से पहले safety',
      },
    ],
    final:
      'Serious decisions में qualified support के साथ Predicta को spiritual timing lens की तरह use करें.',
    founderPromise:
      'Uncertain moments में Predicta useful, beautiful और respectful रहनी चाहिए. Safety non-negotiable है.',
    hero: {
      body: 'Calm guidance, chart proof और clear limits के साथ serious Jyotish questions पूछें.',
      eyebrow: 'Public safety promise',
      title: 'Predicta guide करने के लिए बनी है, डराने के लिए नहीं.',
    },
    policyCta: 'Policies पढ़ें',
    proof: {
      body: 'Users तक पहुंचने से पहले guidance calm, responsible और useful रहनी चाहिए.',
      eyebrow: 'Public promise',
      title: 'Safety पहले आती है',
    },
    standard: {
      body: 'Predicta fear, guarantees या crisis overreach के बिना guidance देती है. Goal care है, unnecessary denial नहीं.',
      eyebrow: 'हमारा standard',
      title: 'Safety product का हिस्सा है, footnote नहीं.',
    },
  },
  gu: {
    checks: [
      'Self-harm અને crisis language',
      'Medical, legal, financial, behavior, abuse અને emergency safeguards',
      'Unsafe instructions અને illegal requests',
      'ડરાવતી અથવા fatalistic predictions',
      'Hindi, Gujarati, English અને mixed-language questions',
      'Regular, KP અને Nadi Predicta વચ્ચે clear separation',
      'Concern લાગતો answer report કરવાની સરળ રીત',
      'Unsafe changes users સુધી પહોંચે તે પહેલાં રોકવું',
    ],
    checksSection: {
      body: 'Predicta crisis language, serious decisions, mixed languages, school confusion અને calmer tone જોઈએ એવા answers માટે prepared છે.',
      eyebrow: 'અમે કઈ બાબતો માટે તૈયાર છીએ',
      title: 'Predicta real-world risky questions માટે prepared છે.',
    },
    commitments: [
      {
        body: 'Predicta serious astrology questions ને reflection તરીકે answer કરે છે, qualified help અથવા real-world judgment ના replacement તરીકે નહીં.',
        title: 'Guidance, replacement નહીં',
      },
      {
        body: 'જો danger દેખાય, care પહેલાં આવે છે. Astrology reflection gentle, protective અને non-fatalistic રહે છે.',
        title: 'Crisis પહેલાં',
      },
      {
        body: 'Finance, medical, legal, behavior અને family questions clear limits સાથે allowed છે.',
        title: 'Serious topics safeguards સાથે allowed',
      },
      {
        body: 'Predicta harmful instructions, illegal actions, minors સંબંધિત sexual content, violent guidance અને unsafe requests block કરે છે.',
        title: 'Unsafe requests block થાય છે',
      },
      {
        body: 'Guaranteed death, divorce, illness, bankruptcy અથવા disaster predictions નહીં.',
        title: 'Fear-based predictions નહીં',
      },
      {
        body: 'Scary અથવા overconfident answers ને calmer guidance માં soften કરવામાં આવે છે.',
        title: 'Unsafe answers calm થાય છે',
      },
      {
        body: 'Predicta messy language, mixed languages અને difficult real-life questions માટે prepared છે.',
        title: 'Difficult questions માટે ready',
      },
      {
        body: 'Regular Predicta, KP Predicta અને Nadi Predicta અલગ રહે છે જેથી દરેક school પોતાની tradition પ્રમાણે બોલે.',
        title: 'Astrology schools અલગ રહે છે',
      },
      {
        body: 'Nadi Predicta fake claim નહીં કરે કે તેને real ancient palm-leaf record મળ્યો અથવા access થયો.',
        title: 'Fake Nadi claims નહીં',
      },
      {
        body: 'Users chat માંથી concerning answer report કરી શકે છે.',
        title: 'Concern report કરી શકાય છે',
      },
      {
        body: 'Reports full chat text અને exact birth details avoid કરે છે.',
        title: 'Privacy protected રહે છે',
      },
      {
        body: 'Unsafe changes users સુધી ન પહોંચવા જોઈએ.',
        title: 'Public sharing પહેલાં safety',
      },
    ],
    final:
      'Serious decisions માટે qualified support સાથે Predicta ને spiritual timing lens તરીકે use કરો.',
    founderPromise:
      'Uncertain moments માં Predicta useful, beautiful અને respectful રહેવી જોઈએ. Safety non-negotiable છે.',
    hero: {
      body: 'Calm guidance, chart proof અને clear limits સાથે serious Jyotish questions પૂછો.',
      eyebrow: 'Public safety promise',
      title: 'Predicta guide કરવા માટે છે, ડરાવવા માટે નહીં.',
    },
    policyCta: 'Policies વાંચો',
    proof: {
      body: 'Users સુધી પહોંચે તે પહેલાં guidance calm, responsible અને useful રહેવી જોઈએ.',
      eyebrow: 'Public promise',
      title: 'Safety પહેલાં આવે છે',
    },
    standard: {
      body: 'Predicta fear, guarantees અથવા crisis overreach વગર guidance આપે છે. Goal care છે, unnecessary denial નહીં.',
      eyebrow: 'અમારો standard',
      title: 'Safety product નો ભાગ છે, footnote નહીં.',
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
