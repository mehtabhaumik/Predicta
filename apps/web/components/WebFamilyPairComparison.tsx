'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { composePairComparison } from '@pridicta/astrology';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { setActiveWebKundli } from '../lib/web-kundli-storage';
import { FamilyRelationshipBadge } from './FamilyRelationshipBadge';

type PairComparisonCopy = {
  actions: {
    addProfile: string;
    askPredicta: string;
    included: string;
    include: string;
    openFamilyMap: string;
    savedKundlis: string;
    useAsActive: string;
  };
  helper: string;
  karmaLabel: string;
  pendingComparisonNote: string;
  premiumLabel: string;
  premiumLocked: string;
  readyBody: string;
  readyTitle: string;
  selectors: {
    first: string;
    second: string;
    placeholder: string;
  };
  subtitle: string;
  title: string;
};

const COPY: Record<SupportedLanguage, PairComparisonCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      askPredicta: 'Ask Predicta',
      included: 'Included in comparison',
      include: 'Choose this profile',
      openFamilyMap: 'Open Family Karma Map',
      savedKundlis: 'Saved Kundlis',
      useAsActive: 'Use as active',
    },
    helper:
      'Pair Comparison is not only for marriage. Use it for partners, parents, siblings, friends, co-workers, or in-laws.',
    karmaLabel: 'Karma',
    pendingComparisonNote: 'Predicta will only compare real saved charts.',
    premiumLabel: 'Premium life-area depth',
    premiumLocked:
      'Premium depth expands this into emotional rhythm, duty friction, money style, healing potential, and timing-aware guidance.',
    readyBody:
      'Predicta compares exactly two saved profiles and stays focused on useful real-life outcomes, not jargon.',
    readyTitle: 'Choose exactly two profiles',
    selectors: {
      first: 'First profile',
      second: 'Second profile',
      placeholder: 'Select saved profile',
    },
    subtitle:
      'Compare any two saved profiles across harmony, friction, karma, dharma, and practical guidance.',
    title: 'Pair Comparison',
  },
  hi: {
    actions: {
      addProfile: 'प्रोफाइल जोड़ें',
      askPredicta: 'प्रेडिक्टा से पूछें',
      included: 'तुलना में शामिल',
      include: 'इस प्रोफाइल को चुनें',
      openFamilyMap: 'परिवार कर्म नक्शा खोलें',
      savedKundlis: 'सेव कुंडलियां',
      useAsActive: 'सक्रिय बनाएं',
    },
    helper:
      'जोड़ेदार तुलना केवल विवाह के लिए नहीं है. इसे साथी, माता-पिता, भाई-बहन, मित्र, सहकर्मी या ससुराल संबंधों के लिए भी इस्तेमाल करें.',
    karmaLabel: 'कर्म',
    pendingComparisonNote: 'प्रेडिक्टा केवल वास्तविक सेव चार्टों की तुलना करेगी.',
    premiumLabel: 'प्रीमियम जीवन-क्षेत्र गहराई',
    premiumLocked:
      'प्रीमियम गहराई इसे भावनात्मक लय, कर्तव्य टकराव, धन शैली, उपचार क्षमता और समय-सचेत मार्गदर्शन तक बढ़ाती है.',
    readyBody:
      'प्रेडिक्टा ठीक दो सेव प्रोफाइलों की तुलना करती है और तकनीकी शब्दजाल की जगह उपयोगी जीवन-परिणामों पर रहती है.',
    readyTitle: 'ठीक दो प्रोफाइल चुनें',
    selectors: {
      first: 'पहली प्रोफाइल',
      second: 'दूसरी प्रोफाइल',
      placeholder: 'सेव प्रोफाइल चुनें',
    },
    subtitle:
      'किसी भी दो सेव प्रोफाइल की सहमति, घर्षण, कर्म, धर्म और व्यावहारिक मार्गदर्शन के लिए तुलना करें.',
    title: 'जोड़ेदार तुलना',
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      askPredicta: 'પ્રેડિક્ટા ને પૂછો',
      included: 'તુલનામાં સામેલ',
      include: 'આ પ્રોફાઇલ પસંદ કરો',
      openFamilyMap: 'પરિવાર કર્મ નકશો ખોલો',
      savedKundlis: 'સાચવેલી કુંડળીઓ',
      useAsActive: 'સક્રિય બનાવો',
    },
    helper:
      'જોડી તુલના માત્ર લગ્ન માટે નથી. તેને જીવનસાથી, માતા-પિતા, ભાઈ-બહેન, મિત્ર, સહકર્મી કે સસરિયાના સંબંધ માટે પણ વાપરો.',
    karmaLabel: 'કર્મ',
    pendingComparisonNote: 'પ્રેડિક્ટા ફક્ત સાચવેલા વાસ્તવિક ચાર્ટની જ તુલના કરશે.',
    premiumLabel: 'પ્રીમિયમ જીવન-ક્ષેત્ર ઊંડાણ',
    premiumLocked:
      'પ્રીમિયમ ઊંડાણ આને ભાવનાત્મક લય, ફરજ ઘર્ષણ, પૈસાની શૈલી, ઉપચાર ક્ષમતા અને સમય-સચેત માર્ગદર્શન સુધી વધારે છે.',
    readyBody:
      'પ્રેડિક્ટા ચોક્કસ બે સાચવેલી પ્રોફાઇલની તુલના કરે છે અને ટેકનિકલ શબ્દજાળ કરતાં ઉપયોગી જીવનફળ પર રહે છે.',
    readyTitle: 'ચોક્કસ બે પ્રોફાઇલ પસંદ કરો',
    selectors: {
      first: 'પહેલી પ્રોફાઇલ',
      second: 'બીજી પ્રોફાઇલ',
      placeholder: 'સાચવેલી પ્રોફાઇલ પસંદ કરો',
    },
    subtitle:
      'કોઈપણ બે સાચવેલી પ્રોફાઇલને સહકાર, ઘર્ષણ, કર્મ, ધર્મ અને પ્રાયોગિક માર્ગદર્શન માટે તુલના કરો.',
    title: 'જોડી તુલના',
  },
};

export function WebFamilyPairComparison({
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
  const [firstId, setFirstId] = useState<string | undefined>(activeKundli?.id);
  const [secondId, setSecondId] = useState<string | undefined>();

  useEffect(() => {
    if (!profiles.length) {
      setFirstId(undefined);
      setSecondId(undefined);
      return;
    }

    setFirstId(current =>
      current && profiles.some(profile => profile.id === current)
        ? current
        : profiles[0]?.id,
    );
    setSecondId(current =>
      current && profiles.some(profile => profile.id === current)
        ? current
        : profiles[1]?.id,
    );
  }, [profiles]);

  const first = profiles.find(item => item.id === (firstId ?? activeKundli?.id));
  const second = profiles.find(item => item.id === secondId && item.id !== first?.id);
  const freePair = useMemo(
    () => composePairComparison(first, second, { depth: 'FREE' }),
    [first, second],
  );
  const premiumPair = useMemo(
    () => composePairComparison(first, second, { depth: 'PREMIUM' }),
    [first, second],
  );
  const askHref =
    first && second
      ? buildPredictaChatHref({
          kundli: first,
          kundliId: first.id,
          prompt: freePair.askPrompt,
          purpose: 'relationship',
          school: 'PARASHARI',
          selectedRelationshipMirror: true,
          selectedRelationshipNames: `${first.birthDetails.name} + ${second.birthDetails.name}`,
          selectedSection: freePair.headline,
          sourceScreen: 'Pair Comparison',
        })
      : '/dashboard/kundli';

  return (
    <section className="pair-comparison-panel glass-panel">
      <div className="pair-comparison-header">
        <div>
          <div className="section-title">{copy.title}</div>
          <h2>{freePair.headline}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="pair-comparison-helper">
          <span>{copy.readyTitle}</span>
          <p>{copy.readyBody}</p>
        </div>
      </div>

      <p className="pair-comparison-note">{copy.helper}</p>

      <div className="pair-comparison-selector-grid">
        <ProfileSlot
          label={copy.selectors.first}
          onActivate={setActiveWebKundli}
          onChange={setFirstId}
          profiles={profiles}
          stateLabel={first ? copy.actions.included : copy.actions.include}
          value={first?.id}
          language={language}
          pendingNote={copy.pendingComparisonNote}
          placeholder={copy.selectors.placeholder}
          showActivateAction={Boolean(first && first.id !== activeKundli?.id)}
          useAsActiveLabel={copy.actions.useAsActive}
        />
        <ProfileSlot
          disabledId={first?.id}
          label={copy.selectors.second}
          onActivate={setActiveWebKundli}
          onChange={setSecondId}
          profiles={profiles}
          stateLabel={second ? copy.actions.included : copy.actions.include}
          value={second?.id}
          language={language}
          pendingNote={copy.pendingComparisonNote}
          placeholder={copy.selectors.placeholder}
          showActivateAction={Boolean(second && second.id !== activeKundli?.id)}
          useAsActiveLabel={copy.actions.useAsActive}
        />
      </div>

      <div className="pair-comparison-grid">
        <div className="pair-comparison-card">
          <span>{freePair.relationshipContextLabel}</span>
          <strong>{freePair.overview}</strong>
          <p>{freePair.practicalGuidance}</p>
        </div>
        <div className="pair-comparison-card">
          <span>{copy.karmaLabel}</span>
          <strong>{freePair.karmaTheme}</strong>
          <p>{freePair.dharmaLesson}</p>
        </div>
      </div>

      <div className="pair-comparison-highlights">
        {freePair.freeHighlights.map(item => (
          <article className="pair-comparison-highlight" key={item.id}>
            <span>{item.title}</span>
            <strong>{item.summary}</strong>
            <p>{item.guidance}</p>
          </article>
        ))}
      </div>

      <div className="pair-comparison-premium">
        <div>
          <div className="section-title">{copy.premiumLabel}</div>
          <h3>{copy.premiumLocked}</h3>
        </div>
        <div className="pair-comparison-premium-grid">
          {(hasPremiumAccess ? premiumPair.premiumSections : premiumPair.premiumSections.slice(0, 4)).map(section => (
            <article className="pair-comparison-premium-card" key={section.id}>
              <span>{section.title}</span>
              <strong>{section.summary}</strong>
              <p>{section.guidance}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="pair-comparison-premium">
        <div>
          <div className="section-title">
            {language === 'hi'
              ? 'प्रीमियम जोड़ी पैकेज'
              : language === 'gu'
                ? 'પ્રીમિયમ જોડી પેકેજ'
                : 'Premium pair assets'}
          </div>
          <h3>
            {language === 'hi'
              ? 'जोड़ेदार तुलना को सजा हुआ गहरा सार बनाइए.'
              : language === 'gu'
                ? 'જોડી તુલનાને સજ્જ ઊંડા સારમાં ફેરવો.'
                : 'Turn pair comparison into report-grade depth.'}
          </h3>
        </div>
        <div className="pair-comparison-premium-grid">
          {[
            {
              body:
                language === 'hi'
                  ? 'जीवन-क्षेत्र आधारित सजा हुआ सार: मेल, घर्षण, धन शैली, जिम्मेदारी का भार और सुधार का रास्ता.'
                  : language === 'gu'
                    ? 'જીવન-ક્ષેત્ર આધારિત સજ્જ સાર: મેળ, ઘર્ષણ, પૈસાની શૈલી, જવાબદારીનો ભાર અને સુધારનો રસ્તો.'
                    : 'A polished life-area dossier: harmony, friction, money style, duty load, and repair path.',
              cta: '/dashboard/report?focus=COMPATIBILITY&mode=PREMIUM',
              title:
                language === 'hi'
                  ? 'जोड़ेदार तुलना सार'
                  : language === 'gu'
                    ? 'જોડી તુલના સાર'
                    : 'Pair Comparison Dossier',
            },
            {
              body:
                language === 'hi'
                  ? 'रिश्ते को तकनीकी भाषा से बाहर निकालकर व्यावहारिक सुधार कदमों में बदलिए.'
                  : language === 'gu'
                    ? 'સંબંધને technical jargon બહાર કાઢીને પ્રાયોગિક સુધાર પગલાંમાં ફેરવો.'
                    : 'Turn the pair out of jargon and into practical healing steps.',
              cta: '/dashboard/report?focus=REMEDIES&mode=PREMIUM',
              title:
                language === 'hi'
                  ? 'रिश्ता सुधार मार्गदर्शिका'
                  : language === 'gu'
                    ? 'સંબંધ સુધાર માર્ગદર્શિકા'
                    : 'Relationship Healing Guide',
            },
          ].map(asset => (
            <article className="pair-comparison-premium-card" key={asset.title}>
              <span>{asset.title}</span>
              <strong>{hasPremiumAccess ? copy.premiumLabel : copy.premiumLocked}</strong>
              <p>{asset.body}</p>
              <Link className="button secondary" href={asset.cta}>
                {language === 'hi'
                  ? 'खोलें'
                  : language === 'gu'
                    ? 'ખોલો'
                    : 'Open'}
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className="action-row">
        <Link className="button" href={first && second ? askHref : '/dashboard/kundli'}>
          {copy.actions.askPredicta}
        </Link>
        <Link className="button secondary" href="/dashboard/family/karma-map">
          {copy.actions.openFamilyMap}
        </Link>
        <Link className="button secondary" href="/dashboard/saved-kundlis">
          {copy.actions.savedKundlis}
        </Link>
        <Link className="button secondary" href="/dashboard/kundli">
          {copy.actions.addProfile}
        </Link>
      </div>
    </section>
  );
}

function ProfileSlot({
  disabledId,
  label,
  language,
  onActivate,
  onChange,
  pendingNote,
  placeholder,
  profiles,
  showActivateAction,
  stateLabel,
  useAsActiveLabel,
  value,
}: {
  disabledId?: string;
  label: string;
  language: SupportedLanguage;
  onActivate: (kundli: KundliData) => void;
  onChange: (id: string) => void;
  pendingNote: string;
  placeholder: string;
  profiles: KundliData[];
  showActivateAction: boolean;
  stateLabel: string;
  useAsActiveLabel: string;
  value?: string;
}): React.JSX.Element {
  const selected = profiles.find(profile => profile.id === value);

  return (
    <label className={`pair-comparison-slot${selected ? ' active' : ''}`}>
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
          : pendingNote}
      </p>
      <select
        aria-label={label}
        onChange={event => onChange(event.target.value)}
        value={value ?? ''}
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
      {selected && showActivateAction ? (
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
      <small>{stateLabel}</small>
    </label>
  );
}
