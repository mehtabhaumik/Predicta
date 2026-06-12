import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

const checks = [
  {
    file: 'packages/astrology/src/chatFollowUps.ts',
    label: 'school handoff context carries the active Kundli id',
    mustContain: ['kundliId: kundli?.id'],
  },
  {
    file: 'packages/astrology/src/chatFollowUps.ts',
    label: 'KP handoff link preserves question, school, origin, and Kundli id through Ask Predicta',
    mustContain: [
      "buildSchoolHandoffHref('/dashboard/kp/chat', context)",
      "return `/ask?${params.toString()}`;",
      "params.set('handoffMode', 'room_safe')",
    ],
  },
  {
    file: 'packages/astrology/src/chatFollowUps.ts',
    label: 'Jaimini handoff link preserves question, school, origin, and Kundli id through Ask Predicta',
    mustContain: [
      "buildSchoolHandoffHref('/dashboard/jaimini/chat', context)",
      "setHrefParam(params, 'sourceScreen', context.sourceScreen)",
      "params.set('autoSend', 'true')",
    ],
  },
  {
    file: 'apps/web/components/WebKpPredictaRuntime.tsx',
    label: 'KP Predicta page prefers the Kundli id from the handoff URL',
    mustContain: [
      'requestedKundliId',
      'savedKundlis.find(item => item.id === requestedKundliId) ?? activeKundli',
      'setActiveWebKundli(handoffKundli)',
    ],
  },
  {
    file: 'apps/web/components/WebJaiminiPredictaPanel.tsx',
    label: 'Jaimini Predicta page carries the active Kundli into chat handoff',
    mustContain: [
      "school: 'JAIMINI'",
      'sourceScreen: copy.heroEyebrow',
      'jaiminiInterpretation.summary',
      'jaiminiInterpretation.technicalEvidence.map(item =>',
    ],
  },
  {
    file: 'apps/web/lib/predicta-chat-cta.ts',
    label: 'chat CTA contract carries Kundli, school, origin, and question context',
    mustContain: [
      "setParam(params, 'kundliId'",
      "setParam(params, 'school'",
      "setParam(params, 'from'",
      "setParam(params, 'handoffQuestion'",
      "setParam(params, 'selectedHouse'",
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'chat route recovers Kundli before introducing handoff context',
    mustContain: [
      'resolveWebKundliForContext(nextContext)',
      'setKundli(contextKundli)',
      'setActiveChartContext(nextContext)',
      'saveWebActiveChartContext(nextContext)',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'explicit house prompts override stale selected-house context before AI handoff',
    mustContain: [
      'const baseQuestionChartContext = resolveChartContextForQuestion(',
      'extractHouseNumbersFromText(text)',
      'selectedHouse: explicitHouses.length === 1 ? explicitHouses[0] : undefined',
      'chartContext: questionChartContext',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'chat embedded Kundli uses house hit targets separate from labels',
    mustContain: [
      'north-house-state-map chat-house-state-map',
      'className={`north-house north-house-${cell.house}',
      'className={`north-house-label north-house-label-${cell.house}',
      'points={getChatHousePolygonPoints(cell.house ?? 0)}',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'chat sessions persist school, chart, house, language, and Kundli context',
    mustContain: [
      'school: getSchoolFromContext(sessionPatch.activeChartContext)',
      'selectedChart: sessionPatch.activeChartContext?.chartType',
      'selectedHouse: sessionPatch.activeChartContext?.selectedHouse',
      'chatLanguage: sessionPatch.chatLanguage',
      'kundliId: sessionPatch.kundliId',
    ],
  },
  {
    file: 'apps/web/components/WebPridictaChat.tsx',
    label: 'reply feedback records Kundli, school, chart, house, source, and language',
    mustContain: [
      'kundliId: context?.kundliId ?? kundli?.id',
      'school: getReplyFeedbackSchool(context)',
      'selectedChart: context?.chartName ?? context?.chartType',
      'selectedHouse: context?.selectedHouse',
      'sourceScreen: context?.sourceScreen',
      'chatLanguage',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = readFileSync(join(root, check.file), 'utf8');
  for (const fragment of check.mustContain) {
    if (!source.includes(fragment)) {
      failures.push(`${check.label}: missing "${fragment}" in ${check.file}`);
    }
  }
}

if (failures.length) {
  console.error('Predicta context reliability suite failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Predicta context reliability suite passed: ${checks.length} checks.`);
