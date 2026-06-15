'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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

type KundliLibraryPreviewKind = 'PARASHARI' | 'CHALIT' | 'KP' | 'JAIMINI';

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
    sourceScreen: 'My Kundlis',
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
            sourceScreen: 'My Kundlis',
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
      {(['PARASHARI', 'CHALIT', 'KP', 'JAIMINI'] as KundliLibraryPreviewKind[]).map(school => (
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
            ['--library-label-h' as string]: `${cell.labelBox.height}%`,
            ['--library-label-w' as string]: `${cell.labelBox.width}%`,
            ['--library-label-x' as string]: `${cell.labelBox.x}%`,
            ['--library-label-y' as string]: `${cell.labelBox.y}%`,
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
  const chartName =
    school === 'KP'
      ? 'KP Bhav Chalit Cusp Chart'
      : school === 'JAIMINI'
        ? 'Jaimini Destiny Anchor'
        : school === 'CHALIT'
          ? 'Chalit Chart'
          : 'D1';
  const fullFlowHref =
    school === 'KP'
      ? '/dashboard/kp'
      : school === 'JAIMINI'
        ? '/dashboard/jaimini'
      : school === 'CHALIT'
        ? '/dashboard/charts'
        : '/dashboard/kundli';
  const askHref = buildPredictaChatHref({
    chartName,
    chartType: 'D1',
    kundli,
    kundliId: kundli.id,
    prompt: labels.dialogAskPrompt(kundli.birthDetails.name, chartTitle),
    purpose: school === 'KP' ? 'kp' : school === 'JAIMINI' ? 'kundli' : 'kundli',
    school: school === 'KP' ? 'KP' : school === 'JAIMINI' ? 'JAIMINI' : 'PARASHARI',
    selectedSection: `${chartTitle} chart preview`,
    sourceScreen: 'My Kundlis',
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
          insightProfile={school === 'KP' ? 'kp' : 'default'}
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

  return buildSchoolPreviewChart(
    kundli,
    school === 'JAIMINI' ? 'PARASHARI' : school,
  );
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
      `This removes ${name}'s profile from My Kundlis and from any Family Vault comparisons on this device.`,
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? `Predicta will switch the active profile to ${nextActiveName}. Older chats or reports may lose full chart context for the deleted profile.`
        : 'Older chats or reports may lose full chart context for the deleted profile. You may need to create or reactivate another Kundli before your next reading.',
    deleteConfirmEyebrow: 'Delete carefully',
    deleteConfirmFieldLabel: 'Type the profile name to confirm deletion',
    deleteConfirmHint: name => `Type ${name} exactly as shown.`,
    deleteConfirmTitle: name => `Delete ${name}'s Kundli?`,
    dialogAskPrompt: (name, chart) =>
      `Use ${name}'s ${chart} chart from My Kundlis. Confirm this chart in chat and tell me what I should ask next.`,
    dialogBody:
      'This preview uses the saved birth details. Choose a full flow, ask Predicta, or make this the active Kundli.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 SAVED KUNDLI'
        : school === 'CHALIT'
          ? 'CHALIT SAVED KUNDLI'
          : school === 'KP'
            ? 'KP SAVED KUNDLI'
            : 'JAIMINI SAVED KUNDLI',
    dialogEyebrow: 'SAVED CHART PREVIEW',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 remains the root chart for the saved Kundli.'
        : school === 'CHALIT'
          ? 'Parashari Chalit keeps the D1 sign but moves the planet into the bhava where it delivers results.'
          : school === 'KP'
            ? 'KP keeps its own rule path. This preview opens the saved birth chart in KP context.'
            : 'Jaimini keeps its own destiny-role path. This preview opens the saved birth chart in Jaimini context.',
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
      'Family Vault compares saved profiles from My Kundlis. It does not create a second hidden copy of birth data.',
    familyOverviewBody: count =>
      count >= 2
        ? 'Household comparison is ready because you have at least two saved profiles.'
        : 'Save one more profile before opening household comparison and relationship patterns.',
    familyReadyBadge: 'Available in Family Vault',
    familyReadyTitle: 'Family comparison ready',
    familyMap: 'Family Map',
    familyVaultBody:
      'Family Vault is the comparison layer. Save, edit, and delete personal charts in My Kundlis first, then use Family Vault for shared patterns and household guidance.',
    familyVaultEyebrow: 'FAMILY VAULT',
    familyVaultTitle: 'Family comparison uses saved Kundli profiles.',
    familyWaitingTitle: 'Needs more saved profiles',
    goToFamilyVault: 'Go to Family Vault',
    guestLimitBody:
      'Your first Kundli is safe here. Sign in before adding family profiles, multiple saved chats, or report preferences.',
    guestLimitTitle: 'Protect more Kundlis with sign-in',
    libraryEyebrow: 'MY KUNDLIS',
    overviewLabel: 'My Kundlis overview',
    pageBody:
      'Keep every saved Kundli here, choose one active personal profile, and open Family Vault only when you want careful household comparison.',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'Open Full Kundli'
        : school === 'CHALIT'
          ? 'Open Chalit Flow'
          : school === 'KP'
            ? 'Open KP Room'
            : 'Open Jaimini Room',
    openMatchmaking: 'Open Matchmaking',
    pageTitle: 'My Kundlis',
    personalBody: activeName =>
      activeName
        ? `Active profile: ${activeName}. Personal readings and edits stay in My Kundlis.`
        : 'No active profile yet. Create a Kundli here before opening other worlds or Family Vault.',
    personalBoundaryBody:
      'Personal edits, switching, and deletion should happen in My Kundlis so Family Vault stays a read-only comparison layer.',
    personalBoundaryTitle: 'Personal storage and edits',
    personalEyebrow: 'MY KUNDLIS',
    previewChartLabel: school =>
      school === 'PARASHARI'
        ? 'D1'
        : school === 'CHALIT'
          ? 'Chalit'
          : school === 'KP'
            ? 'KP'
            : 'Jaimini',
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
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.69a06a1497"),
    actionsTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f1c18ddd1b"),
    activeKundli: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.17e3e2f747"),
    activeNow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5d6d37d2c7"),
    activeProfileBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.be534383ee"),
    addProfile: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.8451479867"),
    approximateTime: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.2b2d1b0617"),
    askPredicta: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.c6b9045108"),
    askToCreate: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.2f363cbbc2"),
    birthDetails: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.7e51e803a9"),
    birthStar: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3bc3363fa1"),
    close: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0e77e8f76b"),
    continueChart: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.364cb6d3b9"),
    createNew: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.36dd98b386"),
    delete: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.07bde4305e"),
    deleteCancel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4df0d0f76d"),
    deleteConfirmAction: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4d0c32c905"),
    deleteConfirmBody: name =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1ccf207490", [name]),
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0a1aabb8f8", [nextActiveName])
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.03f8df77c7"),
    deleteConfirmEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5ec84fece1"),
    deleteConfirmFieldLabel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d377705032"),
    deleteConfirmHint: name => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.aea64136a8", [name]),
    deleteConfirmTitle: name => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3913ebaae3", [name]),
    dialogAskPrompt: (name, chart) =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.36e6fa9eda", [name, chart]),
    dialogBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.e61cfb9b8e"),
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0ebe59f794")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.6c98bff250")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.c1e39ca5b7")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ce68692d77"),
    dialogEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ac25b4f6e9"),
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.fa9e474a24")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d5c81f6120")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.bb89356cd9")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.cb080d5085"),
    dialogTitle: (name, chart) => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9bf2a3b0a7", [name, chart]),
    edit: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.710ed4c9e7"),
    editHistory: (count, fields) =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.e18b1bf6b6", [count, fields.length ? fields.join(', ') : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ea55fc2d51")]),
    emptyBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.6850716336"),
    emptyTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.e8c40ee08a"),
    familyBoundaryBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.fe69db8176"),
    familyOverviewBody: count =>
      count >= 2
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.50a9220ed3")
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.293132b648"),
    familyReadyBadge: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.de1f532fed"),
    familyReadyTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3626f35345"),
    familyMap: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.144f69bc72"),
    familyVaultBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.7ef6c8320e"),
    familyVaultEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.dc49ce1d21"),
    familyVaultTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.46202b8075"),
    familyWaitingTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ecafcbc76b"),
    goToFamilyVault: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9d296217f4"),
    guestLimitBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1be1b8708f"),
    guestLimitTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.69426948bc"),
    libraryEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.66249ce6af"),
    overviewLabel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.cbfda0ed89"),
    openFullFlow: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9fd41055dd")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.efd13c1209")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5dff21317c")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.049c7f74fe"),
    openMatchmaking: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b38135169e"),
    pageBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5516ac86ad"),
    pageTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.66249ce6af"),
    personalBody: activeName =>
      activeName
        ? formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.340fcba20b", [activeName])
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a47e722980"),
    personalBoundaryBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.27286e2bc3"),
    personalBoundaryTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.fd202bdd9d"),
    personalEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a3fbf290ee"),
    previewChartLabel: school =>
      school === 'PARASHARI'
        ? 'D1'
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.80d88aaddd")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.7e907cebdf")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1849d6330d"),
    previewCharts: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.c21d1705bd"),
    previewChartsHint: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5521c9c8ee"),
    rectifiedTime: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ad5728e2d6"),
    reviewChart: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.15dca593bd"),
    risingSign: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.86a1e127c9"),
    savedListBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d490a40c8d"),
    savedKundli: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0209046462"),
    savedCount: count => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b7e0b35de7", [count]),
    savedListEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.032c8ad559"),
    savedListTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.94de4cd1fd"),
    savedProfileBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ecdac94baf"),
    setActive: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.009a505477"),
    useInFamilyVault: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3ee4db0cbb"),
  },
  gu: {
    actionsBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.dd06e65a93"),
    actionsTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.8b9b40e9f1"),
    activeKundli: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ce8ef161b5"),
    activeNow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.8537ea5b16"),
    activeProfileBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4c1a1ca251"),
    addProfile: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9b55a692c0"),
    approximateTime: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.868a86797b"),
    askPredicta: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.52ca01d0e0"),
    askToCreate: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.93046a7c23"),
    birthDetails: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f946ce6629"),
    birthStar: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.014db4f1b4"),
    close: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.903d5b5729"),
    continueChart: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1b16d42687"),
    createNew: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.46e90ece90"),
    delete: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ab08cec697"),
    deleteCancel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d8bd753ad9"),
    deleteConfirmAction: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4811688cd2"),
    deleteConfirmBody: name =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.66166a4f2d", [name]),
    deleteConfirmConsequence: (_name, nextActiveName) =>
      nextActiveName
        ? formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.97e86af69e", [nextActiveName])
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.987d364d4e"),
    deleteConfirmEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.791a0b37d2"),
    deleteConfirmFieldLabel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0b4eb5407a"),
    deleteConfirmHint: name => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ad0db551de", [name]),
    deleteConfirmTitle: name => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b4d456ea1a", [name]),
    dialogAskPrompt: (name, chart) =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9b57337009", [name, chart]),
    dialogBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1b050ae21e"),
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0e9d69bc57")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.777e7e4f96")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.44592d7c8f")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d3787d3441"),
    dialogEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a0f9079c28"),
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3e25a9fe73")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0bebc14ffb")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d584ba7ddb")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1ee2edb186"),
    dialogTitle: (name, chart) => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.950bf70fd3", [name, chart]),
    edit: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ee4214e530"),
    editHistory: (count, fields) =>
      formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f91671f99a", [count, fields.length ? fields.join(', ') : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a4f489851b")]),
    emptyBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.edbc0ebf08"),
    emptyTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.02967241dc"),
    familyBoundaryBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.9548c9aebb"),
    familyOverviewBody: count =>
      count >= 2
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d516baaf24")
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f84e74e2fc"),
    familyReadyBadge: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.bfb0b8b574"),
    familyReadyTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.1373704560"),
    familyMap: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.64211d67ac"),
    familyVaultBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.42a6395d73"),
    familyVaultEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.dde3029f16"),
    familyVaultTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4e2a4f97fe"),
    familyWaitingTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ac1a3687d1"),
    goToFamilyVault: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b3d9f80d48"),
    guestLimitBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.efb0508171"),
    guestLimitTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.2d3fc8eba7"),
    libraryEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.69e24edda7"),
    overviewLabel: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0a9e37222b"),
    openFullFlow: school =>
      school === 'PARASHARI'
        ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.2afe4d7155")
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.67d2dc8b2c")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.fb85a47483")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.78d75d1a2b"),
    openMatchmaking: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.bdbcedc1d8"),
    pageBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f359d97bbc"),
    pageTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.69e24edda7"),
    personalBody: activeName =>
      activeName
        ? formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b261528f52", [activeName])
        : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.87ed8a899a"),
    personalBoundaryBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.089143883b"),
    personalBoundaryTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.239d982716"),
    personalEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f49f1a1741"),
    previewChartLabel: school =>
      school === 'PARASHARI'
        ? 'D1'
        : school === 'CHALIT'
          ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a99901ec5c")
          : school === 'KP'
            ? getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.70d983ba08")
            : getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.d653d63a61"),
    previewCharts: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.031f99a93f"),
    previewChartsHint: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.fd3329ed4b"),
    rectifiedTime: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.de8a6dee24"),
    reviewChart: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.a76b0e7a30"),
    risingSign: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.8a6353c98a"),
    savedListBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.0af85feec9"),
    savedKundli: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.b75f0aa9a6"),
    savedCount: count => formatNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.ac9f9feafb", [count]),
    savedListEyebrow: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.4d5a59bf21"),
    savedListTitle: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.aa7ea031f9"),
    savedProfileBody:
      getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.5a448905b5"),
    setActive: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.f1e1302c3c"),
    useInFamilyVault: getNativeCopy("native.apps.web.components.WebSavedKundlis.tsx.3072ce4086"),
  },
};
