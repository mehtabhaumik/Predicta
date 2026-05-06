# Predicta Deployment Notes

Predicta web now uses Next.js API routes for AI, Kundli generation, access
authority, guest-pass redemption, and admin guest-pass operations. Deploy it to
a serverful Next.js target such as Vercel, Cloud Run, or Firebase App Hosting.

Static Firebase Hosting with `next export` is no longer sufficient because API
routes would be missing in production.

## Required Runtime Environment

Set these on the backend/API runtime:

```bash
PRIDICTA_WEB_ASTRO_API_URL=https://your-astro-api.example.com
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

Map them into the runtime environment as:

```text
PREDICTA_OPENAI_API_KEY -> OPENAI_API_KEY
PREDICTA_GEMINI_API_KEY -> GEMINI_API_KEY
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

## Local Production Build

Use Node 20+ or a current Node LTS:

```bash
corepack pnpm --filter @pridicta/web build
```
