'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@pridicta/types';

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
};

type SpeechRecognitionErrorLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type UseLightweightSpeechInputOptions = {
  language: SupportedLanguage;
  onFinalTranscript?: (transcript: string) => void;
  onTranscript: (transcript: string) => void;
};

type UseLightweightSpeechInputResult = {
  isListening: boolean;
  isSupported: boolean;
  startListening: () => boolean;
  stopListening: () => void;
};

const SPEECH_LANGUAGE_BY_APP_LANGUAGE: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  gu: 'gu-IN',
  hi: 'hi-IN',
};

export function useLightweightSpeechInput({
  language,
  onFinalTranscript,
  onTranscript,
}: UseLightweightSpeechInputOptions): UseLightweightSpeechInputResult {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
        Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    );
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Recognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!Recognition) {
      setIsListening(false);
      return false;
    }

    recognitionRef.current?.stop();

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = SPEECH_LANGUAGE_BY_APP_LANGUAGE[language] ?? 'en-IN';
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onresult = event => {
      let transcript = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? '';
      }

      const cleanedTranscript = transcript.trim();
      if (cleanedTranscript) {
        onTranscript(cleanedTranscript);
      }

      const finalResult = event.results[event.results.length - 1];
      if (finalResult?.isFinal) {
        if (cleanedTranscript) {
          onFinalTranscript?.(cleanedTranscript);
        }
        recognition.stop();
      }
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
      return true;
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
      return false;
    }
  }, [language, onFinalTranscript, onTranscript]);

  useEffect(() => stopListening, [stopListening]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}
