import type {
  KundliData,
  SavedKundliRecord,
  SupportedLanguage,
} from '@pridicta/types';
import { composeBirthTimeDetective } from './birthTimeDetective';
import { composeDailyBriefing } from './dailyBriefing';
import { composeDestinyPassport } from './destinyPassport';
import { composeFamilyKarmaMap } from './familyKarmaMap';
import { composeLifeTimeline } from './lifeTimeline';
import { composePredictaWrapped } from './predictaWrapped';
import { composeRemedyCoach } from './remedyCoach';
import { composeRelationshipMirror } from './relationshipMirror';

export type PredictaAppActionId =
  | 'birth-time'
  | 'chart'
  | 'concierge'
  | 'daily-briefing'
  | 'destiny-passport'
  | 'family-map'
  | 'life-timeline'
  | 'pricing'
  | 'relationship'
  | 'remedies'
  | 'report'
  | 'saved-kundlis'
  | 'wrapped';

export type PredictaInteractionMemory = {
  actionCounts: Partial<Record<PredictaAppActionId, number>>;
  chartSignatures: string[];
  firstSeenAt: string;
  lastAction?: PredictaAppActionId;
  preferredLanguageStyle?: SupportedLanguage;
  lastSeenAt: string;
  learnedThemes: string[];
  totalTurns: number;
};

export type PredictaActionRequest = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  memory?: PredictaInteractionMemory;
  savedKundlis?: KundliData[];
  text: string;
};

export type PredictaActionReply = {
  action?: PredictaAppActionId;
  handled: boolean;
  memory: PredictaInteractionMemory;
  text?: string;
};

export type PredictaLanguageContext = {
  acknowledgement?: string;
  dominantLanguage: SupportedLanguage;
  normalizedText: string;
  responseLanguage: SupportedLanguage;
};

const ACTION_PATTERNS: Array<{
  id: PredictaAppActionId;
  pattern: RegExp;
}> = [
  {
    id: 'destiny-passport',
    pattern:
      /\b(passport|pasport|paspot|destiny\s*passport|identity\s*card|profile\s*card)\b/i,
  },
  {
    id: 'life-timeline',
    pattern:
      /\b(timeline|life\s*calendar|calendar|calender|dasha\s*timeline|transit\s*timeline|life\s*map|next\s*12\s*months|aavta\s*varas|agla\s*saal)\b/i,
  },
  {
    id: 'daily-briefing',
    pattern:
      /\b(daily|today|aaj|briefing|cosmic\s*weather|day\s*reading|aaj\s*ka|aajnu)\b/i,
  },
  {
    id: 'remedies',
    pattern:
      /\b(remedy|remedies|upay|upaay|coach|practice|mantra|daan)\b/i,
  },
  {
    id: 'birth-time',
    pattern:
      /\b(birth\s*time|rectification|detective|time\s*confidence|time\s*unknown)\b/i,
  },
  {
    id: 'wrapped',
    pattern: /\b(wrapped|yearly\s*recap|recap|share\s*card|year\s*review)\b/i,
  },
  {
    id: 'report',
    pattern:
      /\b(report|riport|ripot|pdf|dossier|bundle|career\s*report|marriage\s*report|wealth\s*report|report\s*bana|pdf\s*bana)\b/i,
  },
  {
    id: 'relationship',
    pattern:
      /\b(relationship|compatibility|marriage|shaadi|couple|partner|match|synastry|rishta|vivah)\b/i,
  },
  {
    id: 'family-map',
    pattern:
      /\b(family|karma\s*map|household|parents|children|vault|ghar|parivar|kutumb)\b/i,
  },
  {
    id: 'chart',
    pattern:
      /\b(chart|kundli|kundly|kundali|kundaly|janam\s*kundli|house|planet|lagna|moon|nakshatra|north\s*indian)\b/i,
  },
  {
    id: 'pricing',
    pattern:
      /\b(price|pricing|premium|subscription|plan|day\s*pass|purchase|buy|unlock)\b/i,
  },
  {
    id: 'saved-kundlis',
    pattern: /\b(saved|save|store|profiles|family\s*member|members)\b/i,
  },
  {
    id: 'concierge',
    pattern:
      /\b(help|what\s*can\s*you\s*do|show\s*me|guide\s*me|surprise\s*me|what\s*next|kya\s*kar\s*sakti|su\s*kari\s*sake|shu\s*kari\s*sake)\b/i,
  },
];

export function preparePredictaLanguageContext({
  selectedLanguage,
  text,
  memory,
}: {
  memory?: PredictaInteractionMemory;
  selectedLanguage: SupportedLanguage;
  text: string;
}): PredictaLanguageContext {
  const dominantLanguage = detectDominantPredictaLanguage(text);
  const responseLanguage =
    selectedLanguage !== dominantLanguage &&
    (dominantLanguage === 'hi' || dominantLanguage === 'gu')
      ? dominantLanguage
      : selectedLanguage;
  const shouldAcknowledge =
    responseLanguage !== selectedLanguage &&
    memory?.preferredLanguageStyle !== responseLanguage;

  return {
    acknowledgement: shouldAcknowledge
      ? buildLanguageSwitchAcknowledgement(selectedLanguage, responseLanguage)
      : undefined,
    dominantLanguage,
    normalizedText: normalizePredictaIntentText(text),
    responseLanguage,
  };
}

export function normalizePredictaIntentText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectDominantPredictaLanguage(
  text: string,
): SupportedLanguage {
  const normalized = normalizePredictaIntentText(text);
  const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const guScore = [
    hasGujaratiScript,
    /\b(mane|mne|mare|mara|mari|tame|tamari|kem|shu|su|chhe|che|nathi|mate|paisa|nana|aavse|aavta|varas|kundli\s*banav)\b/i.test(
      normalized,
    ),
  ].filter(Boolean).length;
  const hiScore = [
    hasDevanagari,
    /\b(mera|meri|mujhe|mujko|mujhko|main|mein|me|aap|tum|kya|kaise|kaisa|batao|hoga|hogi|paisa|paise|kundli\s*bana|shaadi|naukri)\b/i.test(
      normalized,
    ),
  ].filter(Boolean).length;

  if (guScore > hiScore) {
    return 'gu';
  }
  if (hiScore > 0) {
    return 'hi';
  }
  return 'en';
}

export function buildPredictaActionReply({
  hasPremiumAccess = false,
  kundli,
  language,
  memory,
  savedKundlis = [],
  text,
}: PredictaActionRequest): PredictaActionReply {
  const languageContext = preparePredictaLanguageContext({
    memory,
    selectedLanguage: language,
    text,
  });
  const action = detectPredictaAppAction(languageContext.normalizedText);
  const nextMemory = learnPredictaInteraction(
    memory,
    text,
    action,
    kundli,
    languageContext.responseLanguage,
  );

  if (!action) {
    return {
      handled: false,
      memory: nextMemory,
    };
  }

  if (!kundli && actionRequiresKundli(action)) {
    return {
      action,
      handled: true,
      memory: nextMemory,
      text: withLanguageAcknowledgement(
        languageContext,
        buildNeedsKundliReply(languageContext.responseLanguage, action),
      ),
    };
  }

  return {
    action,
    handled: true,
    memory: nextMemory,
    text: withLanguageAcknowledgement(
      languageContext,
      buildActionText({
        action,
        hasPremiumAccess,
        kundli,
        language: languageContext.responseLanguage,
        memory: nextMemory,
        savedKundlis,
        text,
      }),
    ),
  };
}

export function buildPredictaLearningSuggestion({
  hasPremiumAccess = false,
  kundli,
  language,
  memory,
  savedKundlis = [],
}: Omit<PredictaActionRequest, 'text'>): string {
  const next = pickNextSuggestion(
    memory,
    kundli,
    savedKundlis,
    hasPremiumAccess,
  );
  const insight = buildMemoryInsight(language, memory, kundli, savedKundlis);

  if (language === 'hi') {
    return [
      insight,
      `Meri taraf se next smart step: ${next}. Boliye to main yahin chat mein start kar dungi.`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      insight,
      `Mari taraf thi next smart step: ${next}. Kaho to hu ahi chat ma start kari dau.`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    insight,
    `My smart next move: ${next}. Say the word and I will start it here in chat.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function learnPredictaInteraction(
  memory: PredictaInteractionMemory | undefined,
  text: string,
  action?: PredictaAppActionId,
  kundli?: KundliData,
  responseLanguage?: SupportedLanguage,
): PredictaInteractionMemory {
  const now = new Date().toISOString();
  const current = memory ?? {
    actionCounts: {},
    chartSignatures: [],
    firstSeenAt: now,
    lastSeenAt: now,
    learnedThemes: [],
    totalTurns: 0,
  };
  const learnedThemes = mergeUnique(
    current.learnedThemes,
    inferThemes(text, action),
    8,
  );
  const chartSignatures = kundli
    ? mergeUnique(current.chartSignatures, [chartSignature(kundli)], 8)
    : current.chartSignatures;

  return {
    ...current,
    actionCounts: action
      ? {
          ...current.actionCounts,
          [action]: (current.actionCounts[action] ?? 0) + 1,
        }
      : current.actionCounts,
    chartSignatures,
    lastAction: action ?? current.lastAction,
    lastSeenAt: now,
    learnedThemes,
    preferredLanguageStyle:
      responseLanguage ?? current.preferredLanguageStyle,
    totalTurns: current.totalTurns + 1,
  };
}

function detectPredictaAppAction(
  text: string,
): PredictaAppActionId | undefined {
  const normalized = text.trim();

  if (!normalized) {
    return undefined;
  }

  const match = ACTION_PATTERNS.find(item => item.pattern.test(normalized));

  if (match) {
    return match.id;
  }

  return undefined;
}

function actionRequiresKundli(action: PredictaAppActionId): boolean {
  return !['concierge', 'pricing', 'saved-kundlis'].includes(action);
}

function buildActionText({
  action,
  hasPremiumAccess,
  kundli,
  language,
  memory,
  savedKundlis,
  text,
}: Required<
  Pick<PredictaActionRequest, 'language' | 'savedKundlis' | 'text'>
> & {
  action: PredictaAppActionId;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  memory: PredictaInteractionMemory;
}): string {
  const intro = actionIntro(language);
  const insight = buildMemoryInsight(language, memory, kundli, savedKundlis);
  const upsell = buildUpsell(language, action, hasPremiumAccess);

  if (action === 'concierge') {
    return joinSections([
      intro,
      conciergeMenu(language, Boolean(kundli), hasPremiumAccess),
      insight,
      upsell,
    ]);
  }

  if (action === 'pricing') {
    return joinSections([
      intro,
      pricingReply(language, hasPremiumAccess),
      insight,
    ]);
  }

  if (action === 'saved-kundlis') {
    return joinSections([
      intro,
      savedKundlisReply(language, savedKundlis),
      insight,
      upsell,
    ]);
  }

  if (!kundli) {
    return buildNeedsKundliReply(language, action);
  }

  if (action === 'destiny-passport') {
    const passport = composeDestinyPassport(kundli);
    return joinSections([
      intro,
      [
        `${passport.name}'s Destiny Passport`,
        `Lagna: ${passport.lagna}`,
        `Moon: ${passport.moonSign} | Nakshatra: ${passport.nakshatra}`,
        `Current timing: ${passport.currentDasha}`,
        `Life theme: ${passport.lifeTheme}`,
        `Watch carefully: ${passport.currentCaution}`,
        `Action: ${passport.recommendedAction}`,
        `Proof: ${passport.evidence.slice(0, 3).join(' | ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'life-timeline') {
    const timeline = composeLifeTimeline(kundli);
    const nowEvents = timeline.sections
      .flatMap(section => section.events)
      .slice(0, 3)
      .map(event => `${event.title}: ${event.dateWindow}`)
      .join('\n');
    return joinSections([
      intro,
      [
        timeline.title,
        `Current: ${timeline.currentPeriod}`,
        `Upcoming: ${timeline.upcomingPeriod}`,
        nowEvents ? `Top windows:\n${nowEvents}` : timeline.subtitle,
        timeline.caution ? `Caution: ${timeline.caution}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'daily-briefing') {
    const briefing = composeDailyBriefing(kundli, { language });
    return joinSections([
      intro,
      [
        briefing.title,
        briefing.todayTheme,
        `Best action: ${briefing.bestAction}`,
        `Avoid: ${briefing.avoidAction}`,
        `Micro-remedy: ${briefing.remedyMicroAction}`,
        `Proof: ${briefing.evidence.slice(0, 2).join(' | ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'remedies') {
    const plan = composeRemedyCoach(kundli);
    const top = plan.items[0];
    return joinSections([
      intro,
      top
        ? [
            plan.title,
            `${top.title}: ${top.practice}`,
            `Cadence: ${top.cadence}`,
            `Why: ${top.rationale}`,
            `Caution: ${top.caution}`,
          ].join('\n')
        : `${plan.title}\nNo remedy item is available yet, so I would keep the practice simple: one steady routine, no fear, no paid ritual pressure.`,
      insight,
      upsell,
    ]);
  }

  if (action === 'birth-time') {
    const report = composeBirthTimeDetective(kundli);
    return joinSections([
      intro,
      [
        report.title,
        `Confidence: ${report.confidenceLabel} (${report.confidenceScore}/100)`,
        report.summary,
        `Safe: ${report.safeJudgments.slice(0, 2).join(' | ')}`,
        `Next: ${report.nextAction}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'wrapped') {
    const wrapped = composePredictaWrapped({ kundli });
    return joinSections([
      intro,
      [
        wrapped.title,
        `Year theme: ${wrapped.yearTheme}`,
        `Growth area: ${wrapped.growthArea}`,
        `Hard lesson: ${wrapped.hardLesson}`,
        `Best window: ${wrapped.bestWindow}`,
        `Share-safe: ${
          wrapped.privacyCheck.excludesExactBirthTime &&
          wrapped.privacyCheck.excludesBirthPlace
            ? 'yes'
            : 'needs review'
        }`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'relationship') {
    const other = savedKundlis.find(item => item.id !== kundli.id);
    const mirror = composeRelationshipMirror(kundli, other);
    return joinSections([
      intro,
      other
        ? [
            mirror.headline,
            mirror.overview,
            `Talk this week: ${mirror.howToTalkThisWeek}`,
            `Timing overlap: ${mirror.timingOverlap}`,
          ].join('\n')
        : 'I can build Relationship Mirror here, but I need one more saved Kundli in your vault. Add or create the other person in chat, then say “compare relationship”.',
      insight,
      upsell,
    ]);
  }

  if (action === 'family-map') {
    const family = composeFamilyKarmaMap(
      [kundli, ...savedKundlis.filter(item => item.id !== kundli.id)]
        .slice(0, 5)
        .map((item, index) => ({
          kundli: item,
          relationship: index === 0 ? 'self' : 'relative',
        })),
    );
    return joinSections([
      intro,
      [
        family.title,
        family.subtitle,
        family.repeatedThemes[0]
          ? `Repeated theme: ${family.repeatedThemes[0].title} - ${family.repeatedThemes[0].summary}`
          : 'Add one more saved Kundli and I can compare repeated family patterns without blame.',
        family.privacyNote,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'chart') {
    return joinSections([
      intro,
      [
        `${kundli.birthDetails.name}'s chart snapshot`,
        `Lagna: ${kundli.lagna}`,
        `Moon: ${kundli.moonSign} in ${kundli.nakshatra}`,
        `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
        `Strong houses: ${kundli.ashtakavarga.strongestHouses
          .slice(0, 3)
          .join(', ')}`,
        `Pressure houses: ${kundli.ashtakavarga.weakestHouses
          .slice(0, 3)
          .join(', ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'report') {
    return joinSections([
      intro,
      [
        `I staged the report brief for ${kundli.birthDetails.name}.`,
        `Executive signal: ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} timing.`,
        `Free report: Kundli summary, core chart proof, dasha, remedies.`,
        `Premium PDF bundle: Kundli, Career, Marriage, Wealth, Child, Remedies with evidence tables and timing windows.`,
        `Ask “prepare premium PDF bundle” when you want me to deepen it.`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'report', hasPremiumAccess),
    ]);
  }

  return joinSections([
    intro,
    `I understood this as: ${text}. I can keep it inside Predicta and turn it into the right chart-backed workflow.`,
    insight,
    upsell,
  ]);
}

function buildNeedsKundliReply(
  language: SupportedLanguage,
  action: PredictaAppActionId,
): string {
  const actionLabel = labelAction(action);

  if (language === 'hi') {
    return [
      `Haan, main ${actionLabel} yahin chat mein kar sakti hoon.`,
      'Pehle active Kundli chahiye. DOB, birth time, aur birth place bhej dein; main Kundli bana kar isi kaam ko aage badhaungi.',
      'Agar sirf DOB pata hai, wahi bhejiye. Baaki main pyaar se pooch lungi.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Haan, hu ${actionLabel} ahi chat ma kari shaku chhu.`,
      'Pehla active Kundli joye. DOB, birth time ane birth place moklo; hu Kundli banaine aa kaam aagal vadharish.',
      'Fakat DOB khabar hoy to e moklo. Baaki hu dhime thi poochi laish.',
    ].join('\n\n');
  }

  return [
    `Yes, I can do ${actionLabel} right here in chat.`,
    'First I need an active Kundli. Send date of birth, birth time, and birth place; I will create the Kundli and continue the work here.',
    'If you only know the DOB, send that first. I will ask for the rest gently.',
  ].join('\n\n');
}

function actionIntro(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Haan. Yeh main yahin kar deti hoon.';
  }
  if (language === 'gu') {
    return 'Haan. Aa hu ahi j kari dau chhu.';
  }
  return 'Yes. I can do that right here.';
}

function conciergeMenu(
  language: SupportedLanguage,
  hasKundli: boolean,
  hasPremiumAccess: boolean,
): string {
  const premiumLine = hasPremiumAccess
    ? 'Premium is active, so I can go deeper with reports, timing windows, and evidence tables.'
    : 'Premium path: deeper AI, Life Calendar, report bundles, compatibility, and richer proof.';

  if (!hasKundli) {
    return [
      'Start by sending DOB, birth time, and birth place. I will create the Kundli here.',
      'After that I can build Destiny Passport, Life Timeline, Daily Briefing, remedies, Wrapped, Relationship Mirror, Family Karma Map, and PDF report briefs.',
      premiumLine,
    ].join('\n');
  }

  return [
    'I can build your Destiny Passport, Life Timeline, Daily Briefing, Remedy Coach, Birth Time Detective, Wrapped, chart snapshot, report brief, relationship comparison, and family map.',
    premiumLine,
    'My recommendation: start with Destiny Passport, then Life Timeline, then Premium PDF bundle.',
  ].join('\n');
}

function pricingReply(
  language: SupportedLanguage,
  hasPremiumAccess: boolean,
): string {
  if (hasPremiumAccess) {
    return 'Premium is already active. Use it for deeper AI answers, timelines, remedies, report bundles, compatibility, and evidence-heavy readings.';
  }

  if (language === 'hi') {
    return 'Premium ka clean path: Monthly/Yearly for deeper AI + timelines + remedies + reports. One-time PDF impulse purchase ke liye. Day Pass trial ke liye. Compatibility/Marriage report alag high-intent purchase rehna chahiye.';
  }
  if (language === 'gu') {
    return 'Premium no clean path: Monthly/Yearly deeper AI + timelines + remedies + reports mate. One-time PDF impulse purchase mate. Day Pass trial mate. Compatibility/Marriage report alag high-intent purchase rehvu joye.';
  }
  return 'Premium path: Monthly/Yearly for deeper AI, Life Calendar, remedies, and reports. One-time Premium PDF for impulse purchase. Day Pass for trial. Compatibility/Marriage report as a separate high-intent purchase.';
}

function savedKundlisReply(
  language: SupportedLanguage,
  savedKundlis: KundliData[],
): string {
  const count = savedKundlis.length;
  const names = savedKundlis
    .slice(0, 5)
    .map(kundli => kundli.birthDetails.name)
    .join(', ');

  if (language === 'hi') {
    return count
      ? `Aapke paas ${count} saved Kundli profile hain: ${names}. Main inhe relationship, family map, aur pattern comparison ke liye use kar sakti hoon.`
      : 'Abhi saved Kundli nahi dikh rahi. Aap chat mein kisi family member ki birth details bhejiye, main profile bana sakti hoon.';
  }
  if (language === 'gu') {
    return count
      ? `Tamari pase ${count} saved Kundli profile chhe: ${names}. Hu relationship, family map ane pattern comparison mate teno use kari shaku chhu.`
      : 'Haju saved Kundli dekhaati nathi. Family member ni birth details chat ma moklo, hu profile banaavi shaku chhu.';
  }
  return count
    ? `You have ${count} saved Kundli profile${
        count === 1 ? '' : 's'
      }: ${names}. I can use them for relationship, family map, and pattern comparison.`
    : 'I do not see saved Kundlis yet. Send a family member’s birth details in chat and I can create the profile.';
}

function buildMemoryInsight(
  language: SupportedLanguage,
  memory: PredictaInteractionMemory | undefined,
  kundli: KundliData | undefined,
  savedKundlis: KundliData[],
): string {
  if (!kundli) {
    if (!memory?.learnedThemes.length) {
      return '';
    }
    const themes = memory.learnedThemes.slice(0, 3).join(', ');
    if (language === 'hi') {
      return `Main aapka pattern learn kar rahi hoon: ${themes}.`;
    }
    if (language === 'gu') {
      return `Hu tamaro pattern learn kari rahi chhu: ${themes}.`;
    }
    return `I am learning your pattern: ${themes}.`;
  }

  const similar = findSimilarSavedKundli(kundli, savedKundlis);

  if (similar) {
    const line = `I noticed a close chart pattern in saved profiles: ${
      similar.kundli.birthDetails.name
    } shares ${similar.matches.join(
      ', ',
    )} with this Kundli. Not identical, but close enough that I would compare timing carefully.`;

    if (language === 'hi') {
      return `Meri local memory mein ek close chart pattern dikha: ${
        similar.kundli.birthDetails.name
      } mein ${similar.matches.join(
        ', ',
      )} similar hai. Identical nahi, lekin comparison useful rahega.`;
    }
    if (language === 'gu') {
      return `Mari local memory ma close chart pattern dekhaayu: ${
        similar.kundli.birthDetails.name
      } ma ${similar.matches.join(
        ', ',
      )} similar chhe. Identical nathi, pan comparison useful raheshe.`;
    }
    return line;
  }

  if (memory?.chartSignatures.includes(chartSignature(kundli))) {
    if (language === 'hi') {
      return `Mujhe ab yeh chart signature yaad hai: ${chartSignature(
        kundli,
      )}. Jaise-jaise aur Kundlis vault mein aayengi, main pattern comparison automatically karungi.`;
    }
    if (language === 'gu') {
      return `Mane aa chart signature have yaad chhe: ${chartSignature(
        kundli,
      )}. Jem-jem vadhu Kundlis vault ma aavshe, hu pattern comparison automatically karish.`;
    }
    return `I remember this chart signature now: ${chartSignature(
      kundli,
    )}. As more Kundlis enter your vault, I will compare this pattern automatically.`;
  }

  if (language === 'hi') {
    return `Main is chart signature ko memory mein add kar rahi hoon: ${chartSignature(
      kundli,
    )}.`;
  }
  if (language === 'gu') {
    return `Hu aa chart signature memory ma add kari rahi chhu: ${chartSignature(
      kundli,
    )}.`;
  }
  return `I am adding this chart signature to memory: ${chartSignature(
    kundli,
  )}.`;
}

function buildUpsell(
  language: SupportedLanguage,
  action: PredictaAppActionId,
  hasPremiumAccess: boolean,
): string {
  if (hasPremiumAccess) {
    return 'Since Premium is active, I can deepen this with evidence tables, timing windows, and a report-ready synthesis.';
  }

  const suggestion =
    action === 'report'
      ? 'The premium PDF bundle is the strongest next unlock here.'
      : action === 'life-timeline'
      ? 'Premium Life Calendar can turn this into monthly dasha/transit cards with reminders.'
      : action === 'relationship'
      ? 'Compatibility/Marriage report is a high-value separate purchase for this.'
      : 'Premium can deepen this with proof, timing confidence, and report-grade synthesis.';

  if (language === 'hi') {
    return `Premium nudge: ${suggestion} Chahe to main pehle free preview bana dungi, phir premium depth dikhaungi.`;
  }
  if (language === 'gu') {
    return `Premium nudge: ${suggestion} Kaho to hu pehla free preview banaish, pachhi premium depth batavish.`;
  }
  return `Premium nudge: ${suggestion} I can show the free preview first, then the premium depth.`;
}

function pickNextSuggestion(
  memory: PredictaInteractionMemory | undefined,
  kundli: KundliData | undefined,
  savedKundlis: KundliData[],
  hasPremiumAccess: boolean,
): string {
  if (!kundli) {
    return 'create your Kundli from birth details';
  }

  const counts = memory?.actionCounts ?? {};

  if (!counts['destiny-passport']) {
    return 'create your Destiny Passport';
  }
  if (!counts['life-timeline']) {
    return 'build your Life Timeline';
  }
  if (!counts.remedies) {
    return 'start Remedy Coach';
  }
  if (savedKundlis.length > 1 && !counts.relationship) {
    return 'compare a relationship or family pattern';
  }
  if (!hasPremiumAccess) {
    return 'preview the Premium PDF bundle';
  }
  return 'turn this into an astrologer-grade advanced reading';
}

function inferThemes(text: string, action?: PredictaAppActionId): string[] {
  const normalized = text.toLowerCase();
  const themes: string[] = [];

  if (action) {
    themes.push(labelAction(action));
  }
  if (/\b(career|job|work|business)\b/i.test(normalized)) {
    themes.push('career');
  }
  if (/\b(marriage|relationship|partner|love)\b/i.test(normalized)) {
    themes.push('relationship');
  }
  if (/\b(money|wealth|finance|income)\b/i.test(normalized)) {
    themes.push('wealth');
  }
  if (/\b(remedy|mantra|practice|upay)\b/i.test(normalized)) {
    themes.push('remedies');
  }
  if (/\b(timing|when|dasha|transit|calendar)\b/i.test(normalized)) {
    themes.push('timing');
  }

  return themes;
}

function findSimilarSavedKundli(
  kundli: KundliData,
  savedKundlis: KundliData[],
):
  | {
      kundli: KundliData;
      matches: string[];
      score: number;
    }
  | undefined {
  return savedKundlis
    .filter(item => item.id !== kundli.id)
    .map(item => {
      const matches = [
        item.lagna === kundli.lagna ? `${kundli.lagna} Lagna` : '',
        item.moonSign === kundli.moonSign ? `${kundli.moonSign} Moon` : '',
        item.nakshatra === kundli.nakshatra
          ? `${kundli.nakshatra} Nakshatra`
          : '',
        item.dasha.current.mahadasha === kundli.dasha.current.mahadasha
          ? `${kundli.dasha.current.mahadasha} Mahadasha`
          : '',
      ].filter(Boolean);

      return {
        kundli: item,
        matches,
        score: matches.length,
      };
    })
    .filter(item => item.score >= 2)
    .sort((a, b) => b.score - a.score)[0];
}

function chartSignature(kundli: KundliData): string {
  return `${kundli.lagna} Lagna / ${kundli.moonSign} Moon / ${kundli.nakshatra} / ${kundli.dasha.current.mahadasha}-${kundli.dasha.current.antardasha}`;
}

function labelAction(action: PredictaAppActionId): string {
  return action
    .split('-')
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function mergeUnique(
  current: string[],
  next: string[],
  limit: number,
): string[] {
  return [...new Set([...next, ...current].filter(Boolean))].slice(0, limit);
}

function joinSections(sections: Array<string | undefined>): string {
  return sections.filter(Boolean).join('\n\n');
}

function buildLanguageSwitchAcknowledgement(
  selectedLanguage: SupportedLanguage,
  responseLanguage: SupportedLanguage,
): string | undefined {
  if (selectedLanguage === 'hi' && responseLanguage === 'gu') {
    return 'I sense you want to talk in Gujarati. I will adjust accordingly.';
  }
  if (selectedLanguage === 'gu' && responseLanguage === 'hi') {
    return 'Lagta hai aap Hindi/Hinglish mein comfortable ho. Main tone adjust kar leti hoon.';
  }
  if (selectedLanguage === 'en' && responseLanguage === 'hi') {
    return 'I can feel the Hinglish tone in your message, so I will answer that way.';
  }
  if (selectedLanguage === 'en' && responseLanguage === 'gu') {
    return 'I can feel the Gujarati tone in your message, so I will answer that way.';
  }
  return undefined;
}

function withLanguageAcknowledgement(
  context: PredictaLanguageContext,
  text: string,
): string {
  return [context.acknowledgement, text].filter(Boolean).join('\n\n');
}
