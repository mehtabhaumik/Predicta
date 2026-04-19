# Pridicta Astrology API

This service is the real kundli calculation boundary for the mobile app. The
React Native app sends validated birth details here, and this API returns a
structured Vedic kundli payload calculated with Swiss Ephemeris.

It also contains backend authority routes for admin access grants, guest pass
creation/revocation/redemption, and future billing receipt validation. Those
routes require Firebase ID tokens and Firebase Admin credentials.

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

## Admin authority endpoints

```text
POST /admin/access-grants
POST /admin/pass-codes
GET  /admin/pass-codes
POST /admin/pass-codes/{codeId}/revoke
POST /access/pass-codes/redeem
POST /billing/verify
```

Set one of these before using admin endpoints:

```text
FIREBASE_SERVICE_ACCOUNT_JSON
GOOGLE_APPLICATION_CREDENTIALS
```

`PREDICTA_BOOTSTRAP_ADMIN_EMAILS` can be used for first-time setup, but
production admin authorization should rely on Firebase custom claims. Raw guest
pass codes are never stored; the backend stores only the normalized SHA-256 hash.

See `docs/BACKEND_ADMIN_FUNCTIONS.md` for the full authority model.

## Rate limiting

The backend includes a dependency-free FastAPI rate limiter for immediate abuse
protection on each warm backend instance.

Default limits:

```text
/generate-kundli             12/minute, 120/hour per client
/access/pass-codes/redeem     5/minute,  24/hour per client
/admin/*                     30/minute, 300/hour per client
/billing/verify              20/minute, 120/hour per client
```

Configure with environment variables:

```text
PREDICTA_RATE_LIMIT_ENABLED=true
PREDICTA_RATE_LIMIT_KUNDLI_PER_MINUTE=12
PREDICTA_RATE_LIMIT_KUNDLI_PER_HOUR=120
PREDICTA_RATE_LIMIT_PASS_REDEEM_PER_MINUTE=5
PREDICTA_RATE_LIMIT_PASS_REDEEM_PER_HOUR=24
PREDICTA_RATE_LIMIT_ADMIN_PER_MINUTE=30
PREDICTA_RATE_LIMIT_ADMIN_PER_HOUR=300
PREDICTA_RATE_LIMIT_BILLING_PER_MINUTE=20
PREDICTA_RATE_LIMIT_BILLING_PER_HOUR=120
```

The limiter returns `429` with `Retry-After` and `X-RateLimit-*` headers. For
strict multi-instance enforcement, pair this app-level limiter with Cloud Armor,
API Gateway, or a shared rate-limit store.

## Cost observability

The backend emits privacy-safe structured JSON logs for request monitoring and
cost-risk review.

Logged fields include:

```text
event
requestId
method
path
statusCode
outcome
durationMs
category
riskLevel
costWeight
clientFingerprintHash
```

The backend does not log request bodies, raw birth details, raw pass codes, raw
chat text, Authorization headers, service-account material, or raw client IPs.
Client fingerprints are hashed before logging.

Cost categories:

```text
kundli_calculation
guest_pass_redemption
admin_authority
billing_verification
general_backend
health
```

Configure with:

```text
PREDICTA_OBSERVABILITY_ENABLED=true
PREDICTA_OBSERVABILITY_HASH_SALT=<server-only-random-string>
```

Set a non-empty hash salt in production so hashed client fingerprints cannot be
compared across environments.

## Deploy

The backend is Cloud Run-ready through:

```text
backend/Dockerfile
scripts/deploy-backend-cloud-run.sh
scripts/plan-cloud-edge-abuse-protection.sh
```

Use the deployment guide before public release:

```text
docs/BACKEND_DEPLOYMENT_ENV_WIRING.md
docs/CLOUD_EDGE_ABUSE_PROTECTION.md
docs/EDGE_PROTECTED_BACKEND_DEPLOYMENT_STATUS.md
```
