# Rule Candidate Registry

## Registry Status

All rules in this document are candidates only. Phase 0 does not implement or
validate them. A rule becomes production-safe only after later phases provide:

- deterministic rule definition
- required inputs
- source/provenance note
- fixture coverage
- conflict handling
- exact evidence output
- cancellation/reduction logic where applicable
- non-fearful prediction and remedy language

## Shared Output Contract Candidate

Each Dosh, Shrap, Yog, or Lal Kitab item should eventually expose:

- `id`
- `module`
- `displayName`
- `status`: `present`, `weak`, `cancelled`, `not_present`, `pending_evidence`
- `strength`: `low`, `medium`, `high`, `very_high`
- `whyPresent`
- `evidence`
- `meaningForUser`
- `activation`
- `reductions`
- `freeRemedy`
- `premiumRemedies`
- `crossReferences`
- `sourceNotes`
- `confidence`

## Dosh Candidates

| Candidate | Required Inputs | Phase 0 Status | Safe Now? | Notes |
|---|---|---:|---:|---|
| Manglik / Kuja Dosh | Mars house from D1, Moon chart, Venus chart where supported, D9 support, cancellation rules | Pending | No | Existing care pattern exists but must be rebuilt as evidence-grade Dosh. |
| Kaal Sarp Dosh | Rahu/Ketu axis, planet longitude distribution, exceptions/cancellations | Pending | No | Must avoid fear language and detect partial vs full conditions. |
| Pitra Dosh | Sun/Rahu/Saturn/9th-house patterns, ancestry indicators, dasha activation | Pending | No | Must be framed as ancestral/karmic pressure, not blame. |
| Shrapit Dosh | Saturn/Rahu conjunction/aspect variants, house/sign strength | Pending | No | Cross-reference Shrap section instead of duplicate full reading. |
| Guru Chandal Dosh | Jupiter/Rahu/Ketu conjunction/aspect variants, dignity and house | Pending | No | Needs dignity and benefic reduction logic. |
| Grahan Dosh | Sun/Moon with Rahu/Ketu, eclipse-node proximity, dignity | Pending | No | Must distinguish strong vs loose conjunction. |
| Kemadruma Dosh | Moon isolation rules, adjacent houses, Jupiter/aspect cancellation | Pending | No | Existing care pattern is not enough. |
| Vish Dosh | Saturn/Moon variants, nakshatra/house context if used | Pending | No | Rule tradition variants must be recorded. |
| Angarak Dosh | Mars/Rahu conjunction/aspect variants | Pending | No | Must avoid aggression stereotypes. |
| Daridra Dosh | wealth-house/lord afflictions, 2/11/5/9 support, cancellations | Pending | No | Must not shame poverty or guarantee wealth loss. |
| Paap Kartari Dosh | House/planet hemmed by malefics, benefic relief | Pending | No | Needs house-by-house containment. |
| Arishta / Balarishta Dosh | classical risk patterns, age safeguards, cancellation rules | Pending | No | High safety risk. Must avoid medical/death prediction. |
| Nadi Dosh | Compatibility/matching context only | Pending | No | Forbidden in single-person Kundli Karma output. |

## Shrap Candidates

All Shrap candidates must be phrased as indicators unless evidence is extremely
strong. Predicta must never say the user is cursed.

| Candidate | Required Inputs | Phase 0 Status | Safe Now? | Notes |
|---|---|---:|---:|---|
| Pitru Shrap | 9th house/lord, Sun, Saturn, Rahu/Ketu, ancestral indicators | Pending | No | Prefer ancestral healing language. |
| Matru Shrap | 4th house/lord, Moon, afflictions, maternal indicators | Pending | No | Avoid blaming mother/family. |
| Guru Shrap | Jupiter, 9th/5th, teacher/dharma indicators | Pending | No | Must be framed as wisdom/ethics correction. |
| Sarpa / Naga Shrap | Rahu/Ketu, 5th/9th, serpent symbolism variants | Pending | No | Must avoid superstition escalation. |
| Preta Shrap | 8th/12th, nodes, Saturn, tradition variants | Pending | No | High fear risk; likely premium-only after safety review. |
| Bhratri / Bandhu Shrap | 3rd/11th, Mars, siblings/network indicators | Pending | No | Needs careful language. |
| Stree / Patni Shrap | 7th/Venus relationship indicators | Pending | No | Must avoid misogyny/blame. |
| Deva / Brahma Shrap | 9th/12th/Jupiter/Sun spiritual indicators | Pending | No | Needs source discipline. |

## Supportive Yog Candidates

| Candidate | Required Inputs | Phase 0 Status | Safe Now? | Notes |
|---|---|---:|---:|---|
| Raja Yog | kendra/trikona lord relationships, dignity, dasha | Pending | No | Must rank strength and timing. |
| Dhana Yog | 2/5/9/11 lord relationships, dignity, dasha | Pending | No | Must avoid guaranteed money claims. |
| Gajakesari Yog | Moon/Jupiter relationship, kendra logic, dignity | Pending | No | Include cancellation/reduction. |
| Panch Mahapurush Yog | Mars/Mercury/Jupiter/Venus/Saturn in kendra own/exalted | Pending | No | Candidate includes Ruchaka, Bhadra, Hamsa, Malavya, Shasha. |
| Neecha Bhanga Raja Yog | debilitation cancellation rules | Pending | No | Rule variants must be explicit. |
| Vipareeta Raja Yog | dusthana lord placements, strength, dasha | Pending | No | Must explain challenge-to-rise pattern. |
| Budhaditya Yog | Sun/Mercury relation, combustion nuance | Pending | No | Current backend detects conjunction only; needs dignity. |
| Chandra-Mangal Yog | Moon/Mars relation, houses, dignity | Pending | No | Avoid simplistic wealth claims. |
| Lakshmi Yog | 9th/lagna/Venus/Jupiter variants | Pending | No | Source variations must be tracked. |
| Saraswati Yog | Jupiter/Venus/Mercury variants | Pending | No | Must avoid talent guarantee. |
| Adhi Yog | benefics in 6/7/8 from Moon variants | Pending | No | Needs exact rule choice. |
| Dharma-Karmadhipati Yog | 9th and 10th lord relation | Pending | No | Strong candidate for career/dharma predictions. |
| Parivartana Yog | sign exchange, house categories, dignity | Pending | No | Must categorize supportive/challenging. |

## Challenging Yog Candidates

| Candidate | Required Inputs | Phase 0 Status | Safe Now? | Notes |
|---|---|---:|---:|---|
| Daridra Yog | wealth-house/lord weakness variants | Pending | No | Cross-reference Daridra Dosh if same evidence. |
| Kemadruma Yog | Moon isolation variants and cancellation | Pending | No | Cross-reference Kemadruma Dosh. |
| Shakata Yog | Moon/Jupiter 6/8/12 relationship variants | Pending | No | Must avoid fatalism. |
| Paap Kartari Yog | malefic hemming condition | Pending | No | Cross-reference Paap Kartari Dosh. |
| Grahan Yog | Sun/Moon with nodes | Pending | No | Cross-reference Grahan Dosh. |
| Vish Yog | Moon/Saturn variants | Pending | No | Cross-reference Vish Dosh. |
| Angarak Yog | Mars/Rahu variants | Pending | No | Cross-reference Angarak Dosh. |
| Shrapit Yog | Saturn/Rahu variants | Pending | No | Cross-reference Shrapit Dosh/Shrap section. |
| Arishta Yog | risk/challenge combinations | Pending | No | Strict safety required. |
| Kuja / Manglik Yog | Mars placement variants | Pending | No | Cross-reference Manglik Dosh. |
| Kaal Sarp Yog | node-axis concentration | Pending | No | Cross-reference Kaal Sarp Dosh. |

## Lal Kitab Candidates

| Candidate | Required Inputs | Phase 0 Status | Safe Now? | Notes |
|---|---|---:|---:|---|
| Planet-in-house reading | D1 or Lal Kitab chart house placement rules | Pending | No | Lal Kitab is house-first, not sign-first. |
| Rin / debt indicators | planet-house combinations for accepted Rin categories | Pending | No | Must not blame ancestors/family. |
| Planet-wise upay | planet, house, condition, safe remedy whitelist | Pending | No | One remedy at a time; no harmful/illegal remedies. |
| Do and do-not list | Lal Kitab contraindications and safe avoid-list | Pending | No | Avoid superstition overload. |
| 40-day / 90-day plan | prioritized remedy plan, timing, safety notes | Pending | No | Premium only after validation. |
