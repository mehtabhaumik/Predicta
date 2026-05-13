import type {
  HolisticPlanetFocus,
  KundliData,
  PlanetKarmaRemedyProfile,
  RemedyPracticeStatus,
  SadhanaRemedyPath,
  SadhanaRemedyStage,
  SadhanaRemedyStageId,
} from '@pridicta/types';
import {
  composeHolisticFoundationModel,
  getPlanetKarmaRemedyProfile,
} from './holisticFoundationModel';

export type SadhanaTrackingMap = Record<string, RemedyPracticeStatus>;

const FALLBACK_STAGE_LABELS: Record<SadhanaRemedyStageId, string> = {
  conduct: 'Conduct',
  discipline: 'Discipline',
  lifestyle: 'Lifestyle',
  'mantra-prayer': 'Prayer',
  review: 'Review',
  seva: 'Seva',
};

export function composeSadhanaRemedyPath(
  kundli?: KundliData,
  tracking: SadhanaTrackingMap = {},
): SadhanaRemedyPath {
  if (!kundli) {
    return {
      askPrompt:
        'Create my Kundli, then build a sadhana remedy path with conduct, seva, prayer, discipline, lifestyle, and review.',
      guardrails: [
        'Create a Kundli before choosing a personal planetary sadhana.',
        'No practice should create fear, obsession, or avoidance of real-world duties.',
      ],
      karmicTheme: 'Waiting for chart proof.',
      planetReason: 'No Kundli is selected yet.',
      progressSummary: 'No practice has started.',
      reviewQuestions: ['What birth details should I use first?'],
      stages: buildPendingStages(),
      status: 'pending',
      subtitle: 'A safe practice path appears after the chart is calculated.',
      title: 'Sadhana remedy path is waiting.',
      weeklyIntention: 'Create the Kundli first.',
    };
  }

  const holistic = composeHolisticFoundationModel(kundli);
  const focus = holistic.activePlanetFocus[0];
  const profile = focus
    ? getPlanetKarmaRemedyProfile(focus.planet)
    : undefined;
  const remedyId = focus ? `karmic-${focus.planet.toLowerCase()}` : 'sadhana';
  const completionCount = tracking[remedyId]?.completedDates.length ?? 0;
  const stages = buildStages(focus, profile, completionCount);

  return {
    askPrompt:
      'Build my sadhana remedy path with planet, karma pattern, conduct correction, seva, prayer, discipline, lifestyle practice, tracking, and review.',
    guardrails: [
      'Conduct correction comes before mantra count, gemstones, or paid rituals.',
      'Seva should be respectful, affordable, and safe for everyone involved.',
      'Prayer is optional and should fit the user’s devotion style without pressure.',
      'Stop or simplify if the practice increases fear, guilt, obsession, or avoidance.',
      'High-stakes medical, legal, financial, or safety situations still need qualified help.',
    ],
    karmicTheme:
      focus?.karmicPattern ??
      'The active planet shows the karma pattern; the remedy path turns that into daily conduct.',
    planet: focus?.planet,
    planetReason:
      focus?.whyItMatters ??
      `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} is the active timing background.`,
    progressSummary: buildProgressSummary(completionCount, stages),
    reviewQuestions: [
      'Did this practice make my choices calmer or more fearful?',
      'Did I act with more responsibility, humility, and steadiness?',
      'Is this remedy still simple enough to continue without obsession?',
      'Do I need to reduce the practice and focus only on conduct this week?',
    ],
    stages,
    status: 'ready',
    subtitle:
      'A staged practice path: conduct, seva, prayer, discipline, lifestyle, and review.',
    title: `${kundli.birthDetails.name}'s Sadhana Remedy Path`,
    weeklyIntention: buildWeeklyIntention(focus, profile),
  };
}

function buildStages(
  focus: HolisticPlanetFocus | undefined,
  profile: PlanetKarmaRemedyProfile | undefined,
  completionCount: number,
): SadhanaRemedyStage[] {
  const conduct = profile?.conductCorrections[0] ?? focus?.simpleRemedy ?? 'Correct one behavior before adding a ritual.';
  const seva = profile?.sevaCharity[0] ?? 'Do one respectful act of service without expecting praise.';
  const prayer = profile?.mantraPrayer ?? focus?.mantraDevotion ?? 'Use a simple prayer or quiet reflection without fear.';
  const discipline = profile?.fastingDiscipline ?? 'Keep one simple weekly discipline that does not harm health or duty.';
  const lifestyle = profile?.lifestylePractice ?? focus?.practicalAction ?? 'Choose one visible practical action and repeat it.';

  return [
    buildStage({
      caution: 'Do not use “remedy” to avoid apologizing, correcting behavior, or taking practical responsibility.',
      completionCount,
      completionTarget: 'Do this once today before any mantra or ritual.',
      id: 'conduct',
      practice: conduct,
      sequence: 1,
      threshold: 0,
      whyItWorks:
        'Jyotish remedies become grounded when the planet’s shadow behavior is corrected first.',
    }),
    buildStage({
      caution: 'Do not humiliate, exploit, or inconvenience the person or being you are serving.',
      completionCount,
      completionTarget: 'Do one clean seva act this week.',
      id: 'seva',
      practice: seva,
      sequence: 2,
      threshold: 1,
      whyItWorks:
        'Seva redirects the planet’s pressure into humility, gratitude, and useful action.',
    }),
    buildStage({
      caution: 'No fear chanting, no extreme counts, no pressure to perform devotion in one fixed style.',
      completionCount,
      completionTarget: 'Keep it short and repeatable for 7 days.',
      id: 'mantra-prayer',
      practice: prayer,
      sequence: 3,
      threshold: 2,
      whyItWorks:
        'Prayer or mantra steadies attention so the remedy becomes a lived discipline, not superstition.',
    }),
    buildStage({
      caution: 'Avoid fasting or austerity if it affects health, medication, pregnancy, work safety, or mental steadiness.',
      completionCount,
      completionTarget: 'Choose one harmless weekly restraint.',
      id: 'discipline',
      practice: discipline,
      sequence: 4,
      threshold: 3,
      whyItWorks:
        'Discipline gives the planet a clean channel through routine and restraint.',
    }),
    buildStage({
      caution: 'Keep the habit small enough that it does not become guilt or performance.',
      completionCount,
      completionTarget: 'Repeat one habit until the next review.',
      id: 'lifestyle',
      practice: lifestyle,
      sequence: 5,
      threshold: 4,
      whyItWorks:
        'A remedy should show up in ordinary life, not only during ritual time.',
    }),
    buildStage({
      caution: 'Pause or simplify if the practice increases fear, obsession, or avoidance of real action.',
      completionCount,
      completionTarget: 'Review after 4 completions or 30 days.',
      id: 'review',
      practice:
        'Review whether the practice made choices cleaner, kinder, steadier, and more responsible.',
      sequence: 6,
      threshold: 4,
      whyItWorks:
        'A remedy path needs review so it remains helpful instead of becoming mechanical.',
    }),
  ];
}

function buildStage({
  caution,
  completionCount,
  completionTarget,
  id,
  practice,
  sequence,
  threshold,
  whyItWorks,
}: {
  caution: string;
  completionCount: number;
  completionTarget: string;
  id: SadhanaRemedyStageId;
  practice: string;
  sequence: number;
  threshold: number;
  whyItWorks: string;
}): SadhanaRemedyStage {
  const status: SadhanaRemedyStage['status'] =
    id === 'review' && completionCount >= threshold
      ? 'review'
      : completionCount > threshold
        ? 'done'
        : completionCount === threshold
          ? 'active'
          : 'not-started';

  return {
    cadence: id === 'conduct' ? 'Daily' : id === 'review' ? 'After 4 completions or 30 days' : 'Weekly',
    caution,
    completionTarget,
    id,
    label: FALLBACK_STAGE_LABELS[id],
    practice,
    sequence,
    status,
    whyItWorks,
  };
}

function buildPendingStages(): SadhanaRemedyStage[] {
  return buildStages(undefined, undefined, 0).map(stage => ({
    ...stage,
    status: stage.id === 'conduct' ? 'active' : 'not-started',
  }));
}

function buildProgressSummary(
  completionCount: number,
  stages: SadhanaRemedyStage[],
): string {
  const active = stages.find(stage => stage.status === 'active' || stage.status === 'review');
  if (!completionCount) {
    return `Start with ${active?.label ?? 'Conduct'}: keep the remedy practical before adding more steps.`;
  }
  if (active?.status === 'review') {
    return `${completionCount} completions logged. Review the practice before increasing it.`;
  }
  return `${completionCount} completions logged. Current step: ${active?.label ?? 'Lifestyle'}.`;
}

function buildWeeklyIntention(
  focus: HolisticPlanetFocus | undefined,
  profile: PlanetKarmaRemedyProfile | undefined,
): string {
  if (focus && profile) {
    return `This week, express ${focus.planet} through ${profile.higherExpression}, not ${profile.shadowPattern}.`;
  }
  if (focus) {
    return `This week, keep ${focus.planet} practical: ${focus.practicalAction}`;
  }
  return 'This week, keep the remedy small, respectful, and repeatable.';
}
