import { getNativeCopy } from '@pridicta/config';
import type {
  ChartContext,
  ChatSuggestedCta,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';

type FollowUpInput = {
  context?: ChartContext;
  hasKundli: boolean;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  lastText: string;
};

export function buildChatFollowUps({
  context,
  hasKundli,
  hasPremiumAccess = false,
  kundli,
  language,
  lastText,
}: FollowUpInput): ChatSuggestedCta[] {
  const schoolHandoff = schoolHandoffFollowUps(lastText, kundli, language);
  const normalized = lastText.toLowerCase();

  if (schoolHandoff.length) {
    return schoolHandoff;
  }

  if (context?.selectedFamilyKarmaMap) {
    return localizeActions(
      [
        ['family-deeper', 'Ask deeper about the household pattern'],
        ['family-healing', 'Which pair heals fastest here?'],
        ['family-pressure', 'Who amplifies pressure in this map?'],
        ['family-guide', 'Give one practical household healing guide'],
      ],
      language,
    );
  }

  if (context?.selectedRelationshipMirror) {
    return localizeActions(
      [
        ['pair-deeper', 'Ask deeper about this pair'],
        ['pair-timing', 'Check timing pressure for this pair'],
        ['pair-remedy', 'Give one relationship repair step'],
        ['pair-compare', 'Compare with another person'],
      ],
      language,
    );
  }

  if (context?.reportFocus || context?.reportAvailableSections?.length) {
    return reportMemoryFollowUps(context, language);
  }

  if (context?.chartType) {
    return chartFollowUps(context, hasPremiumAccess, language);
  }

  if (!hasKundli) {
    return localizeActions(
      [
        ['dob', 'I only know my date of birth'],
        ['create', 'Create my Kundli from chat'],
        ['time-unknown', 'What if I do not know birth time?'],
      ],
      language,
    );
  }

  if (context?.selectedDecisionQuestion) {
    return localizeActions(
      [
        ['risk', 'Explain the risk in simple words'],
        ['timing', 'What timing window should I watch?'],
        ['remedy', 'Give me a grounded next step'],
      ],
      language,
    );
  }

  if (context?.selectedRemedyTitle) {
    return localizeActions(
      [
        ['why', 'Why this remedy for my chart?'],
        ['routine', 'Make this a 7-day routine'],
        ['stop', 'When should I stop or simplify it?'],
      ],
      language,
    );
  }

  if (context?.selectedPredictaWrapped) {
    return localizeActions(
      [
        ['theme', 'Explain my year theme'],
        ['window', 'Show my best and caution windows'],
        ['next-year', 'What should I prepare next year?'],
      ],
      language,
    );
  }

  if (
    matches(normalized, [
      'death',
      'divorce',
      'bankruptcy',
      'terminal',
      'hospital',
      'panic',
      'worried',
      'scared',
      'stress',
    ])
  ) {
    return localizeActions(
      [
        ['certain', 'What looks most certain here?'],
        ['stabilize', 'Give one stabilizing next step'],
        ['timing-watch', 'What timing should I watch next?'],
        ['compare-person', 'Compare with another person'],
      ],
      language,
    );
  }

  if (matches(normalized, ['money', 'finance', 'wealth', 'salary', 'paise', 'paisa'])) {
    return localizeActions(
      [
        ['money-deeper', 'Ask deeper about my money pattern'],
        ['finance-year', 'Show my next 12-month finance windows'],
        ['money-house', 'Explain my 2nd and 11th house'],
        ['finance-remedy', 'Suggest practical money remedies'],
      ],
      language,
    );
  }
  if (matches(normalized, ['marriage', 'relationship', 'partner', 'spouse', 'shaadi'])) {
    return localizeActions(
      [
        ['relationship-deeper', 'Ask deeper about this relationship pattern'],
        ['d9', 'Show my D9 chart'],
        ['marriage-timing', 'Check marriage timing with proof'],
        ['partner-pattern', 'What partner pattern does my chart show?'],
      ],
      language,
    );
  }
  if (matches(normalized, ['career', 'job', 'business', 'work'])) {
    return localizeActions(
      [
        ['career-deeper', 'Ask deeper about my work pattern'],
        ['d10', 'Show my D10 career chart'],
        ['career-year', 'Check career timing for next 12 months'],
        ['career-remedy', 'Give career remedies and next action'],
      ],
      language,
    );
  }

  const name = kundli?.birthDetails.name?.split(' ')[0] ?? 'me';
  return localizeActions(
    [
      ['deeper', `Ask deeper about ${name === 'me' ? 'my chart' : `${name}'s chart`}`],
      ['timing', 'What timing is most active now?'],
      ['remedy', 'Give me one useful remedy'],
      ['compare-person', 'Compare with another person'],
    ],
    language,
  );
}

function reportMemoryFollowUps(
  context: ChartContext,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  const prompts = [
    'Explain my friendship table',
    'Explain my functional benefics and malefics',
    'Explain my Chalit shifts',
    'Explain my Moon chart',
    'Explain my Swamsa chart',
    'Explain my Karakamsha chart',
    'Explain my Mahadasha Phala',
    'Explain my current Mahadasha, Antardasha, and Pratyantardasha',
    'Explain my Avakhada chakra',
    'Explain my Ashtakavarga score',
    'Explain my Ghatak and favorable factors',
  ];
  const preferred = context.reportSchoolLane === 'KP'
    ? [
        'Explain the KP event verdict',
        'Show the KP proof path',
        'Explain the timing readiness',
        'What is free vs premium here?',
      ]
    : context.reportSchoolLane === 'JAIMINI' || context.reportSchoolLane === 'NADI'
      ? [
          'Explain my Jaimini soul role',
          'Show my visible identity pattern',
          'Explain my destiny chapter',
          'What is free vs premium here?',
        ]
    : context.reportSchoolLane === 'NUMEROLOGY'
      ? [
          'Explain my number signature',
          'Explain my personal year cycle',
          'Explain my missing and repeated numbers',
          'What is free vs premium here?',
        ]
    : context.reportSchoolLane === 'SIGNATURE'
      ? [
          'Explain my confirmed signature traits',
          'What can Signature Predicta not claim?',
          'How can I refine my signature expression?',
          'What is free vs premium here?',
        ]
      : prompts;

  return localizeActions(
    preferred.map((prompt, index) => [`report-${index + 1}`, prompt]),
    language,
  );
}

export function buildPredictaSchoolHandoffContext({
  from,
  kundli,
  question,
  to,
}: {
  from: ChartContext['predictaSchool'];
  kundli?: KundliData;
  question: string;
  to: NonNullable<ChartContext['predictaSchool']>;
}): ChartContext {
  const schoolName =
    to === 'KP'
      ? 'KP Predicta'
      : to === 'JAIMINI' || to === 'NADI'
        ? 'Jaimini Predicta'
        : to === 'NUMEROLOGY'
          ? 'Numerology Predicta'
          : to === 'SIGNATURE'
            ? 'Signature Predicta'
        : 'Vedic Predicta';
  const sourceName =
    from === 'KP'
      ? 'KP Predicta'
      : from === 'JAIMINI' || from === 'NADI'
        ? 'Jaimini Predicta'
        : from === 'NUMEROLOGY'
          ? 'Numerology Predicta'
          : from === 'SIGNATURE'
            ? 'Signature Predicta'
        : 'Vedic Predicta';
  const birthSummary = kundli
    ? [
        kundli.birthDetails.name,
        kundli.birthDetails.date,
        kundli.birthDetails.time,
        kundli.birthDetails.place,
      ]
        .filter(Boolean)
        .join(' | ')
    : undefined;

  return {
    handoffBirthSummary: birthSummary,
    handoffFrom: from,
    handoffQuestion: question,
    kundliId: kundli?.id,
    predictaSchool: to,
    selectedSection: [
      `${sourceName} passed this question to ${schoolName}.`,
      `Original user question: ${question}`,
      birthSummary ? `Active birth profile: ${birthSummary}` : undefined,
      to === 'KP'
        ? 'Answer strictly from KP principles: KP ayanamsa, Placidus cusps, star lords, sub lords, significators, ruling planets, and KP event-timing rules. Do not casually mix Parashari D1/Varga/Yoga logic.'
        : to === 'JAIMINI' || to === 'NADI'
          ? 'Stay in Jaimini Predicta reading space. Use calculated Jaimini indicators such as Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha when available. Do not mix Parashari or KP.'
          : to === 'NUMEROLOGY'
            ? 'Answer strictly from Numerology Predicta: name number, birth number, destiny number, personal year/month/day, name spelling rhythm, and compatibility numbers. Do not mix Parashari, KP, or Jaimini unless the user explicitly asks for synthesis.'
            : to === 'SIGNATURE'
              ? 'Answer strictly from Signature Predicta: confirmed visual traits, writing rhythm, confidence expression, consistency, improvement suggestions, and safe reflection. Do not use Parashari, KP, Jaimini, or Numerology unless the user explicitly asks for synthesis.'
          : 'Answer strictly from regular Parashari Jyotish: D1, Vargas, dasha, yogas, Parashari Chalit, gochar, remedies, and reports. Do not use KP/Jaimini methods unless the user requests handoff.',
    ]
      .filter(Boolean)
      .join('\n'),
    sourceScreen: `${sourceName} Handoff`,
  };
}

export function buildChartContextIntro(
  context: ChartContext,
  language: SupportedLanguage,
): string {
  const chart = context.chartName ?? context.chartType ?? 'selected chart';
  const chartPurpose = context.purpose ?? chart;
  const focus = context.selectedPlanet
    ? `${context.selectedPlanet} in ${context.chartType ?? chart}`
    : context.selectedHouse
      ? `House ${context.selectedHouse} in ${context.chartType ?? chart}`
      : chart;

  if (language === 'hi') {
    return [
      `Maine aapka selection pakad liya: ${focus}.`,
      `${chart} asal mein ${chartPurpose} ke baare mein bolta hai. Main pehle iska life meaning bataungi, phir D1 anchor aur chart proof se answer grounded rakhungi.`,
      'Neeche se next direction choose kar sakte hain, ya seedha poochh sakte hain ki yeh career, love, family, timing, ya remedy mein kya keh raha hai.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Mane tamaru selection samjhai gayu: ${focus}.`,
      `${chart} kharekhar ${chartPurpose} vishe bole chhe. Hu pela eno life-meaning kahish, pachhi D1 anchor ane chart proof sathe answer grounded rakhish.`,
      'Niche thi agal nu direction choose karo, athva sidhu pucho ke aa career, love, family, timing, ke remedy ma shu kahe chhe.',
    ].join('\n\n');
  }

  return [
    `I picked up your selection: ${focus}.`,
    `${chart} is really about ${chartPurpose}. I will start with what it means in life, then use D1 anchoring and chart proof to keep the answer grounded.`,
    'Choose a next direction below, or ask directly what this means for career, love, family, timing, or remedies.',
  ].join('\n\n');
}

export function buildChartSelectionPrompt(context: ChartContext): string {
  const chart = context.chartType ?? 'selected chart';
  const focus = context.selectedPlanet
    ? `${context.selectedPlanet} in ${chart}`
    : context.selectedHouse
      ? `House ${context.selectedHouse} in ${chart}`
      : chart;

  return `Tell me what ${focus} is saying, why it matters in life, what timing activates it, and what one practical next step it suggests. Keep D1 as the anchor and use chart proof instead of jargon.`;
}

function chartFollowUps(
  context: ChartContext,
  hasPremiumAccess: boolean,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  const chart = context.chartType ?? 'this chart';
  const lifeArea = getChartHumanArea(context.chartType);
  const focus = context.selectedPlanet
    ? context.selectedPlanet
    : context.selectedHouse
      ? `House ${context.selectedHouse}`
      : chart;

  const base: Array<[string, string]> = [
    [
      'deeper',
      hasPremiumAccess
        ? `Ask deeper about what ${focus} is saying, where it strengthens, and where it weakens.`
        : `Ask deeper about what ${focus} is saying in plain language.`,
    ],
    ['timing', `Ask timing for ${focus}`],
    ['remedy', `Ask remedy for ${focus}`],
    ['life-area', `Understand what this means for ${lifeArea}`],
  ];

  if (chart !== 'D1') {
    base.push([
      'compare',
      `Compare ${chart} with D1 for ${lifeArea}`,
    ]);
  } else {
    base.push([
      'compare-moon',
      `Compare D1 with Moon chart for ${lifeArea}`,
    ]);
  }

  return localizeActions(base.slice(0, 5), language);
}

function getChartHumanArea(chartType?: string): string {
  switch (chartType) {
    case 'D2':
      return 'money';
    case 'D4':
      return 'home and property';
    case 'D7':
      return 'children and family';
    case 'D9':
      return 'love and marriage';
    case 'D10':
      return 'career';
    case 'D12':
      return 'parents and lineage';
    case 'D20':
      return 'faith and inner path';
    case 'D24':
      return 'learning and education';
    case 'D30':
      return 'stress and protection';
    case 'D40':
      return 'maternal family karma';
    case 'D45':
      return 'paternal family karma';
    case 'D60':
      return 'deep karma pattern';
    default:
      return 'life direction';
  }
}

function localizeActions(
  actions: Array<[string, string]>,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  return actions.map(([id, prompt]) => ({
    id,
    label: localizeLabel(prompt, language),
    prompt,
  }));
}

function schoolHandoffFollowUps(
  text: string,
  kundli: KundliData | undefined,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  const normalized = text.toLowerCase();
  const wantsKp =
    /\b(kp|krishnamurti|krishnamurthy|paddhati|cuspal\s*sub|sub\s*lord|sublord|significator|ruling\s*planet|249)\b/i.test(
      normalized,
    );
  const wantsJaimini =
    /\b(jaimini|jaimini\s*jyotish|atmakaraka|amatyakaraka|darakaraka|karakamsha|karakamsa|swamsa|arudha|upapada|chara\s*dasha|nadi|naadi|palm\s*leaf|agastya|bhrigu\s*nandi|nandi\s*nadi)\b/i.test(
      normalized,
    );
  const wantsNumerology =
    /\b(numerology|ank\s*jyotish|ankjyotish|name\s*number|birth\s*number|destiny\s*number|life\s*path|personal\s*(year|month|day)|moolank|mulank|bhagyank|name\s*vibration|name\s*correction)\b/i.test(
      normalized,
    );

  if (wantsKp) {
    const context = buildPredictaSchoolHandoffContext({
      from: 'PARASHARI',
      kundli,
      question: text,
      to: 'KP',
    });
    const prompt = context.selectedSection ?? text;

    return [
      {
        context,
        href: buildSchoolHandoffHref('/dashboard/kp/chat', context),
        id: 'open-kp-predicta',
        label:
          language === 'hi'
            ? 'KP Predicta kholo'
            : language === 'gu'
              ? 'KP Predicta kholo'
              : 'Open KP Predicta',
        prompt,
        targetScreen: 'KpPredicta',
      },
      {
        context,
        id: 'answer-in-kp',
        label:
          language === 'hi'
            ? 'KP se answer do'
            : language === 'gu'
              ? 'KP thi jawab aapo'
              : 'Answer in KP',
        prompt,
      },
    ];
  }

  if (wantsJaimini) {
    const context = buildPredictaSchoolHandoffContext({
      from: 'PARASHARI',
      kundli,
      question: text,
      to: 'JAIMINI',
    });
    const prompt = context.selectedSection ?? text;

    return [
      {
        context,
        href: buildSchoolHandoffHref('/dashboard/jaimini/chat', context),
        id: 'open-jaimini-predicta',
        label:
          language === 'hi'
            ? 'Jaimini Predicta dekho'
            : language === 'gu'
              ? 'Jaimini Predicta jo'
              : 'Open Jaimini Predicta',
        prompt,
        targetScreen: 'JaiminiPredicta',
      },
      {
        context,
        id: 'preserve-jaimini-question',
        label:
          language === 'hi'
            ? 'Question save rakho'
            : language === 'gu'
              ? 'Question save rakho'
              : 'Keep this question',
        prompt,
      },
    ];
  }

  if (wantsNumerology) {
    const context = buildPredictaSchoolHandoffContext({
      from: 'PARASHARI',
      kundli,
      question: text,
      to: 'NUMEROLOGY',
    });
    const prompt = context.selectedSection ?? text;

    return [
      {
        context,
        href: buildSchoolHandoffHref('/dashboard/numerology/chat', context),
        id: 'open-numerology-predicta',
        label:
          language === 'hi'
            ? 'Numerology Predicta kholo'
            : language === 'gu'
              ? 'Numerology Predicta kholo'
              : 'Open Numerology Predicta',
        prompt,
        targetScreen: 'NumerologyPredicta',
      },
      {
        context,
        id: 'answer-in-numerology',
        label:
          language === 'hi'
            ? 'Numerology se answer do'
            : language === 'gu'
              ? 'Numerology thi jawab aapo'
              : 'Answer in Numerology',
        prompt,
      },
    ];
  }

  return [];
}

function buildSchoolHandoffHref(path: string, context: ChartContext): string {
  const params = new URLSearchParams();

  setHrefParam(params, 'handoffQuestion', context.handoffQuestion);
  setHrefParam(params, 'kundliId', context.kundliId);
  setHrefParam(params, 'from', context.handoffFrom);
  setHrefParam(params, 'school', context.predictaSchool);

  return `${path}?${params.toString()}`;
}

function setHrefParam(
  params: URLSearchParams,
  key: string,
  value: number | string | undefined,
): void {
  if (value === undefined || value === '') {
    return;
  }

  params.set(key, String(value));
}

function localizeLabel(prompt: string, language: SupportedLanguage): string {
  const exactLabel = localizeExactLabel(prompt, language);
  if (exactLabel) {
    return exactLabel;
  }

  if (language === 'hi') {
    return prompt
      .replace(/^Ask deeper about /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.6ddf815971"))
      .replace(/^Ask deeper /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.6ddf815971"))
      .replace(/^Ask /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.2acf8c5291"))
      .replace(/^Check /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.3cd247ba04"))
      .replace(/^Compare /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.6c505234b8"))
      .replace(/^Make /, getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.364119cfe1"))
      .replace(/^Show my /, 'Dikhaiye ')
      .replace(/^Tell me about /, 'Bataye ')
      .replace(/^Explain /, 'Samjhaiye ')
      .replace(/^What /, 'Kya ')
      .replace(/^Give /, 'Dijiye ');
  }
  if (language === 'gu') {
    return prompt
      .replace(/^Ask deeper about /, 'Vadhu undaan thi kaho ')
      .replace(/^Ask deeper /, 'Vadhu undaan thi kaho ')
      .replace(/^Ask /, 'Pucho ')
      .replace(/^Check /, 'Tapaso ')
      .replace(/^Compare /, 'Tulna karo ')
      .replace(/^Make /, 'Banao ')
      .replace(/^Show my /, 'Batavo ')
      .replace(/^Tell me about /, 'Kaho ')
      .replace(/^Explain /, 'Samjavo ')
      .replace(/^What /, 'Shu ')
      .replace(/^Give /, 'Aapo ');
  }
  return prompt;
}

function localizeExactLabel(
  prompt: string,
  language: SupportedLanguage,
): string | undefined {
  const table: Partial<Record<SupportedLanguage, Record<string, string>>> = {
    gu: {
      'Ask deeper about the household pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.afa04ce03f"),
      'Ask deeper about this pair': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.de5f41b0e9"),
      'Ask deeper about my money pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.a705fbede3"),
      'Ask deeper about my work pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.8a5d9e988d"),
      'Ask deeper about my chart': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.c8acedbd97"),
      'Compare with another person': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.714b2a00cc"),
      'Give me one practical household healing guide': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.ca2a928fe8"),
      'Give one relationship repair step': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.89b65af6b1"),
      'Give one stabilizing next step': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.48c17173ed"),
      'What looks most certain here?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.d79c96e383"),
      'What timing is most active now?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.0305e3b17a"),
      'What timing should I watch next?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.f4002d8e57"),
      'Which pair heals fastest here?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.0de560e418"),
      'Who amplifies pressure in this map?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.0812d3be39"),
    },
    hi: {
      'Ask deeper about the household pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.a752b1ef30"),
      'Ask deeper about this pair': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.4095eae723"),
      'Ask deeper about my money pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.644a0d6630"),
      'Ask deeper about my work pattern': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.659ea97351"),
      'Ask deeper about my chart': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.2d6f38cd23"),
      'Compare with another person': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.29bccf27bc"),
      'Give me one practical household healing guide': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.c46de6ccaa"),
      'Give one relationship repair step': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.60561c08e2"),
      'Give one stabilizing next step': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.ae7ac5e152"),
      'What looks most certain here?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.d15c5948cd"),
      'What timing is most active now?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.1f9391656f"),
      'What timing should I watch next?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.14b2c787a5"),
      'Which pair heals fastest here?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.aee4fae149"),
      'Who amplifies pressure in this map?': getNativeCopy("native.packages.astrology.src.chatFollowUps.ts.dd9974d792"),
    },
  };

  return table[language]?.[prompt];
}

function matches(text: string, needles: string[]): boolean {
  return needles.some(needle => text.includes(needle));
}
