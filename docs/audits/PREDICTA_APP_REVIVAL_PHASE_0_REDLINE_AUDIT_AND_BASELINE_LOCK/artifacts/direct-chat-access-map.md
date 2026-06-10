# Direct Chat Access Map

Phase: `PREDICTA_APP_REVIVAL_PHASE_0_REDLINE_AUDIT_AND_BASELINE_LOCK`

## Current Directness

| Surface | Current target | Problem | Phase 1 requirement |
|---|---:|---|---|
| Public hero primary CTA | `/dashboard` | Sends user to dashboard instead of Predicta. | Route to top-level `/ask` or `/chat`. |
| Public hero secondary CTA | `/dashboard/vedic/chat` | Sends user to a specialist dashboard chat instead of primary Predicta. | Route to top-level Predicta with Vedic context if needed. |
| Public report preview CTA | `/dashboard/report` | Sends user to report composer before primary conversation. | Keep report CTA secondary; primary remains Predicta. |
| Dashboard topbar Ask Predicta | `buildPredictaChatHref(...)` | Context-aware, but still points to dashboard chat paths. | Preserve context and point to top-level Predicta. |
| Specialist room Ask Predicta CTAs | `buildPredictaChatHref(...)` | Context-aware, but dashboard-bound. | Preserve evidence context and point to top-level Predicta. |
| Footer Ask Predicta | `/dashboard/chat` | Direct to chat but still dashboard-bound. | Point to top-level Predicta. |
| Chat helper default path | `/dashboard/chat` | Main contract anchors chat inside dashboard. | Change default to top-level Predicta path. |
| Chat helper school paths | `/dashboard/{school}/chat` | Keeps room chats as separate dashboard destinations. | Use top-level Predicta with room-safe context/handoff mode. |

## Redline

Predicta is not truly direct while the canonical chat href builder returns
dashboard paths.

Phase 1 must change the chat-entry contract and preserve context:

- active Kundli
- source screen
- school/evidence room
- report section
- event question
- selected chart
- selected house/planet
- Kundli Karma evidence
- zero-credit deterministic mode

