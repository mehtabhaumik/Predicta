# Predicta Release Hardening

This checklist keeps mobile, web, Firebase, monetization, guest access, and AI cost controls aligned before any release or deploy.

## Release Gate

Run the standard release gate before deploy:

```sh
corepack pnpm release:check
```

Run the full native gate before a mobile build handoff:

```sh
corepack pnpm release:check:full
```

The gate refuses to run when mock-only release blockers are enabled:

- `PRIDICTA_ENABLE_MOCK_BILLING=true`
- `PRIDICTA_ENABLE_MOCK_AI=true`

## Required Checks

The standard release gate runs:

- workspace typecheck
- workspace lint
- workspace tests
- web production build
- Android JavaScript bundle

The full release gate also runs:

- Android debug build

## Firebase And Web Deploy

Before Firebase Hosting deploy:

1. Confirm `.firebaserc` points to the intended project.
2. Confirm `firebase.json` serves `apps/web/out`.
3. Confirm `firestore.rules` and `storage.rules` are reviewed.
4. Run `corepack pnpm --filter @pridicta/web build`.
5. Deploy only after the build succeeds.

Firebase web config under `NEXT_PUBLIC_FIREBASE_*` is public client config. Server-only secrets must never use the `NEXT_PUBLIC_` prefix.

See [`FIREBASE_BACKEND_AUTHORITY.md`](./FIREBASE_BACKEND_AUTHORITY.md) for the production authority model.

## Privacy And Secrets

Never release with:

- OpenAI or Gemini keys bundled into browser code.
- raw guest pass codes committed to source.
- raw chat text in analytics.
- raw birth details in analytics.
- full kundli payloads in analytics.
- automatic kundli cloud upload after login.

Guest pass redemption must remain Firebase/server-authoritative for new redemptions. Local state is only a cache after successful redemption.

## Monetization

Before release, confirm:

- mock billing is disabled for production.
- paid products are not granted after failed or canceled purchases.
- cached AI responses do not consume quota.
- failed AI/PDF calls do not consume quota.
- admin and full-access whitelists do not expose admin tools to non-admin users.
- one-time credits survive alongside Premium subscriptions.

## Web

Verify:

- `/`
- `/pricing`
- `/dashboard`
- `/dashboard/chat`
- `/dashboard/kundli`
- `/dashboard/charts`
- `/dashboard/report`
- `/dashboard/saved-kundlis`
- `/dashboard/settings`
- `/dashboard/redeem-pass`
- `/dashboard/admin`

Do not expose provider API keys to browser bundles.

## Mobile

Verify:

- app launch
- login screen
- settings screen
- kundli creation flow
- chat flow
- report generation flow
- paywall flow
- redeem pass flow
- admin access visibility

If emulator verification is attempted, report the exact `adb devices` state when blocked.

## Known Pre-Release Production Dependencies

These are not blockers for local verification, but they are blockers for real store/public production:

- real billing provider and receipt validation backend
- production AI proxy/server-side provider key handling
- production Firebase security rules review
- production guest pass creation UI backed by server authority
- production Swiss Ephemeris backend URL and uptime monitoring
