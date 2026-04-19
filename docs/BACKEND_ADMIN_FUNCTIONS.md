# Backend Admin Functions

Predicta now has a backend authority layer for sensitive admin, guest access, and billing-adjacent operations. The mobile and web apps may display admin tools, but production writes must be authorized by Firebase ID tokens and server-side checks.

## Backend Surface

The existing FastAPI backend exposes these authority routes:

```text
POST /admin/access-grants
POST /admin/pass-codes
GET  /admin/pass-codes
POST /admin/pass-codes/{codeId}/revoke
POST /access/pass-codes/redeem
POST /billing/verify
```

`/billing/verify` intentionally returns `501` until Play Store and App Store receipt verification credentials are configured. Client-only Premium state must not become production authority.

## Firebase Admin Credentials

Set one of these on the backend runtime:

```text
FIREBASE_SERVICE_ACCOUNT_JSON
GOOGLE_APPLICATION_CREDENTIALS
```

`FIREBASE_SERVICE_ACCOUNT_JSON` should contain the full service-account JSON string. Never expose it through `NEXT_PUBLIC_*`, React Native env files, browser bundles, mobile bundles, screenshots, logs, or analytics.

## Client Wiring

Mobile and web clients call the same backend authority routes with a Firebase ID token:

```text
Authorization: Bearer <firebase-id-token>
```

Use these URLs:

```text
PRIDICTA_BACKEND_AUTHORITY_URL     # mobile/backend runtime
NEXT_PUBLIC_PRIDICTA_BACKEND_URL   # web browser runtime
```

Because the current web app is statically exported, it calls the backend directly from the browser. The backend therefore enables CORS only for configured origins:

```text
PREDICTA_ALLOWED_ORIGINS
```

## Bootstrap Admins

Use `PREDICTA_BOOTSTRAP_ADMIN_EMAILS` only for first-time setup or emergency recovery. After custom claims are set, backend admin access should rely on Firebase custom claims:

```json
{
  "admin": true,
  "fullAccess": true
}
```

Full-access users should receive:

```json
{
  "admin": false,
  "fullAccess": true
}
```

## Guest Pass Security

Guest pass creation stores only:

- `codeHash`
- pass metadata
- allowed email list, if restricted
- usage limits
- redemption counts
- device IDs

Raw pass codes are returned only once from the create endpoint response. They are never stored in Firestore by the backend.

Redemption is Firebase-authenticated and validates:

- pass exists by hash
- active status
- expiry
- max redemptions
- allowed email
- user has not already redeemed it
- device limit

Restricted/private pass failures use generic copy so the app does not reveal whether a private code exists.

## Firestore Collections

The backend writes:

```text
accessPassCodes/{codeId}
adminAuditLogs/{actionId}
users/{userId}.access
users/{userId}.guestPassUsage
```

`firestore.rules` keeps `accessPassCodes` and `adminAuditLogs` admin-only. Client apps should call backend endpoints for new pass redemption instead of writing these records directly.

## Production Gaps To Close

Before a public paid release:

1. Deploy this backend to a trusted runtime.
2. Configure Firebase Admin credentials on the runtime.
3. Wire web and mobile admin screens to the backend endpoints.
4. Move purchase entitlement writes behind `/billing/verify` after real Play/App Store validation is implemented.
5. Add backend rate limiting at the edge for redemption and admin mutation routes.
6. Monitor audit logs and failed redemption rates.
