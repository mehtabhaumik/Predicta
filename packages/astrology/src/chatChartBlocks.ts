import type {
  ChartContext,
  ChartType,
  ChatChartBlock,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import { composeChartInsight } from './chartInsights';
import { CHART_REGISTRY, getChartConfig } from './chartRegistry';

type ChatChartIntent = {
  chartType: ChartType;
  matchedBy: 'alias' | 'chart-type' | 'purpose';
};

const CHART_ALIAS_PATTERNS: Array<{
  chartType: ChartType;
  pattern: RegExp;
}> = [
  { chartType: 'D1', pattern: /\b(rashi|janam\s*kundli|birth\s*chart|main\s*chart|lagna\s*chart|kundli)\b/i },
  { chartType: 'D2', pattern: /\b(hora|wealth\s*chart|finance\s*chart|money\s*chart|dhan)\b/i },
  { chartType: 'D3', pattern: /\b(drekkana|siblings?\s*chart|courage\s*chart|effort\s*chart)\b/i },
  { chartType: 'D4', pattern: /\b(chaturthamsha|property\s*chart|home\s*chart|assets?\s*chart)\b/i },
  { chartType: 'D7', pattern: /\b(saptamsha|children\s*chart|child\s*chart|legacy\s*chart)\b/i },
  { chartType: 'D9', pattern: /\b(navamsha|navamsa|marriage\s*chart|spouse\s*chart|dharma\s*chart)\b/i },
  { chartType: 'D10', pattern: /\b(dashamsha|dasamsa|career\s*chart|work\s*chart|profession\s*chart|job\s*chart)\b/i },
  { chartType: 'D12', pattern: /\b(dwadashamsha|parents?\s*chart|lineage\s*chart|family\s*karma\s*chart)\b/i },
  { chartType: 'D20', pattern: /\b(vimshamsha|spiritual\s*chart|devotion\s*chart|mantra\s*chart)\b/i },
  { chartType: 'D24', pattern: /\b(chaturvimshamsha|education\s*chart|study\s*chart|learning\s*chart)\b/i },
  { chartType: 'D30', pattern: /\b(trimsamsha|stress\s*chart|misfortune\s*chart|protection\s*chart)\b/i },
  { chartType: 'D40', pattern: /\b(khavedamsha|maternal\s*chart|mother\s*lineage)\b/i },
  { chartType: 'D45', pattern: /\b(akshavedamsha|paternal\s*chart|father\s*lineage)\b/i },
  { chartType: 'D60', pattern: /\b(shashtyamsha|karma\s*root\s*chart|deep\s*karma\s*chart|past\s*life\s*chart)\b/i },
];

const CHART_REQUEST_PATTERN =
  /\b(show|open|display|render|draw|view|see|pull\s*up|create|dikha|dikhao|batav|batavo|batao|jovo|dekhao)\b/i;
const CHART_EXPLANATION_PATTERN =
  /\b(what|why|how|when|mean|means|meaning|explain|explanation|interpret|tell\s+me|help\s+me\s+understand|keep\s+it\s+rooted|chart\s+proof|timing|activate|activates|activation|remedy|simply|simple|plain\s+language|compare|difference|changes?)\b/i;
const CHART_CONCEPT_PATTERN =
  /\b(chart|kundli|kundali|house\s*\d+|planet|lagna|ascendant|moon|nakshatra|dasha|gochar|transit|navamsha|dashamsha|hora|bhav|chalit|career\s*chart|marriage\s*chart|wealth\s*chart|money\s*chart|spouse\s*chart|children\s*chart|property\s*chart|kp|nadi)\b/i;

export function detectChatChartIntent(text: string): ChatChartIntent | undefined {
  const normalized = text.trim();

  if (!normalized) {
    return undefined;
  }

  const wantsExplanation = CHART_EXPLANATION_PATTERN.test(normalized);
  const wantsChartDisplay =
    CHART_REQUEST_PATTERN.test(normalized) ||
    /\b(chart|kundli|kundali)\b/i.test(normalized);

  const directType = normalized.match(/\bd\s*-?\s*(1|2|3|4|5|6|7|8|9|10|11|12|13|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|40|45|60)\b/i);

  if (directType) {
    const chartType = `D${directType[1]}` as ChartType;
    if (wantsExplanation && !CHART_REQUEST_PATTERN.test(normalized)) {
      return undefined;
    }

    return CHART_REGISTRY.some(chart => chart.id === chartType)
      ? { chartType, matchedBy: 'chart-type' }
      : undefined;
  }

  const aliasMatch = CHART_ALIAS_PATTERNS.find(item =>
    item.pattern.test(normalized),
  );

  if (aliasMatch && wantsChartDisplay && !wantsExplanation) {
    return {
      chartType: aliasMatch.chartType,
      matchedBy: 'alias',
    };
  }

  if (/\b(show|open|display|render|view|see)\s+(my\s+)?chart\b/i.test(normalized)) {
    return {
      chartType: 'D1',
      matchedBy: 'purpose',
    };
  }

  return undefined;
}

export function shouldBypassLocalChartShortcuts(text: string): boolean {
  const normalized = text.trim();

  if (!normalized) {
    return false;
  }

  if (detectChatChartIntent(normalized)) {
    return false;
  }

  return (
    CHART_EXPLANATION_PATTERN.test(normalized) &&
    CHART_CONCEPT_PATTERN.test(normalized)
  );
}

export function composeChatChartBlock({
  chartType,
  hasPremiumAccess,
  kundli,
}: {
  chartType: ChartType;
  hasPremiumAccess: boolean;
  kundli: KundliData;
}): ChatChartBlock | undefined {
  const chart = kundli.charts[chartType];
  const config = getChartConfig(chartType);

  if (!chart) {
    return undefined;
  }

  const insight = composeChartInsight({ chart, hasPremiumAccess, kundli });
  const confidence = kundli.birthDetails.isTimeApproximate
    ? 'Approx birth time'
    : 'Birth time stable';

  return {
    chart,
    chartName: config.name,
    chartType,
    ctas: buildChartCtas(chartType, hasPremiumAccess),
    evidenceChips: [
      chartType === 'D1' ? 'D1 root chart' : `Anchored to D1`,
      `${chartType} ${config.name}`,
      `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
      confidence,
      hasPremiumAccess ? 'Premium depth' : 'Free insight',
    ],
    insight,
    ownerName: kundli.birthDetails.name,
    purpose: config.purpose,
    supported: chart.supported,
    type: 'chart',
    unsupportedReason: chart.unsupportedReason,
  };
}

export function buildChatChartReplyText({
  block,
  language,
}: {
  block: ChatChartBlock;
  language: SupportedLanguage;
}): string {
  const anchorLine =
    block.chartType === 'D1'
      ? 'I will keep D1 as the root proof layer while we go deeper.'
      : `I will keep D1 as the anchor while reading ${block.chartType}, so the answer stays grounded instead of floating in chart jargon.`;
  const meaningLine = block.insight.whatItSays;
  const guidanceLine = `Right now, the main takeaway is ${block.insight.currentGuidance}`;
  const depthLine = block.insight.premiumNudge
    ? 'You already have the plain-language meaning here. From here we can go deeper into timing, remedies, D1 comparison, or the life area this chart touches most.'
    : 'Premium depth is active, so I can keep going into timing, contradictions, D1 comparison, remedies, and report-grade synthesis without losing the plain-language meaning.';

  if (language === 'hi') {
    return [
      `Haan. ${block.chartType} ${block.chartName} ka seedha matlab yahaan khol diya hai.`,
      `Yeh chart asal mein ${block.insight.governs}`,
      meaningLine,
      guidanceLine,
      anchorLine,
      depthLine,
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Haan. ${block.chartType} ${block.chartName} no sidho arth ahi kholi didho chhe.`,
      `Aa chart kharekhar ${block.insight.governs}`,
      meaningLine,
      guidanceLine,
      anchorLine,
      depthLine,
    ].join('\n\n');
  }

  return [
    `Here is what your ${block.chartType} ${block.chartName} is really about.`,
    block.insight.governs,
    meaningLine,
    guidanceLine,
    anchorLine,
    depthLine,
  ].join('\n\n');
}

export function chartContextFromChatBlock(
  block: ChatChartBlock,
  sourceScreen = 'Chat',
): ChartContext {
  return {
    chartName: block.chartName,
    chartType: block.chartType,
    purpose: block.purpose,
    selectedSection: `Understand what ${block.chartType} ${block.chartName} is saying`,
    sourceScreen,
  };
}

function buildChartCtas(
  chartType: ChartType,
  hasPremiumAccess: boolean,
): ChatChartBlock['ctas'] {
  const humanArea = getChartHumanArea(chartType);

  return [
    {
      id: 'ask-deeper',
      label: 'Ask deeper',
      prompt: hasPremiumAccess
        ? `Go deeper into what my ${chartType} chart is saying, where it becomes stronger or weaker, and how D1 confirms it.`
        : `Go deeper into what my ${chartType} chart is saying in plain language, and keep the answer grounded in chart proof.`,
    },
    {
      id: 'ask-timing',
      label: 'Ask timing',
      prompt: `What timing activates the main promise of my ${chartType} chart? Keep it practical, chart-backed, and easy to act on.`,
    },
    {
      id: 'ask-remedy',
      label: 'Ask remedy',
      prompt: `Give me one grounded remedy or practical correction for what my ${chartType} chart is showing. Keep it simple and realistic.`,
    },
    chartType === 'D1'
      ? {
          id: 'ask-life-area',
          label: `Meaning for ${humanArea}`,
          prompt: `What does my ${chartType} chart mean for ${humanArea}? Explain it simply, tell me why it matters, and keep it rooted in the chart.`,
        }
      : {
          id: 'compare-d1',
          label: 'Compare with D1',
          prompt: `Compare my ${chartType} chart with D1 and explain what it changes for ${humanArea} in plain language.`,
        },
  ];
}

function getChartHumanArea(chartType: ChartType): string {
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
