import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BirthTimeAnswer } from '../../types/astrology';

const BIRTH_TIME_ANSWERS_KEY = 'pridicta.birthTimeAnswers.v1';

export type BirthTimeAnswerMap = Record<string, BirthTimeAnswer>;

export async function loadBirthTimeAnswers(
  kundliId?: string,
): Promise<BirthTimeAnswerMap> {
  if (!kundliId) {
    return {};
  }

  const raw = await AsyncStorage.getItem(`${BIRTH_TIME_ANSWERS_KEY}.${kundliId}`);
  return raw ? (JSON.parse(raw) as BirthTimeAnswerMap) : {};
}

export async function saveBirthTimeAnswer(
  kundliId: string,
  current: BirthTimeAnswerMap,
  questionId: string,
  answer: string,
): Promise<BirthTimeAnswerMap> {
  const next = {
    ...current,
    [questionId]: {
      answer,
      answeredAt: new Date().toISOString(),
      questionId,
    },
  };

  await AsyncStorage.setItem(
    `${BIRTH_TIME_ANSWERS_KEY}.${kundliId}`,
    JSON.stringify(next),
  );
  return next;
}
