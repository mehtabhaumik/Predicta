import nativeCopyTranslations from './translations/nativeCopy.json';

type NativeCopyTextEntry = {
  kind: 'text';
  value: string;
};

type NativeCopyTemplateEntry = {
  kind: 'template';
  parts: string[];
};

type NativeCopyEntry = NativeCopyTextEntry | NativeCopyTemplateEntry;

const NATIVE_COPY_ENTRIES = nativeCopyTranslations.entries as Record<
  string,
  NativeCopyEntry
>;

export function getNativeCopy(key: string): string {
  const entry = NATIVE_COPY_ENTRIES[key];

  if (!entry || entry.kind !== 'text') {
    return key;
  }

  return entry.value;
}

export function formatNativeCopy(
  key: string,
  values: unknown[],
): string {
  const entry = NATIVE_COPY_ENTRIES[key];

  if (!entry || entry.kind !== 'template') {
    return key;
  }

  return entry.parts.reduce((copy, part, index) => {
    const value = values[index];
    return `${copy}${part}${value == null ? '' : String(value)}`;
  }, '');
}
