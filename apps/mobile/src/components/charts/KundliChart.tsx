import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  buildNorthIndianChartCells,
  findHouseCell,
  findPlanetCell,
  getPlanetAbbreviation,
  type ChartCell,
} from '@pridicta/astrology';

import { colors } from '../../theme/colors';
import type { ChartData } from '../../types/astrology';
import { AppText } from '../AppText';

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

  const cells = buildNorthIndianChartCells(chart);
  const activeCell =
    findPlanetCell(cells, selectedPlanet) ??
    findHouseCell(cells, selectedHouse) ??
    cells.find(cell => cell.house === 1) ??
    cells[0];
  const activePlanets = selectedPlanet
    ? [selectedPlanet]
    : activeCell?.planets ?? [];

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

      <View style={styles.board}>
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
              cell={cell}
              key={cell.key}
              onFocusChange={onFocusChange}
              selected={
                selectedHouse === cell.house ||
                Boolean(selectedPlanet && cell.planets.includes(selectedPlanet))
              }
            />
          );
        })}
      </View>

      {activeCell ? (
        <View style={styles.drilldown}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <AppText tone="secondary" variant="caption">
                SELECTED HOUSE
              </AppText>
              <AppText className="mt-1" variant="subtitle">
                House {activeCell.house} • {activeCell.sign}
              </AppText>
            </View>
            <AppText tone="secondary" variant="caption">
              {activeCell.planets.length} planet
              {activeCell.planets.length === 1 ? '' : 's'}
            </AppText>
          </View>
          <View style={styles.planetRow}>
            {(activeCell.planets.length ? activeCell.planets : ['No planets']).map(
              planet => {
                const empty = planet === 'No planets';

                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={empty}
                    key={planet}
                    onPress={() =>
                      onFocusChange?.({
                        house: activeCell.house,
                        planet,
                      })
                    }
                    style={[
                      styles.planetChip,
                      selectedPlanet === planet ? styles.selectedPlanetChip : undefined,
                      empty ? styles.emptyPlanetChip : undefined,
                    ]}
                  >
                    <AppText tone={empty ? 'secondary' : 'primary'} variant="caption">
                      {empty ? planet : `${getPlanetAbbreviation(planet)} ${planet}`}
                    </AppText>
                  </Pressable>
                );
              },
            )}
          </View>
          {activePlanets.length ? (
            <AppText className="mt-3" tone="secondary" variant="caption">
              Ask Pridicta from this selection to carry house and planet context
              into the reading.
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});

function ChartHouseCell({
  cell,
  onFocusChange,
  selected,
}: {
  cell: ChartCell;
  onFocusChange?: (focus: KundliChartFocus) => void;
  selected: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onFocusChange?.({ house: cell.house })}
      style={[styles.house, selected ? styles.selectedHouse : undefined]}
    >
      <View className="flex-row items-center justify-between">
        <AppText tone="secondary" variant="caption">
          H{cell.house}
        </AppText>
        <AppText tone="secondary" variant="caption">
          {cell.signShort}
        </AppText>
      </View>
      <View style={styles.cellPlanetRow}>
        {cell.planets.length ? (
          cell.planets.map(planet => (
            <Pressable
              accessibilityRole="button"
              key={planet}
              onPress={() =>
                onFocusChange?.({
                  house: cell.house,
                  planet,
                })
              }
              style={styles.cellPlanetPill}
            >
              <AppText variant="caption">{getPlanetAbbreviation(planet)}</AppText>
            </Pressable>
          ))
        ) : (
          <AppText tone="secondary" variant="caption">
            -
          </AppText>
        )}
      </View>
    </Pressable>
  );
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
  house: {
    aspectRatio: 1,
    backgroundColor: colors.cardElevated,
    borderColor: colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 7,
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
