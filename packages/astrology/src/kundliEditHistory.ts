import type { BirthDetails, KundliData, KundliEditHistoryEntry } from '@pridicta/types';

export type KundliEditHistoryMode = KundliEditHistoryEntry['mode'];
export type KundliEditHistorySource = KundliEditHistoryEntry['source'];

export function attachKundliEditHistory({
  after,
  before,
  mode,
  note,
  source,
}: {
  after: KundliData;
  before: KundliData;
  mode: KundliEditHistoryMode;
  note?: string;
  source: KundliEditHistorySource;
}): KundliData {
  const fieldsChanged = getChangedBirthDetailFields(
    before.birthDetails,
    after.birthDetails,
  );

  if (!fieldsChanged.length) {
    return {
      ...after,
      editHistory: before.editHistory,
    };
  }

  const entry: KundliEditHistoryEntry = {
    after: cloneBirthDetails(after.birthDetails),
    before: cloneBirthDetails(before.birthDetails),
    editedAt: new Date().toISOString(),
    fieldsChanged,
    id: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    mode,
    note,
    source,
  };

  return {
    ...after,
    editHistory: [entry, ...(before.editHistory ?? [])].slice(0, 25),
  };
}

export function getChangedBirthDetailFields(
  before: BirthDetails,
  after: BirthDetails,
): KundliEditHistoryEntry['fieldsChanged'] {
  const fields: KundliEditHistoryEntry['fieldsChanged'] = [];

  if (before.name !== after.name) {
    fields.push('name');
  }
  if (before.date !== after.date) {
    fields.push('date');
  }
  if (before.time !== after.time) {
    fields.push('time');
  }
  if (
    before.place !== after.place ||
    before.latitude !== after.latitude ||
    before.longitude !== after.longitude ||
    before.timezone !== after.timezone
  ) {
    fields.push('place');
  }

  return fields;
}

function cloneBirthDetails(details: BirthDetails): BirthDetails {
  return JSON.parse(JSON.stringify(details)) as BirthDetails;
}
