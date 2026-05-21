'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPassCode, normalizePassCode } from '@pridicta/access';
import type { RedeemedGuestPass } from '@pridicta/types';
import type { SupportedLanguage } from '@pridicta/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import { useLanguagePreference } from '../lib/language-preference';
import {
  getOrCreateBrowserDeviceId,
} from '../lib/web-guest-session';
import { AuthDialog } from './AuthDialog';

type RedemptionStatus = {
  tone: 'error' | 'success' | 'idle';
  text: string;
};

export function WebRedeemPassForm(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = REDEEM_PASS_FORM_COPY[language] ?? REDEEM_PASS_FORM_COPY.en;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<RedemptionStatus>({
    tone: 'idle',
    text: copy.initialStatus,
  });
  const [deviceId, setDeviceId] = useState('');
  const [redeemedPass, setRedeemedPass] = useState<RedeemedGuestPass>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setDeviceId(getBrowserDeviceId());

    try {
      return onAuthStateChanged(getFirebaseWebAuth(), setUser);
    } catch {
      return undefined;
    }
  }, []);

  async function redeem() {
    const normalized = normalizePassCode(code);

    if (!normalized) {
      setStatus({ tone: 'error', text: copy.status.enterCode });
      return;
    }

    if (!user?.email) {
      setStatus({
        tone: 'error',
        text: copy.status.signInFirst,
      });
      return;
    }

    const resolvedDeviceId = deviceId || getBrowserDeviceId();

    try {
      setBusy(true);
      const response = await fetch('/api/access/redeem-pass', {
        body: JSON.stringify({
          code,
          deviceId: resolvedDeviceId,
          email: user.email,
          userId: user.uid,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok || result.status !== 'SUCCESS') {
        const detail =
          result.status === 'EMAIL_NOT_ALLOWED'
            ? copy.status.emailNotAllowed
            : result.detail ?? result.message ?? copy.status.couldNotRedeem;
        setStatus({
          tone: 'error',
          text: detail,
        });
        return;
      }

      window.localStorage.setItem(
        'pridicta.redeemedGuestPass.v1',
        JSON.stringify(result.redeemedPass),
      );
      setRedeemedPass(result.redeemedPass);
      setCode('');
      setStatus({
        tone: 'success',
        text: copy.status.activeFor(result.redeemedPass.label, user.email),
      });
    } catch {
      setStatus({
        tone: 'error',
        text: copy.status.tryAgain,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-content spacious">
      <div className="redeem-guidance">
        <div className="section-title">{copy.guidance.eyebrow}</div>
        <h2>{copy.guidance.title}</h2>
        <p>{copy.guidance.body}</p>
        <ol>
          {copy.guidance.steps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="redeem-auth-row">
          <AuthDialog />
          <span>
            {user?.email
              ? copy.account.signedInAs(user.email)
              : copy.account.notSignedIn}
          </span>
        </div>
      </div>
      <div className="redeem-account-status">
        <span>{copy.account.eyebrow}</span>
        <strong>
          {user?.email
            ? copy.account.signedInAs(user.email)
            : copy.account.signInToContinue}
        </strong>
        <p>{copy.account.body}</p>
      </div>
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-code">
          {copy.fieldLabel}
        </label>
        <input
          id="pass-code"
          onChange={event => setCode(event.target.value)}
          placeholder={formatPassCode(normalizePassCode(copy.placeholderSeed))}
          type="text"
          value={code}
        />
      </div>
      <p className={`form-status ${status.tone}`}>{status.text}</p>
      <button
        className="button"
        disabled={busy || !user?.email}
        onClick={redeem}
        type="button"
      >
        {busy ? copy.busyLabel : copy.submitLabel}
      </button>
      {redeemedPass ? (
        <div className="redeem-next-steps">
          <div className="section-title">{copy.nextSteps.eyebrow}</div>
          <h2>{copy.nextSteps.title}</h2>
          <p>{copy.nextSteps.body}</p>
          <div className="redeem-next-step-grid">
            <Link className="button" href="/dashboard/kundli">
              {copy.nextSteps.createKundli}
            </Link>
            <Link
              className="button secondary"
              href={`/dashboard/vedic/chat?sourceScreen=Private+Pass&prompt=${encodeURIComponent(copy.nextSteps.askPrompt)}`}
            >
              {copy.nextSteps.askPredicta}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.nextSteps.previewReport}
            </Link>
            <Link
              className="button secondary"
              href="/feedback?source=family-friends&area=general&from=redeem-pass"
            >
              {copy.nextSteps.giveFeedback}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getBrowserDeviceId(): string {
  return getOrCreateBrowserDeviceId();
}

const REDEEM_PASS_FORM_COPY: Record<
  SupportedLanguage,
  {
    account: {
      body: string;
      eyebrow: string;
      notSignedIn: string;
      signInToContinue: string;
      signedInAs: (email: string) => string;
    };
    busyLabel: string;
    fieldLabel: string;
    guidance: {
      body: string;
      eyebrow: string;
      steps: string[];
      title: string;
    };
    initialStatus: string;
    nextSteps: {
      askPredicta: string;
      askPrompt: string;
      body: string;
      createKundli: string;
      eyebrow: string;
      giveFeedback: string;
      previewReport: string;
      title: string;
    };
    placeholderSeed: string;
    status: {
      activeFor: (label: string, email: string) => string;
      couldNotRedeem: string;
      emailNotAllowed: string;
      enterCode: string;
      signInFirst: string;
      tryAgain: string;
    };
    submitLabel: string;
  }
> = {
  en: {
    account: {
      body:
        'Predicta automatically checks your signed-in email against the pass. You never need to type your email on this page.',
      eyebrow: 'Account check',
      notSignedIn: 'Not signed in yet',
      signInToContinue: 'Sign in to continue',
      signedInAs: email => `Signed in as ${email}`,
    },
    busyLabel: 'Checking...',
    fieldLabel: 'Pass code',
    guidance: {
      body:
        'A private pass is tied to one approved email address. If you remember the email used for your pass, sign in with it. If you are not sure, contact the Predicta admin or pass creator.',
      eyebrow: 'HOW TO REDEEM',
      steps: [
        'Use Google sign-in, or create an account with the pass email.',
        'Enter the private pass code exactly as shared.',
        'If the email does not match, Predicta will not redeem the pass.',
      ],
      title: 'Sign in with the pass email first.',
    },
    initialStatus: 'Sign in first with the email used for your pass, then enter the code.',
    nextSteps: {
      askPredicta: 'Ask Predicta',
      askPrompt: 'Help me start with my Kundli.',
      body:
        'Your private preview is active. The fastest path is to create your Kundli, ask Predicta one real question, then try a report preview.',
      createKundli: 'Create Kundli',
      eyebrow: 'PASS ACTIVE',
      giveFeedback: 'Give Feedback',
      previewReport: 'Preview Report',
      title: 'Start with these three steps.',
    },
    placeholderSeed: 'pridicta vip example',
    status: {
      activeFor: (label, email) => `${label} is active for ${email}.`,
      couldNotRedeem: 'This pass could not be redeemed.',
      emailNotAllowed:
        'This pass is tied to a different approved email. Please sign out and use the email shared with the pass. If you are not sure, contact the Predicta admin or pass creator.',
      enterCode: 'Enter the guest pass code first.',
      signInFirst:
        'Please sign in first. Use Google sign-in or create an account with the email used for your pass. If you are not sure, contact the Predicta admin or pass creator.',
      tryAgain:
        'We could not check this private pass right now. Please try again in a moment.',
    },
    submitLabel: 'Redeem Pass',
  },
  hi: {
    account: {
      body:
        'प्रेडिक्टा आपके साइन-इन किए गए ईमेल को पास से अपने आप मिलाती है. इस पेज पर आपको ईमेल अलग से लिखने की जरूरत नहीं है.',
      eyebrow: 'खाता जांच',
      notSignedIn: 'अभी साइन इन नहीं है',
      signInToContinue: 'आगे बढ़ने के लिए साइन इन करें',
      signedInAs: email => `${email} के रूप में साइन इन है`,
    },
    busyLabel: 'जांच रहे हैं...',
    fieldLabel: 'पास कोड',
    guidance: {
      body:
        'निजी पास एक स्वीकृत ईमेल पते से जुड़ा होता है. अगर पास वाला ईमेल याद है तो उसी से साइन इन करें. यदि याद नहीं है, तो प्रेडिक्टा व्यवस्थापक या पास बनाने वाले व्यक्ति से संपर्क करें.',
      eyebrow: 'पास उपयोग कैसे करें',
      steps: [
        'Google साइन-इन करें या पास वाले ईमेल से खाता बनाएं.',
        'निजी पास कोड उसी तरह लिखें जैसा साझा किया गया था.',
        'यदि ईमेल मेल नहीं खाता, तो प्रेडिक्टा पास सक्रिय नहीं करेगी.',
      ],
      title: 'पहले पास वाले ईमेल से साइन इन करें.',
    },
    initialStatus: 'पहले पास वाले ईमेल से साइन इन करें, फिर कोड लिखें.',
    nextSteps: {
      askPredicta: 'प्रेडिक्टा से पूछें',
      askPrompt: 'मेरी कुंडली के साथ शुरुआत करने में मदद करें.',
      body:
        'आपकी निजी झलक सक्रिय है. सबसे तेज रास्ता है: कुंडली बनाएं, प्रेडिक्टा से एक असली सवाल पूछें, फिर रिपोर्ट झलक देखें.',
      createKundli: 'कुंडली बनाएं',
      eyebrow: 'पास सक्रिय',
      giveFeedback: 'सुझाव भेजें',
      previewReport: 'रिपोर्ट झलक देखें',
      title: 'इन तीन कदमों से शुरू करें.',
    },
    placeholderSeed: 'pridicta vip udaharan',
    status: {
      activeFor: (label, email) => `${label} ${email} के लिए सक्रिय है.`,
      couldNotRedeem: 'यह पास अभी सक्रिय नहीं हो सका.',
      emailNotAllowed:
        'यह पास किसी दूसरे स्वीकृत ईमेल से जुड़ा है. कृपया साइन आउट करें और वही ईमेल उपयोग करें जो पास के साथ साझा किया गया था. यदि पक्का न हो, तो प्रेडिक्टा व्यवस्थापक या पास बनाने वाले व्यक्ति से संपर्क करें.',
      enterCode: 'पहले गेस्ट पास कोड लिखें.',
      signInFirst:
        'पहले साइन इन करें. Google साइन-इन करें या पास वाले ईमेल से खाता बनाएं. यदि पक्का न हो, तो प्रेडिक्टा व्यवस्थापक या पास बनाने वाले व्यक्ति से संपर्क करें.',
      tryAgain:
        'अभी यह निजी पास जांचा नहीं जा सका. कृपया थोड़ी देर बाद फिर प्रयास करें.',
    },
    submitLabel: 'पास उपयोग करें',
  },
  gu: {
    account: {
      body:
        'પ્રેડિક્ટા તમારા સાઇન-ઇન કરેલા ઇમેઇલને પાસ સાથે આપમેળે મિલાવે છે. આ પેજ પર ઇમેઇલ અલગથી લખવાની જરૂર નથી.',
      eyebrow: 'ખાતા તપાસ',
      notSignedIn: 'હજુ સાઇન ઇન નથી',
      signInToContinue: 'આગળ વધવા સાઇન ઇન કરો',
      signedInAs: email => `${email} તરીકે સાઇન ઇન છે`,
    },
    busyLabel: 'ચકાસી રહ્યા છીએ...',
    fieldLabel: 'પાસ કોડ',
    guidance: {
      body:
        'ખાનગી પાસ એક મંજૂર ઇમેઇલ સરનામા સાથે જોડાયેલો હોય છે. પાસવાળું ઇમેઇલ યાદ હોય તો એ જથી સાઇન ઇન કરો. યાદ ન હોય તો પ્રેડિક્ટા સંચાલક અથવા પાસ બનાવનાર વ્યક્તિનો સંપર્ક કરો.',
      eyebrow: 'પાસ કેવી રીતે વાપરવો',
      steps: [
        'Google સાઇન-ઇન કરો અથવા પાસવાળા ઇમેઇલથી ખાતું બનાવો.',
        'ખાનગી પાસ કોડ જેમ શેર થયો હતો તેમ જ લખો.',
        'ઇમેઇલ મેળ ન ખાતું હોય તો પ્રેડિક્ટા પાસ રીડીમ નહીં કરે.',
      ],
      title: 'પહેલાં પાસવાળા ઇમેઇલથી સાઇન ઇન કરો.',
    },
    initialStatus: 'પહેલાં પાસવાળા ઇમેઇલથી સાઇન ઇન કરો, પછી કોડ લખો.',
    nextSteps: {
      askPredicta: 'પ્રેડિક્ટાને પૂછો',
      askPrompt: 'મારી કુંડળી સાથે શરૂઆત કરવામાં મદદ કરો.',
      body:
        'તમારી ખાનગી ઝલક સક્રિય છે. સૌથી ઝડપનો રસ્તો છે: કુંડળી બનાવો, પ્રેડિક્ટાને એક સાચો પ્રશ્ન પૂછો, પછી રિપોર્ટ ઝલક જુઓ.',
      createKundli: 'કુંડળી બનાવો',
      eyebrow: 'પાસ સક્રિય',
      giveFeedback: 'સૂચન મોકલો',
      previewReport: 'રિપોર્ટ ઝલક જુઓ',
      title: 'આ ત્રણ પગલાંથી શરૂઆત કરો.',
    },
    placeholderSeed: 'pridicta vip udaharan',
    status: {
      activeFor: (label, email) => `${label} ${email} માટે સક્રિય છે.`,
      couldNotRedeem: 'આ પાસ અત્યારે રીડીમ થઈ શક્યો નથી.',
      emailNotAllowed:
        'આ પાસ બીજા મંજૂર ઇમેઇલ સાથે જોડાયેલો છે. કૃપા કરીને સાઇન આઉટ કરો અને પાસ સાથે શેર કરાયેલું એ જ ઇમેઇલ વાપરો. ખાતરી ન હોય તો પ્રેડિક્ટા સંચાલક અથવા પાસ બનાવનાર વ્યક્તિનો સંપર્ક કરો.',
      enterCode: 'પહેલાં ગેસ્ટ પાસ કોડ લખો.',
      signInFirst:
        'પહેલાં સાઇન ઇન કરો. Google સાઇન-ઇન કરો અથવા પાસવાળા ઇમેઇલથી ખાતું બનાવો. ખાતરી ન હોય તો પ્રેડિક્ટા સંચાલક અથવા પાસ બનાવનાર વ્યક્તિનો સંપર્ક કરો.',
      tryAgain:
        'અત્યારે આ ખાનગી પાસ ચકાસી શકાયો નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.',
    },
    submitLabel: 'પાસ રીડીમ કરો',
  },
};
