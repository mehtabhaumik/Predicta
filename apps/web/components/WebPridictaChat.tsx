'use client';

import { useEffect, useRef, useState } from 'react';
import {
  buildPredictaActionReply,
  buildPredictaLearningSuggestion,
  learnPredictaInteraction,
  type PredictaInteractionMemory,
} from '@pridicta/astrology';
import { getLanguageLabels } from '@pridicta/config/language';
import {
  buildBirthIntakeReply,
  type PredictaBirthMemory,
} from '@pridicta/config/predictaMemory';
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
import type {
  BirthDetails,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import { findWebBirthPlace } from '../lib/birth-places';
import { useLanguagePreference } from '../lib/language-preference';
import {
  askPridictaFromWeb,
  extractBirthDetailsFromWeb,
} from '../lib/pridicta-ai';
import {
  generateKundliFromWeb,
  loadWebKundlis,
  loadWebKundli,
} from '../lib/web-kundli-storage';

const WEB_CHAT_MEMORY_KEY = 'predicta.webChatMemory.v4';

type WebMessage = {
  id: string;
  role: 'user' | 'pridicta';
  text: string;
};

type WebChatMemory = {
  birthMemory?: PredictaBirthMemory;
  messages: WebMessage[];
  predictaMemory?: PredictaInteractionMemory;
};

export function WebPridictaChat(): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { language } = useLanguagePreference();
  const labels = getLanguageLabels(language);
  const didLoadQueryPrompt = useRef(false);
  const didLoadMemory = useRef(false);
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);
  const [birthMemory, setBirthMemory] = useState<PredictaBirthMemory>();
  const [predictaMemory, setPredictaMemory] =
    useState<PredictaInteractionMemory>();
  const [messages, setMessages] = useState<WebMessage[]>(() =>
    buildInitialMessages(language),
  );

  useEffect(() => {
    setKundli(loadWebKundli());
    setSavedKundlis(loadWebKundlis());
    const stored = loadWebChatMemory();

    if (stored) {
      setBirthMemory(stored.birthMemory);
      setPredictaMemory(stored.predictaMemory);
      setMessages(
        stored.messages.length
          ? stored.messages
          : buildInitialMessages(language),
      );
    }

    didLoadMemory.current = true;
  }, []);

  useEffect(() => {
    if (!didLoadMemory.current) {
      return;
    }

    saveWebChatMemory({
      birthMemory,
      messages,
      predictaMemory,
    });
  }, [birthMemory, messages, predictaMemory]);

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
      const summary = await resolveSmartReply(text);
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
        : 'I could not complete that reading just now. I am still here with you; please try again with one focused question.';
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
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      undefined,
      activeKundli,
    );
    setPredictaMemory(nextMemory);
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

    return [
      formatAskWithProof(response.text, response.jyotishAnalysis),
      buildPredictaLearningSuggestion({
        hasPremiumAccess: false,
        kundli: activeKundli,
        language,
        memory: nextMemory,
        savedKundlis,
      }),
    ].join('\n\n');
  }

  async function resolveSmartReply(text: string): Promise<string> {
    if (isSimpleGreeting(text)) {
      return [
        getFriendlyGreetingReply(language),
        buildPredictaLearningSuggestion({
          hasPremiumAccess: false,
          kundli,
          language,
          memory: predictaMemory,
          savedKundlis,
        }),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    if (looksLikeBirthDetails(text)) {
      return handleBirthIntake(text);
    }

    const actionReply = buildPredictaActionReply({
      hasPremiumAccess: false,
      kundli,
      language,
      memory: predictaMemory,
      savedKundlis,
      text,
    });
    setPredictaMemory(actionReply.memory);

    if (actionReply.handled && actionReply.text) {
      return actionReply.text;
    }

    if (!kundli) {
      return createKundliFirstReply(language, text);
    }

    return askWithProof(text, kundli);
  }

  async function handleBirthIntake(text: string): Promise<string> {
    const result = await extractBirthDetailsFromWeb(text);
    const reply = buildBirthIntakeReply({
      language,
      memory: birthMemory,
      rawInput: text,
      result,
    });

    setBirthMemory({
      draft: reply.draft,
      updatedAt: new Date().toISOString(),
    });

    if (!reply.isReady) {
      return reply.text;
    }

    const place =
      findWebBirthPlace(reply.draft.city) ??
      findWebBirthPlace(reply.draft.placeText) ??
      findWebBirthPlace(
        [reply.draft.city, reply.draft.state, reply.draft.country]
          .filter(Boolean)
          .join(', '),
      );

    if (!place || !reply.draft.date || !reply.draft.time) {
      return buildPlaceClarificationReply(language, reply.text);
    }

    const placeParts = place.place.split(',').map(part => part.trim());
    const birthDetails: BirthDetails = {
      date: reply.draft.date,
      isTimeApproximate: reply.draft.isTimeApproximate,
      latitude: place.latitude,
      longitude: place.longitude,
      name: reply.draft.name?.trim() || 'Predicta Seeker',
      originalPlaceText: reply.draft.placeText,
      place: place.place,
      resolvedBirthPlace: {
        city: placeParts[0] || place.label,
        country: placeParts[placeParts.length - 1] || 'India',
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'local-dataset',
        state: placeParts[1],
        timezone: place.timezone,
      },
      time: reply.draft.time,
      timezone: place.timezone,
    };
    const nextKundli = await generateKundliFromWeb(birthDetails);
    setKundli(nextKundli);
    const nextSavedKundlis = loadWebKundlis();
    setSavedKundlis(nextSavedKundlis);
    setBirthMemory(undefined);
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      'chart',
      nextKundli,
    );
    setPredictaMemory(nextMemory);

    return [
      buildKundliCreatedReply(language, nextKundli),
      buildPredictaLearningSuggestion({
        hasPremiumAccess: false,
        kundli: nextKundli,
        language,
        memory: nextMemory,
        savedKundlis: nextSavedKundlis,
      }),
    ].join('\n\n');
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

function createKundliFirstReply(
  language: SupportedLanguage,
  text: string,
): string {
  const safety = hasHighStakesLanguage(text)
    ? `${getSafetyBoundaryCopy(language)}\n\n`
    : '';

  if (language === 'hi') {
    return `${safety}मैं आपके साथ हूं. इस सवाल का सही chart-based जवाब देने के लिए पहले Kundli चाहिए. यहीं chat में अपनी जन्म तारीख, जन्म समय और जन्म स्थान भेज दें. मैं Kundli यहीं बना दूंगी.`;
  }
  if (language === 'gu') {
    return `${safety}હું તમારી સાથે છું. આ પ્રશ્નનો સાચો chart-based જવાબ આપવા માટે પહેલા Kundli જોઈએ. અહીં chat માં જન્મ તારીખ, જન્મ સમય અને જન્મ સ્થળ મોકલો. હું Kundli અહીં જ બનાવી દઈશ.`;
  }
  return `${safety}I am with you. To answer this from your real chart, I need your Kundli first. Share your date of birth, birth time, and birth place right here, and I will create the Kundli inside this chat.`;
}

function buildPlaceClarificationReply(
  language: SupportedLanguage,
  readyText: string,
): string {
  if (language === 'hi') {
    return [
      readyText,
      'मैं Kundli यहीं बनाऊंगी. बस birth place थोड़ा और clear चाहिए: city, state, country लिख दें.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      readyText,
      'હું Kundli અહીં જ બનાવીશ. ફક્ત birth place થોડું વધુ clear જોઈએ: city, state, country લખો.',
    ].join('\n\n');
  }
  return [
    readyText,
    'I will create the Kundli right here. I just need the birth place a little clearer: city, state, country.',
  ].join('\n\n');
}

function buildKundliCreatedReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  const lines = [
    `Lagna: ${kundli.lagna}`,
    `Moon: ${kundli.moonSign}`,
    `Nakshatra: ${kundli.nakshatra}`,
    `Current dasha: ${kundli.dasha.current.mahadasha} / ${kundli.dasha.current.antardasha}`,
  ];

  if (language === 'hi') {
    return [
      'हो गया. मैंने Kundli यहीं chat में बना दी है और इसे active रख लिया है.',
      lines.join('\n'),
      'अब career, marriage, money, health tendencies, remedies, timing, या किसी decision पर पूछिए. मैं answer chart proof के साथ दूंगी.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      'થઈ ગયું. મેં Kundli અહીં chat માં બનાવી દીધી છે અને તેને active રાખી છે.',
      lines.join('\n'),
      'હવે career, marriage, money, health tendencies, remedies, timing અથવા કોઈ decision વિશે પૂછો. હું chart proof સાથે જવાબ આપીશ.',
    ].join('\n\n');
  }
  return [
    'Done. I created your Kundli right here in chat and made it the active chart.',
    lines.join('\n'),
    'Now ask me about career, marriage, money, health tendencies, remedies, timing, or any decision. I will answer with chart proof.',
  ].join('\n\n');
}

function loadWebChatMemory(): WebChatMemory | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_CHAT_MEMORY_KEY);
    return raw ? (JSON.parse(raw) as WebChatMemory) : undefined;
  } catch {
    return undefined;
  }
}

function saveWebChatMemory(memory: WebChatMemory): void {
  try {
    window.localStorage.setItem(
      WEB_CHAT_MEMORY_KEY,
      JSON.stringify({
        birthMemory: memory.birthMemory,
        messages: memory.messages.slice(-24),
        predictaMemory: memory.predictaMemory,
      }),
    );
  } catch {
    // Local chat memory is a convenience; Predicta can still work without it.
  }
}
