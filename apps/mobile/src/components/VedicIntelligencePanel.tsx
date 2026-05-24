import React from 'react';
import { View } from 'react-native';
import { composeVedicIntelligenceContract } from '@pridicta/astrology';
import type { KundliData } from '../types/astrology';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';

export function VedicIntelligencePanel({
  hasPremiumAccess,
  kundli,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
}): React.JSX.Element {
  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const sections = [
    intelligence.moonChart,
    intelligence.houseWisePlacements,
    intelligence.friendshipTable,
    intelligence.beneficMalefic,
    intelligence.chalitTable,
    intelligence.panchang,
    intelligence.ashtakavarga,
    intelligence.mahadashaPhala,
    intelligence.samsa,
    intelligence.ghatakFavorable,
    intelligence.karakamsha,
    intelligence.prastarashtakavarga,
    intelligence.avakhadaChakra,
  ];

  return (
    <GlowCard className="mt-5" delay={180}>
      <AppText tone="secondary" variant="caption">
        VEDIC INTELLIGENCE
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        Shared Vedic intelligence
      </AppText>
      <AppText className="mt-2" tone="secondary">
        D1 comes first, Moon/Chandra Lagna second, D9 third, then the remaining
        vargas. Reports and PDF consume this same contract.
      </AppText>

      <View className="mt-4 gap-2">
        {intelligence.chartOrder.slice(0, 4).map(item => (
          <AppText key={item.id} tone="secondary" variant="caption">
            {item.id}: {item.title}
          </AppText>
        ))}
      </View>

      <View className="mt-5 gap-3">
        {sections.map(section => (
          <View
            className="rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
            key={section.id}
          >
            <AppText className="text-[#FFD27A]" variant="caption">
              {section.status === 'ready' ? 'READY' : 'PENDING'}
            </AppText>
            <AppText className="mt-1" variant="subtitle">
              {section.title}
            </AppText>
            <AppText className="mt-2" tone="secondary" variant="caption">
              {section.freeInsight}
            </AppText>
            {hasPremiumAccess ? (
              <AppText className="mt-2" tone="secondary" variant="caption">
                Premium: {section.premiumAnalysis}
              </AppText>
            ) : null}
            {section.limitations[0] ? (
              <AppText className="mt-2 text-[#FFD27A]" variant="caption">
                Limit: {section.limitations[0]}
              </AppText>
            ) : null}
          </View>
        ))}
      </View>
    </GlowCard>
  );
}
