import type {
  HolisticReadingRoom,
  HolisticReadingRooms,
  KundliData,
  PurusharthaAxisInsight,
} from '@pridicta/types';
import { composeDailyBriefing } from './dailyBriefing';
import { composeHolisticFoundationModel } from './holisticFoundationModel';
import { composePersonalPanchangLayer } from './personalPanchangLayer';
import { composePurusharthaLifeBalance } from './purusharthaLifeBalance';
import { composeTransitGocharIntelligence } from './transitGocharIntelligence';

const PENDING_ROOM: HolisticReadingRoom = {
  bestQuestion:
    'Create my Kundli, then guide me through today, karma remedies, life balance, and timing.',
  evidence: ['Create Kundli first.'],
  id: 'today',
  practice: 'Create your Kundli with birth date, time, and place.',
  primaryFocus: 'Start with a real chart.',
  proofChips: ['Birth details needed'],
  relatedHouses: [],
  relatedPlanets: [],
  remedy: 'No remedy yet. First calculate the chart.',
  subtitle: 'A reading room opens after the chart is ready.',
  title: 'Start Room',
  tone: 'steady',
};

export function composeHolisticReadingRooms(
  kundli?: KundliData,
): HolisticReadingRooms {
  if (!kundli) {
    return {
      askPrompt:
        'Create my Kundli, then open my holistic reading rooms for today, karma remedies, life balance, and timing.',
      featuredRoom: PENDING_ROOM,
      guardrails: [
        'Create a Kundli before personal guidance.',
        'Use rooms for reflection and planning, not guaranteed outcomes.',
      ],
      rooms: [PENDING_ROOM],
      status: 'pending',
      subtitle:
        'Create your Kundli to unlock reading rooms for today, karma remedies, life balance, and timing.',
      title: 'Holistic reading rooms are waiting.',
    };
  }

  const holistic = composeHolisticFoundationModel(kundli);
  const purushartha = composePurusharthaLifeBalance(kundli);
  const panchang = composePersonalPanchangLayer(kundli);
  const daily = composeDailyBriefing(kundli);
  const gochar = composeTransitGocharIntelligence(kundli, { depth: 'FREE' });
  const topFocus = holistic.activePlanetFocus[0];
  const dasha = kundli.dasha.current;
  const rooms: HolisticReadingRoom[] = [
    {
      bestQuestion: panchang.askPrompt,
      evidence: panchang.evidence.slice(0, 3),
      id: 'today',
      practice: daily.bestAction,
      primaryFocus: panchang.todayFocus,
      proofChips: [
        panchang.weekdayLord,
        panchang.tithi,
        panchang.moonNakshatra,
        `${dasha.mahadasha}/${dasha.antardasha}`,
      ],
      relatedHouses: [],
      relatedPlanets: [panchang.weekdayLord, dasha.mahadasha],
      remedy: panchang.personalRemedy,
      subtitle: 'Today through Panchang, Moon rhythm, dasha, and practical action.',
      title: 'Today Room',
      tone: panchang.signals.some(signal => signal.tone === 'careful')
        ? 'careful'
        : 'supportive',
    },
    {
      bestQuestion:
        'Explain my active karmic remedy room with planet, karma pattern, chart proof, practice, and safety boundaries.',
      evidence: topFocus?.chartEvidence ?? holistic.remedyPriority.slice(0, 3),
      id: 'karma-remedies',
      practice: topFocus?.practicalAction ?? 'Choose one simple conduct correction.',
      primaryFocus:
        topFocus?.karmicPattern ??
        'Remedies start with conduct, seva, prayer, discipline, and practical action.',
      proofChips: topFocus
        ? [topFocus.planet, topFocus.priority, dasha.mahadasha, dasha.antardasha]
        : ['Conduct', 'Seva', 'Prayer', 'Discipline'],
      relatedHouses: extractHouses(topFocus?.chartEvidence ?? []),
      relatedPlanets: topFocus ? [topFocus.planet] : [],
      remedy: topFocus?.simpleRemedy ?? holistic.remedyPriority[0],
      subtitle: 'Karma-based remedies without fear or pressure buying.',
      title: 'Karma Remedy Room',
      tone: topFocus?.priority === 'high' ? 'careful' : 'steady',
    },
    ...purushartha.axes.map(axis => buildPurusharthaRoom(axis, kundli)),
    {
      bestQuestion:
        'Read my timing room with current dasha, Gochar, today signal, practical window, and safe next step.',
      evidence: [
        `Current dasha: ${dasha.mahadasha}/${dasha.antardasha} until ${dasha.endDate}.`,
        gochar.snapshotSummary,
        ...gochar.evidence.slice(0, 1).map(item => item.observation),
      ],
      id: 'timing',
      practice:
        'Use timing as a planning lens: choose one realistic action and one thing to postpone.',
      primaryFocus: `The main timing background is ${dasha.mahadasha}/${dasha.antardasha}; current Gochar is ${gochar.dominantWeight}.`,
      proofChips: [
        `${dasha.mahadasha}/${dasha.antardasha}`,
        gochar.dominantWeight,
        panchang.weekdayLord,
      ],
      relatedHouses: gochar.planetInsights
        .slice(0, 3)
        .map(item => item.houseFromLagna),
      relatedPlanets: gochar.planetInsights
        .slice(0, 4)
        .map(item => item.planet),
      remedy: panchang.personalRemedy,
      subtitle: 'Dasha, Gochar, and today’s Panchang in one practical room.',
      title: 'Timing Room',
      tone: gochar.dominantWeight === 'challenging' ? 'careful' : 'steady',
    },
  ];

  return {
    askPrompt:
      'Open my holistic reading rooms and suggest which room I should use first: Today, Karma Remedies, Purushartha, or Timing.',
    featuredRoom: rooms[0],
    guardrails: [
      'Rooms combine chart proof, timing, karma pattern, remedy, practical action, and safety boundaries.',
      'No room gives guaranteed outcomes or replaces qualified professional help.',
      'KP and Nadi remain separate schools; these rooms are Parashari holistic rooms.',
    ],
    rooms,
    status: 'ready',
    subtitle:
      'Simple rooms for today, karma remedies, life balance, and timing from the selected Kundli.',
    title: `${kundli.birthDetails.name}'s holistic reading rooms`,
  };
}

function buildPurusharthaRoom(
  axis: PurusharthaAxisInsight,
  kundli: KundliData,
): HolisticReadingRoom {
  return {
    bestQuestion: `Explain my ${axis.label} room with chart proof, timing, karma pattern, remedy, and one practical action.`,
    evidence: axis.chartEvidence.slice(0, 4),
    id: axis.category,
    practice: axis.practicalGuidance,
    primaryFocus: axis.currentEmphasis,
    proofChips: [
      axis.label,
      `${axis.score}%`,
      `Houses ${axis.houses.join('/')}`,
      `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    ],
    relatedHouses: axis.houses,
    relatedPlanets: [kundli.dasha.current.mahadasha, kundli.dasha.current.antardasha],
    remedy: buildPurusharthaRemedy(axis),
    subtitle: `${axis.meaning}.`,
    title: `${axis.label} Room`,
    tone: axis.tone,
  };
}

function buildPurusharthaRemedy(axis: PurusharthaAxisInsight): string {
  if (axis.category === 'dharma') {
    return 'Respect guidance, study one useful truth, and act according to values.';
  }
  if (axis.category === 'artha') {
    return 'Keep one money, work, or health responsibility clean and on time.';
  }
  if (axis.category === 'kama') {
    return 'Keep desire, speech, partnership, and social choices honest.';
  }
  return 'Protect sleep, silence, home peace, and one release practice.';
}

function extractHouses(evidence: string[]): number[] {
  return Array.from(
    new Set(
      evidence
        .flatMap(line =>
          Array.from(line.matchAll(/\bhouse\s+(\d{1,2})\b/gi)).map(match =>
            Number(match[1]),
          ),
        )
        .filter(house => house >= 1 && house <= 12),
    ),
  );
}
