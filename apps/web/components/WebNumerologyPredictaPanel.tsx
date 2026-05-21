'use client';

import Link from 'next/link';
import { composeNumerologyFoundationModel } from '@pridicta/astrology';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { PredictaWorldFrame } from './PredictaWorldFrame';

const NUMEROLOGY_WORLD_PROOF_CARDS = [
  {
    body:
      'The room starts from the saved name, birth date, and current date before offering guidance.',
    title: 'Calculated numbers',
  },
  {
    body:
      'Name number, birth number, destiny number, and personal timing are kept visible and explainable.',
    title: 'Proof-first reading',
  },
  {
    body:
      'If the user asks for Vedic, KP, Nadi, or Signature analysis, the room should hand off instead of mixing methods.',
    title: 'Clean boundaries',
  },
] as const;

export function WebNumerologyPredictaPanel(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const { activeKundli } = useWebKundliLibrary();
  const profile = composeNumerologyFoundationModel(activeKundli?.birthDetails, language);
  const hasProfile = profile.status === 'ready';
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    kundliId: activeKundli?.id,
    prompt:
      'Read my numerology profile from name number, birth number, destiny number, and current personal timing.',
    school: 'NUMEROLOGY',
    sourceScreen: 'Numerology Predicta',
  });

  return (
    <div className="predicta-world-page predicta-world-page--numerology kp-page-stack">
      <PredictaWorldFrame
        badge={t('Numerology world')}
        body={t(
          'Numerology Predicta reads name rhythm, birth number, destiny number, and current personal cycles. It stays separate from Vedic, KP, Nadi, and Signature unless you ask for a careful synthesis.',
        )}
        chatHref={chatHref}
        chatLabel={t('Chat with Numerology Predicta')}
        eyebrow={t('Numerology Predicta')}
        localActions={[
          {
            href: '#numerology-profile',
            label:
              language === 'hi'
                ? 'प्रोफाइल सार'
                : language === 'gu'
                  ? 'પ્રોફાઇલ સાર'
                  : 'Profile summary',
            note:
              language === 'hi'
                ? 'सेव नाम और जन्म तिथि से बना मुख्य प्रोफाइल पहले पढ़ें.'
                : language === 'gu'
                  ? 'સેવ નામ અને જન્મ તારીખથી બનેલો મુખ્ય પ્રોફાઇલ પહેલાં વાંચો.'
                  : 'Start from the saved name and birth-date profile.',
          },
          {
            href: '#numerology-numbers',
            label:
              language === 'hi'
                ? 'मुख्य अंक'
                : language === 'gu'
                  ? 'મુખ્ય અંક'
                  : 'Core numbers',
            note:
              language === 'hi'
                ? 'नाम अंक, जन्म अंक, भाग्य अंक और निजी समय एक साथ देखें.'
                : language === 'gu'
                  ? 'નામ અંક, જન્મ અંક, ભાગ્ય અંક અને વ્યક્તિગત સમય એક સાથે જુઓ.'
                  : 'Keep name, birth, destiny, and timing visible together.',
          },
          {
            href: '#numerology-boundary',
            label:
              language === 'hi'
                ? 'कक्ष सीमा'
                : language === 'gu'
                  ? 'રૂમ સીમા'
                  : 'Room boundary',
            note:
              language === 'hi'
                ? 'जहां अंक ज्योतिष खत्म होती है और सही हैंडऑफ शुरू होता है, वह देखें.'
                : language === 'gu'
                  ? 'જ્યાં અંક જ્યોતિષ અટકે છે અને યોગ્ય હેન્ડઓફ શરૂ થાય છે, તે જુઓ.'
                  : 'See where Numerology stops and the right handoff begins.',
          },
          {
            href: '/dashboard/report',
            label: t('Build Numerology report'),
            note:
              language === 'hi'
                ? 'जब संख्या-आधारित उत्तर को रिपोर्ट में बदलना हो, यहीं जाएं.'
                : language === 'gu'
                  ? 'જ્યારે અંક આધારિત જવાબને રિપોર્ટમાં ફેરવવો હોય, ત્યારે અહીં જાઓ.'
                  : 'Move into the report path when the reading needs a polished number-led summary.',
          },
        ]}
        localEyebrow={
          language === 'hi'
            ? 'अंक प्रवाह'
            : language === 'gu'
              ? 'અંક પ્રવાહ'
              : 'Number flow'
        }
        localTitle={
          language === 'hi'
            ? 'यह दुनिया संख्या, लय और निजी समय के क्रम से चलती है.'
            : language === 'gu'
              ? 'આ દુનિયા અંક, લય અને વ્યક્તિગત સમયના ક્રમથી ચાલે છે.'
              : 'This world moves through number roots, rhythm, and personal timing.'
        }
        pillars={[
          {
            label:
              language === 'hi'
                ? 'नाम'
                : language === 'gu'
                  ? 'નામ'
                  : 'Name',
            value: t('Name number'),
          },
          {
            label:
              language === 'hi'
                ? 'जन्म'
                : language === 'gu'
                  ? 'જન્મ'
                  : 'Birth',
            value: t('Birth number'),
          },
          {
            label:
              language === 'hi'
                ? 'वर्तमान'
                : language === 'gu'
                  ? 'હાલ'
                  : 'Current',
            value: t('Personal timing'),
          },
        ]}
        proofCards={NUMEROLOGY_WORLD_PROOF_CARDS.map(card => ({
          body: t(card.body),
          title: t(card.title),
        }))}
        proofLabel={t('Proof')}
        reportLabel={t('Build Numerology report')}
        reportNote={t('Name number, birth number, destiny number, and personal timing are kept visible and explainable.')}
        theme="numerology"
        title={t('A separate number-reading room.')}
      />

      <section className="glass-panel" id="numerology-profile">
        <div className="section-heading-row">
          <div>
            <p className="section-title">{t('CURRENT PROFILE')}</p>
            <h2>{hasProfile ? profile.name : t('Create a Kundli first')}</h2>
          </div>
          <Link className="button primary" href={chatHref}>
            {t('Chat with Numerology Predicta')}
          </Link>
        </div>
        <p>
          {hasProfile
            ? profile.summary
            : t(
                'Numerology needs a saved name and birth date. Create or select a Kundli, then this room can read the number profile instantly.',
              )}
        </p>
      </section>

      <section className="school-grid" id="numerology-numbers">
        {[
          {
            label: 'Name number',
            value: hasProfile ? String(profile.nameNumber.root) : t('Pending'),
            detail: hasProfile
              ? profile.nameNumber.simpleMeaning
              : t('Uses the saved name spelling.'),
          },
          {
            label: 'Birth number',
            value: hasProfile ? String(profile.birthNumber.root) : t('Pending'),
            detail: hasProfile
              ? profile.birthNumber.simpleMeaning
              : t('Uses the birth day.'),
          },
          {
            label: 'Destiny number',
            value: hasProfile ? String(profile.destinyNumber.root) : t('Pending'),
            detail: hasProfile
              ? profile.destinyNumber.simpleMeaning
              : t('Uses the full birth date.'),
          },
          {
            label: 'Personal timing',
            value: hasProfile
              ? formatPersonalYearValue(profile.personalYear.root, language)
              : t('Pending'),
            detail: hasProfile
              ? profile.guidance
              : t('Uses the current year, month, and day.'),
          },
        ].map(item => (
          <article className="glass-panel" key={item.label}>
            <p className="section-title">{t(item.label)}</p>
            <h3>{item.value}</h3>
            <p>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="glass-panel" id="numerology-boundary">
        <p className="section-title">{t('ROOM BOUNDARY')}</p>
        <h2>{t('Numerology answers with number logic first.')}</h2>
        <p>
          {t(
            'If the question needs Parashari, KP, Nadi, or Signature analysis, Predicta should hand you to the right room with your question intact.',
          )}
        </p>
        <div className="action-row">
          <Link className="button secondary" href="/dashboard/report">
            {t('Build Numerology report')}
          </Link>
          <Link className="button secondary" href="/dashboard/kundli">
            {t('Select Kundli')}
          </Link>
        </div>
      </section>
    </div>
  );
}

function formatPersonalYearValue(root: number, language: 'en' | 'hi' | 'gu'): string {
  if (language === 'hi') {
    return `वर्ष ${root}`;
  }

  if (language === 'gu') {
    return `વર્ષ ${root}`;
  }

  return `Year ${root}`;
}
