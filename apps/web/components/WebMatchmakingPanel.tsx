'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { composeMatchmakingAnalysis } from '@pridicta/astrology';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { setActiveWebKundli } from '../lib/web-kundli-storage';
import { FamilyRelationshipBadge } from './FamilyRelationshipBadge';

type MatchmakingCopy = {
  actions: {
    addProfile: string;
    askPredicta: string;
    familyVault: string;
    reportOptions: string;
    savedKundlis: string;
    useAsActive: string;
  };
  bands: {
    scoreOutOf100: string;
  };
  helper: string;
  pendingHint: string;
  premiumLabel: string;
  premiumLocked: string;
  readyBody: string;
  readyTitle: string;
  roles: {
    boy: string;
    girl: string;
    include: string;
    placeholder: string;
  };
  sections: {
    caution: string;
    conclusion: string;
    strengths: string;
  };
  subtitle: string;
  title: string;
};

const COPY: Record<SupportedLanguage, MatchmakingCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      askPredicta: 'Ask Predicta',
      familyVault: 'Open Family Vault',
      reportOptions: 'View Report Options',
      savedKundlis: 'Saved Kundlis',
      useAsActive: 'Use as active',
    },
    bands: {
      scoreOutOf100: 'Score out of 100',
    },
    helper:
      'Matchmaking is a dedicated Vedic marriage product. It combines traditional matching with karma, dharma, family adaptation, conflict recovery, and long-term stability.',
    pendingHint:
      'Pick one boy Kundli and one girl Kundli. Predicta will not fake marriage scoring without both charts.',
    premiumLabel: 'Premium matchmaking depth',
    premiumLocked:
      'Premium depth expands into score logic, marriage pressure points, support potential, family blending risk, timing, and practical guidance.',
    readyBody:
      'This section is only for marriage or long-term partnership evaluation. Family Vault stays broader; Matchmaking stays specific.',
    readyTitle: 'Choose the match pair',
    roles: {
      boy: 'Boy Kundli',
      girl: 'Girl Kundli',
      include: 'Selected for matchmaking',
      placeholder: 'Select saved profile',
    },
    sections: {
      caution: 'Caution areas',
      conclusion: 'Plain-language conclusion',
      strengths: 'Strengths',
    },
    subtitle:
      'Score a boy-girl match through Vedic compatibility, karma-dharma fit, and real life-impact.',
    title: 'Matchmaking',
  },
  hi: {
    actions: {
      addProfile: 'प्रोफाइल जोड़ें',
      askPredicta: 'प्रेडिक्टा से पूछें',
      familyVault: 'परिवार वॉल्ट खोलें',
      reportOptions: 'रिपोर्ट विकल्प देखें',
      savedKundlis: 'सेव कुंडलियां',
      useAsActive: 'सक्रिय बनाएं',
    },
    bands: {
      scoreOutOf100: '100 में से स्कोर',
    },
    helper:
      'विवाह मिलान अलग वैदिक उत्पाद है. यह पारंपरिक मिलान को कर्म, धर्म, परिवार अनुकूलन, विवाद सुधार और दीर्घकालीन स्थिरता के साथ जोड़ता है.',
    pendingHint:
      'एक लड़के और एक लड़की की कुंडली चुनें. दोनों चार्ट के बिना प्रेडिक्टा विवाह स्कोर नहीं बनाएगी.',
    premiumLabel: 'प्रीमियम विवाह मिलान गहराई',
    premiumLocked:
      'प्रीमियम में स्कोर तर्क, विवाह दबाव बिंदु, सहारा क्षमता, परिवार मेल जोखिम, समय और व्यावहारिक मार्गदर्शन जुड़ता है.',
    readyBody:
      'यह केवल विवाह या दीर्घकालीन साझेदारी के लिए है. परिवार वॉल्ट व्यापक रहता है; विवाह मिलान विशिष्ट रहता है.',
    readyTitle: 'मिलान जोड़ी चुनें',
    roles: {
      boy: 'लड़के की कुंडली',
      girl: 'लड़की की कुंडली',
      include: 'विवाह मिलान के लिए चुना गया',
      placeholder: 'सेव प्रोफाइल चुनें',
    },
    sections: {
      caution: 'सावधानी क्षेत्र',
      conclusion: 'सरल निष्कर्ष',
      strengths: 'मजबूत पक्ष',
    },
    subtitle:
      'एक लड़के और एक लड़की के मिलान को वैदिक संगति, कर्म-धर्म मेल और जीवन प्रभाव से पढ़ें.',
    title: 'विवाह मिलान',
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      askPredicta: 'પ્રેડિક્ટા ને પૂછો',
      familyVault: 'પરિવાર વોલ્ટ ખોલો',
      reportOptions: 'રિપોર્ટ વિકલ્પો જુઓ',
      savedKundlis: 'સાચવેલી કુંડળીઓ',
      useAsActive: 'સક્રિય બનાવો',
    },
    bands: {
      scoreOutOf100: '100 માંથી સ્કોર',
    },
    helper:
      'લગ્ન મિલાન અલગ વૈદિક ઉત્પાદન છે. તે પરંપરાગત મેળવણીને કર્મ, ધર્મ, પરિવાર અનુકૂલન, ઘર્ષણ પછીનો સુધાર અને દીર્ઘકાલીન સ્થિરતા સાથે જોડે છે.',
    pendingHint:
      'એક છોકરા અને એક છોકરીની કુંડળી પસંદ કરો. બન્ને ચાર્ટ વિના પ્રેડિક્ટા લગ્ન સ્કોર નહીં બનાવે.',
    premiumLabel: 'પ્રીમિયમ લગ્ન મિલાન ઊંડાણ',
    premiumLocked:
      'પ્રીમિયમમાં સ્કોર તર્ક, લગ્ન દબાણ બિંદુઓ, સહારો શક્તિ, પરિવાર મેળ જોખમ, સમય અને પ્રાયોગિક માર્ગદર્શન જોડાય છે.',
    readyBody:
      'આ ફક્ત લગ્ન અથવા લાંબા ગાળાની ભાગીદારી માટે છે. પરિવાર વોલ્ટ વ્યાપક રહે છે; લગ્ન મિલાન ચોક્કસ રહે છે.',
    readyTitle: 'મિલાન જોડી પસંદ કરો',
    roles: {
      boy: 'છોકરાની કુંડળી',
      girl: 'છોકરીની કુંડળી',
      include: 'લગ્ન મિલાન માટે પસંદ',
      placeholder: 'સાચવેલી પ્રોફાઇલ પસંદ કરો',
    },
    sections: {
      caution: 'સાવચેતી ક્ષેત્રો',
      conclusion: 'સરળ નિષ્કર્ષ',
      strengths: 'મજબૂત પક્ષ',
    },
    subtitle:
      'એક છોકરા અને એક છોકરીના મિલાનને વૈદિક સુસંગતતા, કર્મ-ધર્મ મેળ અને જીવન અસરથી વાંચો.',
    title: 'લગ્ન મિલાન',
  },
};

export function WebMatchmakingPanel({
  hasPremiumAccess = false,
}: {
  hasPremiumAccess?: boolean;
}): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = COPY[language] ?? COPY.en;
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const profiles = useMemo(() => {
    const activeFirst = activeKundli
      ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
      : savedKundlis;
    return activeFirst.filter(item => item.familyVaultEligible !== false);
  }, [activeKundli, savedKundlis]);
  const [boyId, setBoyId] = useState<string | undefined>(activeKundli?.id);
  const [girlId, setGirlId] = useState<string | undefined>();

  useEffect(() => {
    if (!profiles.length) {
      setBoyId(undefined);
      setGirlId(undefined);
      return;
    }

    setBoyId(current =>
      current && profiles.some(profile => profile.id === current)
        ? current
        : profiles[0]?.id,
    );
    setGirlId(current =>
      current && profiles.some(profile => profile.id === current)
        ? current
        : profiles[1]?.id,
    );
  }, [profiles]);

  const boy = profiles.find(profile => profile.id === boyId);
  const girl = profiles.find(profile => profile.id === girlId && profile.id !== boyId);
  const analysis = useMemo(
    () =>
      composeMatchmakingAnalysis(boy, girl, {
        depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
        language,
      }),
    [boy, girl, hasPremiumAccess, language],
  );
  const askHref =
    boy && girl
      ? buildPredictaChatHref({
          kundli: boy,
          kundliId: boy.id,
          prompt: analysis.askPrompt,
          purpose: 'relationship',
          school: 'PARASHARI',
          selectedSection: `${analysis.overallScore}/100 · ${analysis.scoreBandLabel}`,
          sourceScreen: 'Matchmaking',
        })
      : '/dashboard/kundli';

  return (
    <section className="matchmaking-panel glass-panel">
      <div className="matchmaking-header">
        <div>
          <div className="section-title">{copy.title}</div>
          <h2>{analysis.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="matchmaking-helper">
          <span>{copy.readyTitle}</span>
          <p>{copy.readyBody}</p>
        </div>
      </div>

      <p className="matchmaking-note">{copy.helper}</p>

      <div className="matchmaking-selector-grid">
        <ProfileSelector
          activeKundliId={activeKundli?.id}
          label={copy.roles.boy}
          language={language}
          onActivate={setActiveWebKundli}
          onChange={setBoyId}
          placeholder={copy.roles.placeholder}
          profiles={profiles}
          selectedId={boy?.id}
          statusLabel={copy.roles.include}
          useAsActiveLabel={copy.actions.useAsActive}
        />
        <ProfileSelector
          activeKundliId={activeKundli?.id}
          disabledId={boy?.id}
          label={copy.roles.girl}
          language={language}
          onActivate={setActiveWebKundli}
          onChange={setGirlId}
          placeholder={copy.roles.placeholder}
          profiles={profiles}
          selectedId={girl?.id}
          statusLabel={copy.roles.include}
          useAsActiveLabel={copy.actions.useAsActive}
        />
      </div>

      {analysis.status === 'ready' ? (
        <>
          <div className="matchmaking-score-panel">
            <div className="matchmaking-score-ring">
              <strong>{analysis.overallScore}</strong>
              <span>{copy.bands.scoreOutOf100}</span>
            </div>
            <div className="matchmaking-score-copy">
              <div className="section-title">{analysis.scoreBandLabel}</div>
              <h3>{analysis.scoreBandExplanation}</h3>
              <p>{analysis.overallConclusion}</p>
            </div>
          </div>

          <div className="matchmaking-breakdown-grid">
            {analysis.scoreBreakdown.map(item => (
              <article className="matchmaking-breakdown-card" key={item.id}>
                <span>{item.title}</span>
                <strong>
                  {item.score}/{item.maxScore}
                </strong>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>

          <div className="matchmaking-summary-grid">
            <article className="matchmaking-summary-card">
              <span>{copy.sections.strengths}</span>
              <ul>
                {analysis.strengths.slice(0, 3).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="matchmaking-summary-card">
              <span>{copy.sections.caution}</span>
              <ul>
                {analysis.cautionAreas.slice(0, 3).map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
            <article className="matchmaking-summary-card">
              <span>{copy.sections.conclusion}</span>
              <strong>{analysis.traditionalBaseline}</strong>
              <p>{analysis.supportPotential}</p>
              <p>{analysis.familyBlendingRisk}</p>
              <p>{analysis.timingNote}</p>
            </article>
          </div>

          <div className="matchmaking-premium">
            <div>
              <div className="section-title">{copy.premiumLabel}</div>
              <h3>{copy.premiumLocked}</h3>
            </div>
            <div className="matchmaking-premium-grid">
              {analysis.premiumSections.map(section => (
                <article className="matchmaking-premium-card" key={section.id}>
                  <span>{section.title}</span>
                  <strong>{section.summary}</strong>
                  <p>{section.guidance}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="matchmaking-premium">
            <div>
              <div className="section-title">
                {language === 'hi'
                  ? 'प्रीमियम मिलान पैकेज'
                  : language === 'gu'
                    ? 'પ્રીમિયમ મિલાન પેકેજ'
                    : 'Premium matchmaking asset'}
              </div>
              <h3>
                {language === 'hi'
                  ? 'स्कोर के पीछे की असली कहानी पढ़िए.'
                  : language === 'gu'
                    ? 'સ્કોર પાછળની સાચી વાર્તા વાંચો.'
                    : 'Read the real story behind the score.'}
              </h3>
            </div>
            <div className="matchmaking-premium-grid">
              <article className="matchmaking-premium-card">
                <span>
                  {language === 'hi'
                    ? 'गहरा विवाह मिलान रिपोर्ट'
                    : language === 'gu'
                      ? 'ઊંડો લગ્ન મિલાન રિપોર્ટ'
                      : 'Matchmaking Deep Report'}
                </span>
                <strong>
                  {language === 'hi'
                    ? 'क्यों ऐसा स्कोर आया, यह साफ़ और सजे हुए तरीके से.'
                    : language === 'gu'
                      ? 'આવો સ્કોર કેમ આવ્યો, તે સ્પષ્ટ અને સજ્જ રીતે.'
                      : 'A polished explanation of why the score landed here.'}
                </strong>
                <p>
                  {language === 'hi'
                    ? 'Premium में score logic, परिवार अनुकूलन, timing windows और practical marriage guidance जुड़ती है.'
                    : language === 'gu'
                      ? 'Premium માં score logic, પરિવાર અનુકૂલન, timing windows અને practical marriage guidance જોડાય છે.'
                      : 'Premium adds score logic, family adaptation, timing windows, and practical marriage guidance.'}
                </p>
                <Link
                  className="button secondary"
                  href="/dashboard/report?focus=COMPATIBILITY&mode=PREMIUM"
                >
                  {copy.actions.reportOptions}
                </Link>
              </article>
            </div>
          </div>
        </>
      ) : (
        <article className="matchmaking-summary-card">
          <span>{copy.readyTitle}</span>
          <strong>{analysis.title}</strong>
          <p>{analysis.overallConclusion}</p>
          <p>{analysis.traditionalBaseline}</p>
          <p>{analysis.premiumUnlock}</p>
        </article>
      )}

      <div className="action-row">
        <Link className="button" href={boy && girl ? askHref : '/dashboard/kundli'}>
          {copy.actions.askPredicta}
        </Link>
        <Link className="button secondary" href="/dashboard/report">
          {copy.actions.reportOptions}
        </Link>
        <Link className="button secondary" href="/dashboard/family">
          {copy.actions.familyVault}
        </Link>
        <Link className="button secondary" href="/dashboard/saved-kundlis">
          {copy.actions.savedKundlis}
        </Link>
        <Link className="button secondary" href="/dashboard/kundli">
          {copy.actions.addProfile}
        </Link>
      </div>

      {analysis.status !== 'ready' ? (
        <p className="matchmaking-pending-note">{copy.pendingHint}</p>
      ) : null}
    </section>
  );
}

function ProfileSelector({
  activeKundliId,
  disabledId,
  label,
  language,
  onActivate,
  onChange,
  placeholder,
  profiles,
  selectedId,
  statusLabel,
  useAsActiveLabel,
}: {
  activeKundliId?: string;
  disabledId?: string;
  label: string;
  language: SupportedLanguage;
  onActivate: (kundli: KundliData) => void;
  onChange: (id: string) => void;
  placeholder: string;
  profiles: KundliData[];
  selectedId?: string;
  statusLabel: string;
  useAsActiveLabel: string;
}): React.JSX.Element {
  const selected = profiles.find(profile => profile.id === selectedId);

  return (
    <label className={`matchmaking-selector-card${selected ? ' active' : ''}`}>
      <span>{label}</span>
      <strong>{selected?.birthDetails.name ?? placeholder}</strong>
      {selected ? (
        <FamilyRelationshipBadge
          language={language}
          relationship={selected.relationshipToOwner ?? 'other'}
        />
      ) : null}
      <p>
        {selected
          ? `${selected.lagna} Lagna · ${selected.moonSign} Moon · ${selected.nakshatra}`
          : placeholder}
      </p>
      <select
        aria-label={label}
        onChange={event => onChange(event.target.value)}
        value={selectedId ?? ''}
      >
        <option value="">{placeholder}</option>
        {profiles.map(profile => (
          <option
            disabled={profile.id === disabledId}
            key={profile.id}
            value={profile.id}
          >
            {profile.birthDetails.name}
          </option>
        ))}
      </select>
      {selected ? <small>{statusLabel}</small> : null}
      {selected && selected.id !== activeKundliId ? (
        <button
          className="button secondary"
          onClick={event => {
            event.preventDefault();
            onActivate(selected);
          }}
          type="button"
        >
          {useAsActiveLabel}
        </button>
      ) : null}
    </label>
  );
}
