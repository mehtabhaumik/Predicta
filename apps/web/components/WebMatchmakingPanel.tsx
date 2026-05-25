'use client';

import { getNativeCopy } from '@pridicta/config';
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
      addProfile: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.8451479867"),
      askPredicta: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.c6b9045108"),
      familyVault: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.6fdd68f33c"),
      reportOptions: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.e95db1c212"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.bc3580d452"),
      useAsActive: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.86cbd95a3e"),
    },
    bands: {
      scoreOutOf100: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.23801e0d8f"),
    },
    helper:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.eae5bd5a59"),
    pendingHint:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.452d64fa2a"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.da3fdd836e"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.f1e08c4146"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.9b92993a94"),
    readyTitle: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.6ca151de51"),
    roles: {
      boy: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.fd439b89ec"),
      girl: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.5f48ac4bb3"),
      include: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.15c73827e8"),
      placeholder: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.df9fa435e5"),
    },
    sections: {
      caution: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.bb8d7eacac"),
      conclusion: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.4a27053c90"),
      strengths: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.db95324647"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.e590062feb"),
    title: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.1952f57972"),
  },
  gu: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.9b55a692c0"),
      askPredicta: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.52ca01d0e0"),
      familyVault: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.4c07c4b85b"),
      reportOptions: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.cddc4c91b8"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.7d2df2a8a8"),
      useAsActive: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.1b8417017a"),
    },
    bands: {
      scoreOutOf100: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.ecf1a17eb8"),
    },
    helper:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.503126db79"),
    pendingHint:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.78cab27eb5"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.d1bb4d15ac"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.d58d40bd81"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.86c5a86004"),
    readyTitle: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.caea34906c"),
    roles: {
      boy: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.dba54831b1"),
      girl: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.432959da47"),
      include: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.43b401e36d"),
      placeholder: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.d8605618a1"),
    },
    sections: {
      caution: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.a17c43f17f"),
      conclusion: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.453015ea97"),
      strengths: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.87ecb78580"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.4290d28626"),
    title: getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.a2ef635763"),
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
                  ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.e3902a93f5")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.95a18a8650")
                    : 'Premium matchmaking asset'}
              </div>
              <h3>
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.db1eb665a8")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.0a8cd7578b")
                    : 'Read the real story behind the score.'}
              </h3>
            </div>
            <div className="matchmaking-premium-grid">
              <article className="matchmaking-premium-card">
                <span>
                  {language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.c4531a9fb4")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.292ddec7bb")
                      : 'Matchmaking Deep Report'}
                </span>
                <strong>
                  {language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.7b2ec352a7")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.bb34b397aa")
                      : 'A polished explanation of why the score landed here.'}
                </strong>
                <p>
                  {language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.11a4c236c0")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebMatchmakingPanel.tsx.0facc4497e")
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
