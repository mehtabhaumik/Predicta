import type {
  AshtakootaSummary,
  CompatibilityAccess,
  CompatibilityInput,
  CompatibilityPartnerSummary,
  CompatibilityReport,
  CompatibilitySection,
  KundliData,
} from '@pridicta/types';

const KOOTA_MAX_SCORES = [
  ['Varna', 1],
  ['Vashya', 2],
  ['Tara', 3],
  ['Yoni', 4],
  ['Graha Maitri', 5],
  ['Gana', 6],
  ['Bhakoot', 7],
  ['Nadi', 8],
] as const;

export function buildCompatibilityPairKey(
  primaryKundliId: string,
  partnerKundliId: string,
): string {
  return [primaryKundliId, partnerKundliId].sort().join('__');
}

export function buildCompatibilityCacheKey(
  primary: KundliData,
  partner: KundliData,
): string {
  const ordered = [primary, partner].sort((a, b) => a.id.localeCompare(b.id));

  return stableHash(
    JSON.stringify({
      pair: ordered.map(kundli => ({
        id: kundli.id,
        inputHash: kundli.calculationMeta.inputHash,
      })),
      version: 'compatibility-v1',
    }),
  );
}

export function resolveCompatibilityAccess({
  hasFullAccess,
}: {
  hasFullAccess: boolean;
}): CompatibilityAccess {
  return hasFullAccess
    ? {
        canViewFullReport: true,
        depth: 'FULL',
        message: 'Full compatibility report depth is active.',
      }
    : {
        canViewFullReport: false,
        depth: 'FREE',
        message:
          'Free view shows the pair foundation. Full compatibility depth unlocks the detailed report.',
      };
}

export function buildCompatibilityReport({
  generatedAt = new Date().toISOString(),
  hasFullAccess,
  partnerKundli,
  primaryKundli,
}: CompatibilityInput): CompatibilityReport {
  const access = resolveCompatibilityAccess({ hasFullAccess });
  const pairKey = buildCompatibilityPairKey(primaryKundli.id, partnerKundli.id);
  const cacheKey = buildCompatibilityCacheKey(primaryKundli, partnerKundli);
  const sharedMoon = primaryKundli.moonSign === partnerKundli.moonSign;
  const sharedElementTone = inferElementTone(primaryKundli.lagna, partnerKundli.lagna);

  return {
    ashtakoota: buildAshtakootaUnavailable(),
    cacheKey,
    calculationMeta: {
      partner: {
        ayanamsa: partnerKundli.calculationMeta.ayanamsa,
        houseSystem: partnerKundli.calculationMeta.houseSystem,
        inputHash: partnerKundli.calculationMeta.inputHash,
      },
      primary: {
        ayanamsa: primaryKundli.calculationMeta.ayanamsa,
        houseSystem: primaryKundli.calculationMeta.houseSystem,
        inputHash: primaryKundli.calculationMeta.inputHash,
      },
    },
    cautionAreas: buildCautionAreas(primaryKundli, partnerKundli, access.depth),
    communicationPattern: buildCommunicationPattern(
      primaryKundli,
      partnerKundli,
      access.depth,
    ),
    depth: access.depth,
    emotionalCompatibility: buildEmotionalCompatibility(
      primaryKundli,
      partnerKundli,
      access.depth,
    ),
    familyLifeIndicators: buildFamilyLifeIndicators(
      primaryKundli,
      partnerKundli,
      access.depth,
    ),
    generatedAt,
    id: `compatibility-${pairKey}`,
    pairKey,
    partner: summarizePartner(partnerKundli),
    practicalGuidance: buildPracticalGuidance(
      primaryKundli,
      partnerKundli,
      access.depth,
    ),
    premiumSectionsLocked: access.depth !== 'FULL',
    primary: summarizePartner(primaryKundli),
    summary:
      sharedMoon || sharedElementTone === 'supportive'
        ? `${primaryKundli.birthDetails.name} and ${partnerKundli.birthDetails.name} show a steadier emotional foundation, but timing and communication still need conscious care.`
        : `${primaryKundli.birthDetails.name} and ${partnerKundli.birthDetails.name} show different operating rhythms. This is not negative; it means the relationship needs clearer agreements and patience.`,
    timingConsiderations: buildTimingConsiderations(
      primaryKundli,
      partnerKundli,
      access.depth,
    ),
  };
}

function summarizePartner(kundli: KundliData): CompatibilityPartnerSummary {
  return {
    currentDasha: `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
    kundliId: kundli.id,
    lagna: kundli.lagna,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    name: kundli.birthDetails.name,
  };
}

function buildAshtakootaUnavailable(): AshtakootaSummary {
  return {
    available: false,
    kootas: KOOTA_MAX_SCORES.map(([name, maxScore]) => ({
      available: false,
      maxScore,
      name,
      note: 'Awaiting verified Ashtakoota calculation from the astrology engine.',
    })),
    maxScore: 36,
    unavailableReason:
      'Predicta does not have enough verified matching details to create a compatibility score yet.',
  };
}

function buildEmotionalCompatibility(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  const sharedMoon = primary.moonSign === partner.moonSign;

  return {
    indicators: [
      `${primary.birthDetails.name}: Moon in ${primary.moonSign}, ${primary.nakshatra}`,
      `${partner.birthDetails.name}: Moon in ${partner.moonSign}, ${partner.nakshatra}`,
      depth === 'FULL'
        ? `Current dasha contrast: ${primary.dasha.current.mahadasha}/${partner.dasha.current.mahadasha}`
        : 'Full report adds dasha contrast and recurring emotional cycles.',
    ],
    summary: sharedMoon
      ? 'Both charts respond emotionally through a similar Moon sign, which can make moods easier to recognize.'
      : 'The Moon signs suggest different emotional processing styles. The relationship benefits when each person names their needs clearly.',
    title: 'Emotional compatibility',
  };
}

function buildCommunicationPattern(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  const mercuryOne = primary.planets.find(planet => planet.name === 'Mercury');
  const mercuryTwo = partner.planets.find(planet => planet.name === 'Mercury');

  return {
    indicators: [
      mercuryOne
        ? `${primary.birthDetails.name}: Mercury in ${mercuryOne.sign}`
        : `${primary.birthDetails.name}: Mercury placement pending`,
      mercuryTwo
        ? `${partner.birthDetails.name}: Mercury in ${mercuryTwo.sign}`
        : `${partner.birthDetails.name}: Mercury placement pending`,
      depth === 'FULL'
        ? 'Full depth reviews practical timing for difficult conversations.'
        : 'Free view keeps communication guidance concise.',
    ],
    summary:
      mercuryOne && mercuryTwo && mercuryOne.sign === mercuryTwo.sign
        ? 'Communication style may feel familiar, but familiarity still needs listening.'
        : 'Communication may require translation between two styles. Slow responses and written clarity can help.',
    title: 'Communication pattern',
  };
}

function buildFamilyLifeIndicators(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  return {
    indicators: [
      `${primary.birthDetails.name}: Lagna ${primary.lagna}`,
      `${partner.birthDetails.name}: Lagna ${partner.lagna}`,
      depth === 'FULL'
        ? 'Full depth includes home, responsibility, and long-term support themes.'
        : 'Full report unlocks family-life detail.',
    ],
    summary:
      inferElementTone(primary.lagna, partner.lagna) === 'supportive'
        ? 'The ascendant tone can support shared routines when both people keep responsibilities explicit.'
        : 'Daily-life rhythm may differ. The relationship needs practical agreements around space, family, and responsibilities.',
    title: 'Family life indicators',
  };
}

function buildTimingConsiderations(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  return {
    indicators: [
      `${primary.birthDetails.name}: ${primary.dasha.current.mahadasha} mahadasha`,
      `${partner.birthDetails.name}: ${partner.dasha.current.mahadasha} mahadasha`,
      `${primary.dasha.current.endDate} / ${partner.dasha.current.endDate}`,
    ],
    summary:
      depth === 'FULL'
        ? 'Timing should be reviewed around both dasha end dates before major commitments or family decisions.'
        : 'The preview shows current dasha timing. Full depth adds timing windows for sensitive conversations and commitments.',
    title: 'Timing considerations',
  };
}

function buildCautionAreas(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  const sharedDasha = primary.dasha.current.mahadasha === partner.dasha.current.mahadasha;

  return {
    indicators: [
      sharedDasha
        ? 'Both charts are under the same mahadasha influence.'
        : 'The charts are moving through different mahadasha influences.',
      'This section avoids fear-based conclusions.',
      depth === 'FULL'
        ? 'Full depth includes repeated pressure patterns and repair suggestions.'
        : 'Full report expands caution areas with practical repair patterns.',
    ],
    summary: sharedDasha
      ? 'Similar timing can amplify the same theme in both lives. Shared pressure needs shared pacing.'
      : 'Different timing can make one person feel ready while the other needs space. Avoid forcing the same pace.',
    title: 'Caution areas',
  };
}

function buildPracticalGuidance(
  primary: KundliData,
  partner: KundliData,
  depth: 'FREE' | 'FULL',
): CompatibilitySection {
  return {
    indicators: [
      `Use ${primary.birthDetails.name}'s ${primary.moonSign} Moon as an emotional cue.`,
      `Use ${partner.birthDetails.name}'s ${partner.moonSign} Moon as an emotional cue.`,
      depth === 'FULL'
        ? 'Schedule one weekly check-in and one monthly decision review.'
        : 'Full report adds a relationship rhythm plan.',
    ],
    summary:
      'Treat compatibility as a practice, not a verdict. Use the chart to build better timing, clearer language, and kinder repair.',
    title: 'Practical guidance',
  };
}

function inferElementTone(firstSign: string, secondSign: string): 'supportive' | 'mixed' {
  const first = signElement(firstSign);
  const second = signElement(secondSign);

  if (!first || !second) {
    return 'mixed';
  }

  if (first === second) {
    return 'supportive';
  }

  return (first === 'fire' && second === 'air') ||
    (first === 'air' && second === 'fire') ||
    (first === 'earth' && second === 'water') ||
    (first === 'water' && second === 'earth')
    ? 'supportive'
    : 'mixed';
}

function signElement(sign: string): 'fire' | 'earth' | 'air' | 'water' | undefined {
  if (['Aries', 'Leo', 'Sagittarius'].includes(sign)) {
    return 'fire';
  }
  if (['Taurus', 'Virgo', 'Capricorn'].includes(sign)) {
    return 'earth';
  }
  if (['Gemini', 'Libra', 'Aquarius'].includes(sign)) {
    return 'air';
  }
  if (['Cancer', 'Scorpio', 'Pisces'].includes(sign)) {
    return 'water';
  }
  return undefined;
}

function stableHash(value: string): string {
  let hash = 5381;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }

  return `cmp${hash}`;
}
