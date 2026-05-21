'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { composeFamilyKarmaMap } from '@pridicta/astrology';
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
          'Family Karma Map compares saved profiles only. Birth details still live in Kundli Library, where edit and deletion stay personal.',
        title: 'Library stays primary',
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
      addProfile: 'प्रोफाइल जोड़ें',
      askPredicta: 'प्रेडिक्टा से पूछें',
      pairComparison: 'जोड़ेदार तुलना खोलें',
      savedKundlis: 'सेव कुंडलियां',
      useAsActive: 'सक्रिय बनाएं',
    },
    boundaryCards: [
      {
        body:
          'परिवार कर्म नक्शा केवल सेव प्रोफाइलों की तुलना करता है. जन्म विवरण अभी भी कुंडली लाइब्रेरी में रहते हैं, जहां संपादन और हटाना व्यक्तिगत रहता है.',
        title: 'लाइब्रेरी ही मुख्य है',
      },
      {
        body:
          'यह नक्शा देखभाल, कर्तव्य और पारिवारिक सुधार के लिए है. यह किसी एक व्यक्ति को परिवार की समस्या कहने की अनुमति नहीं है.',
        title: 'दोष नहीं देना',
      },
    ],
    helper:
      'कम से कम दो सेव प्रोफाइल चुनें. प्रेडिक्टा पूरे परिवार में दोहराए संकेत, सहारा केंद्र और दबाव श्रृंखला देखेगी.',
    includeLabel: 'शामिल करें',
    includedLabel: 'शामिल',
    matrix: {
      title: 'घर का प्रभाव मैट्रिक्स',
    },
    pendingLabel: 'प्रतीक्षा में',
    premiumLabel: 'प्रीमियम पारिवारिक गहराई',
    premiumLocked:
      'प्रीमियम परिवार रीडिंग जोड़ी-प्रभाव, देखभाल का भार, अधिकार पैटर्न, धन का तनाव और जीवन-क्षेत्र आधारित सुधार मार्गदर्शन तक जाती है.',
    readyBody:
      'यह बड़े परिवार की परत है. प्रेडिक्टा देखती है कि सेव चार्ट एक-दूसरे को कहां सहारा, थकान, शांति या ट्रिगर देते हैं.',
    readyTitle: 'अपना पारिवारिक घेरा चुनें',
    selectors: {
      max: count => `एक साथ अधिकतम ${count} प्रोफाइल नक्शे में आ सकती हैं.`,
      min: 'नक्शा खोलने के लिए कम से कम दो प्रोफाइल चुनें.',
    },
    subtitle:
      'देखें कि कर्म, धर्म, समय और भावनात्मक संकेत पूरे परिवार में कैसे दोहराते हैं.',
    summary: {
      friction: 'सबसे अधिक घर्षण वाली जोड़ी',
      household: 'परिवार का सार',
      karma: 'दोहराया गया कर्म संकेत',
      support: 'सबसे मजबूत सहारा जोड़ी',
    },
    themesTitle: 'दोहराए गए पारिवारिक संकेत',
    title: 'परिवार कर्म नक्शा',
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      askPredicta: 'પ્રેડિક્ટા ને પૂછો',
      pairComparison: 'જોડી તુલના ખોલો',
      savedKundlis: 'સાચવેલી કુંડળીઓ',
      useAsActive: 'સક્રિય બનાવો',
    },
    boundaryCards: [
      {
        body:
          'પરિવાર કર્મ નકશો ફક્ત સાચવેલી પ્રોફાઇલની તુલના કરે છે. જન્મ વિગતો હજુ પણ કુંડળી લાઇબ્રેરીમાં જ રહે છે, જ્યાં સંપાદન અને કાઢી નાખવું વ્યક્તિગત રહે છે.',
        title: 'લાઇબ્રેરી જ મુખ્ય છે',
      },
      {
        body:
          'આ નકશો કાળજી, ફરજ અને ઘરેલુ સુધાર માટે છે. તે કોઈ એક વ્યક્તિને પરિવારની સમસ્યા ગણાવવાની પરવાનગી નથી.',
        title: 'દોષ નહીં',
      },
    ],
    helper:
      'ઓછામાં ઓછા બે સાચવેલા પ્રોફાઇલ પસંદ કરો. પ્રેડિક્ટા આખા ઘરમાં ફરી આવતા સંકેતો, સહારો બિંદુઓ અને દબાણની સાંકળો જોશે.',
    includeLabel: 'સમાવેશ કરો',
    includedLabel: 'સમાવેશિત',
    matrix: {
      title: 'ઘરનું અસર મેટ્રિક્સ',
    },
    pendingLabel: 'બાકી',
    premiumLabel: 'પ્રીમિયમ પરિવાર ઊંડાણ',
    premiumLocked:
      'પ્રીમિયમ પરિવાર વાંચન જોડી-અસર, કાળજીનો ભાર, સત્તા પેટર્ન, પૈસાનો તાણ અને જીવન ક્ષેત્ર આધારિત સુધાર માર્ગદર્શન સુધી જાય છે.',
    readyBody:
      'આ મોટા ઘરેલુ સ્તરની પરત છે. પ્રેડિક્ટા જુએ છે કે સાચવેલા ચાર્ટ એકબીજાને ક્યાં સહારો, થાક, શાંતિ કે ટ્રિગર આપે છે.',
    readyTitle: 'તમારો પરિવારવર્તુળ પસંદ કરો',
    selectors: {
      max: count => `એક સાથે મહત્તમ ${count} પ્રોફાઇલ નકશામાં આવી શકે છે.`,
      min: 'નકશો ખોલવા માટે ઓછામાં ઓછા બે પ્રોફાઇલ પસંદ કરો.',
    },
    subtitle:
      'કર્મ, ધર્મ, સમય અને ભાવનાત્મક સંકેતો આખા ઘરમાં કેવી રીતે ફરી આવે છે તે જુઓ.',
    summary: {
      friction: 'સૌથી વધુ ઘર્ષણ ધરાવતી જોડી',
      household: 'ઘરનું સાર',
      karma: 'ફરી આવતો કર્મ સંકેત',
      support: 'સૌથી મજબૂત સહારો જોડી',
    },
    themesTitle: 'ફરી આવતા ઘરેલુ સંકેતો',
    title: 'પરિવાર કર્મ નકશો',
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

    return activeFirst.filter(item => item.familyVaultEligible !== false).slice(0, 8);
  }, [activeKundli, savedKundlis]);
  const initialSelectedIds = useMemo(
    () => profiles.slice(0, Math.min(3, profiles.length)).map(profile => profile.id),
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
      if (stillValid.length >= 2) {
        return stillValid;
      }
      return profiles.slice(0, Math.min(3, profiles.length)).map(profile => profile.id);
    });
  }, [profiles]);

  const selectedProfiles = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    const chosen = profiles.filter(profile => selectedSet.has(profile.id));
    return chosen.slice(0, profiles.length);
  }, [profiles, selectedIds]);

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
    map.status === 'ready' && activeKundli
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
        if (current.length <= 2) {
          return current;
        }
        return current.filter(id => id !== profile.id);
      }

      if (current.length >= profiles.length) {
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
            ? copy.selectors.max(profiles.length)
            : copy.selectors.min}
        </strong>
        <span>{selectedProfiles.map(profile => profile.birthDetails.name).join(' · ')}</span>
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
              ? 'घर का भावनात्मक वातावरण'
              : language === 'gu'
                ? 'ઘરનું ભાવનાત્મક વાતાવરણ'
                : 'Household emotional climate'}
          </span>
          <strong>{map.householdEmotionalClimate}</strong>
          <p>{map.communicationFractureMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? 'अधिकार और निर्भरता'
              : language === 'gu'
                ? 'સત્તા અને નિર્ભરતા'
                : 'Authority and dependency'}
          </span>
          <strong>{map.authorityDependencyPattern}</strong>
          <p>{map.caregivingBurdenMap}</p>
        </article>
        <article className="family-map-premium-card">
          <span>
            {language === 'hi'
              ? 'दिनचर्या, विधि और धन दबाव'
              : language === 'gu'
                ? 'દિનચર્યા, વિધિ અને પૈસા દબાણ'
                : 'Routine, ritual, and money stress'}
          </span>
          <strong>{map.ritualRoutineMoneyStressMap}</strong>
          <p>{map.dharmaRepairPath ?? map.subtitle}</p>
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
              ? 'उपचार और सुधार दिशा'
              : language === 'gu'
                ? 'ઉપચાર અને સુધાર દિશા'
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
