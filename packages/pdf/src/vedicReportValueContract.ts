import type {
  KundliData,
  PDFMode,
  VedicIntelligenceContract,
} from '@pridicta/types';

export const VEDIC_FINAL_REPORT_REQUIRED_MODULES = [
  'Birth Snapshot',
  'Core Charts: D1, Moon, D9, D10, Chalit',
  'Panchang',
  'Avakhada Chakra',
  'Ghatak and Favorable Factors',
  'House-wise Planet Table',
  'Benefics and Malefics',
  'Mahadasha Phala',
  'Friendship Table',
  'Chalit Table',
  'Samsa',
  'Swamsa',
  'Karakamsha',
  'Ashtakavarga',
  'Prastarashtakavarga',
  'Yogas',
  'Consolidated Remedy Action Plan',
] as const;

export const VEDIC_FINAL_REPORT_SECTION_ORDER = [
  'birth-snapshot',
  'kundli-prediction-opening',
  'core-chart-prediction',
  'planet-house-evidence',
  'mahadasha-phala',
  'classical-tables',
  'premium-vargas',
  'timing-and-life-areas',
  'consolidated-remedies',
  'appendix-proof',
] as const;

export type VedicReportValueContract = {
  actionPromise: string;
  bannedFailures: string[];
  evidencePromise: string;
  freeDepthPromise: string;
  openingPrediction: string;
  paidDepthPromise: string;
  requiredModules: readonly string[];
  sectionOrder: readonly string[];
  timingPromise: string;
};

export function buildVedicReportValueContract(
  kundli: KundliData,
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): VedicReportValueContract {
  const currentDasha = kundli.dasha.current;
  const strongest = intelligence.snapshot.strongestHouses.slice(0, 3).join(', ') || 'prepared support houses';
  const weakest = intelligence.snapshot.weakestHouses.slice(0, 3).join(', ') || 'prepared correction houses';

  return {
    actionPromise:
      'The report closes with one consolidated remedy/action plan so remedies do not repeat or frighten the user.',
    bannedFailures: [
      'Vedic report as chart glossary',
      'Meaning column that only defines the area',
      'Mahadasha scattered outside its own section',
      'Repeated remedies in multiple places',
      'Premium pages that add length without sharper prediction',
      'Classical tables without user-facing implication',
    ],
    evidencePromise:
      'Technical knowledge is preserved through charts, graha placement, Panchang, Avakhada, Ghatak/Favorable, house-wise evidence, friendship, Chalit, Ashtakavarga, Prastarashtakavarga, yogas, and vargas.',
    freeDepthPromise:
      'Free Vedic gives useful chart-backed prediction, focus chart summaries, key timing, essential tables, and a practical next step.',
    openingPrediction:
      mode === 'PREMIUM'
        ? `${kundli.birthDetails.name}'s Kundli is read as a full life dossier: ${kundli.lagna} Lagna sets the life vehicle, ${kundli.moonSign} Moon shows the lived emotional lens, and ${currentDasha.mahadasha}/${currentDasha.antardasha} explains what is being delivered now. The strongest houses (${strongest}) show where effort receives support; the correction houses (${weakest}) show where discipline, timing, and remedy must be applied carefully.`
        : `${kundli.birthDetails.name}'s Kundli points first to ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, and the active ${currentDasha.mahadasha}/${currentDasha.antardasha} period. The useful reading is simple: see what is supported now, where patience is needed, and which practical step protects progress before studying the tables.`,
    paidDepthPromise:
      'Premium Vedic adds full diagnosis, contradiction handling, varga depth, Mahadasha windows, classical-table proof, timing relevance, and practical guidance.',
    requiredModules: VEDIC_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: VEDIC_FINAL_REPORT_SECTION_ORDER,
    timingPromise:
      `Timing is anchored in ${currentDasha.mahadasha} Mahadasha and ${currentDasha.antardasha} Antardasha through ${currentDasha.endDate}, then refined with transits, Sade Sati, yearly signals, and premium vargas where available.`,
  };
}
