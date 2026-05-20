'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KundliData, SupportedLanguage } from '@pridicta/types';
import {
  buildChartRenderModel,
  NORTH_INDIAN_CHART_LINE_PATHS,
  type ChartRenderSchool,
} from '@pridicta/astrology';
import {
  canCreateAdditionalWebKundli,
  deleteWebKundli,
  loadWebKundli,
  loadWebKundlis,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { useLanguagePreference } from '../lib/language-preference';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';
import { Card } from './Card';
import { WebKundliChart } from './WebKundliChart';
import { AuthDialog } from './AuthDialog';
import { BrandedDestructiveDialog } from './BrandedDestructiveDialog';

export function WebSavedKundlis(): React.JSX.Element {
  const { chartLanguage, language } = useLanguagePreference();
  const labels = KUNDLI_LIBRARY_COPY[language] ?? KUNDLI_LIBRARY_COPY.en;
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);
  const [dialogSelection, setDialogSelection] = useState<
    { kundli: KundliData; school: ChartRenderSchool } | undefined
  >();
  const [pendingDelete, setPendingDelete] = useState<KundliData | undefined>();

  useEffect(() => {
    setKundli(loadWebKundli());
    setSavedKundlis(loadWebKundlis());
  }, []);
  const profiles = useMemo(() => {
    if (!kundli) {
      return savedKundlis;
    }

    return [kundli, ...savedKundlis.filter(record => record.id !== kundli.id)];
  }, [kundli, savedKundlis]);

  function activateProfile(record: KundliData): void {
    setActiveWebKundli(record);
    setKundli(record);
    setSavedKundlis(loadWebKundlis());
  }

  function deleteProfile(record: KundliData): void {
    const nextStore = deleteWebKundli(record.id);
    setKundli(nextStore.activeKundli);
    setSavedKundlis(nextStore.savedKundlis);
    setPendingDelete(undefined);
  }

  function requestDelete(record: KundliData): void {
    setPendingDelete(record);
  }

  const askPredictaToCreateHref = buildPredictaChatHref({
    prompt:
      'Create a new Kundli for me. Ask only for the missing birth details and confirm them before calculation.',
    sourceScreen: 'Kundli Library',
  });
  const canCreateMoreKundlis =
    profiles.length === 0 || canCreateAdditionalWebKundli().allowed;

  if (!kundli && profiles.length === 0) {
    return (
      <>
        <LibraryPageHeading labels={labels} />
        <LibraryHeader
          askPredictaHref={askPredictaToCreateHref}
          canCreateMoreKundlis={canCreateMoreKundlis}
          hasProfiles={profiles.length > 0}
          labels={labels}
        />
      <FamilyVaultCard labels={labels} />
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
      <LibraryPageHeading labels={labels} />
      <LibraryHeader
        askPredictaHref={askPredictaToCreateHref}
        canCreateMoreKundlis={canCreateMoreKundlis}
        hasProfiles={profiles.length > 0}
        labels={labels}
      />
      <FamilyVaultCard labels={labels} />
      <section className="saved-kundli-list" aria-label={labels.savedListTitle}>
        <div className="saved-kundli-list-heading">
          <div>
            <div className="section-title">{labels.savedListEyebrow}</div>
            <h2>{labels.savedListTitle}</h2>
          </div>
          <span>{labels.savedCount(profiles.length)}</span>
        </div>
        {profiles.map(record => {
          const active = record.id === kundli?.id;
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
                </div>
                <div className="saved-kundli-primary-actions">
                  <Link
                    className="button"
                    href="/dashboard/kundli"
                    onClick={() => activateProfile(record)}
                  >
                    {labels.open}
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
                  {labels.familyMap}
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
          body={labels.deleteConfirmBody}
          cancelLabel={labels.deleteCancel}
          confirmLabel={labels.deleteConfirmAction}
          consequence={labels.deleteConfirmConsequence}
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
  onOpenPreview: (school: ChartRenderSchool) => void;
}): React.JSX.Element | null {
  const d1Chart = kundli.charts.D1;

  if (!d1Chart?.supported) {
    return null;
  }

  return (
    <div className="kundli-library-mini-strip" aria-label={labels.previewCharts}>
      {(['PARASHARI', 'KP', 'NADI'] as ChartRenderSchool[]).map(school => (
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
  school: ChartRenderSchool;
}): React.JSX.Element | null {
  const chart = kundli.charts.D1;

  if (!chart?.supported) {
    return null;
  }

  const model = buildChartRenderModel({
    birthDetails: kundli.birthDetails,
    chart,
    language: chartLanguage,
    school,
  });

  return (
    <button
      aria-label={`${label}: ${kundli.birthDetails.name}`}
      className="kundli-library-mini-chart"
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
      {model.cells.map(cell => (
        <div
          className="kundli-library-mini-cell"
          data-density={cell.labelDensity}
          key={`${school}-${cell.key}`}
          style={{
            ['--house-x' as string]: `${cell.x}%`,
            ['--house-y' as string]: `${cell.y}%`,
          } as CSSProperties}
        >
          <span className="kundli-library-mini-sign">{cell.signNumber}</span>
          {cell.renderPlanets.length ? (
            <div className="kundli-library-mini-planets">
              {cell.renderPlanets.slice(0, 3).map(planet => (
                <b key={planet.key} title={planet.displayLabel}>
                  {planet.displayAbbreviation} {planet.degreeLabel}
                  {planet.status.retrograde ? <i>R</i> : null}
                </b>
              ))}
              {cell.renderPlanets.length > 3 ? (
                <em>+{cell.renderPlanets.length - 3}</em>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
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
  selection: { kundli: KundliData; school: ChartRenderSchool };
}): React.JSX.Element | null {
  const { kundli, school } = selection;
  const chart = kundli.charts.D1;
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
      : school === 'NADI'
        ? '/dashboard/nadi'
        : '/dashboard/kundli';
  const askHref = buildPredictaChatHref({
    chartName: 'D1',
    chartType: 'D1',
    kundli,
    kundliId: kundli.id,
    prompt: labels.dialogAskPrompt(kundli.birthDetails.name, chartTitle),
    purpose: school === 'PARASHARI' ? 'kundli' : school.toLowerCase(),
    school,
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
          birthDetails={kundli.birthDetails}
          centerLabel={chartTitle}
          chart={chart}
          kundliId={kundli.id}
          ownerName={kundli.birthDetails.name}
          readingNoteOverride={labels.dialogReadingNote(school)}
          schoolOverride={school}
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
  labels,
}: {
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <div className="page-heading compact">
      <h1 className="gradient-text">{labels.pageTitle}</h1>
      <details className="info-drawer">
        <summary>
          <span>{labels.libraryEyebrow}</span>
          <strong>{labels.openDetails}</strong>
        </summary>
        <p>{labels.pageBody}</p>
      </details>
    </div>
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
          <div className="section-title">{labels.actionsEyebrow}</div>
          <h2>{labels.actionsTitle}</h2>
          {!hasProfiles ? (
            <details className="info-drawer">
              <summary>
                <span>{labels.actionsEyebrow}</span>
                <strong>{labels.openDetails}</strong>
              </summary>
              <p>{labels.actionsBody}</p>
            </details>
          ) : null}
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
  labels,
}: {
  labels: KundliLibraryCopy;
}): React.JSX.Element {
  return (
    <Card>
      <div className="card-content spacious">
        <div className="section-title">{labels.familyVaultEyebrow}</div>
        <h2>{labels.familyVaultTitle}</h2>
        <details className="info-drawer">
          <summary>
            <span>{labels.familyVaultEyebrow}</span>
            <strong>{labels.openDetails}</strong>
          </summary>
          <p>{labels.familyVaultBody}</p>
        </details>
        <div className="action-row compact">
          <Link className="button secondary" href="/dashboard/kundli">
            {labels.addProfile}
          </Link>
          <Link className="button secondary" href="/dashboard/family">
            {labels.openFamilyMap}
          </Link>
        </div>
      </div>
    </Card>
  );
}

type KundliLibraryCopy = {
  actionsBody: string;
  actionsEyebrow: string;
  actionsTitle: string;
  activeKundli: string;
  activeNow: string;
  addProfile: string;
  approximateTime: string;
  askPredicta: string;
  askToCreate: string;
  birthDetails: string;
  birthStar: string;
  close: string;
  createNew: string;
  delete: string;
  deleteCancel: string;
  deleteConfirmAction: string;
  deleteConfirmBody: string;
  deleteConfirmConsequence: string;
  deleteConfirmEyebrow: string;
  deleteConfirmTitle: (name: string) => string;
  dialogAskPrompt: (name: string, chart: string) => string;
  dialogBody: string;
  dialogChartSection: (school: ChartRenderSchool) => string;
  dialogEyebrow: string;
  dialogReadingNote: (school: ChartRenderSchool) => string;
  dialogTitle: (name: string, chart: string) => string;
  edit: string;
  editHistory: (
    count: number,
    fields: Array<'date' | 'name' | 'place' | 'time'>,
  ) => string;
  emptyBody: string;
  emptyTitle: string;
  familyMap: string;
  familyVaultBody: string;
  familyVaultEyebrow: string;
  familyVaultTitle: string;
  guestLimitBody: string;
  guestLimitTitle: string;
  libraryEyebrow: string;
  open: string;
  openFamilyMap: string;
  openDetails: string;
  openFullFlow: (school: ChartRenderSchool) => string;
  pageBody: string;
  pageTitle: string;
  previewChartLabel: (school: ChartRenderSchool) => string;
  previewCharts: string;
  previewChartsHint: string;
  rectifiedTime: string;
  risingSign: string;
  savedKundli: string;
  savedCount: (count: number) => string;
  savedListEyebrow: string;
  savedListTitle: string;
  setActive: string;
};

const KUNDLI_LIBRARY_COPY: Record<SupportedLanguage, KundliLibraryCopy> = {
  en: {
    actionsBody:
      'Use this library as the main place for every saved Kundli. Family Vault uses these same profiles for comparisons and shared guidance.',
    actionsEyebrow: 'KUNDLI LIBRARY ACTIONS',
    actionsTitle: 'Create, switch, edit, or delete from one place.',
    activeKundli: 'Active Kundli',
    activeNow: 'Active now',
    addProfile: 'Add Profile',
    approximateTime: 'Approximate time',
    askPredicta: 'Ask Predicta',
    askToCreate: 'Ask Predicta to Create',
    birthDetails: 'Birth details',
    birthStar: 'Birth star',
    close: 'Close',
    createNew: 'Create New Kundli',
    delete: 'Delete',
    deleteCancel: 'Keep Kundli',
    deleteConfirmAction: 'Delete Kundli',
    deleteConfirmBody:
      'This removes it from your Kundli Library. Old chats or reports may no longer have full chart context for this profile.',
    deleteConfirmConsequence:
      'If this is your active Kundli, Predicta will move to the next saved Kundli or ask you to create a new chart.',
    deleteConfirmEyebrow: 'Delete carefully',
    deleteConfirmTitle: name => `Delete ${name}'s Kundli?`,
    dialogAskPrompt: (name, chart) =>
      `Use ${name}'s ${chart} chart from my Kundli Library. Confirm this chart in chat and tell me what I should ask next.`,
    dialogBody:
      'This preview uses the saved birth details. Choose a full flow, ask Predicta, or make this the active Kundli.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 SAVED KUNDLI'
        : school === 'KP'
          ? 'KP SAVED KUNDLI'
          : 'NADI SAVED KUNDLI',
    dialogEyebrow: 'SAVED CHART PREVIEW',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 remains the root chart for the saved Kundli.'
        : school === 'KP'
          ? 'KP keeps its own rule path. This preview opens the saved birth chart in KP context.'
          : 'Nadi keeps its own pattern reading. This preview opens the saved birth chart in Nadi context.',
    dialogTitle: (name, chart) => `${name}'s ${chart} chart`,
    edit: 'Edit',
    editHistory: (count, fields) =>
      `Edited ${count} ${count === 1 ? 'time' : 'times'} · Last change: ${
        fields.length ? fields.join(', ') : 'birth details'
      }`,
    emptyBody:
      'Every Kundli you create will appear here first. Family Vault uses these saved profiles for family patterns.',
    emptyTitle: 'Create your first Kundli.',
    familyMap: 'Family Map',
    familyVaultBody:
      'Use your saved Kundlis as family profiles, compare patterns, and later invite family members when shared permissions are ready.',
    familyVaultEyebrow: 'FAMILY VAULT',
    familyVaultTitle: 'Family layer for saved Kundlis.',
    guestLimitBody:
      'Your first Kundli is safe here. Sign in before adding family profiles, multiple saved chats, or report preferences.',
    guestLimitTitle: 'Protect more Kundlis with sign-in',
    libraryEyebrow: 'KUNDLI LIBRARY',
    open: 'Open',
    openDetails: 'Open',
    openFamilyMap: 'Open Family Map',
    pageBody:
      'This is your Kundli Library. Choose the profile Predicta should read, then use Family Vault when you want family patterns and shared profiles.',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'Open Full Kundli'
        : school === 'KP'
          ? 'Open KP Room'
          : 'Open Nadi Room',
    pageTitle: 'Kundli Library',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'KP' : 'Nadi',
    previewCharts: 'Saved Kundli chart previews',
    previewChartsHint: 'Tap any preview to inspect the chart before opening a full flow.',
    rectifiedTime: 'Rectified time',
    risingSign: 'Rising sign',
    savedKundli: 'Saved Kundli',
    savedCount: count => `${count} saved ${count === 1 ? 'Kundli' : 'Kundlis'}`,
    savedListEyebrow: 'Saved profiles',
    savedListTitle: 'Your Kundlis',
    setActive: 'Set Active',
  },
  hi: {
    actionsBody:
      'हर सेव कुंडली के लिए यही मुख्य जगह रखें. Family Vault इन्हीं प्रोफाइलों से तुलना और साझा मार्गदर्शन करता है.',
    actionsEyebrow: 'कुंडली लाइब्रेरी कार्य',
    actionsTitle: 'एक ही जगह से बनाएं, बदलें, संपादित करें या हटाएं.',
    activeKundli: 'सक्रिय कुंडली',
    activeNow: 'अभी सक्रिय',
    addProfile: 'प्रोफाइल जोड़ें',
    approximateTime: 'अनुमानित समय',
    askPredicta: 'प्रेडिक्टा से पूछें',
    askToCreate: 'प्रेडिक्टा से बनवाएं',
    birthDetails: 'जन्म विवरण',
    birthStar: 'जन्म नक्षत्र',
    close: 'बंद करें',
    createNew: 'नई कुंडली बनाएं',
    delete: 'हटाएं',
    deleteCancel: 'रहने दें',
    deleteConfirmAction: 'कुंडली हटाएं',
    deleteConfirmBody:
      'यह कुंडली लाइब्रेरी से हट जाएगी. पुराने चैट या रिपोर्ट में इस प्रोफाइल का पूरा चार्ट संदर्भ उपलब्ध नहीं रह सकता.',
    deleteConfirmConsequence:
      'अगर यही सक्रिय कुंडली है, तो प्रेडिक्टा अगली सेव कुंडली चुनेगी या नया चार्ट बनाने को कहेगी.',
    deleteConfirmEyebrow: 'सावधानी से हटाएं',
    deleteConfirmTitle: name => `${name} की कुंडली हटाएं?`,
    dialogAskPrompt: (name, chart) =>
      `${name} की ${chart} कुंडली लाइब्रेरी से इस्तेमाल करें. चैट में चार्ट की पुष्टि करके बताएं कि आगे क्या पूछना सही रहेगा.`,
    dialogBody:
      'यह झलक सेव जन्म विवरण से बनी है. पूरा प्रवाह खोलें, प्रेडिक्टा से पूछें, या इसे सक्रिय कुंडली बनाएं.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 सेव कुंडली'
        : school === 'KP'
          ? 'कृष्णमूर्ति पद्धति सेव कुंडली'
          : 'नाड़ी सेव कुंडली',
    dialogEyebrow: 'सेव चार्ट झलक',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 इस सेव कुंडली का मूल चार्ट रहता है.'
        : school === 'KP'
          ? 'कृष्णमूर्ति पद्धति अपनी अलग नियम पद्धति रखता है. यह झलक कृष्णमूर्ति पद्धति संदर्भ में सेव जन्म चार्ट खोलती है.'
          : 'नाड़ी अपनी अलग पैटर्न रीडिंग रखती है. यह झलक नाड़ी संदर्भ में सेव जन्म चार्ट खोलती है.',
    dialogTitle: (name, chart) => `${name} का ${chart} चार्ट`,
    edit: 'संपादित करें',
    editHistory: (count, fields) =>
      `${count} बार संपादित · आखिरी बदलाव: ${
        fields.length ? fields.join(', ') : 'जन्म विवरण'
      }`,
    emptyBody:
      'आप जो भी कुंडली बनाएंगे, वह पहले यहां दिखेगी. परिवार वॉल्ट इन्हीं सेव प्रोफाइलों से पारिवारिक संकेत पढ़ता है.',
    emptyTitle: 'अपनी पहली कुंडली बनाएं.',
    familyMap: 'परिवार नक्शा',
    familyVaultBody:
      'सेव कुंडलियों को परिवार प्रोफाइल की तरह इस्तेमाल करें, संकेतों की तुलना करें, और आगे अनुमति तैयार होने पर परिवार सदस्यों को जोड़ें.',
    familyVaultEyebrow: 'परिवार वॉल्ट',
    familyVaultTitle: 'सेव कुंडलियों के लिए परिवार स्तर.',
    guestLimitBody:
      'आपकी पहली कुंडली इस डिवाइस पर सुरक्षित रहती है. परिवार प्रोफाइल, कई चैट और रिपोर्ट पसंद सेव रखने के लिए साइन इन करें.',
    guestLimitTitle: 'अधिक कुंडलियां सुरक्षित रखने के लिए साइन इन करें',
    libraryEyebrow: 'कुंडली लाइब्रेरी',
    open: 'खोलें',
    openDetails: 'खोलें',
    openFamilyMap: 'परिवार नक्शा खोलें',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'पूरी कुंडली खोलें'
        : school === 'KP'
          ? 'कृष्णमूर्ति पद्धति कक्ष खोलें'
          : 'नाड़ी कक्ष खोलें',
    pageBody:
      'यह आपकी सेव कुंडलियों की जगह है. सक्रिय प्रोफाइल चुनें, फिर पारिवारिक संकेतों और साझा प्रोफाइल के लिए परिवार वॉल्ट इस्तेमाल करें.',
    pageTitle: 'कुंडली लाइब्रेरी',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'कृष्णमूर्ति पद्धति' : 'नाड़ी',
    previewCharts: 'सेव कुंडली चार्ट झलक',
    previewChartsHint: 'पूरा प्रवाह खोलने से पहले किसी भी झलक पर टैप करके चार्ट देखें.',
    rectifiedTime: 'सुधारा गया समय',
    risingSign: 'लग्न',
    savedKundli: 'सेव कुंडली',
    savedCount: count => `${count} सेव कुंडली`,
    savedListEyebrow: 'सेव प्रोफाइल',
    savedListTitle: 'आपकी कुंडलियां',
    setActive: 'सक्रिय करें',
  },
  gu: {
    actionsBody:
      'દરેક સાચવેલી કુંડળી માટે આ મુખ્ય જગ્યા રાખો. Family Vault આ જ પ્રોફાઇલોથી તુલના અને સહિયારું માર્ગદર્શન કરે છે.',
    actionsEyebrow: 'કુંડળી લાઇબ્રેરી કાર્ય',
    actionsTitle: 'એક જ જગ્યાએથી બનાવો, બદલો, સંપાદિત કરો અથવા કાઢી નાખો.',
    activeKundli: 'સક્રિય કુંડળી',
    activeNow: 'હમણાં સક્રિય',
    addProfile: 'પ્રોફાઇલ ઉમેરો',
    approximateTime: 'અંદાજિત સમય',
    askPredicta: 'પ્રેડિક્ટા ને પૂછો',
    askToCreate: 'પ્રેડિક્ટા પાસે બનાવડાવો',
    birthDetails: 'જન્મ વિગતો',
    birthStar: 'જન્મ નક્ષત્ર',
    close: 'બંધ કરો',
    createNew: 'નવી કુંડળી બનાવો',
    delete: 'કાઢી નાખો',
    deleteCancel: 'રહવા દો',
    deleteConfirmAction: 'કુંડળી કાઢી નાખો',
    deleteConfirmBody:
      'આ કુંડળી લાઇબ્રેરીમાંથી દૂર થશે. જૂના ચેટ અથવા રિપોર્ટમાં આ પ્રોફાઇલનો સંપૂર્ણ ચાર્ટ સંદર્ભ ઉપલબ્ધ ન રહી શકે.',
    deleteConfirmConsequence:
      'જો આ સક્રિય કુંડળી છે, તો પ્રેડિક્ટા આગળની સેવ કુંડળી પસંદ કરશે અથવા નવો ચાર્ટ બનાવવા કહેશે.',
    deleteConfirmEyebrow: 'સાવચેતીથી કાઢો',
    deleteConfirmTitle: name => `${name} ની કુંડળી કાઢી નાખો?`,
    dialogAskPrompt: (name, chart) =>
      `${name} નો ${chart} ચાર્ટ કુંડળી લાઇબ્રેરીમાંથી વાપરો. ચેટમાં ચાર્ટની પુષ્ટિ કરીને આગળ શું પૂછવું તે કહો.`,
    dialogBody:
      'આ ઝલક સાચવેલી જન્મ વિગતો પરથી છે. સંપૂર્ણ પ્રવાહ ખોલો, પ્રેડિક્ટા ને પૂછો, અથવા આ કુંડળી સક્રિય કરો.',
    dialogChartSection: school =>
      school === 'PARASHARI'
        ? 'D1 સાચવેલી કુંડળી'
        : school === 'KP'
          ? 'કૃષ્ણમૂર્તિ પદ્ધતિ સાચવેલી કુંડળી'
          : 'નાડી સાચવેલી કુંડળી',
    dialogEyebrow: 'સાચવેલી ચાર્ટ ઝલક',
    dialogReadingNote: school =>
      school === 'PARASHARI'
        ? 'D1 આ સેવ કુંડળીનો મૂળ ચાર્ટ રહે છે.'
        : school === 'KP'
          ? 'કૃષ્ણમૂર્તિ પદ્ધતિ પોતાની અલગ નિયમ પદ્ધતિ રાખે છે. આ ઝલક કૃષ્ણમૂર્તિ પદ્ધતિ સંદર્ભમાં સેવ જન્મ ચાર્ટ ખોલે છે.'
          : 'નાડી પોતાની અલગ પેટર્ન રીડિંગ રાખે છે. આ ઝલક નાડી સંદર્ભમાં સેવ જન્મ ચાર્ટ ખોલે છે.',
    dialogTitle: (name, chart) => `${name} નો ${chart} ચાર્ટ`,
    edit: 'સંપાદિત કરો',
    editHistory: (count, fields) =>
      `${count} વખત સંપાદિત · છેલ્લો ફેરફાર: ${
        fields.length ? fields.join(', ') : 'જન્મ વિગતો'
      }`,
    emptyBody:
      'તમે બનાવેલી દરેક કુંડળી પહેલા અહીં દેખાશે. પરિવાર વોલ્ટ આ જ સાચવેલી પ્રોફાઇલોથી પરિવારના સંકેતો વાંચે છે.',
    emptyTitle: 'તમારી પહેલી કુંડળી બનાવો.',
    familyMap: 'પરિવાર નકશો',
    familyVaultBody:
      'સાચવેલી કુંડળીઓને પરિવાર પ્રોફાઇલ તરીકે વાપરો, સંકેતોની તુલના કરો, અને આગળ પરવાનગીઓ તૈયાર થાય ત્યારે પરિવાર સભ્યોને જોડો.',
    familyVaultEyebrow: 'પરિવાર વોલ્ટ',
    familyVaultTitle: 'સાચવેલી કુંડળીઓ માટે પરિવાર સ્તર.',
    guestLimitBody:
      'તમારી પહેલી કુંડળી આ ડિવાઇસ પર સુરક્ષિત રહે છે. પરિવાર પ્રોફાઇલ, અનેક ચેટ અને રિપોર્ટ પસંદગીઓ સેવ રાખવા માટે સાઇન ઇન કરો.',
    guestLimitTitle: 'વધુ કુંડળીઓ સુરક્ષિત રાખવા સાઇન ઇન કરો',
    libraryEyebrow: 'કુંડળી લાઇબ્રેરી',
    open: 'ખોલો',
    openDetails: 'ખોલો',
    openFamilyMap: 'પરિવાર નકશો ખોલો',
    openFullFlow: school =>
      school === 'PARASHARI'
        ? 'સંપૂર્ણ કુંડળી ખોલો'
        : school === 'KP'
          ? 'કૃષ્ણમૂર્તિ પદ્ધતિ કક્ષ ખોલો'
          : 'નાડી કક્ષ ખોલો',
    pageBody:
      'આ તમારી સાચવેલી કુંડળીઓની જગ્યા છે. સક્રિય પ્રોફાઇલ પસંદ કરો, પછી પરિવારના સંકેતો અને સહિયારી પ્રોફાઇલ માટે પરિવાર વોલ્ટ વાપરો.',
    pageTitle: 'કુંડળી લાઇબ્રેરી',
    previewChartLabel: school =>
      school === 'PARASHARI' ? 'D1' : school === 'KP' ? 'કૃષ્ણમૂર્તિ પદ્ધતિ' : 'નાડી',
    previewCharts: 'સાચવેલી કુંડળી ચાર્ટ ઝલક',
    previewChartsHint: 'સંપૂર્ણ પ્રવાહ ખોલતા પહેલા કોઈ પણ ઝલક પર ટેપ કરીને ચાર્ટ જુઓ.',
    rectifiedTime: 'સુધારેલો સમય',
    risingSign: 'લગ્ન',
    savedKundli: 'સાચવેલી કુંડળી',
    savedCount: count => `${count} સાચવેલી કુંડળી`,
    savedListEyebrow: 'સાચવેલી પ્રોફાઇલ',
    savedListTitle: 'તમારી કુંડળીઓ',
    setActive: 'સક્રિય કરો',
  },
};
