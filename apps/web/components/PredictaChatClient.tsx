'use client';

import { useMemo, useState } from 'react';
import {
  buildLocalPredictaFallback,
  buildPredictaWaitingMessage,
  buildSmallTalkResponse,
  isSmallTalkPrompt,
} from '@pridicta/ai';
import type { ConversationTurn, KundliData, PridictaChatResponse } from '@pridicta/types';
import { resolvePredictaWebBackendUrl } from '@pridicta/config';
import { Card } from './Card';

type ChatMessage = {
  id: string;
  role: 'user' | 'pridicta';
  text: string;
};

type PredictaChatClientProps = {
  kundli: KundliData;
};

export function PredictaChatClient({
  kundli,
}: PredictaChatClientProps): React.JSX.Element {
  const chartContext = {
    chartName: 'Dashamsha',
    chartType: 'D10',
    purpose: 'Career and responsibility',
    sourceScreen: 'Web Chat',
  } as const;
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState('Thinking through your question...');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'pridicta',
      text: 'Tell me what you want to understand. I will keep the reading focused, steady, and easy to follow.',
    },
    {
      id: 'preview-user',
      role: 'user',
      text: 'Why do I feel ready for a bigger role, but still pulled back by old responsibilities?',
    },
    {
      id: 'preview-pridicta',
      role: 'pridicta',
      text: 'Your chart suggests a threshold moment: ambition is growing, but Saturn asks you to carry it with structure instead of speed. The interesting signal is not “wait” or “rush”; it is to choose the role that lets you become more visible without abandoning the routines that keep you grounded. Treat the next step like a doorway, not a leap.',
    },
  ]);

  const history = useMemo<ConversationTurn[]>(
    () =>
      messages
        .filter(message => message.id !== 'welcome')
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
            hasKundli: true,
          }),
        },
      ]);
      return;
    }

    setWaitingMessage(buildPredictaWaitingMessage(question, chartContext));
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
          text: buildLocalPredictaFallback(question, kundli, chartContext),
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
          placeholder="Ask Predicta anything about your chart..."
          value={input}
        />
        <button className="button" disabled={isSending || !input.trim()} type="submit">
          {isSending ? 'Reading' : 'Ask'}
        </button>
      </form>
    </Card>
  );
}
