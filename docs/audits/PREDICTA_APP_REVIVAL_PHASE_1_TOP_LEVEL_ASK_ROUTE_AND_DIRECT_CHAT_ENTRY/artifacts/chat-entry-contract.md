# Chat Entry Contract After Phase 1

## Canonical Rule

`buildPredictaChatHref(...)` now returns `/ask?...`.

The path no longer changes by school. School/method context stays in the query
string so the primary Predicta route can preserve room-safe handoff behavior.

## Required Query Context Preservation

The helper continues to pass:

- `sourceScreen`
- `school`
- `from`
- `handoffMode`
- `handoffQuestion`
- `prompt`
- `kundliId`
- `chartName`
- `chartType`
- `selectedHouse`
- `selectedPlanet`
- `reportFocus`
- `reportMode`
- `reportSchoolLane`
- `reportSectionId`
- `reportSectionTitle`
- `selectedKundliKarmaModule`
- `selectedKundliKarmaItemId`
- `selectedKundliKarmaRuleId`
- `selectedTimelineEventId`
- `decisionQuestion`
- family/relationship/signature/context flags

## Compatibility

Existing routes remain available:

- `/dashboard/chat`
- `/dashboard/vedic/chat`
- `/dashboard/kp/chat`
- `/dashboard/jaimini/chat`
- `/dashboard/numerology/chat`
- `/dashboard/signature/chat`

These are compatibility surfaces, not the canonical new front door.

