'use client';

import type { CSSProperties } from 'react';
import type { FamilyRelationshipLabel, SupportedLanguage } from '@pridicta/types';
import {
  getFamilyRelationshipColorToken,
  getFamilyRelationshipLabel,
  getFamilyRelationshipPalette,
} from '../lib/family-relationships';

export function FamilyRelationshipBadge({
  language,
  relationship,
}: {
  language: SupportedLanguage;
  relationship: FamilyRelationshipLabel;
}): React.JSX.Element {
  const token = getFamilyRelationshipColorToken(relationship);
  const palette = getFamilyRelationshipPalette(token);
  const style = {
    '--relationship-badge-background': palette.background,
    '--relationship-badge-border': palette.border,
    '--relationship-badge-text': palette.text,
  } as CSSProperties;

  return (
    <span className="family-relationship-badge" style={style}>
      {getFamilyRelationshipLabel(relationship, language)}
    </span>
  );
}
