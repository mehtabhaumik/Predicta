'use client';

import { useMemo, useState } from 'react';
import {
  buildNoKundliResponse,
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  buildSmallTalkResponse,
  getRandomPredictaIntro,
  isSmallTalkPrompt,
  shouldUseLocalNoKundliResponse,
} from '@pridicta/ai';
import type {
  ChartContext,
  ConversationTurn,
  KundliData,
  PridictaChatResponse,
} from '@pridicta/types';
import { resolvePredictaWebBackendUrl } from '@pridicta/config';
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
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('Thinking through your question...');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'intro',
      role: 'pridicta',
      text: getRandomPredictaIntro({
        hasKundli: Boolean(kundli),
      }),
    },
  ]);

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

    setInput('');
    setMessages(current => [...current, userMessage]);

    if (isSmallTalkPrompt(question)) {
      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: buildSmallTalkResponse(question, {
            chartContext,
            hasKundli: Boolean(kundli),
          }),
        },
      ]);
      return;
    }

    setWaitingMessage(
      buildPredictaWaitingMessage(question, chartContext, {
        hasKundli: Boolean(kundli),
      }),
    );

    if (!kundli && shouldUseLocalNoKundliResponse(question)) {
      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: buildNoKundliResponse(question, {
            history,
          }),
        },
      ]);
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(`${backendUrl}/ai/pridicta`, {
        body: JSON.stringify({
          chartContext,
          history,
          kundli,
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

      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: payload.text.trim(),
        },
      ]);
    } catch {
      setMessages(current => [
        ...current,
        {
          id: `pridicta-${Date.now()}`,
          role: 'pridicta',
          text: kundli
            ? buildLocalPredictaFallback(question, kundli, chartContext, {
                history,
              })
            : buildNoKundliResponse(question, {
                history,
              }),
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
            kundli
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
