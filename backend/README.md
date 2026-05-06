# Pridicta Astrology API

This service is the real kundli calculation boundary for the mobile app. The
React Native app sends validated birth details here, and this API returns a
structured Vedic kundli payload calculated with Swiss Ephemeris.
It is also the server-side AI boundary for mobile and web Pridicta readings, so
provider keys and prompt orchestration never live in client bundles.

## Run locally

```bash
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.astro_api.main:app --host 0.0.0.0 --port 8000
```

AI readings require at least one server-side provider key. OpenAI is primary;
Gemini is the backend fallback when OpenAI is unavailable or not configured:

```bash
export OPENAI_API_KEY=...
export PRIDICTA_OPENAI_FREE_MODEL=gpt-5.4-mini
export PRIDICTA_OPENAI_PREMIUM_MODEL=gpt-5.5
export GEMINI_API_KEY=...
export PRIDICTA_GEMINI_FREE_MODEL=gemini-2.5-flash
export PRIDICTA_GEMINI_PREMIUM_MODEL=gemini-2.5-pro
export PRIDICTA_ACCESS_STORE_PATH=/secure/path/pridicta-access-store.json
export PRIDICTA_ADMIN_API_TOKEN=use-a-long-random-secret
export PRIDICTA_ADMIN_EMAILS=admin@example.com
export PRIDICTA_FULL_ACCESS_EMAILS=founder@example.com
```

Android emulator URL:

```text
http://10.0.2.2:8000
```

iOS simulator/local URL:

```text
http://127.0.0.1:8000
```

## Accuracy stance

- Sidereal zodiac
- Lahiri ayanamsa
- Whole sign houses for Jyotish interpretation
- True node by default
- No fake fallback kundli data
- No fake fallback AI readings
- Guest-pass validation and admin pass operations are backend-authoritative.
- Do not expose `PRIDICTA_ADMIN_API_TOKEN` to browser bundles or mobile builds.
- Unsupported vargas are returned with `supported: false`

If this service is unavailable, the app should show a recoverable error and
preserve the previous valid kundli.
