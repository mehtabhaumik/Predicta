import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import {
  AppText,
  DailyBriefingCard,
  DestinyPassportCard,
  FadeInView,
  FloatingGlowOrb,
  GlowButton,
  GlowCard,
  GradientText,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { PREDICTA_JOURNEY_STEPS } from '@pridicta/config/predictaUx';
import {
  SUPPORTED_LANGUAGE_OPTIONS,
  getLanguageLabels,
} from '@pridicta/config/language';
import {
  composeDailyBriefing,
  composeDestinyPassport,
  composeHolisticDailyGuidance,
  composePersonalPanchangLayer,
  composePurusharthaLifeBalance,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { useAppStore } from '../store/useAppStore';
import { saveLanguagePreference } from '../services/preferences/languagePreferenceStorage';
import { refreshKundliGocharIfNeeded } from '../services/astrology/gocharRefresh';
import { colors } from '../theme/colors';
import type { ChartContext, KundliData } from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

const quickActions = [
  {
    description: 'Work, momentum, timing',
    label: 'Career',
    section: 'Career',
  },
  {
    description: 'Partnership signals',
    label: 'Marriage',
    section: 'Marriage',
  },
  {
    description: 'Money flow and choices',
    label: 'Finance',
    section: 'Finance',
  },
  {
    description: 'Planetary phase view',
    label: 'Current Dasha',
    section: 'Current Dasha',
  },
] as const;

const navGroups = [
  {
    label: 'Start',
    items: [
      ['Create Kundli', routes.Kundli],
      ['Chat', routes.Chat],
      ['Decision', routes.DecisionOracle],
    ],
  },
  {
    label: 'Charts',
    items: [
      ['All Charts', routes.Charts],
      ['KP Predicta', routes.KpPredicta],
      ['Nadi Predicta', routes.NadiPredicta],
    ],
  },
  {
    label: 'Guidance',
    items: [
      ['Timeline', routes.LifeTimeline],
      ['Holistic Astrology', routes.HolisticReadingRooms],
      ['Remedies', routes.RemedyCoach],
      ['Birth Time', routes.BirthTimeDetective],
      ['Relationship', routes.RelationshipMirror],
      ['Family', routes.FamilyKarmaMap],
    ],
  },
  {
    label: 'Saved Work',
    items: [
      ['Wrapped', routes.PredictaWrapped],
      ['Reports', routes.Report],
      ['Saved Kundlis', routes.SavedKundlis],
    ],
  },
  {
    label: 'Account',
    items: [
      ['Premium', routes.Paywall],
      ['Redeem Pass', routes.RedeemPassCode],
      ['Settings', routes.Settings],
      ['Safety Promise', routes.SafetyPromise],
      ['Founder Vision', routes.FounderVision],
      ['Legal', routes.Legal],
    ],
  },
] as const;

const focusCards = [
  {
    label: 'Money',
    proof: '2nd + 11th',
    section: 'Money focus from 2nd house, 11th house, D1, D2, dasha, and Gochar',
  },
  {
    label: 'Career',
    proof: '10th + D10',
    section: 'Career focus from 10th house, D10, dasha, and Gochar',
  },
  {
    label: 'Marriage',
    proof: '7th + D9',
    section: 'Relationship focus from 7th house, D9, Venus, Jupiter, dasha, and Gochar',
  },
  {
    label: 'Spirituality',
    proof: '9th + D20',
    section: 'Spiritual focus from 9th house, D20, Jupiter, Ketu, and current dasha',
  },
] as const;

export function HomeScreen({
  navigation,
}: RootScreenProps<typeof routes.Home>): React.JSX.Element {
  const kundli = useAppStore(state => state.activeKundli);
  const languagePreference = useAppStore(state => state.languagePreference);
  const setLanguagePreference = useAppStore(
    state => state.setLanguagePreference,
  );
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const dailyBriefing = composeDailyBriefing(kundli, {
    language: languagePreference.language,
  });
  const destinyPassport = composeDestinyPassport(kundli);
  const gochar = composeTransitGocharIntelligence(kundli, { depth: 'FREE' });
  const yearlyHoroscope = composeYearlyHoroscopeVarshaphal(kundli, {
    depth: 'FREE',
  });
  const purushartha = composePurusharthaLifeBalance(kundli);
  const personalPanchang = composePersonalPanchangLayer(kundli);
  const holisticDailyGuidance = composeHolisticDailyGuidance(kundli, {
    language: languagePreference.language,
  });
  const lifeWeather = buildLifeWeather(kundli, dailyBriefing, gochar);
  const dasha = buildDashaDisplay(kundli);
  const gocharBars = buildGocharBars(gochar);
  const gocharPrimarySignal =
    gochar.topOpportunities[0] ?? gochar.cautionSignals[0];

  function askFromHome(context: ChartContext) {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    setActiveChartContext(context);
    navigation.navigate(routes.Chat);
  }

  function chooseLanguage(language: typeof languagePreference.language) {
    setLanguagePreference(language);
    saveLanguagePreference(language).catch(() => undefined);
  }

  const languageLabels = getLanguageLabels(languagePreference.language);

  React.useEffect(() => {
    let cancelled = false;

    refreshKundliGocharIfNeeded(kundli).then(nextKundli => {
      if (
        !cancelled &&
        nextKundli &&
        nextKundli.transits?.[0]?.calculatedAt !==
          kundli?.transits?.[0]?.calculatedAt
      ) {
        setActiveKundli(nextKundli);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [kundli, setActiveKundli]);

  return (
    <Screen>
      <FloatingGlowOrb size={260} style={styles.orb} />
      <FadeInView className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            Namaste{kundli ? `, ${kundli.birthDetails.name.split(' ')[0]}` : ''}
          </AppText>
          <GradientText variant="title">
            {kundli ? 'Your holistic astrology cockpit' : 'Start with your Kundli'}
          </GradientText>
        </View>
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </View>
      </FadeInView>

      <GlowCard className="mt-8" delay={80}>
        <View style={styles.cockpitTopline}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              TODAY'S COCKPIT
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {kundli?.birthDetails.name ?? 'Moment sky preview'}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              Holistic astrology from life weather, dasha, Gochar, and chart focus.
            </AppText>
          </View>
          <View style={styles.cockpitBadge}>
            <AppText variant="caption">
              {kundli ? 'Chart ready' : 'Preview'}
            </AppText>
          </View>
        </View>

        <View style={styles.weatherList}>
          {lifeWeather.map(item => (
            <View key={item.label} style={styles.weatherRow}>
              <View style={styles.weatherCopy}>
                <AppText variant="caption">{item.label}</AppText>
                <AppText tone="secondary" variant="caption">
                  {item.status}
                </AppText>
              </View>
              <View style={styles.weatherTrack}>
                <View
                  style={[
                    styles.weatherFill,
                    weatherToneStyle(item.tone),
                    { width: `${item.score}%` },
                  ]}
                />
              </View>
              <AppText tone="secondary" variant="caption">
                {item.reason}
              </AppText>
            </View>
          ))}
        </View>

        <View style={styles.cockpitSubgrid}>
          <View style={styles.cockpitMiniPanel}>
            <AppText tone="secondary" variant="caption">
              CURRENT DASHA
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {dasha.title}
            </AppText>
            <View style={styles.dashaTrack}>
              <View style={[styles.dashaFill, { width: `${dasha.progress}%` }]} />
            </View>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {dasha.window}
            </AppText>
          </View>

          <View style={styles.cockpitMiniPanel}>
            <AppText tone="secondary" variant="caption">
              GOCHAR IMPACT
            </AppText>
            {gocharBars.map(item => (
              <View key={item.label} style={styles.gocharMiniRow}>
                <AppText variant="caption">{item.label}</AppText>
                <View style={styles.gocharMiniTrack}>
                  <View style={[styles.gocharMiniFill, { width: `${item.score}%` }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.focusGrid}>
          {focusCards.map(card => (
            <Pressable
              accessibilityRole="button"
              key={card.label}
              onPress={() =>
                askFromHome({
                  selectedSection: card.section,
                  sourceScreen: 'Home cockpit',
                })
              }
              style={styles.focusCard}
            >
              <AppText variant="caption">{card.label}</AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {card.proof}
              </AppText>
            </Pressable>
          ))}
        </View>

        <View style={styles.personalPanchangPanel}>
          <AppText tone="secondary" variant="caption">
            PERSONAL PANCHANG
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {personalPanchang.weekdayLord} day, {personalPanchang.tithi}
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {personalPanchang.todayFocus}
          </AppText>
          <View style={styles.panchangSignalGrid}>
            {personalPanchang.signals.slice(0, 4).map(signal => (
              <Pressable
                accessibilityRole="button"
                key={signal.id}
                onPress={() =>
                  askFromHome({
                    selectedSection: 'Personal Panchang',
                    sourceScreen: 'Home Personal Panchang',
                  })
                }
                style={styles.panchangSignalCard}
              >
                <AppText tone="secondary" variant="caption">
                  {signal.label}
                </AppText>
                <AppText className="mt-1" variant="caption">
                  {signal.value}
                </AppText>
                <AppText className="mt-2" tone="secondary" variant="caption">
                  {signal.meaning}
                </AppText>
              </Pressable>
            ))}
          </View>
          <AppText className="mt-3" tone="secondary" variant="caption">
            Remedy: {personalPanchang.personalRemedy}
          </AppText>
        </View>

        <View style={styles.purusharthaPanel}>
          <AppText tone="secondary" variant="caption">
            HOLISTIC LIFE BALANCE
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {purushartha.dominant.label} leads now
          </AppText>
          <AppText className="mt-2" tone="secondary" variant="caption">
            {purushartha.summary}
          </AppText>
          <View style={styles.purusharthaGrid}>
            {purushartha.axes.map(axis => (
              <Pressable
                accessibilityRole="button"
                key={axis.category}
                onPress={() =>
                  askFromHome({
                    selectedSection: `${axis.label} Purushartha`,
                    sourceScreen: 'Home Purushartha',
                  })
                }
                style={styles.purusharthaCard}
              >
                <View style={styles.purusharthaCardHeader}>
                  <AppText variant="caption">{axis.label}</AppText>
                  <AppText variant="caption">{axis.score}%</AppText>
                </View>
                <View style={styles.purusharthaTrack}>
                  <View
                    style={[
                      styles.purusharthaFill,
                      purusharthaToneStyle(axis.tone),
                      { width: `${axis.score}%` },
                    ]}
                  />
                </View>
                <AppText className="mt-2" tone="secondary" variant="caption">
                  {axis.currentEmphasis}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.languagePanel}>
          <View>
            <AppText tone="secondary" variant="caption">
              {languageLabels.currentLanguage}
            </AppText>
            <AppText className="mt-1" variant="caption">
              {languageLabels.language}
            </AppText>
          </View>
          <View style={styles.languagePills}>
            {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
              <Pressable
                accessibilityRole="button"
                key={option.code}
                onPress={() => chooseLanguage(option.code)}
                style={[
                  styles.languagePill,
                  languagePreference.language === option.code
                    ? styles.languagePillActive
                    : undefined,
                ]}
              >
                <AppText variant="caption">{option.nativeName}</AppText>
              </Pressable>
            ))}
          </View>
        </View>
      </GlowCard>

      {!kundli ? (
        <GlowCard className="mt-8" delay={110}>
        <AppText tone="secondary" variant="caption">
          START HERE
        </AppText>
        <GradientText style={styles.cardTitle} variant="subtitle">
          3 simple steps
        </GradientText>
        <View className="mt-4 gap-3">
          {PREDICTA_JOURNEY_STEPS.map((step, index) => (
            <Pressable
              accessibilityRole="button"
              key={step.id}
              onPress={() => {
                if (step.id === 'create') {
                  navigation.navigate(routes.Kundli);
                } else if (step.id === 'ask') {
                  askFromHome({
                    selectedSection: 'Simple guided question',
                    sourceScreen: 'Home',
                  });
                }
              }}
              style={styles.journeyStep}
            >
              <View style={styles.stepNumber}>
                <AppText variant="caption">{index + 1}</AppText>
              </View>
              <View className="flex-1">
                <AppText variant="caption">{step.action}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  {step.body}
                </AppText>
              </View>
            </Pressable>
          ))}
        </View>
        </GlowCard>
      ) : null}

      <View className="mt-8">
        <DailyBriefingCard
          briefing={dailyBriefing}
          holisticGuidance={holisticDailyGuidance}
          onAskToday={() =>
            askFromHome({
              selectedDailyBriefingDate: dailyBriefing.date,
              selectedSection: dailyBriefing.askPrompt,
              sourceScreen: 'Daily Briefing',
            })
          }
          onAskGuidance={() =>
            askFromHome({
              selectedDailyBriefingDate: holisticDailyGuidance.date,
              selectedSection: holisticDailyGuidance.askPrompt,
              sourceScreen: 'Holistic Daily Guidance',
            })
          }
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>

      <GlowCard className="mt-8" delay={160}>
        <View style={styles.gocharTopline}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              {gochar.status === 'pending'
                ? 'MOMENT SKY PREVIEW'
                : 'CURRENT GOCHAR'}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {gochar.status === 'pending'
                ? 'What the sky is doing right now'
                : 'What current Gochar is bringing'}
            </AppText>
          </View>
          <View style={styles.gocharBadge}>
            <AppText variant="caption">{gochar.dominantWeight}</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          {gochar.snapshotSummary}
        </AppText>
        {gocharPrimarySignal ? (
          <View style={styles.gocharSignal}>
            <AppText tone="secondary" variant="caption">
              {gocharPrimarySignal.weight}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {gocharPrimarySignal.headline}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {gocharPrimarySignal.practicalGuidance}
            </AppText>
          </View>
        ) : null}
        <View className="mt-4">
          <GlowButton
            label="Open Gochar Panel"
            onPress={() => navigation.navigate(routes.LifeTimeline)}
          />
        </View>
      </GlowCard>

      <GlowCard className="mt-8" delay={180}>
        <View style={styles.gocharTopline}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              YEARLY HOROSCOPE
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {yearlyHoroscope.status === 'pending'
                ? 'Your personal year is waiting'
                : 'What this solar year is asking'}
            </AppText>
          </View>
          <View style={styles.gocharBadge}>
            <AppText variant="caption">{yearlyHoroscope.yearLabel}</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          {yearlyHoroscope.freeInsight}
        </AppText>
        {yearlyHoroscope.status === 'ready' ? (
          <View style={styles.gocharSignal}>
            <AppText tone="secondary" variant="caption">
              Muntha focus
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              House {yearlyHoroscope.munthaHouse} in{' '}
              {yearlyHoroscope.munthaSign}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {yearlyHoroscope.yearTheme}
            </AppText>
          </View>
        ) : null}
        <View className="mt-4">
          <GlowButton
            label="Open Yearly Panel"
            onPress={() => navigation.navigate(routes.LifeTimeline)}
          />
        </View>
      </GlowCard>

      <View className="mt-8">
        <DestinyPassportCard
          onPrimaryAction={() => navigation.navigate(routes.Kundli)}
          passport={destinyPassport}
        />
      </View>

      <View className="mt-7">
        <GlowButton
          delay={220}
          label={kundli ? 'Ask Predicta' : 'Create Kundli First'}
          onPress={() =>
            askFromHome({
              selectedSection: 'Home overview',
              sourceScreen: 'Home',
            })
          }
        />
      </View>

      <GlowCard className="mt-6" delay={260}>
        <AppText tone="secondary" variant="caption">APP MAP</AppText>
        <AppText className="mt-2" variant="subtitle">
          Choose by intent.
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          The same grouped paths are available on web and mobile.
        </AppText>
        <View className="mt-4 gap-5">
          {navGroups.map(group => (
            <View key={group.label}>
              <AppText tone="secondary" variant="caption">
                {group.label}
              </AppText>
              <View style={styles.navChipGrid}>
                {group.items.map(([label, route]) => (
                  <Pressable
                    accessibilityRole="button"
                    key={label}
                    onPress={() => navigation.navigate(route as never)}
                    style={styles.toolChip}
                  >
                    <AppText variant="caption">{label}</AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
        </View>
      </GlowCard>

      <FadeInView className="mt-8" delay={440}>
        <AppText variant="subtitle">Quick actions</AppText>
      </FadeInView>

      <View className="mt-4 flex-row flex-wrap gap-4">
        {quickActions.map((action, index) => (
          <Pressable
            accessibilityRole="button"
            className="w-[47%]"
            key={action.label}
            onPress={() =>
              askFromHome({
                selectedSection: action.section,
                sourceScreen: 'Home',
              })
            }
          >
            <GlowCard contentClassName="min-h-[128px]" delay={460 + index * 80}>
              <AppText variant="subtitle">{action.label}</AppText>
              <AppText className="mt-2" tone="secondary" variant="caption">
                {action.description}
              </AppText>
              <AppText className="mt-auto text-xl" tone="secondary">
                {'>'}
              </AppText>
            </GlowCard>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

type WeatherItem = {
  label: string;
  reason: string;
  score: number;
  status: 'Supportive' | 'Mixed' | 'Needs care';
  tone: 'supportive' | 'mixed' | 'challenging';
};

function buildLifeWeather(
  kundli: KundliData | undefined,
  briefing: ReturnType<typeof composeDailyBriefing>,
  gochar: ReturnType<typeof composeTransitGocharIntelligence>,
): WeatherItem[] {
  const cues = new Map(briefing.cues.map(cue => [cue.area, cue]));
  const sav = kundli?.ashtakavarga.sav ?? [];
  const strongest = kundli?.ashtakavarga.strongestHouses ?? [];
  const weakest = kundli?.ashtakavarga.weakestHouses ?? [];

  return [
    buildWeatherItem(
      'Money',
      scoreHouse(sav, 2, strongest, weakest),
      cues.get('money')?.weight ?? gochar.dominantWeight,
      cues.get('money')?.text ?? 'Money weather personalizes after Kundli creation.',
    ),
    buildWeatherItem(
      'Career',
      scoreHouse(sav, 10, strongest, weakest),
      cues.get('career')?.weight ?? gochar.dominantWeight,
      cues.get('career')?.text ?? 'Career weather reads D1, D10, dasha, and Gochar.',
    ),
    buildWeatherItem(
      'Relationship',
      scoreHouse(sav, 7, strongest, weakest),
      cues.get('relationship')?.weight ?? gochar.dominantWeight,
      cues.get('relationship')?.text ?? 'Relationship weather reads the 7th house and D9.',
    ),
    buildWeatherItem(
      'Mind',
      scoreHouse(sav, 4, strongest, weakest),
      gochar.dominantWeight,
      kundli
        ? `${kundli.moonSign} Moon shapes today’s emotional weather.`
        : 'Moon-based weather becomes personal after Kundli creation.',
    ),
  ];
}

function buildWeatherItem(
  label: string,
  base: number,
  weight: 'supportive' | 'challenging' | 'mixed' | 'neutral',
  reason: string,
): WeatherItem {
  const score = clamp(base + weightAdjustment(weight), 18, 94);
  const tone: WeatherItem['tone'] =
    score >= 68 ? 'supportive' : score >= 42 ? 'mixed' : 'challenging';

  return {
    label,
    reason,
    score,
    status:
      tone === 'supportive'
        ? 'Supportive'
        : tone === 'mixed'
          ? 'Mixed'
          : 'Needs care',
    tone,
  };
}

function buildDashaDisplay(kundli?: KundliData) {
  if (!kundli) {
    return {
      progress: 12,
      title: 'Waiting',
      window: 'Birth details needed',
    };
  }

  const current = kundli.dasha.current;
  const start = new Date(current.startDate).getTime();
  const end = new Date(current.endDate).getTime();
  const progress =
    Number.isFinite(start) && Number.isFinite(end) && end > start
      ? clamp(Math.round(((Date.now() - start) / (end - start)) * 100), 4, 96)
      : 50;

  return {
    progress,
    title: `${current.mahadasha} → ${current.antardasha}`,
    window: `${current.startDate} to ${current.endDate}`,
  };
}

function buildGocharBars(gochar: ReturnType<typeof composeTransitGocharIntelligence>) {
  const planets = ['Jupiter', 'Saturn', 'Rahu', 'Ketu'];

  return planets.map(planet => {
    const insight = gochar.planetInsights.find(item => item.planet === planet);
    return {
      label: planet,
      score: clamp(58 + weightAdjustment(insight?.weight ?? 'neutral'), 24, 90),
    };
  });
}

function scoreHouse(
  sav: number[],
  house: number,
  strongest: number[],
  weakest: number[],
): number {
  if (strongest.includes(house)) {
    return 74;
  }
  if (weakest.includes(house)) {
    return 36;
  }

  const score = sav[house - 1];
  return typeof score === 'number' ? clamp(Math.round((score / 40) * 100), 28, 84) : 56;
}

function weightAdjustment(weight: 'supportive' | 'challenging' | 'mixed' | 'neutral'): number {
  if (weight === 'supportive') {
    return 12;
  }
  if (weight === 'challenging') {
    return -14;
  }
  if (weight === 'mixed') {
    return -2;
  }
  return 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function weatherToneStyle(tone: WeatherItem['tone']) {
  if (tone === 'supportive') {
    return styles.supportiveFill;
  }
  if (tone === 'challenging') {
    return styles.challengingFill;
  }
  return styles.mixedFill;
}

function purusharthaToneStyle(
  tone: ReturnType<typeof composePurusharthaLifeBalance>['axes'][number]['tone'],
) {
  if (tone === 'supportive') {
    return styles.supportiveFill;
  }
  if (tone === 'careful') {
    return styles.challengingFill;
  }
  return styles.mixedFill;
}

const styles = StyleSheet.create({
  cardTitle: {
    marginTop: 8,
  },
  challengingFill: {
    backgroundColor: '#DD6F8F',
  },
  cockpitBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cockpitMiniPanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  cockpitSubgrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cockpitTopline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  dashaFill: {
    backgroundColor: colors.gradient[1],
    borderRadius: 999,
    height: '100%',
  },
  dashaTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 8,
    marginTop: 12,
    overflow: 'hidden',
  },
  focusCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 76,
    padding: 12,
    width: '47%',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  logo: {
    borderRadius: 14,
    height: 48,
    width: 48,
  },
  logoShell: {
    borderColor: colors.borderGlow,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
    padding: 3,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
  panchangSignalCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 108,
    padding: 12,
    width: '47%',
  },
  panchangSignalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  personalPanchangPanel: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  purusharthaCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 112,
    padding: 12,
    width: '47%',
  },
  purusharthaCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  purusharthaFill: {
    borderRadius: 999,
    height: '100%',
  },
  purusharthaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  purusharthaPanel: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    padding: 12,
  },
  languagePanel: {
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
    marginTop: 16,
    padding: 12,
  },
  languagePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languagePill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  languagePillActive: {
    backgroundColor: 'rgba(77,175,255,0.16)',
    borderColor: colors.borderGlow,
  },
  purusharthaTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 7,
    marginTop: 10,
    overflow: 'hidden',
  },
  orb: {
    right: -120,
    top: 52,
  },
  journeyStep: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
  },
  stepNumber: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 195, 77, 0.16)',
    borderColor: 'rgba(255, 195, 77, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  gocharBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  gocharSignal: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  gocharTopline: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  gocharMiniFill: {
    backgroundColor: colors.gradient[1],
    borderRadius: 999,
    height: '100%',
  },
  gocharMiniRow: {
    gap: 6,
    marginTop: 10,
  },
  gocharMiniTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 7,
    overflow: 'hidden',
  },
  toolChip: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexGrow: 1,
    minWidth: '44%',
  },
  navChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  mixedFill: {
    backgroundColor: '#FFC34D',
  },
  supportiveFill: {
    backgroundColor: '#55D6BE',
  },
  weatherCopy: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherFill: {
    borderRadius: 999,
    height: '100%',
  },
  weatherList: {
    gap: 14,
    marginTop: 18,
  },
  weatherRow: {
    gap: 7,
  },
  weatherTrack: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
});
