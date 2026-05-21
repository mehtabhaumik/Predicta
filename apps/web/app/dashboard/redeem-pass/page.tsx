'use client';

import { Card } from '../../../components/Card';
import { WebRedeemPassForm } from '../../../components/WebRedeemPassForm';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../../../lib/language-preference';

export default function RedeemPassPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = REDEEM_PASS_PAGE_COPY[language] ?? REDEEM_PASS_PAGE_COPY.en;

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">{copy.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerTitle}</span>
            <strong>{copy.openLabel}</strong>
          </summary>
          <p>{copy.drawerBody}</p>
        </details>
      </div>

      <section className="redeem-preview-steps">
        <article>
          <span>1</span>
          <h2>{copy.steps[0]?.title}</h2>
          <p>{copy.steps[0]?.body}</p>
        </article>
        <article>
          <span>2</span>
          <h2>{copy.steps[1]?.title}</h2>
          <p>{copy.steps[1]?.body}</p>
        </article>
        <article>
          <span>3</span>
          <h2>{copy.steps[2]?.title}</h2>
          <p>{copy.steps[2]?.body}</p>
        </article>
      </section>

      <Card className="glass-panel redeem-card">
        <WebRedeemPassForm />
      </Card>
    </section>
  );
}

const REDEEM_PASS_PAGE_COPY: Record<
  SupportedLanguage,
  {
    drawerBody: string;
    drawerTitle: string;
    openLabel: string;
    steps: Array<{ body: string; title: string }>;
    title: string;
  }
> = {
  en: {
    drawerBody:
      'Your pass works only with the email used when it was created. If you remember that email, sign in with it. If you are not sure, contact the Predicta admin or the person who invited you.',
    drawerTitle: 'Before you redeem',
    openLabel: 'Open',
    steps: [
      {
        body: 'Google sign-in or email sign-up both work. Predicta checks the email automatically.',
        title: 'Use the pass email.',
      },
      {
        body: 'Enter the code exactly as shared. Predicta will confirm the active pass.',
        title: 'Redeem the pass.',
      },
      {
        body: 'Create your chart, then try chat, Gochar, reports, KP, or Nadi.',
        title: 'Start with Kundli.',
      },
    ],
    title: 'Private access starts here.',
  },
  hi: {
    drawerBody:
      'आपका पास केवल उसी ईमेल पर काम करता है जिससे इसे बनाया गया था. अगर वह ईमेल याद है तो उसी से साइन इन करें. अगर याद नहीं है तो प्रेडिक्टा व्यवस्थापक या आमंत्रित करने वाले व्यक्ति से संपर्क करें.',
    drawerTitle: 'उपयोग से पहले',
    openLabel: 'खोलें',
    steps: [
      {
        body: 'Google साइन-इन और ईमेल साइन-अप दोनों चलेंगे. प्रेडिक्टा ईमेल अपने आप जांच लेती है.',
        title: 'पास वाला ईमेल उपयोग करें.',
      },
      {
        body: 'कोड वही लिखें जैसा साझा किया गया था. प्रेडिक्टा सक्रिय पास की पुष्टि करेगी.',
        title: 'पास उपयोग करें.',
      },
      {
        body: 'पहले कुंडली बनाएं, फिर चैट, गोचर, रिपोर्ट, कृष्णमूर्ति पद्धति या नाड़ी आजमाएं.',
        title: 'कुंडली से शुरू करें.',
      },
    ],
    title: 'निजी प्रवेश यहीं से शुरू होता है.',
  },
  gu: {
    drawerBody:
      'તમારો પાસ ફક્ત એ જ ઇમેઇલ સાથે કામ કરે છે જેના પરથી તે બનાવાયો હતો. તે ઇમેઇલ યાદ હોય તો એ જથી સાઇન ઇન કરો. યાદ ન હોય તો પ્રેડિક્ટા સંચાલક અથવા આમંત્રિત કરનાર વ્યક્તિનો સંપર્ક કરો.',
    drawerTitle: 'ઉપયોગ પહેલાં',
    openLabel: 'ખોલો',
    steps: [
      {
        body: 'Google સાઇન-ઇન અને ઇમેઇલ સાઇન-અપ બંને ચાલે છે. પ્રેડિક્ટા ઇમેઇલ આપમેળે ચકાસે છે.',
        title: 'પાસવાળું ઇમેઇલ વાપરો.',
      },
      {
        body: 'કોડ જેમ શેર થયો હતો તેમ જ લખો. પ્રેડિક્ટા સક્રિય પાસની પુષ્ટિ કરશે.',
        title: 'પાસ રીડીમ કરો.',
      },
      {
        body: 'પહેલાં કુંડળી બનાવો, પછી ચેટ, ગોચર, રિપોર્ટ, કૃષ્ણમૂર્તિ પદ્ધતિ કે નાડી અજમાવો.',
        title: 'કુંડળીથી શરૂ કરો.',
      },
    ],
    title: 'ખાનગી પ્રવેશ અહીંથી શરૂ થાય છે.',
  },
};
