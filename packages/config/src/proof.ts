import type { JyotishAnalysis } from '@pridicta/types';

export function formatAskWithProof(
  answer: string,
  analysis?: JyotishAnalysis,
): string {
  if (!analysis) {
    return answer;
  }

  const area = analysis.areaAnalyses.find(
    item => item.area === analysis.primaryArea,
  );
  const evidence = analysis.evidence.slice(0, 3);
  const evidenceText = evidence.length
    ? evidence
        .map(
          item =>
            `- ${item.title}: ${item.observation} (${item.weight}, ${item.source})`,
        )
        .join('\n')
    : '- Evidence was limited for this question.';
  const timing = analysis.evidence.find(item =>
    /dasha|transit|timing|gochar/i.test(`${item.title} ${item.source}`),
  );

  return [
    answer,
    'Ask with proof',
    `Confidence: ${area?.confidence ?? 'medium'}`,
    `Timing context: ${timing?.observation ?? 'No precise timing window was strong enough to claim.'}`,
    'Chart factors:',
    evidenceText,
  ].join('\n\n');
}
