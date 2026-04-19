# Cloud Edge Abuse Protection

This guide prepares Predicta for production edge protection before traffic
reaches the FastAPI backend.

The app-level backend rate limiter is useful, but it runs per warm Cloud Run
instance. Strict edge protection should sit in front of Cloud Run through a
global external HTTPS load balancer, a serverless NEG, and Cloud Armor.

## Target Architecture

```text
predicta.rudraix.com
  -> External HTTPS Load Balancer
  -> Cloud Armor backend security policy
  -> Serverless NEG
  -> Cloud Run predicta-backend
  -> FastAPI rate limiter + Firebase authority checks
```

After the load balancer works, Cloud Run ingress should be set to:

```text
internal-and-cloud-load-balancing
```

That prevents direct default Cloud Run URL traffic from bypassing Cloud Armor.

## What This Protects

Cloud Armor should catch:

- pass-code brute force attempts
- expensive kundli calculation floods
- admin route scanning
- accidental request loops
- general traffic spikes before they reach Cloud Run

FastAPI still keeps:

- Firebase ID-token validation
- admin custom-claim checks
- guest pass validation
- backend audit logs
- app-level request throttling
- privacy-safe cost observability

## Generate The Command Plan

From repo root:

```bash
./scripts/plan-cloud-edge-abuse-protection.sh
```

Override names if your load balancer resources differ:

```bash
PROJECT_ID=predicta-a4758 \
REGION=us-central1 \
SERVICE_NAME=predicta-backend \
POLICY_NAME=predicta-backend-edge-policy \
BACKEND_SERVICE_NAME=YOUR_LB_BACKEND_SERVICE \
NETWORK_ENDPOINT_GROUP=YOUR_SERVERLESS_NEG \
./scripts/plan-cloud-edge-abuse-protection.sh
```

The script prints commands only. It does not create or change cloud resources.
Review the generated commands before running them manually.

## Recommended Cloud Armor Rules

Start with throttle rules, not rate-based bans. Throttles are safer while the
product is young because legitimate investors, family members, and testers may
cluster behind shared networks.

| Priority | Path | Action | Threshold | Key |
| --- | --- | --- | --- | --- |
| 1000 | `/access/pass-codes/redeem` | throttle | 6/minute | IP |
| 1010 | `/generate-kundli` | throttle | 45/minute | IP |
| 1020 | `/admin/*` | throttle | 60/minute | IP |
| 2147483646 | default | throttle | 600/minute | IP |

Keep Cloud Armor thresholds slightly higher than app-level limits. That lets the
backend return friendlier app errors during normal use while the edge still
absorbs floods.

## Load Balancer Setup Checklist

1. Enable required APIs:

```bash
gcloud services enable compute.googleapis.com run.googleapis.com \
  --project predicta-a4758
```

2. Create or verify the Cloud Run service.
3. Create a serverless NEG for the Cloud Run service in the same region.
4. Create an external HTTPS load balancer using that serverless NEG.
5. Attach the Cloud Armor policy to the load-balancer backend service.
6. Verify `/health` through the load balancer URL.
7. Point `predicta.rudraix.com` API/backend DNS or config to the load balancer.
8. Redeploy Cloud Run with:

```bash
CLOUD_RUN_INGRESS=internal-and-cloud-load-balancing \
./scripts/deploy-backend-cloud-run.sh
```

9. Confirm direct Cloud Run default URL access no longer works externally.
10. Confirm web and mobile call only the protected backend URL.

## Deployment Script Knobs

`scripts/deploy-backend-cloud-run.sh` supports:

```text
CLOUD_RUN_INGRESS
CLOUD_RUN_MAX_INSTANCES
CLOUD_RUN_CONCURRENCY
PREDICTA_RATE_LIMIT_*
PREDICTA_OBSERVABILITY_*
```

Use direct ingress only during early smoke testing:

```text
CLOUD_RUN_INGRESS=all
```

Use protected ingress after the load balancer is live:

```text
CLOUD_RUN_INGRESS=internal-and-cloud-load-balancing
```

## Verification

Edge checks after attaching Cloud Armor:

```bash
curl -i https://YOUR_PROTECTED_BACKEND/health
```

Then intentionally trigger a small burst against a non-production route or a
temporary staging backend and confirm `429` appears at the edge.

Cloud Run checks:

```bash
curl -i https://DIRECT-CLOUD-RUN-URL/health
```

After protected ingress is enabled, the direct Cloud Run URL should not be a
public bypass path.

## Monitoring

Review Cloud Logging for:

- Cloud Armor `deny-429` events.
- backend `outcome="rate_limited"` events.
- backend `category="kundli_calculation"` spikes.
- backend `category="guest_pass_redemption"` spikes.
- any direct default Cloud Run URL traffic after ingress restriction.

## Notes

- Do not rely only on CORS. CORS protects browsers, not direct scripts.
- Do not put provider secrets in web/mobile bundles.
- Do not log raw pass codes, birth details, chat text, auth tokens, or raw IPs.
- Do not use aggressive rate-based bans until real traffic patterns are known.
