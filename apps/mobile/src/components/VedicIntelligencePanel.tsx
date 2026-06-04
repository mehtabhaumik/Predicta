import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { getKundliKarmaCopy, type KundliKarmaCopy } from '@pridicta/config';
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
  language = 'en',
  onAskPrompt,
  onDownloadFullReport,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language?: SupportedLanguage;
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
        language={language}
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

type KundliKarmaMobileModuleGroup = {
  body: string;
  id: 'DOSH' | 'SHRAP' | 'YOG' | 'LAL_KITAB';
  modules: KundliKarmaModule[];
  title: string;
};

function getKundliKarmaModuleGroups(copy: KundliKarmaCopy): KundliKarmaMobileModuleGroup[] {
  return [
    {
      body: copy.groupDoshBody,
      id: 'DOSH',
      modules: ['DOSH'],
      title: copy.groupDoshTitle,
    },
    {
      body: copy.groupShrapBody,
      id: 'SHRAP',
      modules: ['SHRAP'],
      title: copy.groupShrapTitle,
    },
    {
      body: copy.groupYogBody,
      id: 'YOG',
      modules: ['SUPPORTIVE_YOG', 'CHALLENGING_YOG'],
      title: copy.groupYogTitle,
    },
    {
      body: copy.groupLalKitabBody,
      id: 'LAL_KITAB',
      modules: ['LAL_KITAB'],
      title: copy.groupLalKitabTitle,
    },
  ];
}

function KundliKarmaMobileSurface({
  hasPremiumAccess,
  kundli,
  language,
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
  language: SupportedLanguage;
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  onDownloadFullReport?: () => void;
  onToggleModules: () => void;
  onToggleRemedies: () => void;
  showModules: boolean;
  showRemedies: boolean;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element {
  const copy = getKundliKarmaCopy(language);
  const moduleGroups = getKundliKarmaModuleGroups(copy);
  const topConditions = snapshot.topThreeActiveConditions;

  return (
    <View
      className="mt-4 gap-3 rounded-3xl border border-[#FFD27A26] bg-[#FFD27A10] p-4"
      testID="kundli-karma-mobile-surface"
    >
      <AppText className="text-[#FFD27A]" variant="caption">
        {copy.surfaceEyebrow}
      </AppText>
      <AppText variant="subtitle">{copy.surfaceTitle}</AppText>
      <AppText tone="secondary" variant="caption">
        {copy.surfaceBody}
      </AppText>

      <View
        className="mt-2 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
        testID="kundli-karma-mobile-snapshot"
      >
        <AppText className="text-[#FFD27A]" variant="caption">
          {copy.snapshotMetaTitle}
        </AppText>
        <AppText className="mt-1" variant="subtitle">
          {snapshot.subjectName}
        </AppText>
        <AppText className="mt-2" tone="secondary" variant="caption">
          {snapshot.summary}
        </AppText>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <KundliKarmaChip label={copy.statusLabel} value={statusLabel(snapshot.calculationStatus, copy)} />
          <KundliKarmaChip
            label={copy.noAiNeededLabel}
            value={snapshot.noAiRequiredFor.includes('show Kundli Karma snapshot') ? copy.yesLabel : copy.pendingLabel}
          />
        </View>
      </View>

      {!kundli ? (
        <KundliKarmaEmptyState
          body={copy.kundliNeededBody}
          title={copy.kundliNeededTitle}
        />
      ) : snapshot.calculationStatus !== 'ready' ? (
        <KundliKarmaEmptyState
          body={
            snapshot.missingData[0] ??
            copy.calculationPendingFallback
          }
          title={copy.calculationPendingTitle}
        />
      ) : topConditions.length === 0 ? (
        <KundliKarmaEmptyState
          body={copy.noMajorAlertsBody}
          title={copy.noMajorAlertsTitle}
        />
      ) : (
        <View className="gap-3" testID="kundli-karma-mobile-top-three">
          {topConditions.map(condition => (
            <KundliKarmaConditionCard
              condition={condition}
              copy={copy}
              hasPremiumAccess={hasPremiumAccess}
              kundli={kundli}
              key={condition.item.id}
              language={language}
              onAskPrompt={onAskPrompt}
              onDownloadFullReport={onDownloadFullReport}
              remedyPlan={snapshot.remedyPlan}
            />
          ))}
        </View>
      )}

      <KundliKarmaQuickPrompts
        copy={copy}
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
        language={language}
        onAskPrompt={onAskPrompt}
        snapshot={snapshot}
      />

      <DisclosureButton
        label={copy.categoryStackLabel}
        onPress={onToggleModules}
        open={showModules}
        subtitle={copy.categoryStackSubtitle}
      />
      {showModules ? (
        <View className="gap-3" testID="kundli-karma-mobile-category-stack">
          {moduleGroups.map(group => (
            <KundliKarmaModuleCard
              copy={copy}
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
        label={copy.consolidatedRemedyPlanLabel}
        onPress={onToggleRemedies}
        open={showRemedies}
        subtitle={copy.consolidatedRemedyPlanSubtitle}
      />
      {showRemedies ? (
        <View className="gap-3" testID="kundli-karma-mobile-remedy-plan">
          {snapshot.remedyPlan.slice(0, hasPremiumAccess ? 6 : 3).map(remedy => (
            <KundliKarmaRemedyRow copy={copy} key={remedy.id} remedy={remedy} />
          ))}
          {!hasPremiumAccess ? (
            <AppText className="rounded-2xl border border-[#FFD27A26] bg-[#FFD27A10] p-3 text-[#FFD27A]" variant="caption">
              {copy.premiumRemedyPlanBody}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaConditionCard({
  condition,
  copy,
  hasPremiumAccess,
  kundli,
  language,
  onAskPrompt,
  onDownloadFullReport,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  copy: KundliKarmaCopy;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
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
        <KundliKarmaChip label={`#${condition.rank}`} value={moduleLabel(item.module, copy)} />
        <KundliKarmaChip label={copy.statusLabel} value={statusLabel(item.status, copy)} />
        <KundliKarmaChip label={copy.strengthLabel} value={strengthLabel(item.strength, copy)} />
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
            accessibilityLabel={copy.askWhyCta}
            label={copy.askWhyCta}
            onPress={() =>
              onAskPrompt(
                buildKundliKarmaPrompt(item, copy),
                buildKundliKarmaHandoff(item, {
                  copy,
                  hasPremiumAccess,
                  kundli,
                  language,
                  sourceScreen: 'Vedic Kundli Karma Snapshot',
                }),
              )
            }
            primary
          />
        ) : null}
        {onDownloadFullReport ? (
          <ActionPill
            accessibilityLabel={copy.downloadDetailedReportCta}
            label={copy.downloadDetailedReportCta}
            onPress={onDownloadFullReport}
          />
        ) : null}
        <ActionPill
          accessibilityLabel={showDetails ? copy.hideEvidenceRemediesLabel : copy.openEvidenceRemediesLabel}
          label={showDetails ? copy.hideEvidenceRemediesLabel : copy.openEvidenceRemediesLabel}
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
            <KundliKarmaRemedyRow copy={copy} key={remedy.id} remedy={remedy} />
          ))}
          <AppText className="rounded-2xl border border-[#FFD27A26] bg-[#FFD27A10] p-3 text-[#FFD27A]" variant="caption">
            {hasPremiumAccess
              ? item.activation.summary
              : copy.premiumLockedBody}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaQuickPrompts({
  copy,
  hasPremiumAccess,
  kundli,
  language,
  onAskPrompt,
  snapshot,
}: {
  copy: KundliKarmaCopy;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  onAskPrompt?: (prompt: string, context?: KundliKarmaMobileHandoff) => void;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element | null {
  if (!onAskPrompt || !kundli) {
    return null;
  }
  const prompts = [
    {
      condition: snapshot.strongestDosh,
      fallback: copy.quickDoshPrompt,
      label: copy.quickDoshLabel,
      sourceScreen: 'Vedic Kundli Karma Quick Dosh',
    },
    {
      condition: snapshot.strongestShrapOrRin,
      fallback: copy.quickShrapPrompt,
      label: copy.quickShrapLabel,
      sourceScreen: 'Vedic Kundli Karma Quick Shrap',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'SUPPORTIVE_YOG'),
      fallback: copy.quickSupportiveYogPrompt,
      label: copy.quickSupportiveYogLabel,
      sourceScreen: 'Vedic Kundli Karma Quick Supportive Yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'CHALLENGING_YOG'),
      fallback: copy.quickChallengingYogPrompt,
      label: copy.quickChallengingYogLabel,
      sourceScreen: 'Vedic Kundli Karma Quick Challenging Yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'LAL_KITAB'),
      fallback: copy.quickLalKitabPrompt,
      label: copy.quickLalKitabLabel,
      sourceScreen: 'Vedic Kundli Karma Quick Lal Kitab',
    },
  ];

  return (
    <View
      className="gap-2 rounded-3xl border border-[#4DAFFF33] bg-[#4DAFFF12] p-4"
      testID="kundli-karma-mobile-quick-prompts"
    >
      <AppText className="text-[#4DAFFF]" variant="caption">
        {copy.quickPromptsTitle}
      </AppText>
      {prompts.map(prompt => {
        const context = prompt.condition
          ? buildKundliKarmaHandoff(prompt.condition.item, {
              copy,
              hasPremiumAccess,
              kundli,
              language,
              sourceScreen: prompt.sourceScreen,
            })
          : undefined;
        return (
          <ActionPill
            accessibilityLabel={prompt.label}
            key={prompt.sourceScreen}
            label={prompt.label}
            onPress={() => onAskPrompt(prompt.condition ? buildKundliKarmaPrompt(prompt.condition.item, copy) : prompt.fallback, context)}
          />
        );
      })}
    </View>
  );
}

function KundliKarmaModuleCard({
  copy,
  group,
  hasPremiumAccess,
  rankedConditions,
  remedyPlan,
}: {
  copy: KundliKarmaCopy;
  group: KundliKarmaMobileModuleGroup;
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
      <Pressable
        accessibilityLabel={`${group.title}. ${group.body}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(value => !value)}
      >
        <AppText className="text-[#FFD27A]" variant="caption">
          {visibleConditions.length} {copy.activeLabel} · {open ? copy.hideLabel : copy.openLabel}
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
                copy={copy}
                hasPremiumAccess={hasPremiumAccess}
                key={condition.item.id}
                remedyPlan={remedyPlan}
              />
            ))
          ) : (
            <KundliKarmaEmptyState
              body={formatKundliKarmaTemplate(copy.emptyGroupBodyTemplate, group.title)}
              title={formatKundliKarmaTemplate(copy.emptyGroupTitleTemplate, group.title)}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

function KundliKarmaMiniRow({
  condition,
  copy,
  hasPremiumAccess,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  copy: KundliKarmaCopy;
  hasPremiumAccess: boolean;
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);

  return (
    <View className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3">
      <AppText className="text-[#FFD27A]" variant="caption">
        {moduleLabel(item.module, copy)} · {statusLabel(item.status, copy)}
      </AppText>
      <AppText className="mt-1" variant="caption">
        {item.displayName}
      </AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {item.meaningForUser}
      </AppText>
      <Pressable
        accessibilityLabel={open ? copy.hideProofLabel : copy.openProofLabel}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        className="mt-3 rounded-full border border-[#FFFFFF18] bg-[#FFFFFF0A] px-4 py-3"
        onPress={() => setOpen(value => !value)}
      >
        <AppText variant="caption">{open ? copy.hideProofLabel : copy.openProofLabel}</AppText>
      </Pressable>
      {open ? (
        <View className="mt-3 gap-3">
          <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 3 : 1} />
          {remedies[0] ? <KundliKarmaRemedyRow copy={copy} remedy={remedies[0]} /> : null}
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
  copy,
  remedy,
}: {
  copy: KundliKarmaCopy;
  remedy: KundliKarmaRemedyPlanItem;
}): React.JSX.Element {
  return (
    <View className="rounded-2xl border border-[#FFFFFF10] bg-[#FFFFFF08] p-3">
      <AppText className="text-[#FFD27A]" variant="caption">
        {remedyCategoryLabel(remedy.category, copy)}
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
      accessibilityLabel={label}
      accessibilityRole="button"
      className="mt-4 rounded-3xl border border-[#FFFFFF12] bg-[#FFFFFF08] p-4"
      onPress={onPress}
      accessibilityState={{ expanded: open }}
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
  accessibilityLabel,
  label,
  onPress,
  primary,
}: {
  accessibilityLabel?: string;
  label: string;
  onPress: () => void;
  primary?: boolean;
}): React.JSX.Element {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
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

function buildKundliKarmaPrompt(item: KundliKarmaItem, copy: KundliKarmaCopy): string {
  return `${copy.askItemPromptPrefix.replace('{itemName}', item.displayName)} ${copy.askItemPromptBody}`;
}

function buildKundliKarmaHandoff(
  item: KundliKarmaItem,
  options: {
    copy: KundliKarmaCopy;
    hasPremiumAccess: boolean;
    kundli?: KundliData;
    language: SupportedLanguage;
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
    selectedLanguage: options.language,
    selectedSection: `${options.copy.selectedSectionPrefix}: ${item.displayName}`,
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

function moduleLabel(module: KundliKarmaModule, copy: KundliKarmaCopy): string {
  if (module === 'DOSH') return copy.moduleDosh;
  if (module === 'SHRAP') return copy.moduleShrap;
  if (module === 'LAL_KITAB') return copy.moduleLalKitab;
  return module === 'SUPPORTIVE_YOG' ? copy.moduleSupportiveYog : copy.moduleChallengingYog;
}

function statusLabel(
  status: KundliKarmaItem['status'] | KundliKarmaSnapshot['calculationStatus'],
  copy: KundliKarmaCopy,
): string {
  const labels: Record<string, string> = {
    blocked_context: copy.statusBlockedContext,
    cancelled: copy.statusCancelled,
    needs_data: copy.statusNeedsData,
    not_present: copy.statusNotPresent,
    partial: copy.statusPartial,
    present: copy.statusPresent,
    ready: copy.statusReady,
    weak: copy.statusWeak,
  };
  return labels[status] ?? titleizeToken(status);
}

function strengthLabel(strength: KundliKarmaItem['strength'], copy: KundliKarmaCopy): string {
  const labels: Record<string, string> = {
    high: copy.strengthHigh,
    low: copy.strengthLow,
    medium: copy.strengthMedium,
    very_high: copy.strengthVeryHigh,
  };
  return labels[strength] ?? titleizeToken(strength);
}

function remedyCategoryLabel(category: string, copy: KundliKarmaCopy): string {
  const labels: Record<string, string> = {
    avoid_list: copy.remedyCategoryAvoidList,
    free_karma_dharma_action: copy.remedyCategoryFreeKarmaDharmaAction,
    premium_structured_remedy: copy.remedyCategoryPremiumStructuredRemedy,
    timing_guidance: copy.remedyCategoryTimingGuidance,
  };
  return labels[category] ?? titleizeToken(category);
}

function titleizeToken(value: string): string {
  return value
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatKundliKarmaTemplate(template: string, groupTitle: string): string {
  return template.replace('{groupTitle}', groupTitle);
}
