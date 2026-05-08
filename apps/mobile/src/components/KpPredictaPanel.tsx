import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import type { ChalitBhavKpFoundation } from '../types/astrology';
import { colors } from '../theme/colors';
import { AppText } from './AppText';
import { FadeInView } from './FadeInView';
import { GlowCard } from './GlowCard';
import { GradientText } from './GradientText';

type KpEventFocus = 'career' | 'money' | 'marriage' | 'property';

const KP_EVENT_FOCUS: Array<{
  id: KpEventFocus;
  title: string;
  houses: number[];
  prompt: string;
}> = [
  {
    houses: [2, 6, 10, 11],
    id: 'career',
    prompt:
      'Using KP only, judge career and job movement from houses 2, 6, 10, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Career and job',
  },
  {
    houses: [2, 5, 8, 11],
    id: 'money',
    prompt:
      'Using KP only, judge money gains and financial stability from houses 2, 5, 8, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Money and gains',
  },
  {
    houses: [2, 7, 11],
    id: 'marriage',
    prompt:
      'Using KP only, judge marriage and partnership promise from houses 2, 7, 11, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Marriage and partner',
  },
  {
    houses: [4, 11, 12],
    id: 'property',
    prompt:
      'Using KP only, judge home, property, and relocation from houses 4, 11, 12, cusp sub lords, significators, ruling planets, and dasha support.',
    title: 'Home and property',
  },
];

type KpPredictaPanelProps = {
  foundation: ChalitBhavKpFoundation;
  handoffQuestion?: string;
  hasPremiumAccess?: boolean;
  onAskKp?: (prompt: string) => void;
  onPremium?: () => void;
  schoolCalculationStatus?: 'idle' | 'calculating' | 'error';
};

export function KpPredictaPanel({
  foundation,
  handoffQuestion,
  hasPremiumAccess = false,
  onAskKp,
  onPremium,
  schoolCalculationStatus = 'idle',
}: KpPredictaPanelProps): React.JSX.Element {
  const kp = foundation.kp;
  const ruling = kp.rulingPlanets;
  const [selectedEvent, setSelectedEvent] = useState<KpEventFocus>('career');
  const selectedFocus =
    KP_EVENT_FOCUS.find(item => item.id === selectedEvent) ?? KP_EVENT_FOCUS[0];
  const [selectedCusp, setSelectedCusp] = useState<number>(
    selectedFocus.houses.at(-2) ?? selectedFocus.houses[0],
  );
  const selectedCuspData = kp.cusps.find(cusp => cusp.house === selectedCusp);
  const eventSignificators = useMemo(
    () =>
      kp.significators
        .filter(item =>
          item.signifiesHouses.some(house => selectedFocus.houses.includes(house)),
        )
        .slice(0, hasPremiumAccess ? 6 : 4),
    [hasPremiumAccess, kp.significators, selectedFocus.houses],
  );
  const askPrompt = handoffQuestion
    ? `KP Predicta question: ${handoffQuestion}. ${selectedFocus.prompt}`
    : `${selectedFocus.prompt}${
        selectedCuspData
          ? ` Selected cusp ${selectedCuspData.house} has star lord ${selectedCuspData.lordChain.starLord}, sub lord ${selectedCuspData.lordChain.subLord}, and sub-sub lord ${selectedCuspData.lordChain.subSubLord}.`
          : ''
      }`;

  return (
    <View className="gap-5">
      <GlowCard delay={100}>
        <View style={styles.header}>
          <View className="flex-1">
            <AppText tone="secondary" variant="caption">
              KP PREDICTA
            </AppText>
            <GradientText className="mt-1" variant="subtitle">
              A separate precision school
            </GradientText>
          </View>
          <View style={styles.badge}>
            <AppText variant="caption">KP world</AppText>
          </View>
        </View>
        <AppText className="mt-3" tone="secondary">
          KP Predicta stays inside Krishnamurti Paddhati: cusps, star lords,
          sub lords, significators, ruling planets, dasha support, and
          event-focused judgement.
        </AppText>
        <View style={styles.explainBox}>
          <AppText variant="caption">{kp.title}</AppText>
          <AppText className="mt-2" tone="secondary">
            {hasPremiumAccess
              ? kp.premiumSynthesis ?? kp.freeInsight
              : kp.freeInsight}
          </AppText>
        </View>
        {handoffQuestion ? (
          <View style={styles.handoffBox}>
            <AppText variant="caption">QUESTION RECEIVED</AppText>
            <AppText className="mt-2" tone="secondary">
              {handoffQuestion}
            </AppText>
          </View>
        ) : null}
      </GlowCard>

      {ruling ? (
        <GlowCard delay={140}>
          <AppText tone="secondary" variant="caption">
            RULING PLANETS
          </AppText>
          <View style={styles.metricGrid}>
            <Metric label="Day" value={ruling.dayLord} />
            <Metric label="Moon star" value={ruling.moonStarLord} />
            <Metric label="Moon sub" value={ruling.moonSubLord} />
            <Metric label="Lagna sub" value={ruling.lagnaSubLord} />
          </View>
        </GlowCard>
      ) : null}

      <GlowCard delay={160}>
        <AppText tone="secondary" variant="caption">
          KP JUDGEMENT PATH
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {selectedFocus.title}
        </AppText>
        <AppText className="mt-2" tone="secondary">
          Pick the event first. KP then checks houses, cusp sub lord,
          significators, ruling planets, and dasha support.
        </AppText>
        <View style={styles.eventGrid}>
          {KP_EVENT_FOCUS.map(item => {
            const active = item.id === selectedEvent;

            return (
              <Pressable
                accessibilityRole="button"
                key={item.id}
                onPress={() => {
                  setSelectedEvent(item.id);
                  setSelectedCusp(item.houses.at(-2) ?? item.houses[0]);
                }}
                style={[styles.eventCard, active ? styles.activeEventCard : undefined]}
              >
                <AppText variant="caption">{item.title}</AppText>
                <AppText className="mt-1" tone="secondary" variant="caption">
                  Houses {item.houses.join(', ')}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.pathGrid}>
          <PathStep label="Houses" value={selectedFocus.houses.join(' / ')} />
          <PathStep
            label="Cusp sub lord"
            value={
              selectedCuspData
                ? `${selectedCuspData.house}: ${selectedCuspData.lordChain.subLord}`
                : 'Pending'
            }
          />
          <PathStep
            label="Significators"
            value={String(eventSignificators.length || 'Pending')}
          />
          <PathStep label="Timing" value="Ruling planets + dasha" />
        </View>
      </GlowCard>

      <GlowCard delay={180}>
        <AppText tone="secondary" variant="caption">
          KP CUSPS
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          12 cusps with star and sub lords
        </AppText>
        <View className="mt-4 gap-2">
          {kp.cusps.slice(0, 12).map((cusp, index) => (
            <FadeInView delay={80 + index * 26} duration={300} key={cusp.house}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelectedCusp(cusp.house)}
                style={[
                  styles.row,
                  selectedCusp === cusp.house ||
                  selectedFocus.houses.includes(cusp.house)
                    ? styles.relevantRow
                    : undefined,
                ]}
              >
                <AppText variant="caption">Cusp {cusp.house}</AppText>
                <AppText tone="secondary" variant="caption">
                  {cusp.sign} {cusp.degree.toFixed(2)}° · Star{' '}
                  {cusp.lordChain.starLord} · Sub {cusp.lordChain.subLord}
                </AppText>
              </Pressable>
            </FadeInView>
          ))}
          {!kp.cusps.length ? (
            <AppText tone="secondary">
              {getKpCalculationMessage(schoolCalculationStatus)}
            </AppText>
          ) : null}
        </View>
      </GlowCard>

      <GlowCard delay={220}>
        <AppText tone="secondary" variant="caption">
          KP SIGNIFICATOR MAP
        </AppText>
        <View className="mt-4 gap-2">
          {eventSignificators.map((item, index) => (
            <FadeInView delay={80 + index * 40} duration={320} key={item.planet}>
              <View style={styles.significatorNode}>
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <AppText variant="caption">
                      {item.planet} · {item.strength}
                    </AppText>
                    <AppText className="mt-1" tone="secondary" variant="caption">
                      {item.simpleMeaning}
                    </AppText>
                  </View>
                  <View style={styles.housePillRow}>
                    {item.signifiesHouses
                      .filter(house => selectedFocus.houses.includes(house))
                      .map(house => (
                        <View key={`${item.planet}-${house}`} style={styles.housePill}>
                          <AppText variant="caption">H{house}</AppText>
                        </View>
                      ))}
                  </View>
                </View>
              </View>
            </FadeInView>
          ))}
        </View>
      </GlowCard>

      <GlowCard delay={260}>
        <AppText tone="secondary" variant="caption">
          KP SIGNIFICATORS
        </AppText>
        <View className="mt-4 gap-2">
          {kp.significators.slice(0, hasPremiumAccess ? 9 : 5).map(item => (
            <View key={item.planet} style={styles.row}>
              <AppText variant="caption">
                {item.planet} · {item.strength}
              </AppText>
              <AppText tone="secondary" variant="caption">
                Houses {item.signifiesHouses.join(', ') || 'Not clear yet'}
              </AppText>
            </View>
          ))}
        </View>
        <View className="mt-4 flex-row flex-wrap gap-3">
          {onAskKp ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onAskKp(askPrompt)}
              style={styles.cta}
            >
              <AppText variant="caption">Ask KP Predicta</AppText>
            </Pressable>
          ) : null}
          {onPremium ? (
            <Pressable
              accessibilityRole="button"
              onPress={onPremium}
              style={styles.cta}
            >
              <AppText variant="caption">KP Premium Depth</AppText>
            </Pressable>
          ) : null}
        </View>
      </GlowCard>
    </View>
  );
}

function PathStep({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.pathStep}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {value}
      </AppText>
    </View>
  );
}

function getKpCalculationMessage(
  status: 'idle' | 'calculating' | 'error',
): string {
  if (status === 'calculating') {
    return 'Calculating KP cusps, star lords, and sub lords from your saved birth details...';
  }

  if (status === 'error') {
    return 'Predicta has your birth details, but KP calculation could not complete right now. Please try again shortly.';
  }

  return 'KP Predicta is preparing this layer from the saved birth profile.';
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View style={styles.metric}>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.34)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  cta: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  explainBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  activeEventCard: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.38)',
  },
  eventCard: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 76,
    minWidth: 142,
    padding: 12,
  },
  eventGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  handoffBox: {
    backgroundColor: 'rgba(116,125,255,0.12)',
    borderColor: 'rgba(116,125,255,0.34)',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 12,
  },
  housePill: {
    backgroundColor: 'rgba(255,195,77,0.12)',
    borderColor: 'rgba(255,195,77,0.32)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  housePillRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
  },
  metric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 132,
    padding: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  pathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
  },
  pathStep: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 132,
    padding: 12,
  },
  relevantRow: {
    backgroundColor: 'rgba(255,195,77,0.08)',
    borderColor: 'rgba(255,195,77,0.28)',
  },
  row: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  significatorNode: {
    backgroundColor: 'rgba(255,195,77,0.07)',
    borderColor: 'rgba(255,195,77,0.22)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
});
