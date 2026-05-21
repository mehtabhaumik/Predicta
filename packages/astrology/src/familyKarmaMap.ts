import type {
  FamilyInfluenceMatrixRow,
  FamilyKarmaMap,
  FamilyKarmaTheme,
  FamilyMemberProfile,
  FamilyRelationshipGuidance,
  FamilyRelationshipLabel,
  KundliData,
  PairComparisonTone,
} from '@pridicta/types';
import { composePairComparison } from './pairComparison';

type FamilyKarmaInput = {
  kundli: KundliData;
  relationship?: FamilyRelationshipLabel;
};

type FamilyKarmaOptions = {
  depth?: 'FREE' | 'PREMIUM';
};

export function composeFamilyKarmaMap(
  input: FamilyKarmaInput[] = [],
  options: FamilyKarmaOptions = {},
): FamilyKarmaMap {
  const familyInput = input.filter(item => item.kundli).slice(0, 8);
  const members = familyInput.map((item, index) =>
    toFamilyMemberProfile(item.kundli, item.relationship, index),
  );

  if (members.length < 2) {
    return {
      askPrompt:
        'Explain what Family Karma Map will do once two or more saved profiles are selected. Keep the tone privacy-first, useful, and non-blaming.',
      dharmaRepairPath: undefined,
      householdSummary:
        'Family Karma Map opens once at least two real profiles are present.',
      influenceMatrix: [],
      members,
      privacyNote:
        'Family Karma Map stays private by default. It should explain repeating household patterns without blame, fear labels, or assigning one life to another person.',
      relationshipCards: [],
      repeatedThemes: [],
      repeatingKarmaPattern: undefined,
      shareSummary:
        'Predicta Family Karma Map is waiting for two or more saved profiles.',
      status: 'pending',
      strongestFrictionPair: undefined,
      strongestSupportPair: undefined,
      subtitle:
        'Add at least two saved profiles to see repeated karma patterns, support zones, and care guidance.',
      title: 'Add family profiles to unlock the map.',
    };
  }

  const pairCards = buildRelationshipCards(familyInput, members, options.depth);
  const repeatedThemes = buildRepeatedThemes(familyInput, members, pairCards);
  const supportPair = strongestPair(pairCards, 'supportive');
  const frictionPair = strongestPair(pairCards, 'careful');
  const repeatingKarmaPattern = repeatedThemes[0]?.summary;
  const dharmaRepairPath = buildDharmaRepairPath(pairCards, repeatedThemes);
  const influenceMatrix = buildInfluenceMatrix(members, pairCards);

  return {
    askPrompt: [
      `Explain the Family Karma Map for ${members.map(member => member.name).join(', ')}.`,
      'Use repeated household themes, strongest support pair, strongest friction pair, karma pattern, dharma repair path, and one practical family-healing direction.',
      'Keep it privacy-first, non-blaming, and life-area-focused.',
    ].join(' '),
    dharmaRepairPath,
    householdSummary: buildHouseholdSummary(
      members,
      supportPair?.label,
      frictionPair?.label,
      repeatedThemes,
    ),
    influenceMatrix,
    members,
    privacyNote:
      'Use this map for reflection and better handling, not for blame, labeling, or forcing one person to carry another person’s destiny.',
    relationshipCards: pairCards,
    repeatedThemes,
    repeatingKarmaPattern,
    shareSummary: [
      `Predicta Family Karma Map: ${members.length} profiles`,
      supportPair ? `Strongest support pair: ${supportPair.label}` : 'Strongest support pair: still forming',
      frictionPair ? `Strongest friction pair: ${frictionPair.label}` : 'Strongest friction pair: still forming',
      dharmaRepairPath ? `Repair path: ${dharmaRepairPath}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    status: 'ready',
    strongestFrictionPair: frictionPair?.label,
    strongestSupportPair: supportPair?.label,
    subtitle:
      options.depth === 'PREMIUM'
        ? 'Household themes, pairwise guidance, and influence patterns are arranged into practical family repair signals.'
        : 'Shared themes and pairwise patterns are grouped into gentle guidance, not blame.',
    title: `Family Karma Map for ${members.length} profiles`,
  };
}

function toFamilyMemberProfile(
  kundli: KundliData,
  relationshipOverride: FamilyRelationshipLabel | undefined,
  index: number,
): FamilyMemberProfile {
  const relationship = relationshipOverride ?? kundli.relationshipToOwner ?? (index === 0 ? 'self' : 'other');
  return {
    currentDasha: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    id: kundli.id,
    isOwnerProfile: kundli.isOwnerProfile ?? relationship === 'self',
    lagna: kundli.lagna,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    name: kundli.birthDetails.name,
    relationship,
    relationshipColorToken: kundli.relationshipColorToken ?? 'sage',
    relationshipDisplayLabel:
      kundli.relationshipDisplayLabel ?? relationshipLabel(relationship),
  };
}

function buildRelationshipCards(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
  depth: 'FREE' | 'PREMIUM' = 'FREE',
): FamilyRelationshipGuidance[] {
  const cards: FamilyRelationshipGuidance[] = [];

  for (let firstIndex = 0; firstIndex < input.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < input.length; secondIndex += 1) {
      const first = input[firstIndex]?.kundli;
      const second = input[secondIndex]?.kundli;
      const firstMember = members[firstIndex];
      const secondMember = members[secondIndex];

      if (!first || !second || !firstMember || !secondMember) {
        continue;
      }

      const pair = composePairComparison(first, second, { depth });
      cards.push({
        careArea:
          pair.frictionAreas[0] ??
          'Watch how this pair speaks when pressure rises.',
        dharmaSupport: pair.dharmaLesson,
        emotionalPattern: pair.freeHighlights[0]?.summary ?? pair.overview,
        evidence: pair.freeHighlights.flatMap(item => item.evidence).slice(0, 4),
        firstMemberId: firstMember.id,
        frictionPattern:
          pair.frictionAreas[0] ??
          'Differences need earlier repair, not later blame.',
        id: `${firstMember.id}-${secondMember.id}`,
        label: `${firstMember.name} (${firstMember.relationshipDisplayLabel}) / ${secondMember.name} (${secondMember.relationshipDisplayLabel})`,
        practicalGuidance: pair.practicalGuidance,
        secondMemberId: secondMember.id,
        supportPattern:
          pair.harmonyAreas[0] ??
          'A shared support bridge exists when both people keep the conversation direct.',
        tone: pair.overallTone,
      });
    }
  }

  return cards.slice(0, 16);
}

function buildRepeatedThemes(
  input: FamilyKarmaInput[],
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
): FamilyKarmaTheme[] {
  const themes: FamilyKarmaTheme[] = [];
  const repeatedMoonSigns = repeatedGroup(members, member => member.moonSign);
  const repeatedNakshatras = repeatedGroup(members, member => member.nakshatra);
  const repeatedMahadashas = repeatedGroup(
    members,
    member => member.currentDasha.split('/')[0] ?? member.currentDasha,
  );
  const sharedWeakHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.weakestHouses.slice(0, 3)),
  );
  const sharedStrongHouses = repeatedHouses(
    input.map(item => item.kundli.ashtakavarga.strongestHouses.slice(0, 3)),
  );

  if (repeatedMoonSigns) {
    themes.push({
      evidence: [
        `Repeated Moon sign: ${repeatedMoonSigns.key}.`,
        `Members: ${repeatedMoonSigns.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'When the same emotional style repeats, the house needs gentler pacing before advice or correction.',
      id: `moon-${repeatedMoonSigns.key.toLowerCase()}`,
      members: repeatedMoonSigns.items.map(member => member.id),
      summary:
        'A repeated Moon sign suggests the household reacts through a familiar emotional language, which can comfort and trigger at the same time.',
      title: `${repeatedMoonSigns.key} Moon family pattern`,
    });
  }

  if (repeatedNakshatras) {
    themes.push({
      evidence: [
        `Repeated nakshatra: ${repeatedNakshatras.key}.`,
        `Members: ${repeatedNakshatras.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'This is a good theme to channel through ritual, routine, service, or a repeated family repair habit.',
      id: `nakshatra-${repeatedNakshatras.key.toLowerCase()}`,
      members: repeatedNakshatras.items.map(member => member.id),
      summary:
        'A repeated nakshatra often points to the same family script showing up through different people.',
      title: `${repeatedNakshatras.key} karmic echo`,
    });
  }

  if (repeatedMahadashas) {
    themes.push({
      evidence: [
        `Repeated Mahadasha: ${repeatedMahadashas.key}.`,
        `Members: ${repeatedMahadashas.items.map(member => member.name).join(', ')}.`,
      ],
      guidance:
        'Do not compare who is struggling more. Similar timing often means similar pressure is loud at once.',
      id: `dasha-${repeatedMahadashas.key.toLowerCase()}`,
      members: repeatedMahadashas.items.map(member => member.id),
      summary:
        'A shared Mahadasha can make the same life lesson echo across the house at the same time.',
      title: `${repeatedMahadashas.key} timing overlap`,
    });
  }

  if (sharedWeakHouses.length) {
    themes.push({
      evidence: [`Repeated weak houses: ${sharedWeakHouses.join(', ')}.`],
      guidance:
        'Treat these houses as family care zones. Build structure there before tension becomes personal.',
      id: 'shared-sensitive-houses',
      members: members.map(member => member.id),
      summary:
        'Repeated lower-support houses show where the family may need more planning, patience, or financial/emotional structure.',
      title: `Shared sensitivity in houses ${sharedWeakHouses.join(', ')}`,
    });
  }

  if (sharedStrongHouses.length) {
    themes.push({
      evidence: [`Repeated strong houses: ${sharedStrongHouses.join(', ')}.`],
      guidance:
        'Use these as the house’s support anchors for routines, celebrations, logistics, and repair.',
      id: 'shared-support-houses',
      members: members.map(member => member.id),
      summary:
        'Repeated stronger houses show where the household already has usable support or natural flow.',
      title: `Shared support in houses ${sharedStrongHouses.join(', ')}`,
    });
  }

  if (pairCards.filter(card => card.tone === 'careful').length >= 2) {
    themes.push({
      evidence: pairCards
        .filter(card => card.tone === 'careful')
        .slice(0, 3)
        .map(card => `${card.label}: ${card.frictionPattern}`),
      guidance:
        'When more than one pair is carrying friction, the fix is usually cleaner routines and clearer emotional boundaries, not more blame.',
      id: 'pressure-chain',
      members: members.map(member => member.id),
      summary:
        'More than one relationship pair is carrying pressure, so the issue is becoming household-level rather than person-level.',
      title: 'Household pressure chain',
    });
  }

  return themes.slice(0, 6);
}

function buildInfluenceMatrix(
  members: FamilyMemberProfile[],
  pairCards: FamilyRelationshipGuidance[],
): FamilyInfluenceMatrixRow[] {
  return members.map(member => {
    const relatedCards = pairCards.filter(
      card => card.firstMemberId === member.id || card.secondMemberId === member.id,
    );
    const supportiveCount = relatedCards.filter(card => card.tone === 'supportive').length;
    const carefulCount = relatedCards.filter(card => card.tone === 'careful').length;

    return {
      influence:
        supportiveCount > carefulCount
          ? `${member.name} often acts as a support anchor when household pressure rises.`
          : carefulCount > supportiveCount
            ? `${member.name} is tied into one or more pressure chains, so handling around them must stay gentler and clearer.`
            : `${member.name} sits in a mixed influence zone and may need cleaner expectations than advice.`,
      memberId: member.id,
      name: member.name,
      relationshipDisplayLabel: member.relationshipDisplayLabel,
      supportNeed:
        relatedCards[0]?.careArea ??
        'Give this person one clear role and one calm repair path.',
    };
  });
}

function buildHouseholdSummary(
  members: FamilyMemberProfile[],
  strongestSupportPair: string | undefined,
  strongestFrictionPair: string | undefined,
  repeatedThemes: FamilyKarmaTheme[],
): string {
  const repeatedTitle = repeatedThemes[0]?.title?.toLowerCase();
  return [
    `${members.length} saved profiles are active in this household map.`,
    strongestSupportPair
      ? `The strongest support pair right now is ${strongestSupportPair}.`
      : 'A clear support pair has not formed yet.',
    strongestFrictionPair
      ? `The strongest friction pair right now is ${strongestFrictionPair}.`
      : 'No dominant friction pair is repeating yet.',
    repeatedTitle
      ? `The repeating household pattern is ${repeatedTitle}.`
      : 'The household pattern is still forming and needs more repeated evidence.',
  ].join(' ');
}

function buildDharmaRepairPath(
  pairCards: FamilyRelationshipGuidance[],
  repeatedThemes: FamilyKarmaTheme[],
): string | undefined {
  const carefulPair = pairCards.find(card => card.tone === 'careful');
  if (carefulPair) {
    return `Start with ${carefulPair.label}. ${carefulPair.practicalGuidance}`;
  }
  return repeatedThemes[0]?.guidance;
}

function strongestPair(
  pairCards: FamilyRelationshipGuidance[],
  tone: PairComparisonTone,
): FamilyRelationshipGuidance | undefined {
  return pairCards.find(card => card.tone === tone);
}

function repeatedGroup(
  members: FamilyMemberProfile[],
  selector: (member: FamilyMemberProfile) => string,
): { key: string; items: FamilyMemberProfile[] } | undefined {
  const groups = new Map<string, FamilyMemberProfile[]>();
  members.forEach(member => {
    const key = selector(member);
    const current = groups.get(key) ?? [];
    current.push(member);
    groups.set(key, current);
  });
  return [...groups.entries()]
    .map(([key, items]) => ({ key, items }))
    .filter(group => group.items.length >= 2)
    .sort((first, second) => second.items.length - first.items.length)[0];
}

function repeatedHouses(houseGroups: number[][]): number[] {
  const counts = new Map<number, number>();
  houseGroups.flat().forEach(house => {
    counts.set(house, (counts.get(house) ?? 0) + 1);
  });
  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((first, second) => second[1] - first[1])
    .map(([house]) => house)
    .slice(0, 3);
}

function relationshipLabel(value: FamilyRelationshipLabel): string {
  return value
    .split('-')
    .map(part => part[0]?.toUpperCase() + part.slice(1))
    .join(' ');
}
