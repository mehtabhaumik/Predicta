'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { WebFamilyKarmaMap } from '../../../components/WebFamilyKarmaMap';
import { useLanguagePreference } from '../../../lib/language-preference';
import { useWebKundliLibrary } from '../../../lib/use-web-kundli-library';

type FamilyPageCopy = {
  actions: {
    addProfile: string;
    goToLibrary: string;
  };
  cards: {
    activeBody: (name?: string) => string;
    activeFallback: string;
    activeTitle: string;
    privacyBody: string;
    privacyTitle: string;
    readinessBody: (count: number) => string;
    readinessTitle: (count: number) => string;
  };
  body: string;
  eyebrow: string;
  title: string;
};

const FAMILY_PAGE_COPY: Record<SupportedLanguage, FamilyPageCopy> = {
  en: {
    actions: {
      addProfile: 'Add Profile',
      goToLibrary: 'Go to Kundli Library',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} is the current personal profile. Family Vault reads that profile first when you open comparison or ask Predicta from here.`
          : 'Choose or save a personal profile in Kundli Library before using Family Vault.',
      activeFallback: 'No active profile',
      activeTitle: 'Active personal profile',
      privacyBody:
        'Family Vault compares saved profiles from your library. Relationship labels help comparison only and do not rewrite birth details.',
      privacyTitle: 'Data boundary',
      readinessBody: count =>
        count >= 2
          ? 'Enough saved profiles are available for real household comparison.'
          : 'Save at least two profiles in Kundli Library before expecting family comparison.',
      readinessTitle: count =>
        count >= 2 ? `${count} profiles ready` : 'Needs more saved profiles',
    },
    body:
      'Family Vault is the careful comparison layer. Keep personal edits and deletion in Kundli Library, then use this space for shared patterns, support zones, and household guidance.',
    eyebrow: 'FAMILY VAULT',
    title: 'Family comparison starts from saved profiles.',
  },
  hi: {
    actions: {
      addProfile: 'प्रोफाइल जोड़ें',
      goToLibrary: 'कुंडली लाइब्रेरी पर जाएं',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} अभी सक्रिय व्यक्तिगत प्रोफाइल है. यहां से तुलना खोलने या प्रेडिक्टा से पूछने पर परिवार वॉल्ट पहले इसी प्रोफाइल को पढ़ेगा.`
          : 'परिवार वॉल्ट इस्तेमाल करने से पहले कुंडली लाइब्रेरी में व्यक्तिगत प्रोफाइल चुनें या सेव करें.',
      activeFallback: 'कोई सक्रिय प्रोफाइल नहीं',
      activeTitle: 'सक्रिय व्यक्तिगत प्रोफाइल',
      privacyBody:
        'परिवार वॉल्ट आपकी लाइब्रेरी की सेव प्रोफाइलों की तुलना करता है. संबंध लेबल केवल तुलना के लिए हैं, जन्म विवरण बदलने के लिए नहीं.',
      privacyTitle: 'डेटा सीमा',
      readinessBody: count =>
        count >= 2
          ? 'वास्तविक पारिवारिक तुलना के लिए पर्याप्त सेव प्रोफाइल उपलब्ध हैं.'
          : 'पारिवारिक तुलना की अपेक्षा करने से पहले कुंडली लाइब्रेरी में कम से कम दो प्रोफाइल सेव करें.',
      readinessTitle: count =>
        count >= 2 ? `${count} प्रोफाइल तैयार` : 'और सेव प्रोफाइल चाहिए',
    },
    body:
      'परिवार वॉल्ट सावधानी से तुलना करने की परत है. व्यक्तिगत संपादन और हटाना कुंडली लाइब्रेरी में रखें, फिर इस जगह का उपयोग साझा संकेत, सहारा क्षेत्र और पारिवारिक मार्गदर्शन के लिए करें.',
    eyebrow: 'परिवार वॉल्ट',
    title: 'पारिवारिक तुलना सेव प्रोफाइलों से शुरू होती है.',
  },
  gu: {
    actions: {
      addProfile: 'પ્રોફાઇલ ઉમેરો',
      goToLibrary: 'કુંડળી લાઇબ્રેરી પર જાઓ',
    },
    cards: {
      activeBody: name =>
        name
          ? `${name} હાલ સક્રિય વ્યક્તિગત પ્રોફાઇલ છે. અહીંથી તુલના ખોલો અથવા પ્રેડિક્ટા ને પૂછો ત્યારે પરિવાર વોલ્ટ પહેલા આ જ પ્રોફાઇલ વાંચશે.`
          : 'પરિવાર વોલ્ટ વાપરતા પહેલાં કુંડળી લાઇબ્રેરીમાં વ્યક્તિગત પ્રોફાઇલ પસંદ કરો અથવા સાચવો.',
      activeFallback: 'હજુ કોઈ સક્રિય પ્રોફાઇલ નથી',
      activeTitle: 'સક્રિય વ્યક્તિગત પ્રોફાઇલ',
      privacyBody:
        'પરિવાર વોલ્ટ તમારી લાઇબ્રેરીની સાચવેલી પ્રોફાઇલની તુલના કરે છે. સંબંધ લેબલ ફક્ત તુલના માટે છે, જન્મ વિગતો બદલવા માટે નથી.',
      privacyTitle: 'ડેટા સીમા',
      readinessBody: count =>
        count >= 2
          ? 'વાસ્તવિક ઘરેલુ તુલના માટે પૂરતી સાચવેલી પ્રોફાઇલ ઉપલબ્ધ છે.'
          : 'પરિવાર તુલનાની અપેક્ષા કરતા પહેલાં કુંડળી લાઇબ્રેરીમાં ઓછામાં ઓછી બે પ્રોફાઇલ સાચવો.',
      readinessTitle: count =>
        count >= 2 ? `${count} પ્રોફાઇલ તૈયાર` : 'વધુ સાચવેલી પ્રોફાઇલ જોઈએ',
    },
    body:
      'પરિવાર વોલ્ટ સાવચેતીભરી તુલનાની પરત છે. વ્યક્તિગત સંપાદન અને કાઢી નાખવું કુંડળી લાઇબ્રેરીમાં રાખો, પછી આ જગ્યા શેર કરેલા સંકેતો, સહારો ક્ષેત્ર અને ઘરેલુ માર્ગદર્શન માટે વાપરો.',
    eyebrow: 'પરિવાર વોલ્ટ',
    title: 'પરિવાર તુલના સાચવેલી પ્રોફાઇલથી શરૂ થાય છે.',
  },
};

export default function FamilyPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const copy = FAMILY_PAGE_COPY[language] ?? FAMILY_PAGE_COPY.en;
  const profileCount = activeKundli
    ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)].length
    : savedKundlis.length;

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
          <span>{copy.cards.readinessTitle(profileCount)}</span>
          <strong>{profileCount}</strong>
          <p>{copy.cards.readinessBody(profileCount)}</p>
        </div>
        <div className="family-overview-card">
          <span>{copy.cards.privacyTitle}</span>
          <strong>{copy.eyebrow}</strong>
          <p>{copy.cards.privacyBody}</p>
        </div>
      </div>

      <WebFamilyKarmaMap />
    </section>
  );
}
