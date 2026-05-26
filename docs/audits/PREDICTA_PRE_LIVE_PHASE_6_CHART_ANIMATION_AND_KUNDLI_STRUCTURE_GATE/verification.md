# PREDICTA_PRE_LIVE_PHASE_6_CHART_ANIMATION_AND_KUNDLI_STRUCTURE_GATE

Status: GREEN

Date: 2026-05-26

## Scope

- Restored the protected North Indian Kundli interaction contract expected by animation, buyer, and chart gates.
- Kept the newer chart-safe label layer, SVG state map, Vedic focus order, full Varga selector, and degree-preserving chart rendering intact.
- Fixed chat chart intent routing so explicit chart requests with explanation, such as career/D10 chart questions, render deterministic chart blocks instead of depending on an AI-only response.

## Changed Paths

- `apps/web/components/WebKundliChart.tsx`
- `apps/web/app/globals.css`
- `packages/astrology/src/chatChartBlocks.ts`

## Strict Audit Results

- `corepack pnpm --filter @pridicta/web typecheck`: PASS
- `corepack pnpm build:web`: PASS
- `corepack pnpm test:charts`: PASS
- `corepack pnpm test:chart-insight-phase-8`: PASS
- `corepack pnpm test:animation-regression`: PASS
  - Result: `Animation regression gate passed: 24 live checks plus 7 source contracts.`
- `PREDICTA_LABEL_BASE_URL=http://127.0.0.1:3009 PREDICTA_LABEL_OUTPUT_DIR=/Users/bmehta/Downloads/Predicta/docs/audits/PREDICTA_PRE_LIVE_PHASE_6_CHART_ANIMATION_AND_KUNDLI_STRUCTURE_GATE/chart-containment-screenshots corepack pnpm exec node scripts/run-kundli-label-containment-check.mjs`: PASS
  - Result: `Kundli label containment check passed: 10 surface and viewport checks.`
- `PREDICTA_VISUAL_BASE_URL=http://127.0.0.1:3009 PREDICTA_VISUAL_OUTPUT_DIR=/Users/bmehta/Downloads/Predicta/docs/audits/PREDICTA_PRE_LIVE_PHASE_6_CHART_ANIMATION_AND_KUNDLI_STRUCTURE_GATE/screenshots corepack pnpm test:visual-proof`: PASS
  - Result: `Mobile/tablet visual proof gate passed: 33 route and viewport checks.`
- `corepack pnpm test:buyer-rejection`: PASS
  - Result: `End-to-end buyer rejection test passed: 51 live route checks plus source and link gates.`
- `git diff --check`: PASS

## Artifact Evidence

- Chart containment screenshots:
  - `chart-containment-screenshots/desktop-main-kundli.png`
  - `chart-containment-screenshots/mobile-main-kundli.png`
  - `chart-containment-screenshots/desktop-charts-explorer.png`
  - `chart-containment-screenshots/mobile-charts-explorer.png`
  - `chart-containment-screenshots/desktop-predicta-chat-chart.png`
  - `chart-containment-screenshots/mobile-predicta-chat-chart.png`
- General route screenshots:
  - `screenshots/desktop-dashboard-charts.png`
  - `screenshots/tablet-dashboard-charts.png`
  - `screenshots/mobile-dashboard-charts.png`

## Green Criteria Notes

- Protected `.north-house` buttons are restored as real controls.
- The SVG `.north-house-state-map` remains the non-interactive hover/selected state layer.
- Planet/sign labels remain in `.north-house-label` so chart text remains readable and containment-safe.
- Vedic focus order remains visible: D1, Moon, D9, D10, Chalit.
- Full Varga library remains selectable in the chart explorer and was not removed.
- Degree labels remain protected by the chart stress suite, including compact and stacked house cases.
