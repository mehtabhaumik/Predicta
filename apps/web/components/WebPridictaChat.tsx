'use client';

import { useEffect, useRef, useState } from 'react';
import { getLanguageLabels } from '@pridicta/config/language';
import {
  getBirthExtractionFailureReply,
  getBirthIntakeWelcome,
  getFriendlyGreetingReply,
  getListeningMicrocopy,
  isSimpleGreeting,
} from '@pridicta/config/predictaUx';
import { formatAskWithProof } from '@pridicta/config/proof';
import {
  getSafetyBoundaryCopy,
  hasHighStakesLanguage,
} from '@pridicta/config/trust';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import {
  askPridictaFromWeb,
  extractBirthDetailsFromWeb,
} from '../lib/pridicta-ai';
import { loadWebKundli } from '../lib/web-kundli-storage';

type WebMessage = {
  id: string;
  role: 'user' | 'pridicta';
  text: string;
};

export function WebPridictaChat(): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { language } = useLanguagePreference();
  const labels = getLanguageLabels(language);
  const didLoadQueryPrompt = useRef(false);
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [messages, setMessages] = useState<WebMessage[]>(() =>
    buildInitialMessages(language),
  );

  useEffect(() => {
    setKundli(loadWebKundli());
  }, []);

  useEffect(() => {
    setMessages(current =>
      current.length === 1 && current[0].id === 'welcome'
        ? buildInitialMessages(language)
        : current,
    );
  }, [language]);

  useEffect(() => {
    if (didLoadQueryPrompt.current) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const prompt = params.get('prompt');

    if (prompt) {
      didLoadQueryPrompt.current = true;
      const briefingDate = params.get('briefingDate');
      const decisionQuestion = params.get('decisionQuestion');
      const decisionArea = params.get('decisionArea');
      const decisionState = params.get('decisionState');
      const remedyTitle = params.get('remedyTitle');
      const birthTimeDetective = params.get('birthTimeDetective');
      setInput(prompt);
      setMessages(current => [
        ...current,
        {
          id: `context-${Date.now()}`,
          role: 'pridicta',
          text: buildContextMessage({
            birthTimeDetective: Boolean(birthTimeDetective),
            briefingDate,
            decisionArea,
            decisionQuestion: Boolean(decisionQuestion),
            decisionState,
            language,
            remedyTitle,
          }),
        },
      ]);
    }
  }, [language]);

  async function sendMessage() {
    const text = input.trim();

    if (!text || isSending) {
      return;
    }

    setInput('');
    setIsSending(true);
    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text },
    ]);

    try {
      const summary = isSimpleGreeting(text)
        ? getFriendlyGreetingReply(language)
        : looksLikeBirthDetails(text)
          ? formatExtractionSummary(await extractBirthDetailsFromWeb(text), language)
          : !kundli
            ? createKundliFirstReply(language, text)
            : await askWithProof(text, kundli);
      const safeSummary =
        kundli && hasHighStakesLanguage(text)
          ? `${getSafetyBoundaryCopy(language)}\n\n${summary}`
          : summary;

      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: safeSummary,
        },
      ]);
    } catch {
      const fallbackText = looksLikeBirthDetails(text)
        ? getBirthExtractionFailureReply(language)
        : "I could not complete that reading just now. I am still here with you; please try again with one focused question. Har Har Mahadev.";
      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: fallbackText,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function askWithProof(text: string, activeKundli: KundliData) {
    const response = await askPridictaFromWeb({
      history: messages.map(message => ({
        role: message.role,
        text: message.text,
      })),
      kundli: activeKundli,
      language,
      message: text,
      userPlan: 'FREE',
    });

    return formatAskWithProof(response.text, response.jyotishAnalysis);
  }

  return (
    <div className="chat-workspace">
      <div className="card chat-panel">
        <div className="chat-thread">
          {messages.map(message => (
            <div className={`message ${message.role}`} key={message.id}>
              <span>{message.role === 'user' ? 'You' : 'Predicta'}</span>
              <p>{message.text}</p>
            </div>
          ))}
          {isSending ? (
            <div className="message pridicta" key="predicta-listening">
              <span>Predicta</span>
              <p>{getListeningMicrocopy(language)}</p>
            </div>
          ) : null}
        </div>
        <div className="chat-input-row">
          <textarea
            aria-label="Ask Predicta"
            disabled={isSending}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.ctrlKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder={chatPlaceholder(language)}
            rows={3}
            value={input}
          />
          <button
            className="button"
            disabled={isSending || !input.trim()}
            onClick={sendMessage}
            type="button"
          >
            {isSending ? labels.reading : labels.askPridicta}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildInitialMessages(language: SupportedLanguage): WebMessage[] {
  return [
    {
      id: 'welcome',
      role: 'pridicta',
      text: getBirthIntakeWelcome(language),
    },
  ];
}

function buildContextMessage({
  birthTimeDetective,
  briefingDate,
  decisionArea,
  decisionQuestion,
  decisionState,
  language,
  remedyTitle,
}: {
  birthTimeDetective: boolean;
  briefingDate: string | null;
  decisionArea: string | null;
  decisionQuestion: boolean;
  decisionState: string | null;
  language: SupportedLanguage;
  remedyTitle: string | null;
}): string {
  if (language === 'hi') {
    if (birthTimeDetective) {
      return 'Birth Time Detective report loaded है. Confidence और safe timing limits समझाने के लिए पूछें.';
    }
    if (remedyTitle) {
      return `Remedy Coach practice loaded है: ${remedyTitle}. Chart evidence से समझाने के लिए पूछें.`;
    }
    if (decisionQuestion) {
      return `Decision Oracle memo loaded है: ${decisionArea} / ${decisionState}. Chart evidence से समझाने के लिए पूछें.`;
    }
    if (briefingDate) {
      return `${briefingDate} की daily briefing loaded है. Chart evidence से समझाने के लिए पूछें.`;
    }
    return 'Timeline event loaded है. Chart evidence से समझाने के लिए पूछें.';
  }

  if (language === 'gu') {
    if (birthTimeDetective) {
      return 'Birth Time Detective report loaded છે. Confidence અને safe timing limits સમજાવવા પૂછો.';
    }
    if (remedyTitle) {
      return `Remedy Coach practice loaded છે: ${remedyTitle}. Chart evidence થી સમજાવવા પૂછો.`;
    }
    if (decisionQuestion) {
      return `Decision Oracle memo loaded છે: ${decisionArea} / ${decisionState}. Chart evidence થી સમજાવવા પૂછો.`;
    }
    if (briefingDate) {
      return `${briefingDate} ની daily briefing loaded છે. Chart evidence થી સમજાવવા પૂછો.`;
    }
    return 'Timeline event loaded છે. Chart evidence થી સમજાવવા પૂછો.';
  }

  if (birthTimeDetective) {
    return 'I loaded your Birth Time Detective report. Press Ask when you want me to explain confidence and safe timing limits.';
  }
  if (remedyTitle) {
    return `I loaded your Remedy Coach practice: ${remedyTitle}. Press Ask when you want me to explain it from chart evidence.`;
  }
  if (decisionQuestion) {
    return `I loaded your Decision Oracle memo: ${decisionArea} / ${decisionState}. Press Ask when you want me to explain it from chart evidence.`;
  }
  if (briefingDate) {
    return `I loaded your daily briefing for ${briefingDate}. Press Ask when you want me to explain it from chart evidence.`;
  }
  return 'I loaded your timeline event. Press Ask when you want me to explain it from chart evidence.';
}

function formatExtractionSummary(
  result: Awaited<ReturnType<typeof extractBirthDetailsFromWeb>>,
  language: SupportedLanguage,
): string {
  const copy = extractionCopy(language);
  const details = [
    result.extracted.name ? `${copy.name}: ${result.extracted.name}` : '',
    result.extracted.date ? `${copy.date}: ${result.extracted.date}` : '',
    result.extracted.time ? `${copy.time}: ${result.extracted.time}` : '',
    result.extracted.city ?? result.extracted.placeText
      ? `${copy.birthPlace}: ${[
          result.extracted.city ?? result.extracted.placeText,
          result.extracted.state,
          result.extracted.country,
        ]
          .filter(Boolean)
          .join(', ')}`
      : '',
  ].filter(Boolean);

  if (result.ambiguities.length > 0) {
    return [
      copy.confirmation,
      result.ambiguities[0].issue,
      result.ambiguities[0].options?.length
        ? `${copy.options}: ${result.ambiguities[0].options.join(' / ')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  const requiredMissing = result.missingFields.filter(
    field => field !== 'name' && field !== 'country' && field !== 'state',
  );

  if (requiredMissing.length > 0) {
    return [
      details.length ? `${copy.found}:\n${details.join('\n')}` : copy.partial,
      `${copy.missing}: ${requiredMissing
        .map(field => copy[field] ?? field)
        .join(', ')}.`,
      copy.missingHelp,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    copy.ready,
    details.join('\n'),
    copy.backendBoundary,
  ].join('\n\n');
}

function extractionCopy(language: SupportedLanguage): Record<string, string> {
  if (language === 'hi') {
    return {
      backendBoundary:
        'Web flow mobile की तरह backend AI boundary इस्तेमाल करता है. Calculated kundli active होते ही full chart reading चलेगी.',
      am_pm: 'AM या PM',
      birthPlace: 'जन्म स्थान',
      birth_place: 'जन्म स्थान',
      city: 'शहर',
      country: 'देश',
      confirmation: 'अधिकतर विवरण मिल गए, लेकिन एक बात confirm करनी है.',
      date: 'तारीख',
      found: 'मिला',
      missingHelp:
        'इन details के बिना मैं real kundli calculate नहीं करूंगी. Time नहीं पता हो तो “time unknown” लिख दें.',
      missing: 'Missing',
      name: 'नाम',
      options: 'Options',
      partial: 'एक बात समझ में आई. अब kundli के लिए बाकी details चाहिए.',
      ready: 'Kundli generation के लिए जरूरी birth details मिल गए.',
      state: 'राज्य',
      time: 'समय',
    };
  }
  if (language === 'gu') {
    return {
      backendBoundary:
        'Web flow mobile જેવી backend AI boundary વાપરે છે. Calculated kundli active થતા full chart reading ચાલશે.',
      am_pm: 'AM કે PM',
      birthPlace: 'જન્મ સ્થળ',
      birth_place: 'જન્મ સ્થળ',
      city: 'શહેર',
      country: 'દેશ',
      confirmation: 'મોટાભાગની વિગતો મળી, પણ એક બાબત confirm કરવી છે.',
      date: 'તારીખ',
      found: 'મળ્યું',
      missingHelp:
        'આ details વગર હું real kundli calculate નહીં કરું. Time ખબર ન હોય તો “time unknown” લખો.',
      missing: 'Missing',
      name: 'નામ',
      options: 'Options',
      partial: 'એક બાબત સમજાઈ. હવે kundli માટે બાકીની details જોઈએ.',
      ready: 'Kundli generation માટે જરૂરી birth details મળી ગઈ.',
      state: 'રાજ્ય',
      time: 'સમય',
    };
  }
  return {
    backendBoundary:
      'The web flow now uses the same backend AI boundary as mobile. Full chart readings will run once a calculated kundli is active on web.',
    am_pm: 'AM or PM',
    birthPlace: 'Birth place',
    birth_place: 'birth place',
    city: 'city',
    country: 'country',
    confirmation: 'I found most details, but one part needs confirmation.',
    date: 'Date',
    found: 'I found',
    missingHelp:
      'I will not calculate a real kundli until these are clear. If you do not know the time, write “time unknown” and I will guide you.',
    missing: 'Missing',
    name: 'Name',
    options: 'Options',
    partial: 'I caught one piece. Now I need the remaining birth details for the kundli.',
    ready: 'I found the birth details needed for kundli generation.',
    state: 'state or province',
    time: 'Time',
  };
}

function chatPlaceholder(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Birth details लिखें या calculated kundli से पूछें...';
  }
  if (language === 'gu') {
    return 'Birth details લખો અથવા calculated kundli પરથી પૂછો...';
  }
  return 'Share birth details or ask from a calculated kundli...';
}

function looksLikeBirthDetails(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    /\b\d{1,2}[:.]\d{2}\b/.test(normalized) ||
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(normalized) ||
    /(born|birth|dob|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/.test(
      normalized,
    )
  );
}

function createKundliFirstReply(language: SupportedLanguage, text: string): string {
  const safety = hasHighStakesLanguage(text)
    ? `${getSafetyBoundaryCopy(language)}\n\n`
    : '';

  if (language === 'hi') {
    return `${safety}मैं आपके साथ हूं. इस सवाल का सही chart-based जवाब देने के लिए पहले Kundli चाहिए. कृपया जन्म तारीख, जन्म समय और जन्म स्थान भेजें, या Dashboard > Kundli खोलें. Har Har Mahadev.`;
  }
  if (language === 'gu') {
    return `${safety}હું તમારી સાથે છું. આ પ્રશ્નનો સાચો chart-based જવાબ આપવા માટે પહેલા Kundli જોઈએ. કૃપા કરીને જન્મ તારીખ, જન્મ સમય અને જન્મ સ્થળ મોકલો, અથવા Dashboard > Kundli ખોલો. Har Har Mahadev.`;
  }
  return `${safety}I am with you. To answer this from your real chart, I need your Kundli first. Share your date of birth, birth time, and birth place, or open Dashboard > Kundli. Har Har Mahadev.`;
}
