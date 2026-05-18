import type { DestinyPassport, KundliData } from '@pridicta/types';

export function composeDestinyPassport(kundli?: KundliData): DestinyPassport {
  if (!kundli) {
    return {
      birthTimeConfidence: {
        confidence: 'low',
        label: 'Unverified',
        reason: 'Create a Kundli before Predicta can judge birth-time confidence.',
      },
      currentCaution: 'Create a Kundli first so Predicta can read current caution areas.',
      currentDasha: 'Pending',
      evidence: [
        'Birth details need to be confirmed first.',
        'Dasha, ashtakavarga, and transit evidence appear after Kundli creation.',
        'Create a Kundli to prepare your Destiny Passport.',
      ],
      lagna: 'Pending',
      lifeTheme: 'Your personal chart identity will appear here after calculation.',
      moonSign: 'Pending',
      nakshatra: 'Pending',
      name: 'Predicta Seeker',
      recommendedAction: 'Create your kundli from verified birth date, time, place, and timezone.',
      shareSummary: 'My Predicta Destiny Passport is waiting for my Kundli.',
      status: 'pending',
      strongestHouses: [],
      weakestHouses: [],
    };
  }

  const current = kundli.dasha.current;
  const strongest = kundli.ashtakavarga.strongestHouses.slice(0, 3);
  const weakest = kundli.ashtakavarga.weakestHouses.slice(0, 3);
  const rectification = kundli.rectification;
  const primaryRemedy = kundli.remedies?.[0];
  const strongestText = strongest.join(', ');
  const weakestText = weakest.join(', ');
  const firstName = kundli.birthDetails.name.split(' ')[0] || kundli.birthDetails.name;
  const birthTimeConfidence = rectification?.needsRectification
    ? {
        confidence: rectification.confidence,
        label: 'Check Needed' as const,
        reason: rectification.reasons[0] ?? 'Birth time needs checking before fine timing.',
      }
    : {
        confidence: rectification?.confidence ?? 'medium',
        label: 'Stable' as const,
        reason:
          rectification?.reasons[0] ??
          'Birth time is not marked approximate and can support standard chart reading.',
      };

  const lifeTheme = `${firstName} is in a ${current.mahadasha}/${current.antardasha} timing chapter, with strongest chart support around houses ${strongestText}.`;
  const currentCaution = `Move carefully around houses ${weakestText}; these areas need cleaner routines and less impulsive pressure.`;
  const recommendedAction =
    primaryRemedy?.practice ??
    `Use the ${current.mahadasha} period for one steady weekly discipline and one practical decision at a time.`;
  const evidence = [
    `${kundli.lagna} Lagna sets the body, direction, and life approach.`,
    `${kundli.moonSign} Moon in ${kundli.nakshatra} shows the emotional pattern and inner timing lens.`,
    `${current.mahadasha}/${current.antardasha} is active from ${current.startDate} to ${current.endDate}.`,
    `Ashtakavarga strongest houses: ${strongestText}; weakest houses: ${weakestText}.`,
  ].slice(0, 4);

  return {
    birthTimeConfidence,
    currentCaution,
    currentDasha: `${current.mahadasha}/${current.antardasha}`,
    evidence,
    lagna: kundli.lagna,
    lifeTheme,
    moonSign: kundli.moonSign,
    nakshatra: kundli.nakshatra,
    name: kundli.birthDetails.name,
    recommendedAction,
    shareSummary: [
      `${kundli.birthDetails.name}'s Predicta Destiny Passport`,
      `${kundli.lagna} Lagna | ${kundli.moonSign} Moon | ${kundli.nakshatra}`,
      `Current timing: ${current.mahadasha}/${current.antardasha}`,
      `Focus: houses ${strongestText}. Care: houses ${weakestText}.`,
    ].join('\n'),
    status: 'ready',
    strongestHouses: strongest,
    weakestHouses: weakest,
  };
}
