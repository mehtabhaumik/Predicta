'use client';

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
    labels: { en: 'Self', hi: 'स्वयं', gu: 'પોતે' },
  },
  spouse: {
    colorToken: 'rose-pink',
    labels: { en: 'Spouse', hi: 'पति / पत्नी', gu: 'પતિ / પત્ની' },
  },
  partner: {
    colorToken: 'rose-pink',
    labels: { en: 'Partner', hi: 'साथी', gu: 'જીવનસાથી' },
  },
  fiance: {
    colorToken: 'soft-peach',
    labels: { en: 'Fiance', hi: 'मंगेतर', gu: 'મંગેતર' },
  },
  son: {
    colorToken: 'calm-teal',
    labels: { en: 'Son', hi: 'पुत्र', gu: 'પુત્ર' },
  },
  daughter: {
    colorToken: 'soft-peach',
    labels: { en: 'Daughter', hi: 'पुत्री', gu: 'પુત્રી' },
  },
  mother: {
    colorToken: 'saffron',
    labels: { en: 'Mother', hi: 'मां', gu: 'મા' },
  },
  father: {
    colorToken: 'slate-blue',
    labels: { en: 'Father', hi: 'पिता', gu: 'પિતા' },
  },
  brother: {
    colorToken: 'gentle-green',
    labels: { en: 'Brother', hi: 'भाई', gu: 'ભાઈ' },
  },
  sister: {
    colorToken: 'sky-blue',
    labels: { en: 'Sister', hi: 'बहन', gu: 'બહેન' },
  },
  cousin: {
    colorToken: 'lavender-blue',
    labels: { en: 'Cousin', hi: 'कजिन', gu: 'કઝિન' },
  },
  'maternal-aunt': {
    colorToken: 'mauve',
    labels: { en: 'Maternal Aunt', hi: 'मौसी', gu: 'માસી' },
  },
  'paternal-aunt': {
    colorToken: 'mauve',
    labels: { en: 'Paternal Aunt', hi: 'बुआ', gu: 'ફોઈ' },
  },
  aunt: {
    colorToken: 'mauve',
    labels: { en: 'Aunt', hi: 'आंटी / बुआ', gu: 'ફાઈ / આંટિ' },
  },
  'maternal-uncle': {
    colorToken: 'sand',
    labels: { en: 'Maternal Uncle', hi: 'मामा', gu: 'મામા' },
  },
  'paternal-uncle': {
    colorToken: 'sand',
    labels: { en: 'Paternal Uncle', hi: 'चाचा / ताऊ', gu: 'કાકા' },
  },
  uncle: {
    colorToken: 'sand',
    labels: { en: 'Uncle', hi: 'अंकल / चाचा', gu: 'કાકા / અંકલ' },
  },
  grandmother: {
    colorToken: 'soft-plum',
    labels: { en: 'Grandmother', hi: 'दादी / नानी', gu: 'દાદી / નાની' },
  },
  grandfather: {
    colorToken: 'deep-indigo',
    labels: { en: 'Grandfather', hi: 'दादा / नाना', gu: 'દાદા / નાના' },
  },
  'mother-in-law': {
    colorToken: 'mauve',
    labels: { en: 'Mother-in-Law', hi: 'सास', gu: 'સાસુ' },
  },
  'father-in-law': {
    colorToken: 'sand',
    labels: { en: 'Father-in-Law', hi: 'ससुर', gu: 'સસરા' },
  },
  'sister-in-law': {
    colorToken: 'soft-plum',
    labels: { en: 'Sister-in-Law', hi: 'ननद / भाभी', gu: 'નણંદ / ભાભી' },
  },
  'brother-in-law': {
    colorToken: 'muted-steel',
    labels: { en: 'Brother-in-Law', hi: 'देवर / जीजा', gu: 'દીર / જીજાજી' },
  },
  'aunt-in-law': {
    colorToken: 'mauve',
    labels: { en: 'Aunt-in-Law', hi: 'ससुराल की आंटी', gu: 'સસરિયાવાળી આંટિ' },
  },
  'uncle-in-law': {
    colorToken: 'sand',
    labels: { en: 'Uncle-in-Law', hi: 'ससुराल के अंकल', gu: 'સસરિયાવાળા અંકલ' },
  },
  niece: {
    colorToken: 'soft-peach',
    labels: { en: 'Niece', hi: 'भतीजी / भांजी', gu: 'ભત્રીજી / ભાણજી' },
  },
  nephew: {
    colorToken: 'calm-teal',
    labels: { en: 'Nephew', hi: 'भतीजा / भांजा', gu: 'ભત્રીજો / ભાણેજ' },
  },
  friend: {
    colorToken: 'lavender-blue',
    labels: { en: 'Friend', hi: 'मित्र', gu: 'મિત્ર' },
  },
  'best-friend': {
    colorToken: 'sky-blue',
    labels: { en: 'Best Friend', hi: 'सबसे करीबी मित्र', gu: 'સૌથી નજીકનો મિત્ર' },
  },
  'co-worker': {
    colorToken: 'muted-steel',
    labels: { en: 'Co-worker', hi: 'सहकर्मी', gu: 'સહકર્મી' },
  },
  manager: {
    colorToken: 'deep-indigo',
    labels: { en: 'Manager', hi: 'प्रबंधक', gu: 'મેનેજર' },
  },
  'business-partner': {
    colorToken: 'sage',
    labels: { en: 'Business Partner', hi: 'व्यावसायिक साथी', gu: 'વ્યવસાય ભાગીદાર' },
  },
  mentor: {
    colorToken: 'deep-indigo',
    labels: { en: 'Mentor', hi: 'मार्गदर्शक', gu: 'માર્ગદર્શક' },
  },
  student: {
    colorToken: 'warm-amber',
    labels: { en: 'Student', hi: 'विद्यार्थी', gu: 'વિદ્યાર્થી' },
  },
  other: {
    colorToken: 'sage',
    labels: { en: 'Other', hi: 'अन्य', gu: 'અન્ય' },
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
