'use client';

import { useRouter } from 'next/navigation';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import {
  buildSignaturePredictaPromptContext,
  composeSignatureAnalysisModel,
} from '@pridicta/astrology';
import type {
  SignatureAnalysisModel,
  SignatureTraitKey,
  SignatureTraitValue,
  SupportedLanguage,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';

const SIGNATURE_DRAFT_STORAGE_KEY = 'pridicta.signatureDraft.v1';

type SignatureDraft = {
  analysisModel?: SignatureAnalysisModel;
  createdAt: string;
  imageDataUrl?: string;
  mode: 'draw' | 'upload';
  note: string;
  observedTraits?: Partial<Record<SignatureTraitKey, SignatureTraitValue>>;
};

type SignatureCopy = {
  actions: {
    askPredicta: string;
    clear: string;
    download: string;
    useDrawing: string;
    upload: string;
  };
  canvas: {
    aria: string;
    empty: string;
    help: string;
    title: string;
  };
  hero: {
    body: string;
    eyebrow: string;
    title: string;
  };
  privacy: {
    items: string[];
    title: string;
  };
  preview: {
    body: string;
    empty: string;
    ready: string;
    title: string;
  };
  safety: {
    body: string;
    title: string;
  };
  traits: {
    body: string;
    labels: Record<SignatureTraitKey, string>;
    summaryTitle: string;
    title: string;
    values: Record<SignatureTraitValue, string>;
  };
  upload: {
    body: string;
    hint: string;
    title: string;
  };
};

const SIGNATURE_TRAIT_CONTROLS: Array<{
  key: SignatureTraitKey;
  options: SignatureTraitValue[];
}> = [
  { key: 'baseline', options: ['upward', 'steady', 'downward', 'mixed'] },
  { key: 'signature-size', options: ['small', 'medium', 'large'] },
  { key: 'pressure', options: ['light', 'medium', 'heavy'] },
  { key: 'slant', options: ['left', 'steady', 'right', 'mixed'] },
  { key: 'legibility', options: ['clear', 'partial', 'abstract'] },
  { key: 'spacing', options: ['tight', 'balanced', 'wide'] },
  { key: 'flourish', options: ['none', 'moderate', 'expansive'] },
  { key: 'underline', options: ['none', 'single', 'high'] },
];

const SIGNATURE_TRAIT_LABELS_EN: Record<SignatureTraitKey, string> = {
  baseline: 'Baseline',
  'capital-emphasis': 'Capital emphasis',
  flourish: 'Flourish',
  legibility: 'Legibility',
  'letter-connection': 'Letter connection',
  'margin-use': 'Space use',
  pressure: 'Pressure',
  'signature-size': 'Signature size',
  slant: 'Slant',
  spacing: 'Spacing',
  speed: 'Rhythm',
  underline: 'Underline',
};

const SIGNATURE_TRAIT_VALUES_EN: Record<SignatureTraitValue, string> = {
  abstract: 'Abstract',
  balanced: 'Balanced',
  clear: 'Clear',
  compact: 'Compact',
  connected: 'Connected',
  disconnected: 'Separated',
  downward: 'Downward',
  expansive: 'Expansive',
  fast: 'Fast',
  heavy: 'Heavy',
  high: 'Strong',
  large: 'Large',
  left: 'Left',
  light: 'Light',
  low: 'Low',
  medium: 'Medium',
  mixed: 'Mixed',
  moderate: 'Moderate',
  none: 'None',
  partial: 'Partly readable',
  right: 'Right',
  single: 'Single',
  small: 'Small',
  slow: 'Slow',
  steady: 'Steady',
  tight: 'Tight',
  upward: 'Upward',
  wide: 'Wide',
};

const SIGNATURE_COPY: Record<SupportedLanguage, SignatureCopy> = {
  en: {
    actions: {
      askPredicta: 'Continue to Signature Predicta',
      clear: 'Clear signature',
      download: 'Save a copy',
      useDrawing: 'Use this drawing',
      upload: 'Choose signature image',
    },
    canvas: {
      aria: 'Draw your signature',
      empty: 'Draw here with mouse, trackpad, or touch.',
      help: 'Use a natural signature. You can clear it anytime.',
      title: 'Draw signature',
    },
    hero: {
      body:
        'Upload or draw a signature for a private, reflection-based signature reading. Predicta keeps this separate from Parashari, KP, Nadi, and Numerology.',
      eyebrow: 'SIGNATURE PREDICTA',
      title: 'Read self-expression from a signature.',
    },
    privacy: {
      items: [
        'The signature preview stays on this browser in this phase.',
        'Do not use a legal, banking, or government signature if you are not comfortable.',
        'You can use a practice signature or initials for the first reading.',
      ],
      title: 'Privacy first',
    },
    preview: {
      body:
        'Once a signature is ready, Predicta can explain what shape, pressure, spacing, and rhythm usually represent in simple language.',
      empty: 'No signature selected yet.',
      ready: 'Signature ready locally',
      title: 'Signature preview',
    },
    safety: {
      body:
        'Signature analysis is for self-understanding and reflection. It is not identity verification, handwriting forensics, medical diagnosis, legal proof, hiring advice, or a guaranteed prediction.',
      title: 'Clear safety boundary',
    },
    traits: {
      body:
        'Confirm only what you can clearly see. Predicta uses these traits as soft reflection, not as proof about character.',
      labels: SIGNATURE_TRAIT_LABELS_EN,
      summaryTitle: 'Prepared reading',
      title: 'Confirm visible traits',
      values: SIGNATURE_TRAIT_VALUES_EN,
    },
    upload: {
      body:
        'Use a clear image with only the signature visible. Crop out IDs, addresses, account numbers, and private documents.',
      hint: 'PNG, JPG, or WebP works best.',
      title: 'Upload signature',
    },
  },
  hi: {
    actions: {
      askPredicta: 'हस्ताक्षर प्रेडिक्टा में आगे बढ़ें',
      clear: 'हस्ताक्षर हटाएं',
      download: 'कॉपी सेव करें',
      useDrawing: 'इस ड्रॉइंग का उपयोग करें',
      upload: 'हस्ताक्षर इमेज चुनें',
    },
    canvas: {
      aria: 'अपना हस्ताक्षर बनाएं',
      empty: 'यहां माउस, ट्रैकपैड या टच से बनाएं.',
      help: 'स्वाभाविक हस्ताक्षर करें. आप इसे कभी भी हटा सकते हैं.',
      title: 'हस्ताक्षर बनाएं',
    },
    hero: {
      body:
        'निजी, reflection-based हस्ताक्षर reading के लिए हस्ताक्षर अपलोड करें या बनाएं. प्रेडिक्टा इसे पराशरी, KP, नाड़ी और अंक ज्योतिष से अलग रखती है.',
      eyebrow: 'हस्ताक्षर प्रेडिक्टा',
      title: 'हस्ताक्षर से self-expression पढ़ें.',
    },
    privacy: {
      items: [
        'इस चरण में हस्ताक्षर preview इसी browser पर रहता है.',
        'अगर सहज न हों तो legal, banking या government signature का उपयोग न करें.',
        'पहली reading के लिए practice signature या initials भी उपयोग कर सकते हैं.',
      ],
      title: 'पहले privacy',
    },
    preview: {
      body:
        'हस्ताक्षर तैयार होने के बाद प्रेडिक्टा shape, pressure, spacing और rhythm का सरल अर्थ समझा सकती है.',
      empty: 'अभी कोई हस्ताक्षर चयनित नहीं है.',
      ready: 'हस्ताक्षर यहां तैयार है',
      title: 'हस्ताक्षर preview',
    },
    safety: {
      body:
        'हस्ताक्षर analysis self-understanding और reflection के लिए है. यह identity verification, handwriting forensics, medical diagnosis, legal proof, hiring advice या guaranteed prediction नहीं है.',
      title: 'साफ सुरक्षा सीमा',
    },
    traits: {
      body:
        'सिर्फ वही trait चुनें जो साफ दिख रहा है. प्रेडिक्टा इन्हें soft reflection की तरह पढ़ती है, character proof की तरह नहीं.',
      labels: {
        baseline: 'लाइन की दिशा',
        'capital-emphasis': 'बड़े अक्षर का जोर',
        flourish: 'अतिरिक्त शैली',
        legibility: 'पढ़ने में स्पष्टता',
        'letter-connection': 'अक्षरों का जुड़ाव',
        'margin-use': 'जगह का उपयोग',
        pressure: 'दबाव',
        'signature-size': 'हस्ताक्षर का आकार',
        slant: 'झुकाव',
        spacing: 'अंतर',
        speed: 'लय',
        underline: 'अंडरलाइन',
      },
      summaryTitle: 'तैयार reading',
      title: 'दिखने वाले traits confirm करें',
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: 'बहुत abstract',
        balanced: 'संतुलित',
        clear: 'साफ',
        downward: 'नीचे जाती',
        expansive: 'फैली हुई',
        heavy: 'भारी',
        large: 'बड़ा',
        left: 'बाएं',
        light: 'हल्का',
        medium: 'मध्यम',
        mixed: 'मिला-जुला',
        moderate: 'मध्यम शैली',
        none: 'नहीं',
        partial: 'थोड़ा readable',
        right: 'दाएं',
        single: 'एक line',
        small: 'छोटा',
        steady: 'स्थिर',
        tight: 'कम अंतर',
        upward: 'ऊपर जाती',
        wide: 'ज्यादा अंतर',
      },
    },
    upload: {
      body:
        'ऐसी साफ image उपयोग करें जिसमें सिर्फ हस्ताक्षर दिखे. ID, address, account number और private documents crop कर दें.',
      hint: 'PNG, JPG या WebP सबसे अच्छा है.',
      title: 'हस्ताक्षर अपलोड करें',
    },
  },
  gu: {
    actions: {
      askPredicta: 'સહી પ્રેડિક્ટામાં આગળ વધો',
      clear: 'સહી દૂર કરો',
      download: 'કોપી સેવ કરો',
      useDrawing: 'આ drawing વાપરો',
      upload: 'સહી image પસંદ કરો',
    },
    canvas: {
      aria: 'તમારી સહી દોરો',
      empty: 'અહીં mouse, trackpad અથવા touch થી દોરો.',
      help: 'સ્વાભાવિક સહી કરો. તમે તેને ક્યારેય પણ દૂર કરી શકો છો.',
      title: 'સહી દોરો',
    },
    hero: {
      body:
        'ખાનગી, reflection-based સહી reading માટે સહી upload કરો અથવા દોરો. પ્રેડિક્ટા તેને પરાશરી, KP, નાડી અને અંક જ્યોતિષથી અલગ રાખે છે.',
      eyebrow: 'સહી પ્રેડિક્ટા',
      title: 'સહીમાંથી self-expression વાંચો.',
    },
    privacy: {
      items: [
        'આ તબક્કામાં સહી preview આ browser પર જ રહે છે.',
        'સહજ ન લાગે તો legal, banking અથવા government signature નો ઉપયોગ ન કરો.',
        'પહેલી reading માટે practice signature અથવા initials પણ વાપરી શકો છો.',
      ],
      title: 'પહેલા privacy',
    },
    preview: {
      body:
        'સહી તૈયાર થયા પછી પ્રેડિક્ટા shape, pressure, spacing અને rhythm નો સરળ અર્થ સમજાવી શકે છે.',
      empty: 'હજુ કોઈ સહી પસંદ કરેલી નથી.',
      ready: 'સહી અહીં તૈયાર છે',
      title: 'સહી preview',
    },
    safety: {
      body:
        'સહી analysis self-understanding અને reflection માટે છે. આ identity verification, handwriting forensics, medical diagnosis, legal proof, hiring advice અથવા guaranteed prediction નથી.',
      title: 'સ્પષ્ટ સુરક્ષા સીમા',
    },
    traits: {
      body:
        'ફક્ત જે trait સ્પષ્ટ દેખાય તે પસંદ કરો. પ્રેડિક્ટા તેને soft reflection તરીકે વાંચે છે, character proof તરીકે નહીં.',
      labels: {
        baseline: 'લાઇનની દિશા',
        'capital-emphasis': 'મોટા અક્ષરનો ભાર',
        flourish: 'વધારાની શૈલી',
        legibility: 'વાંચવાની સ્પષ્ટતા',
        'letter-connection': 'અક્ષરોનો જોડાણ',
        'margin-use': 'જગ્યાનો ઉપયોગ',
        pressure: 'દબાણ',
        'signature-size': 'સહીનું કદ',
        slant: 'ઝુકાવ',
        spacing: 'અંતર',
        speed: 'લય',
        underline: 'અંડરલાઇન',
      },
      summaryTitle: 'તૈયાર reading',
      title: 'દેખાતા traits confirm કરો',
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: 'ખૂબ abstract',
        balanced: 'સંતુલિત',
        clear: 'સ્પષ્ટ',
        downward: 'નીચે જતી',
        expansive: 'ફેલાયેલી',
        heavy: 'ભારે',
        large: 'મોટી',
        left: 'ડાબી',
        light: 'હળવી',
        medium: 'મધ્યમ',
        mixed: 'મિશ્ર',
        moderate: 'મધ્યમ શૈલી',
        none: 'નથી',
        partial: 'થોડી readable',
        right: 'જમણી',
        single: 'એક line',
        small: 'નાની',
        steady: 'સ્થિર',
        tight: 'ઓછું અંતર',
        upward: 'ઉપર જતી',
        wide: 'વધુ અંતર',
      },
    },
    upload: {
      body:
        'એવી સ્પષ્ટ image વાપરો જેમાં માત્ર સહી દેખાય. ID, address, account number અને private documents crop કરો.',
      hint: 'PNG, JPG અથવા WebP સૌથી સારું છે.',
      title: 'સહી upload કરો',
    },
  },
};

export function WebSignatureAnalysisInputFlow(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLanguagePreference();
  const copy = SIGNATURE_COPY[language] ?? SIGNATURE_COPY.en;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [mode, setMode] = useState<SignatureDraft['mode']>('draw');
  const [hasDrawing, setHasDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [observedTraits, setObservedTraits] = useState<
    Partial<Record<SignatureTraitKey, SignatureTraitValue>>
  >({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    context.scale(ratio, ratio);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 3.2;
    context.strokeStyle = 'rgba(255, 255, 255, 0.92)';
  }, []);

  const canContinue = Boolean(previewUrl || hasDrawing);
  const analysisModel = useMemo(
    () =>
      composeSignatureAnalysisModel({
        inputSource: mode === 'draw' ? 'drawn-signature' : 'uploaded-image',
        observedTraits,
      }),
    [mode, observedTraits],
  );

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setMode('upload');
        setIsReady(false);
      }
    };
    reader.readAsDataURL(file);
  }

  function pointerPosition(event: PointerEvent<HTMLCanvasElement>): {
    x: number;
    y: number;
  } {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDrawing(event: PointerEvent<HTMLCanvasElement>): void {
    const canvas = event.currentTarget;
    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = pointerPosition(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  }

  function continueDrawing(event: PointerEvent<HTMLCanvasElement>): void {
    if (!drawingRef.current) {
      return;
    }

    const context = event.currentTarget.getContext('2d');
    if (!context) {
      return;
    }

    const point = pointerPosition(event);
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasDrawing(true);
    setMode('draw');
    setPreviewUrl(undefined);
    setIsReady(false);
  }

  function stopDrawing(event: PointerEvent<HTMLCanvasElement>): void {
    if (drawingRef.current) {
      drawingRef.current = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }

  function clearSignature(): void {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setPreviewUrl(undefined);
    setHasDrawing(false);
    setIsReady(false);
    setObservedTraits({});
    localStorage.removeItem(SIGNATURE_DRAFT_STORAGE_KEY);
  }

  function getCurrentImageDataUrl(): string | undefined {
    if (previewUrl) {
      return previewUrl;
    }

    if (!hasDrawing || !canvasRef.current) {
      return undefined;
    }

    return canvasRef.current.toDataURL('image/png');
  }

  function saveDraft(): boolean {
    const imageDataUrl = getCurrentImageDataUrl();
    if (!imageDataUrl) {
      return false;
    }

    const draft: SignatureDraft = {
      analysisModel,
      createdAt: new Date().toISOString(),
      imageDataUrl,
      mode,
      note:
        'Stored locally for Signature Predicta input. This is reflective guidance, not identity verification or handwriting forensics.',
      observedTraits,
    };
    localStorage.setItem(SIGNATURE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    setPreviewUrl(imageDataUrl);
    setIsReady(true);
    return true;
  }

  function continueToPredicta(): void {
    if (!saveDraft()) {
      return;
    }

    const modelContext = buildSignaturePredictaPromptContext(analysisModel);

    router.push(
      buildPredictaChatHref({
        prompt:
          analysisModel.status === 'ready'
            ? `Open Signature Predicta. Use these confirmed signature traits. ${modelContext}`
            : 'Open Signature Predicta. Explain what signature shape, pressure, spacing, baseline, size, and rhythm can suggest. Keep it private, safe, and reflective.',
        selectedSection: 'Signature Predicta input',
        sourceScreen: 'Signature Predicta',
      }),
    );
  }

  function updateObservedTrait(
    key: SignatureTraitKey,
    value: SignatureTraitValue,
  ): void {
    setObservedTraits(current => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
    setIsReady(false);
  }

  function downloadSignature(): void {
    const imageDataUrl = getCurrentImageDataUrl();
    if (!imageDataUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = 'predicta-signature-input.png';
    link.click();
  }

  return (
    <>
      <div className="page-heading compact">
        <h1 className="gradient-text">{copy.hero.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.hero.eyebrow}</span>
            <strong>Open</strong>
          </summary>
          <p>{copy.hero.body}</p>
        </details>
      </div>

      <section className="signature-input-hero glass-panel">
        <div>
          <div className="section-title">{copy.hero.eyebrow}</div>
          <h2>{copy.hero.title}</h2>
          <p>{copy.hero.body}</p>
        </div>
        <div className="signature-privacy-card">
          <span>{copy.privacy.title}</span>
          <ul>
            {copy.privacy.items.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <div className="signature-input-grid">
        <section className="signature-input-card glass-panel">
          <div>
            <div className="section-title">{copy.upload.title}</div>
            <h2>{copy.upload.title}</h2>
            <p>{copy.upload.body}</p>
            <small>{copy.upload.hint}</small>
          </div>
          <label className="signature-upload-button">
            <input
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              type="file"
            />
            <span>{copy.actions.upload}</span>
          </label>
        </section>

        <section className="signature-input-card glass-panel">
          <div>
            <div className="section-title">{copy.canvas.title}</div>
            <h2>{copy.canvas.title}</h2>
            <p>{copy.canvas.help}</p>
          </div>
          <div className="signature-canvas-wrap">
            {!hasDrawing && !previewUrl ? (
              <span className="signature-canvas-empty">{copy.canvas.empty}</span>
            ) : null}
            <canvas
              aria-label={copy.canvas.aria}
              className="signature-canvas"
              onPointerCancel={stopDrawing}
              onPointerDown={startDrawing}
              onPointerLeave={stopDrawing}
              onPointerMove={continueDrawing}
              onPointerUp={stopDrawing}
              ref={canvasRef}
              role="img"
            />
          </div>
          <button
            className="button secondary"
            disabled={!hasDrawing}
            onClick={() => {
              if (saveDraft()) {
                setMode('draw');
              }
            }}
            type="button"
          >
            {copy.actions.useDrawing}
          </button>
        </section>
      </div>

      <section className="signature-trait-panel glass-panel">
        <div>
          <div className="section-title">{copy.traits.title}</div>
          <h2>{copy.traits.title}</h2>
          <p>{copy.traits.body}</p>
        </div>
        <div className="signature-trait-grid">
          {SIGNATURE_TRAIT_CONTROLS.map(control => (
            <div className="signature-trait-control" key={control.key}>
              <strong>{copy.traits.labels[control.key]}</strong>
              <div className="signature-trait-options">
                {control.options.map(option => (
                  <button
                    aria-pressed={observedTraits[control.key] === option}
                    className={
                      observedTraits[control.key] === option ? 'active' : ''
                    }
                    key={option}
                    onClick={() => updateObservedTrait(control.key, option)}
                    type="button"
                  >
                    {copy.traits.values[option]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {analysisModel.status === 'ready' ? (
          <div className="signature-trait-summary">
            <span>{copy.traits.summaryTitle}</span>
            <p>{analysisModel.summary}</p>
            <ul>
              {analysisModel.interpretationCards.slice(0, 3).map(card => (
                <li key={card.key}>
                  {card.title}: {card.plainMeaning}.
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="signature-preview-panel glass-panel">
        <div>
          <div className="section-title">{copy.preview.title}</div>
          <h2>{isReady || canContinue ? copy.preview.ready : copy.preview.empty}</h2>
          <p>{copy.preview.body}</p>
        </div>
        <div className="signature-preview-frame">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={previewUrl} />
          ) : hasDrawing ? (
            <span>{copy.preview.ready}</span>
          ) : (
            <span>{copy.preview.empty}</span>
          )}
        </div>
        <div className="signature-action-row">
          <button
            className="button"
            disabled={!canContinue}
            onClick={continueToPredicta}
            type="button"
          >
            {copy.actions.askPredicta}
          </button>
          <button
            className="button secondary"
            disabled={!canContinue}
            onClick={downloadSignature}
            type="button"
          >
            {copy.actions.download}
          </button>
          <button
            className="button danger"
            disabled={!canContinue}
            onClick={clearSignature}
            type="button"
          >
            {copy.actions.clear}
          </button>
        </div>
      </section>

      <section className="signature-safety-panel glass-panel">
        <div className="section-title">{copy.safety.title}</div>
        <p>{copy.safety.body}</p>
      </section>
    </>
  );
}
