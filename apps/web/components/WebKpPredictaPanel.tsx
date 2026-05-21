'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { composeChalitBhavKpFoundation } from '@pridicta/astrology';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type { KundliData } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import {
  loadWebAutoSaveMemory,
  saveWebAutoSaveMemory,
} from '../lib/web-auto-save-memory';
import { Card } from './Card';
import { PredictaWorldFrame } from './PredictaWorldFrame';

type KpEventFocus = 'career' | 'money' | 'marriage' | 'property';

const KP_EVENT_FOCUS: Array<{
  id: KpEventFocus;
  title: string;
  houses: number[];
  prompt: string;
}> = [
  {
    houses: [2, 6, 10, 11],
    id: 'career',
    prompt:
      'Using KP only, judge career and job movement from houses 2, 6, 10, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Career and job',
  },
  {
    houses: [2, 5, 8, 11],
    id: 'money',
    prompt:
      'Using KP only, judge money gains and financial stability from houses 2, 5, 8, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Money and gains',
  },
  {
    houses: [2, 7, 11],
    id: 'marriage',
    prompt:
      'Using KP only, judge marriage and partnership promise from houses 2, 7, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Marriage and partner',
  },
  {
    houses: [4, 11, 12],
    id: 'property',
    prompt:
      'Using KP only, judge home, property, and relocation from houses 4, 11, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Home and property',
  },
];

const KP_WORLD_PROOF_CARDS = [
  {
    body:
      'KP starts with the event question and relevant houses before judging promise or timing.',
    title: 'Event-first judgement',
  },
  {
    body:
      'Cusps, star lords, sub lords, ruling planets, significators, and dasha support stay inside KP.',
    title: 'KP proof path',
  },
  {
    body:
      'Career, money, marriage, and property questions get their own KP house logic.',
    title: 'Focused outcomes',
  },
] as const;

type WebKpPredictaPanelProps = {
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function WebKpPredictaPanel({
  handoffQuestion,
  hasPremiumAccess = false,
  kundli,
  schoolCalculationStatus = 'idle',
}: WebKpPredictaPanelProps): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const foundation = composeChalitBhavKpFoundation(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;
  const didLoadSavedState = useRef(false);
  const [selectedEvent, setSelectedEvent] = useState<KpEventFocus>('career');
  const selectedFocus =
    KP_EVENT_FOCUS.find(item => item.id === selectedEvent) ?? KP_EVENT_FOCUS[0];
  const [selectedCusp, setSelectedCusp] = useState<number>(
    selectedFocus.houses.at(-2) ?? selectedFocus.houses[0],
  );
  const selectedCuspData = kp.cusps.find(cusp => cusp.house === selectedCusp);
  const eventSignificators = useMemo(
    () =>
      kp.significators
        .filter(item =>
          item.signifiesHouses.some(house => selectedFocus.houses.includes(house)),
        )
        .slice(0, hasPremiumAccess ? 6 : 4),
    [hasPremiumAccess, kp.significators, selectedFocus.houses],
  );
  const askHref = buildKpAskHref({
    cusp: selectedCuspData,
    focus: selectedFocus,
    handoffQuestion,
    kundliId: kundli?.id,
  });

  useEffect(() => {
    const savedKp = loadWebAutoSaveMemory().kp;

    if (isKpEventFocus(savedKp?.selectedEvent)) {
      setSelectedEvent(savedKp.selectedEvent);
    }
    if (savedKp?.selectedCusp) {
      setSelectedCusp(savedKp.selectedCusp);
    }

    didLoadSavedState.current = true;
  }, []);

  useEffect(() => {
    if (!didLoadSavedState.current) {
      return;
    }

    saveWebAutoSaveMemory({
      kp: {
        handoffQuestion,
        selectedCusp,
        selectedEvent,
        updatedAt: new Date().toISOString(),
      },
    });
  }, [handoffQuestion, selectedCusp, selectedEvent]);

  return (
    <div className="predicta-world-page predicta-world-page--kp kp-page-stack">
      <PredictaWorldFrame
        badge={t('KP world')}
        body={t(
          'KP Predicta stays inside Krishnamurti Paddhati: cusps, star lords, sub lords, significators, ruling planets, dasha support, and event-focused judgement. It does not casually mix with Parashari charts.',
        )}
        chatHref={askHref}
        chatLabel={t('Chat with KP Predicta')}
        eyebrow={t('KP PREDICTA')}
        localActions={[
          {
            href: '#kp-judgement',
            label:
              language === 'hi'
                ? 'निर्णय पथ'
                : language === 'gu'
                  ? 'નિર્ણય માર્ગ'
                  : 'Judgement path',
            note:
              language === 'hi'
                ? 'घटना, भाव, कस्प सब लॉर्ड और समय समर्थन से शुरुआत करें.'
                : language === 'gu'
                  ? 'ઘટના, ભાવ, કસ્પ સબ લોર્ડ અને સમય આધારથી શરૂઆત કરો.'
                  : 'Start from the event, houses, cusp sub lord, and timing support.',
          },
          {
            href: '#kp-cusps',
            label:
              language === 'hi'
                ? '12 कस्प'
                : language === 'gu'
                  ? '12 કસ્પ'
                  : '12 cusps',
            note:
              language === 'hi'
                ? 'पूरा निर्णय तालिका में स्टार और सब लॉर्ड के साथ देखें.'
                : language === 'gu'
                  ? 'સ્ટાર અને સબ લોર્ડ સાથે આખો નિર્ણય કોષ્ટકમાં જુઓ.'
                  : 'Inspect the full cusp table with star and sub lords.',
          },
          {
            href: '#kp-significators',
            label:
              language === 'hi'
                ? 'सिग्निफिकेटर'
                : language === 'gu'
                  ? 'સિગ્નિફિકેટર'
                  : 'Significators',
            note:
              language === 'hi'
                ? 'कौन से ग्रह घटना उठाते हैं, यह तुरंत साफ करें.'
                : language === 'gu'
                  ? 'કયા ગ્રહો ઘટના ઉઠાવે છે, તે તરત સ્પષ્ટ કરો.'
                  : 'See which planets actually carry the event promise.',
          },
          {
            href: '/dashboard/report',
            label: t('Build KP report'),
            note:
              language === 'hi'
                ? 'जब घटना को लिखित निर्णय में बदलना हो, रिपोर्ट पथ लें.'
                : language === 'gu'
                  ? 'જ્યારે ઘટનાને લખિત નિર્ણયમાં ફેરવવો હોય, ત્યારે રિપોર્ટ માર્ગ લો.'
                  : 'Move into the KP report path when the judgement needs a formal write-up.',
          },
        ]}
        localEyebrow={t('KP method')}
        localTitle={t('A dedicated KP precision world.')}
        pillars={[
          {
            label:
              language === 'hi'
                ? 'प्रारंभ'
                : language === 'gu'
                  ? 'શરૂઆત'
                  : 'Start',
            value:
              language === 'hi'
                ? 'घटना पहले'
                : language === 'gu'
                  ? 'પહેલા ઘટના'
                  : 'Event first',
          },
          {
            label:
              language === 'hi'
                ? 'मुख्य प्रमाण'
                : language === 'gu'
                  ? 'મુખ્ય પુરાવો'
                  : 'Core proof',
            value:
              language === 'hi'
                ? 'कस्प + सब लॉर्ड'
                : language === 'gu'
                  ? 'કસ્પ + સબ લોર્ડ'
                  : 'Cusps + sub lords',
          },
          {
            label:
              language === 'hi'
                ? 'समय'
                : language === 'gu'
                  ? 'સમય'
                  : 'Timing',
            value:
              language === 'hi'
                ? 'रूलिंग ग्रह + दशा'
                : language === 'gu'
                  ? 'રૂલિંગ ગ્રહો + દશા'
                  : 'Ruling planets + dasha',
          },
        ]}
        proofCards={KP_WORLD_PROOF_CARDS.map(card => ({
          body: t(card.body),
          title: t(card.title),
        }))}
        proofLabel={t('Proof')}
        reportLabel={t('Build KP report')}
        reportNote={t('Career, money, marriage, and property questions get their own KP house logic.')}
        theme="kp"
        title={t('A dedicated KP precision world.')}
      />

      <Card className="glass-panel kp-school-panel">
        <div className="card-content spacious">
          <details className="info-drawer school-explain-box">
            <summary>
              <span>{t('Current KP reading')}</span>
              <strong>{kp.title}</strong>
            </summary>
            <strong>{kp.title}</strong>
            <p>{hasPremiumAccess ? kp.premiumSynthesis ?? kp.freeInsight : kp.freeInsight}</p>
          </details>

          {ruling ? (
            <div className="school-grid ruling">
              <div>
                <span>{t('Day Lord')}</span>
                <strong>{ruling.dayLord}</strong>
              </div>
              <div>
                <span>{t('Moon Star')}</span>
                <strong>{ruling.moonStarLord}</strong>
              </div>
              <div>
                <span>{t('Moon Sub')}</span>
                <strong>{ruling.moonSubLord}</strong>
              </div>
              <div>
                <span>{t('Lagna Sub')}</span>
                <strong>{ruling.lagnaSubLord}</strong>
              </div>
            </div>
          ) : null}

          <details className="info-drawer school-callout">
            <summary>
              <span>{t('World boundary')}</span>
              <strong>{t('Open')}</strong>
            </summary>
            <p>
              {t(
                'Regular Predicta handles Parashari, D1, vargas, Chalit, dasha, gochar, remedies, and reports. KP Predicta handles KP. Nadi Predicta handles premium Nadi-style planetary story reading separately.',
              )}
            </p>
          </details>
          {handoffQuestion ? (
            <div className="school-callout active">
              {t('Question received')}: “{handoffQuestion}”.{' '}
              {t('KP Predicta will carry this question with the active birth profile and answer from KP.')}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel kp-judgement-card" id="kp-judgement">
        <div className="card-content spacious">
          <div className="school-panel-hero compact">
            <div>
              <div className="section-title">{t('KP JUDGEMENT PATH')}</div>
              <h2>{t(selectedFocus.title)}</h2>
              <details className="info-drawer">
                <summary>
                  <span>{t('How KP judges this')}</span>
                  <strong>{t('Open')}</strong>
                </summary>
                <p>
                  {t(
                    'Pick the event first. KP then checks the relevant houses, cusp sub lord, significators, ruling planets, and dasha support.',
                  )}
                </p>
              </details>
            </div>
            <span className="school-badge premium">{t('Event first')}</span>
          </div>

          <div className="kp-event-row" aria-label="KP event focus">
            {KP_EVENT_FOCUS.map(item => (
              <button
                aria-pressed={selectedEvent === item.id}
                className={selectedEvent === item.id ? 'active' : ''}
                key={item.id}
                onClick={() => {
                  setSelectedEvent(item.id);
                  setSelectedCusp(item.houses.at(-2) ?? item.houses[0]);
                }}
                type="button"
              >
                <span>{t(item.title)}</span>
                <small>{t('Houses')} {item.houses.join(', ')}</small>
              </button>
            ))}
          </div>

          <div className="kp-proof-path">
            <div>
              <span>1. {t('Houses')}</span>
              <strong>{selectedFocus.houses.join(' / ')}</strong>
              <p>{t('These houses define the KP promise for this event.')}</p>
            </div>
            <div>
              <span>2. {t('Cusp sub lord')}</span>
              <strong>
                {selectedCuspData
                  ? `${selectedCuspData.house}: ${selectedCuspData.lordChain.subLord}`
                  : t('Pending')}
              </strong>
              <p>
                {t('The selected cusp becomes the main judgement point before timing.')}
              </p>
            </div>
            <div>
              <span>3. {t('Significators')}</span>
              <strong>{eventSignificators.length || t('Pending')}</strong>
              <p>{t('Planets connecting to these houses become event carriers.')}</p>
            </div>
            <div>
              <span>4. {t('Timing')}</span>
              <strong>{t('Ruling planets + dasha')}</strong>
              <p>{t('Premium depth checks period support and event windows.')}</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="glass-panel" id="kp-cusps">
        <div className="card-content spacious">
          <div className="section-title">{t('KP CUSPS')}</div>
          <h2>{t('12 cusps with star and sub lords.')}</h2>
          <div className="school-table-wrap">
            <table className="school-table">
              <thead>
                <tr>
                  <th>{t('Cusp')}</th>
                  <th>{t('Sign')}</th>
                  <th>{t('Star Lord')}</th>
                  <th>{t('Sub Lord')}</th>
                  <th>{t('Sub-sub')}</th>
                </tr>
              </thead>
              <tbody>
                {kp.cusps.slice(0, 12).map((cusp, index) => (
                  <tr
                    className={
                      selectedCusp === cusp.house ||
                      selectedFocus.houses.includes(cusp.house)
                        ? 'kp-relevant-row'
                        : ''
                    }
                    key={cusp.house}
                    onClick={() => setSelectedCusp(cusp.house)}
                    style={{ ['--kp-row-index' as string]: index } as CSSProperties}
                  >
                    <td>{cusp.house}</td>
                    <td>
                      {cusp.sign} {cusp.degree.toFixed(2)}°
                    </td>
                    <td>{cusp.lordChain.starLord}</td>
                    <td>{cusp.lordChain.subLord}</td>
                    <td>{cusp.lordChain.subSubLord}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!kp.cusps.length ? (
            <p>{t(getKpCalculationMessage(Boolean(kundli), schoolCalculationStatus))}</p>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel" id="kp-significators">
        <div className="card-content spacious">
          <div className="section-title">{t('KP SIGNIFICATORS')}</div>
          <h2>{t('Event houses by planet.')}</h2>
          <div className="kp-significator-map">
            {eventSignificators.map((item, index) => (
              <div
                className="kp-significator-node"
                key={item.planet}
                style={{ ['--kp-row-index' as string]: index } as CSSProperties}
              >
                <span>{item.strength}</span>
                <strong>{item.planet}</strong>
                <p>{item.simpleMeaning}</p>
                <div>
                  {item.signifiesHouses
                    .filter(house => selectedFocus.houses.includes(house))
                    .map(house => (
                      <small key={`${item.planet}-${house}`}>H{house}</small>
                    ))}
                </div>
              </div>
            ))}
          </div>
          <div className="school-grid significators">
            {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
              <div key={item.planet}>
                <span>{item.strength} significator</span>
                <strong>{item.planet}</strong>
                <p>
                  {t('Houses')}: {item.signifiesHouses.join(', ') || t('Not clear yet')}
                </p>
              </div>
            ))}
          </div>
          <div className="action-row">
            <a
              className="button"
              href={askHref}
            >
              {t('Ask KP Predicta')}
            </a>
            <Link className="button secondary" href="/pricing">
              {t('See KP Premium Depth')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

function isKpEventFocus(value: unknown): value is KpEventFocus {
  return KP_EVENT_FOCUS.some(item => item.id === value);
}

function buildKpAskHref({
  cusp,
  focus,
  handoffQuestion,
  kundliId,
}: {
  cusp?: { house: number; lordChain: { starLord: string; subLord: string; subSubLord: string } };
  focus: (typeof KP_EVENT_FOCUS)[number];
  handoffQuestion?: string;
  kundliId?: string;
}): string {
  const prompt = handoffQuestion
    ? `KP Predicta handoff question: ${handoffQuestion}. ${focus.prompt}`
    : `${focus.prompt}${cusp ? ` Selected cusp ${cusp.house} has star lord ${cusp.lordChain.starLord}, sub lord ${cusp.lordChain.subLord}, and sub-sub lord ${cusp.lordChain.subSubLord}.` : ''}`;
  return buildPredictaChatHref({
    handoffQuestion,
    kundliId,
    prompt,
    school: 'KP',
    selectedHouse: cusp?.house,
    selectedSection: focus.title,
    sourceScreen: 'KP Predicta',
  });
}

function getKpCalculationMessage(
  hasKundli: boolean,
  status: 'idle' | 'calculating' | 'error',
): string {
  if (!hasKundli) {
    return 'Create a Kundli once, then KP Predicta will calculate the KP horoscope from those birth details.';
  }

  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
}
