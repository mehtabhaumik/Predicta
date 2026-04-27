'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildPredictaIntelligenceContext,
  buildNoKundliResponse,
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  guardPredictaResponse,
  getRandomPredictaIntro,
  updateUserAstrologyMemory,
  validatePredictaResponse,
} from '@pridicta/ai';
import type {
  AstrologyMemory,
  ChartContext,
  ConversationTurn,
  KundliData,
  PridictaChatResponse,
} from '@pridicta/types';
import { resolvePredictaWebBackendUrl } from '@pridicta/config';
import { resolveKundliFromChatMemory } from '../lib/chatKundliResolver';
import { Card } from './Card';

type ChatMessage = {
  id: string;
  role: 'user' | 'pridicta';
  text: string;
};

type PredictaChatClientProps = {
  chartContext?: ChartContext;
  kundli?: KundliData;
};

export function PredictaChatClient({
  chartContext,
  kundli,
}: PredictaChatClientProps): React.JSX.Element {
  const [activeKundli, setActiveKundli] = useState<KundliData | undefined>(kundli);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('Thinking through your question...');
  const [memory, setMemory] = useState<AstrologyMemory>({
    birthDetailsComplete: Boolean(activeKundli),
    birthDetails: activeKundli?.birthDetails,
    kundliReady: Boolean(activeKundli),
    knownConcerns: [],
    previousGuidance: [],
    previousTopics: [],
    userName: activeKundli?.birthDetails.name,
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'intro',
      role: 'pridicta',
      text: getRandomPredictaIntro({
        hasKundli: Boolean(activeKundli),
      }),
    },
  ]);

  useEffect(() => {
    if (!kundli) {
      return;
    }

    setActiveKundli(kundli);
    setMemory(current => ({
      ...current,
      activeKundliId: kundli.id,
      birthDetails: kundli.birthDetails,
      birthDetailsComplete: true,
      kundliReady: true,
      userName: kundli.birthDetails.name,
    }));
  }, [kundli]);

  const history = useMemo<ConversationTurn[]>(
    () =>
      messages
        .filter(message => message.id !== 'intro')
        .map(message => ({
          role: message.role,
          text: message.text,
        })),
    [messages],
  );

  const backendUrl = useMemo(
    () =>
      resolvePredictaWebBackendUrl({
        configuredUrl: process.env.NEXT_PUBLIC_PRIDICTA_BACKEND_URL,
      }),
    [],
  );

  async function askPredicta() {
    const question = input.trim();
    if (!question || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };
    const nextHistory = [...history, { role: 'user' as const, text: question }];
    const intelligenceContext = buildPredictaIntelligenceContext({
      chartContext,
      history: nextHistory,
      kundli: activeKundli,
      memory,
      message: question,
    });
    setMemory(intelligenceContext.memory);

    setInput('');
    setMessages(current => [...current, userMessage]);

    setWaitingMessage(
      buildPredictaWaitingMessage(question, chartContext, {
        hasKundli: Boolean(activeKundli),
      }),
    );

    setIsSending(true);
    let resolvedKundli = activeKundli;
    let effectiveIntelligenceContext = intelligenceContext;

    try {
      if (!resolvedKundli) {
        const kundliResolution = await resolveKundliFromChatMemory({
          backendUrl,
          fallbackName:
            intelligenceContext.memory.userName?.trim() || 'Predicta Seeker',
          memory: intelligenceContext.memory,
        });

        if (kundliResolution.kundli) {
          resolvedKundli = kundliResolution.kundli;
          setActiveKundli(kundliResolution.kundli);
          const mergedMemory = updateUserAstrologyMemory({
            chartContext,
            existingMemory: intelligenceContext.memory,
            history: nextHistory,
            kundli: kundliResolution.kundli,
            preferredLanguage: intelligenceContext.memory.preferredLanguage,
          });
          setMemory(mergedMemory);
          effectiveIntelligenceContext = buildPredictaIntelligenceContext({
            chartContext,
            history: nextHistory,
            kundli: kundliResolution.kundli,
            memory: mergedMemory,
            message: question,
          });

          if (isBirthDetailOnlyMessage(question)) {
            const finalText =
              'Okay, I have your details now and I have generated the kundli. Ask what you want me to read first, and I will answer from the actual chart instead of guessing.';

            setMemory(current =>
              updateUserAstrologyMemory({
                chartContext,
                existingMemory: current,
                history: [...nextHistory, { role: 'pridicta', text: finalText }],
                kundli: kundliResolution.kundli,
                preferredLanguage: current.preferredLanguage,
              }),
            );
            setMessages(current => [
              ...current,
              {
                id: `pridicta-${Date.now()}`,
                role: 'pridicta',
                text: finalText,
              },
            ]);
            return;
          }
        }
      }

      const response = await fetch(`${backendUrl}/ai/pridicta`, {
        body: JSON.stringify({
          chartContext,
          history,
          intelligenceContext: effectiveIntelligenceContext,
          kundli: resolvedKundli,
          message: question,
          userPlan: 'FREE',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Predicta guidance is temporarily unavailable.');
      }

      const payload = (await response.json()) as PridictaChatResponse;
      if (!payload.text?.trim()) {
        throw new Error('Predicta guidance is temporarily unavailable.');
      }
      const guardedText = guardPredictaResponse({
        history: nextHistory,
        intentProfile: effectiveIntelligenceContext.intentProfile,
        memory: effectiveIntelligenceContext.memory,
        text: payload.text.trim(),
      });
      const validation = validatePredictaResponse({
        chartContext,
        intentProfile: effectiveIntelligenceContext.intentProfile,
        kundli: resolvedKundli,
        memory: effectiveIntelligenceContext.memory,
        reasoningContext: effectiveIntelligenceContext.reasoningContext,
        text: guardedText,
      });
      const finalText = validation.valid
        ? guardedText
        : resolvedKundli
          ? buildLocalPredictaFallback(question, resolvedKundli, chartContext, {
              history: nextHistory,
            })
          : buildNoKundliResponse(question, {
              history: nextHistory,
            });

      setMemory(
        updateUserAstrologyMemory({
          chartContext,
          existingMemory: effectiveIntelligenceContext.memory,
          history: [...nextHistory, { role: 'pridicta', text: finalText }],
          kundli: resolvedKundli,
          preferredLanguage: memory.preferredLanguage,
        }),
      );

      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: finalText,
        },
      ]);
    } catch {
      const fallbackText = guardPredictaResponse({
        history: nextHistory,
        intentProfile: effectiveIntelligenceContext.intentProfile,
        memory: effectiveIntelligenceContext.memory,
        text: resolvedKundli
          ? buildLocalPredictaFallback(question, resolvedKundli, chartContext, {
              history: nextHistory,
            })
          : buildNoKundliResponse(question, {
              history: nextHistory,
            }),
      });
      setMemory(
        updateUserAstrologyMemory({
          chartContext,
          existingMemory: effectiveIntelligenceContext.memory,
          history: [...nextHistory, { role: 'pridicta', text: fallbackText }],
          kundli: resolvedKundli,
          preferredLanguage: memory.preferredLanguage,
        }),
      );
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
      setWaitingMessage('Thinking through your question...');
    }
  }

  return (
    <Card className="chat-panel">
      <div className="chat-thread" aria-live="polite">
        {messages.map(message => (
          <div className={`message ${message.role}`} key={message.id}>
            <span>{message.role === 'user' ? 'You' : 'Predicta'}</span>
            <p>{message.text}</p>
          </div>
        ))}
        {isSending ? (
          <div className="message pridicta glass-panel">
            <span>Predicta</span>
            <p>{waitingMessage}</p>
          </div>
        ) : null}
      </div>
      <form
        className="chat-input-row"
        onSubmit={event => {
          event.preventDefault();
          void askPredicta();
        }}
      >
        <input
          aria-label="Ask Predicta"
          disabled={isSending}
          onChange={event => setInput(event.target.value)}
          placeholder={
            activeKundli
              ? 'Ask Predicta anything about your chart...'
              : 'Ask a life question or start with your birth details...'
          }
          value={input}
        />
        <button className="button" disabled={isSending || !input.trim()} type="submit">
          {isSending ? 'Reading' : 'Ask'}
        </button>
      </form>
    </Card>
  );
}

function isBirthDetailOnlyMessage(text: string): boolean {
  if (/[?]/.test(text)) {
    return false;
  }

  return !/\b(finance|financial|career|job|marriage|married|relationship|love|health|remedy|timing|future|chart|kundli|report|dasha|transit|delay|delayed|compatibility)\b/i.test(
    text,
  );
}
