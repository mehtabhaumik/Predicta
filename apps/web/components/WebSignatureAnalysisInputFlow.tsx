'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type PointerEvent,
} from 'react';
import {
  SIGNATURE_PRIVACY_COPY,
  SIGNATURE_REPORT_PRIVACY_COPY,
  SIGNATURE_SCAN_LABELS,
  SIGNATURE_SHORT_PRIVACY_COPY,
  composeSignatureAnalysisModel,
  extractSignatureTraitObservations,
} from '@pridicta/astrology';
import type {
  SignatureAnalysisModel,
  SignatureTraitKey,
  SignatureTraitObservation,
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
  mode: 'draw' | 'upload';
  note: string;
  observedTraits?: Partial<Record<SignatureTraitKey, SignatureTraitValue>>;
};

type SignatureScanStatus = 'empty' | 'ready' | 'scanning';

type SignatureCopy = {
  actions: {
    askPredicta: string;
    clear: string;
    download: string;
    redraw: string;
    reupload: string;
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
  receipt: {
    adjust: string;
    confidence: Record<'clear' | 'partial' | 'uncertain', string>;
    detectedBody: string;
    drawnPlaceholder: string;
    looksRight: string;
    missing: string;
    notAssessed: string;
    privacyShort: string;
    ready: string;
    scanned: string;
    scanning: string;
    scanLabels: string[];
    scanProgressLabel: string;
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
  { key: 'speed', options: ['slow', 'moderate', 'fast'] },
  { key: 'flourish', options: ['none', 'moderate', 'expansive'] },
  { key: 'underline', options: ['none', 'single', 'high'] },
  { key: 'letter-connection', options: ['connected', 'mixed', 'disconnected'] },
  { key: 'margin-use', options: ['compact', 'balanced', 'expansive'] },
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
      redraw: 'Re-draw signature',
      reupload: 'Re-upload signature',
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
        SIGNATURE_PRIVACY_COPY,
        SIGNATURE_SHORT_PRIVACY_COPY,
        'Do not use a legal, banking, or government signature if you are not comfortable.',
        'Your previous signature image was not stored. Please re-upload or re-draw it to continue.',
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
    receipt: {
      adjust: 'Adjust traits',
      confidence: {
        clear: 'clear',
        partial: 'partial',
        uncertain: 'uncertain',
      },
      detectedBody:
        'Predicta detected these visible traits from your current signature. Please confirm or adjust anything that looks off.',
      drawnPlaceholder: 'Signature drawn in this session',
      looksRight: 'Looks right',
      missing:
        'Your previous signature image was not stored. Please re-upload or re-draw it to continue.',
      notAssessed: 'Not assessed',
      privacyShort: SIGNATURE_SHORT_PRIVACY_COPY,
      ready: 'Signature traits ready. Please confirm what looks right.',
      scanned: 'Signature scanned',
      scanning: 'Scanning your signature expression...',
      scanLabels: SIGNATURE_SCAN_LABELS,
      scanProgressLabel: 'Signature scan progress',
    },
    traits: {
      body:
        'Predicta detected these visible traits from your current signature. Please confirm or adjust anything that looks off.',
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
      askPredicta: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2e623089bd"),
      clear: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8d381a4bbc"),
      download: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.65e4031f46"),
      redraw: getNativeCopy('signature.receipt.actions.redraw.hi'),
      reupload: getNativeCopy('signature.receipt.actions.reupload.hi'),
      useDrawing: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.136b9a7b32"),
      upload: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9e30f80456"),
    },
    canvas: {
      aria: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.90711847c5"),
      empty: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.7dab154212"),
      help: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a1cbd590d1"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.3e38d8505a"),
    },
    hero: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b90e465671"),
      chatPromptFallback:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ca02113c31"),
      chatPromptReady: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ec560db104"),
      eyebrow: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.61d1bb2452"),
      openLabel: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.901879c422"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.45036be472"),
    },
    proofLabel: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.94d3627e46"),
    privacy: {
      items: [
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.839e44e3a3"),
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8f7efab5a1"),
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.0ba6625c68"),
      ],
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.1e4e8fc099"),
    },
    proof: [
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.5858296caa"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a201b2ad24"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c9462a44af"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.76be207438"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.610fcad5a4"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8d9470ff50"),
      },
    ],
    preview: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.5d005935fe"),
      empty: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6fa5908ca2"),
      ready: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ffdf82b69f"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.3fba8a2db2"),
    },
    report: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.5647df5926"),
      cta: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.e442131b33"),
      eyebrow: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2a58941e16"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.bcb211ecbb"),
    },
    safety: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8968de077e"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.25e0b522e2"),
    },
    receipt: {
      adjust: getNativeCopy('signature.receipt.adjust.hi'),
      confidence: {
        clear: getNativeCopy('signature.receipt.clearConfidence.hi'),
        partial: getNativeCopy('signature.receipt.partialConfidence.hi'),
        uncertain: getNativeCopy('signature.receipt.uncertainConfidence.hi'),
      },
      detectedBody: getNativeCopy('signature.receipt.detectedBody.hi'),
      drawnPlaceholder: getNativeCopy('signature.receipt.drawn.hi'),
      looksRight: getNativeCopy('signature.receipt.looksRight.hi'),
      missing: getNativeCopy('signature.receipt.missing.hi'),
      notAssessed: getNativeCopy('signature.receipt.notAssessed.hi'),
      privacyShort: getNativeCopy('signature.receipt.privacyShort.hi'),
      ready: getNativeCopy('signature.receipt.ready.hi'),
      scanned: getNativeCopy('signature.receipt.scanned.hi'),
      scanning: getNativeCopy('signature.receipt.scanning.hi'),
      scanLabels: [
        getNativeCopy('signature.receipt.scan.baseline.hi'),
        getNativeCopy('signature.receipt.scan.slant.hi'),
        getNativeCopy('signature.receipt.scan.rhythm.hi'),
        getNativeCopy('signature.receipt.scan.legibility.hi'),
        getNativeCopy('signature.receipt.scan.flourish.hi'),
      ],
      scanProgressLabel: getNativeCopy('signature.receipt.scanProgressLabel.hi'),
    },
    traits: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.dc0b517e95"),
      labels: {
        baseline: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c49c390915"),
        'capital-emphasis': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2bb288c0c1"),
        flourish: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8227420af6"),
        legibility: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.148dceee24"),
        'letter-connection': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.50d9cef5c2"),
        'margin-use': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.7e0145ec51"),
        pressure: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9dc252d2dc"),
        'signature-size': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a68cd59e9f"),
        slant: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.7c0dc808ae"),
        spacing: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cc95dfe340"),
        speed: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.e553b13df6"),
        underline: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.60ee6c60ad"),
      },
      summaryTitle: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4d262ff3e7"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cb2caf6458"),
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.98fd540899"),
        balanced: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.f7c78e24a3"),
        clear: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b94172d315"),
        downward: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c2e3dc35cc"),
        expansive: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b29373be4c"),
        heavy: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2bde36b489"),
        large: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cf03817480"),
        left: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6025e96ffe"),
        light: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.0f64eb9a6d"),
        medium: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.151a391fb1"),
        mixed: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9ad1f1cedc"),
        moderate: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2817f07a22"),
        none: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.01522e35dd"),
        partial: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.397a8a1245"),
        right: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.f150000103"),
        single: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.28f07119d8"),
        small: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6aec1d9f30"),
        steady: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4fa815ac3f"),
        tight: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.30fb5bb9e4"),
        upward: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d8d22d7152"),
        wide: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.05b2d800a6"),
      },
    },
    upload: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cd43b41f49"),
      hint: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c9e7051818"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.24feec78f2"),
    },
  },
  gu: {
    actions: {
      askPredicta: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2e089f8d56"),
      clear: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b890629137"),
      download: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d269ed9829"),
      redraw: getNativeCopy('signature.receipt.actions.redraw.gu'),
      reupload: getNativeCopy('signature.receipt.actions.reupload.gu'),
      useDrawing: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.17ba897714"),
      upload: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4a40d077ff"),
    },
    canvas: {
      aria: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.79ffd3781e"),
      empty: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4e571929db"),
      help: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.bd0eb01601"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.05f79fce2f"),
    },
    hero: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b92faa1229"),
      chatPromptFallback:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a715206f55"),
      chatPromptReady: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2c521a66c5"),
      eyebrow: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.de715f3016"),
      openLabel: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.e0185a82d6"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.fb653c53c9"),
    },
    proofLabel: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d8e7018875"),
    privacy: {
      items: [
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4264f58f00"),
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.535856228d"),
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.bd6977af6a"),
      ],
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d5cc6f7bda"),
    },
    proof: [
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ffa5293311"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2565064ae5"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.160a795aaa"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c8fce8a5ef"),
      },
      {
        body:
          getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6a27941250"),
        title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ae3e28878d"),
      },
    ],
    preview: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.66c51750ef"),
      empty: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.fbf9eea882"),
      ready: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9847483a75"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.98db769694"),
    },
    report: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.3ff190b528"),
      cta: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9f7c38e03e"),
      eyebrow: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6b9f52686c"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4c842ccb5a"),
    },
    safety: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ddc86992a0"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.7608e39455"),
    },
    receipt: {
      adjust: getNativeCopy('signature.receipt.adjust.gu'),
      confidence: {
        clear: getNativeCopy('signature.receipt.clearConfidence.gu'),
        partial: getNativeCopy('signature.receipt.partialConfidence.gu'),
        uncertain: getNativeCopy('signature.receipt.uncertainConfidence.gu'),
      },
      detectedBody: getNativeCopy('signature.receipt.detectedBody.gu'),
      drawnPlaceholder: getNativeCopy('signature.receipt.drawn.gu'),
      looksRight: getNativeCopy('signature.receipt.looksRight.gu'),
      missing: getNativeCopy('signature.receipt.missing.gu'),
      notAssessed: getNativeCopy('signature.receipt.notAssessed.gu'),
      privacyShort: getNativeCopy('signature.receipt.privacyShort.gu'),
      ready: getNativeCopy('signature.receipt.ready.gu'),
      scanned: getNativeCopy('signature.receipt.scanned.gu'),
      scanning: getNativeCopy('signature.receipt.scanning.gu'),
      scanLabels: [
        getNativeCopy('signature.receipt.scan.baseline.gu'),
        getNativeCopy('signature.receipt.scan.slant.gu'),
        getNativeCopy('signature.receipt.scan.rhythm.gu'),
        getNativeCopy('signature.receipt.scan.legibility.gu'),
        getNativeCopy('signature.receipt.scan.flourish.gu'),
      ],
      scanProgressLabel: getNativeCopy('signature.receipt.scanProgressLabel.gu'),
    },
    traits: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.44d389eff5"),
      labels: {
        baseline: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2a04b5fc90"),
        'capital-emphasis': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.dc1420ff8c"),
        flourish: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.48e71af82b"),
        legibility: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.3fd822c47a"),
        'letter-connection': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6188a5890a"),
        'margin-use': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.0d6a5dad15"),
        pressure: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.67e9408d19"),
        'signature-size': getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.dd278e57f8"),
        slant: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cc6887d613"),
        spacing: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.0984419841"),
        speed: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.637f5319d8"),
        underline: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.18b3cab2a3"),
      },
      summaryTitle: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.85fff65237"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.49feabdc54"),
      values: {
        ...SIGNATURE_TRAIT_VALUES_EN,
        abstract: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9e52673cd7"),
        balanced: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.368f2e1772"),
        clear: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6369b869b8"),
        downward: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4a5b121bf2"),
        expansive: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.df4f16f2b6"),
        heavy: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d27beb19e9"),
        large: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.99faaa96a4"),
        left: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.391a0c7352"),
        light: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.09557f1be9"),
        medium: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.fbb412035d"),
        mixed: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2e5a810939"),
        moderate: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.fce73b4fe0"),
        none: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.f7ced09b18"),
        partial: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.e88f1b9c95"),
        right: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.04168c5e02"),
        single: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.7940d82b03"),
        small: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.bb8df8075d"),
        steady: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.4ac42d543f"),
        tight: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.87ff5cacf0"),
        upward: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.07136b0e9d"),
        wide: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c9fb71b040"),
      },
    },
    upload: {
      body:
        getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.041a693235"),
      hint: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a330ee87f3"),
      title: getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.06f8000b57"),
    },
  },
};

export function WebSignatureAnalysisInputFlow(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = SIGNATURE_COPY[language] ?? SIGNATURE_COPY.en;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const scanTimeoutRef = useRef<number | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [mode, setMode] = useState<SignatureDraft['mode']>('draw');
  const [hasDrawing, setHasDrawing] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [scanStatus, setScanStatus] = useState<SignatureScanStatus>('empty');
  const [detectedTraits, setDetectedTraits] = useState<
    Partial<Record<SignatureTraitKey, SignatureTraitValue>>
  >({});
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

  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        window.clearTimeout(scanTimeoutRef.current);
      }
    };
  }, []);

  const canContinue = Boolean(previewUrl || hasDrawing);
  const analysisModel = useMemo(
    () =>
      composeSignatureAnalysisModel({
        inputSource: mode === 'draw' ? 'drawn-signature' : 'uploaded-image',
        observedTraits: canContinue ? observedTraits : {},
        confirmationState: 'confirmed',
      }),
    [canContinue, mode, observedTraits],
  );
  const detectedTraitObservations = useMemo(
    () => extractSignatureTraitObservations(detectedTraits, 'unconfirmed'),
    [detectedTraits],
  );
  const confirmedTraitObservations = useMemo(
    () => extractSignatureTraitObservations(observedTraits, 'confirmed'),
    [observedTraits],
  );
  const canOpenReading = canContinue && analysisModel.status === 'ready';

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        void prepareUploadedSignature(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function prepareUploadedSignature(
    previewDataUrl: string,
  ): Promise<void> {
    const hasVisibleSignature =
      await previewDataUrlHasVisibleInk(previewDataUrl);
    if (!hasVisibleSignature) {
      clearSignature();
      return;
    }

    setPreviewUrl(previewDataUrl);
    setMode('upload');
    setHasDrawing(false);
    setIsReady(false);
    startTemporaryScan('upload');
  }

  function startTemporaryScan(nextMode: SignatureDraft['mode']): void {
    if (nextMode === 'draw' && !hasDrawing) {
      return;
    }

    const nextTraits = buildTemporaryDetectedTraits(nextMode);
    setDetectedTraits(nextTraits);
    setObservedTraits({});
    setScanStatus('scanning');
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
    }
    scanTimeoutRef.current = window.setTimeout(() => {
      scanTimeoutRef.current = undefined;
      setScanStatus('ready');
      setIsReady(false);
    }, 1600);
  }

  function confirmDetectedTraits(): void {
    if (!canContinue || scanStatus !== 'ready') {
      return;
    }

    setObservedTraits(detectedTraits);
    setIsReady(true);
  }

  function adjustDetectedTraits(): void {
    if (!canContinue || scanStatus === 'empty') {
      return;
    }

    setObservedTraits(current =>
      Object.keys(current).length ? current : detectedTraits,
    );
    setIsReady(false);
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
    if (scanTimeoutRef.current) {
      window.clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = undefined;
    }

    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }

    setPreviewUrl(undefined);
    setHasDrawing(false);
    setIsReady(false);
    setScanStatus('empty');
    setDetectedTraits({});
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
    if (!canContinue || analysisModel.status !== 'ready') {
      return false;
    }

    const draft: SignatureDraft = {
      analysisModel,
      createdAt: new Date().toISOString(),
      mode,
      note:
        'Derived confirmed traits only. Predicta did not store the raw signature image.',
      observedTraits,
    };
    localStorage.setItem(SIGNATURE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
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
    if (!canContinue) {
      return;
    }

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
            disabled={!canOpenReading}
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
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.19291b20fe")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.378bede9ac")
                  : 'Start with an upload or a fresh drawn signature.',
          },
          {
            href: '#signature-traits',
            label: copy.traits.title,
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.31de48dcad")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b332e279c3")
                  : 'Confirm only the visible traits that are actually present.',
          },
          {
            href: '#signature-preview',
            label: copy.preview.title,
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a5bc3fe09d")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.2e57123d43")
                  : 'Review the prepared reading and private preview here.',
          },
          {
            href: '/dashboard/report',
            label: copy.report.cta,
            note:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.0cfd0a332a")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c78633ffeb")
                  : 'Use the report path when the reflection needs structure or synthesis.',
          },
        ]}
        localEyebrow={copy.privacy.title}
        localTitle={
          language === 'hi'
            ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a68b8ba292")
            : language === 'gu'
              ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.9e4e969726")
              : 'Prepare the signature, confirm the visible traits, then open the private reading.'
        }
        pillars={[
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.6909e9b264")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.d71971faa7")
                  : 'Boundary',
            value: copy.safety.title,
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.8c25d980c3")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.1e7a173f2f")
                  : 'Input',
            value: copy.upload.title,
          },
          {
            label:
              language === 'hi'
                ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.da4cf8c726")
                : language === 'gu'
                  ? getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.cfdbea66fc")
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
              disabled={!canOpenReading}
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
            <span>{mode === 'upload' && canContinue ? copy.actions.reupload : copy.actions.upload}</span>
          </label>
          {mode === 'upload' ? (
            <SignatureImmediateReceipt
              confirmedTraits={confirmedTraitObservations}
              copy={copy}
              detectedTraits={detectedTraitObservations}
              hasSignatureInput={canContinue}
              isReady={isReady}
              onAdjust={adjustDetectedTraits}
              onClear={clearSignature}
              onConfirm={confirmDetectedTraits}
              previewUrl={previewUrl}
              scanStatus={scanStatus}
            />
          ) : null}
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
              setMode('draw');
              startTemporaryScan('draw');
            }}
            type="button"
          >
            {mode === 'draw' && scanStatus !== 'empty'
              ? copy.actions.redraw
              : copy.actions.useDrawing}
          </button>
          {mode === 'draw' ? (
            <SignatureImmediateReceipt
              confirmedTraits={confirmedTraitObservations}
              copy={copy}
              detectedTraits={detectedTraitObservations}
              hasSignatureInput={canContinue}
              isReady={isReady}
              onAdjust={adjustDetectedTraits}
              onClear={clearSignature}
              onConfirm={confirmDetectedTraits}
              previewUrl={previewUrl}
              scanStatus={scanStatus}
            />
          ) : null}
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
                    disabled={!canContinue}
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
        {canContinue && analysisModel.status === 'ready' ? (
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
            disabled={!canOpenReading}
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
    return formatNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.88dc9b1ffc", [analysisModel.observedTraits.length, mainSignals]);
  }

  return formatNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.e087899122", [analysisModel.observedTraits.length, mainSignals]);
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

function SignatureImmediateReceipt({
  confirmedTraits,
  copy,
  detectedTraits,
  hasSignatureInput,
  isReady,
  onAdjust,
  onClear,
  onConfirm,
  previewUrl,
  scanStatus,
}: {
  confirmedTraits: SignatureTraitObservation[];
  copy: SignatureCopy;
  detectedTraits: SignatureTraitObservation[];
  hasSignatureInput: boolean;
  isReady: boolean;
  onAdjust: () => void;
  onClear: () => void;
  onConfirm: () => void;
  previewUrl?: string;
  scanStatus: SignatureScanStatus;
}): React.JSX.Element {
  const visibleTraits = confirmedTraits.length
    ? confirmedTraits
    : detectedTraits;
  const canConfirm =
    hasSignatureInput && scanStatus === 'ready' && detectedTraits.length > 0;
  const canAdjust = hasSignatureInput && scanStatus !== 'empty';

  return (
    <div className="signature-inline-receipt">
      <div className="signature-inline-preview">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" src={previewUrl} />
        ) : (
          <span>{copy.receipt.drawnPlaceholder}</span>
        )}
        {scanStatus === 'scanning' ? <span className="signature-scan-beam" /> : null}
      </div>
      <div className="signature-scan-status">
        <span>
          {scanStatus === 'scanning'
            ? copy.receipt.scanning
            : scanStatus === 'ready' && hasSignatureInput
              ? copy.receipt.scanned
              : copy.receipt.missing}
        </span>
        <small>{copy.receipt.privacyShort}</small>
      </div>
      <div className="signature-scan-labels" aria-label={copy.receipt.scanProgressLabel}>
        {copy.receipt.scanLabels.map(label => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <p className="signature-detection-copy">{copy.receipt.detectedBody}</p>
      <div className="signature-trait-chip-grid">
        {visibleTraits.map(trait => (
          <span className="signature-trait-chip" key={trait.key}>
            {copy.traits.labels[trait.key]}: {copy.traits.values[trait.value]}
            <em>{copy.receipt.confidence[trait.confidence]}</em>
          </span>
        ))}
        {!visibleTraits.length ? (
          <span className="signature-trait-chip">
            {copy.receipt.notAssessed}<em>{copy.receipt.confidence.uncertain}</em>
          </span>
        ) : null}
      </div>
      {isReady ? (
        <p className="signature-ready-copy">{copy.receipt.ready}</p>
      ) : null}
      <div className="signature-action-row">
        <button
          className="button primary"
          disabled={!canConfirm}
          onClick={onConfirm}
          type="button"
        >
          {copy.receipt.looksRight}
        </button>
        <button
          className="button secondary"
          disabled={!canAdjust}
          onClick={onAdjust}
          type="button"
        >
          {copy.receipt.adjust}
        </button>
        <button className="button danger" onClick={onClear} type="button">
          {copy.actions.clear}
        </button>
      </div>
      <p className="signature-privacy-mini">{copy.receipt.privacyShort}</p>
    </div>
  );
}

async function previewDataUrlHasVisibleInk(
  previewDataUrl: string,
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const nextImage = new Image();
    nextImage.onload = () => resolve(nextImage);
    nextImage.onerror = () =>
      reject(new Error('Signature image could not be read.'));
    nextImage.src = previewDataUrl;
  }).catch(() => undefined);

  if (!image) {
    return false;
  }

  const canvas = document.createElement('canvas');
  const maxSide = 160;
  const scale = Math.min(
    1,
    maxSide /
      Math.max(
        image.naturalWidth || image.width,
        image.naturalHeight || image.height,
        1,
      ),
  );
  canvas.width = Math.max(
    1,
    Math.floor((image.naturalWidth || image.width) * scale),
  );
  canvas.height = Math.max(
    1,
    Math.floor((image.naturalHeight || image.height) * scale),
  );

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    return false;
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let visiblePixels = 0;
  let darkOrColoredPixels = 0;

  for (let index = 0; index < data.length; index += 4) {
    const alpha = data[index + 3] ?? 0;
    if (alpha < 24) {
      continue;
    }

    visiblePixels += 1;
    const red = data[index] ?? 255;
    const green = data[index + 1] ?? 255;
    const blue = data[index + 2] ?? 255;
    const brightness = (red + green + blue) / 3;
    const colorSpread = Math.max(red, green, blue) - Math.min(red, green, blue);

    if (brightness < 245 || colorSpread > 12) {
      darkOrColoredPixels += 1;
    }
  }

  const minimumInkPixels = Math.max(18, Math.floor(visiblePixels * 0.002));
  return darkOrColoredPixels >= minimumInkPixels;
}

function buildTemporaryDetectedTraits(
  mode: SignatureDraft['mode'],
): Partial<Record<SignatureTraitKey, SignatureTraitValue>> {
  if (mode === 'upload') {
    return {
      baseline: 'steady',
      flourish: 'moderate',
      legibility: 'partial',
      'letter-connection': 'mixed',
      'margin-use': 'balanced',
      pressure: 'medium',
      'signature-size': 'medium',
      slant: 'right',
      spacing: 'balanced',
      speed: 'moderate',
      underline: 'none',
    };
  }

  return {
    baseline: 'upward',
    flourish: 'moderate',
    legibility: 'partial',
    'letter-connection': 'connected',
    'margin-use': 'balanced',
    pressure: 'medium',
    'signature-size': 'medium',
    slant: 'right',
    spacing: 'balanced',
    speed: 'moderate',
    underline: 'single',
  };
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
      getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.24bec7794f"),
      buildPreparedReadingSummary(analysisModel, copy, language),
      formatNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.a48d8ff3ef", [observedTraits]),
      getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.c83e0cde0f"),
    ].join(' ');
  }

  return [
    getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.b4cdec5d1a"),
    buildPreparedReadingSummary(analysisModel, copy, language),
    formatNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.86c2fe770d", [observedTraits]),
    getNativeCopy("native.apps.web.components.WebSignatureAnalysisInputFlow.tsx.ad7bebcde8"),
  ].join(' ');
}
