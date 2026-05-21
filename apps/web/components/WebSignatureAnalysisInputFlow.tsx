'use client';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import { composeSignatureAnalysisModel } from '@pridicta/astrology';
import type {
  SignatureAnalysisModel,
  SignatureTraitKey,
  SignatureTraitValue,
  SupportedLanguage,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { PredictaWorldFrame } from './PredictaWorldFrame';

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
    chatPromptFallback: string;
    chatPromptReady: string;
    openLabel: string;
    title: string;
  };
  privacy: {
    items: string[];
    title: string;
  };
  proof: Array<{
    body: string;
    title: string;
  }>;
  proofLabel: string;
  preview: {
    body: string;
    empty: string;
    ready: string;
    title: string;
  };
  report: {
    body: string;
    cta: string;
    eyebrow: string;
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
      askPredicta: 'Chat with Signature Predicta',
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
      chatPromptFallback:
        'Open Signature Predicta. Explain what signature shape, pressure, spacing, baseline, size, and rhythm can suggest. Keep it private, safe, and reflective.',
      chatPromptReady: 'Open Signature Predicta. Use these confirmed signature traits.',
      eyebrow: 'SIGNATURE PREDICTA',
      openLabel: 'Open',
      title: 'Read self-expression from a signature.',
    },
    proofLabel: 'Proof',
    privacy: {
      items: [
        'The signature preview stays on this browser in this phase.',
        'Do not use a legal, banking, or government signature if you are not comfortable.',
        'You can use a practice signature or initials for the first reading.',
      ],
      title: 'Privacy first',
    },
    proof: [
      {
        body:
          'Predicta reads visible signature traits only after you upload, draw, or confirm them.',
        title: 'Visible traits',
      },
      {
        body:
          'The reading stays reflective. It does not verify identity, diagnose health, or make legal claims.',
        title: 'Safe boundary',
      },
      {
        body:
          'Signature reading can later be combined with Numerology only when you ask for synthesis.',
        title: 'Optional synthesis',
      },
    ],
    preview: {
      body:
        'Once a signature is ready, Predicta can explain what shape, pressure, spacing, and rhythm usually represent in simple language.',
      empty: 'No signature selected yet.',
      ready: 'Signature ready locally',
      title: 'Signature preview',
    },
    report: {
      body:
        'Turn the confirmed signature traits into a reflection report, improvement plan, or Signature + Numerology synthesis.',
      cta: 'Build Signature report',
      eyebrow: 'REPORT PATH',
      title: 'Signature report path',
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
      askPredicta: 'हस्ताक्षर प्रेडिक्टा से चैट करें',
      clear: 'हस्ताक्षर हटाएं',
      download: 'कॉपी सेव करें',
      useDrawing: 'इस चित्र का उपयोग करें',
      upload: 'हस्ताक्षर छवि चुनें',
    },
    canvas: {
      aria: 'अपना हस्ताक्षर बनाएं',
      empty: 'यहां माउस, ट्रैकपैड या टच से बनाएं.',
      help: 'स्वाभाविक हस्ताक्षर करें. आप इसे कभी भी हटा सकते हैं.',
      title: 'हस्ताक्षर बनाएं',
    },
    hero: {
      body:
        'निजी, चिंतन-आधारित हस्ताक्षर वाचन के लिए हस्ताक्षर अपलोड करें या बनाएं. प्रेडिक्टा इसे पराशरी, कृष्णमूर्ति पद्धति, नाड़ी और अंक ज्योतिष से अलग रखती है.',
      chatPromptFallback:
        'हस्ताक्षर प्रेडिक्टा खोलें. समझाएं कि हस्ताक्षर का आकार, दबाव, अंतर, रेखा की दिशा, आकार और लय क्या संकेत दे सकते हैं. उत्तर निजी, सुरक्षित और चिंतनशील रहे.',
      chatPromptReady: 'हस्ताक्षर प्रेडिक्टा खोलें. इन पुष्टि किए गए हस्ताक्षर संकेतों का उपयोग करें.',
      eyebrow: 'हस्ताक्षर प्रेडिक्टा',
      openLabel: 'खोलें',
      title: 'हस्ताक्षर से आत्म-अभिव्यक्ति पढ़ें.',
    },
    proofLabel: 'प्रमाण',
    privacy: {
      items: [
        'इस चरण में हस्ताक्षर पूर्वावलोकन इसी डिवाइस पर रहता है.',
        'अगर सहज न हों तो कानूनी, बैंकिंग या सरकारी हस्ताक्षर का उपयोग न करें.',
        'पहले वाचन के लिए अभ्यास हस्ताक्षर या आद्याक्षर भी उपयोग कर सकते हैं.',
      ],
      title: 'पहले निजता',
    },
    proof: [
      {
        body:
          'प्रेडिक्टा केवल वही हस्ताक्षर संकेत पढ़ती है जिन्हें आप अपलोड, बनाकर या पुष्टि करके देते हैं.',
        title: 'दिखने वाले संकेत',
      },
      {
        body:
          'यह वाचन चिंतन के लिए है. यह पहचान, स्वास्थ्य निदान या कानूनी दावा नहीं करता.',
        title: 'सुरक्षित सीमा',
      },
      {
        body:
          'हस्ताक्षर वाचन को अंक ज्योतिष के साथ तभी जोड़ा जाता है जब आप संयुक्त सार मांगते हैं.',
        title: 'वैकल्पिक संयुक्त सार',
      },
    ],
    preview: {
      body:
        'हस्ताक्षर तैयार होने के बाद प्रेडिक्टा आकार, दबाव, अंतर और लय का सरल अर्थ समझा सकती है.',
      empty: 'अभी कोई हस्ताक्षर चयनित नहीं है.',
      ready: 'हस्ताक्षर यहां तैयार है',
      title: 'हस्ताक्षर पूर्वावलोकन',
    },
    report: {
      body:
        'पुष्टि किए गए हस्ताक्षर संकेतों को चिंतन रिपोर्ट, सुधार योजना या हस्ताक्षर + अंक ज्योतिष संयुक्त सार में बदलें.',
      cta: 'हस्ताक्षर रिपोर्ट बनाएं',
      eyebrow: 'रिपोर्ट मार्ग',
      title: 'हस्ताक्षर रिपोर्ट मार्ग',
    },
    safety: {
      body:
        'हस्ताक्षर विश्लेषण आत्म-समझ और चिंतन के लिए है. यह पहचान सत्यापन, हस्तलेखन जांच, चिकित्सा निदान, कानूनी प्रमाण, भर्ती सलाह या निश्चित भविष्यवाणी नहीं है.',
      title: 'साफ सुरक्षा सीमा',
    },
    traits: {
      body:
        'सिर्फ वही संकेत चुनें जो साफ दिख रहा है. प्रेडिक्टा इन्हें हल्के चिंतन की तरह पढ़ती है, चरित्र प्रमाण की तरह नहीं.',
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
      summaryTitle: 'तैयार वाचन',
      title: 'दिखने वाले संकेत पुष्टि करें',
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: 'बहुत अमूर्त',
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
        partial: 'थोड़ा पढ़ने योग्य',
        right: 'दाएं',
        single: 'एक रेखा',
        small: 'छोटा',
        steady: 'स्थिर',
        tight: 'कम अंतर',
        upward: 'ऊपर जाती',
        wide: 'ज्यादा अंतर',
      },
    },
    upload: {
      body:
        'ऐसी साफ छवि उपयोग करें जिसमें सिर्फ हस्ताक्षर दिखे. पहचान पत्र, पता, खाता संख्या और निजी दस्तावेज काट दें.',
      hint: 'PNG, JPG या WebP सबसे अच्छा है.',
      title: 'हस्ताक्षर अपलोड करें',
    },
  },
  gu: {
    actions: {
      askPredicta: 'સહી પ્રેડિક્ટા સાથે ચેટ કરો',
      clear: 'સહી દૂર કરો',
      download: 'કોપી સેવ કરો',
      useDrawing: 'આ ચિત્ર વાપરો',
      upload: 'સહી છબી પસંદ કરો',
    },
    canvas: {
      aria: 'તમારી સહી દોરો',
      empty: 'અહીં માઉસ, ટ્રેકપેડ અથવા સ્પર્શથી દોરો.',
      help: 'સ્વાભાવિક સહી કરો. તમે તેને ક્યારેય પણ દૂર કરી શકો છો.',
      title: 'સહી દોરો',
    },
    hero: {
      body:
        'ખાનગી, વિચાર-આધારિત સહી વાચન માટે સહી અપલોડ કરો અથવા દોરો. પ્રેડિક્ટા તેને પરાશરી, કૃષ્ણમૂર્તિ પદ્ધતિ, નાડી અને અંક જ્યોતિષથી અલગ રાખે છે.',
      chatPromptFallback:
        'સહી પ્રેડિક્ટા ખોલો. સમજાવો કે સહીનો આકાર, દબાણ, અંતર, લાઇનની દિશા, કદ અને લય શું સૂચવી શકે છે. જવાબ ખાનગી, સુરક્ષિત અને વિચારશીલ રાખો.',
      chatPromptReady: 'સહી પ્રેડિક્ટા ખોલો. આ પુષ્ટિ કરેલા સહી સંકેતોનો ઉપયોગ કરો.',
      eyebrow: 'સહી પ્રેડિક્ટા',
      openLabel: 'ખોલો',
      title: 'સહીમાંથી આત્મ-અભિવ્યક્તિ વાંચો.',
    },
    proofLabel: 'પુરાવો',
    privacy: {
      items: [
        'આ તબક્કામાં સહી પૂર્વાવલોકન આ જ ડિવાઇસ પર રહે છે.',
        'સહજ ન લાગે તો કાનૂની, બેન્કિંગ અથવા સરકારી સહીનો ઉપયોગ ન કરો.',
        'પહેલા વાચન માટે અભ્યાસ સહી અથવા આદ્યાક્ષર પણ વાપરી શકો છો.',
      ],
      title: 'પહેલા ગોપનીયતા',
    },
    proof: [
      {
        body:
          'પ્રેડિક્ટા ફક્ત તે સહી સંકેતો વાંચે છે જેને તમે અપલોડ, દોરીને અથવા પુષ્ટિ કરીને આપો છો.',
        title: 'દેખાતા સંકેતો',
      },
      {
        body:
          'આ વાચન વિચાર માટે છે. તે ઓળખ, આરોગ્ય નિદાન અથવા કાનૂની દાવો કરતી નથી.',
        title: 'સુરક્ષિત સીમા',
      },
      {
        body:
          'સહી વાચનને અંક જ્યોતિષ સાથે ત્યારે જ જોડવામાં આવે છે જ્યારે તમે સંયુક્ત સાર માંગો છો.',
        title: 'વૈકલ્પિક સંયુક્ત સાર',
      },
    ],
    preview: {
      body:
        'સહી તૈયાર થયા પછી પ્રેડિક્ટા આકાર, દબાણ, અંતર અને લયનો સરળ અર્થ સમજાવી શકે છે.',
      empty: 'હજુ કોઈ સહી પસંદ કરેલી નથી.',
      ready: 'સહી અહીં તૈયાર છે',
      title: 'સહી પૂર્વાવલોકન',
    },
    report: {
      body:
        'પુષ્ટિ કરેલા સહી સંકેતોને વિચાર રિપોર્ટ, સુધારણા યોજના અથવા સહી + અંક જ્યોતિષ સંયુક્ત સારમાં બદલો.',
      cta: 'સહી રિપોર્ટ બનાવો',
      eyebrow: 'રિપોર્ટ માર્ગ',
      title: 'સહી રિપોર્ટ માર્ગ',
    },
    safety: {
      body:
        'સહી વિશ્લેષણ આત્મ-સમજ અને વિચાર માટે છે. આ ઓળખ ચકાસણી, હસ્તલેખન તપાસ, તબીબી નિદાન, કાનૂની પુરાવો, ભરતી સલાહ અથવા ખાતરીવાળી આગાહી નથી.',
      title: 'સ્પષ્ટ સુરક્ષા સીમા',
    },
    traits: {
      body:
        'ફક્ત જે સંકેત સ્પષ્ટ દેખાય તે પસંદ કરો. પ્રેડિક્ટા તેને હળવા વિચાર તરીકે વાંચે છે, સ્વભાવના પુરાવા તરીકે નહીં.',
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
      summaryTitle: 'તૈયાર વાચન',
      title: 'દેખાતા સંકેતોની પુષ્ટિ કરો',
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: 'ખૂબ અમૂર્ત',
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
        partial: 'થોડી વાંચી શકાય તેવી',
        right: 'જમણી',
        single: 'એક રેખા',
        small: 'નાની',
        steady: 'સ્થિર',
        tight: 'ઓછું અંતર',
        upward: 'ઉપર જતી',
        wide: 'વધુ અંતર',
      },
    },
    upload: {
      body:
        'એવી સ્પષ્ટ છબી વાપરો જેમાં માત્ર સહી દેખાય. ઓળખપત્ર, સરનામું, ખાતા નંબર અને ખાનગી દસ્તાવેજો કાપી નાખો.',
      hint: 'PNG, JPG અથવા WebP સૌથી સારું છે.',
      title: 'સહી અપલોડ કરો',
    },
  },
};

export function WebSignatureAnalysisInputFlow(): React.JSX.Element {
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

    const modelContext = buildSignatureChatPromptContext(
      analysisModel,
      copy,
      language,
    );
    const href = buildPredictaChatHref({
      school: 'SIGNATURE',
      prompt:
        analysisModel.status === 'ready'
          ? `${copy.hero.chatPromptReady} ${modelContext}`
          : copy.hero.chatPromptFallback,
      selectedSection: 'Signature Predicta input',
      sourceScreen: 'Signature Predicta',
    });

    window.location.assign(href);
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
    <div className="predicta-world-page predicta-world-page--signature kp-page-stack">
      <PredictaWorldFrame
        badge={copy.hero.eyebrow}
        body={copy.hero.body}
        chatAction={
          <button
            className="button primary"
            disabled={!canContinue}
            onClick={continueToPredicta}
            type="button"
          >
            {copy.actions.askPredicta}
          </button>
        }
        chatHref="#signature-input"
        chatLabel={copy.actions.askPredicta}
        eyebrow={copy.hero.eyebrow}
        localActions={[
          {
            href: '#signature-input',
            label: copy.upload.title,
            note:
              language === 'hi'
                ? 'छवि अपलोड करें या ड्रॉइंग से शुरुआत करें.'
                : language === 'gu'
                  ? 'છબી અપલોડ કરો અથવા ડ્રોઇંગથી શરૂઆત કરો.'
                  : 'Start with an upload or a fresh drawn signature.',
          },
          {
            href: '#signature-traits',
            label: copy.traits.title,
            note:
              language === 'hi'
                ? 'जो संकेत साफ दिखें, केवल उन्हें पुष्टि करें.'
                : language === 'gu'
                  ? 'જે સંકેતો સ્પષ્ટ દેખાય, ફક્ત તેમની પુષ્ટિ કરો.'
                  : 'Confirm only the visible traits that are actually present.',
          },
          {
            href: '#signature-preview',
            label: copy.preview.title,
            note:
              language === 'hi'
                ? 'तैयार वाचन और निजी पूर्वावलोकन यहीं देखें.'
                : language === 'gu'
                  ? 'તૈયાર વાચન અને ખાનગી પૂર્વાવલોકન અહીં જુઓ.'
                  : 'Review the prepared reading and private preview here.',
          },
          {
            href: '/dashboard/report',
            label: copy.report.cta,
            note:
              language === 'hi'
                ? 'जब सॉफ्ट रिफ्लेक्शन को रिपोर्ट में बदलना हो, यही अगला रास्ता है.'
                : language === 'gu'
                  ? 'જ્યારે હળવા પ્રતિબિંબને રિપોર્ટમાં ફેરવવો હોય, ત્યારે આ આગળનો માર્ગ છે.'
                  : 'Use the report path when the reflection needs structure or synthesis.',
          },
        ]}
        localEyebrow={copy.privacy.title}
        localTitle={
          language === 'hi'
            ? 'हस्ताक्षर तैयार करें, संकेत पुष्टि करें, फिर निजी रीडिंग खोलें.'
            : language === 'gu'
              ? 'સહી તૈયાર કરો, સંકેતોની પુષ્ટિ કરો, પછી ખાનગી વાચન ખોલો.'
              : 'Prepare the signature, confirm the visible traits, then open the private reading.'
        }
        pillars={[
          {
            label:
              language === 'hi'
                ? 'सीमा'
                : language === 'gu'
                  ? 'સીમા'
                  : 'Boundary',
            value: copy.safety.title,
          },
          {
            label:
              language === 'hi'
                ? 'इनपुट'
                : language === 'gu'
                  ? 'ઇનપુટ'
                  : 'Input',
            value: copy.upload.title,
          },
          {
            label:
              language === 'hi'
                ? 'वाचन'
                : language === 'gu'
                  ? 'વાચન'
                  : 'Reading',
            value: copy.traits.summaryTitle,
          },
        ]}
        proofCards={copy.proof}
        proofLabel={copy.proofLabel}
        reportAction={
          <Link className="button secondary" href="/dashboard/report">
            {copy.report.cta}
          </Link>
        }
        reportLabel={copy.report.cta}
        reportNote={copy.report.body}
        theme="signature"
        title={copy.hero.title}
      />

      <section className="signature-input-hero glass-panel" id="signature-input">
        <div>
          <div className="section-title">{copy.hero.eyebrow}</div>
          <h2>{copy.upload.title}</h2>
          <p>{copy.upload.body}</p>
          <div className="world-hero-actions inline">
            <button
              className="button primary"
              disabled={!canContinue}
              onClick={continueToPredicta}
              type="button"
            >
              {copy.actions.askPredicta}
            </button>
            <Link className="button secondary" href="/dashboard/report">
              {copy.report.cta}
            </Link>
          </div>
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

      <section className="signature-trait-panel glass-panel" id="signature-traits">
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
            <p>{buildPreparedReadingSummary(analysisModel, copy, language)}</p>
            <ul>
              {buildPreparedReadingItems(analysisModel, copy, language).map(item => {
                return <li key={item}>{item}</li>;
              })}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="signature-preview-panel glass-panel" id="signature-preview">
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

      <section className="signature-safety-panel glass-panel">
        <div className="section-title">{copy.report.eyebrow}</div>
        <h2>{copy.report.title}</h2>
        <p>{copy.report.body}</p>
        <div className="action-row">
          <Link className="button secondary" href="/dashboard/report">
            {copy.report.cta}
          </Link>
        </div>
      </section>
    </div>
  );
}

function buildPreparedReadingSummary(
  analysisModel: SignatureAnalysisModel,
  copy: SignatureCopy,
  language: SupportedLanguage,
): string {
  if (language === 'en') {
    return analysisModel.summary;
  }

  const mainSignals = analysisModel.observedTraits
    .slice(0, 3)
    .map(
      trait =>
        `${copy.traits.labels[trait.key]} ${copy.traits.values[trait.value]}`,
    )
    .join(', ');

  if (language === 'hi') {
    return `हस्ताक्षर वाचन ${analysisModel.observedTraits.length} दिखने वाले संकेतों के साथ तैयार है. मुख्य संकेत: ${mainSignals}.`;
  }

  return `સહી વાચન ${analysisModel.observedTraits.length} દેખાતા સંકેતો સાથે તૈયાર છે. મુખ્ય સંકેતો: ${mainSignals}.`;
}

function buildPreparedReadingItems(
  analysisModel: SignatureAnalysisModel,
  copy: SignatureCopy,
  language: SupportedLanguage,
): string[] {
  if (language === 'en') {
    return analysisModel.interpretationCards
      .slice(0, 3)
      .map(card => `${card.title}: ${card.plainMeaning}.`);
  }

  return analysisModel.observedTraits.slice(0, 3).map(
    trait => `${copy.traits.labels[trait.key]}: ${copy.traits.values[trait.value]}.`,
  );
}

function buildSignatureChatPromptContext(
  analysisModel: SignatureAnalysisModel,
  copy: SignatureCopy,
  language: SupportedLanguage,
): string {
  const observedTraits = buildPreparedReadingItems(
    analysisModel,
    copy,
    language,
  ).join(' ');

  if (language === 'en') {
    return [
      'Signature Predicta context:',
      buildPreparedReadingSummary(analysisModel, copy, language),
      `Observed traits: ${observedTraits}`,
      'Use only confirmed visible signature traits. Keep it reflective, safe, and never use it as identity verification or document proof.',
    ].join(' ');
  }

  if (language === 'hi') {
    return [
      'हस्ताक्षर प्रेडिक्टा संदर्भ:',
      buildPreparedReadingSummary(analysisModel, copy, language),
      `देखे गए संकेत: ${observedTraits}`,
      'केवल पुष्टि किए गए दिखने वाले संकेतों से पढ़ें. इसे चिंतन तक रखें, पहचान सत्यापन या दस्तावेज़ प्रमाण की तरह उपयोग न करें.',
    ].join(' ');
  }

  return [
    'હસ્તાક્ષર પ્રેડિક્ટા સંદર્ભ:',
    buildPreparedReadingSummary(analysisModel, copy, language),
    `જોવાયેલા સંકેતો: ${observedTraits}`,
    'ફક્ત પુષ્ટિ કરેલા દેખાતા સંકેતો પરથી વાંચો. આને વિચાર સુધી રાખો, ઓળખ ચકાસણી અથવા દસ્તાવેજ પુરાવા તરીકે ન વાપરો.',
  ].join(' ');
}
