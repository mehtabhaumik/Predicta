'use client';

import { getNativeCopy } from '@pridicta/config';
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
      addProfile: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.8451479867"),
      askPredicta: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.c6b9045108"),
      included: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.69d9dd488e"),
      include: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.2a63b3547a"),
      openFamilyMap: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.17008848e9"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.bc3580d452"),
      useAsActive: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.86cbd95a3e"),
    },
    helper:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.1807dda592"),
    karmaLabel: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.a87de9316a"),
    pendingComparisonNote: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.f6eb5415aa"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.9d9656d93c"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.4f12a30900"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.180297cdd5"),
    readyTitle: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.22acb8f26e"),
    selectors: {
      first: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.3ec5aa0929"),
      second: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.ea360cd387"),
      placeholder: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.df9fa435e5"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.1c806124d6"),
    title: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.458bfa4431"),
  },
  gu: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.9b55a692c0"),
      askPredicta: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.52ca01d0e0"),
      included: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.0b6d01930b"),
      include: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.efbd6ad130"),
      openFamilyMap: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.05de9e0d3e"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.7d2df2a8a8"),
      useAsActive: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.1b8417017a"),
    },
    helper:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.82daf7187c"),
    karmaLabel: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.9e5104ffee"),
    pendingComparisonNote: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.f832c0d798"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.213a5c8b07"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.ae39bbfdf3"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.d4bf8e61bc"),
    readyTitle: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.3856f6695d"),
    selectors: {
      first: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.da87b1d2ea"),
      second: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.aed5da8a8f"),
      placeholder: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.d8605618a1"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.b255c35a4f"),
    title: getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.24cb3a63db"),
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
              ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.cbfbbfa83a")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.a6b1a9b081")
                : 'Premium pair assets'}
          </div>
          <h3>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.c113de93dd")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.1fcb4abc48")
                : 'Turn pair comparison into report-grade depth.'}
          </h3>
        </div>
        <div className="pair-comparison-premium-grid">
          {[
            {
              body:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.236c979f6a")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.87af972be3")
                    : 'A polished life-area dossier: harmony, friction, money style, duty load, and repair path.',
              cta: '/dashboard/report?focus=COMPATIBILITY&mode=PREMIUM',
              title:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.b2613f3e37")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.2d94979ef9")
                    : 'Pair Comparison Dossier',
            },
            {
              body:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.cef6b0f341")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.f60700430a")
                    : 'Turn the pair out of jargon and into practical healing steps.',
              cta: '/dashboard/report?focus=REMEDIES&mode=PREMIUM',
              title:
                language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.8961e62340")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.fe3b312a3c")
                    : 'Relationship Healing Guide',
            },
          ].map(asset => (
            <article className="pair-comparison-premium-card" key={asset.title}>
              <span>{asset.title}</span>
              <strong>{hasPremiumAccess ? copy.premiumLabel : copy.premiumLocked}</strong>
              <p>{asset.body}</p>
              <Link className="button secondary" href={asset.cta}>
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.901879c422")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebFamilyPairComparison.tsx.e0185a82d6")
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
