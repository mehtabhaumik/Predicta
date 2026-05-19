import { composeLifeTimeline } from '../packages/astrology/src/lifeTimeline.ts';

const kundli = {
  birthDetails: {
    name: 'Regression User',
  },
  dasha: {
    current: {
      antardasha: 'Mercury',
      endDate: '2042-09-15T00:00:00.000Z',
      mahadasha: 'Rahu',
      startDate: '2024-09-15T00:00:00.000Z',
    },
    timeline: [
      {
        endDate: '2001-06-15T00:00:00.000Z',
        mahadasha: 'Venus',
        startDate: '1981-06-15T00:00:00.000Z',
      },
      {
        endDate: '2007-06-16T00:00:00.000Z',
        mahadasha: 'Sun',
        startDate: '2001-06-15T00:00:00.000Z',
      },
      {
        endDate: '2017-06-16T00:00:00.000Z',
        mahadasha: 'Moon',
        startDate: '2007-06-16T00:00:00.000Z',
      },
      {
        endDate: '2024-09-15T00:00:00.000Z',
        mahadasha: 'Mars',
        startDate: '2017-06-16T00:00:00.000Z',
      },
      {
        endDate: '2042-09-15T00:00:00.000Z',
        mahadasha: 'Rahu',
        startDate: '2024-09-15T00:00:00.000Z',
      },
      {
        endDate: '2058-09-15T00:00:00.000Z',
        mahadasha: 'Jupiter',
        startDate: '2042-09-15T00:00:00.000Z',
      },
    ],
  },
  lifeTimeline: [
    {
      confidence: 'high',
      endDate: '2001-06-15T00:00:00.000Z',
      houses: [],
      id: 'legacy-venus-past',
      kind: 'dasha',
      planets: ['Venus'],
      startDate: '1981-06-15T00:00:00.000Z',
      summary: 'Legacy past dasha should not appear in forward timeline.',
      title: 'Venus Mahadasha',
    },
    {
      confidence: 'high',
      endDate: '2007-06-16T00:00:00.000Z',
      houses: [],
      id: 'legacy-sun-past',
      kind: 'dasha',
      planets: ['Sun'],
      startDate: '2001-06-15T00:00:00.000Z',
      summary: 'Legacy past dasha should not appear in forward timeline.',
      title: 'Sun Mahadasha',
    },
    {
      confidence: 'high',
      endDate: '2058-09-15T00:00:00.000Z',
      houses: [],
      id: 'legacy-jupiter-future-duplicate',
      kind: 'dasha',
      planets: ['Jupiter'],
      startDate: '2042-09-15T00:00:00.000Z',
      summary: 'Future duplicate should appear only once.',
      title: 'Jupiter Mahadasha',
    },
  ],
};

const presentation = composeLifeTimeline(kundli, '2026-05-20T00:00:00.000Z');
const events = presentation.sections.flatMap(section =>
  section.events.map(event => ({ ...event, section: section.id })),
);
const titles = events.map(event => event.title);
const failures = [];

for (const forbidden of ['Venus Mahadasha', 'Sun Mahadasha', 'Moon Mahadasha', 'Mars Mahadasha']) {
  if (titles.includes(forbidden)) {
    failures.push(`Past dasha appeared in forward timeline: ${forbidden}`);
  }
}

for (const title of new Set(titles)) {
  const count = titles.filter(item => item === title).length;
  if (count > 1) {
    failures.push(`Duplicate timeline dasha appeared: ${title} (${count})`);
  }
}

const rahu = events.find(event => event.title === 'Rahu Mahadasha');
if (!rahu || rahu.section !== 'now') {
  failures.push('Current Mahadasha was not placed in Now.');
}

const jupiter = events.find(event => event.title === 'Jupiter Mahadasha');
if (!jupiter || !['next', 'later'].includes(jupiter.section)) {
  failures.push('Future Mahadasha was not placed in a future section.');
}

if (failures.length) {
  console.error('Life timeline dasha gate failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Life timeline dasha gate passed: ${events.length} forward events checked.`);
