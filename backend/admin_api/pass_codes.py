from __future__ import annotations

import re
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from typing import Any, Dict, List, Optional, Tuple
from uuid import uuid4

GENERIC_REDEMPTION_ERROR = (
    "This pass code could not be redeemed. Please check the code or ask the person "
    "who shared it with you."
)

GUEST_ACCESS_LIMITS: Dict[str, Dict[str, Any]] = {
    "FAMILY_PASS": {
        "deviceLimit": 2,
        "durationDays": 365,
        "usageLimits": {
            "deepReadingsTotal": 300,
            "premiumPdfsTotal": 50,
            "questionsTotal": 2000,
        },
    },
    "GUEST_TRIAL": {
        "deviceLimit": 1,
        "durationDays": 7,
        "usageLimits": {
            "deepReadingsTotal": 5,
            "premiumPdfsTotal": 1,
            "questionsTotal": 25,
        },
    },
    "INTERNAL_TEST": {
        "deviceLimit": 3,
        "durationDays": 365,
        "usageLimits": {
            "deepReadingsTotal": 1000,
            "premiumPdfsTotal": 100,
            "questionsTotal": 5000,
        },
    },
    "INVESTOR_PASS": {
        "deviceLimit": 3,
        "durationDays": 90,
        "usageLimits": {
            "deepReadingsTotal": 60,
            "premiumPdfsTotal": 10,
            "questionsTotal": 300,
        },
    },
    "VIP_REVIEW": {
        "deviceLimit": 2,
        "durationDays": 30,
        "usageLimits": {
            "deepReadingsTotal": 30,
            "premiumPdfsTotal": 5,
            "questionsTotal": 150,
        },
    },
}


@dataclass(frozen=True)
class PassRedemptionRequest:
    code: str
    user_id: str
    email: Optional[str]
    device_id: str


@dataclass(frozen=True)
class PassRedemptionOutcome:
    status: str
    message: Optional[str] = None
    redeemed_pass: Optional[Dict[str, Any]] = None
    updated_pass_code: Optional[Dict[str, Any]] = None


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    return utc_now().isoformat().replace("+00:00", "Z")


def parse_iso_datetime(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def add_days_iso(value: str, days: int) -> str:
    return (
        parse_iso_datetime(value)
        .astimezone(timezone.utc)
        .replace(microsecond=0)
        + timedelta(days=days)
    ).isoformat().replace("+00:00", "Z")


def normalize_email(email: Optional[str]) -> Optional[str]:
    if not email:
        return None
    normalized = email.strip().lower()
    return normalized or None


def normalize_allowed_emails(emails: Optional[List[str]]) -> List[str]:
    normalized = [email for email in (normalize_email(value) for value in emails or []) if email]
    return sorted(set(normalized))


def normalize_pass_code(code: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", code.strip().upper())


def hash_pass_code(code: str) -> str:
    return sha256(normalize_pass_code(code).encode("utf-8")).hexdigest()


def format_pass_code(code: str) -> str:
    normalized = normalize_pass_code(code)
    return "-".join(normalized[index : index + 4] for index in range(0, len(normalized), 4))


def generate_raw_pass_code() -> str:
    alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    chunks = [
        "".join(secrets.choice(alphabet) for _ in range(4))
        for _ in range(4)
    ]
    return "PREDICTA-" + "-".join(chunks)


def create_guest_pass_record(
    *,
    access_level: str,
    actor_user_id: str,
    allowed_emails: Optional[List[str]],
    code_id: Optional[str],
    created_at: Optional[str],
    expires_at: Optional[str],
    label: str,
    max_redemptions: int,
    pass_type: str,
    raw_code: Optional[str],
) -> Tuple[str, Dict[str, Any]]:
    if pass_type not in GUEST_ACCESS_LIMITS:
        raise ValueError(f"Unsupported pass type: {pass_type}")

    generated_code = raw_code or generate_raw_pass_code()
    normalized_emails = normalize_allowed_emails(allowed_emails)
    safe_max_redemptions = max_redemptions
    if normalized_emails:
        safe_max_redemptions = min(max_redemptions, len(normalized_emails))

    created = created_at or utc_now_iso()
    config = GUEST_ACCESS_LIMITS[pass_type]
    record = {
        "accessLevel": access_level,
        "allowedEmails": normalized_emails or None,
        "codeHash": hash_pass_code(generated_code),
        "codeId": code_id or f"pass_{uuid4().hex}",
        "createdAt": created,
        "createdBy": actor_user_id,
        "deviceLimit": config["deviceLimit"],
        "expiresAt": expires_at or add_days_iso(created, 365),
        "isActive": True,
        "label": label.strip(),
        "maxRedemptions": safe_max_redemptions,
        "redeemedByUserIds": [],
        "redeemedDeviceIds": [],
        "type": pass_type,
        "usageLimits": config["usageLimits"],
    }
    return generated_code, record


def summarize_guest_pass_code(pass_code: Dict[str, Any]) -> Dict[str, Any]:
    redeemed_user_ids = pass_code.get("redeemedByUserIds") or []
    redeemed_device_ids = pass_code.get("redeemedDeviceIds") or []
    max_redemptions = int(pass_code.get("maxRedemptions") or 0)
    return {
        "accessLevel": pass_code["accessLevel"],
        "allowedEmailCount": len(pass_code.get("allowedEmails") or []),
        "codeId": pass_code["codeId"],
        "deviceCount": len(redeemed_device_ids),
        "deviceLimit": int(pass_code.get("deviceLimit") or 0),
        "expiresAt": pass_code["expiresAt"],
        "isActive": bool(pass_code.get("isActive")) and not pass_code.get("revokedAt"),
        "label": pass_code["label"],
        "maxRedemptions": max_redemptions,
        "redemptionCount": len(redeemed_user_ids),
        "remainingRedemptions": max(max_redemptions - len(redeemed_user_ids), 0),
        "type": pass_code["type"],
        "usageLimits": pass_code["usageLimits"],
    }


def validate_guest_pass_code_record(
    pass_code: Optional[Dict[str, Any]],
    request: PassRedemptionRequest,
    now: Optional[datetime] = None,
) -> PassRedemptionOutcome:
    current_time = now or utc_now()

    if not pass_code or pass_code.get("codeHash") != hash_pass_code(request.code):
        return PassRedemptionOutcome(status="INVALID", message=GENERIC_REDEMPTION_ERROR)

    if not pass_code.get("isActive") or pass_code.get("revokedAt"):
        return PassRedemptionOutcome(status="INACTIVE", message=GENERIC_REDEMPTION_ERROR)

    if parse_iso_datetime(pass_code["expiresAt"]) <= current_time:
        return PassRedemptionOutcome(status="EXPIRED", message="This guest pass has expired.")

    redeemed_user_ids = list(pass_code.get("redeemedByUserIds") or [])
    if request.user_id in redeemed_user_ids:
        return PassRedemptionOutcome(
            status="ALREADY_REDEEMED",
            message="This guest pass is already active on your account.",
        )

    if len(redeemed_user_ids) >= int(pass_code.get("maxRedemptions") or 0):
        return PassRedemptionOutcome(
            status="MAX_REDEMPTIONS",
            message="This guest pass has already been fully redeemed.",
        )

    allowed_emails = pass_code.get("allowedEmails") or []
    normalized_email = normalize_email(request.email)
    if allowed_emails and normalized_email not in allowed_emails:
        return PassRedemptionOutcome(status="EMAIL_NOT_ALLOWED", message=GENERIC_REDEMPTION_ERROR)

    redeemed_device_ids = list(pass_code.get("redeemedDeviceIds") or [])
    if (
        request.device_id not in redeemed_device_ids
        and len(redeemed_device_ids) >= int(pass_code.get("deviceLimit") or 0)
    ):
        return PassRedemptionOutcome(
            status="DEVICE_LIMIT",
            message="This guest pass is already active on its allowed devices.",
        )

    redeemed_at = current_time.astimezone(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    duration_days = int(GUEST_ACCESS_LIMITS[pass_code["type"]]["durationDays"])
    redeemed_pass = {
        "accessLevel": pass_code["accessLevel"],
        "deepReadingsUsed": 0,
        "expiresAt": add_days_iso(redeemed_at, duration_days),
        "label": pass_code["label"],
        "passCodeId": pass_code["codeId"],
        "premiumPdfsUsed": 0,
        "questionsUsed": 0,
        "redeemedAt": redeemed_at,
        "type": pass_code["type"],
        "usageLimits": pass_code["usageLimits"],
    }

    updated_pass_code = {
        **pass_code,
        "redeemedByUserIds": [*redeemed_user_ids, request.user_id],
        "redeemedDeviceIds": sorted(set([*redeemed_device_ids, request.device_id])),
    }

    return PassRedemptionOutcome(
        status="SUCCESS",
        redeemed_pass=redeemed_pass,
        updated_pass_code=updated_pass_code,
    )
