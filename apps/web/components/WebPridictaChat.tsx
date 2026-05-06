'use client';

import { useEffect, useRef, useState } from 'react';
import { getLanguageLabels } from '@pridicta/config/language';
import {
  getFriendlyGreetingReply,
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
    } catch (error) {
      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text:
            error instanceof Error
              ? error.message
              : fallbackError(language),
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
              <span>{message.role === 'user' ? 'You' : 'Pridicta'}</span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            aria-label="Ask Pridicta"
            disabled={isSending}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder={chatPlaceholder(language)}
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
      text: welcomeMessage(language),
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

  if (result.missingFields.length > 0) {
    return [
      details.length ? `${copy.found}:\n${details.join('\n')}` : '',
      `${copy.missing}: ${result.missingFields.join(', ')}.`,
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
      birthPlace: 'जन्म स्थान',
      confirmation: 'अधिकतर विवरण मिल गए, लेकिन एक बात confirm करनी है.',
      date: 'तारीख',
      found: 'मिला',
      missing: 'Missing',
      name: 'नाम',
      options: 'Options',
      ready: 'Kundli generation के लिए जरूरी birth details मिल गए.',
      time: 'समय',
    };
  }
  if (language === 'gu') {
    return {
      backendBoundary:
        'Web flow mobile જેવી backend AI boundary વાપરે છે. Calculated kundli active થતા full chart reading ચાલશે.',
      birthPlace: 'જન્મ સ્થળ',
      confirmation: 'મોટાભાગની વિગતો મળી, પણ એક બાબત confirm કરવી છે.',
      date: 'તારીખ',
      found: 'મળ્યું',
      missing: 'Missing',
      name: 'નામ',
      options: 'Options',
      ready: 'Kundli generation માટે જરૂરી birth details મળી ગઈ.',
      time: 'સમય',
    };
  }
  return {
    backendBoundary:
      'The web flow now uses the same backend AI boundary as mobile. Full chart readings will run once a calculated kundli is active on web.',
    birthPlace: 'Birth place',
    confirmation: 'I found most details, but one part needs confirmation.',
    date: 'Date',
    found: 'I found',
    missing: 'Missing',
    name: 'Name',
    options: 'Options',
    ready: 'I found the birth details needed for kundli generation.',
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

function fallbackError(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'AI reading failed. कृपया फिर कोशिश करें.';
  }
  if (language === 'gu') {
    return 'AI reading failed. કૃપા કરીને ફરી પ્રયાસ કરો.';
  }
  return 'AI reading failed. Please try again.';
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

function welcomeMessage(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'अपनी जन्म तारीख, जन्म समय और जन्म स्थान बताएं, या calculated kundli से सवाल पूछें. Sanskrit/Jyotish शब्दों का अर्थ सरल भाषा में समझाया जाएगा.';
  }
  if (language === 'gu') {
    return 'તમારી જન્મ તારીખ, જન્મ સમય અને જન્મ સ્થળ જણાવો, અથવા calculated kundli પરથી પ્રશ્ન પૂછો. Sanskrit/Jyotish શબ્દોનો અર્થ સરળ ભાષામાં સમજાવવામાં આવશે.';
  }
  return 'Tell me your birth date, birth time, and birth place, or ask from a calculated kundli. Sanskrit and Jyotish terms will be explained simply.';
}

function createKundliFirstReply(language: SupportedLanguage, text: string): string {
  const safety = hasHighStakesLanguage(text)
    ? `${getSafetyBoundaryCopy(language)}\n\n`
    : '';

  if (language === 'hi') {
    return `${safety}पहले Kundli बनाएं. उसके बाद मैं आपके chart evidence से जवाब दूंगा. Start here: Dashboard > Kundli.`;
  }
  if (language === 'gu') {
    return `${safety}પહેલા Kundli બનાવો. ત્યાર પછી હું તમારા chart evidence પરથી જવાબ આપીશ. Start here: Dashboard > Kundli.`;
  }
  return `${safety}Create your Kundli first. Then I will answer from your own chart evidence. Start here: Dashboard > Kundli.`;
}
