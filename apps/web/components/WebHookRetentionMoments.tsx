'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { translateUiText } from '@pridicta/config/uiTranslations';
import type { KundliData, PredictaSchool, SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import { loadWebWrappedActivity } from '../lib/web-usage-summary';

const RETENTION_VISIT_KEY = 'predicta.retentionVisit.v1';

type RetentionVisitState = {
  firstSeenAt: string;
  lastSeenAt: string;
  visitCount: number;
};

type RetentionMoment = {
  body: string;
  cta: string;
  href: string;
  id: string;
  label: string;
  title: string;
};

type RetentionSummary = {
  lastSeenLabel: string;
  moments: RetentionMoment[];
  questionCount: number;
  streak: number;
  visitCount: number;
};

export function WebHookRetentionMoments({
  kundli,
}: {
  kundli: KundliData;
}): React.JSX.Element | null {
  const { language } = useLanguagePreference();
  const t = (value: string) => translateUiText(value, language);
  const [summary, setSummary] = useState<RetentionSummary>();

  useEffect(() => {
    const previousVisit = readRetentionVisit();
    setSummary(buildRetentionSummary(kundli, language, previousVisit));
    writeRetentionVisit(previousVisit);
  }, [kundli, language]);

  if (!summary) {
    return null;
  }

  return (
    <section className="retention-moments-panel glass-panel">
      <div className="retention-moments-head">
        <div>
          <div className="section-title">{t('CONTINUE YOUR RHYTHM')}</div>
          <h2>{t('Your next useful step is ready.')}</h2>
          <p>
            {t(
              'Predicta keeps today, your last question, and report progress close so you do not need to remember where to resume.',
            )}
          </p>
        </div>
        <div className="retention-moments-stats" aria-label={t('Progress summary')}>
          <div>
            <span>{t('Visits')}</span>
            <strong>{summary.visitCount}</strong>
          </div>
          <div>
            <span>{t('Streak')}</span>
            <strong>{summary.streak}</strong>
          </div>
          <div>
            <span>{t('Questions')}</span>
            <strong>{summary.questionCount}</strong>
          </div>
        </div>
      </div>

      <div className="retention-moment-grid">
        {summary.moments.map(moment => (
          <Link className="retention-moment-card" href={moment.href} key={moment.id}>
            <span>{t(moment.label)}</span>
            <strong>{t(moment.title)}</strong>
            <small>{t(moment.body)}</small>
            <em>{t(moment.cta)}</em>
          </Link>
        ))}
      </div>

      <p className="retention-moments-footnote">
        {summary.lastSeenLabel}
      </p>
    </section>
  );
}

function buildRetentionSummary(
  kundli: KundliData,
  language: SupportedLanguage,
  previousVisit?: RetentionVisitState,
): RetentionSummary {
  const memory = loadWebAutoSaveMemory();
  const activity = loadWebWrappedActivity();
  const today = getLocalDateKey();
  const streak = countDailyHabitStreak(today);
  const dailyDone = hasDailyHabit(today);
  const latestSpecialist = getLatestSpecialist(memory.specialistContexts);
  const moments: RetentionMoment[] = [];

  moments.push(
    dailyDone
      ? {
          body: 'You already finished the clean action. Ask what to watch for next.',
          cta: 'Ask follow-up',
          href: buildPredictaChatHref({
            kundli,
            prompt:
              'I finished today’s clean action. What should I watch for next today from my Kundli, Gochar, and dasha?',
            selectedDailyBriefingDate: today,
            selectedSection: 'Daily habit completed',
            sourceScreen: 'Retention Moment',
          }),
          id: 'daily-follow-up',
          label: 'Today',
          title: 'Turn today into a follow-up.',
        }
      : {
          body: 'Complete one small action so Predicta becomes a daily habit, not a one-time reading.',
          cta: 'Finish today',
          href: '/dashboard#daily-briefing',
          id: 'daily-action',
          label: 'Today',
          title: 'Finish today’s clean action.',
        },
  );

  moments.push({
    body:
      memory.chat?.messageCount && memory.chat.messageCount > 2
        ? 'Continue from your last question with the same selected Kundli.'
        : 'Ask one focused question and let Predicta build useful memory.',
    cta: memory.chat?.messageCount && memory.chat.messageCount > 2 ? 'Continue chat' : 'Ask Predicta',
    href: buildPredictaChatHref({
      kundli,
      prompt:
        memory.chat?.messageCount && memory.chat.messageCount > 2
          ? 'Continue from my last Predicta conversation and suggest the best next question from my Kundli.'
          : 'Suggest the best first question I should ask from my Kundli today.',
      sourceScreen: 'Retention Moment',
    }),
    id: 'continue-chat',
    label: 'Predicta',
    title:
      memory.chat?.messageCount && memory.chat.messageCount > 2
        ? 'Continue your last thread.'
        : 'Start with one strong question.',
  });

  if (latestSpecialist) {
    moments.push({
      body: `Resume ${formatSchool(latestSpecialist.school)} without mixing methods.`,
      cta: 'Open specialist',
      href: buildPredictaChatHref({
        kundli,
        prompt:
          latestSpecialist.handoffQuestion ??
          `Continue my ${formatSchool(latestSpecialist.school)} reading from the last selected context.`,
        chartName: latestSpecialist.selectedChart,
        school: latestSpecialist.school,
        selectedHouse: latestSpecialist.selectedHouse,
        selectedPlanet: latestSpecialist.selectedPlanet,
        selectedSection: latestSpecialist.selectedSection,
        sourceScreen: 'Retention Moment',
      }),
      id: 'specialist-resume',
      label: formatSchool(latestSpecialist.school),
      title: `Resume ${formatSchool(latestSpecialist.school)}.`,
    });
  } else {
    moments.push({
      body: 'Move from a reading into a polished free report preview.',
      cta: 'Open reports',
      href: '/dashboard/report?source=retention',
      id: 'report-start',
      label: 'Report',
      title: 'Create your first report.',
    });
  }

  if (memory.report?.selectedReportId) {
    moments.push({
      body: 'Your previous report choice is saved. Continue from the same setup.',
      cta: 'Continue report',
      href: '/dashboard/report?source=retention&resume=1',
      id: 'report-resume',
      label: 'Saved report',
      title: 'Resume report choices.',
    });
  }

  return {
    lastSeenLabel: buildLastSeenLabel(previousVisit, language),
    moments: moments.slice(0, 4),
    questionCount: activity.questionsAsked ?? 0,
    streak,
    visitCount: (previousVisit?.visitCount ?? 0) + 1,
  };
}

function getLatestSpecialist(
  contexts: ReturnType<typeof loadWebAutoSaveMemory>['specialistContexts'],
) {
  return Object.values(contexts ?? {})
    .filter(Boolean)
    .sort(
      (first, second) =>
        new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime(),
    )[0];
}

function hasDailyHabit(today: string): boolean {
  return ['en', 'hi', 'gu'].some(language => readDailyHabitDates(language).includes(today));
}

function countDailyHabitStreak(today: string): number {
  const dates = new Set(
    ['en', 'hi', 'gu'].flatMap(language => readDailyHabitDates(language)),
  );
  let cursor = new Date(`${today}T00:00:00.000Z`);
  let count = 0;

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    count += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }

  return count;
}

function readDailyHabitDates(language: string): string[] {
  try {
    const raw = window.localStorage.getItem(`predicta.dailyHabit.${language}`);
    const parsed = raw ? (JSON.parse(raw) as { dates?: unknown }) : undefined;

    return Array.isArray(parsed?.dates)
      ? parsed.dates.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function readRetentionVisit(): RetentionVisitState | undefined {
  try {
    const raw = window.localStorage.getItem(RETENTION_VISIT_KEY);
    return raw ? (JSON.parse(raw) as RetentionVisitState) : undefined;
  } catch {
    return undefined;
  }
}

function writeRetentionVisit(previous?: RetentionVisitState): void {
  try {
    const now = new Date().toISOString();
    const next: RetentionVisitState = {
      firstSeenAt: previous?.firstSeenAt ?? now,
      lastSeenAt: now,
      visitCount: (previous?.visitCount ?? 0) + 1,
    };

    window.localStorage.setItem(RETENTION_VISIT_KEY, JSON.stringify(next));
  } catch {
    // Retention moments should never block the dashboard when storage is limited.
  }
}

function buildLastSeenLabel(
  previousVisit: RetentionVisitState | undefined,
  language: SupportedLanguage,
): string {
  if (!previousVisit?.lastSeenAt) {
    return translateUiText('First dashboard visit saved for this device.', language);
  }

  const lastSeen = new Date(previousVisit.lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) {
    return translateUiText('Welcome back. Your rhythm is saved here.', language);
  }

  const hours = Math.max(
    1,
    Math.round((Date.now() - lastSeen.getTime()) / 3_600_000),
  );

  if (hours < 24) {
    return translateUiText('Welcome back. Your last visit was today.', language);
  }

  const days = Math.round(hours / 24);
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebHookRetentionMoments.tsx.97e0c4e9e0", [days]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebHookRetentionMoments.tsx.ff4befca15", [days]);
  }
  return translateUiText(`Welcome back after ${days} day${days === 1 ? '' : 's'}.`, language);
}

function getLocalDateKey(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatSchool(school: PredictaSchool): string {
  if (school === 'PARASHARI') {
    return 'Vedic';
  }

  if (school === 'NADI') {
    return 'Nadi';
  }

  if (school === 'NUMEROLOGY') {
    return 'Numerology';
  }

  if (school === 'SIGNATURE') {
    return 'Signature';
  }

  return 'KP';
}
