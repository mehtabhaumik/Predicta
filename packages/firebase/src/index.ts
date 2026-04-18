export const firebaseCollections = {
  accessPassCodes: 'accessPassCodes',
  analyticsEvents: 'analyticsEvents',
  kundlis: 'kundlis',
  pdfs: 'pdfs',
  users: 'users',
} as const;

export function userPath(userId: string): string {
  return `${firebaseCollections.users}/${userId}`;
}

export function kundliPath(kundliId: string): string {
  return `${firebaseCollections.kundlis}/${kundliId}`;
}

export function passCodePath(codeId: string): string {
  return `${firebaseCollections.accessPassCodes}/${codeId}`;
}
