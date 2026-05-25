import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  buildParashariChalitChart,
  composeChartInsight,
  composeVedicIntelligenceContract,
} from '@pridicta/astrology';
import type {
  ChartData,
  ChartInsightProfile,
  KundliData,
  VedicIntelligenceSection,
} from '@pridicta/types';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';

type FocusChartCard = {
  chart?: ChartData;
  id: string;
  profile?: ChartInsightProfile;
  title: string;
};

export function VedicIntelligencePanel({
  hasPremiumAccess,
  kundli,
  onAskPrompt,
  onDownloadFullReport,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  onAskPrompt?: (prompt: string) => void;
  onDownloadFullReport?: () => void;
}): React.JSX.Element {
  const [showClassicalTables, setShowClassicalTables] = useState(false);
  const [showSoulCharts, setShowSoulCharts] = useState(false);
  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const focusCharts: FocusChartCard[] = [
    { chart: kundli?.charts.D1, id: 'D1', title: 'D1 / Rashi' },
    {
      chart: intelligence.moonChart.chart,
      id: 'MOON',
      profile: 'moon',
      title: 'Moon / Chandra Lagna',
    },
    { chart: kundli?.charts.D9, id: 'D9', title: 'D9 / Navamsa' },
    { chart: kundli?.charts.D10, id: 'D10', title: 'D10 / Dashamsa' },
    {
      chart: kundli ? buildParashariChalitChart(kundli) : undefined,
      id: 'CHALIT',
      profile: 'chalit',
      title: 'Chalit',
    },
  ];
  const birthSnapshotSections = [
    intelligence.panchang,
    intelligence.avakhadaChakra,
    intelligence.ghatakFavorable,
  ];
  const classicalSections = [
    intelligence.houseWisePlacements,
    intelligence.friendshipTable,
    intelligence.beneficMalefic,
    intelligence.chalitTable,
    intelligence.samsa,
    intelligence.ashtakavarga,
    intelligence.prastarashtakavarga,
  ];

  return (
    <GlowCard className="mt-5" delay={180}>
      <AppText tone="secondary" variant="caption">
        PREDICTA VEDIC
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        Clean Vedic snapshot, not a report wall
      </AppText>
      <AppText className="mt-2" tone="secondary">
        See the useful cards first. Open proof tables only when needed. The PDF
        remains the deep reading surface.
      </AppText>

      <View className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
        <AppText className="text-[#FFD27A]" variant="caption">
          BIRTH SNAPSHOT
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {intelligence.snapshot.lagna} Lagna · {intelligence.snapshot.moonSign} Moon
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {intelligence.snapshot.currentDasha}
        </AppText>
        <View className="mt-3 gap-2">
          {birthSnapshotSections.map(section => (
            <MiniSectionCard key={section.id} section={section} />
          ))}
        </View>
      </View>

      <View className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
        <AppText className="text-[#FFD27A]" variant="caption">
          CHARTS
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          Focus charts first, full library deliberately
        </AppText>
        <View className="mt-3 gap-2">
          {focusCharts.map(chart => (
            <View
              className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3"
              key={chart.id}
            >
              <AppText className="text-[#4DAFFF]" variant="caption">
                {chart.id}
              </AppText>
              <AppText className="mt-1" variant="caption">
                {chart.title}
              </AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {chart.chart?.supported
                  ? 'Ready for plain-language prediction.'
                  : 'Pending evidence; Predicta will not invent this chart.'}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
        <AppText className="text-[#FFD27A]" variant="caption">
          WHAT THIS MEANS
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          Short predictive cards
        </AppText>
        <View className="mt-3 gap-3">
          {focusCharts.map(chart => (
            <ChartMeaningCard
              chart={chart}
              hasPremiumAccess={hasPremiumAccess}
              key={chart.id}
              kundli={kundli}
            />
          ))}
        </View>
      </View>

      <View className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
        <AppText className="text-[#FFD27A]" variant="caption">
          CURRENT TIMING
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          Mahadasha Phala
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {intelligence.mahadashaPhala.freeInsight}
        </AppText>
        {hasPremiumAccess ? (
          <AppText className="mt-2" tone="secondary" variant="caption">
            Premium: {intelligence.mahadashaPhala.premiumAnalysis}
          </AppText>
        ) : null}
      </View>

      <DisclosureButton
        label="Classical Tables"
        onPress={() => setShowClassicalTables(value => !value)}
        open={showClassicalTables}
        subtitle="Friendship, Chalit, Ashtakavarga, Prastara, Samsa and evidence tables"
      />
      {showClassicalTables ? (
        <View className="mt-3 gap-3">
          {classicalSections.map(section => (
            <SectionCard
              hasPremiumAccess={hasPremiumAccess}
              key={section.id}
              section={section}
            />
          ))}
        </View>
      ) : null}

      <DisclosureButton
        label="Swamsa and Karakamsha"
        onPress={() => setShowSoulCharts(value => !value)}
        open={showSoulCharts}
        subtitle="Soul chart insights stay available without crowding the first screen"
      />
      {showSoulCharts ? (
        <View className="mt-3 gap-3">
          <SectionCard hasPremiumAccess={hasPremiumAccess} section={intelligence.swamsa} />
          <SectionCard hasPremiumAccess={hasPremiumAccess} section={intelligence.karakamsha} />
        </View>
      ) : null}

      <View className="mt-5 gap-3 rounded-3xl border border-[#4DAFFF33] bg-[#4DAFFF12] p-4">
        <AppText className="text-[#4DAFFF]" variant="caption">
          ASK PREDICTA
        </AppText>
        <AppText variant="subtitle">Ask from this exact section</AppText>
        <AppText tone="secondary" variant="caption">
          Keep the page clean, then ask Predicta for the specific card you want
          explained.
        </AppText>
        <View className="mt-2 gap-2">
          {onAskPrompt ? (
            <ActionPill
              label="Ask about Mahadasha Phala"
              onPress={() =>
                onAskPrompt('Explain my Mahadasha Phala from the Vedic snapshot screen.')
              }
            />
          ) : null}
          {onDownloadFullReport ? (
            <ActionPill
              label="Download Full Report"
              onPress={onDownloadFullReport}
              primary
            />
          ) : null}
        </View>
      </View>
    </GlowCard>
  );
}

function MiniSectionCard({
  section,
}: {
  section: VedicIntelligenceSection;
}): React.JSX.Element {
  return (
    <View className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3">
      <AppText className="text-[#FFD27A]" variant="caption">
        {section.title}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {section.freeInsight}
      </AppText>
    </View>
  );
}

function SectionCard({
  hasPremiumAccess,
  section,
}: {
  hasPremiumAccess: boolean;
  section: VedicIntelligenceSection;
}): React.JSX.Element {
  return (
    <View className="rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
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
  );
}

function ChartMeaningCard({
  chart,
  hasPremiumAccess,
  kundli,
}: {
  chart: FocusChartCard;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
}): React.JSX.Element {
  const insight = chart.chart?.supported
    ? composeChartInsight({
        chart: chart.chart,
        hasPremiumAccess,
        kundli,
        profile: chart.profile,
      })
    : undefined;

  return (
    <View className="rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
      <AppText className="text-[#4DAFFF]" variant="caption">
        {chart.id}
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        {chart.title}
      </AppText>
      <AppText className="mt-2" tone="secondary" variant="caption">
        {insight
          ? insight.whatItSays
          : 'Pending evidence; Predicta keeps this honest instead of inventing a prediction.'}
      </AppText>
      {insight ? (
        <AppText className="mt-2" tone="secondary" variant="caption">
          {insight.currentGuidance}
        </AppText>
      ) : null}
      {hasPremiumAccess && insight?.premiumInsight ? (
        <AppText className="mt-2 text-[#FFD27A]" variant="caption">
          {insight.premiumInsight.headline}
        </AppText>
      ) : null}
    </View>
  );
}

function DisclosureButton({
  label,
  onPress,
  open,
  subtitle,
}: {
  label: string;
  onPress: () => void;
  open: boolean;
  subtitle: string;
}): React.JSX.Element {
  return (
    <Pressable
      className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
      onPress={onPress}
    >
      <AppText className="text-[#FFD27A]" variant="caption">
        {open ? 'HIDE' : 'OPEN'}
      </AppText>
      <AppText className="mt-1" variant="subtitle">
        {label}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {subtitle}
      </AppText>
    </Pressable>
  );
}

function ActionPill({
  label,
  onPress,
  primary,
}: {
  label: string;
  onPress: () => void;
  primary?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      className={`rounded-full border px-4 py-3 ${
        primary
          ? 'border-[#4DAFFF] bg-[#4DAFFF33]'
          : 'border-[#FFFFFF18] bg-[#FFFFFF0A]'
      }`}
      onPress={onPress}
    >
      <AppText className={primary ? 'text-[#4DAFFF]' : ''} variant="caption">
        {label}
      </AppText>
    </Pressable>
  );
}
