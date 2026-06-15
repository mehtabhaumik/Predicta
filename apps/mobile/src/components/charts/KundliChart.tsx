import { getNativeCopy } from '@pridicta/config';
import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  buildNorthIndianChartCells,
  findHouseCell,
  findPlanetCell,
  getLocalizedPlanetAbbreviation,
  getLocalizedPlanetName,
  getSpecialPointMeaning,
  isSpecialPoint,
  type ChartCell,
} from '@pridicta/astrology';
import { SUPPORTED_LANGUAGE_OPTIONS } from '@pridicta/config/language';

import { saveChartLanguagePreference } from '../../services/preferences/languagePreferenceStorage';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import type { ChartData, SupportedLanguage } from '../../types/astrology';
import { AppText } from '../AppText';
import { FadeInView } from '../FadeInView';

export type KundliChartFocus = {
  house?: number;
  planet?: string;
};

type KundliChartProps = {
  chart: ChartData;
  onFocusChange?: (focus: KundliChartFocus) => void;
  selectedHouse?: number;
  selectedPlanet?: string;
};

export const KundliChart = memo(function KundliChart({
  chart,
  selectedHouse,
  selectedPlanet,
  onFocusChange,
}: KundliChartProps): React.JSX.Element {
  const appLanguage = useAppStore(
    state => state.languagePreference.appLanguage ?? state.languagePreference.language,
  );
  const chartLanguage = useAppStore(
    state => state.languagePreference.chartLanguage ?? appLanguage ?? 'en',
  );
  const setChartLanguagePreference = useAppStore(
    state => state.setChartLanguagePreference,
  );

  if (!chart.supported) {
    return (
      <View style={styles.unsupported}>
        <AppText variant="subtitle">Chart not enabled yet</AppText>
        <AppText className="mt-2" tone="secondary">
          {chart.unsupportedReason}
        </AppText>
      </View>
    );
  }

  const cells = buildNorthIndianChartCells(chart, chartLanguage);
  const activeCell =
    findPlanetCell(cells, selectedPlanet) ??
    findHouseCell(cells, selectedHouse) ??
    cells.find(cell => cell.house === 1) ??
    cells[0];
  const activePlanetPositions = selectedPlanet
    ? activeCell?.planetPositions.filter(planet => planet.name === selectedPlanet) ?? []
    : activeCell?.planetPositions ?? [];
  const activePlanets = activePlanetPositions.map(planet => planet.name);
  const activeHouseMeaning = getHouseMeaning(activeCell?.house);
  const chartRole = getChartRole(chart.chartType);
  const activeSpecialPoints = activeCell?.planetPositions.filter(isSpecialPoint) ?? [];

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <View>
          <AppText tone="secondary" variant="caption">
            NORTH INDIAN CHART
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {chart.name}
          </AppText>
        </View>
        <View style={styles.ascendantBadge}>
          <AppText variant="caption">Tap houses</AppText>
        </View>
      </View>
      <View style={styles.languageRow}>
        <AppText tone="secondary" variant="caption">
          {getChartLanguageTitle(chartLanguage)}
        </AppText>
        <View style={styles.languageOptions}>
          {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
            <Pressable
              accessibilityRole="button"
              key={option.code}
              onPress={() => {
                setChartLanguagePreference(option.code);
                void saveChartLanguagePreference(option.code);
              }}
              style={[
                styles.languageOption,
                option.code === chartLanguage ? styles.activeLanguageOption : undefined,
              ]}
            >
              <AppText variant="caption">
                {chartLanguage === 'en' ? option.englishName : option.nativeName}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <FadeInView
        key={`board-${chart.chartType}`}
        delay={80}
        duration={420}
        style={styles.board}
      >
        {Array.from({ length: 25 }, (_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const cell = cells.find(item => item.row === row && item.col === col);

          if (!cell) {
            return (
              <View key={`center-${row}-${col}`} style={styles.centerCell}>
                {row === 2 && col === 2 ? (
                  <>
                    <AppText tone="secondary" variant="caption">
                      {chart.chartType}
                    </AppText>
                    <AppText className="mt-1 text-center" variant="caption">
                      North style
                    </AppText>
                  </>
                ) : null}
              </View>
            );
          }

          return (
            <ChartHouseCell
              chartLanguage={chartLanguage}
              cell={cell}
              delay={80 + (cell.house ?? 0) * 18}
              key={cell.key}
              onFocusChange={onFocusChange}
              selected={
                selectedHouse === cell.house ||
                Boolean(selectedPlanet && cell.planets.includes(selectedPlanet))
              }
            />
          );
        })}
      </FadeInView>

      {activeCell ? (
        <FadeInView
          delay={80}
          duration={360}
          key={`${chart.chartType}-${activeCell.house}-${selectedPlanet ?? 'house'}`}
          style={styles.drilldown}
        >
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <AppText tone="secondary" variant="caption">
                SELECTED HOUSE
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                House {activeCell.house} • {activeCell.displaySign}
              </AppText>
            </View>
            <AppText tone="secondary" variant="caption">
              {activeCell.planets.length} planet
              {activeCell.planets.length === 1 ? '' : 's'}
            </AppText>
          </View>
          <View style={styles.focusGrid}>
            <View style={styles.focusCard}>
              <AppText tone="secondary" variant="caption">
                Life area
              </AppText>
              <AppText className="mt-1" variant="caption">
                {activeHouseMeaning}
              </AppText>
            </View>
            <View style={styles.focusCard}>
              <AppText tone="secondary" variant="caption">
                Chart role
              </AppText>
              <AppText className="mt-1" variant="caption">
                {chartRole}
              </AppText>
            </View>
            {activeSpecialPoints.length ? (
              <View style={styles.focusCard}>
                <AppText tone="secondary" variant="caption">
                  Subtle points
                </AppText>
                <AppText className="mt-1" variant="caption">
                  {activeSpecialPoints
                    .map(point => `${point.name}: ${getSpecialPointMeaning(point)}`)
                    .join('; ')}
                </AppText>
              </View>
            ) : null}
          </View>
          <View style={styles.planetRow}>
            {activePlanetPositions.length ? (
              activePlanetPositions.map(planet => (
                <Pressable
                  accessibilityRole="button"
                  key={`${planet.name}-${planet.degree}`}
                  onPress={() =>
                    onFocusChange?.({
                      house: activeCell.house,
                      planet: planet.name,
                    })
                  }
                  style={[
                    styles.planetChip,
                    selectedPlanet === planet.name ? styles.selectedPlanetChip : undefined,
                  ]}
                >
                  <AppText variant="caption">
                    {formatPlanetDisplay(planet.name, planet.degree, chartLanguage)}
                  </AppText>
                </Pressable>
              ))
            ) : (
              <View style={[styles.planetChip, styles.emptyPlanetChip]}>
                <AppText tone="secondary" variant="caption">
                  No planets
                </AppText>
              </View>
            )}
          </View>
          {activePlanets.length ? (
            <AppText className="mt-3" tone="secondary" variant="caption">
              Ask Predicta from this selection to carry house and planet context
              into the reading.
            </AppText>
          ) : null}
        </FadeInView>
      ) : null}
    </View>
  );
});

function ChartHouseCell({
  chartLanguage,
  cell,
  delay,
  onFocusChange,
  selected,
}: {
  chartLanguage: SupportedLanguage;
  cell: ChartCell;
  delay: number;
  onFocusChange?: (focus: KundliChartFocus) => void;
  selected: boolean;
}): React.JSX.Element {
  return (
    <FadeInView delay={delay} duration={320} style={styles.houseSlot}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onFocusChange?.({ house: cell.house })}
        style={[styles.house, selected ? styles.selectedHouse : undefined]}
      >
        <View style={styles.cellHeader}>
          <AppText numberOfLines={1} tone="secondary" variant="caption">
            H{cell.house}
          </AppText>
          <AppText numberOfLines={1} tone="secondary" variant="caption">
            {cell.displaySignShort}
          </AppText>
        </View>
        <View style={styles.cellPlanetRow}>
          {cell.planetPositions.length ? (
            cell.planetPositions.map(planet => (
              <Pressable
                accessibilityRole="button"
                key={`${planet.name}-${planet.degree}`}
                onPress={() =>
                  onFocusChange?.({
                    house: cell.house,
                    planet: planet.name,
                  })
                }
                style={styles.cellPlanetPill}
              >
                <AppText numberOfLines={1} variant="caption">
                  {formatPlanetChip(planet.name, planet.degree, chartLanguage)}
                </AppText>
              </Pressable>
            ))
          ) : (
            <AppText tone="secondary" variant="caption">
              -
            </AppText>
          )}
        </View>
      </Pressable>
    </FadeInView>
  );
}

function getHouseMeaning(house?: number): string {
  const meanings: Record<number, string> = {
    1: 'self, body, identity',
    2: 'money, speech, family',
    3: 'effort, courage, siblings',
    4: 'home, mother, emotions',
    5: 'children, learning, merit',
    6: 'work pressure, discipline',
    7: 'marriage, partners, contracts',
    8: 'change, secrets, transformation',
    9: 'fortune, dharma, teachers',
    10: 'career, status, duty',
    11: 'gains, network, ambitions',
    12: 'sleep, expense, release',
  };

  return house ? meanings[house] ?? 'selected life area' : 'selected life area';
}

function getDisplayPlanetName(
  planet: string,
  language: SupportedLanguage,
): string {
  return getLocalizedPlanetName(planet, language);
}

function formatPlanetDisplay(
  planet: string,
  degree: number,
  language: SupportedLanguage,
): string {
  return `${getLocalizedPlanetAbbreviation(planet, language)} ${formatPlanetDegree(degree)} ${getDisplayPlanetName(planet, language)}`;
}

function formatPlanetChip(
  planet: string,
  degree: number,
  language: SupportedLanguage,
): string {
  return `${getLocalizedPlanetAbbreviation(planet, language)} ${formatPlanetDegree(degree)}`;
}

function formatPlanetDegree(degree: number): string {
  return `${degree.toFixed(1)}°`;
}

function getChartLanguageTitle(language: SupportedLanguage): string {
  return (
    {
      en: 'Chart language',
      gu: getNativeCopy("native.apps.mobile.src.components.charts.KundliChart.tsx.61f1e652e0"),
      hi: getNativeCopy("native.apps.mobile.src.components.charts.KundliChart.tsx.099ec5792c"),
    }[language] ?? 'Chart language'
  );
}

function getChartRole(chartType: ChartData['chartType']): string {
  if (chartType === 'D1') {
    return 'main life chart';
  }
  if (chartType === 'D9') {
    return 'marriage and maturity lens';
  }
  if (chartType === 'D10') {
    return 'career confirmation lens';
  }
  if (chartType === 'D2') {
    return 'wealth handling lens';
  }

  return 'supporting divisional lens';
}

const styles = StyleSheet.create({
  ascendantBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  board: {
    aspectRatio: 1,
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderRadius: 10,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  cellPlanetPill: {
    backgroundColor: 'rgba(77, 175, 255, 0.16)',
    borderColor: 'rgba(77, 175, 255, 0.32)',
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: '100%',
    minWidth: 28,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  cellPlanetRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 6,
    maxHeight: 58,
    overflow: 'hidden',
  },
  cellHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  centerCell: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#0F0F16',
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
    padding: 4,
    width: '20%',
  },
  drilldown: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 14,
    padding: 14,
  },
  emptyPlanetChip: {
    opacity: 0.72,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageOption: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  languageRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  focusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.045)',
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: 130,
    padding: 10,
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  house: {
    backgroundColor: colors.cardElevated,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    height: '100%',
    overflow: 'hidden',
    padding: 7,
    width: '100%',
  },
  houseSlot: {
    aspectRatio: 1,
    width: '20%',
  },
  planetChip: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  planetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  selectedHouse: {
    backgroundColor: 'rgba(77, 175, 255, 0.12)',
    borderColor: colors.gradient[1],
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  activeLanguageOption: {
    backgroundColor: 'rgba(77, 175, 255, 0.16)',
    borderColor: colors.gradient[1],
  },
  selectedPlanetChip: {
    borderColor: colors.gradient[1],
  },
  unsupported: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    padding: 18,
  },
  wrapper: {
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
});
