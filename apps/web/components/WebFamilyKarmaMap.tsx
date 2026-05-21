'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { composeFamilyKarmaMap } from '@pridicta/astrology';
import type { SupportedLanguage } from '@pridicta/types';
import type { FamilyRelationshipLabel } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { setActiveWebKundli } from '../lib/web-kundli-storage';

const relationshipLabels: FamilyRelationshipLabel[] = [
  'self',
  'partner',
  'parent',
  'sibling',
  'child',
  'grandparent',
  'relative',
  'friend',
  'other',
];

type FamilyMapCopy = {
  actions: {
    addProfile: string;
    askFamilyMap: string;
    askPredicta: string;
    reviewInLibrary: string;
    savedKundlis: string;
    useAsActive: string;
  };
  boundaryCards: Array<{ body: string; title: string }>;
  cards: Array<{ body: string; title: string }>;
  empty: {
    linkedProfiles: (count: number) => string;
    needProfiles: string;
    readyBody: string;
    waitingBody: string;
  };
  profile: {
    active: string;
    relationshipFor: (name: string) => string;
    saved: string;
    summary: (lagna: string, moonSign: string, nakshatra: string) => string;
  };
  subtitle: (count: number) => string;
  title: (count: number) => string;
  privacyEyebrow: string;
  privacyNote: string;
  workflow: Array<{ body: string; title: string }>;
};

const RELATIONSHIP_LABEL_COPY: Record<
  SupportedLanguage,
  Record<FamilyRelationshipLabel, string>
> = {
  en: {
    child: 'Child',
    friend: 'Friend',
    grandparent: 'Grandparent',
    other: 'Other',
    parent: 'Parent',
    partner: 'Partner',
    relative: 'Relative',
    self: 'Self',
    sibling: 'Sibling',
  },
  hi: {
    child: 'संतान',
    friend: 'मित्र',
    grandparent: 'दादा-दादी / नाना-नानी',
    other: 'अन्य',
    parent: 'माता-पिता',
    partner: 'जीवनसाथी',
    relative: 'रिश्तेदार',
    self: 'स्वयं',
    sibling: 'भाई-बहन',
  },
  gu: {
    child: 'સંતાન',
    friend: 'મિત્ર',
    grandparent: 'દાદા-દાદી / નાના-નાની',
    other: 'અન્ય',
    parent: 'માતા-પિતા',
    partner: 'જીવનસાથી',
    relative: 'સગા',
    self: 'પોતે',
    sibling: 'ભાઈ-બહેન',
  },
};

const FAMILY_MAP_COPY: Record<SupportedLanguage, FamilyMapCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      askFamilyMap: 'Ask Family Map',
      askPredicta: 'Ask Predicta',
      reviewInLibrary: 'Review in Library',
      savedKundlis: 'Saved Kundlis',
      useAsActive: 'Use as active',
    },
    boundaryCards: [
      {
        body:
          'Save, edit, and delete each person’s chart in Kundli Library first. Family Vault only reads those saved profiles for comparison.',
        title: 'Library first',
      },
      {
        body:
          'Relationship labels help comparison and can be changed any time. They do not rewrite stored birth details.',
        title: 'Comparison only',
      },
    ],
    cards: [
      {
        body:
          'Shared Moon, nakshatra, dasha, and ashtakavarga patterns become gentle family themes with evidence.',
        title: 'Repeated themes',
      },
      {
        body:
          'Stronger house overlaps become practical places for cooperation, rituals, routines, and repair.',
        title: 'Support zones',
      },
      {
        body:
          'Each pair gets emotional pattern, support pattern, and one non-blaming next step.',
        title: 'Relationship cards',
      },
    ],
    empty: {
      linkedProfiles: count => `${count} profiles linked`,
      needProfiles: 'Add two or more calculated profiles',
      readyBody:
        'Predicta is using your saved Kundlis to compare repeated themes and support zones without blame or fear labels.',
      waitingBody:
        'Family Karma Map needs saved Kundlis before it can compare real household patterns.',
    },
    privacyEyebrow: 'Privacy-first rule',
    privacyNote:
      'Use this map to notice repeated care patterns, not to label, blame, or frighten anyone in the family.',
    profile: {
      active: 'Active profile',
      relationshipFor: name => `Relationship for ${name}`,
      saved: 'Saved profile',
      summary: (lagna, moonSign, nakshatra) =>
        `${lagna} Lagna · ${moonSign} Moon · ${nakshatra}`,
    },
    subtitle: count =>
      count >= 2
        ? 'Compare saved Kundlis for repeated emotional patterns, support zones, and care guidance.'
        : 'Save two or more Kundlis to unlock household comparison with evidence and care-first language.',
    title: count =>
      count >= 2 ? `Family Karma Map for ${count} profiles` : 'Family Karma Map',
    workflow: [
      {
        body: 'Save each person’s Kundli once, then keep the charts separated.',
        title: 'Create family profiles',
      },
      {
        body: 'Predicta will answer from the selected person’s chart.',
        title: 'Choose the active profile',
      },
      {
        body: 'Ask about one profile or open the family map for shared themes.',
        title: 'Ask or compare',
      },
    ],
  },
  hi: {
    actions: {
      addProfile: 'प्रोफाइल जोड़ें',
      askFamilyMap: 'परिवार नक्शे से पूछें',
      askPredicta: 'प्रेडिक्टा से पूछें',
      reviewInLibrary: 'लाइब्रेरी में देखें',
      savedKundlis: 'सेव कुंडलियां',
      useAsActive: 'सक्रिय बनाएं',
    },
    boundaryCards: [
      {
        body:
          'हर व्यक्ति का चार्ट पहले कुंडली लाइब्रेरी में सेव, संपादित और हटाएं. परिवार वॉल्ट तुलना के लिए उन्हीं सेव प्रोफाइलों को पढ़ता है.',
        title: 'पहले लाइब्रेरी',
      },
      {
        body:
          'संबंध लेबल केवल तुलना के लिए हैं और कभी भी बदले जा सकते हैं. वे सेव जन्म विवरण नहीं बदलते.',
        title: 'सिर्फ तुलना',
      },
    ],
    cards: [
      {
        body:
          'साझा चंद्र, नक्षत्र, दशा और अष्टकवर्ग संकेत प्रमाण के साथ पारिवारिक थीम दिखाते हैं.',
        title: 'दोहराए गए संकेत',
      },
      {
        body:
          'मजबूत भाव मिलान सहयोग, दिनचर्या, संस्कार और सुधार के व्यावहारिक क्षेत्र बनते हैं.',
        title: 'सहारा क्षेत्र',
      },
      {
        body:
          'हर जोड़ी को भावनात्मक पैटर्न, सहारा पैटर्न और बिना दोष दिए अगला कदम मिलता है.',
        title: 'संबंध कार्ड',
      },
    ],
    empty: {
      linkedProfiles: count => `${count} प्रोफाइल जुड़ी हुई`,
      needProfiles: 'दो या अधिक गणना की हुई प्रोफाइल जोड़ें',
      readyBody:
        'प्रेडिक्टा आपकी सेव कुंडलियों से बिना डर या दोष के दोहराए गए संकेत और सहारा क्षेत्र देख रही है.',
      waitingBody:
        'परिवार कर्म नक्शा वास्तविक पारिवारिक पैटर्न देखने से पहले सेव कुंडलियां चाहता है.',
    },
    privacyEyebrow: 'निजता पहले',
    privacyNote:
      'इस नक्शे का उपयोग देखभाल के दोहराए पैटर्न देखने के लिए करें, किसी को दोष देने या डराने के लिए नहीं.',
    profile: {
      active: 'सक्रिय प्रोफाइल',
      relationshipFor: name => `${name} का रिश्ता`,
      saved: 'सेव प्रोफाइल',
      summary: (lagna, moonSign, nakshatra) =>
        `${lagna} लग्न · ${moonSign} चंद्र · ${nakshatra}`,
    },
    subtitle: count =>
      count >= 2
        ? 'सेव कुंडलियों में दोहराए भावनात्मक संकेत, सहारा क्षेत्र और देखभाल मार्गदर्शन देखें.'
        : 'प्रमाण और देखभाल-प्रथम भाषा के साथ पारिवारिक तुलना खोलने के लिए दो या अधिक कुंडलियां सेव करें.',
    title: count =>
      count >= 2 ? `${count} प्रोफाइल के लिए परिवार कर्म नक्शा` : 'परिवार कर्म नक्शा',
    workflow: [
      {
        body: 'हर व्यक्ति की कुंडली एक बार सेव करें, फिर चार्ट अलग रखें.',
        title: 'परिवार प्रोफाइल बनाएं',
      },
      {
        body: 'प्रेडिक्टा चुने हुए व्यक्ति के चार्ट से जवाब देगी.',
        title: 'सक्रिय प्रोफाइल चुनें',
      },
      {
        body: 'एक प्रोफाइल पर पूछें या साझा संकेतों के लिए परिवार नक्शा खोलें.',
        title: 'पूछें या तुलना करें',
      },
    ],
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      askFamilyMap: 'પરિવાર નકશાને પૂછો',
      askPredicta: 'પ્રેડિક્ટા ને પૂછો',
      reviewInLibrary: 'લાઇબ્રેરીમાં જુઓ',
      savedKundlis: 'સાચવેલી કુંડળીઓ',
      useAsActive: 'સક્રિય બનાવો',
    },
    boundaryCards: [
      {
        body:
          'દરેક વ્યક્તિનો ચાર્ટ પહેલા કુંડળી લાઇબ્રેરીમાં સાચવો, સંપાદિત કરો અને કાઢી નાખો. પરિવાર વોલ્ટ તુલના માટે એ જ સાચવેલી પ્રોફાઇલ વાંચે છે.',
        title: 'પહેલા લાઇબ્રેરી',
      },
      {
        body:
          'સંબંધ લેબલ ફક્ત તુલના માટે છે અને ક્યારે પણ બદલી શકાય છે. તે સાચવેલી જન્મ વિગતો બદલેતા નથી.',
        title: 'ફક્ત તુલના',
      },
    ],
    cards: [
      {
        body:
          'સાંઝા ચંદ્ર, નક્ષત્ર, દશા અને અષ્ટકવર્ગના સંકેતો પુરાવા સાથે પરિવારની થીમ બતાવે છે.',
        title: 'ફરી આવતા સંકેતો',
      },
      {
        body:
          'મજબૂત ભાવ-મેળ સહકાર, રીતભાત, રોજીનાં ધોરણો અને સુધારાના કામચલાઉ ક્ષેત્ર બનાવે છે.',
        title: 'સહારો ક્ષેત્ર',
      },
      {
        body:
          'દરેક જોડી માટે ભાવનાત્મક પેટર્ન, સહારો પેટર્ન અને દોષ વગરનું આગળનું એક પગલું મળે છે.',
        title: 'સંબંધ કાર્ડ',
      },
    ],
    empty: {
      linkedProfiles: count => `${count} પ્રોફાઇલ જોડાઈ`,
      needProfiles: 'બે અથવા વધુ ગણતરી કરેલી પ્રોફાઇલ ઉમેરો',
      readyBody:
        'પ્રેડિક્ટા તમારી સાચવેલી કુંડળીઓથી ડર કે દોષ વગર ફરી આવતા સંકેતો અને સહારો ક્ષેત્ર જુએ છે.',
      waitingBody:
        'પરિવાર કર્મ નકશાને સાચવેલી કુંડળીઓ જોઈએ, પછી જ તે સાચા ઘરેલુ પેટર્નની તુલના કરી શકે.',
    },
    privacyEyebrow: 'ખાનગીપણું પહેલા',
    privacyNote:
      'આ નકશો કાળજીના ફરી આવતા પેટર્ન જોવા માટે વાપરો, કોઈને લેબલ કરવા, દોષ આપવા કે ડરાવવા માટે નહીં.',
    profile: {
      active: 'સક્રિય પ્રોફાઇલ',
      relationshipFor: name => `${name} નો સંબંધ`,
      saved: 'સાચવેલી પ્રોફાઇલ',
      summary: (lagna, moonSign, nakshatra) =>
        `${lagna} લગ્ન · ${moonSign} ચંદ્ર · ${nakshatra}`,
    },
    subtitle: count =>
      count >= 2
        ? 'સાચવેલી કુંડળીઓમાં ફરી આવતા ભાવનાત્મક સંકેતો, સહારો ક્ષેત્ર અને કાળજી માર્ગદર્શન જુઓ.'
        : 'પુરાવા અને કાળજી-પ્રથમ ભાષા સાથે ઘરેલુ તુલના ખોલવા માટે બે અથવા વધુ કુંડળીઓ સાચવો.',
    title: count =>
      count >= 2 ? `${count} પ્રોફાઇલ માટે પરિવાર કર્મ નકશો` : 'પરિવાર કર્મ નકશો',
    workflow: [
      {
        body: 'દરેક વ્યક્તિની કુંડળી એક વાર સાચવો, પછી ચાર્ટ અલગ રાખો.',
        title: 'પરિવાર પ્રોફાઇલ બનાવો',
      },
      {
        body: 'પ્રેડિક્ટા પસંદ કરેલી વ્યક્તિના ચાર્ટ પરથી જવાબ આપશે.',
        title: 'સક્રિય પ્રોફાઇલ પસંદ કરો',
      },
      {
        body: 'એક પ્રોફાઇલ વિષે પૂછો અથવા શેર કરેલા સંકેતો માટે પરિવાર નકશો ખોલો.',
        title: 'પૂછો અથવા તુલના કરો',
      },
    ],
  },
};

export function WebFamilyKarmaMap(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const [relationships, setRelationships] = useState<
    Record<string, FamilyRelationshipLabel>
  >({});
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const copy = FAMILY_MAP_COPY[language] ?? FAMILY_MAP_COPY.en;
  const relationshipCopy =
    RELATIONSHIP_LABEL_COPY[language] ?? RELATIONSHIP_LABEL_COPY.en;
  const profiles = useMemo(() => {
    const activeFirst = activeKundli
      ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
      : savedKundlis;

    return activeFirst.slice(0, 8);
  }, [activeKundli, savedKundlis]);
  const map = useMemo(
    () =>
      composeFamilyKarmaMap(
        profiles.map((kundli, index) => ({
          kundli,
          relationship:
            relationships[kundli.id] ?? (index === 0 ? 'self' : 'relative'),
        })),
      ),
    [profiles, relationships],
  );
  const askMapHref = activeKundli
    ? buildPredictaChatHref({
        kundli: activeKundli,
        kundliId: activeKundli.id,
        prompt: map.askPrompt,
        purpose: 'family',
        school: 'PARASHARI',
        selectedFamilyKarmaMap: true,
        selectedFamilyMemberCount: map.members.length,
        selectedSection: map.askPrompt,
        sourceScreen: 'Family Karma Map',
      })
    : '/dashboard/kundli';
  const profileCount = profiles.length;

  function activateProfile(kundli: typeof profiles[number]): void {
    setActiveWebKundli(kundli);
  }

  return (
    <section className="family-karma-map glass-panel">
      <div className="family-header">
        <div>
          <div className="section-title">{copy.title(profileCount)}</div>
          <h2>{copy.title(profileCount)}</h2>
          <p>{copy.subtitle(profileCount)}</p>
        </div>
      </div>

      <div className="family-privacy-panel">
        <span>{copy.privacyEyebrow}</span>
        <p>{copy.privacyNote}</p>
      </div>

      <div className="family-boundary-grid">
        {copy.boundaryCards.map(card => (
          <div className="family-boundary-card" key={card.title}>
            <span>{card.title}</span>
            <p>{card.body}</p>
          </div>
        ))}
      </div>

      <div className="family-workflow-grid">
        {copy.workflow.map((item, index) => (
          <div className="family-workflow-card" key={item.title}>
            <span>{index + 1}</span>
            <strong>{item.title}</strong>
            <p>{item.body}</p>
          </div>
        ))}
      </div>

      {profiles.length ? (
        <div className="family-member-grid">
          {profiles.map((kundli, index) => (
            <div
              className={`family-member-slot${
                kundli.id === activeKundli?.id ? ' active' : ''
              }`}
              key={kundli.id}
            >
              <span>
                {kundli.id === activeKundli?.id
                  ? copy.profile.active
                  : copy.profile.saved}
              </span>
              <strong>{kundli.birthDetails.name}</strong>
              <p>{copy.profile.summary(kundli.lagna, kundli.moonSign, kundli.nakshatra)}</p>
              <select
                aria-label={copy.profile.relationshipFor(kundli.birthDetails.name)}
                onChange={event =>
                  setRelationships(current => ({
                    ...current,
                    [kundli.id]: event.target.value as FamilyRelationshipLabel,
                  }))
                }
                value={relationships[kundli.id] ?? (index === 0 ? 'self' : 'relative')}
              >
                {relationshipLabels.map(label => (
                  <option key={label} value={label}>
                    {relationshipCopy[label]}
                  </option>
                ))}
              </select>
              <div className="family-member-actions">
                {kundli.id !== activeKundli?.id ? (
                  <button
                    className="button secondary"
                    onClick={() => activateProfile(kundli)}
                    type="button"
                  >
                    {copy.actions.useAsActive}
                  </button>
                ) : null}
                <Link
                  className="button secondary"
                  href={buildPredictaChatHref({
                    kundli,
                    kundliId: kundli.id,
                    prompt: `Use ${kundli.birthDetails.name}'s saved Kundli as the active family profile and explain the best next family-focused reading for this profile.`,
                    purpose: 'family',
                    school: 'PARASHARI',
                    selectedSection: `Family profile: ${kundli.birthDetails.name}`,
                    sourceScreen: 'Family Profile',
                  })}
                  onClick={() => activateProfile(kundli)}
                >
                  {copy.actions.askPredicta}
                </Link>
                <Link
                  className="button secondary"
                  href={`/dashboard/kundli?focusKundliId=${encodeURIComponent(kundli.id)}`}
                  onClick={() => activateProfile(kundli)}
                >
                  {copy.actions.reviewInLibrary}
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="family-guidance-grid">
        {copy.cards.map(card => (
          <div className="family-guidance-card" key={card.title}>
            <span>{card.title}</span>
            <p>{card.body}</p>
          </div>
        ))}
      </div>

      <div className="family-empty">
        <h3>
          {profiles.length >= 2
            ? copy.empty.linkedProfiles(profiles.length)
            : copy.empty.needProfiles}
        </h3>
        <p>
          {profiles.length >= 2
            ? copy.empty.readyBody
            : copy.empty.waitingBody}
        </p>
        <div className="action-row">
          <Link className="button" href="/dashboard/kundli">
            {copy.actions.addProfile}
          </Link>
          <Link
            aria-disabled={map.status !== 'ready'}
            className="button secondary"
            href={map.status === 'ready' ? askMapHref : '/dashboard/kundli'}
          >
            {copy.actions.askFamilyMap}
          </Link>
          <Link className="button secondary" href="/dashboard/saved-kundlis">
            {copy.actions.savedKundlis}
          </Link>
        </div>
      </div>
    </section>
  );
}
