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
  const focusMeaning = useMemo(
    () =>
      buildKpFocusMeaning({
        cusp: selectedCuspData,
        focus: selectedFocus,
        language,
        ruling,
        significators: eventSignificators,
      }),
    [eventSignificators, language, ruling, selectedCuspData, selectedFocus],
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

          <div className="school-grid significators" aria-label="KP event verdict compass">
            <div>
              <span>{t('EVENT VERDICT COMPASS')}</span>
              <strong>{t(kp.eventJudgement.verdictLabel)}</strong>
              <p>{kp.eventJudgement.plainLanguage}</p>
            </div>
            <div>
              <span>{t('Timing readiness')}</span>
              <strong>{t(kp.eventJudgement.confidence)}</strong>
              <p>{kp.eventJudgement.timingReadiness}</p>
            </div>
            <div>
              <span>{t('Decision point')}</span>
              <strong>{t('Cusp sub lord')}</strong>
              <p>{kp.eventJudgement.decisionPoint}</p>
            </div>
          </div>
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

          <div className="school-explain-box">
            <strong>
              {localizeKp(
                language,
                'What this KP setup is saying',
                'यह KP सेटअप क्या कह रहा है',
                'આ KP સેટઅપ શું કહી રહ્યું છે',
              )}
            </strong>
            <p>{focusMeaning.whatItSays}</p>
          </div>

          <div className="school-grid significators">
            <div>
              <span>
                {localizeKp(
                  language,
                  'Main event carrier',
                  'मुख्य घटना वाहक',
                  'મુખ્ય ઘટના વાહક',
                )}
              </span>
              <strong>{focusMeaning.mainCarrier}</strong>
              <p>{focusMeaning.strength}</p>
            </div>
            <div>
              <span>
                {localizeKp(
                  language,
                  'Main caution',
                  'मुख्य सावधानी',
                  'મુખ્ય સાવધાની',
                )}
              </span>
              <strong>{focusMeaning.cautionTitle}</strong>
              <p>{focusMeaning.caution}</p>
            </div>
            <div>
              <span>
                {localizeKp(
                  language,
                  'Next guidance',
                  'अगला मार्गदर्शन',
                  'આગળનું માર્ગદર્શન',
                )}
              </span>
              <strong>{focusMeaning.guidanceTitle}</strong>
              <p>{focusMeaning.guidance}</p>
            </div>
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
            {kp.eventJudgement.proofPath.map((step, index) => (
              <div key={step}>
                <span>{index + 1}. {t('Proof step')}</span>
                <strong>{index === 0 ? t('Question') : index === 1 ? t('Cusp') : index === 2 ? t('Carriers') : t('Timing')}</strong>
                <p>{step}</p>
              </div>
            ))}
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

function buildKpFocusMeaning({
  cusp,
  focus,
  language,
  ruling,
  significators,
}: {
  cusp?: {
    house: number;
    lordChain: { starLord: string; subLord: string; subSubLord: string };
  };
  focus: (typeof KP_EVENT_FOCUS)[number];
  language: string;
  ruling?: { dayLord: string; moonSubLord: string };
  significators: Array<{ planet: string; simpleMeaning: string; signifiesHouses: number[] }>;
}): {
  caution: string;
  cautionTitle: string;
  guidance: string;
  guidanceTitle: string;
  mainCarrier: string;
  strength: string;
  whatItSays: string;
} {
  const areas = focus.houses.map(house => getKpHouseArea(house, language)).join(', ');
  const carrier = significators[0];
  const carrierName = carrier?.planet ?? localizeKp(language, 'Pending', 'प्रतीक्षारत', 'બાકી');
  const cuspSummary = cusp
    ? localizeKp(
        language,
        `Cusp ${cusp.house} is being judged through sub lord ${cusp.lordChain.subLord}.`,
        `कस्प ${cusp.house} का निर्णय सब लॉर्ड ${cusp.lordChain.subLord} से हो रहा है.`,
        `કસ્પ ${cusp.house}નો નિર્ણય સબ લોર્ડ ${cusp.lordChain.subLord}થી થઈ રહ્યો છે.`,
      )
    : localizeKp(
        language,
        'The main cusp is still being prepared.',
        'मुख्य कस्प अभी तैयार हो रहा है.',
        'મુખ્ય કસ્પ હજી તૈયાર થઈ રહ્યો છે.',
      );
  const rulingSummary = ruling
    ? localizeKp(
        language,
        `Timing stays grounded through day lord ${ruling.dayLord} and Moon sub ${ruling.moonSubLord}.`,
        `समय निर्धारण डे लॉर्ड ${ruling.dayLord} और मून सब ${ruling.moonSubLord} से जुड़ा रहता है.`,
        `સમય નિર્ધારણ ડે લોર્ડ ${ruling.dayLord} અને મૂન સબ ${ruling.moonSubLord}થી સ્થિર થાય છે.`,
      )
    : localizeKp(
        language,
        'Timing will become sharper once ruling planets are ready.',
        'रूलिंग प्लेनेट तैयार होने पर समय और स्पष्ट होगा.',
        'રૂલિંગ પ્લેનેટ તૈયાર થયા પછી સમય વધુ સ્પષ્ટ બનશે.',
      );

  return {
    caution: localizeKp(
      language,
      'Do not treat KP like a personality reading. It becomes accurate when the question is specific and event-based.',
      'KP को व्यक्तित्व पढ़ाई की तरह न लें. यह तब सटीक होता है जब प्रश्न स्पष्ट और घटना-आधारित हो.',
      'KP ને વ્યક્તિગત વાંચન જેમ ન લો. પ્રશ્ન સ્પષ્ટ અને ઘટના આધારિત હોય ત્યારે જ તે ચોક્કસ બને છે.',
    ),
    cautionTitle: localizeKp(language, 'Ask one exact question', 'एक सटीक प्रश्न पूछें', 'એક ચોક્કસ પ્રશ્ન પૂછો'),
    guidance: localizeKp(
      language,
      `Start with ${focus.title.toLowerCase()}, let KP judge ${areas}, and then use timing only after the event carriers are clear.`,
      `${focus.title} से शुरू करें, KP को ${areas} का निर्णय करने दें, और घटना वाहक साफ होने के बाद ही समय देखें.`,
      `${focus.title}થી શરૂઆત કરો, KP ને ${areas}નું નિર્ણય કરવા દો, અને ઘટના વાહકો સ્પષ્ટ થયા પછી જ સમય જુઓ.`,
    ),
    guidanceTitle: localizeKp(language, 'Event before timing', 'समय से पहले घटना', 'સમય પહેલાં ઘટના'),
    mainCarrier: carrierName,
    strength: carrier
      ? localizeKp(
          language,
          `${carrier.planet} is carrying the clearest event promise right now through ${carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')}.`,
          `${carrier.planet} अभी सबसे स्पष्ट घटना संकेत दे रहा है, खासकर ${carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')} के माध्यम से.`,
          `${carrier.planet} હાલ સૌથી સ્પષ્ટ ઘટના સંકેત આપી રહ્યો છે, ખાસ કરીને ${carrier.signifiesHouses.map(house => getKpHouseArea(house, language)).slice(0, 2).join(', ')} દ્વારા.`,
        )
      : localizeKp(
          language,
          'The event carriers will become clear once significators are ready.',
          'सिग्निफिकेटर तैयार होने पर घटना वाहक स्पष्ट होंगे.',
          'સિગ્નિફિકેટર તૈયાર થયા પછી ઘટના વાહકો સ્પષ્ટ થશે.',
        ),
    whatItSays: localizeKp(
      language,
      `KP is saying this question should be judged through ${areas}. ${cuspSummary} ${rulingSummary}`,
      `KP कह रहा है कि इस प्रश्न का निर्णय ${areas} के माध्यम से होना चाहिए. ${cuspSummary} ${rulingSummary}`,
      `KP કહી રહ્યું છે કે આ પ્રશ્નનું નિર્ણય ${areas} દ્વારા થવું જોઈએ. ${cuspSummary} ${rulingSummary}`,
    ),
  };
}

function getKpHouseArea(house: number, language: string): string {
  const map =
    language === 'hi'
      ? KP_HOUSE_LABELS_HI
      : language === 'gu'
        ? KP_HOUSE_LABELS_GU
        : KP_HOUSE_LABELS_EN;

  return map[house] ?? `H${house}`;
}

function localizeKp(
  language: string,
  en: string,
  hi: string,
  gu: string,
): string {
  if (language === 'hi') {
    return hi;
  }
  if (language === 'gu') {
    return gu;
  }
  return en;
}

const KP_HOUSE_LABELS_EN: Record<number, string> = {
  1: 'self and direction',
  2: 'money and family',
  3: 'effort and movement',
  4: 'home and property',
  5: 'creativity and speculation',
  6: 'work and struggle',
  7: 'marriage and partnership',
  8: 'change and hidden pressure',
  9: 'fortune and blessings',
  10: 'career and public role',
  11: 'gains and fulfilment',
  12: 'expense and release',
};

const KP_HOUSE_LABELS_HI: Record<number, string> = {
  1: 'स्व और दिशा',
  2: 'धन और परिवार',
  3: 'प्रयास और गति',
  4: 'घर और संपत्ति',
  5: 'रचनात्मकता और अटकल',
  6: 'काम और संघर्ष',
  7: 'विवाह और साझेदारी',
  8: 'परिवर्तन और छिपा दबाव',
  9: 'भाग्य और आशीर्वाद',
  10: 'करियर और सार्वजनिक भूमिका',
  11: 'लाभ और पूर्ति',
  12: 'व्यय और मुक्ति',
};

const KP_HOUSE_LABELS_GU: Record<number, string> = {
  1: 'સ્વ અને દિશા',
  2: 'ધન અને પરિવાર',
  3: 'પ્રયાસ અને ગતિ',
  4: 'ઘર અને સંપત્તિ',
  5: 'સર્જનાત્મકતા અને અનુમાન',
  6: 'કામ અને સંઘર્ષ',
  7: 'લગ્ન અને ભાગીદારી',
  8: 'પરિવર્તન અને છુપાયેલ દબાણ',
  9: 'ભાગ્ય અને આશીર્વાદ',
  10: 'કારકિર્દી અને જાહેર ભૂમિકા',
  11: 'લાભ અને પૂર્ણતા',
  12: 'ખર્ચ અને મુકિત',
};
