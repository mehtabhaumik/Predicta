import fallbackTranslations from '../../../packages/config/src/translations/specialistRoomFallback.json';

export type SpecialistRoomFallbackKey =
  keyof typeof fallbackTranslations.copy.en.rooms;
export type SpecialistRoomFallbackLanguage = keyof typeof fallbackTranslations.copy;

export const SPECIALIST_ROOM_FALLBACK_LANGUAGES: SpecialistRoomFallbackLanguage[] = [
  'en',
  'hi',
  'gu',
];

export const SPECIALIST_ROOM_FALLBACK_COPY = fallbackTranslations.copy;

export function getSpecialistRoomFallbackRoomCopy(
  language: SpecialistRoomFallbackLanguage,
  room: SpecialistRoomFallbackKey,
): (typeof fallbackTranslations.copy.en.rooms)[SpecialistRoomFallbackKey] {
  return fallbackTranslations.copy[language].rooms[room] ?? fallbackTranslations.copy[language].rooms.generic;
}
