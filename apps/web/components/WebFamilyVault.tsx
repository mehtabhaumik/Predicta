'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { FamilyRelationshipLabel, SupportedLanguage } from '@pridicta/types';
import { FamilyRelationshipBadge } from './FamilyRelationshipBadge';
import { WebAuthRequired } from './WebAuthRequired';
import {
  FAMILY_RELATIONSHIP_ORDER,
  getFamilyRelationshipLabel,
} from '../lib/family-relationships';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { updateWebKundliFamilyRelationship } from '../lib/web-kundli-storage';
import { loadWebProductBankBalance } from '../lib/pridicta-ai';

type ProductBankBalance = Awaited<ReturnType<typeof loadWebProductBankBalance>>;

type FamilyPageCopy = {
  actions: {
    addProfile: string;
    goToLibrary: string;
    openMatchmaking: string;
    openCompare: string;
    openMap: string;
  };
  assignAria: (name: string) => string;
  auth: {
    body: string;
    title: string;
  };
  bank: {
    balance: (aiCredits: number, reportCredits: number) => string;
    body: string;
    checking: string;
    title: string;
  };
  cards: {
    activeBody: (name?: string) => string;
    activeFallback: string;
    activeTitle: string;
    assignmentBody: string;
    assignmentTitle: string;
    ownerTitle: string;
    readinessBody: (count: number) => string;
    readinessTitle: (count: number) => string;
  };
  experiences: Array<{
    body: string;
    cta: string;
    href: string;
    title: string;
  }>;
  body: string;
  eyebrow: string;
  profileSummary: (lagna: string, moonSign: string, nakshatra: string) => string;
  title: string;
};

const COPY: Record<SupportedLanguage, FamilyPageCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      goToLibrary: 'Go to My Kundlis',
      openMatchmaking: 'Open Matchmaking',
      openCompare: 'Open Pair Comparison',
      openMap: 'Open Family Karma Map',
    },
    assignAria: name => `Assign ${name} in Family Vault`,
    auth: {
      body:
        'Sign in before opening Family Vault so saved Kundlis, relationships, and comparisons stay tied to your private account.',
      title: 'Sign in to use Family Vault.',
    },
    bank: {
      balance: (aiCredits, reportCredits) =>
        `${aiCredits} AI · ${reportCredits} reports`,
      body:
        'Sharing is owner opt-in and reversible. Family Bank credits can be used by linked members, but private chats, reports, and personal history are never exposed.',
      checking: 'Checking',
      title: 'Family Bank',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} is the active chart right now. Predicta uses that profile first when family analysis needs a personal anchor.`
          : 'Choose or save the owner profile first. Family analysis should never start without a real personal anchor.',
      activeFallback: 'No active profile',
      activeTitle: 'Active chart anchor',
      assignmentBody:
        'Assign saved Kundlis to family roles here. Family Vault uses these labels for comparison context, while My Kundlis remains the source of truth.',
      assignmentTitle: 'Assign saved Kundlis',
      ownerTitle: 'Owner profile',
      readinessBody: count =>
        count >= 2
          ? 'Family Vault is ready for both pair comparison and a household karma map.'
          : 'Save at least two profiles in My Kundlis before expecting any real family comparison.',
      readinessTitle: count =>
        count >= 2 ? `${count} saved profiles ready` : 'Needs more saved profiles',
    },
    experiences: [
      {
        body:
          'Select exactly two saved profiles. Predicta explains harmony, friction, karma, dharma, and practical next steps without turning the reading into technical jargon.',
        cta: 'Open Pair Comparison',
        href: '/dashboard/family/compare',
        title: 'Pair Comparison',
      },
      {
        body:
          'Select the household circle and let Predicta map repeated emotional patterns, support anchors, pressure chains, and the best dharma repair path.',
        cta: 'Open Family Karma Map',
        href: '/dashboard/family/karma-map',
        title: 'Family Karma Map',
      },
      {
        body:
          'Marriage evaluation stays separate from Family Vault. Use one boy Kundli and one girl Kundli for a dedicated Vedic matchmaking score and a practical reading.',
        cta: 'Open Matchmaking',
        href: '/dashboard/matchmaking',
        title: 'Matchmaking',
      },
    ],
    body:
      'Family Vault is no longer a generic holding page. It is the comparison layer built on top of My Kundlis.',
    eyebrow: 'FAMILY VAULT',
    profileSummary: (lagna, moonSign, nakshatra) =>
      `${lagna} Lagna · ${moonSign} Moon · ${nakshatra}`,
    title: 'Compare the people around you without losing personal chart control.',
  },
  hi: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.8451479867"),
      goToLibrary: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.560ebadcf0"),
      openMatchmaking: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.b38135169e"),
      openCompare: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.4683953b3a"),
      openMap: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.17008848e9"),
    },
    assignAria: name =>
      formatNativeCopy('native.apps.web.components.WebFamilyVault.assignAria.hi', [name]),
    auth: {
      body: getNativeCopy('native.apps.web.components.WebFamilyVault.authBody.hi'),
      title: getNativeCopy('native.apps.web.components.WebFamilyVault.authTitle.hi'),
    },
    bank: {
      balance: (aiCredits, reportCredits) =>
        formatNativeCopy('native.apps.web.components.WebFamilyVault.bankBalance.hi', [
          aiCredits,
          reportCredits,
        ]),
      body: getNativeCopy('native.apps.web.components.WebFamilyVault.bankBody.hi'),
      checking: getNativeCopy('native.apps.web.components.WebFamilyVault.bankChecking.hi'),
      title: getNativeCopy('native.apps.web.components.WebFamilyVault.bankTitle.hi'),
    },
    cards: {
      activeBody: name =>
        name
          ? formatNativeCopy("native.apps.web.app.dashboard.family.page.tsx.0021b4f4ea", [name])
          : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.7d8715d39b"),
      activeFallback: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.24d07545aa"),
      activeTitle: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.c809fd9d22"),
      assignmentBody:
        getNativeCopy('native.apps.web.components.WebFamilyVault.assignmentBody.hi'),
      assignmentTitle: getNativeCopy('native.apps.web.components.WebFamilyVault.assignmentTitle.hi'),
      ownerTitle: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.af78e01243"),
      readinessBody: count =>
        count >= 2
          ? getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.252dc54c13")
          : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.adb8fcfbcc"),
      readinessTitle: count =>
        count >= 2 ? formatNativeCopy("native.apps.web.app.dashboard.family.page.tsx.337fb30706", [count]) : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.ecafcbc76b"),
    },
    experiences: [
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.cd1c7c447a"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.4683953b3a"),
        href: '/dashboard/family/compare',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.458bfa4431"),
      },
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.bd3f94c146"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.17008848e9"),
        href: '/dashboard/family/karma-map',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.541b1bf91a"),
      },
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.d4f4dea5f7"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.b38135169e"),
        href: '/dashboard/matchmaking',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.1952f57972"),
      },
    ],
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.7a4ad9c67b"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.dc49ce1d21"),
    profileSummary: (lagna, moonSign, nakshatra) =>
      formatNativeCopy('native.apps.web.components.WebFamilyVault.profileSummary.hi', [
        lagna,
        moonSign,
        nakshatra,
      ]),
    title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.a745d846fb"),
  },
  gu: {
    actions: {
      addProfile: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.9b55a692c0"),
      goToLibrary: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.3db33c18ca"),
      openMatchmaking: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.bdbcedc1d8"),
      openCompare: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.810299ef1b"),
      openMap: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.05de9e0d3e"),
    },
    assignAria: name =>
      formatNativeCopy('native.apps.web.components.WebFamilyVault.assignAria.gu', [name]),
    auth: {
      body: getNativeCopy('native.apps.web.components.WebFamilyVault.authBody.gu'),
      title: getNativeCopy('native.apps.web.components.WebFamilyVault.authTitle.gu'),
    },
    bank: {
      balance: (aiCredits, reportCredits) =>
        formatNativeCopy('native.apps.web.components.WebFamilyVault.bankBalance.gu', [
          aiCredits,
          reportCredits,
        ]),
      body: getNativeCopy('native.apps.web.components.WebFamilyVault.bankBody.gu'),
      checking: getNativeCopy('native.apps.web.components.WebFamilyVault.bankChecking.gu'),
      title: getNativeCopy('native.apps.web.components.WebFamilyVault.bankTitle.gu'),
    },
    cards: {
      activeBody: name =>
        name
          ? formatNativeCopy("native.apps.web.app.dashboard.family.page.tsx.dcf5d6aedb", [name])
          : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.884b3a9c1c"),
      activeFallback: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.578e662d71"),
      activeTitle: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.07225d277e"),
      assignmentBody:
        getNativeCopy('native.apps.web.components.WebFamilyVault.assignmentBody.gu'),
      assignmentTitle: getNativeCopy('native.apps.web.components.WebFamilyVault.assignmentTitle.gu'),
      ownerTitle: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.531c54665d"),
      readinessBody: count =>
        count >= 2
          ? getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.13206c0c29")
          : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.fb9fcd3b7e"),
      readinessTitle: count =>
        count >= 2 ? formatNativeCopy("native.apps.web.app.dashboard.family.page.tsx.8473ea6b35", [count]) : getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.ac1a3687d1"),
    },
    experiences: [
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.69efade335"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.810299ef1b"),
        href: '/dashboard/family/compare',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.24cb3a63db"),
      },
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.568c6211d8"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.05de9e0d3e"),
        href: '/dashboard/family/karma-map',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.f42a117fe6"),
      },
      {
        body:
          getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.7b7a30b3e5"),
        cta: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.bdbcedc1d8"),
        href: '/dashboard/matchmaking',
        title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.a2ef635763"),
      },
    ],
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.bf82673cb5"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.dde3029f16"),
    profileSummary: (lagna, moonSign, nakshatra) =>
      formatNativeCopy('native.apps.web.components.WebFamilyVault.profileSummary.gu', [
        lagna,
        moonSign,
        nakshatra,
      ]),
    title: getNativeCopy("native.apps.web.app.dashboard.family.page.tsx.f39673ca1e"),
  },
};

export function WebFamilyVault(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [productBank, setProductBank] = useState<ProductBankBalance>();
  const copy = COPY[language] ?? COPY.en;
  const profiles = activeKundli
    ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
    : savedKundlis;
  const ownerProfile =
    profiles.find(profile => profile.isOwnerProfile) ?? profiles[0];

  useEffect(() => {
    void loadWebProductBankBalance().then(setProductBank);
  }, []);

  function assignRelationship(
    kundliId: string,
    relationship: FamilyRelationshipLabel,
  ): void {
    updateWebKundliFamilyRelationship(kundliId, relationship);
  }

  return (
    <section className="dashboard-page">
      <WebAuthRequired
        body={copy.auth.body}
        title={copy.auth.title}
      >
        <div className="page-heading compact family-page-heading">
          <div>
            <div className="section-title">{copy.eyebrow}</div>
            <h1 className="gradient-text">{copy.title}</h1>
            <p>{copy.body}</p>
          </div>
          <div className="action-row compact">
            <Link className="button secondary" href="/dashboard/saved-kundlis">
              {copy.actions.goToLibrary}
            </Link>
            <Link className="button" href="/dashboard/kundli">
              {copy.actions.addProfile}
            </Link>
          </div>
        </div>

        <div className="family-overview-grid" aria-label={copy.eyebrow}>
          <div className="family-overview-card">
            <span>{copy.cards.activeTitle}</span>
            <strong>{activeKundli?.birthDetails.name ?? copy.cards.activeFallback}</strong>
            <p>{copy.cards.activeBody(activeKundli?.birthDetails.name)}</p>
          </div>
          <div className="family-overview-card">
            <span>{copy.cards.ownerTitle}</span>
            <strong>{ownerProfile?.birthDetails.name ?? copy.cards.activeFallback}</strong>
            <p>
              {ownerProfile ? (
                <FamilyRelationshipBadge
                  language={language}
                  relationship={ownerProfile.relationshipToOwner ?? 'self'}
                />
              ) : (
                copy.cards.activeBody(undefined)
              )}
            </p>
          </div>
          <div className="family-overview-card">
            <span>{copy.cards.readinessTitle(profiles.length)}</span>
            <strong>{profiles.length}</strong>
            <p>{copy.cards.readinessBody(profiles.length)}</p>
          </div>
          <div className="family-overview-card">
            <span>{copy.bank.title}</span>
            <strong>
              {productBank
                ? copy.bank.balance(
                    productBank.familyQuestionCredits,
                    productBank.familyReportCredits,
                  )
                : copy.bank.checking}
            </strong>
            <p>{copy.bank.body}</p>
          </div>
        </div>

        <section className="glass-panel settings-card">
          <div className="card-content spacious">
            <div className="section-title">{copy.cards.assignmentTitle}</div>
            <h2>{copy.cards.assignmentTitle}</h2>
            <p>{copy.cards.assignmentBody}</p>
            <div className="settings-stack">
              {profiles.map(profile => (
                <label className="setting-row" key={profile.id}>
                  <div>
                    <strong>{profile.birthDetails.name}</strong>
                    <span>{copy.profileSummary(profile.lagna, profile.moonSign, profile.nakshatra)}</span>
                  </div>
                  <select
                    aria-label={copy.assignAria(profile.birthDetails.name)}
                    className="form-select"
                    disabled={profile.isOwnerProfile}
                    onChange={event =>
                      assignRelationship(
                        profile.id,
                        event.target.value as FamilyRelationshipLabel,
                      )
                    }
                    value={profile.relationshipToOwner ?? 'other'}
                  >
                    {FAMILY_RELATIONSHIP_ORDER.map(relationship => (
                      <option key={relationship} value={relationship}>
                        {getFamilyRelationshipLabel(relationship, language)}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="family-experience-grid">
          {copy.experiences.map(card => (
            <article className="family-experience-tile" key={card.title}>
              <span>{card.title}</span>
              <strong>{card.title}</strong>
              <p>{card.body}</p>
              <div className="action-row compact">
                <Link className="button" href={card.href}>
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </WebAuthRequired>
    </section>
  );
}
