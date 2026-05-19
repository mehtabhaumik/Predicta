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
import type { SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';

const SIGNATURE_DRAFT_STORAGE_KEY = 'pridicta.signatureDraft.v1';

type SignatureDraft = {
  createdAt: string;
  imageDataUrl?: string;
  mode: 'draw' | 'upload';
  note: string;
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
  upload: {
    body: string;
    hint: string;
    title: string;
  };
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

  const chatHref = useMemo(
    () =>
      buildPredictaChatHref({
        prompt:
          'Open Signature Predicta. Explain what signature shape, pressure, spacing, baseline, size, and rhythm can suggest. Keep it private, safe, and reflective.',
        selectedSection: 'Signature Predicta input',
        sourceScreen: 'Signature Predicta',
      }),
    [],
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
      createdAt: new Date().toISOString(),
      imageDataUrl,
      mode,
      note:
        'Stored locally for Signature Predicta input. This is reflective guidance, not identity verification or handwriting forensics.',
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

    router.push(chatHref);
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
