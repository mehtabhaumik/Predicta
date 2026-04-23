#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-predicta-a4758}"
REGION="${REGION:-asia-south1}"
SERVICE_NAME="${SERVICE_NAME:-predicta-backend}"
POLICY_NAME="${POLICY_NAME:-predicta-backend-edge-policy}"
BACKEND_SERVICE_NAME="${BACKEND_SERVICE_NAME:-predicta-backend-lb-backend}"
NETWORK_ENDPOINT_GROUP="${NETWORK_ENDPOINT_GROUP:-predicta-backend-neg}"

cat <<EOF
# Predicta Cloud Edge Abuse Protection Plan
#
# This script prints the Cloud Armor and load-balancer attachment commands.
# It does not execute them. Review the commands, ensure the backend service
# name matches your load balancer, then run the commands manually.
#
# Project:        $PROJECT_ID
# Region:         $REGION
# Cloud Run:      $SERVICE_NAME
# Armor policy:   $POLICY_NAME
# Serverless NEG: $NETWORK_ENDPOINT_GROUP
# Backend svc:    $BACKEND_SERVICE_NAME

gcloud services enable compute.googleapis.com run.googleapis.com \\
  --project "$PROJECT_ID"

# Create a Cloud Armor backend security policy.
gcloud compute security-policies create "$POLICY_NAME" \\
  --project "$PROJECT_ID" \\
  --description "Predicta backend edge abuse protection"

# Strict pass-code redemption throttle.
gcloud compute security-policies rules create 1000 \\
  --project "$PROJECT_ID" \\
  --security-policy "$POLICY_NAME" \\
  --expression "request.path == '/access/pass-codes/redeem'" \\
  --action throttle \\
  --rate-limit-threshold-count 6 \\
  --rate-limit-threshold-interval-sec 60 \\
  --conform-action allow \\
  --exceed-action deny-429 \\
  --enforce-on-key IP \\
  --description "Throttle guest pass redemption attempts"

# Kundli calculation throttle. Keep this higher than the app-level limiter so
# the app can return friendlier errors first during normal use.
gcloud compute security-policies rules create 1010 \\
  --project "$PROJECT_ID" \\
  --security-policy "$POLICY_NAME" \\
  --expression "request.path == '/generate-kundli'" \\
  --action throttle \\
  --rate-limit-threshold-count 45 \\
  --rate-limit-threshold-interval-sec 60 \\
  --conform-action allow \\
  --exceed-action deny-429 \\
  --enforce-on-key IP \\
  --description "Throttle expensive kundli calculations"

# Admin surface throttle.
gcloud compute security-policies rules create 1020 \\
  --project "$PROJECT_ID" \\
  --security-policy "$POLICY_NAME" \\
  --expression "request.path.matches('/admin/.*')" \\
  --action throttle \\
  --rate-limit-threshold-count 60 \\
  --rate-limit-threshold-interval-sec 60 \\
  --conform-action allow \\
  --exceed-action deny-429 \\
  --enforce-on-key IP \\
  --description "Throttle backend admin authority routes"

# Default backend throttle for accidental floods.
gcloud compute security-policies rules create 2147483646 \\
  --project "$PROJECT_ID" \\
  --security-policy "$POLICY_NAME" \\
  --expression "true" \\
  --action throttle \\
  --rate-limit-threshold-count 600 \\
  --rate-limit-threshold-interval-sec 60 \\
  --conform-action allow \\
  --exceed-action deny-429 \\
  --enforce-on-key IP \\
  --description "Default Predicta backend throttle"

# Attach the policy to the load-balancer backend service that points to the
# Cloud Run serverless NEG.
gcloud compute backend-services update "$BACKEND_SERVICE_NAME" \\
  --project "$PROJECT_ID" \\
  --global \\
  --security-policy "$POLICY_NAME"

# After the load balancer and policy are verified, redeploy Cloud Run so direct
# default-url traffic cannot bypass the load balancer and Cloud Armor.
CLOUD_RUN_INGRESS=internal-and-cloud-load-balancing \\
PROJECT_ID="$PROJECT_ID" \\
REGION="$REGION" \\
SERVICE_NAME="$SERVICE_NAME" \\
./scripts/deploy-backend-cloud-run.sh
EOF
