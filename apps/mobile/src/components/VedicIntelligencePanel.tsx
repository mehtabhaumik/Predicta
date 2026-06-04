import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  buildParashariChalitChart,
  composeChartInsight,
  composeKundliKarmaSnapshot,
  composeVedicIntelligenceContract,
} from '@pridicta/astrology';
import type {
  ChartData,
  ChartInsightProfile,
  KundliData,
  KundliKarmaItem,
  KundliKarmaModule,
  KundliKarmaRankedCondition,
  KundliKarmaRemedyPlanItem,
  KundliKarmaSnapshot,
  ReportMemoryDepth,
  SupportedLanguage,
  VedicIntelligenceSection,
} from '@pridicta/types';
import { AppText } from './AppText';
import { GlowCard } from './GlowCard';
import { IntelligenceRhythmCard } from './IntelligenceRhythmCard';

type KundliKarmaMobileHandoff = {
  kundliId?: string;
  predictaSchool: 'PARASHARI';
  reportMode: ReportMemoryDepth;
  selectedKundliKarmaEvidenceSummary?: string;
  selectedKundliKarmaItemId: string;
  selectedKundliKarmaModule: KundliKarmaModule;
  selectedKundliKarmaRuleId: string;
  selectedLanguage: SupportedLanguage;
  selectedSection: string;
  sourceScreen: string;
};

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
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  onDownloadFullReport?: () => void;
}): React.JSX.Element {
  const [showClassicalTables, setShowClassicalTables] = useState(false);
  const [showKundliKarmaModules, setShowKundliKarmaModules] = useState(false);
  const [showKundliKarmaRemedies, setShowKundliKarmaRemedies] = useState(false);
  const [showSoulCharts, setShowSoulCharts] = useState(false);
  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const kundliKarma = composeKundliKarmaSnapshot(kundli);
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

      <IntelligenceRhythmCard embedded delay={195} school="VEDIC" />

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

      <KundliKarmaMobileSurface
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
        onAskPrompt={onAskPrompt}
        onDownloadFullReport={onDownloadFullReport}
        onToggleModules={() => setShowKundliKarmaModules(value => !value)}
        onToggleRemedies={() => setShowKundliKarmaRemedies(value => !value)}
        showModules={showKundliKarmaModules}
        showRemedies={showKundliKarmaRemedies}
        snapshot={kundliKarma}
      />

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

const KUNDLI_KARMA_MODULE_GROUPS: Array<{
  body: string;
  id: 'DOSH' | 'SHRAP' | 'YOG' | 'LAL_KITAB';
  modules: KundliKarmaModule[];
  title: string;
}> = [
  {
    body: 'Pressure indicators stay calm, practical, and never fear-led.',
    id: 'DOSH',
    modules: ['DOSH'],
    title: 'Dosh',
  },
  {
    body: 'Karmic debt signals are shown as indicators, not curse language.',
    id: 'SHRAP',
    modules: ['SHRAP'],
    title: 'Shrap',
  },
  {
    body: 'Supportive and challenging Yogas are kept together for balance.',
    id: 'YOG',
    modules: ['SUPPORTIVE_YOG', 'CHALLENGING_YOG'],
    title: 'Yog',
  },
  {
    body: 'Lal Kitab keeps house-wise observations and safe upay separate.',
    id: 'LAL_KITAB',
    modules: ['LAL_KITAB'],
    title: 'Lal Kitab',
  },
];

function KundliKarmaMobileSurface({
  hasPremiumAccess,
  kundli,
  onAskPrompt,
  onDownloadFullReport,
  onToggleModules,
  onToggleRemedies,
  showModules,
  showRemedies,
  snapshot,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  onDownloadFullReport?: () => void;
  onToggleModules: () => void;
  onToggleRemedies: () => void;
  showModules: boolean;
  showRemedies: boolean;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element {
  const topConditions = snapshot.topThreeActiveConditions;

  return (
    <View
      className="mt-4 gap-3 rounded-3xl border border-[#FFD27A26] bg-[#FFD27A10] p-4"
      testID="kundli-karma-mobile-surface"
    >
      <AppText className="text-[#FFD27A]" variant="caption">
        KUNDLI KARMA
      </AppText>
      <AppText variant="subtitle">Dosh, Shrap, Yog and Lal Kitab without fear</AppText>
      <AppText tone="secondary" variant="caption">
        Predicta ranks deterministic signals only. Open proof when you want it;
        the screen stays calm and the report carries the deeper reading.
      </AppText>

      <View
        className="mt-2 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
        testID="kundli-karma-mobile-snapshot"
      >
        <AppText className="text-[#FFD27A]" variant="caption">
          Kundli Karma Snapshot
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {snapshot.subjectName}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {snapshot.summary}
        </AppText>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <KundliKarmaChip label="Status" value={statusLabel(snapshot.calculationStatus)} />
          <KundliKarmaChip
            label="No AI needed"
            value={snapshot.noAiRequiredFor.includes('show Kundli Karma snapshot') ? 'Yes' : 'Pending'}
          />
        </View>
      </View>

      {!kundli ? (
        <KundliKarmaEmptyState
          body="Create or open a Kundli first. Predicta will not invent Dosh, Shrap, Yog, or Lal Kitab signals without chart evidence."
          title="Kundli needed"
        />
      ) : snapshot.calculationStatus !== 'ready' ? (
        <KundliKarmaEmptyState
          body={
            snapshot.missingData[0] ??
            'Some deterministic evidence is still pending, so Predicta keeps this section conservative.'
          }
          title="Calculation pending"
        />
      ) : topConditions.length === 0 ? (
        <KundliKarmaEmptyState
          body="Predicta did not find major active Kundli Karma alerts in the implemented deterministic checks."
          title="No major Kundli Karma alerts"
        />
      ) : (
        <View className="gap-3" testID="kundli-karma-mobile-top-three">
          {topConditions.map(condition => (
            <KundliKarmaConditionCard
              condition={condition}
              hasPremiumAccess={hasPremiumAccess}
              kundli={kundli}
              key={condition.item.id}
              onAskPrompt={onAskPrompt}
              onDownloadFullReport={onDownloadFullReport}
              remedyPlan={snapshot.remedyPlan}
            />
          ))}
        </View>
      )}

      <KundliKarmaQuickPrompts
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
        onAskPrompt={onAskPrompt}
        snapshot={snapshot}
      />

      <DisclosureButton
        label="Dosh, Shrap, Yog and Lal Kitab"
        onPress={onToggleModules}
        open={showModules}
        subtitle="Open the category stack only when you want more detail"
      />
      {showModules ? (
        <View className="gap-3" testID="kundli-karma-mobile-category-stack">
          {KUNDLI_KARMA_MODULE_GROUPS.map(group => (
            <KundliKarmaModuleCard
              group={group}
              hasPremiumAccess={hasPremiumAccess}
              key={group.id}
              rankedConditions={snapshot.rankedConditions}
              remedyPlan={snapshot.remedyPlan}
            />
          ))}
        </View>
      ) : null}

      <DisclosureButton
        label="Consolidated Remedy Plan"
        onPress={onToggleRemedies}
        open={showRemedies}
        subtitle="One grouped plan so remedies are not duplicated across cards"
      />
      {showRemedies ? (
        <View className="gap-3" testID="kundli-karma-mobile-remedy-plan">
          {snapshot.remedyPlan.slice(0, hasPremiumAccess ? 6 : 3).map(remedy => (
            <KundliKarmaRemedyRow key={remedy.id} remedy={remedy} />
          ))}
          {!hasPremiumAccess ? (
            <AppText className="rounded-2xl border border-[#FFD27A26] bg-[#FFD27A10] p-3 text-[#FFD27A]" variant="caption">
              Premium adds deeper timing, evidence-linked remedies, avoid-lists, and a structured plan without crowding the app screen.
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaConditionCard({
  condition,
  hasPremiumAccess,
  kundli,
  onAskPrompt,
  onDownloadFullReport,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  onDownloadFullReport?: () => void;
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const [showDetails, setShowDetails] = useState(false);
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);

  return (
    <View
      className="gap-3 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
      testID={`kundli-karma-item-${item.id}`}
    >
      <View className="flex-row flex-wrap items-center gap-2">
        <KundliKarmaChip label={`#${condition.rank}`} value={moduleLabel(item.module)} />
        <KundliKarmaChip label="Status" value={statusLabel(item.status)} />
        <KundliKarmaChip label="Strength" value={strengthLabel(item.strength)} />
      </View>
      <AppText variant="subtitle">{item.displayName}</AppText>
      <AppText tone="secondary" variant="caption">
        {item.meaningForUser}
      </AppText>
      <AppText tone="secondary" variant="caption">
        {condition.whyThisRankedFirst}
      </AppText>
      <View className="gap-2">
        {onAskPrompt ? (
          <ActionPill
            label="Ask Predicta why this appears"
            onPress={() =>
              onAskPrompt(
                buildKundliKarmaPrompt(item),
                buildKundliKarmaHandoff(item, {
                  hasPremiumAccess,
                  kundli,
                  sourceScreen: 'Vedic Kundli Karma Snapshot',
                }),
              )
            }
            primary
          />
        ) : null}
        {onDownloadFullReport ? (
          <ActionPill label="Download detailed report" onPress={onDownloadFullReport} />
        ) : null}
        <ActionPill
          label={showDetails ? 'Hide evidence and remedies' : 'Open evidence and remedies'}
          onPress={() => setShowDetails(value => !value)}
        />
      </View>
      {showDetails ? (
        <View className="gap-3">
          <AppText tone="secondary" variant="caption">
            {item.whyPresent}
          </AppText>
          <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 4 : 2} />
          {remedies.slice(0, hasPremiumAccess ? 3 : 1).map(remedy => (
            <KundliKarmaRemedyRow key={remedy.id} remedy={remedy} />
          ))}
          <AppText className="rounded-2xl border border-[#FFD27A26] bg-[#FFD27A10] p-3 text-[#FFD27A]" variant="caption">
            {hasPremiumAccess
              ? item.activation.summary
              : 'Premium opens fuller evidence, activation timing, and detailed remedies. Free still keeps the main meaning and one safe action visible.'}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaQuickPrompts({
  hasPremiumAccess,
  kundli,
  onAskPrompt,
  snapshot,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element | null {
  if (!onAskPrompt || !kundli) {
    return null;
  }
  const prompts = [
    {
      condition: snapshot.strongestDosh,
      fallback: 'Explain my strongest Dosh from local Kundli Karma memory. Give the meaning first, then evidence, activation, reductions, and safe remedy.',
      label: 'Explain my strongest Dosh',
      sourceScreen: 'Vedic Kundli Karma Quick Dosh',
    },
    {
      condition: snapshot.strongestShrapOrRin,
      fallback: 'Explain my Shrap indicator from local Kundli Karma memory. Treat it as a karmic pressure indicator, not a curse.',
      label: 'Explain my Shrap indicator',
      sourceScreen: 'Vedic Kundli Karma Quick Shrap',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'SUPPORTIVE_YOG'),
      fallback: 'Explain my strongest supportive Yog from local Kundli Karma memory. Give the life support first, then evidence.',
      label: 'Strongest supportive Yog',
      sourceScreen: 'Vedic Kundli Karma Quick Supportive Yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'CHALLENGING_YOG'),
      fallback: 'Explain my strongest challenging Yog from local Kundli Karma memory. Give the practical guidance first, then evidence.',
      label: 'Strongest challenging Yog',
      sourceScreen: 'Vedic Kundli Karma Quick Challenging Yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'LAL_KITAB'),
      fallback: 'Explain my Lal Kitab remedy from local Kundli Karma memory. Give the safe upay first, then the house-wise evidence.',
      label: 'My Lal Kitab remedy',
      sourceScreen: 'Vedic Kundli Karma Quick Lal Kitab',
    },
  ];

  return (
    <View
      className="gap-2 rounded-3xl border border-[#4DAFFF33] bg-[#4DAFFF12] p-4"
      testID="kundli-karma-mobile-quick-prompts"
    >
      <AppText className="text-[#4DAFFF]" variant="caption">
        ZERO-CREDIT QUICK PROMPTS
      </AppText>
      {prompts.map(prompt => {
        const context = prompt.condition
          ? buildKundliKarmaHandoff(prompt.condition.item, {
              hasPremiumAccess,
              kundli,
              sourceScreen: prompt.sourceScreen,
            })
          : undefined;
        return (
          <ActionPill
            key={prompt.sourceScreen}
            label={prompt.label}
            onPress={() => onAskPrompt(prompt.condition ? buildKundliKarmaPrompt(prompt.condition.item) : prompt.fallback, context)}
          />
        );
      })}
    </View>
  );
}

function KundliKarmaModuleCard({
  group,
  hasPremiumAccess,
  rankedConditions,
  remedyPlan,
}: {
  group: (typeof KUNDLI_KARMA_MODULE_GROUPS)[number];
  hasPremiumAccess: boolean;
  rankedConditions: KundliKarmaRankedCondition[];
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const groupConditions = rankedConditions.filter(condition =>
    group.modules.includes(condition.item.module),
  );
  const visibleConditions = groupConditions.slice(0, hasPremiumAccess ? 4 : 2);

  return (
    <View className="rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
      <Pressable accessibilityRole="button" onPress={() => setOpen(value => !value)}>
        <AppText className="text-[#FFD27A]" variant="caption">
          {visibleConditions.length} ACTIVE · {open ? 'HIDE' : 'OPEN'}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {group.title}
        </AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {group.body}
        </AppText>
      </Pressable>
      {open ? (
        <View className="mt-3 gap-3">
          {visibleConditions.length ? (
            visibleConditions.map(condition => (
              <KundliKarmaMiniRow
                condition={condition}
                hasPremiumAccess={hasPremiumAccess}
                key={condition.item.id}
                remedyPlan={remedyPlan}
              />
            ))
          ) : (
            <KundliKarmaEmptyState
              body={`No major ${group.title} signal is active in the current deterministic snapshot.`}
              title={`No major ${group.title} alert`}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaMiniRow({
  condition,
  hasPremiumAccess,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  hasPremiumAccess: boolean;
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);

  return (
    <View className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3">
      <AppText className="text-[#FFD27A]" variant="caption">
        {moduleLabel(item.module)} · {statusLabel(item.status)}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {item.displayName}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {item.meaningForUser}
      </AppText>
      <Pressable
        accessibilityRole="button"
        className="mt-3 rounded-full border border-[#FFFFFF18] bg-[#FFFFFF0A] px-4 py-3"
        onPress={() => setOpen(value => !value)}
      >
        <AppText variant="caption">{open ? 'Hide proof' : 'Open proof'}</AppText>
      </Pressable>
      {open ? (
        <View className="mt-3 gap-3">
          <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 3 : 1} />
          {remedies[0] ? <KundliKarmaRemedyRow remedy={remedies[0]} /> : null}
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaEvidenceList({
  item,
  limit,
}: {
  item: KundliKarmaItem;
  limit: number;
}): React.JSX.Element {
  return (
    <View className="gap-2">
      {item.evidence.slice(0, limit).map(evidence => (
        <View
          className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3"
          key={evidence.id}
        >
          <AppText className="text-[#FFD27A]" variant="caption">
            {evidence.kind.replaceAll('_', ' ')}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {evidence.description}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function KundliKarmaRemedyRow({
  remedy,
}: {
  remedy: KundliKarmaRemedyPlanItem;
}): React.JSX.Element {
  return (
    <View className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3">
      <AppText className="text-[#FFD27A]" variant="caption">
        {remedy.category.replaceAll('_', ' ')}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {remedy.title}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {remedy.description}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {remedy.safetyNote}
      </AppText>
    </View>
  );
}

function KundliKarmaEmptyState({
  body,
  title,
}: {
  body: string;
  title: string;
}): React.JSX.Element {
  return (
    <View className="rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4">
      <AppText variant="subtitle">{title}</AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {body}
      </AppText>
    </View>
  );
}

function KundliKarmaChip({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <View className="max-w-full rounded-full border border-[#FFFFFF18] bg-[#FFFFFF0A] px-3 py-2">
      <AppText className="text-[#FFD27A]" variant="caption">
        {label}
      </AppText>
      <AppText variant="caption">{value}</AppText>
    </View>
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

function buildKundliKarmaPrompt(item: KundliKarmaItem): string {
  return (
    `Explain why ${item.displayName} appears in my Kundli Karma snapshot. ` +
    'Answer the meaning and guidance first, then show why it appears, visible evidence, activation timing, reductions, and safe remedies. ' +
    'Keep it Vedic, plain-language, non-fearful, and do not spend AI if local Kundli Karma memory can answer it.'
  );
}

function buildKundliKarmaHandoff(
  item: KundliKarmaItem,
  options: {
    hasPremiumAccess: boolean;
    kundli?: KundliData;
    sourceScreen: string;
  },
): KundliKarmaMobileHandoff {
  return {
    kundliId: options.kundli?.id,
    predictaSchool: 'PARASHARI',
    reportMode: options.hasPremiumAccess ? 'PREMIUM' : 'FREE',
    selectedKundliKarmaEvidenceSummary: buildKundliKarmaEvidenceSummary(item),
    selectedKundliKarmaItemId: item.id,
    selectedKundliKarmaModule: item.module,
    selectedKundliKarmaRuleId: item.ruleId,
    selectedLanguage: 'en',
    selectedSection: `Kundli Karma: ${item.displayName}`,
    sourceScreen: options.sourceScreen,
  };
}

function buildKundliKarmaEvidenceSummary(item: KundliKarmaItem): string {
  return item.evidence
    .slice(0, 3)
    .map(evidence => evidence.description)
    .join(' | ');
}

function remediesForItem(
  remedyPlan: KundliKarmaRemedyPlanItem[],
  item: KundliKarmaItem,
): KundliKarmaRemedyPlanItem[] {
  const direct = remedyPlan.filter(remedy => remedy.sourceItemIds.includes(item.id));
  return direct.length ? direct : remedyPlan;
}

function moduleLabel(module: KundliKarmaModule): string {
  if (module === 'DOSH') return 'Dosh';
  if (module === 'SHRAP') return 'Shrap';
  if (module === 'LAL_KITAB') return 'Lal Kitab';
  return module === 'SUPPORTIVE_YOG' ? 'Supportive Yog' : 'Challenging Yog';
}

function statusLabel(status: KundliKarmaItem['status'] | KundliKarmaSnapshot['calculationStatus']): string {
  return titleizeToken(status);
}

function strengthLabel(strength: KundliKarmaItem['strength']): string {
  return titleizeToken(strength);
}

function titleizeToken(value: string): string {
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
