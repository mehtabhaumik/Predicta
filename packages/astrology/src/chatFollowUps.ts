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

  const normalized = lastText.toLowerCase();
  if (matches(normalized, ['money', 'finance', 'wealth', 'salary', 'paise', 'paisa'])) {
    return localizeActions(
      [
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
      ['d9', `Show ${name === 'me' ? 'my' : `${name}'s`} D9 chart`],
      ['finance', 'Tell me about money with proof'],
      ['timeline', 'What is active in my timeline now?'],
      ['remedy', 'Give me one useful remedy'],
    ],
    language,
  );
}

export function buildChartContextIntro(
  context: ChartContext,
  language: SupportedLanguage,
): string {
  const chart = context.chartName ?? context.chartType ?? 'selected chart';
  const focus = context.selectedPlanet
    ? `${context.selectedPlanet} in ${context.chartType ?? chart}`
    : context.selectedHouse
      ? `House ${context.selectedHouse} in ${context.chartType ?? chart}`
      : chart;

  if (language === 'hi') {
    return [
      `Maine aapka selection pakad liya: ${focus}.`,
      `${chart} ko main D1 birth chart ke anchor ke saath read karungi, taaki answer hawa mein na ho.`,
      'Neeche se koi option choose kar sakte hain, ya apna sawaal seedha likh dijiye.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Mane tamaru selection samjhai gayu: ${focus}.`,
      `${chart} ne hu D1 birth chart na anchor sathe read karish, etle answer grounded rahe.`,
      'Niche thi option choose karo, athva tamaro sawal sidho lakho.',
    ].join('\n\n');
  }

  return [
    `I picked up your selection: ${focus}.`,
    `I will read ${chart} with D1 as the anchor, so the answer stays grounded in the birth chart.`,
    'Choose one of the next questions below, or type your own question.',
  ].join('\n\n');
}

export function buildChartSelectionPrompt(context: ChartContext): string {
  const chart = context.chartType ?? 'selected chart';
  const focus = context.selectedPlanet
    ? `${context.selectedPlanet} in ${chart}`
    : context.selectedHouse
      ? `House ${context.selectedHouse} in ${chart}`
      : chart;

  return `Explain ${focus} with D1 anchoring, chart proof, timing relevance, and practical next steps.`;
}

function chartFollowUps(
  context: ChartContext,
  hasPremiumAccess: boolean,
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  const chart = context.chartType ?? 'this chart';
  const focus = context.selectedPlanet
    ? context.selectedPlanet
    : context.selectedHouse
      ? `House ${context.selectedHouse}`
      : chart;

  const base: Array<[string, string]> = [
    ['explain', `Explain ${focus} in ${chart} simply`],
    ['timing', `What timing activates ${focus}?`],
    ['remedy', `Give remedies for ${focus}`],
  ];

  if (chart !== 'D1') {
    base.splice(1, 0, ['compare', `Compare ${chart} with D1`]);
  }

  if (!hasPremiumAccess) {
    base.push(['premium', `What would Premium add for ${chart}?`]);
  }

  return localizeActions(base.slice(0, 4), language);
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

function localizeLabel(prompt: string, language: SupportedLanguage): string {
  if (language === 'hi') {
    return prompt
      .replace(/^Show my /, 'Dikhaiye ')
      .replace(/^Tell me about /, 'Bataye ')
      .replace(/^Explain /, 'Samjhaiye ')
      .replace(/^What /, 'Kya ')
      .replace(/^Give /, 'Dijiye ');
  }
  if (language === 'gu') {
    return prompt
      .replace(/^Show my /, 'Batavo ')
      .replace(/^Tell me about /, 'Kaho ')
      .replace(/^Explain /, 'Samjavo ')
      .replace(/^What /, 'Shu ')
      .replace(/^Give /, 'Aapo ');
  }
  return prompt;
}

function matches(text: string, needles: string[]): boolean {
  return needles.some(needle => text.includes(needle));
}
