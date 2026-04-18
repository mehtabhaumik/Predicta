# Pridicta Mobile

This is the existing React Native CLI TypeScript app moved into the monorepo.
It preserves the mobile navigation, dark glow UI, security flow, Firebase
adapters, Swiss Ephemeris client, AI flow, PDF generation, saved kundlis,
monetization, and guest pass behavior.

Run from the repository root:

```sh
corepack pnpm --filter @pridicta/mobile start
corepack pnpm --filter @pridicta/mobile android
corepack pnpm --filter @pridicta/mobile exec jest --runInBand
```
