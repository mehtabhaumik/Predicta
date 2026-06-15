# PREDICTA_REVIVAL_V2_PHASE_5_KUNDLI_CHART_RENDERING_CONTAINMENT_LOCK

## Verdict

GREEN.

## Locked Behavior

- Web chart labels consume shared safe label boxes instead of broad static CSS widths.
- Chat, saved Kundli, landing, report preview, and main chart surfaces do not render +n overflow counters.
- Mobile chart cells hide/wrap within their own cell boundary and truncate individual chips safely.
- PDF chart snapshots force all report planets visible and use polygon-aware placement.
- The chart stress suite verifies full label rectangles stay inside their North Indian houses.

## Chart Stress Evidence

```text
> pridicta-monorepo@0.1.0 test:charts /Users/bmehta/Downloads/Predicta
> pnpm --filter @pridicta/astrology stress:charts


> @pridicta/astrology@0.1.0 stress:charts /Users/bmehta/Downloads/Predicta/packages/astrology
> node ../../scripts/run-chart-stress-suite.mjs

PASS north Indian line geometry has no center cross
PASS house hit map resolves every house center
PASS Bhaumik D1 planets stay in expected houses
PASS Bhaumik D1 signs stay in expected houses
PASS major chart surfaces keep three-planet compact houses visible
PASS full chart surfaces preserve degree labels even in compact and stacked houses
PASS report charts never hide core planets behind overflow counters
PASS default Vedic D1 hides outer and subtle supporting points
PASS full Vedic D1 can still expose supporting points when asked
PASS Chalit renderer respects explicit house delivery
PASS 7 planets stay bounded in tight house 2
PASS 7 planets stay bounded in tight house 6
PASS 7 planets stay bounded in tight house 8
PASS 7 planets stay bounded in tight house 11
PASS 7 planets stay bounded in tight house 12
Chart stress suite passed: 15 cases.
```