import firestore from '@react-native-firebase/firestore';

export function userDocument(userId: string) {
  return firestore().collection('users').doc(userId);
}

export function topLevelKundliDocument(kundliId: string) {
  return firestore().collection('kundlis').doc(kundliId);
}

export function kundlisCollection() {
  return firestore().collection('kundlis');
}

export function pdfDocument(pdfId: string) {
  return firestore().collection('pdfs').doc(pdfId);
}

export function analyticsDocument() {
  return firestore().collection('analyticsEvents').doc();
}

export function adminAuditLogsCollection() {
  return firestore().collection('adminAuditLogs');
}

export function adminAuditLogDocument(actionId: string) {
  return adminAuditLogsCollection().doc(actionId);
}

export function accessPassCodesCollection() {
  return firestore().collection('accessPassCodes');
}

export function accessPassCodeDocument(codeId: string) {
  return accessPassCodesCollection().doc(codeId);
}

export const serverTimestamp = firestore.FieldValue.serverTimestamp;
