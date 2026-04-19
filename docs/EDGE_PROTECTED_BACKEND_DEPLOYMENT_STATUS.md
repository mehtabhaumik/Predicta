# Edge Protected Backend Deployment Status

Last updated: 2026-04-19T14:54:41Z

## Final Cutover Complete

Cloud project:

```text
predicta-a4758
```

Protected API hostname:

```text
https://api.predicta.rudraix.com
```

Cloud Run service:

```text
predicta-backend
```

Current revision:

```text
predicta-backend-00002-g2h
```

## Verified

DNS:

```text
api.predicta.rudraix.com -> 34.54.185.55
```

Managed certificate:

```text
managed.status: ACTIVE
managed.domainStatus:
  api.predicta.rudraix.com: ACTIVE
```

Protected public health check:

```text
GET https://api.predicta.rudraix.com/health -> 200
{"ok":true,"service":"pridicta-astro-api"}
```

Direct Cloud Run default URL access:

```text
GET https://predicta-backend-759876006782.us-central1.run.app/health -> 404
GET https://predicta-backend-pxf7yw4soq-uc.a.run.app/health -> 404
```

Cloud Run ingress:

```text
run.googleapis.com/ingress: internal-and-cloud-load-balancing
run.googleapis.com/ingress-status: internal-and-cloud-load-balancing
```

Active revision settings:

```text
autoscaling.knative.dev/maxScale: 3
containerConcurrency: 40
serviceAccountName: predicta-backend@predicta-a4758.iam.gserviceaccount.com
```

Backend service edge policy:

```text
predicta-backend-lb-backend -> predicta-backend-edge-policy
```

## Deployed Resources

```text
Global IP:             34.54.185.55
Serverless NEG:        predicta-backend-neg
Backend service:       predicta-backend-lb-backend
URL map:               predicta-backend-url-map
HTTPS proxy:           predicta-backend-https-proxy
Forwarding rule:       predicta-backend-https-rule
Managed certificate:   predicta-backend-cert
Cloud Armor policy:    predicta-backend-edge-policy
```

Cloud Armor rules:

```text
1000 /access/pass-codes/redeem  throttle 6/minute/IP
1010 /generate-kundli           throttle 45/minute/IP
1020 /admin/*                   throttle 60/minute/IP
2147483646 default              throttle 600/minute/IP
```

## Client Wiring After Cutover

Web:

```text
NEXT_PUBLIC_PRIDICTA_BACKEND_URL=https://api.predicta.rudraix.com
```

Mobile:

```text
PRIDICTA_BACKEND_AUTHORITY_URL=https://api.predicta.rudraix.com
PRIDICTA_ASTRO_API_URL=https://api.predicta.rudraix.com
```

## Client Cutover Status

- Web source now defaults to `https://api.predicta.rudraix.com`.
- Mobile source now defaults to `https://api.predicta.rudraix.com`.
- The static web export has been rebuilt with `NEXT_PUBLIC_PRIDICTA_BACKEND_URL=https://api.predicta.rudraix.com`.

## Follow-Up

- Deploy the rebuilt web export when ready.
- Produce fresh Android/iOS builds when ready.
- Remove bootstrap admin emails from backend deployment once custom claims are confirmed for owner/admin accounts.
