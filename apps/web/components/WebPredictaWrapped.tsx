'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { PredictaWrapped, PredictaWrappedCard } from '@pridicta/types';

type WebPredictaWrappedProps = {
  ctaHref?: string;
  wrapped: PredictaWrapped;
};

export function WebPredictaWrapped({
  ctaHref,
  wrapped,
}: WebPredictaWrappedProps): React.JSX.Element {
  const [selectedCardId, setSelectedCardId] = useState(
    wrapped.cards[0]?.id ?? 'pending',
  );
  const [shareState, setShareState] = useState<'idle' | 'done'>('idle');
  const selectedCard =
    wrapped.cards.find(card => card.id === selectedCardId) ?? wrapped.cards[0];

  async function shareWrapped() {
    const webNavigator = navigator as Navigator & {
      clipboard?: { writeText: (text: string) => Promise<void> };
      share?: (data: { text: string; title: string }) => Promise<void>;
    };

    try {
      if (typeof webNavigator.share === 'function') {
        await webNavigator.share({
          text: wrapped.shareText,
          title: `${wrapped.year} Predicta Wrapped`,
        });
      } else if (webNavigator.clipboard) {
        await webNavigator.clipboard.writeText(wrapped.shareText);
      }
      setShareState('done');
      window.setTimeout(() => setShareState('idle'), 1800);
    } catch {
      setShareState('idle');
    }
  }

  return (
    <section className="predicta-wrapped glass-panel">
      <div className="wrapped-header">
        <div>
          <div className="section-title">PREDICTA WRAPPED</div>
          <h2>{wrapped.title}</h2>
          <p>{wrapped.subtitle}</p>
          <p className="wrapped-intent">
            Wrapped is a share-safe yearly recap. It is not a separate
            prediction engine; it packages your active Kundli, timeline signals,
            and app activity into simple cards you can understand quickly.
          </p>
        </div>
        <div className="wrapped-year-badge">
          <span>Year</span>
          <strong>{wrapped.year}</strong>
        </div>
      </div>

      {wrapped.status === 'pending' && ctaHref ? (
        <Link className="button" href={ctaHref}>
          Create Kundli
        </Link>
      ) : null}

      {selectedCard ? (
        <WrappedFeature card={selectedCard} />
      ) : (
        <div className="wrapped-empty">
          <h3>Your yearly recap is waiting</h3>
          <p>Create a kundli to unlock a share-safe recap.</p>
        </div>
      )}

      <div className="wrapped-card-strip">
        {wrapped.cards.map(card => (
          <button
            className={`wrapped-card-tab ${card.id === selectedCard?.id ? 'active' : ''}`}
            key={card.id}
            onClick={() => setSelectedCardId(card.id)}
            type="button"
          >
            <span>{card.eyebrow}</span>
            <strong>{card.title}</strong>
          </button>
        ))}
      </div>

      <div className="wrapped-actions">
        {wrapped.status === 'ready' ? (
          <>
            <Link
              className="button"
              href={`/dashboard/chat?prompt=${encodeURIComponent(wrapped.askPrompt)}`}
            >
              Ask about Wrapped
            </Link>
            <button className="button secondary" onClick={shareWrapped} type="button">
              {shareState === 'done' ? 'Copied' : 'Share Wrapped'}
            </button>
          </>
        ) : null}
      </div>

      <div className="wrapped-privacy">
        <span>Privacy check</span>
        <p>{wrapped.privacyCheck.note}</p>
        <small>
          Birth time excluded: {wrapped.privacyCheck.excludesExactBirthTime ? 'yes' : 'no'} · Birth place excluded:{' '}
          {wrapped.privacyCheck.excludesBirthPlace ? 'yes' : 'no'}
        </small>
      </div>
    </section>
  );
}

function WrappedFeature({ card }: { card: PredictaWrappedCard }): React.JSX.Element {
  return (
    <article className={`wrapped-feature-card ${card.kind}`}>
      <span>{card.eyebrow}</span>
      <h3>{card.title}</h3>
      <strong>{card.value}</strong>
      <p>{card.body}</p>
      <div className="wrapped-guidance">
        <span>Do this</span>
        <p>{card.guidance}</p>
      </div>
      <ul>
        {card.evidence.slice(0, 3).map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}
