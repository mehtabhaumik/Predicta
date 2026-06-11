'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FAMILY_COMPARISON_MAX_KUNDLIS,
  FAMILY_COMPARISON_MIN_KUNDLIS,
  composeFamilyKarmaMap,
  evaluateFamilyComparisonEligibility,
  getFamilyComparisonEligibilityMessage,
} from '@pridicta/astrology';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { setActiveWebKundli } from '../lib/web-kundli-storage';
import { FamilyRelationshipBadge } from './FamilyRelationshipBadge';

type FamilyMapCopy = {
  actions: {
    addProfile: string;
    askPredicta: string;
    pairComparison: string;
    savedKundlis: string;
    useAsActive: string;
  };
  boundaryCards: Array<{ body: string; title: string }>;
  helper: string;
  includeLabel: string;
  includedLabel: string;
  matrix: {
    title: string;
  };
  pendingLabel: string;
  premiumLabel: string;
  premiumLocked: string;
  readyBody: string;
  readyTitle: string;
  selectors: {
    max: (count: number) => string;
    min: string;
  };
  subtitle: string;
  summary: {
    friction: string;
    household: string;
    karma: string;
    support: string;
  };
  themesTitle: string;
  title: string;
};

const COPY: Record<SupportedLanguage, FamilyMapCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      askPredicta: 'Ask Predicta',
      pairComparison: 'Open Pair Comparison',
      savedKundlis: 'Saved Kundlis',
      useAsActive: 'Use as active',
    },
    boundaryCards: [
      {
        body:
          'Family Karma Map compares saved profiles only. Birth details still live in My Kundlis, where edit and deletion stay personal.',
        title: 'My Kundlis stays primary',
      },
      {
        body:
          'This map is for care, duty, and household repair. It is not permission to label one person as the family problem.',
        title: 'No blame contract',
      },
    ],
    helper:
      'Select at least two saved profiles. Predicta will map repeating patterns, support anchors, and pressure chains across the household.',
    includeLabel: 'Include',
    includedLabel: 'Included',
    matrix: {
      title: 'Household influence matrix',
    },
    pendingLabel: 'Pending',
    premiumLabel: 'Premium household depth',
    premiumLocked:
      'Premium family reading expands into pairwise influence, caregiving burden, authority patterns, money stress, and repair guidance by life area.',
    readyBody:
      'This is the wider household layer. Predicta compares how the saved charts reinforce, drain, soothe, or trigger one another.',
    readyTitle: 'Choose your household circle',
    selectors: {
      max: count => `Up to ${count} profiles can be mapped at once.`,
      min: 'Choose at least two profiles to unlock the map.',
    },
    subtitle:
      'Map how karma, dharma, timing, and emotional patterns repeat across the household.',
    summary: {
      friction: 'Strongest friction pair',
      household: 'Household summary',
      karma: 'Repeating karma pattern',
      support: 'Strongest support pair',
    },
    themesTitle: 'Repeated household themes',
    title: 'Family Karma Map',
  },
  hi: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.8451479867"),
      askPredicta: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.c6b9045108"),
      pairComparison: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.4683953b3a"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.bc3580d452"),
      useAsActive: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.86cbd95a3e"),
    },
    boundaryCards: [
      {
        body:
          getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.a868fbcb82"),
        title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.b9d2b0418d"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.96f61c3a68"),
        title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.4f34732a9c"),
      },
    ],
    helper:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e8e22f5539"),
    includeLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.774818b0c4"),
    includedLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.9b4856e21d"),
    matrix: {
      title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.59f483c588"),
    },
    pendingLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e808f55dd6"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.204a4b5893"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.0bcc310b13"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.ef9dea298f"),
    readyTitle: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.9451eee970"),
    selectors: {
      max: count => formatNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.fcac92d9ad", [count]),
      min: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.9610de0dfb"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f5e7c7fcef"),
    summary: {
      friction: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.efee38b037"),
      household: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.9d3034095c"),
      karma: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.eb9130c112"),
      support: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.4ce34f706e"),
    },
    themesTitle: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.8fe3c701f1"),
    title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.541b1bf91a"),
  },
  gu: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.9b55a692c0"),
      askPredicta: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.52ca01d0e0"),
      pairComparison: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.810299ef1b"),
      savedKundlis: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.7d2df2a8a8"),
      useAsActive: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.1b8417017a"),
    },
    boundaryCards: [
      {
        body:
          getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.36f2bbdab4"),
        title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.ee17fe3af3"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.43ab434ece"),
        title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.00670d2fc2"),
      },
    ],
    helper:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.526a57c2c3"),
    includeLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.be2875ab05"),
    includedLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f5c40d934d"),
    matrix: {
      title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.40bf2efcfe"),
    },
    pendingLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.577270f404"),
    premiumLabel: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.2e2806a154"),
    premiumLocked:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e40abf9315"),
    readyBody:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.cbbe28db44"),
    readyTitle: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.afdcea6662"),
    selectors: {
      max: count => formatNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.b280298db5", [count]),
      min: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f42583c6f5"),
    },
    subtitle:
      getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d9aa7f95a3"),
    summary: {
      friction: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.11f4f4ba73"),
      household: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d21e8676b6"),
      karma: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.591036d784"),
      support: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e86ec14194"),
    },
    themesTitle: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.0e5e779006"),
    title: getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f42a117fe6"),
  },
};

export function WebFamilyKarmaMap({
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
  const initialSelectedIds = useMemo(
    () =>
      profiles
        .slice(0, Math.min(FAMILY_COMPARISON_MIN_KUNDLIS, profiles.length))
        .map(profile => profile.id),
    [profiles],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    if (!profiles.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(current => {
      const stillValid = current.filter(id => profiles.some(profile => profile.id === id));
      if (stillValid.length >= FAMILY_COMPARISON_MIN_KUNDLIS) {
        return stillValid.slice(0, FAMILY_COMPARISON_MAX_KUNDLIS);
      }
      return profiles
        .slice(0, Math.min(FAMILY_COMPARISON_MIN_KUNDLIS, profiles.length))
        .map(profile => profile.id);
    });
  }, [profiles]);

  const selectedProfiles = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const chosen = profiles.filter(profile => selectedSet.has(profile.id));
    return chosen;
  }, [profiles, selectedIds]);
  const comparisonEligibility = evaluateFamilyComparisonEligibility(
    selectedProfiles.length,
  );
  const comparisonEligibilityMessage =
    getFamilyComparisonEligibilityMessage(comparisonEligibility);

  const map = useMemo(
    () =>
      composeFamilyKarmaMap(
        selectedProfiles.map(kundli => ({
          kundli,
          relationship: kundli.relationshipToOwner,
        })),
        {
          depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
          language,
        },
      ),
    [hasPremiumAccess, language, selectedProfiles],
  );

  const askHref =
    comparisonEligibility.allowed && map.status === 'ready' && activeKundli
      ? buildPredictaChatHref({
          kundli: activeKundli,
          kundliId: activeKundli.id,
          prompt: map.askPrompt,
          purpose: 'family',
          school: 'PARASHARI',
          selectedFamilyKarmaMap: true,
          selectedFamilyMemberCount: selectedProfiles.length,
          selectedSection: map.title,
          sourceScreen: 'Family Karma Map',
        })
      : '/dashboard/kundli';

  function toggleProfile(profile: KundliData): void {
    setSelectedIds(current => {
      if (current.includes(profile.id)) {
        return current.filter(id => id !== profile.id);
      }

      if (current.length >= FAMILY_COMPARISON_MAX_KUNDLIS) {
        return current;
      }

      return [...current, profile.id];
    });
  }

  return (
    <section className="family-experience-panel glass-panel">
      <div className="family-experience-header">
        <div>
          <div className="section-title">{copy.title}</div>
          <h2>{map.title}</h2>
          <p>{copy.subtitle}</p>
        </div>
        <div className="family-experience-helper">
          <span>{copy.readyTitle}</span>
          <p>{copy.readyBody}</p>
        </div>
      </div>

      <p className="family-experience-note">{copy.helper}</p>

      <div className="family-boundary-grid">
        {copy.boundaryCards.map(card => (
          <div className="family-boundary-card" key={card.title}>
            <span>{card.title}</span>
            <p>{card.body}</p>
          </div>
        ))}
      </div>

      <div className="family-selection-summary">
        <strong>
          {selectedProfiles.length >= 2
            ? copy.selectors.max(FAMILY_COMPARISON_MAX_KUNDLIS)
            : copy.selectors.min}
        </strong>
        <span>
          {selectedProfiles.length
            ? selectedProfiles.map(profile => profile.birthDetails.name).join(' · ')
            : comparisonEligibilityMessage}
        </span>
        <small>{comparisonEligibilityMessage}</small>
      </div>

      <div className="family-profile-grid">
        {profiles.map(profile => {
          const selected = selectedIds.includes(profile.id);
          const active = profile.id === activeKundli?.id;

          return (
            <article
              className={`family-profile-card${selected ? ' selected' : ''}${active ? ' active' : ''}`}
              key={profile.id}
            >
              <div className="family-profile-card-top">
                <div>
                  <div className="saved-kundli-status-row">
                    <span className="section-title">
                      {active ? copy.actions.useAsActive : copy.actions.savedKundlis}
                    </span>
                    <FamilyRelationshipBadge
                      language={language}
                      relationship={profile.relationshipToOwner ?? 'other'}
                    />
                  </div>
                  <h3>{profile.birthDetails.name}</h3>
                  <p>
                    {profile.lagna} Lagna · {profile.moonSign} Moon · {profile.nakshatra}
                  </p>
                </div>
                <label className="family-select-toggle">
                  <input
                    checked={selected}
                    disabled={!selected && selectedIds.length >= FAMILY_COMPARISON_MAX_KUNDLIS}
                    onChange={() => toggleProfile(profile)}
                    type="checkbox"
                  />
                  <span>{selected ? copy.includedLabel : copy.includeLabel}</span>
                </label>
              </div>
              <div className="family-profile-actions">
                {!active ? (
                  <button
                    className="button secondary"
                    onClick={() => setActiveWebKundli(profile)}
                    type="button"
                  >
                    {copy.actions.useAsActive}
                  </button>
                ) : null}
                <Link
                  className="button secondary"
                  href={`/dashboard/kundli?focusKundliId=${encodeURIComponent(profile.id)}`}
                  onClick={() => setActiveWebKundli(profile)}
                >
                  {copy.actions.savedKundlis}
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="family-map-summary-grid">
        <article className="family-map-summary-card">
          <span>{copy.summary.household}</span>
          <strong>{map.householdSummary}</strong>
          <p>{map.privacyNote}</p>
        </article>
        <article className="family-map-summary-card">
          <span>{copy.summary.support}</span>
          <strong>{map.strongestSupportPair ?? copy.pendingLabel}</strong>
          <p>{map.dharmaRepairPath ?? map.subtitle}</p>
        </article>
        <article className="family-map-summary-card">
          <span>{copy.summary.friction}</span>
          <strong>{map.strongestFrictionPair ?? copy.pendingLabel}</strong>
          <p>{map.relationshipCards[0]?.frictionPattern ?? map.subtitle}</p>
        </article>
        <article className="family-map-summary-card">
          <span>{copy.summary.karma}</span>
          <strong>{map.repeatingKarmaPattern ?? copy.pendingLabel}</strong>
          <p>{map.dharmaRepairPath ?? map.subtitle}</p>
        </article>
      </div>

      <div className="family-map-premium-grid">
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.3b93796781")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.041062d30d")
                : 'Household emotional climate'}
          </span>
          <strong>{map.householdEmotionalClimate}</strong>
          <p>{map.communicationFractureMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d76e85b7f2")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.a1fe5becc8")
                : 'Authority and dependency'}
          </span>
          <strong>{map.authorityDependencyPattern}</strong>
          <p>{map.caregivingBurdenMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.a5598c724f")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.fbc727918b")
                : 'Routine, ritual, and money stress'}
          </span>
          <strong>{map.ritualRoutineMoneyStressMap}</strong>
          <p>{map.dharmaRepairPath ?? map.subtitle}</p>
        </article>
      </div>

      <div className="family-map-premium-grid">
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.33af92cd69")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.006108c35f")
                : 'Who calms the house'}
          </span>
          <strong>{map.whoCalmsTheHouse ?? map.strongestSupportPair ?? copy.pendingLabel}</strong>
          <p>{map.householdEmotionalClimate}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.5f04df7754")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e73ccc7bfb")
                : 'Who amplifies pressure'}
          </span>
          <strong>
            {map.whoAmplifiesPressure ?? map.strongestFrictionPair ?? copy.pendingLabel}
          </strong>
          <p>{map.communicationFractureMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.fc8563d265")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.0e891adf5a")
                : 'Who needs gentler handling'}
          </span>
          <strong>{map.whoNeedsGentlerHandling ?? copy.pendingLabel}</strong>
          <p>{map.caregivingBurdenMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.2000dd6656")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.378354ea9a")
                : 'Fastest healing pair'}
          </span>
          <strong>{map.fastestHealingPair ?? map.strongestSupportPair ?? copy.pendingLabel}</strong>
          <p>{map.dharmaRepairPath ?? map.subtitle}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.c9d31ed842")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.47cf170970")
                : 'Repeated routine or money tension'}
          </span>
          <strong>{map.repeatedRoutineMoneyTension ?? map.ritualRoutineMoneyStressMap}</strong>
          <p>{map.ritualRoutineMoneyStressMap}</p>
        </article>
      </div>

      <div className="family-map-sections">
        <section className="family-map-section">
          <div className="section-title">{copy.themesTitle}</div>
          <div className="family-map-theme-grid">
            {map.repeatedThemes.slice(0, hasPremiumAccess ? 6 : 4).map(theme => (
              <article className="family-map-theme-card" key={theme.id}>
                <span>{theme.title}</span>
                <strong>{theme.summary}</strong>
                <p>{theme.guidance}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="family-map-section">
          <div className="section-title">{copy.matrix.title}</div>
          <div className="family-map-matrix">
            {map.influenceMatrix.slice(0, hasPremiumAccess ? map.influenceMatrix.length : 4).map(row => (
              <article className="family-map-matrix-row" key={row.memberId}>
                <div>
                  <strong>{row.name}</strong>
                  <span>{row.relationshipDisplayLabel}</span>
                </div>
                <p>
                  {row.influence} {row.supportNeed}
                  {hasPremiumAccess
                    ? ` ${row.caregivingRole} ${row.authorityPattern} ${row.communicationRisk} ${row.healingKey}`
                    : ''}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="family-map-section">
          <div className="section-title">{copy.premiumLabel}</div>
          <div className="family-map-relationship-grid">
            {map.relationshipCards
              .slice(0, hasPremiumAccess ? map.relationshipCards.length : 4)
              .map(card => (
                <article className="family-map-relationship-card" key={card.id}>
                  <span>{card.label}</span>
                  <strong>{card.emotionalPattern}</strong>
                  <p>{card.practicalGuidance}</p>
                </article>
              ))}
          </div>
          {!hasPremiumAccess ? (
            <p className="family-premium-note">{copy.premiumLocked}</p>
          ) : null}
        </section>

        <section className="family-map-section">
          <div className="section-title">
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.eb7838a9cd")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d851d93898")
                : 'Healing direction'}
          </div>
          <article className="family-map-healing-card">
            <ul>
              {map.actionableHealingGuidance.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="family-map-section">
          <div className="section-title">
            {language === 'hi'
              ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.c582cd1f87")
              : language === 'gu'
                ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d9281b5512")
                : 'Premium family assets'}
          </div>
          <div className="family-map-theme-grid">
            {[
              {
                body:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f159e95c74")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.d3ac27c351")
                      : 'A polished two-profile life-area dossier, so the pair is explained through real-life outcomes instead of technical jargon.',
                cta: '/dashboard/report?focus=COMPATIBILITY&mode=PREMIUM',
                title:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.b2613f3e37")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.2d94979ef9")
                      : 'Pair Comparison Dossier',
              },
              {
                body:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.032906ad9f")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.49e6d8b711")
                      : 'A full-household report that keeps support anchors, pressure chains, and the dharma repair path in one premium view.',
                cta: '/dashboard/report?focus=KUNDLI&mode=PREMIUM',
                title:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.f66411c58b")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.a93c4cf295")
                      : 'Family Karma Map Report',
              },
              {
                body:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.8281f7fbf0")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.560f71a680")
                      : 'A clear healing guide for daily repair, boundaries, routine, and care-load sharing.',
                cta: '/dashboard/report?focus=REMEDIES&mode=PREMIUM',
                title:
                  language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.893ecd5d4d")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.49094d1a0c")
                      : 'Household Healing Guide',
              },
            ].map(asset => (
              <article className="family-map-theme-card" key={asset.title}>
                <span>{asset.title}</span>
                <strong>{hasPremiumAccess ? copy.premiumLabel : copy.premiumLocked}</strong>
                <p>{asset.body}</p>
                <Link className="button secondary" href={asset.cta}>
                  {language === 'hi'
                    ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.901879c422")
                    : language === 'gu'
                      ? getNativeCopy("native.apps.web.components.WebFamilyKarmaMap.tsx.e0185a82d6")
                      : 'Open'}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="action-row">
        <Link className="button" href={map.status === 'ready' ? askHref : '/dashboard/kundli'}>
          {copy.actions.askPredicta}
        </Link>
        <Link className="button secondary" href="/dashboard/family/compare">
          {copy.actions.pairComparison}
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
