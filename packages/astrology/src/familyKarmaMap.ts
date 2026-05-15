import type {
  FamilyKarmaMap,
  FamilyKarmaTheme,
  FamilyMemberProfile,
  FamilyRelationshipGuidance,
  FamilyRelationshipLabel,
  KundliData,
} from '@pridicta/types';

type FamilyKarmaInput = {
  kundli: KundliData;
  relationship?: FamilyRelationshipLabel;
};

const WATER_SIGNS = new Set(['Cancer', 'Scorpio', 'Pisces']);
const FIRE_SIGNS = new Set(['Aries', 'Leo', 'Sagittarius']);
const AIR_SIGNS = new Set(['Gemini', 'Libra', 'Aquarius']);
const EARTH_SIGNS = new Set(['Taurus', 'Virgo', 'Capricorn']);

const RELATIONSHIP_LABELS: Record<FamilyRelationshipLabel, string> = {
  child: 'Child',
  friend: 'Friend',
  grandparent: 'Grandparent',
  other: 'Other',
  parent: 'Parent',
  partner: 'Partner',
  relative: 'Relative',
  self: 'Self',
  sibling: 'Sibling',
};

export function composeFamilyKarmaMap(
  input: FamilyKarmaInput[] = [],
): FamilyKarmaMap {
  const familyInput = input
    .filter(item => item.kundli)
    .slice(0, 8);
  const members = familyInput
    .map((item, index) =>
      toFamilyMemberProfile(item.kundli, item.relationship ?? defaultLabel(index)),
    );

  if (members.length < 2) {
    return {
      askPrompt:
        'Explain what Family Karma Map will do once two or more saved kundlis are selected. Keep the tone privacy-first and non-blaming.',
      members,
      privacyNote:
        'Family Karma Map stays private by default. It should explain patterns without blame, fear labels, or assigning responsibility for another person.',
      relationshipCards: [],
      repeatedThemes: [],
      shareSummary:
        'Predicta Family Karma Map is waiting for two or more saved kundlis.',
      status: 'pending',
      subtitle:
        'Add at least two calculated profiles to see repeated patterns, support zones, and relationship guidance.',
      title: 'Add family profiles to unlock the map.',
    };
  }

  const repeatedThemes = buildRepeatedThemes(familyInput, members);
  const relationshipCards = buildRelationshipCards(familyInput, members);
  const familyNames = members.map(member => member.name).join(', ');
  const title = `Family Karma Map for ${members.length} members`;
  const subtitle =
    repeatedThemes.length > 0
      ? 'Repeated chart patterns are grouped into care-based guidance, not blame.'
      : 'The map compares family charts and turns differences into practical support guidance.';

  return {
    askPrompt: [
      `Explain the Family Karma Map for ${familyNames}.`,
      'Use family members, relationship type, emotional pattern, support pattern, repeated karmic themes, and practical guidance.',
      'Keep it privacy-first, evidence-based, and non-blaming. Do not assign fear labels or make one person responsible for another person.',
    ].join(' '),
    members,
    privacyNote:
      'Only share the summary if every person is comfortable. The map uses birth-chart patterns for reflection, not diagnosis or blame.',
    relationshipCards,
    repeatedThemes,
    shareSummary: [
      `Predicta Family Karma Map: ${members.length} profiles`,
      `Members: ${members.map(member => `${member.name} (${RELATIONSHIP_LABELS[member.relationship]})`).join(', ')}`,
      repeatedThemes.length
        ? `Themes: ${repeatedThemes.map(theme => theme.title).join('; ')}`
        : 'Themes: add more family profiles for stronger repeated-pattern evidence.',
    ].join('\n'),
    status: 'ready',
    subtitle,
    title,
  };
}

function toFamilyMemberProfile(
  kundli: KundliData,
  relationship: FamilyRelationshipLabel,
): FamilyMemberProfile {
  return {
    currentDasha: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    id: kundli.id,
    lagna: kundli.lagna,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    name: kundli.birthDetails.name,
    relationship,
  };
}

function buildRepeatedThemes(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
): FamilyKarmaTheme[] {
  const byMoon = groupBy(members, member => member.moonSign);
  const byNakshatra = groupBy(members, member => member.nakshatra);
  const byDasha = groupBy(members, member => member.currentDasha.split('/')[0]);
  const sharedWeakHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.weakestHouses.slice(0, 3)),
  );
  const sharedStrongHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.strongestHouses.slice(0, 3)),
  );
  const themes: FamilyKarmaTheme[] = [];

  const repeatedMoon = firstRepeatedGroup(byMoon);
  if (repeatedMoon) {
    themes.push({
      evidence: [
        `Moon sign repeats: ${repeatedMoon.key}.`,
        `Members: ${repeatedMoon.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'When feelings rise, slow the room down before advising anyone. Shared Moon patterns often need acknowledgement first.',
      id: `moon-${repeatedMoon.key.toLowerCase()}`,
      members: repeatedMoon.items.map(member => member.id),
      summary:
        'A repeated Moon sign can make the family emotionally recognizable to itself, but also more reactive around familiar feelings.',
      title: `${repeatedMoon.key} Moon emotional pattern`,
    });
  }

  const repeatedNakshatra = firstRepeatedGroup(byNakshatra);
  if (repeatedNakshatra) {
    themes.push({
      evidence: [
        `Nakshatra repeats: ${repeatedNakshatra.key}.`,
        `Members: ${repeatedNakshatra.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'Give this pattern a healthy outlet through shared ritual, learning, service, or creative discipline instead of silent expectation.',
      id: `nakshatra-${repeatedNakshatra.key.toLowerCase()}`,
      members: repeatedNakshatra.items.map(member => member.id),
      summary:
        'A repeated nakshatra suggests a family habit that may echo through temperament, needs, and attention style.',
      title: `${repeatedNakshatra.key} family echo`,
    });
  }

  const repeatedDasha = firstRepeatedGroup(byDasha);
  if (repeatedDasha) {
    themes.push({
      evidence: [
        `Current Mahadasha repeats: ${repeatedDasha.key}.`,
        `Members: ${repeatedDasha.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'Avoid comparing progress. Similar timing can mean similar pressure, so support should be practical and specific.',
      id: `dasha-${repeatedDasha.key.toLowerCase()}`,
      members: repeatedDasha.items.map(member => member.id),
      summary:
        'A shared Mahadasha can make similar life lessons active at the same time.',
      title: `${repeatedDasha.key} timing overlap`,
    });
  }

  if (sharedWeakHouses.length > 0) {
    themes.push({
      evidence: [`Repeated low-support houses: ${sharedWeakHouses.join(', ')}.`],
      guidance:
        'Treat these as family care zones: plan, listen, and create structure before tension becomes personal.',
      id: 'shared-sensitive-houses',
      members: members.map(member => member.id),
      summary:
        'Repeated weaker ashtakavarga houses show topics that may need extra planning across the household.',
      title: `Shared sensitivity in houses ${sharedWeakHouses.join(', ')}`,
    });
  }

  if (sharedStrongHouses.length > 0) {
    themes.push({
      evidence: [`Repeated high-support houses: ${sharedStrongHouses.join(', ')}.`],
      guidance:
        'Use these as support zones. Let stronger areas carry family routines, celebrations, and collaborative decisions.',
      id: 'shared-support-houses',
      members: members.map(member => member.id),
      summary:
        'Repeated stronger ashtakavarga houses show where the family can find steadier support.',
      title: `Shared support in houses ${sharedStrongHouses.join(', ')}`,
    });
  }

  return themes.slice(0, 5);
}

function buildRelationshipCards(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
): FamilyRelationshipGuidance[] {
  const cards: FamilyRelationshipGuidance[] = [];

  for (let firstIndex = 0; firstIndex < input.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < input.length; secondIndex += 1) {
      const first = input[firstIndex].kundli;
      const second = input[secondIndex].kundli;
      const firstMember = members[firstIndex];
      const secondMember = members[secondIndex];

      if (!first || !second || !firstMember || !secondMember) {
        continue;
      }

      cards.push({
        emotionalPattern: emotionalPattern(firstMember, secondMember),
        evidence: [
          `${firstMember.name}: ${firstMember.moonSign} Moon, ${firstMember.nakshatra}, ${firstMember.currentDasha}.`,
          `${secondMember.name}: ${secondMember.moonSign} Moon, ${secondMember.nakshatra}, ${secondMember.currentDasha}.`,
          `Support zones: ${supportZones(first, second).join(', ') || 'no repeated top houses'}.`,
        ],
        firstMemberId: firstMember.id,
        id: `${firstMember.id}-${secondMember.id}`,
        label: `${RELATIONSHIP_LABELS[firstMember.relationship]} / ${RELATIONSHIP_LABELS[secondMember.relationship]}`,
        practicalGuidance: practicalGuidance(firstMember, secondMember),
        secondMemberId: secondMember.id,
        supportPattern: supportPattern(first, second),
      });
    }
  }

  return cards.slice(0, 8);
}

function emotionalPattern(
  first: FamilyMemberProfile,
  second: FamilyMemberProfile,
): string {
  if (first.moonSign === second.moonSign) {
    return `${first.name} and ${second.name} may recognize each other's feelings quickly, so gentle boundaries matter.`;
  }

  if (sameElement(first.moonSign, second.moonSign)) {
    return `${first.name} and ${second.name} share a ${elementName(first.moonSign)} emotional language; reassurance can land well.`;
  }

  return `${first.name} and ${second.name} may process feelings differently, so reflection works better than instant advice.`;
}

function supportPattern(first: KundliData, second: KundliData): string {
  const zones = supportZones(first, second);

  if (zones.length > 0) {
    return `Shared support appears around houses ${zones.join(', ')}. Use those topics for cooperation and trust-building.`;
  }

  return 'Their strongest support zones are different, so they may help each other by dividing responsibilities instead of forcing the same style.';
}

function practicalGuidance(
  first: FamilyMemberProfile,
  second: FamilyMemberProfile,
): string {
  if (first.currentDasha.split('/')[0] === second.currentDasha.split('/')[0]) {
    return 'Do not compete over whose pressure is bigger. Make one practical agreement, then check in again after emotions settle.';
  }

  if (first.relationship === 'parent' || second.relationship === 'parent') {
    return 'Use age-appropriate explanations, clear routines, and one calm repair sentence after conflict.';
  }

  if (first.relationship === 'partner' || second.relationship === 'partner') {
    return 'Name the need directly, keep decisions small, and avoid making silence carry the whole message.';
  }

  return 'Translate the feeling into one request. The goal is support, not deciding who is right.';
}

function supportZones(first: KundliData, second: KundliData): number[] {
  return first.ashtakavarga.strongestHouses
    .filter(house => second.ashtakavarga.strongestHouses.includes(house))
    .slice(0, 3);
}

function repeatedHouses(houseGroups: number[][]): number[] {
  const counts = new Map<number, number>();

  houseGroups.forEach(houses => {
    new Set(houses).forEach(house => {
      counts.set(house, (counts.get(house) ?? 0) + 1);
    });
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([house]) => house)
    .slice(0, 3);
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();

  items.forEach(item => {
    const key = getKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  });

  return map;
}

function firstRepeatedGroup<T>(
  map: Map<string, T[]>,
): { key: string; items: T[] } | undefined {
  return [...map.entries()]
    .filter(([, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([key, items]) => ({ key, items }))[0];
}

function defaultLabel(index: number): FamilyRelationshipLabel {
  return index === 0 ? 'self' : 'relative';
}

function sameElement(firstSign: string, secondSign: string): boolean {
  return (
    (WATER_SIGNS.has(firstSign) && WATER_SIGNS.has(secondSign)) ||
    (FIRE_SIGNS.has(firstSign) && FIRE_SIGNS.has(secondSign)) ||
    (AIR_SIGNS.has(firstSign) && AIR_SIGNS.has(secondSign)) ||
    (EARTH_SIGNS.has(firstSign) && EARTH_SIGNS.has(secondSign))
  );
}

function elementName(sign: string): string {
  if (WATER_SIGNS.has(sign)) {
    return 'water';
  }

  if (FIRE_SIGNS.has(sign)) {
    return 'fire';
  }

  if (AIR_SIGNS.has(sign)) {
    return 'air';
  }

  return 'earth';
}
