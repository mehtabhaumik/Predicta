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
            <p className="section-title">{t('YOUR NUMBER SIGNATURE')}</p>
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
        {hasProfile ? (
          <>
            <p className="section-title">{t('Life Theme Sentence')}</p>
            <p className="insight-callout">
              {profile.identityDashboard.lifeThemeSentence}
            </p>
          </>
        ) : null}
      </section>

      <section className="glass-panel" id="numerology-numbers">
        <p className="section-title">{t('PERSONAL NUMBER MANDALA')}</p>
        <h2>{t('Your Number Signature')}</h2>
        <div className="school-grid">
          {profile.identityDashboard.mandalaNodes.map(node => (
            <article
              aria-label={node.accessibleLabel}
              className="glass-panel"
              key={node.id}
              style={{ borderColor: node.colorToken }}
            >
              <p className="section-title">{t(node.label)}</p>
              <h3>{hasProfile ? node.number : t('Pending')}</h3>
              <p>{hasProfile ? `${node.keyword}: ${node.shortMeaning}` : t('Waiting for saved details.')}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="glass-panel">
        <p className="section-title">{t('NAME ENERGY SCANNER')}</p>
        <h2>{t('Name Energy Scanner')}</h2>
        <p className="section-title">{t('Name Rhythm')}</p>
        <p>
          {hasProfile
            ? profile.identityDashboard.nameScanner.reducedExpression
            : t('Name scanner is pending until a saved name is available.')}
        </p>
        <p className="section-title">
          {t('Reduced-motion friendly: scanner states are also shown as readable steps.')}
        </p>
        <div className="action-row">
          {profile.identityDashboard.nameScanner.steps.slice(0, 18).map((step, index) => (
            <span className="button secondary" key={`${step.letter}-${index}`}>
              {step.letter} {step.value}
            </span>
          ))}
        </div>
        <p>{hasProfile ? profile.identityDashboard.firstLetterInfluence : profile.guidance}</p>
        <p>{hasProfile ? profile.identityDashboard.nameStrength : ''}</p>
      </section>

      <section className="school-grid">
        <article className="glass-panel">
          <p className="section-title">{t('BIRTH CODE')}</p>
          <h3>
            {hasProfile
              ? `${profile.birthNumber.root} / ${profile.destinyNumber.root}`
              : t('Pending')}
          </h3>
          <p>{hasProfile ? profile.identityDashboard.maturityDirection : t('Uses the birth day and full birth date.')}</p>
          <p>{hasProfile ? profile.strengths.slice(0, 3).join(', ') : ''}</p>
        </article>
        <article className="glass-panel">
          <p className="section-title">{t('CURRENT CYCLE')}</p>
          <h3>
            {hasProfile
              ? `${formatPersonalYearValue(profile.personalYear.root, language)} · M${profile.personalMonth.root} · D${profile.personalDay.root}`
              : t('Pending')}
          </h3>
          <p>{profile.identityDashboard.bestUseOfCurrentCycle}</p>
          <p>{t('Lean into')}: {profile.identityDashboard.currentCycleLeanInto}</p>
          <p>{t('Avoid')}: {profile.identityDashboard.currentCycleAvoid}</p>
        </article>
      </section>

      <section className="glass-panel">
        <p className="section-title">{t('PERSONAL YEAR TIMELINE')}</p>
        <h2>{t('Best Use Of This Cycle')}</h2>
        <div className="school-grid">
          {profile.identityDashboard.personalYearTimeline.map(month => (
            <article className="glass-panel" key={month.monthLabel}>
              <p className="section-title">{month.monthLabel}</p>
              <h3>{month.cycleNumber} · {t(month.keyword)}</h3>
              <p>{month.guidance}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="school-grid">
        <article className="glass-panel">
          <p className="section-title">{t('STRENGTHS & CAUTIONS')}</p>
          <h3>{t('Practical number guidance')}</h3>
          <p>{t('Strengths')}: {profile.strengths.slice(0, 4).join(', ') || t('Pending')}</p>
          <p>{t('Cautions')}: {profile.cautions.slice(0, 3).join(', ') || t('Pending')}</p>
          <p>{profile.identityDashboard.freeInsight}</p>
        </article>
        <article className="glass-panel">
          <p className="section-title">{t('SUPPORTIVE TOOLKIT')}</p>
          <h3>{t('Lucky/Supportive Toolkit')}</h3>
          <p>{profile.identityDashboard.supportiveToolkit.framing}</p>
          <p>{t('Colors')}: {profile.identityDashboard.supportiveToolkit.colors.join(', ') || t('Pending')}</p>
          <p>{t('Days')}: {profile.identityDashboard.supportiveToolkit.days.join(', ') || t('Pending')}</p>
          <p>{t('Affirmation')}: {profile.identityDashboard.supportiveToolkit.affirmation}</p>
        </article>
      </section>

      <section className="glass-panel">
        <p className="section-title">{t('MISSING / REPEATED NUMBER PATTERN')}</p>
        <h2>{t('Missing/Repeated Number Grid')}</h2>
        <div className="school-grid">
          {profile.identityDashboard.frequencyMap.map(cell => (
            <article className="glass-panel" key={cell.number}>
              <p className="section-title">{t(cell.tone.toUpperCase())}</p>
              <h3>{cell.number}</h3>
              <p>{cell.count} · {cell.keyword}</p>
              <p>{cell.insight}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="school-grid">
        <article className="glass-panel">
          <p className="section-title">{t('NAME REFINEMENT')}</p>
          <h3>{t('Name Fit Score')}</h3>
          <p>{profile.identityDashboard.nameRefinement.currentNameFit.summary}</p>
          <p>
            {t('Expression')}: {profile.identityDashboard.nameRefinement.currentNameFit.expression} ·{' '}
            {t('Stability')}: {profile.identityDashboard.nameRefinement.currentNameFit.stability} ·{' '}
            {t('Destiny support')}: {profile.identityDashboard.nameRefinement.currentNameFit.destinySupport}
          </p>
          <p>{profile.identityDashboard.nameRefinement.comparisonNote}</p>
        </article>
        <article className="glass-panel">
          <p className="section-title">{t('COMPATIBILITY')}</p>
          <h3>{t('Numerology Compatibility Lens')}</h3>
          <p>{profile.identityDashboard.compatibilityLens.howToWorkBetter}</p>
          <p>
            {t('Status')}: {profile.identityDashboard.compatibilityLens.status} ·{' '}
            {t('Confidence')}: {profile.identityDashboard.compatibilityLens.confidence}
          </p>
          <p>{profile.identityDashboard.compatibilityLens.limitations[0]}</p>
        </article>
      </section>

      <section className="glass-panel">
        <p className="section-title">{t('ASK NUMEROLOGY PREDICTA')}</p>
        <h2>{t('Ask Numerology Predicta')}</h2>
        <div className="action-row">
          {[
            'Explain my name number',
            'Explain my destiny number',
            'What should I focus on this personal year?',
            'Compare this name spelling',
            'Check name compatibility',
          ].map(prompt => (
            <Link
              className="button secondary"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                kundliId: activeKundli?.id,
                prompt,
                school: 'NUMEROLOGY',
                sourceScreen: 'Numerology Predicta',
              })}
              key={prompt}
            >
              {t(prompt)}
            </Link>
          ))}
        </div>
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
