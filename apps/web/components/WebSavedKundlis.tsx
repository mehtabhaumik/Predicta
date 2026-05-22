'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useMemo, useRef, useState } from 'react';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import {
  buildChartRenderModel,
  buildParashariChalitChart,
  buildSchoolPreviewChart,
  NORTH_INDIAN_CHART_LINE_PATHS,
} from '@pridicta/astrology';
import {
  canCreateAdditionalWebKundli,
  deleteWebKundli,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { Card } from './Card';
import { FamilyRelationshipBadge } from './FamilyRelationshipBadge';
import { WebKundliChart } from './WebKundliChart';
import { AuthDialog } from './AuthDialog';
import { BrandedDestructiveDialog } from './BrandedDestructiveDialog';

type KundliLibraryPreviewKind = 'PARASHARI' | 'CHALIT' | 'KP';

export function WebSavedKundlis(): React.JSX.Element {
  const { chartLanguage, language } = useLanguagePreference();
  const labels = KUNDLI_LIBRARY_COPY[language] ?? KUNDLI_LIBRARY_COPY.en;
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [dialogSelection, setDialogSelection] = useState<
    { kundli: KundliData; school: KundliLibraryPreviewKind } | undefined
  >();
  const [pendingDelete, setPendingDelete] = useState<KundliData | undefined>();
  const profiles = useMemo(() => {
    if (!activeKundli) {
      return savedKundlis;
    }

    return [
      activeKundli,
      ...savedKundlis.filter(record => record.id !== activeKundli.id),
    ];
  }, [activeKundli, savedKundlis]);
  const familyReady = profiles.length >= 2;
  const nextSuggestedActive = pendingDelete
    ? profiles.find(record => record.id !== pendingDelete.id)
    : undefined;

  function activateProfile(record: KundliData): void {
    setActiveWebKundli(record);
  }

  function deleteProfile(record: KundliData): void {
    deleteWebKundli(record.id);
    setPendingDelete(undefined);
  }

  function requestDelete(record: KundliData): void {
    setPendingDelete(record);
  }

  const askPredictaToCreateHref = buildPredictaChatHref({
    prompt:
      'Create a new Kundli for me. Ask only for the missing birth details and confirm them before calculation.',
    school: 'PARASHARI',
    sourceScreen: 'Kundli Library',
  });
  const canCreateMoreKundlis =
    profiles.length === 0 || canCreateAdditionalWebKundli().allowed;

  if (!activeKundli && profiles.length === 0) {
    return (
      <>
        <LibraryPageHeading
          activeName={undefined}
          familyReady={familyReady}
          labels={labels}
          savedCount={profiles.length}
        />
        <LibraryHeader
          askPredictaHref={askPredictaToCreateHref}
          canCreateMoreKundlis={canCreateMoreKundlis}
          hasProfiles={profiles.length > 0}
          labels={labels}
        />
        <FamilyVaultCard familyReady={familyReady} labels={labels} />
        <section className="saved-kundli-list" aria-label={labels.savedListTitle}>
          <Card className="glass-panel">
            <div className="card-content spacious">
              <div className="section-title">{labels.libraryEyebrow}</div>
              <h2>{labels.emptyTitle}</h2>
              <p>{labels.emptyBody}</p>
              <div className="action-row compact">
                <Link className="button" href="/dashboard/kundli">
                  {labels.createNew}
                </Link>
                <Link className="button secondary" href={askPredictaToCreateHref}>
                  {labels.askToCreate}
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </>
    );
  }

  return (
    <>
      <LibraryPageHeading
        activeName={activeKundli?.birthDetails.name}
        familyReady={familyReady}
        labels={labels}
        savedCount={profiles.length}
      />
      <LibraryHeader
        askPredictaHref={askPredictaToCreateHref}
        canCreateMoreKundlis={canCreateMoreKundlis}
        hasProfiles={profiles.length > 0}
        labels={labels}
      />
      <FamilyVaultCard familyReady={familyReady} labels={labels} />
      <section className="saved-kundli-list" aria-label={labels.savedListTitle}>
        <div className="saved-kundli-list-heading">
          <div>
            <div className="section-title">{labels.savedListEyebrow}</div>
            <h2>{labels.savedListTitle}</h2>
            <p>{labels.savedListBody}</p>
          </div>
          <span>{labels.savedCount(profiles.length)}</span>
        </div>
        {profiles.map(record => {
          const active = record.id === activeKundli?.id;
          const askHref = buildPredictaChatHref({
            chartName: 'D1',
            chartType: 'D1',
            kundli: record,
            kundliId: record.id,
            prompt: `Use ${record.birthDetails.name}'s saved Kundli and tell me the most useful next reading.`,
            purpose: 'family',
            school: 'PARASHARI',
            selectedSection: `Saved profile: ${record.birthDetails.name}`,
            sourceScreen: 'Kundli Library',
          });
          const reviewHref = `/dashboard/kundli${active ? '' : `?focusKundliId=${encodeURIComponent(record.id)}`}`;

          return (
            <article
              className={`saved-kundli-card${active ? ' active' : ''}`}
              key={record.id}
            >
              <div className="saved-kundli-card-header">
                <div className="saved-kundli-profile">
                  <div className="saved-kundli-status-row">
                    <span className="section-title">
                      {active ? labels.activeKundli : labels.savedKundli}
                    </span>
                    {active ? (
                      <span className="library-status-pill">{labels.activeNow}</span>
                    ) : null}
                    <FamilyRelationshipBadge
                      language={language}
                      relationship={record.relationshipToOwner ?? 'other'}
                    />
                    <span className="saved-kundli-badge">{labels.familyReadyBadge}</span>
                  </div>
                  <h2>{record.birthDetails.name}</h2>
                  <p className="saved-kundli-meta">
                    <span>{record.birthDetails.place}</span>
                    <span>
                      {labels.risingSign} {record.lagna}
                    </span>
                    <span>
                      {labels.birthStar} {record.nakshatra}
                    </span>
                  </p>
                  {record.editHistory?.length ? (
                    <p className="quiet-line">
                      {labels.editHistory(
                        record.editHistory.length,
                        record.editHistory[0]?.fieldsChanged ?? [],
                      )}
                    </p>
                  ) : null}
                  <p className="saved-kundli-card-note">
                    {active ? labels.activeProfileBody : labels.savedProfileBody}
                  </p>
                </div>
                <div className="saved-kundli-primary-actions">
                  <Link
                    className="button"
                    href={reviewHref}
                    onClick={() => activateProfile(record)}
                  >
                    {active ? labels.continueChart : labels.reviewChart}
                  </Link>
                  <Link
                    className="button secondary"
                    href={askHref}
                    onClick={() => activateProfile(record)}
                  >
                    {labels.askPredicta}
                  </Link>
                </div>
              </div>

              <div className="saved-kundli-preview-block">
                <div className="saved-kundli-preview-heading">
                  <strong>{labels.previewCharts}</strong>
                  <span>{labels.previewChartsHint}</span>
                </div>
                <KundliMiniChartStrip
                  chartLanguage={chartLanguage}
                  kundli={record}
                  labels={labels}
                  onOpenPreview={school =>
                    setDialogSelection({ kundli: record, school })
                  }
                />
              </div>

              <div className="saved-kundli-secondary-actions">
                {!active ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      activateProfile(record);
                    }}
                    type="button"
                  >
                    {labels.setActive}
                  </button>
                ) : null}
                <Link
                  className="button secondary"
                  href={`/dashboard/kundli?editKundliId=${encodeURIComponent(record.id)}`}
                  onClick={() => activateProfile(record)}
                >
                  {labels.edit}
                </Link>
                <Link
                  className="button secondary"
                  href="/dashboard/family"
                  onClick={() => activateProfile(record)}
                >
                  {labels.useInFamilyVault}
                </Link>
                <button
                  className="button secondary danger"
                  onClick={() => requestDelete(record)}
                  type="button"
                >
                  {labels.delete}
                </button>
              </div>
            </article>
          );
        })}
      </section>
      {dialogSelection ? (
        <KundliLibraryChartDialog
          labels={labels}
          onActivate={() => activateProfile(dialogSelection.kundli)}
          onClose={() => setDialogSelection(undefined)}
          onDelete={() => {
            setDialogSelection(undefined);
            requestDelete(dialogSelection.kundli);
          }}
          selection={dialogSelection}
        />
      ) : null}
      {pendingDelete ? (
        <BrandedDestructiveDialog
          body={labels.deleteConfirmBody(pendingDelete.birthDetails.name)}
          cancelLabel={labels.deleteCancel}
          confirmationHint={labels.deleteConfirmHint(pendingDelete.birthDetails.name)}
          confirmationLabel={labels.deleteConfirmFieldLabel}
          confirmationPhrase={pendingDelete.birthDetails.name}
          confirmationPlaceholder={pendingDelete.birthDetails.name}
          confirmLabel={labels.deleteConfirmAction}
          consequence={labels.deleteConfirmConsequence(
            pendingDelete.birthDetails.name,
            nextSuggestedActive?.birthDetails.name,
          )}
          eyebrow={labels.deleteConfirmEyebrow}
          onCancel={() => setPendingDelete(undefined)}
          onConfirm={() => deleteProfile(pendingDelete)}
          open
          title={labels.deleteConfirmTitle(pendingDelete.birthDetails.name)}
        />
      ) : null}
    </>
  );
}

function KundliMiniChartStrip({
  chartLanguage,
  kundli,
  labels,
  onOpenPreview,
}: {
  chartLanguage: SupportedLanguage;
  kundli: KundliData;
  labels: KundliLibraryCopy;
  onOpenPreview: (school: KundliLibraryPreviewKind) => void;
}): React.JSX.Element | null {
  const previewChart = buildSchoolPreviewChart(kundli, 'PARASHARI');

  if (!previewChart?.supported) {
    return null;
  }

  return (
    <div className="kundli-library-mini-strip" aria-label={labels.previewCharts}>
      {(['PARASHARI', 'CHALIT', 'KP'] as KundliLibraryPreviewKind[]).map(school => (
        <MiniKundliPreview
          chartLanguage={chartLanguage}
          key={`${kundli.id}-${school}`}
          kundli={kundli}
          label={labels.previewChartLabel(school)}
          onOpen={() => onOpenPreview(school)}
          school={school}
        />
      ))}
    </div>
  );
}

function MiniKundliPreview({
  chartLanguage,
  kundli,
  label,
  onOpen,
  school,
}: {
  chartLanguage: SupportedLanguage;
  kundli: KundliData;
  label: string;
  onOpen: () => void;
  school: KundliLibraryPreviewKind;
}): React.JSX.Element | null {
  const chart = buildLibraryPreviewChart(kundli, school);

  if (!chart?.supported) {
    return null;
  }

  const model = buildChartRenderModel({
    birthDetails: kundli.birthDetails,
    chart,
    language: chartLanguage,
    presentation: 'library',
    school: school === 'KP' ? 'KP' : 'PARASHARI',
  });

  return (
    <button
      aria-label={`${label}: ${kundli.birthDetails.name}`}
      className="kundli-library-mini-chart"
      data-chart-presentation={model.presentation}
      data-chart-theme={model.theme}
      data-school={school.toLowerCase()}
      onClick={onOpen}
      type="button"
    >
      <div className="kundli-library-mini-title">{label}</div>
      <svg
        aria-hidden
        className="north-chart-lines"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        {NORTH_INDIAN_CHART_LINE_PATHS.map(path => (
          <path d={path} key={path} />
        ))}
      </svg>
      {model.cells.map(cell => {
        const visiblePlanets = cell.renderPlanets.slice(0, cell.maxVisiblePlanets);
        return (
        <div
          className={`kundli-library-mini-cell kundli-library-mini-cell-${cell.house}`}
          data-density={cell.labelDensity}
          key={`${school}-${cell.key}`}
          style={{
            ['--house-x' as string]: `${cell.x}%`,
            ['--house-y' as string]: `${cell.y}%`,
          } as CSSProperties}
        >
          <span className="kundli-library-mini-sign">{cell.signNumber}</span>
          {visiblePlanets.length ? (
            <div className="kundli-library-mini-planets">
              {visiblePlanets.map(planet => (
                <b key={planet.key} title={planet.displayLabel}>
                  {planet.displayAbbreviation}
                  {planet.status.retrograde ? <i>R</i> : null}
                </b>
              ))}
              {cell.hiddenPlanetCount ? (
                <span className="chart-overflow-counter">+{cell.hiddenPlanetCount}</span>
              ) : null}
            </div>
          ) : null}
        </div>
        );
      })}
    </button>
  );
}

function KundliLibraryChartDialog({
  labels,
  onActivate,
  onClose,
  onDelete,
  selection,
}: {
  labels: KundliLibraryCopy;
  onActivate: () => void;
  onClose: () => void;
  onDelete: () => void;
  selection: { kundli: KundliData; school: KundliLibraryPreviewKind };
}): React.JSX.Element | null {
  const { kundli, school } = selection;
  const chart = buildLibraryPreviewChart(kundli, school);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useDialogFocusTrap(dialogRef, {
    active: Boolean(chart?.supported),
    initialFocusRef: closeButtonRef,
    onClose,
  });

  if (!chart?.supported) {
    return null;
  }

  const chartTitle = labels.previewChartLabel(school);
  const fullFlowHref =
    school === 'KP'
      ? '/dashboard/kp'
      : school === 'CHALIT'
        ? '/dashboard/charts'
        : '/dashboard/kundli';
  const askHref = buildPredictaChatHref({
    chartName: 'D1',
    chartType: 'D1',
    kundli,
    kundliId: kundli.id,
    prompt: labels.dialogAskPrompt(kundli.birthDetails.name, chartTitle),
    purpose: school === 'KP' ? 'kp' : 'kundli',
    school: school === 'KP' ? 'KP' : 'PARASHARI',
    selectedSection: `${chartTitle} chart preview`,
    sourceScreen: 'Kundli Library',
  });

  return (
    <div
      className="kundli-chart-dialog-backdrop"
      onMouseDown={event => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        aria-describedby="kundli-chart-dialog-body"
        aria-labelledby="kundli-chart-dialog-title"
        aria-modal="true"
        className="kundli-chart-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="kundli-chart-dialog-header">
          <div>
            <div className="section-title">{labels.dialogEyebrow}</div>
            <h2 id="kundli-chart-dialog-title">
              {labels.dialogTitle(kundli.birthDetails.name, chartTitle)}
            </h2>
            <p id="kundli-chart-dialog-body">{labels.dialogBody}</p>
          </div>
          <button
            className="button secondary"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            {labels.close}
          </button>
        </div>
        <div className="kundli-chart-dialog-meta" aria-label={labels.birthDetails}>
          <span>{kundli.birthDetails.date}</span>
          <span>{kundli.birthDetails.time}</span>
          <span>{kundli.birthDetails.place}</span>
          {kundli.birthDetails.isTimeApproximate ? (
            <strong>{labels.approximateTime}</strong>
          ) : null}
          {kundli.birthDetails.timeConfidence === 'rectified' ? (
            <strong>{labels.rectifiedTime}</strong>
          ) : null}
        </div>
        <WebKundliChart
          presentation="full"
          birthDetails={kundli.birthDetails}
          centerLabel={chartTitle}
          chart={chart}
          kundli={kundli}
          kundliId={kundli.id}
          ownerName={kundli.birthDetails.name}
          readingNoteOverride={labels.dialogReadingNote(school)}
          schoolOverride={school === 'KP' ? 'KP' : 'PARASHARI'}
          sectionTitle={labels.dialogChartSection(school)}
        />
        <div className="kundli-chart-dialog-actions">
          <Link
            className="button"
            href={fullFlowHref}
            onClick={() => {
              onActivate();
              onClose();
            }}
          >
            {labels.openFullFlow(school)}
          </Link>
          <Link
            className="button secondary"
            href={askHref}
            onClick={() => {
              onActivate();
              onClose();
            }}
          >
            {labels.askPredicta}
          </Link>
          <button
            className="button secondary"
            onClick={() => {
              onActivate();
              onClose();
            }}
            type="button"
          >
            {labels.setActive}
          </button>
          <Link
            className="button secondary"
            href={`/dashboard/kundli?editKundliId=${encodeURIComponent(kundli.id)}`}
            onClick={() => {
              onActivate();
              onClose();
            }}
          >
            {labels.edit}
          </Link>
          <button className="button secondary danger" onClick={onDelete} type="button">
            {labels.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function LibraryPageHeading({
  activeName,
  familyReady,
  labels,
  savedCount,
}: {
  activeName?: string;
  familyReady: boolean;
  labels: KundliLibraryCopy;
  savedCount: number;
}): React.JSX.Element {
  return (
    <section className="page-heading compact library-page-heading">
      <div>
        <div className="section-title">{labels.libraryEyebrow}</div>
        <h1 className="gradient-text">{labels.pageTitle}</h1>
        <p>{labels.pageBody}</p>
      </div>
      <div className="library-overview-grid" aria-label={labels.overviewLabel}>
        <div className="library-overview-card">
          <span>{labels.personalEyebrow}</span>
          <strong>{labels.savedCount(savedCount)}</strong>
          <p>{labels.personalBody(activeName)}</p>
        </div>
        <div className="library-overview-card">
          <span>{labels.familyVaultEyebrow}</span>
          <strong>
            {familyReady ? labels.familyReadyTitle : labels.familyWaitingTitle}
          </strong>
          <p>{labels.familyOverviewBody(savedCount)}</p>
        </div>
      </div>
    </section>
  );
}

function LibraryHeader({
  askPredictaHref,
  canCreateMoreKundlis,
  hasProfiles,
  labels,
}: {
  askPredictaHref: string;
  canCreateMoreKundlis: boolean;
  hasProfiles: boolean;
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <Card className={`glass-panel kundli-library-command-card${hasProfiles ? ' compact' : ''}`}>
      <div
        className={`card-content kundli-library-command-content${
          hasProfiles ? ' compact' : ' spacious'
        }`}
      >
        <div className="kundli-library-command-copy">
          <div className="section-title">{labels.personalEyebrow}</div>
          <h2>{labels.actionsTitle}</h2>
          <p>{labels.actionsBody}</p>
        </div>
        {canCreateMoreKundlis ? (
          <div className="kundli-library-command-actions">
            <Link className="button" href="/dashboard/kundli">
              {labels.createNew}
            </Link>
            <Link className="button secondary" href={askPredictaHref}>
              {labels.askToCreate}
            </Link>
          </div>
        ) : (
          <div className={`guest-storage-nudge${hasProfiles ? ' compact' : ''}`}>
            <div>
              <strong>{labels.guestLimitTitle}</strong>
              <p>{labels.guestLimitBody}</p>
            </div>
            <AuthDialog />
          </div>
        )}
      </div>
    </Card>
  );
}

function FamilyVaultCard({
  familyReady,
  labels,
}: {
  familyReady: boolean;
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <Card>
      <div className="card-content spacious">
        <div className="section-title">{labels.familyVaultEyebrow}</div>
        <h2>{labels.familyVaultTitle}</h2>
        <p>{labels.familyVaultBody}</p>
        <div className="library-boundary-grid">
          <div className="library-boundary-card">
            <span>{labels.personalEyebrow}</span>
            <strong>{labels.personalBoundaryTitle}</strong>
            <p>{labels.personalBoundaryBody}</p>
          </div>
          <div className="library-boundary-card">
            <span>{labels.familyVaultEyebrow}</span>
            <strong>
              {familyReady ? labels.familyReadyTitle : labels.familyWaitingTitle}
            </strong>
            <p>{labels.familyBoundaryBody}</p>
          </div>
        </div>
        <div className="action-row compact">
          <Link className="button secondary" href="/dashboard/kundli">
            {labels.addProfile}
          </Link>
          <Link className="button secondary" href="/dashboard/family">
            {labels.goToFamilyVault}
          </Link>
          <Link className="button secondary" href="/dashboard/matchmaking">
            {labels.openMatchmaking}
          </Link>
        </div>
      </div>
    </Card>
  );
}

function buildLibraryPreviewChart(
  kundli: KundliData,
  school: KundliLibraryPreviewKind,
) {
  if (school === 'CHALIT') {
    return buildParashariChalitChart(kundli);
  }

  return buildSchoolPreviewChart(kundli, school);
}

type KundliLibraryCopy = {
  actionsBody: string;
  actionsTitle: string;
  activeKundli: string;
  activeNow: string;
  activeProfileBody: string;
  addProfile: string;
  approximateTime: string;
  askPredicta: string;
  askToCreate: string;
  birthDetails: string;
  birthStar: string;
  close: string;
  continueChart: string;
  createNew: string;
  delete: string;
  deleteCancel: string;
  deleteConfirmAction: string;
  deleteConfirmBody: (name: string) => string;
  deleteConfirmConsequence: (
    name: string,
    nextActiveName?: string,
  ) => string;
  deleteConfirmEyebrow: string;
  deleteConfirmFieldLabel: string;
  deleteConfirmHint: (name: string) => string;
  deleteConfirmTitle: (name: string) => string;
  dialogAskPrompt: (name: string, chart: string) => string;
  dialogBody: string;
  dialogChartSection: (school: KundliLibraryPreviewKind) => string;
  dialogEyebrow: string;
  dialogReadingNote: (school: KundliLibraryPreviewKind) => string;
  dialogTitle: (name: string, chart: string) => string;
  edit: string;
  editHistory: (
    count: number,
    fields: Array<'date' | 'name' | 'place' | 'time'>,
  ) => string;
  emptyBody: string;
  emptyTitle: string;
  familyBoundaryBody: string;
  familyOverviewBody: (count: number) => string;
  familyReadyBadge: string;
  familyReadyTitle: string;
  familyMap: string;
  familyVaultBody: string;
  familyVaultEyebrow: string;
  familyVaultTitle: string;
  familyWaitingTitle: string;
  goToFamilyVault: string;
  guestLimitBody: string;
  guestLimitTitle: string;
  libraryEyebrow: string;
  overviewLabel: string;
  openFullFlow: (school: KundliLibraryPreviewKind) => string;
  openMatchmaking: string;
  pageBody: string;
  pageTitle: string;
  personalBody: (activeName?: string) => string;
  personalBoundaryBody: string;
  personalBoundaryTitle: string;
  personalEyebrow: string;
  previewChartLabel: (school: KundliLibraryPreviewKind) => string;
  previewCharts: string;
  previewChartsHint: string;
  rectifiedTime: string;
  reviewChart: string;
  risingSign: string;
  savedListBody: string;
  savedKundli: string;
  savedCount: (count: number) => string;
  savedListEyebrow: string;
  savedListTitle: string;
  savedProfileBody: string;
  setActive: string;
  useInFamilyVault: string;
};

const KUNDLI_LIBRARY_COPY: Record<SupportedLanguage, KundliLibraryCopy> = {
  en: {
    actionsBody:
      'Keep personal chart control here. Create, switch, edit, and delete profiles before using Family Vault for household comparison.',
    actionsTitle: 'Personal Kundli control stays here.',
    activeKundli: 'Active Kundli',
    activeNow: 'Active now',
    activeProfileBody:
      'Predicta will use this saved chart first for personal readings and world handoffs.',
    addProfile: 'Add Profile',
    approximateTime: 'Approximate time',
    askPredicta: 'Ask Predicta',
    askToCreate: 'Ask Predicta to Create',
    birthDetails: 'Birth details',
    birthStar: 'Birth star',
    close: 'Close',
    continueChart: 'Continue with chart',
    createNew: 'Create New Kundli',
    delete: 'Delete',
    deleteCancel: 'Keep Kundli',
    deleteConfirmAction: 'Delete Kundli',
    deleteConfirmBody: name =>
      `This removes ${name}'s profile from your personal Kundli Library and from any Family Vault comparisons on this device.`,
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? `Predicta will switch the active profile to ${nextActiveName}. Older chats or reports may lose full chart context for the deleted profile.`
        : 'Older chats or reports may lose full chart context for the deleted profile. You may need to create or reactivate another Kundli before your next reading.',
    deleteConfirmEyebrow: 'Delete carefully',
    deleteConfirmFieldLabel: 'Type the profile name to confirm deletion',
    deleteConfirmHint: name => `Type ${name} exactly as shown.`,
    deleteConfirmTitle: name => `Delete ${name}'s Kundli?`,
    dialogAskPrompt: (name, chart) =>
      `Use ${name}'s ${chart} chart from my Kundli Library. Confirm this chart in chat and tell me what I should ask next.`,
    dialogBody:
      'This preview uses the saved birth details. Choose a full flow, ask Predicta, or make this the active Kundli.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 SAVED KUNDLI'
        : school === 'CHALIT'
          ? 'CHALIT SAVED KUNDLI'
          : 'KP SAVED KUNDLI',
    dialogEyebrow: 'SAVED CHART PREVIEW',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 remains the root chart for the saved Kundli.'
        : school === 'CHALIT'
          ? 'Parashari Chalit keeps the D1 sign but moves the planet into the bhava where it delivers results.'
          : 'KP keeps its own rule path. This preview opens the saved birth chart in KP context.',
    dialogTitle: (name, chart) => `${name}'s ${chart} chart`,
    edit: 'Edit',
    editHistory: (count, fields) =>
      `Edited ${count} ${count === 1 ? 'time' : 'times'} · Last change: ${
        fields.length ? fields.join(', ') : 'birth details'
      }`,
    emptyBody:
      'Every Kundli you create will appear here first. Family Vault will stay empty until you save profiles here.',
    emptyTitle: 'Create your first Kundli.',
    familyBoundaryBody:
      'Family Vault compares saved profiles from this library. It does not create a second hidden copy of birth data.',
    familyOverviewBody: count =>
      count >= 2
        ? 'Household comparison is ready because you have at least two saved profiles.'
        : 'Save one more profile before opening household comparison and relationship patterns.',
    familyReadyBadge: 'Available in Family Vault',
    familyReadyTitle: 'Family comparison ready',
    familyMap: 'Family Map',
    familyVaultBody:
      'Family Vault is the comparison layer. Save, edit, and delete personal charts in the library first, then use Family Vault for shared patterns and household guidance.',
    familyVaultEyebrow: 'FAMILY VAULT',
    familyVaultTitle: 'Family comparison uses library profiles.',
    familyWaitingTitle: 'Needs more saved profiles',
    goToFamilyVault: 'Go to Family Vault',
    guestLimitBody:
      'Your first Kundli is safe here. Sign in before adding family profiles, multiple saved chats, or report preferences.',
    guestLimitTitle: 'Protect more Kundlis with sign-in',
    libraryEyebrow: 'KUNDLI LIBRARY',
    overviewLabel: 'Kundli Library overview',
    pageBody:
      'Keep every saved Kundli here, choose one active personal profile, and open Family Vault only when you want careful household comparison.',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'Open Full Kundli'
        : school === 'CHALIT'
          ? 'Open Chalit Flow'
          : 'Open KP Room',
    openMatchmaking: 'Open Matchmaking',
    pageTitle: 'Kundli Library',
    personalBody: activeName =>
      activeName
        ? `Active profile: ${activeName}. Personal readings and edits stay in this library.`
        : 'No active profile yet. Create a Kundli here before opening other worlds or Family Vault.',
    personalBoundaryBody:
      'Personal edits, switching, and deletion should happen in the library so Family Vault stays a read-only comparison layer.',
    personalBoundaryTitle: 'Personal storage and edits',
    personalEyebrow: 'PERSONAL LIBRARY',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'CHALIT' ? 'Chalit' : 'KP',
    previewCharts: 'Saved Kundli chart previews',
    previewChartsHint: 'Tap any preview to inspect the chart before opening a full flow.',
    rectifiedTime: 'Rectified time',
    reviewChart: 'Review chart',
    risingSign: 'Rising sign',
    savedListBody:
      'Choose the active personal profile here. Family Vault uses the same saved profiles later for comparison.',
    savedKundli: 'Saved Kundli',
    savedCount: count => `${count} saved ${count === 1 ? 'Kundli' : 'Kundlis'}`,
    savedListEyebrow: 'Saved profiles',
    savedListTitle: 'Your Kundlis',
    savedProfileBody:
      'This saved profile is available for personal readings now and can be used later inside Family Vault.',
    setActive: 'Set Active',
    useInFamilyVault: 'Use in Family Vault',
  },
  hi: {
    actionsBody:
      'व्यक्तिगत चार्ट का नियंत्रण यहीं रखें. परिवार तुलना खोलने से पहले प्रोफाइल यहीं बनाएं, बदलें, संपादित करें और हटाएं.',
    actionsTitle: 'व्यक्तिगत कुंडली नियंत्रण यहीं रहता है.',
    activeKundli: 'सक्रिय कुंडली',
    activeNow: 'अभी सक्रिय',
    activeProfileBody:
      'व्यक्तिगत रीडिंग और दुनिया-आधारित हैंडऑफ के लिए प्रेडिक्टा पहले यही सेव चार्ट पढ़ेगी.',
    addProfile: 'प्रोफाइल जोड़ें',
    approximateTime: 'अनुमानित समय',
    askPredicta: 'प्रेडिक्टा से पूछें',
    askToCreate: 'प्रेडिक्टा से बनवाएं',
    birthDetails: 'जन्म विवरण',
    birthStar: 'जन्म नक्षत्र',
    close: 'बंद करें',
    continueChart: 'चार्ट जारी रखें',
    createNew: 'नई कुंडली बनाएं',
    delete: 'हटाएं',
    deleteCancel: 'रहने दें',
    deleteConfirmAction: 'कुंडली हटाएं',
    deleteConfirmBody: name =>
      `यह ${name} की प्रोफाइल को आपकी व्यक्तिगत कुंडली लाइब्रेरी और इस डिवाइस के परिवार वॉल्ट तुलना दोनों से हटा देगा.`,
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? `प्रेडिक्टा सक्रिय प्रोफाइल को ${nextActiveName} पर बदल देगी. हटाई गई प्रोफाइल के लिए पुराने चैट या रिपोर्ट पूरा चार्ट संदर्भ खो सकते हैं.`
        : 'हटाई गई प्रोफाइल के लिए पुराने चैट या रिपोर्ट पूरा चार्ट संदर्भ खो सकते हैं. अगली रीडिंग से पहले आपको नई कुंडली बनानी या दूसरी कुंडली सक्रिय करनी पड़ सकती है.',
    deleteConfirmEyebrow: 'सावधानी से हटाएं',
    deleteConfirmFieldLabel: 'हटाने की पुष्टि के लिए प्रोफाइल का नाम टाइप करें',
    deleteConfirmHint: name => `${name} जैसा दिख रहा है वैसा ही लिखें.`,
    deleteConfirmTitle: name => `${name} की कुंडली हटाएं?`,
    dialogAskPrompt: (name, chart) =>
      `${name} की ${chart} कुंडली लाइब्रेरी से इस्तेमाल करें. चैट में चार्ट की पुष्टि करके बताएं कि आगे क्या पूछना सही रहेगा.`,
    dialogBody:
      'यह झलक सेव जन्म विवरण से बनी है. पूरा प्रवाह खोलें, प्रेडिक्टा से पूछें, या इसे सक्रिय कुंडली बनाएं.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 सेव कुंडली'
        : school === 'CHALIT'
          ? 'चलित सेव कुंडली'
          : 'कृष्णमूर्ति पद्धति सेव कुंडली',
    dialogEyebrow: 'सेव चार्ट झलक',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 इस सेव कुंडली का मूल चार्ट रहता है.'
        : school === 'CHALIT'
          ? 'पाराशरी चलित D1 की राशि वही रखता है, लेकिन ग्रह को उस भाव में दिखाता है जहाँ उसका फल प्रकट होता है.'
          : 'कृष्णमूर्ति पद्धति अपनी अलग नियम पद्धति रखता है. यह झलक कृष्णमूर्ति पद्धति संदर्भ में सेव जन्म चार्ट खोलती है.',
    dialogTitle: (name, chart) => `${name} का ${chart} चार्ट`,
    edit: 'संपादित करें',
    editHistory: (count, fields) =>
      `${count} बार संपादित · आखिरी बदलाव: ${
        fields.length ? fields.join(', ') : 'जन्म विवरण'
      }`,
    emptyBody:
      'आप जो भी कुंडली बनाएंगे, वह पहले यहां दिखेगी. यहां सेव किए बिना परिवार वॉल्ट तुलना नहीं खोलेगा.',
    emptyTitle: 'अपनी पहली कुंडली बनाएं.',
    familyBoundaryBody:
      'परिवार वॉल्ट इसी लाइब्रेरी की सेव प्रोफाइलों की तुलना करता है. यह जन्म विवरण की दूसरी छिपी हुई कॉपी नहीं बनाता.',
    familyOverviewBody: count =>
      count >= 2
        ? 'कम से कम दो सेव प्रोफाइल होने से पारिवारिक तुलना तैयार है.'
        : 'घर-परिवार तुलना और संबंध पैटर्न खोलने से पहले एक और प्रोफाइल सेव करें.',
    familyReadyBadge: 'परिवार वॉल्ट में उपलब्ध',
    familyReadyTitle: 'परिवार तुलना तैयार',
    familyMap: 'परिवार नक्शा',
    familyVaultBody:
      'परिवार वॉल्ट तुलना की परत है. व्यक्तिगत चार्ट पहले लाइब्रेरी में सेव, संपादित और हटाएं, फिर साझा संकेतों और पारिवारिक मार्गदर्शन के लिए परिवार वॉल्ट खोलें.',
    familyVaultEyebrow: 'परिवार वॉल्ट',
    familyVaultTitle: 'परिवार तुलना लाइब्रेरी प्रोफाइलों से चलती है.',
    familyWaitingTitle: 'और सेव प्रोफाइल चाहिए',
    goToFamilyVault: 'परिवार वॉल्ट पर जाएं',
    guestLimitBody:
      'आपकी पहली कुंडली इस डिवाइस पर सुरक्षित रहती है. परिवार प्रोफाइल, कई चैट और रिपोर्ट पसंद सेव रखने के लिए साइन इन करें.',
    guestLimitTitle: 'अधिक कुंडलियां सुरक्षित रखने के लिए साइन इन करें',
    libraryEyebrow: 'कुंडली लाइब्रेरी',
    overviewLabel: 'कुंडली लाइब्रेरी सार',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'पूरी कुंडली खोलें'
        : school === 'CHALIT'
          ? 'चलित प्रवाह खोलें'
          : 'कृष्णमूर्ति पद्धति कक्ष खोलें',
    openMatchmaking: 'विवाह मिलान खोलें',
    pageBody:
      'हर सेव कुंडली यहीं रखें, एक सक्रिय व्यक्तिगत प्रोफाइल चुनें, और सावधानी से पारिवारिक तुलना चाहिए तभी परिवार वॉल्ट खोलें.',
    pageTitle: 'कुंडली लाइब्रेरी',
    personalBody: activeName =>
      activeName
        ? `सक्रिय प्रोफाइल: ${activeName}. व्यक्तिगत रीडिंग और संपादन इसी लाइब्रेरी में रहते हैं.`
        : 'अभी कोई सक्रिय प्रोफाइल नहीं है. दूसरी दुनिया या परिवार वॉल्ट खोलने से पहले यहां कुंडली बनाएं.',
    personalBoundaryBody:
      'व्यक्तिगत संपादन, सक्रिय बदलना और हटाना लाइब्रेरी में ही होना चाहिए ताकि परिवार वॉल्ट केवल तुलना की परत बना रहे.',
    personalBoundaryTitle: 'व्यक्तिगत संग्रह और संपादन',
    personalEyebrow: 'व्यक्तिगत लाइब्रेरी',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'CHALIT' ? 'चलित' : 'कृष्णमूर्ति पद्धति',
    previewCharts: 'सेव कुंडली चार्ट झलक',
    previewChartsHint: 'पूरा प्रवाह खोलने से पहले किसी भी झलक पर टैप करके चार्ट देखें.',
    rectifiedTime: 'सुधारा गया समय',
    reviewChart: 'चार्ट देखें',
    risingSign: 'लग्न',
    savedListBody:
      'सक्रिय व्यक्तिगत प्रोफाइल यहीं चुनें. परिवार वॉल्ट बाद में इन्हीं सेव प्रोफाइलों का तुलना के लिए इस्तेमाल करता है.',
    savedKundli: 'सेव कुंडली',
    savedCount: count => `${count} सेव कुंडली`,
    savedListEyebrow: 'सेव प्रोफाइल',
    savedListTitle: 'आपकी कुंडलियां',
    savedProfileBody:
      'यह सेव प्रोफाइल अभी व्यक्तिगत रीडिंग के लिए उपलब्ध है और बाद में परिवार वॉल्ट में इस्तेमाल हो सकती है.',
    setActive: 'सक्रिय करें',
    useInFamilyVault: 'परिवार वॉल्ट में लें',
  },
  gu: {
    actionsBody:
      'વ્યક્તિગત ચાર્ટનું નિયંત્રણ અહીં રાખો. પરિવાર તુલના ખોલતા પહેલાં પ્રોફાઇલ અહીં બનાવો, બદલો, સંપાદિત કરો અને કાઢી નાખો.',
    actionsTitle: 'વ્યક્તિગત કુંડળી નિયંત્રણ અહીં રહે છે.',
    activeKundli: 'સક્રિય કુંડળી',
    activeNow: 'હમણાં સક્રિય',
    activeProfileBody:
      'વ્યક્તિગત વાંચન અને વર્લ્ડ હેન્ડઓફ માટે પ્રેડિક્ટા પહેલા આ સાચવેલો ચાર્ટ વાંચશે.',
    addProfile: 'પ્રોફાઇલ ઉમેરો',
    approximateTime: 'અંદાજિત સમય',
    askPredicta: 'પ્રેડિક્ટા ને પૂછો',
    askToCreate: 'પ્રેડિક્ટા પાસે બનાવડાવો',
    birthDetails: 'જન્મ વિગતો',
    birthStar: 'જન્મ નક્ષત્ર',
    close: 'બંધ કરો',
    continueChart: 'ચાર્ટ ચાલુ રાખો',
    createNew: 'નવી કુંડળી બનાવો',
    delete: 'કાઢી નાખો',
    deleteCancel: 'રહવા દો',
    deleteConfirmAction: 'કુંડળી કાઢી નાખો',
    deleteConfirmBody: name =>
      `આ ${name} ની પ્રોફાઇલને તમારી વ્યક્તિગત કુંડળી લાઇબ્રેરીમાંથી અને આ ડિવાઇસના પરિવાર વોલ્ટ તુલનામાંથી દૂર કરશે.`,
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? `પ્રેડિક્ટા સક્રિય પ્રોફાઇલને ${nextActiveName} પર બદલી દેશે. કાઢી નાખેલી પ્રોફાઇલ માટે જૂના ચેટ અથવા રિપોર્ટ સંપૂર્ણ ચાર્ટ સંદર્ભ ગુમાવી શકે છે.`
        : 'કાઢી નાખેલી પ્રોફાઇલ માટે જૂના ચેટ અથવા રિપોર્ટ સંપૂર્ણ ચાર્ટ સંદર્ભ ગુમાવી શકે છે. આગળની વાંચન પહેલાં તમને નવી કુંડળી બનાવવી કે બીજી કુંડળી સક્રિય કરવી પડી શકે છે.',
    deleteConfirmEyebrow: 'સાવચેતીથી કાઢો',
    deleteConfirmFieldLabel: 'કાઢી નાખવાની પુષ્ટિ માટે પ્રોફાઇલનું નામ લખો',
    deleteConfirmHint: name => `${name} જેમ દેખાય છે એમ જ લખો.`,
    deleteConfirmTitle: name => `${name} ની કુંડળી કાઢી નાખો?`,
    dialogAskPrompt: (name, chart) =>
      `${name} નો ${chart} ચાર્ટ કુંડળી લાઇબ્રેરીમાંથી વાપરો. ચેટમાં ચાર્ટની પુષ્ટિ કરીને આગળ શું પૂછવું તે કહો.`,
    dialogBody:
      'આ ઝલક સાચવેલી જન્મ વિગતો પરથી છે. સંપૂર્ણ પ્રવાહ ખોલો, પ્રેડિક્ટા ને પૂછો, અથવા આ કુંડળી સક્રિય કરો.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 સાચવેલી કુંડળી'
        : school === 'CHALIT'
          ? 'ચાલિત સાચવેલી કુંડળી'
          : 'કૃષ્ણમૂર્તિ પદ્ધતિ સાચવેલી કુંડળી',
    dialogEyebrow: 'સાચવેલી ચાર્ટ ઝલક',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 આ સેવ કુંડળીનો મૂળ ચાર્ટ રહે છે.'
        : school === 'CHALIT'
          ? 'પરાશરી ચાલિત D1 ની રાશિ એ જ રાખે છે, પણ ગ્રહને તે ભાવમાં મૂકે છે જ્યાં તેનું ફળ જીવનમાં પ્રગટ થાય છે.'
          : 'કૃષ્ણમૂર્તિ પદ્ધતિ પોતાની અલગ નિયમ પદ્ધતિ રાખે છે. આ ઝલક કૃષ્ણમૂર્તિ પદ્ધતિ સંદર્ભમાં સેવ જન્મ ચાર્ટ ખોલે છે.',
    dialogTitle: (name, chart) => `${name} નો ${chart} ચાર્ટ`,
    edit: 'સંપાદિત કરો',
    editHistory: (count, fields) =>
      `${count} વખત સંપાદિત · છેલ્લો ફેરફાર: ${
        fields.length ? fields.join(', ') : 'જન્મ વિગતો'
      }`,
    emptyBody:
      'તમે બનાવેલી દરેક કુંડળી પહેલા અહીં દેખાશે. અહીં સાચવ્યા વિના પરિવાર વોલ્ટ તુલના ખોલશે નહીં.',
    emptyTitle: 'તમારી પહેલી કુંડળી બનાવો.',
    familyBoundaryBody:
      'પરિવાર વોલ્ટ આ લાઇબ્રેરીની સાચવેલી પ્રોફાઇલની તુલના કરે છે. તે જન્મ વિગતોની બીજી છુપાયેલી નકલ બનાવતું નથી.',
    familyOverviewBody: count =>
      count >= 2
        ? 'ઓછામાં ઓછી બે સાચવેલી પ્રોફાઇલ હોવાથી પરિવાર તુલના તૈયાર છે.'
        : 'ઘરેલુ તુલના અને સંબંધ પેટર્ન ખોલવા પહેલાં એક વધુ પ્રોફાઇલ સાચવો.',
    familyReadyBadge: 'પરિવાર વોલ્ટમાં ઉપલબ્ધ',
    familyReadyTitle: 'પરિવાર તુલના તૈયાર',
    familyMap: 'પરિવાર નકશો',
    familyVaultBody:
      'પરિવાર વોલ્ટ તુલનાની પરત છે. વ્યક્તિગત ચાર્ટ પહેલાં લાઇબ્રેરીમાં સાચવો, સંપાદિત કરો અને કાઢી નાખો, પછી શેર કરેલા સંકેતો અને ઘરેલુ માર્ગદર્શન માટે પરિવાર વોલ્ટ ખોલો.',
    familyVaultEyebrow: 'પરિવાર વોલ્ટ',
    familyVaultTitle: 'પરિવાર તુલના લાઇબ્રેરી પ્રોફાઇલ પરથી ચાલે છે.',
    familyWaitingTitle: 'વધુ સાચવેલી પ્રોફાઇલ જોઈએ',
    goToFamilyVault: 'પરિવાર વોલ્ટ પર જાઓ',
    guestLimitBody:
      'તમારી પહેલી કુંડળી આ ડિવાઇસ પર સુરક્ષિત રહે છે. પરિવાર પ્રોફાઇલ, અનેક ચેટ અને રિપોર્ટ પસંદગીઓ સેવ રાખવા માટે સાઇન ઇન કરો.',
    guestLimitTitle: 'વધુ કુંડળીઓ સુરક્ષિત રાખવા સાઇન ઇન કરો',
    libraryEyebrow: 'કુંડળી લાઇબ્રેરી',
    overviewLabel: 'કુંડળી લાઇબ્રેરી સાર',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'સંપૂર્ણ કુંડળી ખોલો'
        : school === 'CHALIT'
          ? 'ચાલિત પ્રવાહ ખોલો'
          : 'કૃષ્ણમૂર્તિ પદ્ધતિ કક્ષ ખોલો',
    openMatchmaking: 'લગ્ન મિલાન ખોલો',
    pageBody:
      'દરેક સાચવેલી કુંડળી અહીં રાખો, એક સક્રિય વ્યક્તિગત પ્રોફાઇલ પસંદ કરો, અને સાવચેતીભરી ઘરેલુ તુલના જોઈએ ત્યારે જ પરિવાર વોલ્ટ ખોલો.',
    pageTitle: 'કુંડળી લાઇબ્રેરી',
    personalBody: activeName =>
      activeName
        ? `સક્રિય પ્રોફાઇલ: ${activeName}. વ્યક્તિગત વાંચન અને સંપાદન આ જ લાઇબ્રેરીમાં રહે છે.`
        : 'હજુ કોઈ સક્રિય પ્રોફાઇલ નથી. બીજા વર્લ્ડ અથવા પરિવાર વોલ્ટ ખોલતા પહેલાં અહીં કુંડળી બનાવો.',
    personalBoundaryBody:
      'વ્યક્તિગત સંપાદન, સક્રિય બદલવું અને કાઢી નાખવું લાઇબ્રેરીમાં જ થવું જોઈએ જેથી પરિવાર વોલ્ટ ફક્ત તુલનાની પરત રહે.',
    personalBoundaryTitle: 'વ્યક્તિગત સંગ્રહ અને સંપાદન',
    personalEyebrow: 'વ્યક્તિગત લાઇબ્રેરી',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'CHALIT' ? 'ચાલિત' : 'કૃષ્ણમૂર્તિ પદ્ધતિ',
    previewCharts: 'સાચવેલી કુંડળી ચાર્ટ ઝલક',
    previewChartsHint: 'સંપૂર્ણ પ્રવાહ ખોલતા પહેલા કોઈ પણ ઝલક પર ટેપ કરીને ચાર્ટ જુઓ.',
    rectifiedTime: 'સુધારેલો સમય',
    reviewChart: 'ચાર્ટ જુઓ',
    risingSign: 'લગ્ન',
    savedListBody:
      'સક્રિય વ્યક્તિગત પ્રોફાઇલ અહીં પસંદ કરો. પરિવાર વોલ્ટ બાદમાં આ જ સાચવેલી પ્રોફાઇલનો તુલનામાં ઉપયોગ કરે છે.',
    savedKundli: 'સાચવેલી કુંડળી',
    savedCount: count => `${count} સાચવેલી કુંડળી`,
    savedListEyebrow: 'સાચવેલી પ્રોફાઇલ',
    savedListTitle: 'તમારી કુંડળીઓ',
    savedProfileBody:
      'આ સાચવેલી પ્રોફાઇલ અત્યારે વ્યક્તિગત વાંચન માટે ઉપલબ્ધ છે અને પછી પરિવાર વોલ્ટમાં વાપરી શકાય છે.',
    setActive: 'સક્રિય કરો',
    useInFamilyVault: 'પરિવાર વોલ્ટમાં લો',
  },
};
