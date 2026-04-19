export const firebaseCollections = {
  accessPassCodes: 'accessPassCodes',
  adminAuditLogs: 'adminAuditLogs',
  analyticsEvents: 'analyticsEvents',
  compatibilityReports: 'compatibilityReports',
  dailyIntelligence: 'dailyIntelligence',
  journalEntries: 'journalEntries',
  journalInsights: 'journalInsights',
  kundlis: 'kundlis',
  lifeEvents: 'lifeEvents',
  lifeTimelineInsights: 'lifeTimelineInsights',
  pdfs: 'pdfs',
  users: 'users',
  weeklyIntelligence: 'weeklyIntelligence',
} as const;

export function userPath(userId: string): string {
  return `${firebaseCollections.users}/${userId}`;
}

export function kundliPath(kundliId: string): string {
  return `${firebaseCollections.kundlis}/${kundliId}`;
}

export function dailyIntelligencePath(kundliId: string, dateKey: string): string {
  return `${firebaseCollections.dailyIntelligence}/${kundliId}_${dateKey}`;
}

export function weeklyIntelligencePath(kundliId: string, weekKey: string): string {
  return `${firebaseCollections.weeklyIntelligence}/${kundliId}_${weekKey}`;
}

export function lifeEventPath(eventId: string): string {
  return `${firebaseCollections.lifeEvents}/${eventId}`;
}

export function lifeTimelineInsightPath(kundliId: string): string {
  return `${firebaseCollections.lifeTimelineInsights}/${kundliId}`;
}

export function journalEntryPath(entryId: string): string {
  return `${firebaseCollections.journalEntries}/${entryId}`;
}

export function journalInsightPath(kundliId: string, monthKey: string): string {
  return `${firebaseCollections.journalInsights}/${kundliId}_${monthKey}`;
}

export function compatibilityReportPath(pairKey: string): string {
  return `${firebaseCollections.compatibilityReports}/${pairKey}`;
}

export function passCodePath(codeId: string): string {
  return `${firebaseCollections.accessPassCodes}/${codeId}`;
}

export function adminAuditLogPath(actionId: string): string {
  return `${firebaseCollections.adminAuditLogs}/${actionId}`;
}

export * from './backendAuthorityClient';
