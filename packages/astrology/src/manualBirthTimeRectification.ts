import type { BirthDetails } from '@pridicta/types';

export type ManualBirthTimeRectificationAnswer = 'no' | 'yes';

export type ManualBirthTimeRectificationQuestion = {
  id: string;
  question: string;
  yesSignal: string;
  noSignal: string;
  yesOffsetMinutes: number;
  noOffsetMinutes: number;
};

export type ManualBirthTimeRectificationEstimate = {
  answeredCount: number;
  confidence: 'low' | 'medium';
  evidence: string[];
  minuteAdjustment: number;
  originalTime: string;
  probableTime: string;
  summary: string;
};

export const MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS: ManualBirthTimeRectificationQuestion[] =
  [
    {
      id: 'early-responsibility',
      noOffsetMinutes: 4,
      noSignal: 'Responsibilities became stronger later, so the entered time stays closer.',
      question:
        'Before age 23, did you already feel unusually responsible for family, work, or money?',
      yesOffsetMinutes: -7,
      yesSignal:
        'Early responsibility suggests checking a slightly earlier rising degree.',
    },
    {
      id: 'career-shift',
      noOffsetMinutes: -3,
      noSignal: 'Career direction looks steadier, so the entered time stays closer.',
      question:
        'Before age 30, did your career or study direction change sharply at least once?',
      yesOffsetMinutes: 6,
      yesSignal: 'A sharp direction change suggests checking a slightly later time.',
    },
    {
      id: 'home-duty',
      noOffsetMinutes: 3,
      noSignal: 'Home pressure was not the main early theme.',
      question:
        'Did home, property, parents, or family duty feel heavy earlier than expected?',
      yesOffsetMinutes: -5,
      yesSignal: 'Early home duty suggests checking a slightly earlier time.',
    },
    {
      id: 'relationship-turning-point',
      noOffsetMinutes: -2,
      noSignal: 'Relationship timing does not strongly pull the time later.',
      question:
        'After age 25, did a relationship, marriage topic, or partnership become a major turning point?',
      yesOffsetMinutes: 5,
      yesSignal: 'A strong partnership turning point suggests checking a slightly later time.',
    },
    {
      id: 'outer-inner-difference',
      noOffsetMinutes: -2,
      noSignal: 'Outer personality and inner feeling seem more aligned.',
      question:
        'Do people often describe you differently from how you feel inside?',
      yesOffsetMinutes: 4,
      yesSignal:
        'A strong outer-inner difference suggests checking the rising degree carefully.',
    },
  ];

export function estimateManualBirthTimeRectification({
  answers,
  birthDetails,
}: {
  answers: Record<string, ManualBirthTimeRectificationAnswer | undefined>;
  birthDetails: BirthDetails;
}): ManualBirthTimeRectificationEstimate {
  const answeredQuestions = MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.filter(
    question => answers[question.id],
  );
  const rawOffset = answeredQuestions.reduce((total, question) => {
    const answer = answers[question.id];

    if (answer === 'yes') {
      return total + question.yesOffsetMinutes;
    }

    if (answer === 'no') {
      return total + question.noOffsetMinutes;
    }

    return total;
  }, 0);
  const minuteAdjustment = clamp(rawOffset, -18, 18);
  const probableTime = adjustTime(birthDetails.time, minuteAdjustment);
  const direction =
    minuteAdjustment === 0
      ? 'same as the entered time'
      : `${Math.abs(minuteAdjustment)} minutes ${
          minuteAdjustment > 0 ? 'later' : 'earlier'
        }`;

  return {
    answeredCount: answeredQuestions.length,
    confidence:
      answeredQuestions.length >= MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length
        ? 'medium'
        : 'low',
    evidence: answeredQuestions.map(question =>
      answers[question.id] === 'yes' ? question.yesSignal : question.noSignal,
    ),
    minuteAdjustment,
    originalTime: birthDetails.originalTime ?? birthDetails.time,
    probableTime,
    summary: `Based on your yes/no answers, Predicta estimates a probable birth time ${direction}: ${probableTime}. This is a practical confidence check, not a guaranteed rectification.`,
  };
}

export function applyManualBirthTimeEstimate(
  birthDetails: BirthDetails,
  estimate: ManualBirthTimeRectificationEstimate,
): BirthDetails {
  return {
    ...birthDetails,
    isTimeApproximate: true,
    originalTime: estimate.originalTime,
    rectificationMethod: 'manual-yes-no',
    rectifiedAt: new Date().toISOString(),
    time: estimate.probableTime,
    timeConfidence: 'rectified',
  };
}

function adjustTime(time: string, minutes: number): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());

  if (!match) {
    return time;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const total = (hour * 60 + minute + minutes + 24 * 60) % (24 * 60);
  const nextHour = Math.floor(total / 60);
  const nextMinute = total % 60;

  return `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(
    2,
    '0',
  )}`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
