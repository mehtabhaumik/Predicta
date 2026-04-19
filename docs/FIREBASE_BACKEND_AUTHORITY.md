# Firebase Rules And Backend Authority

Predicta uses one Firebase project for mobile and web so the same user identity, kundli records, saved reports, usage state, and access state can work across platforms.

## Authority Model

Client apps may own and sync user-created content:

- kundlis explicitly saved to cloud
- PDF metadata and uploaded PDFs
- daily and weekly intelligence cache records
- life events and life timeline insights
- journal entries and journal insights explicitly synced
- compatibility reports
- non-authoritative usage preferences

Backend/admin authority is required for:

- admin access grants
- full-access grants
- pass-code creation
- pass-code revocation
- new pass-code redemption
- subscription entitlement verification
- one-time purchase verification
- immutable audit logs

The client can cache successful access state for offline use, but production authority must come from Firebase custom claims, backend validation, or trusted server writes.

## Firestore Rules

`firestore.rules` enforces:

- signed-in ownership for user-owned documents.
- owner-only reads/writes for `kundlis`, `pdfs`, `dailyIntelligence`, `weeklyIntelligence`, `lifeEvents`, `lifeTimelineInsights`, `journalEntries`, `journalInsights`, and `compatibilityReports`.
- owner-only reads and safe preference/usage writes for `users/{userId}`.
- admin-only reads/writes for `accessPassCodes`.
- append-only admin audit logs.
- admin-only reads for analytics.
- deny-by-default fallback.

Admin authorization uses the Firebase custom claim:

```json
{
  "admin": true
}
```

Do not rely on client-side admin whitelists for production authorization.

## Storage Rules

`storage.rules` allows authenticated users to manage only:

```text
users/{userId}/pdfs/{pdfId}.pdf
```

PDF uploads are limited to files ending in `.pdf` and under 20 MB.

## Required Backend Work

Before public production, implement trusted server endpoints or callable functions for:

1. Setting admin/full-access custom claims.
2. Creating email-bound guest pass codes.
3. Redeeming guest pass codes in a transaction.
4. Revoking guest pass codes.
5. Validating Play Store and App Store purchases.
6. Writing immutable admin audit records.
7. Writing server-authoritative subscription and one-time entitlement state.

## Current Client Impact

Some existing client-side helper methods intentionally remain for development and UI readiness. With production rules deployed:

- direct client guest pass creation/revocation will require admin custom claims.
- direct client pass redemption should move to a callable/server endpoint.
- direct client subscription writes should move behind receipt validation.
- anonymous analytics writes will be ignored unless the user is signed in.

This is intentional for production safety.
