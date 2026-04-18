# Pridicta Web

This is the first Next.js App Router shell for Pridicta web. It uses shared
packages for product logic and presents the mobile product capabilities in a
desktop-first dashboard layout.

Run from the repository root:

```sh
corepack pnpm --filter @pridicta/web dev
corepack pnpm --filter @pridicta/web build
```

The web app should use server routes or backend proxies for AI provider calls.
Do not expose raw pass codes, OpenAI keys, or Gemini keys to browser bundles.

Firebase web client config is centralized in `lib/firebase/config.ts` and can
be overridden with the `NEXT_PUBLIC_FIREBASE_*` values from the root
`.env.example`. These values point to the shared `predicta-a4758` Firebase
project so Android, iOS, and web can use the same Auth, Firestore, and Storage
resources.
