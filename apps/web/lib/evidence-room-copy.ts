import type { SupportedLanguage } from '@pridicta/types';
import evidenceRoomTranslations from '../../../packages/config/src/translations/evidenceRoom.json';

type EvidenceRoomId =
  | 'jaimini'
  | 'kp'
  | 'kundliKarma'
  | 'numerology'
  | 'signature'
  | 'vedic';

type EvidenceRoomGenericKey =
  | 'badge'
  | 'detailsBelow'
  | 'openDetailedRoom'
  | 'openDetailedRoomHint'
  | 'openEvidence';

type EvidenceRoomCopyKey = 'action' | 'body' | 'evidence' | 'title';

type LocalizedString = Record<SupportedLanguage, string>;

type EvidenceRoomTranslationMap = {
  generic: Record<EvidenceRoomGenericKey, LocalizedString>;
} & Record<EvidenceRoomId, Record<EvidenceRoomCopyKey, LocalizedString>>;

const EVIDENCE_ROOM_TRANSLATIONS =
  evidenceRoomTranslations as EvidenceRoomTranslationMap;

export function getEvidenceRoomGenericCopy(
  key: EvidenceRoomGenericKey,
  language: SupportedLanguage,
): string {
  return readLocalizedString(EVIDENCE_ROOM_TRANSLATIONS.generic[key], language);
}

export function getEvidenceRoomCopy(
  room: EvidenceRoomId,
  key: EvidenceRoomCopyKey,
  language: SupportedLanguage,
): string {
  return readLocalizedString(EVIDENCE_ROOM_TRANSLATIONS[room][key], language);
}

function readLocalizedString(
  value: LocalizedString,
  language: SupportedLanguage,
): string {
  return value[language] ?? value.en;
}
