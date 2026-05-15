'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import {
  deleteWebKundli,
  loadWebKundli,
  loadWebKundlis,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { Card } from './Card';

export function WebSavedKundlis(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const labels = KUNDLI_LIBRARY_COPY[language] ?? KUNDLI_LIBRARY_COPY.en;
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);

  useEffect(() => {
    setKundli(loadWebKundli());
    setSavedKundlis(loadWebKundlis());
  }, []);
  const profiles = useMemo(() => {
    if (!kundli) {
      return savedKundlis;
    }

    return [kundli, ...savedKundlis.filter(record => record.id !== kundli.id)];
  }, [kundli, savedKundlis]);

  function activateProfile(record: KundliData): void {
    setActiveWebKundli(record);
    setKundli(record);
    setSavedKundlis(loadWebKundlis());
  }

  function deleteProfile(record: KundliData): void {
    const confirmed = window.confirm(
      [
        labels.deleteConfirmTitle(record.birthDetails.name),
        '',
        labels.deleteConfirmBody,
      ].join('\n'),
    );

    if (!confirmed) {
      return;
    }

    const nextStore = deleteWebKundli(record.id);
    setKundli(nextStore.activeKundli);
    setSavedKundlis(nextStore.savedKundlis);
  }

  const askPredictaToCreateHref = buildPredictaChatHref({
    prompt:
      'Create a new Kundli for me. Ask only for the missing birth details and confirm them before calculation.',
    sourceScreen: 'Kundli Library',
  });

  if (!kundli && profiles.length === 0) {
    return (
      <>
        <LibraryPageHeading labels={labels} />
        <LibraryHeader askPredictaHref={askPredictaToCreateHref} labels={labels} />
        <div className="saved-kundli-grid">
          <Card className="glass-panel">
            <div className="card-content spacious">
              <div className="section-title">{labels.libraryEyebrow}</div>
              <h2>{labels.emptyTitle}</h2>
              <p>{labels.emptyBody}</p>
            </div>
          </Card>
          <FamilyVaultCard labels={labels} />
        </div>
      </>
    );
  }

  return (
    <>
      <LibraryPageHeading labels={labels} />
      <LibraryHeader askPredictaHref={askPredictaToCreateHref} labels={labels} />
      <div className="saved-kundli-grid">
        {profiles.map(record => {
          const active = record.id === kundli?.id;

          return (
            <Card className={active ? 'glass-panel' : ''} key={record.id}>
              <div className="card-content spacious">
                <div className="section-title">
                  {active ? labels.activeKundli : labels.savedKundli}
                </div>
                <h2>{record.birthDetails.name}</h2>
                <p>
                  {record.birthDetails.place} · {labels.risingSign}{' '}
                  {record.lagna} · {labels.birthStar} {record.nakshatra}
                </p>
                {record.editHistory?.length ? (
                  <p className="quiet-line">
                    {labels.editHistory(
                      record.editHistory.length,
                      record.editHistory[0]?.fieldsChanged ?? [],
                    )}
                  </p>
                ) : null}
                <div className="action-row">
                  <Link
                    className="button secondary"
                    href="/dashboard/kundli"
                    onClick={() => activateProfile(record)}
                  >
                    {labels.open}
                  </Link>
                  {!active ? (
                    <button
                      className="button secondary"
                      onClick={() => {
                        activateProfile(record);
                      }}
                      type="button"
                    >
                      {labels.setActive}
                    </button>
                  ) : null}
                  <Link
                    className="button secondary"
                    href={buildPredictaChatHref({
                      kundli: record,
                      kundliId: record.id,
                      prompt: `Use ${record.birthDetails.name}'s saved Kundli and tell me the most useful next reading.`,
                      purpose: 'family',
                      selectedSection: `Saved profile: ${record.birthDetails.name}`,
                      sourceScreen: 'Kundli Library',
                    })}
                    onClick={() => activateProfile(record)}
                  >
                    {labels.askPredicta}
                  </Link>
                  <Link
                    className="button secondary"
                    href={`/dashboard/kundli?editKundliId=${encodeURIComponent(record.id)}`}
                    onClick={() => activateProfile(record)}
                  >
                    {labels.edit}
                  </Link>
                  <Link
                    className="button secondary"
                    href="/dashboard/family"
                    onClick={() => activateProfile(record)}
                  >
                    {labels.familyMap}
                  </Link>
                  <button
                    className="button secondary danger"
                    onClick={() => deleteProfile(record)}
                    type="button"
                  >
                    {labels.delete}
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
        <FamilyVaultCard labels={labels} />
      </div>
    </>
  );
}

function LibraryPageHeading({
  labels,
}: {
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <div className="page-heading compact">
      <h1 className="gradient-text">{labels.pageTitle}</h1>
      <p>{labels.pageBody}</p>
    </div>
  );
}

function LibraryHeader({
  askPredictaHref,
  labels,
}: {
  askPredictaHref: string;
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <Card className="glass-panel">
      <div className="card-content spacious">
        <div className="section-title">{labels.actionsEyebrow}</div>
        <h2>{labels.actionsTitle}</h2>
        <p>{labels.actionsBody}</p>
        <div className="action-row">
          <Link className="button" href="/dashboard/kundli">
            {labels.createNew}
          </Link>
          <Link className="button secondary" href={askPredictaHref}>
            {labels.askToCreate}
          </Link>
        </div>
      </div>
    </Card>
  );
}

function FamilyVaultCard({
  labels,
}: {
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <Card>
      <div className="card-content spacious">
        <div className="section-title">{labels.familyVaultEyebrow}</div>
        <h2>{labels.familyVaultTitle}</h2>
        <p>{labels.familyVaultBody}</p>
        <div className="action-row compact">
          <Link className="button secondary" href="/dashboard/kundli">
            {labels.addProfile}
          </Link>
          <Link className="button secondary" href="/dashboard/family">
            {labels.openFamilyMap}
          </Link>
        </div>
      </div>
    </Card>
  );
}

type KundliLibraryCopy = {
  actionsBody: string;
  actionsEyebrow: string;
  actionsTitle: string;
  activeKundli: string;
  addProfile: string;
  askPredicta: string;
  askToCreate: string;
  birthStar: string;
  createNew: string;
  delete: string;
  deleteConfirmBody: string;
  deleteConfirmTitle: (name: string) => string;
  edit: string;
  editHistory: (
    count: number,
    fields: Array<'date' | 'name' | 'place' | 'time'>,
  ) => string;
  emptyBody: string;
  emptyTitle: string;
  familyMap: string;
  familyVaultBody: string;
  familyVaultEyebrow: string;
  familyVaultTitle: string;
  libraryEyebrow: string;
  open: string;
  openFamilyMap: string;
  pageBody: string;
  pageTitle: string;
  risingSign: string;
  savedKundli: string;
  setActive: string;
};

const KUNDLI_LIBRARY_COPY: Record<SupportedLanguage, KundliLibraryCopy> = {
  en: {
    actionsBody:
      'Use this library as the main place for every saved Kundli. Family Vault uses these same profiles for comparisons and shared guidance.',
    actionsEyebrow: 'KUNDLI LIBRARY ACTIONS',
    actionsTitle: 'Create, switch, edit, or delete from one place.',
    activeKundli: 'Active Kundli',
    addProfile: 'Add Profile',
    askPredicta: 'Ask Predicta',
    askToCreate: 'Ask Predicta to Create',
    birthStar: 'Birth star',
    createNew: 'Create New Kundli',
    delete: 'Delete',
    deleteConfirmBody:
      'This removes it from your Kundli Library. Old chats or reports may no longer have full chart context for this profile.',
    deleteConfirmTitle: name => `Delete ${name}'s Kundli?`,
    edit: 'Edit',
    editHistory: (count, fields) =>
      `Edited ${count} ${count === 1 ? 'time' : 'times'} · Last change: ${
        fields.length ? fields.join(', ') : 'birth details'
      }`,
    emptyBody:
      'Every Kundli you create will appear here first. This is the storage layer; Family Vault uses these saved profiles for family patterns.',
    emptyTitle: 'Create your first Kundli.',
    familyMap: 'Family Map',
    familyVaultBody:
      'Use your saved Kundlis as family profiles, compare patterns, and later invite family members when shared permissions are ready.',
    familyVaultEyebrow: 'FAMILY VAULT',
    familyVaultTitle: 'Family layer for saved Kundlis.',
    libraryEyebrow: 'KUNDLI LIBRARY',
    open: 'Open',
    openFamilyMap: 'Open Family Map',
    pageBody:
      'This is your saved Kundli storage. Choose the active profile for Predicta, then use Family Vault when you want family patterns and shared-profile workflows.',
    pageTitle: 'Kundli Library',
    risingSign: 'Rising sign',
    savedKundli: 'Saved Kundli',
    setActive: 'Set Active',
  },
  hi: {
    actionsBody:
      'हर सेव कुंडली के लिए यही मुख्य जगह रखें. Family Vault इन्हीं प्रोफाइलों से तुलना और साझा मार्गदर्शन करता है.',
    actionsEyebrow: 'कुंडली लाइब्रेरी कार्य',
    actionsTitle: 'एक ही जगह से बनाएं, बदलें, संपादित करें या हटाएं.',
    activeKundli: 'सक्रिय कुंडली',
    addProfile: 'प्रोफाइल जोड़ें',
    askPredicta: 'Predicta से पूछें',
    askToCreate: 'Predicta से बनवाएं',
    birthStar: 'जन्म नक्षत्र',
    createNew: 'नई कुंडली बनाएं',
    delete: 'हटाएं',
    deleteConfirmBody:
      'यह कुंडली लाइब्रेरी से हट जाएगी. पुराने चैट या रिपोर्ट में इस प्रोफाइल का पूरा चार्ट संदर्भ उपलब्ध नहीं रह सकता.',
    deleteConfirmTitle: name => `${name} की कुंडली हटाएं?`,
    edit: 'संपादित करें',
    editHistory: (count, fields) =>
      `${count} बार संपादित · आखिरी बदलाव: ${
        fields.length ? fields.join(', ') : 'जन्म विवरण'
      }`,
    emptyBody:
      'आप जो भी कुंडली बनाएंगे, वह पहले यहां दिखेगी. Family Vault इन्हीं सेव प्रोफाइलों से पारिवारिक संकेत पढ़ता है.',
    emptyTitle: 'अपनी पहली कुंडली बनाएं.',
    familyMap: 'परिवार नक्शा',
    familyVaultBody:
      'सेव कुंडलियों को परिवार प्रोफाइल की तरह इस्तेमाल करें, संकेतों की तुलना करें, और आगे अनुमति तैयार होने पर परिवार सदस्यों को जोड़ें.',
    familyVaultEyebrow: 'फैमिली वॉल्ट',
    familyVaultTitle: 'सेव कुंडलियों के लिए परिवार परत.',
    libraryEyebrow: 'कुंडली लाइब्रेरी',
    open: 'खोलें',
    openFamilyMap: 'परिवार नक्शा खोलें',
    pageBody:
      'यह आपकी सेव कुंडली की जगह है. सक्रिय प्रोफाइल चुनें, फिर पारिवारिक संकेतों और साझा प्रोफाइल के लिए Family Vault इस्तेमाल करें.',
    pageTitle: 'कुंडली लाइब्रेरी',
    risingSign: 'लग्न',
    savedKundli: 'सेव कुंडली',
    setActive: 'सक्रिय करें',
  },
  gu: {
    actionsBody:
      'દરેક સાચવેલી કુંડળી માટે આ મુખ્ય જગ્યા રાખો. Family Vault આ જ પ્રોફાઇલોથી તુલના અને સહિયારું માર્ગદર્શન કરે છે.',
    actionsEyebrow: 'કુંડળી લાઇબ્રેરી કાર્ય',
    actionsTitle: 'એક જ જગ્યાએથી બનાવો, બદલો, સંપાદિત કરો અથવા કાઢી નાખો.',
    activeKundli: 'સક્રિય કુંડળી',
    addProfile: 'પ્રોફાઇલ ઉમેરો',
    askPredicta: 'Predicta ને પૂછો',
    askToCreate: 'Predicta પાસે બનાવડાવો',
    birthStar: 'જન્મ નક્ષત્ર',
    createNew: 'નવી કુંડળી બનાવો',
    delete: 'કાઢી નાખો',
    deleteConfirmBody:
      'આ કુંડળી લાઇબ્રેરીમાંથી દૂર થશે. જૂના ચેટ અથવા રિપોર્ટમાં આ પ્રોફાઇલનો સંપૂર્ણ ચાર્ટ સંદર્ભ ઉપલબ્ધ ન રહી શકે.',
    deleteConfirmTitle: name => `${name} ની કુંડળી કાઢી નાખો?`,
    edit: 'સંપાદિત કરો',
    editHistory: (count, fields) =>
      `${count} વખત સંપાદિત · છેલ્લો ફેરફાર: ${
        fields.length ? fields.join(', ') : 'જન્મ વિગતો'
      }`,
    emptyBody:
      'તમે બનાવેલી દરેક કુંડળી પહેલા અહીં દેખાશે. Family Vault આ જ સાચવેલી પ્રોફાઇલોથી પરિવારના સંકેતો વાંચે છે.',
    emptyTitle: 'તમારી પહેલી કુંડળી બનાવો.',
    familyMap: 'પરિવાર નકશો',
    familyVaultBody:
      'સાચવેલી કુંડળીઓને પરિવાર પ્રોફાઇલ તરીકે વાપરો, સંકેતોની તુલના કરો, અને આગળ પરવાનગીઓ તૈયાર થાય ત્યારે પરિવાર સભ્યોને જોડો.',
    familyVaultEyebrow: 'ફેમિલી વોલ્ટ',
    familyVaultTitle: 'સાચવેલી કુંડળીઓ માટે પરિવાર સ્તર.',
    libraryEyebrow: 'કુંડળી લાઇબ્રેરી',
    open: 'ખોલો',
    openFamilyMap: 'પરિવાર નકશો ખોલો',
    pageBody:
      'આ તમારી સાચવેલી કુંડળીની જગ્યા છે. સક્રિય પ્રોફાઇલ પસંદ કરો, પછી પરિવારના સંકેતો અને સહિયારી પ્રોફાઇલ માટે Family Vault વાપરો.',
    pageTitle: 'કુંડળી લાઇબ્રેરી',
    risingSign: 'લગ્ન',
    savedKundli: 'સાચવેલી કુંડળી',
    setActive: 'સક્રિય કરો',
  },
};
