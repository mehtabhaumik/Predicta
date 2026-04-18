# Pridicta Astrology API

This service is the real kundli calculation boundary for the mobile app. The
React Native app sends validated birth details here, and this API returns a
structured Vedic kundli payload calculated with Swiss Ephemeris.

## Run locally

```bash
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.astro_api.main:app --host 0.0.0.0 --port 8000
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
- Unsupported vargas are returned with `supported: false`

If this service is unavailable, the app should show a recoverable error and
preserve the previous valid kundli.
