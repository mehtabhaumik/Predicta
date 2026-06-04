'use client';

import Link from 'next/link';
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
  VedicIntelligenceSection,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { WebKundliChart } from './WebKundliChart';

type ProgressiveChartCard = {
  chart?: ChartData;
  id: string;
  profile?: ChartInsightProfile;
  title: string;
};

export function WebVedicIntelligencePanel({
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
  const kundliKarma = composeKundliKarmaSnapshot(kundli);
  const focusChartCards: ProgressiveChartCard[] = [
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
    <section className="vedic-intelligence-panel glass-panel">
      <div className="vedic-intelligence-heading">
        <div>
          <p className="section-title">PREDICTA VEDIC</p>
          <h2>Clean Vedic snapshot, not a 56-page wall</h2>
          <p>
            Start with the essentials, open advanced tables only when you want
            proof, and use the PDF as the full deep reading surface.
          </p>
        </div>
        <div className="vedic-intelligence-snapshot">
          <span>Birth Snapshot</span>
          <strong>
            {intelligence.snapshot.lagna} Lagna · {intelligence.snapshot.moonSign} Moon
          </strong>
          <p>{intelligence.snapshot.currentDasha}</p>
        </div>
      </div>

      <ProgressiveGroup
        eyebrow="BIRTH SNAPSHOT"
        title="Panchang, Avakhada, Ghatak and favorable points"
        body="These are the quick context cards. They tell the user what matters now without forcing them into dense tables."
      >
        <div className="vedic-intelligence-grid compact">
          {birthSnapshotSections.map(section => (
            <SectionCard
              hasPremiumAccess={hasPremiumAccess}
              key={section.id}
              section={section}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="CHARTS"
        title="Focus charts first, full library deliberately"
        body="The default flow stays simple: D1, Moon, D9, D10, and Chalit first. The complete varga library is still one click away."
        action={
          <Link className="button secondary" href="/dashboard/charts">
            Open full chart library
          </Link>
        }
      >
        <div className="vedic-chart-order">
          {focusChartCards.map(card => (
            <article key={card.id}>
              <span>{card.id}</span>
              <strong>{card.title}</strong>
              <p>
                {card.chart?.supported
                  ? 'Ready for a plain-language prediction.'
                  : 'Pending evidence; Predicta will not invent this chart.'}
              </p>
            </article>
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="WHAT THIS MEANS"
        title="Short predictive cards per focus chart"
        body="Free users get one useful chart prediction. Premium users see a deeper but still compact signal on-screen."
      >
        <div className="vedic-intelligence-grid">
          {focusChartCards.map(card => (
            <ChartMeaningCard
              card={card}
              hasPremiumAccess={hasPremiumAccess}
              key={card.id}
              kundli={kundli}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow="CURRENT TIMING"
        title="Mahadasha Phala without clutter"
        body="Timing has one focused card here. The PDF carries the complete Mahadasha, Antardasha, and Pratyantardasha structure."
      >
        <SectionCard
          hasPremiumAccess={hasPremiumAccess}
          section={intelligence.mahadashaPhala}
        />
      </ProgressiveGroup>

      <KundliKarmaWebSurface
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
        snapshot={kundliKarma}
      />

      <ProgressiveGroup
        eyebrow="CLASSICAL TABLES"
        title="Open proof only when needed"
        body="Friendship, house-wise evidence, Chalit table, Ashtakavarga, Prastara, Samsa, and related proof stay accessible but collapsed by default."
      >
        <div className="vedic-classical-stack">
          {classicalSections.map(section => (
            <details className="vedic-disclosure" key={section.id}>
              <summary>
                <span>{section.status === 'ready' ? 'Ready' : 'Pending'}</span>
                <strong>{section.title}</strong>
              </summary>
              <p>{section.freeInsight}</p>
              {hasPremiumAccess ? <small>{section.premiumAnalysis}</small> : null}
              {section.limitations[0] ? <em>{section.limitations[0]}</em> : null}
            </details>
          ))}
        </div>
      </ProgressiveGroup>

      <details className="vedic-disclosure vedic-soul-disclosure">
        <summary>
          <span>SOUL CHARTS</span>
          <strong>Swamsa and Karakamsha chart previews</strong>
        </summary>
        <div className="vedic-soul-chart-grid">
          {kundli && intelligence.swamsa.chart ? (
            <div className="vedic-moon-chart-card">
              <div>
                <p className="section-title">SWAMSA</p>
                <h3>{intelligence.swamsa.title}</h3>
                <p>{intelligence.swamsa.freeInsight}</p>
              </div>
              <WebKundliChart
                birthDetails={kundli.birthDetails}
                chart={intelligence.swamsa.chart}
                hasPremiumAccess={hasPremiumAccess}
                insightProfile="swamsa"
                kundli={kundli}
                presentation="full"
                centerLabel="Swamsa"
                sectionTitle="Swamsa Chart"
              />
            </div>
          ) : null}

          {kundli && intelligence.karakamsha.chart ? (
            <div className="vedic-moon-chart-card">
              <div>
                <p className="section-title">KARAKAMSHA</p>
                <h3>{intelligence.karakamsha.title}</h3>
                <p>{intelligence.karakamsha.freeInsight}</p>
              </div>
              <WebKundliChart
                birthDetails={kundli.birthDetails}
                chart={intelligence.karakamsha.chart}
                hasPremiumAccess={hasPremiumAccess}
                insightProfile="karakamsha"
                kundli={kundli}
                presentation="full"
                centerLabel="Karakamsha"
                sectionTitle="Karakamsha Chart"
              />
            </div>
          ) : null}
        </div>
      </details>

      <div className="vedic-action-band">
        <div>
          <span>ASK PREDICTA</span>
          <strong>Ask from the section you are reading</strong>
          <p>
            Predicta can explain Panchang, a focus chart, Mahadasha Phala, or
            any classical table without changing the screen into a report wall.
          </p>
        </div>
        <div className="report-download-actions">
          <Link className="button secondary" href="/dashboard/chat">
            Ask Predicta
          </Link>
          <Link className="button primary" href="/dashboard/report">
            Download Full Report
          </Link>
        </div>
      </div>
    </section>
  );
}

const KUNDLI_KARMA_MODULE_GROUPS: Array<{
  body: string;
  id: 'DOSH' | 'SHRAP' | 'YOG' | 'LAL_KITAB';
  modules: KundliKarmaModule[];
  title: string;
}> = [
  {
    body: 'Pressure indicators are shown calmly, with reductions and remedies before fear.',
    id: 'DOSH',
    modules: ['DOSH'],
    title: 'Dosh',
  },
  {
    body: 'Karmic debt signals are treated as indicators, never as curse language.',
    id: 'SHRAP',
    modules: ['SHRAP'],
    title: 'Shrap',
  },
  {
    body: 'Supportive and challenging Yogas stay together so strengths are not hidden.',
    id: 'YOG',
    modules: ['SUPPORTIVE_YOG', 'CHALLENGING_YOG'],
    title: 'Yog',
  },
  {
    body: 'Lal Kitab keeps practical house-wise observations and safe upay separate.',
    id: 'LAL_KITAB',
    modules: ['LAL_KITAB'],
    title: 'Lal Kitab',
  },
];

function KundliKarmaWebSurface({
  hasPremiumAccess,
  kundli,
  snapshot,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element {
  const visibleConditions = snapshot.topThreeActiveConditions;

  return (
    <ProgressiveGroup
      eyebrow="KUNDLI KARMA"
      title="Dosh, Shrap, Yog and Lal Kitab without fear"
      body="Predicta ranks only deterministic signals here. You see the plain meaning first, then evidence and remedies if you want to open the details."
    >
      <section
        className="kundli-karma-panel"
        data-kundli-karma-calculation-status={snapshot.calculationStatus}
        data-kundli-karma-generated-by={snapshot.generatedBy}
      >
        <div className="kundli-karma-hero">
          <div>
            <span>Kundli Karma Snapshot</span>
            <strong>{snapshot.subjectName}</strong>
            <p>{snapshot.summary}</p>
          </div>
          <div className="kundli-karma-hero-meta">
            <KundliKarmaChip label="Status" value={statusLabel(snapshot.calculationStatus)} />
            <KundliKarmaChip
              label="No AI needed"
              value={snapshot.noAiRequiredFor.includes('show Kundli Karma snapshot') ? 'Yes' : 'Pending'}
            />
            {snapshot.topRemedy ? (
              <KundliKarmaChip label="Top remedy" value={snapshot.topRemedy.title} />
            ) : null}
          </div>
        </div>

        {!kundli ? (
          <KundliKarmaEmptyState
            body="Create or open a Kundli first. Predicta will not invent Dosh, Shrap, Yog, or Lal Kitab signals without chart evidence."
            title="Kundli needed"
          />
        ) : snapshot.calculationStatus !== 'ready' ? (
          <KundliKarmaEmptyState
            body={
              snapshot.missingData[0] ??
              'Some deterministic evidence is still pending, so Predicta is keeping this section conservative.'
            }
            title="Calculation pending"
          />
        ) : visibleConditions.length === 0 ? (
          <KundliKarmaEmptyState
            body="Predicta did not find major active Kundli Karma alerts in the implemented deterministic checks. You can still open each category below for proof and calm context."
            title="No major Kundli Karma alerts"
          />
        ) : (
          <div className="kundli-karma-top-grid" aria-label="Top three Kundli Karma conditions">
            {visibleConditions.map(condition => (
              <KundliKarmaConditionCard
                condition={condition}
                hasPremiumAccess={hasPremiumAccess}
                key={condition.item.id}
                remedyPlan={snapshot.remedyPlan}
              />
            ))}
          </div>
        )}

        <div className="kundli-karma-module-grid" aria-label="Kundli Karma categories">
          {KUNDLI_KARMA_MODULE_GROUPS.map(group => (
            <KundliKarmaModuleCard
              group={group}
              hasPremiumAccess={hasPremiumAccess}
              key={group.id}
              rankedConditions={snapshot.rankedConditions}
              remedyPlan={snapshot.remedyPlan}
            />
          ))}
        </div>

        <details className="kundli-karma-disclosure">
          <summary>
            <span>Remedies grouped once</span>
            <strong>One consolidated plan, not repeated advice</strong>
          </summary>
          <div className="kundli-karma-remedy-list">
            {snapshot.remedyPlan.slice(0, hasPremiumAccess ? 6 : 3).map(remedy => (
              <KundliKarmaRemedyRow key={remedy.id} remedy={remedy} />
            ))}
          </div>
          {!hasPremiumAccess ? (
            <p className="kundli-karma-locked">
              Premium adds deeper timing, evidence-linked remedies, avoid-lists, and a structured plan without turning this page into the full report.
            </p>
          ) : null}
        </details>
      </section>
    </ProgressiveGroup>
  );
}

function KundliKarmaConditionCard({
  condition,
  hasPremiumAccess,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  hasPremiumAccess: boolean;
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);
  const askHref = buildKundliKarmaAskHref(item, 'top-three-snapshot');

  return (
    <article
      className="kundli-karma-condition-card"
      data-kundli-karma-item-id={item.id}
      data-kundli-karma-module={item.module}
      data-kundli-karma-rule-id={item.ruleId}
      data-local-memory-cta="kundli-karma"
    >
      <div className="kundli-karma-card-header">
        <span>#{condition.rank}</span>
        <KundliKarmaChip label={moduleLabel(item.module)} value={statusLabel(item.status)} />
        <KundliKarmaChip label="Strength" value={strengthLabel(item.strength)} />
      </div>
      <strong>{item.displayName}</strong>
      <p>{item.meaningForUser}</p>
      <small>{condition.whyThisRankedFirst}</small>
      <div className="kundli-karma-actions">
        <Link
          className="button primary"
          data-kundli-karma-item-id={item.id}
          data-kundli-karma-rule-id={item.ruleId}
          data-local-memory-cta="kundli-karma"
          href={askHref}
        >
          Ask Predicta why this appears
        </Link>
        <Link className="button secondary" href="/dashboard/report">
          Download detailed report
        </Link>
      </div>
      <details className="kundli-karma-card-details">
        <summary>Evidence and remedies</summary>
        <p>{item.whyPresent}</p>
        <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 5 : 2} />
        <div className="kundli-karma-remedy-list">
          {remedies.slice(0, hasPremiumAccess ? 3 : 1).map(remedy => (
            <KundliKarmaRemedyRow key={remedy.id} remedy={remedy} />
          ))}
        </div>
        {hasPremiumAccess ? (
          <p className="kundli-karma-premium-note">{item.activation.summary}</p>
        ) : (
          <p className="kundli-karma-locked">
            Premium opens fuller evidence, activation timing, and detailed remedies. Free still keeps the main meaning and one safe action visible.
          </p>
        )}
      </details>
    </article>
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
  const groupConditions = rankedConditions.filter(condition =>
    group.modules.includes(condition.item.module),
  );
  const visibleConditions = groupConditions.slice(0, hasPremiumAccess ? 4 : 2);

  return (
    <details className="kundli-karma-module-card">
      <summary>
        <span>{visibleConditions.length} active</span>
        <strong>{group.title}</strong>
        <p>{group.body}</p>
      </summary>
      {visibleConditions.length ? (
        <div className="kundli-karma-module-items">
          {visibleConditions.map(condition => (
            <KundliKarmaMiniRow
              condition={condition}
              hasPremiumAccess={hasPremiumAccess}
              key={condition.item.id}
              remedyPlan={remedyPlan}
            />
          ))}
        </div>
      ) : (
        <KundliKarmaEmptyState
          body={`No major ${group.title} signal is active in the current deterministic snapshot.`}
          title={`No major ${group.title} alert`}
        />
      )}
    </details>
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
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);

  return (
    <article
      className="kundli-karma-mini-row"
      data-kundli-karma-item-id={item.id}
      data-kundli-karma-module={item.module}
      data-kundli-karma-rule-id={item.ruleId}
      data-local-memory-cta="kundli-karma"
    >
      <div>
        <span>{moduleLabel(item.module)} · {statusLabel(item.status)}</span>
        <strong>{item.displayName}</strong>
        <p>{item.meaningForUser}</p>
      </div>
      <details className="kundli-karma-mini-details">
        <summary>Open proof</summary>
        <p>{item.whyPresent}</p>
        <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 4 : 1} />
        {remedies[0] ? <KundliKarmaRemedyRow remedy={remedies[0]} /> : null}
      </details>
    </article>
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
    <ul className="kundli-karma-evidence-list">
      {item.evidence.slice(0, limit).map(evidence => (
        <li key={evidence.id}>
          <span>{evidence.kind.replaceAll('_', ' ')}</span>
          <p>{evidence.description}</p>
        </li>
      ))}
    </ul>
  );
}

function KundliKarmaRemedyRow({
  remedy,
}: {
  remedy: KundliKarmaRemedyPlanItem;
}): React.JSX.Element {
  return (
    <article className="kundli-karma-remedy-row">
      <span>{remedy.category.replaceAll('_', ' ')}</span>
      <strong>{remedy.title}</strong>
      <p>{remedy.description}</p>
      <small>{remedy.safetyNote}</small>
    </article>
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
    <div className="kundli-karma-empty">
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
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
    <span className="kundli-karma-chip">
      <small>{label}</small>
      {value}
    </span>
  );
}

function buildKundliKarmaAskHref(item: KundliKarmaItem, sourceSurface: string): string {
  return buildPredictaChatHref({
    prompt:
      `Explain why ${item.displayName} appears in my Kundli Karma snapshot. ` +
      `Use deterministic rule ${item.ruleId}, module ${moduleLabel(item.module)}, visible evidence, activation timing, reductions, and safe remedies. ` +
      'Keep it Vedic, plain-language, non-fearful, and do not spend AI if the local Kundli Karma memory can answer it.',
    school: 'PARASHARI',
    selectedSection: `Kundli Karma: ${item.displayName}`,
    sourceScreen: `vedic-kundli-karma-${sourceSurface}`,
  });
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

function ProgressiveGroup({
  action,
  body,
  children,
  eyebrow,
  title,
}: {
  action?: React.ReactNode;
  body: string;
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}): React.JSX.Element {
  return (
    <div className="vedic-progressive-group">
      <div className="vedic-progressive-heading">
        <div>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          <p>{body}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
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
    <article
      className={`vedic-intelligence-card ${
        section.status === 'pending' ? 'is-pending' : ''
      }`}
    >
      <span>{section.status === 'ready' ? 'Ready' : 'Pending'}</span>
      <strong>{section.title}</strong>
      <p>{section.freeInsight}</p>
      {hasPremiumAccess ? <small>{section.premiumAnalysis}</small> : null}
      {section.limitations[0] ? <em>{section.limitations[0]}</em> : null}
    </article>
  );
}

function ChartMeaningCard({
  card,
  hasPremiumAccess,
  kundli,
}: {
  card: ProgressiveChartCard;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
}): React.JSX.Element {
  const insight = card.chart?.supported
    ? composeChartInsight({
        chart: card.chart,
        hasPremiumAccess,
        kundli,
        profile: card.profile,
      })
    : undefined;

  return (
    <article className="vedic-intelligence-card">
      <span>{card.id}</span>
      <strong>{card.title}</strong>
      <p>
        {insight
          ? insight.whatItSays
          : 'This chart is pending evidence, so Predicta keeps it honest instead of inventing a reading.'}
      </p>
      {insight ? <small>{insight.currentGuidance}</small> : null}
      {hasPremiumAccess && insight?.premiumInsight ? (
        <em>{insight.premiumInsight.headline}</em>
      ) : null}
    </article>
  );
}
