import React, { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../theme/colors';
import type { ChartData } from '../../types/astrology';
import { AppText } from '../AppText';

type KundliChartProps = {
  chart: ChartData;
  onHousePress?: (house: number) => void;
  selectedHouse?: number;
};

export const KundliChart = memo(function KundliChart({
  chart,
  onHousePress,
  selectedHouse,
}: KundliChartProps): React.JSX.Element {
  if (!chart.supported) {
    return (
      <View style={styles.unsupported}>
        <AppText variant="subtitle">Chart not enabled yet</AppText>
        <AppText style={styles.unsupportedReason} tone="secondary">
          {chart.unsupportedReason}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.shell}>
      {Array.from({ length: 12 }, (_, index) => {
        const house = index + 1;
        const planets = chart.housePlacements[house] ?? [];
        const selected = selectedHouse === house;

        return (
          <Pressable
            accessibilityRole="button"
            key={house}
            onPress={() => onHousePress?.(house)}
            style={[styles.house, selected ? styles.selectedHouse : undefined]}
          >
            <AppText tone="secondary" variant="caption">
              H{house}
            </AppText>
            <AppText style={styles.planetList} variant="caption">
              {planets.length
                ? planets.map(getPlanetAbbreviation).join(' ')
                : '-'}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
});

function getPlanetAbbreviation(planet: string): string {
  return (
    {
      Jupiter: 'Ju',
      Ketu: 'Ke',
      Mars: 'Ma',
      Mercury: 'Me',
      Moon: 'Mo',
      Rahu: 'Ra',
      Saturn: 'Sa',
      Sun: 'Su',
      Venus: 'Ve',
    }[planet] ?? planet.slice(0, 2)
  );
}

const styles = StyleSheet.create({
  house: {
    alignItems: 'center',
    aspectRatio: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    padding: 6,
  },
  selectedHouse: {
    borderColor: colors.gradient[1],
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  planetList: {
    marginTop: 4,
  },
  shell: {
    backgroundColor: colors.card,
    borderColor: colors.borderGlow,
    borderRadius: 16,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 10,
  },
  unsupported: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  unsupportedReason: {
    marginTop: 8,
  },
});
