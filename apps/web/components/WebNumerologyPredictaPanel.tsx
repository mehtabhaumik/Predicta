'use client';

import Link from 'next/link';
import { composeNumerologyFoundationModel } from '@pridicta/astrology';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

const NUMEROLOGY_WORLD_PROOF_CARDS = [
  {
    body:
      'The room starts from the saved name, birth date, and current date before offering guidance.',
    title: 'Calculated numbers',
  },
  {
    body:
      'Name number, birth number, destiny number, and personal timing are kept visible and explainable.',
    title: 'Proof-first reading',
  },
  {
    body:
      'If the user asks for Vedic, KP, Nadi, or Signature analysis, the room should hand off instead of mixing methods.',
    title: 'Clean boundaries',
  },
] as const;

export function WebNumerologyPredictaPanel(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const profile = composeNumerologyFoundationModel(activeKundli?.birthDetails);
  const hasProfile = profile.status === 'ready';
  const chatHref = buildPredictaChatHref({
    from: 'PARASHARI',
    handoffQuestion:
      'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
    kundli: activeKundli,
    kundliId: activeKundli?.id,
    prompt:
      'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
    school: 'NUMEROLOGY',
    sourceScreen: 'Numerology Predicta',
  });

  return (
    <div className="kp-page-stack">
      <section className="glass-panel school-panel-hero">
        <div>
          <p className="section-title">NUMEROLOGY PREDICTA</p>
          <h1>A separate number-reading room.</h1>
          <p>
            Numerology Predicta reads name rhythm, birth number, destiny number,
            and current personal cycles. It stays separate from Vedic, KP, Nadi,
            and Signature unless you ask for a careful synthesis.
          </p>
        </div>
        <div className="world-hero-actions">
          <span className="school-badge premium">Numerology world</span>
          <Link className="button primary" href={chatHref}>
            Chat with Numerology Predicta
          </Link>
          <Link className="button secondary" href="/dashboard/report">
            Build Numerology report
          </Link>
        </div>
      </section>

      <section className="school-grid">
        {NUMEROLOGY_WORLD_PROOF_CARDS.map(card => (
          <article className="glass-panel" key={card.title}>
            <span>Proof</span>
            <strong>{card.title}</strong>
            <p>{card.body}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel">
        <div className="section-heading-row">
          <div>
            <p className="section-title">CURRENT PROFILE</p>
            <h2>{hasProfile ? profile.name : 'Create a Kundli first'}</h2>
          </div>
          <Link className="button primary" href={chatHref}>
            Chat with Numerology Predicta
          </Link>
        </div>
        <p>
          {hasProfile
            ? profile.summary
            : 'Numerology needs a saved name and birth date. Create or select a Kundli, then this room can read the number profile instantly.'}
        </p>
      </section>

      <section className="school-grid">
        {[
          {
            label: 'Name number',
            value: hasProfile ? String(profile.nameNumber.root) : 'Pending',
            detail: hasProfile
              ? profile.nameNumber.simpleMeaning
              : 'Uses the saved name spelling.',
          },
          {
            label: 'Birth number',
            value: hasProfile ? String(profile.birthNumber.root) : 'Pending',
            detail: hasProfile
              ? profile.birthNumber.simpleMeaning
              : 'Uses the birth day.',
          },
          {
            label: 'Destiny number',
            value: hasProfile ? String(profile.destinyNumber.root) : 'Pending',
            detail: hasProfile
              ? profile.destinyNumber.simpleMeaning
              : 'Uses the full birth date.',
          },
          {
            label: 'Personal timing',
            value: hasProfile ? `Year ${profile.personalYear.root}` : 'Pending',
            detail: hasProfile
              ? profile.guidance
              : 'Uses the current year, month, and day.',
          },
        ].map(item => (
          <article className="glass-panel" key={item.label}>
            <p className="section-title">{item.label}</p>
            <h3>{item.value}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel">
        <p className="section-title">ROOM BOUNDARY</p>
        <h2>Numerology answers with number logic first.</h2>
        <p>
          If the question needs Parashari, KP, Nadi, or Signature analysis,
          Predicta should hand you to the right room with your question intact.
        </p>
        <div className="action-row">
          <Link className="button secondary" href="/dashboard/report">
            Build Numerology report
          </Link>
          <Link className="button secondary" href="/dashboard/kundli">
            Select Kundli
          </Link>
        </div>
      </section>
    </div>
  );
}
