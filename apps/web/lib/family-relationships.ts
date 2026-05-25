'use client';

import { getNativeCopy } from '@pridicta/config';
import type {
  FamilyRelationshipColorToken,
  FamilyRelationshipLabel,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';

type FamilyRelationshipDefinition = {
  colorToken: FamilyRelationshipColorToken;
  labels: Record<SupportedLanguage, string>;
};

export const FAMILY_RELATIONSHIP_DEFINITIONS: Record<
  FamilyRelationshipLabel,
  FamilyRelationshipDefinition
> = {
  self: {
    colorToken: 'deep-gold',
    labels: { en: 'Self', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.bb64a0f542"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.8c3eedcda2") },
  },
  spouse: {
    colorToken: 'rose-pink',
    labels: { en: 'Spouse', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.319f26cb0a"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.fe51582aff") },
  },
  partner: {
    colorToken: 'rose-pink',
    labels: { en: 'Partner', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.8837ebf260"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.1e0a69e2ab") },
  },
  fiance: {
    colorToken: 'soft-peach',
    labels: { en: 'Fiance', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.52d171c113"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.8bcc7fd9fe") },
  },
  son: {
    colorToken: 'calm-teal',
    labels: { en: 'Son', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.9d1ada82ab"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.2eadada20b") },
  },
  daughter: {
    colorToken: 'soft-peach',
    labels: { en: 'Daughter', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.78ece2bd0d"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.76059c124b") },
  },
  mother: {
    colorToken: 'saffron',
    labels: { en: 'Mother', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.8637a130b8"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.d501f34acf") },
  },
  father: {
    colorToken: 'slate-blue',
    labels: { en: 'Father', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.7898283bd4"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.7ed4b48e6b") },
  },
  brother: {
    colorToken: 'gentle-green',
    labels: { en: 'Brother', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.431a779b03"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.a829bd389e") },
  },
  sister: {
    colorToken: 'sky-blue',
    labels: { en: 'Sister', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.a105e9ac83"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.d163ec2566") },
  },
  cousin: {
    colorToken: 'lavender-blue',
    labels: { en: 'Cousin', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.7a28dafbb0"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.f04bd4d78b") },
  },
  'maternal-aunt': {
    colorToken: 'mauve',
    labels: { en: 'Maternal Aunt', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.d3790369a9"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.4d3897d0a8") },
  },
  'paternal-aunt': {
    colorToken: 'mauve',
    labels: { en: 'Paternal Aunt', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.0d6687a270"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.cdcc30cd53") },
  },
  aunt: {
    colorToken: 'mauve',
    labels: { en: 'Aunt', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.667d919de2"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.ff17720a63") },
  },
  'maternal-uncle': {
    colorToken: 'sand',
    labels: { en: 'Maternal Uncle', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.8f7ef6000a"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.40f2b919e2") },
  },
  'paternal-uncle': {
    colorToken: 'sand',
    labels: { en: 'Paternal Uncle', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.97be29ff68"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.6af1244650") },
  },
  uncle: {
    colorToken: 'sand',
    labels: { en: 'Uncle', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.16974a1e73"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.aede849e2d") },
  },
  grandmother: {
    colorToken: 'soft-plum',
    labels: { en: 'Grandmother', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.b60430f4a9"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.7f7e6348ef") },
  },
  grandfather: {
    colorToken: 'deep-indigo',
    labels: { en: 'Grandfather', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.b69b98ff74"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.bd4faa8152") },
  },
  'mother-in-law': {
    colorToken: 'mauve',
    labels: { en: 'Mother-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.b89ab7f666"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.78d8f25b70") },
  },
  'father-in-law': {
    colorToken: 'sand',
    labels: { en: 'Father-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.7f415a0005"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.954cb631b1") },
  },
  'sister-in-law': {
    colorToken: 'soft-plum',
    labels: { en: 'Sister-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.3b36a1e9f0"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.eeb726d814") },
  },
  'brother-in-law': {
    colorToken: 'muted-steel',
    labels: { en: 'Brother-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.46c3927bfe"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.8793894b0a") },
  },
  'aunt-in-law': {
    colorToken: 'mauve',
    labels: { en: 'Aunt-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.93d5a3006d"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.31731eefff") },
  },
  'uncle-in-law': {
    colorToken: 'sand',
    labels: { en: 'Uncle-in-Law', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.0e054dea41"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.09efbebcea") },
  },
  niece: {
    colorToken: 'soft-peach',
    labels: { en: 'Niece', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.93080d1cd4"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.12e4f5de55") },
  },
  nephew: {
    colorToken: 'calm-teal',
    labels: { en: 'Nephew', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.89b1070f89"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.5bc223839a") },
  },
  friend: {
    colorToken: 'lavender-blue',
    labels: { en: 'Friend', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.740727fc5f"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.55e1390c02") },
  },
  'best-friend': {
    colorToken: 'sky-blue',
    labels: { en: 'Best Friend', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.2a6a547038"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.a1b7a4c96c") },
  },
  'co-worker': {
    colorToken: 'muted-steel',
    labels: { en: 'Co-worker', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.10eda161fe"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.937dd2006a") },
  },
  manager: {
    colorToken: 'deep-indigo',
    labels: { en: 'Manager', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.5d14c13bb7"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.42951580b4") },
  },
  'business-partner': {
    colorToken: 'sage',
    labels: { en: 'Business Partner', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.713b5c7904"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.71d0e188e5") },
  },
  mentor: {
    colorToken: 'deep-indigo',
    labels: { en: 'Mentor', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.106fb7e732"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.b3b9ca035c") },
  },
  student: {
    colorToken: 'warm-amber',
    labels: { en: 'Student', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.d786fb4e34"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.4b7a886f19") },
  },
  other: {
    colorToken: 'sage',
    labels: { en: 'Other', hi: getNativeCopy("native.apps.web.lib.family.relationships.ts.03d46de7bb"), gu: getNativeCopy("native.apps.web.lib.family.relationships.ts.24bec44d1e") },
  },
};

export const FAMILY_RELATIONSHIP_ORDER: FamilyRelationshipLabel[] = [
  'self',
  'spouse',
  'partner',
  'fiance',
  'son',
  'daughter',
  'mother',
  'father',
  'brother',
  'sister',
  'cousin',
  'maternal-aunt',
  'paternal-aunt',
  'aunt',
  'maternal-uncle',
  'paternal-uncle',
  'uncle',
  'grandmother',
  'grandfather',
  'mother-in-law',
  'father-in-law',
  'sister-in-law',
  'brother-in-law',
  'aunt-in-law',
  'uncle-in-law',
  'niece',
  'nephew',
  'friend',
  'best-friend',
  'co-worker',
  'manager',
  'business-partner',
  'mentor',
  'student',
  'other',
];

const FAMILY_RELATIONSHIP_PALETTE: Record<
  FamilyRelationshipColorToken,
  { background: string; border: string; text: string }
> = {
  'deep-gold': { background: 'rgba(217, 164, 65, 0.16)', border: 'rgba(217, 164, 65, 0.42)', text: '#f5d67b' },
  'rose-pink': { background: 'rgba(214, 121, 156, 0.16)', border: 'rgba(214, 121, 156, 0.42)', text: '#ffd6e6' },
  'soft-peach': { background: 'rgba(232, 169, 132, 0.16)', border: 'rgba(232, 169, 132, 0.42)', text: '#ffe2d0' },
  'calm-teal': { background: 'rgba(96, 180, 176, 0.16)', border: 'rgba(96, 180, 176, 0.42)', text: '#d3fffc' },
  saffron: { background: 'rgba(223, 151, 63, 0.16)', border: 'rgba(223, 151, 63, 0.42)', text: '#ffe1ab' },
  'slate-blue': { background: 'rgba(109, 136, 197, 0.16)', border: 'rgba(109, 136, 197, 0.42)', text: '#dce7ff' },
  'gentle-green': { background: 'rgba(118, 181, 120, 0.16)', border: 'rgba(118, 181, 120, 0.42)', text: '#ddffd8' },
  'sky-blue': { background: 'rgba(117, 177, 226, 0.16)', border: 'rgba(117, 177, 226, 0.42)', text: '#d9f1ff' },
  'lavender-blue': { background: 'rgba(136, 145, 224, 0.16)', border: 'rgba(136, 145, 224, 0.42)', text: '#e1e6ff' },
  'muted-steel': { background: 'rgba(123, 140, 156, 0.16)', border: 'rgba(123, 140, 156, 0.42)', text: '#d9e0e7' },
  mauve: { background: 'rgba(167, 125, 180, 0.16)', border: 'rgba(167, 125, 180, 0.42)', text: '#eedcff' },
  sand: { background: 'rgba(178, 153, 117, 0.16)', border: 'rgba(178, 153, 117, 0.42)', text: '#f2e4c8' },
  'deep-indigo': { background: 'rgba(82, 92, 178, 0.16)', border: 'rgba(82, 92, 178, 0.42)', text: '#d8ddff' },
  'soft-plum': { background: 'rgba(157, 124, 170, 0.16)', border: 'rgba(157, 124, 170, 0.42)', text: '#efdfff' },
  sage: { background: 'rgba(125, 162, 125, 0.16)', border: 'rgba(125, 162, 125, 0.42)', text: '#dff4de' },
  'warm-amber': { background: 'rgba(198, 145, 76, 0.16)', border: 'rgba(198, 145, 76, 0.42)', text: '#ffe1b9' },
};

export function getFamilyRelationshipLabel(
  relationship: FamilyRelationshipLabel,
  language: SupportedLanguage,
): string {
  const definition = FAMILY_RELATIONSHIP_DEFINITIONS[relationship];
  return definition?.labels[language] ?? definition?.labels.en ?? relationship;
}

export function getFamilyRelationshipColorToken(
  relationship: FamilyRelationshipLabel,
): FamilyRelationshipColorToken {
  return FAMILY_RELATIONSHIP_DEFINITIONS[relationship]?.colorToken ?? 'sage';
}

export function getFamilyRelationshipPalette(
  token: FamilyRelationshipColorToken,
): { background: string; border: string; text: string } {
  return FAMILY_RELATIONSHIP_PALETTE[token];
}

export function buildFamilyProfileMetadata(
  relationship: FamilyRelationshipLabel,
  isOwnerProfile: boolean,
): Pick<
  KundliData,
  | 'familyVaultEligible'
  | 'isOwnerProfile'
  | 'relationshipColorToken'
  | 'relationshipDisplayLabel'
  | 'relationshipToOwner'
> {
  return {
    familyVaultEligible: true,
    isOwnerProfile,
    relationshipColorToken: getFamilyRelationshipColorToken(relationship),
    relationshipDisplayLabel: FAMILY_RELATIONSHIP_DEFINITIONS[relationship].labels.en,
    relationshipToOwner: relationship,
  };
}
