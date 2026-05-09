'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { composeNadiJyotishPlan } from '@pridicta/astrology';
import type { KundliData } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { Card } from './Card';

type WebNadiPredictaPanelProps = {
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function WebNadiPredictaPanel({
  handoffQuestion,
  hasPremiumAccess = false,
  kundli,
  schoolCalculationStatus = 'idle',
}: WebNadiPredictaPanelProps): React.JSX.Element {
  const plan = composeNadiJyotishPlan(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    handoffQuestion,
  });
  const didLoadSavedState = useRef(false);
  const [selectedPatternId, setSelectedPatternId] = useState<string | undefined>(
    plan.patterns[0]?.id,
  );
  const selectedPattern =
    plan.patterns.find(pattern => pattern.id === selectedPatternId) ??
    plan.patterns[0];
  const selectedActivation = useMemo(
    () =>
      selectedPattern
        ? plan.activations.find(activation =>
            activation.observation.includes(selectedPattern.title) ||
            selectedPattern.planets.some(planet =>
              activation.trigger.includes(planet),
            ),
          ) ?? plan.activations[0]
        : plan.activations[0],
    [plan.activations, selectedPattern],
  );
  const askHref = buildNadiAskHref({
    activation: selectedActivation,
    handoffQuestion,
    kundliId: kundli?.id,
    pattern: selectedPattern,
    planPrompt: plan.askPrompt,
  });

  useEffect(() => {
    const savedNadi = loadWebAutoSaveMemory().nadi;

    if (savedNadi?.selectedPatternId) {
      setSelectedPatternId(savedNadi.selectedPatternId);
    }

    didLoadSavedState.current = true;
  }, []);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      nadi: {
        handoffQuestion,
        selectedPatternId,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [handoffQuestion, selectedPatternId]);

  return (
    <div className="kp-page-stack">
      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <div className="school-panel-hero">
            <div>
              <div className="section-title">NADI PREDICTA</div>
              <h1 className="gradient-text">Premium Nadi reading room.</h1>
              <p>
                Nadi Predicta is its own premium school. It reads planetary
                story links, karaka themes, validation questions, and timing
                activations. It does not pretend to access original palm-leaf
                manuscripts.
              </p>
            </div>
            <span className="school-badge premium">Premium Nadi</span>
          </div>

          <div className="school-explain-box">
            <strong>{plan.title}</strong>
            <p>{hasPremiumAccess ? plan.premiumSynthesis ?? plan.freePreview : plan.freePreview}</p>
          </div>

          <div className="school-callout">{plan.schoolBoundary}</div>
          {handoffQuestion ? (
            <div className="school-callout active">
              Question received: “{handoffQuestion}”. Nadi Predicta will keep
              this question with the active birth profile and read it only from
              Nadi-style planetary stories.
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">NADI METHOD</div>
          <h2>Separate from Parashari and KP.</h2>
          <p>{plan.methodSummary}</p>
          <div className="school-grid significators">
            {plan.guardrails.slice(0, 5).map(item => (
              <div key={item}>
                <span>Boundary</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">STORY LINKS</div>
          <h2>What the Nadi layer noticed.</h2>
          <div className="nadi-story-map">
            {plan.patterns.map((pattern, index) => (
              <button
                aria-pressed={selectedPattern?.id === pattern.id}
                className={selectedPattern?.id === pattern.id ? 'active' : ''}
                key={pattern.id}
                onClick={() => setSelectedPatternId(pattern.id)}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
                type="button"
              >
                <span>{pattern.confidence} confidence</span>
                <strong>{pattern.planets.join(' + ')}</strong>
                <small>{pattern.relation.replaceAll('-', ' ')}</small>
              </button>
            ))}
          </div>
          {!plan.patterns.length ? (
            <p>
              {getNadiCalculationMessage(Boolean(kundli), schoolCalculationStatus)}
            </p>
          ) : null}
          {selectedPattern ? (
            <div className="nadi-pattern-detail">
              <div>
                <span>Selected story</span>
                <h3>{selectedPattern.title}</h3>
                <p>{hasPremiumAccess ? selectedPattern.premiumDetail ?? selectedPattern.meaning : selectedPattern.freeInsight}</p>
              </div>
              <div className="nadi-evidence-row">
                {selectedPattern.evidence.map(item => (
                  <small key={item}>{item}</small>
                ))}
              </div>
              <div className="nadi-area-row">
                {selectedPattern.lifeAreas.map(area => (
                  <strong key={area}>{area}</strong>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">ACTIVATION WINDOWS</div>
          <h2>When the story is more likely to feel active.</h2>
          <div className="nadi-activation-list">
            {plan.activations.map((activation, index) => (
              <div
                className={
                  selectedActivation?.id === activation.id ? 'active' : ''
                }
                key={activation.id}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
              >
                <span>{activation.trigger}</span>
                <strong>{activation.title}</strong>
                <p>{hasPremiumAccess ? activation.premiumDetail ?? activation.guidance : activation.guidance}</p>
                <small>{activation.timing}</small>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <div className="section-title">VALIDATION</div>
          <h2>Predicta asks before going deep.</h2>
          <div className="nadi-validation-stack">
            {plan.validationQuestions.slice(0, 4).map((question, index) => (
              <div
                key={question}
                style={{ ['--nadi-node-index' as string]: index } as CSSProperties}
              >
                <span>Validation question</span>
                <strong>{question}</strong>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={askHref}
            >
              Ask Nadi Predicta
            </a>
            <Link className="button secondary" href="/pricing">
              See Premium Nadi
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function buildNadiAskHref({
  activation,
  handoffQuestion,
  kundliId,
  pattern,
  planPrompt,
}: {
  activation?: { title: string; trigger: string };
  handoffQuestion?: string;
  kundliId?: string;
  pattern?: {
    title: string;
    planets: string[];
    relation: string;
    observation: string;
  };
  planPrompt: string;
}): string {
  const prompt = [
    handoffQuestion
      ? `Nadi Predicta question: ${handoffQuestion}.`
      : planPrompt,
    pattern
      ? `Read this through the selected Nadi story link: ${pattern.title}, planets ${pattern.planets.join(' and ')}, relation ${pattern.relation}. Evidence: ${pattern.observation}.`
      : '',
    activation
      ? `Use activation context: ${activation.title}, trigger ${activation.trigger}.`
      : '',
    'Stay in Nadi Predicta only. Do not mix Parashari or KP. Do not claim palm-leaf manuscript access. Ask validation questions before strong event-level statements.',
  ]
    .filter(Boolean)
    .join(' ');
  return buildPredictaChatHref({
    from: 'PARASHARI',
    handoffQuestion,
    kundliId,
    prompt,
    school: 'NADI',
    selectedSection: pattern?.title ?? 'Nadi pattern reading',
    sourceScreen: 'Nadi Predicta',
  });
}

function getNadiCalculationMessage(
  hasKundli: boolean,
  status: 'idle' | 'calculating' | 'error',
): string {
  if (!hasKundli) {
    return 'Create a Kundli once, then Nadi Predicta will prepare its story links from those birth details.';
  }

  if (status === 'calculating') {
    return 'Preparing Nadi story links from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but the Nadi preparation could not complete right now. Please try again shortly.';
  }

  return 'Nadi Predicta is preparing this layer from the saved birth profile.';
}
