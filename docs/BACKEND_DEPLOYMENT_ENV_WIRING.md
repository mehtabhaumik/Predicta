# Backend Deployment And Environment Wiring

This phase prepares the Predicta backend for deployment without deploying it automatically. The backend should run as the trusted authority for astrology generation, admin custom claims, guest pass redemption, audit logs, and future billing receipt validation.

## Target Runtime

Use Google Cloud Run in the same Google Cloud/Firebase project:

```text
predicta-a4758
```

Cloud Run is a good fit because:

- mobile and static web clients can call one HTTPS backend URL.
- Firebase Admin SDK can use application default credentials.
- the backend can scale to zero while still handling admin/pass-code traffic.
- secrets stay server-side.

The backend is also the production boundary for AI provider credentials. OpenAI
and Gemini keys must live in Secret Manager and be mounted into Cloud Run as
environment variables. They must never be exposed through web, mobile, or
`NEXT_PUBLIC_*` variables.

## Deployment Artifacts

The repo now includes:

```text
backend/Dockerfile
backend/.dockerignore
backend/cloudrun.service.template.yaml
scripts/deploy-backend-cloud-run.sh
scripts/plan-cloud-edge-abuse-protection.sh
```

The script uses Cloud Run source deploy against the `backend` directory and keeps the service public at the Cloud Run layer. App security still comes from Firebase ID-token checks inside FastAPI.

For production edge protection, place Cloud Run behind an external HTTPS load
balancer with a serverless NEG and Cloud Armor, then redeploy Cloud Run with
`CLOUD_RUN_INGRESS=internal-and-cloud-load-balancing`. See
`docs/CLOUD_EDGE_ABUSE_PROTECTION.md`.

## Required APIs

Enable these in the Google Cloud project before deploying:

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  secretmanager.googleapis.com \
  --project predicta-a4758
```

Firestore/Firebase Auth must already be active for the same Firebase project.

AI Secret Manager entries expected by the deployment script:

```text
PREDICTA_OPENAI_API_KEY
PREDICTA_GEMINI_API_KEY
```

## Service Account

Create a dedicated backend service account:

```bash
gcloud iam service-accounts create predicta-backend \
  --project predicta-a4758 \
  --display-name "Predicta Backend Authority"
```

Grant only the roles needed by the backend:

```bash
gcloud projects add-iam-policy-binding predicta-a4758 \
  --member "serviceAccount:predicta-backend@predicta-a4758.iam.gserviceaccount.com" \
  --role "roles/datastore.user"

gcloud projects add-iam-policy-binding predicta-a4758 \
  --member "serviceAccount:predicta-backend@predicta-a4758.iam.gserviceaccount.com" \
  --role "roles/firebaseauth.admin"

gcloud secrets add-iam-policy-binding PREDICTA_OPENAI_API_KEY \
  --project predicta-a4758 \
  --member "serviceAccount:predicta-backend@predicta-a4758.iam.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding PREDICTA_GEMINI_API_KEY \
  --project predicta-a4758 \
  --member "serviceAccount:predicta-backend@predicta-a4758.iam.gserviceaccount.com" \
  --role "roles/secretmanager.secretAccessor"
```

If future backend PDF upload or Storage metadata writes move server-side, add the smallest Storage role needed at that time.

## Deploy

From the repo root:

```bash
PROJECT_ID=predicta-a4758 \
REGION=asia-south1 \
SERVICE_NAME=predicta-backend \
CLOUD_RUN_SERVICE_ACCOUNT=predicta-backend@predicta-a4758.iam.gserviceaccount.com \
PREDICTA_ALLOWED_ORIGINS=https://predicta.rudraix.com,https://predicta-a4758.web.app \
PREDICTA_OBSERVABILITY_HASH_SALT=replace-with-server-only-random-string \
./scripts/deploy-backend-cloud-run.sh
```

The deployment script mounts these Secret Manager values automatically unless
overridden:

```text
PREDICTA_OPENAI_API_KEY=PREDICTA_OPENAI_API_KEY:latest
PREDICTA_GEMINI_API_KEY=PREDICTA_GEMINI_API_KEY:latest
```

Override only if a different secret name is intentionally used:

```bash
PREDICTA_OPENAI_SECRET_NAME=custom-openai-secret \
PREDICTA_GEMINI_SECRET_NAME=custom-gemini-secret \
./scripts/deploy-backend-cloud-run.sh
```

The deployment script also enables bounded in-process caches by default:

```text
PREDICTA_KUNDLI_CACHE_ENABLED=true
PREDICTA_KUNDLI_CACHE_TTL_SECONDS=2592000
PREDICTA_KUNDLI_CACHE_MAX_ENTRIES=1000
PREDICTA_AI_RESPONSE_CACHE_ENABLED=true
PREDICTA_AI_RESPONSE_CACHE_TTL_SECONDS=604800
PREDICTA_AI_RESPONSE_CACHE_MAX_ENTRIES=500
PREDICTA_AI_MAX_CONTEXT_CHARS=14000
PREDICTA_AI_MAX_HISTORY_TURNS=8
PREDICTA_AI_MAX_HISTORY_CHARS_PER_TURN=700
PREDICTA_OPENAI_TIMEOUT_SECONDS=30
PREDICTA_GEMINI_TIMEOUT_SECONDS=12
```

These caches reduce repeated calculation and repeated identical first-question AI
calls on warm Cloud Run instances. They are an optimization only; clients must
still keep local caches for offline use.

The backend also bounds provider prompts and uses configurable OpenAI/Gemini
timeouts. Keep these limits conservative until production traffic confirms real
latency and cost behavior.

For first-time admin setup only, temporarily include:

```bash
PREDICTA_BOOTSTRAP_ADMIN_EMAILS=ui.bhaumik@gmail.com,bvmehta1980@gmail.com,mehtabhaumik.2007@gmail.com
```

After Firebase custom claims are set through `/admin/access-grants`, redeploy with `PREDICTA_BOOTSTRAP_ADMIN_EMAILS` empty.

## Dry Run

To inspect the exact deploy command without deploying:

```bash
DRY_RUN=true ./scripts/deploy-backend-cloud-run.sh
```

To inspect the Cloud Armor and load-balancer edge-protection command plan:

```bash
./scripts/plan-cloud-edge-abuse-protection.sh
```

## Health Check

After deployment:

```bash
curl https://api.predicta.rudraix.com/health
```

Expected response:

```json
{"kundliCacheEntries":0,"ok":true,"service":"pridicta-astro-api"}
```

## Web Environment Wiring

The current web app is statically exported. That means `NEXT_PUBLIC_PRIDICTA_BACKEND_URL` is baked into the web build.

Before building/deploying web:

```bash
NEXT_PUBLIC_PRIDICTA_BACKEND_URL=https://api.predicta.rudraix.com \
corepack pnpm --filter @pridicta/web build
```

Then deploy hosting:

```bash
firebase deploy --only hosting --project predicta-a4758
```

Do not put Firebase Admin credentials in `NEXT_PUBLIC_*` variables.

## Mobile Environment Wiring

Before producing Android/iOS builds, set:

```text
PRIDICTA_BACKEND_AUTHORITY_URL=https://api.predicta.rudraix.com
PRIDICTA_ASTRO_API_URL=https://api.predicta.rudraix.com
```

Android emulator local development can continue using:

```text
http://10.0.2.2:8000
```

Production mobile builds should point at the deployed HTTPS URL.

## CORS

The backend reads:

```text
PREDICTA_ALLOWED_ORIGINS
```

Use only trusted origins, for example:

```text
https://predicta.rudraix.com,https://predicta-a4758.web.app
```

Add `http://localhost:3000` only for local web development.

## Production Guardrails

- Do not deploy `PREDICTA_ENABLE_MOCK_AI=true`.
- Do not deploy `PRIDICTA_ENABLE_MOCK_BILLING=true`.
- Do not expose service-account JSON in browser/mobile bundles.
- Do not store raw guest pass codes.
- Do not keep bootstrap admin emails enabled after first setup.
- Keep `PREDICTA_RATE_LIMIT_ENABLED=true` in public environments.
- Use Cloud Armor, API Gateway, or a shared rate-limit store if you need strict
  multi-instance quotas beyond the built-in per-instance FastAPI limiter.
- Keep `/billing/verify` non-permissive until real Play/App Store validation is implemented.

## Rate Limit Environment Knobs

Start with these defaults:

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
PREDICTA_OBSERVABILITY_ENABLED=true
PREDICTA_OBSERVABILITY_HASH_SALT=<server-only-random-string>
```

Tune downward if API cost rises or suspicious traffic appears. Tune upward only
after reviewing Cloud Run logs, Firebase usage, and AI/PDF cost exposure.

## Cost Observability

The backend writes structured JSON request events to stdout so Cloud Run logging
can answer basic cost and abuse questions without storing sensitive user data.

Use these fields for dashboards or log queries:

```text
category
riskLevel
costWeight
statusCode
outcome
durationMs
clientFingerprintHash
```

Do not add raw request bodies, raw birth details, raw chat text, raw pass codes,
Authorization headers, service-account values, or raw IP addresses to backend
logs.

Recommended Cloud Logging checks before launch:

- high count of `outcome="rate_limited"` by `category`.
- spikes in `category="kundli_calculation"`.
- repeated `category="guest_pass_redemption"` with `clientFingerprintHash`.
- any `outcome="server_error"` on admin or billing routes.
- slow requests where `durationMs` is materially above the normal baseline.
