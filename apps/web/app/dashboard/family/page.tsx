'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { FamilyRelationshipBadge } from '../../../components/FamilyRelationshipBadge';
import { useLanguagePreference } from '../../../lib/language-preference';
import { useWebKundliLibrary } from '../../../lib/use-web-kundli-library';

type FamilyPageCopy = {
  actions: {
    addProfile: string;
    goToLibrary: string;
    openCompare: string;
    openMap: string;
  };
  cards: {
    activeBody: (name?: string) => string;
    activeFallback: string;
    activeTitle: string;
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
  title: string;
};

const COPY: Record<SupportedLanguage, FamilyPageCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      goToLibrary: 'Go to Kundli Library',
      openCompare: 'Open Pair Comparison',
      openMap: 'Open Family Karma Map',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} is the active chart right now. Predicta uses that profile first when family analysis needs a personal anchor.`
          : 'Choose or save the owner profile first. Family analysis should never start without a real personal anchor.',
      activeFallback: 'No active profile',
      activeTitle: 'Active chart anchor',
      ownerTitle: 'Owner profile',
      readinessBody: count =>
        count >= 2
          ? 'Family Vault is ready for both pair comparison and a household karma map.'
          : 'Save at least two profiles in Kundli Library before expecting any real family comparison.',
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
    ],
    body:
      'Family Vault is no longer a generic holding page. It is the comparison layer built on top of your saved Kundli Library.',
    eyebrow: 'FAMILY VAULT',
    title: 'Compare the people around you without losing personal chart control.',
  },
  hi: {
    actions: {
      addProfile: 'प्रोफाइल जोड़ें',
      goToLibrary: 'कुंडली लाइब्रेरी पर जाएं',
      openCompare: 'जोड़ेदार तुलना खोलें',
      openMap: 'परिवार कर्म नक्शा खोलें',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} अभी सक्रिय चार्ट आधार है. जब परिवार विश्लेषण को व्यक्तिगत केंद्र चाहिए होता है, प्रेडिक्टा पहले इसी प्रोफाइल को पढ़ती है.`
          : 'पहले मालिक प्रोफाइल चुनें या सेव करें. वास्तविक व्यक्तिगत आधार के बिना परिवार विश्लेषण शुरू नहीं होना चाहिए.',
      activeFallback: 'कोई सक्रिय प्रोफाइल नहीं',
      activeTitle: 'सक्रिय चार्ट आधार',
      ownerTitle: 'मालिक प्रोफाइल',
      readinessBody: count =>
        count >= 2
          ? 'परिवार वॉल्ट अब जोड़ेदार तुलना और पूरे परिवार के कर्म नक्शे, दोनों के लिए तैयार है.'
          : 'वास्तविक पारिवारिक तुलना की अपेक्षा करने से पहले कुंडली लाइब्रेरी में कम से कम दो प्रोफाइल सेव करें.',
      readinessTitle: count =>
        count >= 2 ? `${count} सेव प्रोफाइल तैयार` : 'और सेव प्रोफाइल चाहिए',
    },
    experiences: [
      {
        body:
          'ठीक दो सेव प्रोफाइल चुनें. प्रेडिक्टा सहमति, घर्षण, कर्म, धर्म और व्यावहारिक अगला कदम बताएगी, बिना रीडिंग को तकनीकी भाषा में बदले.',
        cta: 'जोड़ेदार तुलना खोलें',
        href: '/dashboard/family/compare',
        title: 'जोड़ेदार तुलना',
      },
      {
        body:
          'परिवार का घेरा चुनें और प्रेडिक्टा से दोहराए गए भावनात्मक संकेत, सहारा केंद्र, दबाव श्रृंखला और सबसे अच्छा धर्म सुधार मार्ग देखें.',
        cta: 'परिवार कर्म नक्शा खोलें',
        href: '/dashboard/family/karma-map',
        title: 'परिवार कर्म नक्शा',
      },
    ],
    body:
      'परिवार वॉल्ट अब एक सामान्य होल्डिंग पेज नहीं है. यह आपकी सेव कुंडली लाइब्रेरी के ऊपर बनी तुलना परत है.',
    eyebrow: 'परिवार वॉल्ट',
    title: 'अपने आस-पास के लोगों की तुलना करें, बिना व्यक्तिगत चार्ट नियंत्रण खोए.',
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      goToLibrary: 'કુંડળી લાઇબ્રેરી પર જાઓ',
      openCompare: 'જોડી તુલના ખોલો',
      openMap: 'પરિવાર કર્મ નકશો ખોલો',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} હાલ સક્રિય ચાર્ટ એન્કર છે. જ્યારે પરિવાર વિશ્લેષણને વ્યક્તિગત આધાર જોઈએ ત્યારે પ્રેડિક્ટા પહેલા આ પ્રોફાઇલ વાંચે છે.`
          : 'પહેલાં માલિક પ્રોફાઇલ પસંદ કરો અથવા સાચવો. સાચા વ્યક્તિગત આધાર વિના પરિવાર વિશ્લેષણ શરૂ ન થવું જોઈએ.',
      activeFallback: 'કોઈ સક્રિય પ્રોફાઇલ નથી',
      activeTitle: 'સક્રિય ચાર્ટ આધાર',
      ownerTitle: 'માલિક પ્રોફાઇલ',
      readinessBody: count =>
        count >= 2
          ? 'પરિવાર વોલ્ટ હવે જોડી તુલના અને આખા પરિવારના કર્મ નકશા, બંને માટે તૈયાર છે.'
          : 'વાસ્તવિક પરિવાર તુલનાની અપેક્ષા કરતા પહેલાં કુંડળી લાઇબ્રેરીમાં ઓછામાં ઓછી બે પ્રોફાઇલ સાચવો.',
      readinessTitle: count =>
        count >= 2 ? `${count} સાચવેલી પ્રોફાઇલ તૈયાર` : 'વધુ સાચવેલી પ્રોફાઇલ જોઈએ',
    },
    experiences: [
      {
        body:
          'ચોક્કસ બે સાચવેલી પ્રોફાઇલ પસંદ કરો. પ્રેડિક્ટા સહકાર, ઘર્ષણ, કર્મ, ધર્મ અને આગળનું પ્રાયોગિક પગલું સમજાવશે, અને વાંચનને ટેકનિકલ ભાષામાં ફેરવશે નહીં.',
        cta: 'જોડી તુલના ખોલો',
        href: '/dashboard/family/compare',
        title: 'જોડી તુલના',
      },
      {
        body:
          'ઘરેલુ વર્તુળ પસંદ કરો અને પ્રેડિક્ટાથી ફરી આવતા ભાવનાત્મક સંકેતો, સહારો બિંદુઓ, દબાણની સાંકળો અને શ્રેષ્ઠ ધર્મ સુધાર માર્ગ જુઓ.',
        cta: 'પરિવાર કર્મ નકશો ખોલો',
        href: '/dashboard/family/karma-map',
        title: 'પરિવાર કર્મ નકશો',
      },
    ],
    body:
      'પરિવાર વોલ્ટ હવે કોઈ સામાન્ય હોલ્ડિંગ પેજ નથી. તે તમારી સાચવેલી કુંડળી લાઇબ્રેરી ઉપર બનેલી તુલનાની પરત છે.',
    eyebrow: 'પરિવાર વોલ્ટ',
    title: 'વ્યક્તિગત ચાર્ટ નિયંત્રણ ગુમાવ્યા વિના તમારા આસપાસના લોકોની તુલના કરો.',
  },
};

export default function FamilyPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const copy = COPY[language] ?? COPY.en;
  const profiles = activeKundli
    ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
    : savedKundlis;
  const ownerProfile =
    profiles.find(profile => profile.isOwnerProfile) ?? profiles[0];

  return (
    <section className="dashboard-page">
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
      </div>

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
    </section>
  );
}
