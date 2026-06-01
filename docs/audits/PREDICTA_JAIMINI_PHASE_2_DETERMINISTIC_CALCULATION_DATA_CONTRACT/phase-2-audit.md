# PREDICTA_JAIMINI_PHASE_2_DETERMINISTIC_CALCULATION_DATA_CONTRACT

Status: GREEN

Date: 2026-06-01

## Scope

This phase builds the shared deterministic Jaimini data contract. It does not
write final user-facing Jaimini predictions and it does not unlock Jaimini PDF
generation. Those are later phases.

The contract is intentionally calculation-first:

- AI must not calculate Jaimini.
- AI may only explain calculated Jaimini data.
- incomplete evidence must return `pending` or `partial`, not invented output.

## Implemented Contract

Shared exported function:

```ts
composeJaiminiPlan(kundli, { asOfDate })
```

Shared contract fields:

- `jaiminiPlan`
- `charaKarakas`
- `atmakaraka`
- `amatyakaraka`
- `darakaraka`
- `karakamsha`
- `swamsa`
- `arudhaLagna`
- `upapadaLagna`
- `jaiminiAspects`
- `charaDashaTimeline`
- `currentCharaDasha`
- `freeInsight`
- `premiumInsight`
- `calculationStatus`
- `evidenceWarnings`

Type coverage:

- added shared `JaiminiPlan` and related types in `@pridicta/types`.
- mirrored mobile Jaimini types in native app types.
- added optional `jaiminiPlan?: JaiminiPlan` to `KundliData`.
- added `@pridicta/astrology` export for `composeJaiminiPlan`.

## Calculation Notes

Implemented deterministic Jaimini evidence:

- seven-graha Chara Karaka order:
  - Atmakaraka
  - Amatyakaraka
  - Bhratrikaraka
  - Matrikaraka
  - Putrakaraka
  - Gnatikaraka
  - Darakaraka
- Atmakaraka sign, house, degree, nakshatra, pada, dignity, retrograde, and
  chart context.
- Karakamsha and Swamsa references using existing verified Navamsa evidence.
- Arudha Lagna and Upapada Lagna using source-house lord distance with the
  source/seventh exception handled.
- Jaimini sign aspects for movable, fixed, and dual signs.
- baseline Chara Dasha timeline and current chapter.

The Chara Dasha timeline is explicitly variant-labeled in each period:

```text
Phase 2 baseline Chara Dasha: Lagna-sign sequence with sign-lord distance years; later variant audits may refine sub-periods.
```

This prevents later report/chat phases from overstating the timing layer before
the interpretation/report phases audit the exact variant language.

## App Consumption

- Web Jaimini room now calls `composeJaiminiPlan(activeKundli)` and displays
  calculated/pending Atmakaraka, Arudha, and Chara Dasha values.
- Mobile Jaimini room now calls `composeJaiminiPlan(kundli)` and passes the
  calculated summary into the chat handoff context.
- Jaimini report generation remains guarded until the report phase unlocks it.

## Deterministic Fixture Gate

Passed:

```sh
corepack pnpm test:jaimini-phase-2
```

Result:

```text
Jaimini Phase 2 gate passed: deterministic contract, three distinct fixtures, no Nadi calculation reuse.
```

Fixture proof:

- `fixture-results.json`

The gate proves:

- three sample Kundlis produce distinct Jaimini evidence keys.
- three sample Kundlis produce distinct Chara Dasha timelines.
- Chara Karaka role order is stable.
- Atmakaraka, Amatyakaraka, Darakaraka are present.
- Karakamsha, Swamsa, Arudha Lagna, Upapada Lagna are ready for complete
  fixtures.
- Jaimini sign aspects exist for all 12 signs.
- current Chara Dasha resolves for each fixture.
- Jaimini source does not import or reuse `nadiJyotishPlan`.

## Verification Commands

Passed:

- `corepack pnpm --filter @pridicta/types typecheck`
- `corepack pnpm --filter @pridicta/config typecheck`
- `corepack pnpm --filter @pridicta/astrology typecheck`
- `corepack pnpm --filter @pridicta/pdf typecheck`
- `corepack pnpm --filter @pridicta/web typecheck`
- `corepack pnpm --filter @pridicta/mobile typecheck`
- `corepack pnpm test:jaimini-phase-2`
- `corepack pnpm build:web`
- `corepack pnpm test:audit-server-preflight`
- `PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3009 PREDICTA_VISUAL_OUTPUT_DIR=/Users/bmehta/Downloads/Predicta/docs/audits/PREDICTA_JAIMINI_PHASE_2_DETERMINISTIC_CALCULATION_DATA_CONTRACT/screenshots corepack pnpm test:visual-proof`
- `git diff --check`

## Visual Runtime Proof

Visual proof captured 33 route and viewport screenshots.

Result:

- 0 clipped text findings.
- 0 horizontal overflow findings.
- 0 wide element findings.

Key screenshots:

- `screenshots/desktop-dashboard-jaimini.png`
- `screenshots/tablet-dashboard-jaimini.png`
- `screenshots/mobile-dashboard-jaimini.png`

Manual review:

- Jaimini page renders the deterministic pending state honestly when no Kundli
  is active.
- Jaimini pillars now read from the shared contract instead of static labels.
- Mobile stacking remains safe.

## Green Decision

Phase 2 is green because the deterministic Jaimini data contract exists, is
typed across shared/web/mobile/PDF surfaces, executes against three distinct
fixtures, produces distinct Jaimini outputs, avoids Nadi calculation reuse, and
renders safely in the rebuilt app.
