# Source Matrix

## Purpose

This matrix locks the initial research sources and decides what Predicta adopts
or rejects before implementation. It is not a rule implementation file.

## Required Source Lock

| Source | URL | What Predicta Adopts | What Predicta Rejects |
|---|---|---|---|
| Sanatan Jyoti Dosh Report | https://www.sanatanjyoti.com/kundli/dosha-report | Dosh reports are expected to identify chart afflictions, explain effects, and suggest remedies. Predicta should preserve coverage breadth but require evidence, status, strength, activation, and cancellation/reduction notes. | Fear-heavy phrasing, sales pressure, vague obstacle language without precise chart proof. |
| OmAstrology Yog Analysis | https://www.omastrology.com/astrology-report/astrology-yoga-analysis/ | Yog analysis should list applicable Yogs, their strength, fructification/activation period, and remedies. | Treating Yog as a paid teaching product instead of a direct prediction/guidance product. |
| ShreeKundli Yog Guide | https://www.shreekundli.com/vedic-astrology/yoga | Broad Yog cataloging across supportive and challenging categories; strength depends on dignity, house, aspects, and timing. | Copying catalogs blindly without rule provenance or chart-context weighting. |
| Ishvaram Lal Kitab | https://ishvaram.com/lal-kitab/ | Lal Kitab is a distinct practical remedy system, read primarily by planet-in-house and including Rin/debt style concepts. | Random gemstones, unsafe remedies, or pretending Lal Kitab is identical to Parashari. |
| AstroSage Lal Kitab Tutorial | https://www.astrosage.com/lalkitab/LKintroduction.asp | Lal Kitab has a known user expectation around charts, planet-house effects, remedies, and report-style outputs. | Overclaiming remedies as guaranteed or making Lal Kitab the whole Kundli reading. |
| AstroSage Lal Kitab Report | https://www.astrosage.com/free/lal-kitab-report.asp | Users expect Lal Kitab predictions, Kundli, varshphal, remedies, and debts/rinas to be grouped distinctly. | Ad-like clutter, consultant upsell pressure, and generic remedy pages. |
| AstroSage Lal Kitab PDF | https://www.astrosage.com/lalkitab/lalkitab.pdf | Use as a source category reference for Lal Kitab remedy traditions, not as copy. | Direct copying, unsafe instructions, or long unverified remedy dumping. |
| OneKundli Sample Report | https://onekundli.com/wp-content/uploads/2025/05/OneKundli-Sample-Report_organized.pdf | Coverage benchmark: Lal Kitab chart, predictions, debts, annual charts, remedies, friendship, shodashvarga, shadbala, ashtakavarga, prastharashtakavarga. | Inflated report bloat, technical pages without user-facing prediction, and duplicate remedies. |
| Wikipedia Lal Kitab | https://en.wikipedia.org/wiki/Lal_Kitab | Lal Kitab can be described as a set of astrology/remedial texts with simple upay traditions and distinct authorship/history context. | Relying on Wikipedia as sole rule authority for calculations. |

## Source Use Rules

- Sources are used for coverage benchmarking and product structure only.
- Deterministic rules must be implemented from explicit rule definitions in the
  rule candidate registry and later verified against chart fixtures.
- No source text may be copied into user-facing copy.
- No rule becomes green from a source mention alone.
- Any tradition conflict must be marked as `variant` and cannot be silently
  merged.
