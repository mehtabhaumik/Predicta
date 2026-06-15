'use client';

import Link from 'next/link';
import { getKundliKarmaCopy, type KundliKarmaCopy } from '@pridicta/config';
import { translateUiText } from '@pridicta/config/uiTranslations';
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
  SupportedLanguage,
  VedicIntelligenceSection,
} from '@pridicta/types';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { getEvidenceRoomCopy } from '../lib/evidence-room-copy';
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
  language = 'en',
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language?: SupportedLanguage;
}): React.JSX.Element {
  const intelligence = composeVedicIntelligenceContract({
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    kundli,
  });
  const t = (value: string) => translateUiText(value, language);
  const kundliKarma = composeKundliKarmaSnapshot(kundli);
  const focusChartCards: ProgressiveChartCard[] = [
    { chart: kundli?.charts.D1, id: 'D1', title: t('D1 / Rashi') },
    {
      chart: intelligence.moonChart.chart,
      id: 'MOON',
      profile: 'moon',
      title: t('Moon / Chandra Lagna'),
    },
    { chart: kundli?.charts.D9, id: 'D9', title: t('D9 / Navamsa') },
    { chart: kundli?.charts.D10, id: 'D10', title: t('D10 / Dashamsa') },
    {
      chart: kundli ? buildParashariChalitChart(kundli) : undefined,
      id: 'CHALIT',
      profile: 'chalit',
      title: t('Chalit'),
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
  const vedicAskHref = buildPredictaChatHref({
    eventOracleHandoff: true,
    evidenceSourceLabel: t('Vedic chart, dasha, yog, and Kundli Karma evidence'),
    handoffMode: 'room_safe',
    kundli,
    prompt:
      'Ask Predicta about this Vedic chart, dasha, yog, and Kundli Karma evidence. Start with the direct prediction, then show the evidence only if needed.',
    reportMode: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    school: 'PARASHARI',
    selectedLanguage: language,
    selectedSection: t('Vedic dasha, chart, yog, and Kundli Karma context'),
    sourceScreen: 'Vedic Predicta',
  });
  const actionFirstTitle = getEvidenceRoomCopy('vedic', 'title', language);
  const actionFirstBody = getEvidenceRoomCopy('vedic', 'body', language);

  return (
    <section className="vedic-intelligence-panel glass-panel">
      <div className="vedic-intelligence-heading">
        <div>
          <p className="section-title">{t('PREDICTA VEDIC')}</p>
          <h2>{actionFirstTitle}</h2>
          <p>{actionFirstBody}</p>
          <div className="report-download-actions">
            <Link className="button primary" href={vedicAskHref}>
              {t('Ask Predicta')}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {t('Download Full Report')}
            </Link>
          </div>
        </div>
        <div className="vedic-intelligence-snapshot">
          <span>{t('Birth Snapshot')}</span>
          <strong>
            {intelligence.snapshot.lagna} {t('Lagna')} · {intelligence.snapshot.moonSign} {t('Moon')}
          </strong>
          <p>{intelligence.snapshot.currentDasha}</p>
        </div>
      </div>

      <ProgressiveGroup
        eyebrow={t('BIRTH SNAPSHOT')}
        title={t('Panchang, Avakhada, Ghatak and favorable points')}
        body={t('These are the quick context cards. They tell the user what matters now without forcing them into dense tables.')}
      >
        <div className="vedic-intelligence-grid compact">
          {birthSnapshotSections.map(section => (
            <SectionCard
              hasPremiumAccess={hasPremiumAccess}
              key={section.id}
              language={language}
              section={section}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow={t('CHARTS')}
        title={t('Focus charts first, full library deliberately')}
        body={t('The default flow stays simple: D1, Moon, D9, D10, and Chalit first. The complete varga library is still one click away.')}
        action={
          <Link className="button secondary" href="/dashboard/charts">
            {t('Open full chart library')}
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
                  ? t('Ready for a plain-language prediction.')
                  : t('Pending evidence; Predicta will not invent this chart.')}
              </p>
            </article>
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow={t('WHAT THIS MEANS')}
        title={t('Short predictive cards per focus chart')}
        body={t('Free users get one useful chart prediction. Premium users see a deeper but still compact signal on-screen.')}
      >
        <div className="vedic-intelligence-grid">
          {focusChartCards.map(card => (
            <ChartMeaningCard
              card={card}
              hasPremiumAccess={hasPremiumAccess}
              key={card.id}
              kundli={kundli}
              language={language}
            />
          ))}
        </div>
      </ProgressiveGroup>

      <ProgressiveGroup
        eyebrow={t('CURRENT TIMING')}
        title={t('Mahadasha Phala without clutter')}
        body={t('Timing has one focused card here. The PDF carries the complete Mahadasha, Antardasha, and Pratyantardasha structure.')}
      >
        <SectionCard
          hasPremiumAccess={hasPremiumAccess}
          language={language}
          section={intelligence.mahadashaPhala}
        />
      </ProgressiveGroup>

      <KundliKarmaWebSurface
        hasPremiumAccess={hasPremiumAccess}
        kundli={kundli}
        language={language}
        snapshot={kundliKarma}
      />

      <ProgressiveGroup
        eyebrow={t('CLASSICAL TABLES')}
        title={t('Open proof only when needed')}
        body={t('Friendship, house-wise evidence, Chalit table, Ashtakavarga, Prastara, Samsa, and related proof stay accessible but collapsed by default.')}
      >
        <div className="vedic-classical-stack">
          {classicalSections.map(section => (
            <details className="vedic-disclosure" key={section.id}>
              <summary>
                <span>{section.status === 'ready' ? t('Ready') : t('Pending')}</span>
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
          <span>{t('SOUL CHARTS')}</span>
          <strong>{t('Swamsa and Karakamsha chart previews')}</strong>
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
          <span>{t('ASK PREDICTA')}</span>
          <strong>{t('Ask from the section you are reading')}</strong>
          <p>
            {t('Predicta can explain Panchang, a focus chart, Mahadasha Phala, or any classical table without changing the screen into a report wall.')}
          </p>
        </div>
        <div className="report-download-actions">
          <Link className="button secondary" href={vedicAskHref}>
            {t('Ask Predicta')}
          </Link>
          <Link className="button primary" href="/dashboard/report">
            {t('Download Full Report')}
          </Link>
        </div>
      </div>
    </section>
  );
}

type KundliKarmaModuleGroup = {
  body: string;
  id: 'DOSH' | 'SHRAP' | 'YOG' | 'LAL_KITAB';
  modules: KundliKarmaModule[];
  title: string;
};

function getKundliKarmaModuleGroups(copy: KundliKarmaCopy): KundliKarmaModuleGroup[] {
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

function KundliKarmaWebSurface({
  hasPremiumAccess,
  kundli,
  language,
  snapshot,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element {
  const visibleConditions = snapshot.topThreeActiveConditions;
  const copy = getKundliKarmaCopy(language);
  const moduleGroups = getKundliKarmaModuleGroups(copy);

  return (
    <ProgressiveGroup
      eyebrow={copy.surfaceEyebrow}
      title={copy.surfaceTitle}
      body={copy.surfaceBody}
    >
      <section
        className="kundli-karma-panel"
        data-competitor-response-phase4-answer-first="kundli-karma"
        data-kundli-karma-calculation-status={snapshot.calculationStatus}
        data-kundli-karma-generated-by={snapshot.generatedBy}
      >
        <div className="kundli-karma-hero">
          <div>
            <span>{copy.snapshotMetaTitle}</span>
            <strong>{snapshot.subjectName}</strong>
            <p>{snapshot.summary}</p>
          </div>
          <div className="kundli-karma-hero-meta">
            <KundliKarmaChip label={copy.statusLabel} value={statusLabel(snapshot.calculationStatus, copy)} />
            <KundliKarmaChip
              label={copy.noAiNeededLabel}
              value={snapshot.noAiRequiredFor.includes('show Kundli Karma snapshot') ? copy.yesLabel : copy.pendingLabel}
            />
            {snapshot.topRemedy ? (
              <KundliKarmaChip label={copy.topRemedyLabel} value={snapshot.topRemedy.title} />
            ) : null}
          </div>
        </div>

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
        ) : visibleConditions.length === 0 ? (
          <KundliKarmaEmptyState
            body={copy.noMajorAlertsBody}
            title={copy.noMajorAlertsTitle}
          />
        ) : (
          <div className="kundli-karma-top-grid" aria-label={copy.topThreeAriaLabel}>
            {visibleConditions.map(condition => (
              <KundliKarmaConditionCard
                condition={condition}
                copy={copy}
                hasPremiumAccess={hasPremiumAccess}
                kundli={kundli}
                language={language}
                key={condition.item.id}
                remedyPlan={snapshot.remedyPlan}
              />
            ))}
          </div>
        )}

        <KundliKarmaQuickPrompts
          copy={copy}
          hasPremiumAccess={hasPremiumAccess}
          kundli={kundli}
          language={language}
          snapshot={snapshot}
        />

        <div className="kundli-karma-module-grid" aria-label={copy.categoryAriaLabel}>
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
        </div>

        <details className="kundli-karma-disclosure">
          <summary>
            <span>{copy.remediesGroupedTitle}</span>
            <strong>{copy.remediesGroupedSubtitle}</strong>
          </summary>
          <div className="kundli-karma-remedy-list">
            {snapshot.remedyPlan.slice(0, hasPremiumAccess ? 6 : 3).map(remedy => (
              <KundliKarmaRemedyRow copy={copy} key={remedy.id} remedy={remedy} />
            ))}
          </div>
          {!hasPremiumAccess ? (
            <p className="kundli-karma-locked">
              {copy.premiumReportBody}
            </p>
          ) : null}
        </details>
      </section>
    </ProgressiveGroup>
  );
}

function KundliKarmaConditionCard({
  condition,
  copy,
  hasPremiumAccess,
  kundli,
  language,
  remedyPlan,
}: {
  condition: KundliKarmaRankedCondition;
  copy: KundliKarmaCopy;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  remedyPlan: KundliKarmaRemedyPlanItem[];
}): React.JSX.Element {
  const item = condition.item;
  const remedies = remediesForItem(remedyPlan, item);
  const askHref = buildKundliKarmaAskHref(item, 'top-three-snapshot', {
    copy,
    hasPremiumAccess,
    kundli,
    language,
  });

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
        <KundliKarmaChip label={moduleLabel(item.module, copy)} value={statusLabel(item.status, copy)} />
        <KundliKarmaChip label={copy.strengthLabel} value={strengthLabel(item.strength, copy)} />
      </div>
      <strong>{item.displayName}</strong>
      <p>{item.meaningForUser}</p>
      <small>{condition.whyThisRankedFirst}</small>
      <div className="kundli-karma-actions">
        <Link
          className="button primary"
          data-kundli-karma-evidence-summary={buildKundliKarmaEvidenceSummary(item)}
          data-kundli-karma-item-id={item.id}
          data-kundli-karma-rule-id={item.ruleId}
          data-local-memory-cta="kundli-karma"
          href={askHref}
        >
          {copy.askWhyCta}
        </Link>
        <Link className="button secondary" href="/dashboard/report">
          {copy.downloadDetailedReportCta}
        </Link>
      </div>
      <details className="kundli-karma-card-details">
        <summary>{copy.openEvidenceRemediesLabel}</summary>
        <p>{item.whyPresent}</p>
        <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 5 : 2} />
        <div className="kundli-karma-remedy-list">
          {remedies.slice(0, hasPremiumAccess ? 3 : 1).map(remedy => (
            <KundliKarmaRemedyRow copy={copy} key={remedy.id} remedy={remedy} />
          ))}
        </div>
        {hasPremiumAccess ? (
          <p className="kundli-karma-premium-note">{item.activation.summary}</p>
        ) : (
          <p className="kundli-karma-locked">
            {copy.premiumLockedBody}
          </p>
        )}
      </details>
    </article>
  );
}

function KundliKarmaQuickPrompts({
  copy,
  hasPremiumAccess,
  kundli,
  language,
  snapshot,
}: {
  copy: KundliKarmaCopy;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  snapshot: KundliKarmaSnapshot;
}): React.JSX.Element {
  const prompts = [
    {
      condition: snapshot.strongestDosh,
      fallback: copy.quickDoshPrompt,
      label: copy.quickDoshLabel,
      source: 'quick-dosh',
    },
    {
      condition: snapshot.strongestShrapOrRin,
      fallback: copy.quickShrapPrompt,
      label: copy.quickShrapLabel,
      source: 'quick-shrap',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'SUPPORTIVE_YOG'),
      fallback: copy.quickSupportiveYogPrompt,
      label: copy.quickSupportiveYogLabel,
      source: 'quick-supportive-yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'CHALLENGING_YOG'),
      fallback: copy.quickChallengingYogPrompt,
      label: copy.quickChallengingYogLabel,
      source: 'quick-challenging-yog',
    },
    {
      condition: snapshot.rankedConditions.find(condition => condition.item.module === 'LAL_KITAB'),
      fallback: copy.quickLalKitabPrompt,
      label: copy.quickLalKitabLabel,
      source: 'quick-lal-kitab',
    },
  ];

  return (
    <div className="kundli-karma-quick-prompts" data-local-memory-cta="kundli-karma-quick-prompts">
      <span>{copy.quickPromptsTitle}</span>
      <div>
        {prompts.map(prompt => {
          const href = prompt.condition
            ? buildKundliKarmaAskHref(prompt.condition.item, prompt.source, {
                copy,
                hasPremiumAccess,
                kundli,
                language,
              })
            : buildKundliKarmaGenericAskHref(prompt.fallback, prompt.source, {
                hasPremiumAccess,
                kundli,
                language,
                copy,
              });
          return (
            <Link className="button secondary" href={href} key={prompt.source}>
              {prompt.label}
            </Link>
          );
        })}
      </div>
    </div>
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
  group: KundliKarmaModuleGroup;
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
              copy={copy}
              hasPremiumAccess={hasPremiumAccess}
              key={condition.item.id}
              remedyPlan={remedyPlan}
            />
          ))}
        </div>
      ) : (
        <KundliKarmaEmptyState
          body={formatKundliKarmaTemplate(copy.emptyGroupBodyTemplate, group.title)}
          title={formatKundliKarmaTemplate(copy.emptyGroupTitleTemplate, group.title)}
        />
      )}
    </details>
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
        <span>{moduleLabel(item.module, copy)} · {statusLabel(item.status, copy)}</span>
        <strong>{item.displayName}</strong>
        <p>{item.meaningForUser}</p>
      </div>
      <details className="kundli-karma-mini-details">
        <summary>{copy.openProofLabel}</summary>
        <p>{item.whyPresent}</p>
        <KundliKarmaEvidenceList item={item} limit={hasPremiumAccess ? 4 : 1} />
        {remedies[0] ? <KundliKarmaRemedyRow copy={copy} remedy={remedies[0]} /> : null}
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
  copy,
  remedy,
}: {
  copy: KundliKarmaCopy;
  remedy: KundliKarmaRemedyPlanItem;
}): React.JSX.Element {
  return (
    <article className="kundli-karma-remedy-row">
      <span>{remedyCategoryLabel(remedy.category, copy)}</span>
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

function buildKundliKarmaAskHref(
  item: KundliKarmaItem,
  sourceSurface: string,
  options: {
    copy: KundliKarmaCopy;
    hasPremiumAccess: boolean;
    kundli?: KundliData;
    language: SupportedLanguage;
  },
): string {
  const promptPrefix = options.copy.askItemPromptPrefix.replace('{itemName}', item.displayName);
  return buildPredictaChatHref({
    carriedContextLabel: options.copy.selectedSectionPrefix,
    eventOracleHandoff: true,
    evidenceSourceLabel: translateUiText(
      'Kundli Karma Dosh, Shrap, Yog, and Lal Kitab evidence',
      options.language,
    ),
    handoffMode: 'room_safe',
    kundli: options.kundli,
    prompt: `${promptPrefix} ${options.copy.askItemPromptBody}`,
    reportMode: options.hasPremiumAccess ? 'PREMIUM' : 'FREE',
    school: 'PARASHARI',
    selectedKundliKarmaEvidenceSummary: buildKundliKarmaEvidenceSummary(item),
    selectedKundliKarmaItemId: item.id,
    selectedKundliKarmaModule: item.module,
    selectedKundliKarmaRuleId: item.ruleId,
    selectedLanguage: options.language,
    selectedSection: `${options.copy.selectedSectionPrefix}: ${item.displayName}`,
    sourceScreen: `vedic-kundli-karma-${sourceSurface}`,
  });
}

function buildKundliKarmaGenericAskHref(
  prompt: string,
  sourceSurface: string,
  options: {
    copy: KundliKarmaCopy;
    hasPremiumAccess: boolean;
    kundli?: KundliData;
    language: SupportedLanguage;
  },
): string {
  return buildPredictaChatHref({
    carriedContextLabel: options.copy.quickPromptSection,
    eventOracleHandoff: true,
    evidenceSourceLabel: translateUiText(
      'Kundli Karma Dosh, Shrap, Yog, and Lal Kitab evidence',
      options.language,
    ),
    handoffMode: 'room_safe',
    kundli: options.kundli,
    prompt,
    reportMode: options.hasPremiumAccess ? 'PREMIUM' : 'FREE',
    school: 'PARASHARI',
    selectedLanguage: options.language,
    selectedSection: options.copy.quickPromptSection,
    sourceScreen: `vedic-kundli-karma-${sourceSurface}`,
  });
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
  language,
  section,
}: {
  hasPremiumAccess: boolean;
  language: SupportedLanguage;
  section: VedicIntelligenceSection;
}): React.JSX.Element {
  const t = (value: string) => translateUiText(value, language);
  return (
    <article
      className={`vedic-intelligence-card ${
        section.status === 'pending' ? 'is-pending' : ''
      }`}
    >
      <span>{section.status === 'ready' ? t('Ready') : t('Pending')}</span>
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
  language,
}: {
  card: ProgressiveChartCard;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
}): React.JSX.Element {
  const t = (value: string) => translateUiText(value, language);
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
          : t('This chart is pending evidence, so Predicta keeps it honest instead of inventing a reading.')}
      </p>
      {insight ? <small>{insight.currentGuidance}</small> : null}
      {hasPremiumAccess && insight?.premiumInsight ? (
        <em>{insight.premiumInsight.headline}</em>
      ) : null}
    </article>
  );
}
