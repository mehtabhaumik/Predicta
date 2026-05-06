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

export function detectChatChartIntent(text: string): ChatChartIntent | undefined {
  const normalized = text.trim();

  if (!normalized) {
    return undefined;
  }

  const directType = normalized.match(/\bd\s*-?\s*(1|2|3|4|5|6|7|8|9|10|11|12|13|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31|32|33|34|40|45|60)\b/i);

  if (directType) {
    const chartType = `D${directType[1]}` as ChartType;
    return CHART_REGISTRY.some(chart => chart.id === chartType)
      ? { chartType, matchedBy: 'chart-type' }
      : undefined;
  }

  const aliasMatch = CHART_ALIAS_PATTERNS.find(item =>
    item.pattern.test(normalized),
  );

  if (aliasMatch && (CHART_REQUEST_PATTERN.test(normalized) || /\bchart|kundli|kundali\b/i.test(normalized))) {
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

  const insight = composeChartInsight({ chart, hasPremiumAccess });
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
      ? 'D1 is the root chart, so I will use it as the main proof layer.'
      : `I will read ${block.chartType} with D1 as the root chart, because D1 remains the main birth chart.`;
  const depthLine = block.insight.premiumNudge
    ? block.insight.premiumNudge
    : 'Premium depth is active, so I can go deeper with dasha, transit, confidence, remedies, and report-ready synthesis.';

  if (language === 'hi') {
    return [
      `Haan. Maine ${block.chartType} ${block.chartName} yahin chat mein khol diya hai.`,
      `${block.chartName} ka simple role: ${block.purpose}`,
      anchorLine,
      block.insight.summary,
      depthLine,
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Haan. Hu ${block.chartType} ${block.chartName} ahi chat ma kholi didhu chhe.`,
      `${block.chartName} no simple role: ${block.purpose}`,
      anchorLine,
      block.insight.summary,
      depthLine,
    ].join('\n\n');
  }

  return [
    `Yes. I opened your ${block.chartType} ${block.chartName} right here in chat.`,
    `${block.chartName} in simple words: ${block.purpose}`,
    anchorLine,
    block.insight.summary,
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
    selectedSection: `Discuss ${block.chartType} ${block.chartName} with D1 anchor`,
    sourceScreen,
  };
}

function buildChartCtas(
  chartType: ChartType,
  hasPremiumAccess: boolean,
): ChatChartBlock['ctas'] {
  return [
    {
      id: 'ask-chart',
      label: 'Ask About This Chart',
      prompt: `Explain my ${chartType} chart with D1 proof.`,
    },
    ...(chartType === 'D1'
      ? []
      : [
          {
            id: 'compare-d1',
            label: 'Compare With D1',
            prompt: `Compare my ${chartType} chart with D1 and tell me the strongest evidence.`,
          },
        ]),
    {
      id: 'create-report',
      label: 'Make Report',
      prompt: `Create a report section for my ${chartType} chart.`,
    },
    ...(hasPremiumAccess
      ? []
      : [
          {
            id: 'premium-depth',
            label: 'Go Deeper',
            prompt: `Show me premium depth for my ${chartType} chart.`,
          },
        ]),
  ];
}
