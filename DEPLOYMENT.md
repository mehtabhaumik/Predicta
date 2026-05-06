# Predicta Deployment Notes

Predicta web now uses Next.js API routes for AI, Kundli generation, access
authority, guest-pass redemption, and admin guest-pass operations. Deploy it to
Firebase App Hosting so the Next.js server runtime stays available in
production.

Static Firebase Hosting with `next export` is no longer sufficient because API
routes would be missing in production. The current App Hosting runtime config is
checked in at `apps/web/apphosting.yaml`, and the local-source App Hosting
target is registered in `firebase.json` as `predicta-web`.

## Required Runtime Environment

Set these on the backend/API runtime:

```bash
OPENAI_API_KEY=...
GEMINI_API_KEY=...
PRIDICTA_OPENAI_FREE_MODEL=gpt-5.4-mini
PRIDICTA_OPENAI_PREMIUM_MODEL=gpt-5.5
PRIDICTA_GEMINI_FREE_MODEL=gemini-2.5-flash
PRIDICTA_GEMINI_PREMIUM_MODEL=gemini-2.5-pro
PRIDICTA_GEMINI_FREE_THINKING_BUDGET=0
PRIDICTA_GEMINI_PREMIUM_THINKING_BUDGET=512
PRIDICTA_ADMIN_API_TOKEN=...
PRIDICTA_ADMIN_EMAILS=admin@example.com
PRIDICTA_FULL_ACCESS_EMAILS=founder@example.com
```

OpenAI is the primary AI provider. Gemini is the server-side fallback when
OpenAI is unavailable or not configured.

In Google Secret Manager, the current project uses these secret names:

```text
PREDICTA_OPENAI_API_KEY
PREDICTA_GEMINI_API_KEY
```

The backend accepts either the standard names or the existing Predicta secret
names directly:

```text
OPENAI_API_KEY or PREDICTA_OPENAI_API_KEY
GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY, or PREDICTA_GEMINI_API_KEY
```

Set the Firebase public web variables on the web runtime when auth, Firestore,
Storage, or analytics are enabled:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Set the web server-side astrology API URL on the App Hosting runtime:

```bash
PRIDICTA_WEB_ASTRO_API_URL=https://predicta-backend-pxf7yw4soq-el.a.run.app
```

The launch App Hosting cost guardrails are:

```yaml
runConfig:
  minInstances: 0
  maxInstances: 10
  concurrency: 80
  cpu: 1
  memoryMiB: 512
```

## Local Production Build

Use Node 20+ or a current Node LTS:

```bash
corepack pnpm --filter @pridicta/web build
```
