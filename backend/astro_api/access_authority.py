import hashlib
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from threading import RLock
from typing import Dict, List, Optional

from .models import (
    AccessResolveRequest,
    AdminGuestPassCreateRequest,
    GuestPassCode,
    GuestUsageLimits,
    PassCodeType,
    PassRedemptionRequest,
    PassRedemptionResult,
    RedeemedGuestPass,
    ResolvedAccessResponse,
)

CREATED_AT = "2026-04-18T00:00:00.000Z"
CODE_REDEMPTION_EXPIRES_AT = "2027-04-18T23:59:59.999Z"
GENERIC_REDEMPTION_ERROR = (
    "This pass code could not be redeemed. Please check the code or ask the person "
    "who shared it with you."
)

GUEST_ACCESS_LIMITS: Dict[PassCodeType, Dict[str, object]] = {
    "VIP_REVIEW": {
        "deviceLimit": 3,
        "durationDays": 45,
        "usageLimits": {"questionsTotal": 300, "deepReadingsTotal": 80, "premiumPdfsTotal": 50},
    },
    "GUEST_TRIAL": {
        "deviceLimit": 1,
        "durationDays": 7,
        "usageLimits": {"questionsTotal": 20, "deepReadingsTotal": 4, "premiumPdfsTotal": 1},
    },
    "INVESTOR_PASS": {
        "deviceLimit": 4,
        "durationDays": 60,
        "usageLimits": {"questionsTotal": 500, "deepReadingsTotal": 120, "premiumPdfsTotal": 100},
    },
    "FAMILY_PASS": {
        "deviceLimit": 4,
        "durationDays": 365,
        "usageLimits": {"questionsTotal": 150, "deepReadingsTotal": 40, "premiumPdfsTotal": 10},
    },
    "INTERNAL_TEST": {
        "deviceLimit": 5,
        "durationDays": 30,
        "usageLimits": {"questionsTotal": 100, "deepReadingsTotal": 25, "premiumPdfsTotal": 5},
    },
}

GUEST_PASS_SEEDS = [
    ("guest-trial-01", "Family and friends guest trial", "GUEST_TRIAL", "GUEST", 10, "c6f063e83840803c1fc7e80f9ae8b6d903b487ba433301d28def0342b3967527"),
    ("guest-trial-02", "Family and friends guest trial", "GUEST_TRIAL", "GUEST", 10, "6882a6b6a664525ddca5df3799aaa8f307f48548ffcfd29198bfbebc8f3ba86e"),
    ("guest-trial-03", "Family and friends guest trial", "GUEST_TRIAL", "GUEST", 10, "f42c39daf63f9c31713b057fc4ac48963e73cc63a415842149b9fae6224b41b3"),
    ("vip-review-01", "VIP review pass", "VIP_REVIEW", "VIP_GUEST", 5, "781d22ec1f57fab5fc16bb881bb760ca34a6732045df44375e023e646bb5026c"),
    ("vip-review-02", "VIP review pass", "VIP_REVIEW", "VIP_GUEST", 5, "11108693dec7a648eadeb6e5dc98b0acd80c8ff9569718a9a6c719055e67cd81"),
    ("vip-review-03", "VIP review pass", "VIP_REVIEW", "VIP_GUEST", 5, "d6ebbc8a73ff19d38dee12c7848a7a3960db9dc9066d46afc6ed36bd54e92012"),
    ("investor-01", "Investor review pass", "INVESTOR_PASS", "VIP_GUEST", 3, "8efe04a978563f3683d1a8e603ad2ff36f340f936a749b226f7602149c6cb41d"),
    ("investor-02", "Investor review pass", "INVESTOR_PASS", "VIP_GUEST", 3, "e79226202992f9faac7a8ee496e69572e6b45ed28cbb50e33c61463137df361c"),
    ("investor-03", "Investor review pass", "INVESTOR_PASS", "VIP_GUEST", 3, "d9729bba29f4a8613cd45809608bd7710075a91c541fc37ade2d26b2312eacdd"),
    ("family-01", "Family full-access pass", "FAMILY_PASS", "FULL_ACCESS", 2, "a23644d821f01eb462093c9797e3b84c12f78346728432550ece1e4c39e148c5"),
    ("family-02", "Family full-access pass", "FAMILY_PASS", "FULL_ACCESS", 2, "2cfe0c59a7a99fe5f7049f8192a6707b46037767b370548b691225c5f064375a"),
    ("family-03", "Family full-access pass", "FAMILY_PASS", "FULL_ACCESS", 2, "3b26c70cd0a6b931ac7779ac618fbad9c0346ad5634ff9d336fd6051b23f7b41"),
]

_lock = RLock()
_attempts_by_key: Dict[str, List[float]] = {}
MAX_ATTEMPTS_PER_WINDOW = 5
ATTEMPT_WINDOW_SECONDS = 5 * 60


def access_store_path() -> Path:
    return Path(
        os.getenv("PRIDICTA_ACCESS_STORE_PATH", "/tmp/pridicta-access-store.json")
    )


def normalize_pass_code(code: str) -> str:
    return "".join(ch for ch in code.strip().upper() if ch.isalnum())


def hash_pass_code(code: str) -> str:
    return hashlib.sha256(normalize_pass_code(code).encode("utf-8")).hexdigest()


def create_guest_pass_code(
    request: AdminGuestPassCreateRequest,
    created_by: str,
) -> GuestPassCode:
    config = GUEST_ACCESS_LIMITS[request.type]
    return GuestPassCode(
        accessLevel=request.accessLevel,
        allowedEmails=[email.lower() for email in request.allowedEmails] or None,
        codeHash=hash_pass_code(request.code),
        codeId=request.codeId,
        createdAt=now_iso(),
        createdBy=created_by,
        deviceLimit=int(config["deviceLimit"]),
        expiresAt=request.expiresAt or add_days(now_iso(), 365),
        isActive=True,
        label=request.label,
        maxRedemptions=request.maxRedemptions,
        redeemedByUserIds=[],
        redeemedDeviceIds=[],
        type=request.type,
        usageLimits=GuestUsageLimits(**config["usageLimits"]),
    )


def list_guest_passes() -> List[GuestPassCode]:
    with _lock:
        store = load_store()
        return [
            GuestPassCode(**pass_code)
            for pass_code in store["guestPassCodes"].values()
        ]


def redeem_guest_pass(request: PassRedemptionRequest) -> PassRedemptionResult:
    with _lock:
        store = load_store()
        code_hash = hash_pass_code(request.code)
        pass_code = next(
            (
                GuestPassCode(**item)
                for item in store["guestPassCodes"].values()
                if item.get("codeHash") == code_hash
            ),
            None,
        )
        result = validate_guest_pass_code(pass_code, request)

        if result.status == "SUCCESS" and result.updatedPassCode and result.redeemedPass:
            store["guestPassCodes"][result.updatedPassCode.codeId] = result.updatedPassCode.model_dump()
            store["redeemedGuestPasses"][request.userId] = result.redeemedPass.model_dump()
            save_store(store)

        return result


def save_guest_pass(pass_code: GuestPassCode) -> GuestPassCode:
    with _lock:
        store = load_store()
        store["guestPassCodes"][pass_code.codeId] = pass_code.model_dump()
        save_store(store)
        return pass_code


def revoke_guest_pass(code_id: str, reason: str) -> GuestPassCode:
    with _lock:
        store = load_store()
        raw = store["guestPassCodes"].get(code_id)

        if not raw:
            raise KeyError(code_id)

        pass_code = GuestPassCode(**raw)
        pass_code.isActive = False
        pass_code.revokedAt = now_iso()
        pass_code.revokeReason = reason
        store["guestPassCodes"][code_id] = pass_code.model_dump()
        save_store(store)
        return pass_code


def resolve_access(request: AccessResolveRequest) -> ResolvedAccessResponse:
    email = (request.email or "").strip().lower()
    admin_emails = parse_email_env("PRIDICTA_ADMIN_EMAILS")
    full_access_emails = parse_email_env("PRIDICTA_FULL_ACCESS_EMAILS")

    if email and email in admin_emails:
        return ResolvedAccessResponse(
            accessLevel="ADMIN",
            hasPremiumAccess=True,
            hasUnrestrictedAppAccess=True,
            isAdmin=True,
            source="admin_backend",
        )

    if email and email in full_access_emails:
        return ResolvedAccessResponse(
            accessLevel="FULL_ACCESS",
            hasPremiumAccess=True,
            hasUnrestrictedAppAccess=True,
            isAdmin=False,
            source="full_access_backend",
        )

    active_pass = load_user_guest_pass(request.userId)
    if active_pass and is_guest_pass_active(active_pass):
        return ResolvedAccessResponse(
            accessLevel=active_pass.accessLevel,
            activeGuestPass=active_pass,
            hasPremiumAccess=True,
            hasUnrestrictedAppAccess=False,
            isAdmin=False,
            source="guest_pass",
        )

    return ResolvedAccessResponse(
        accessLevel="FREE",
        hasPremiumAccess=False,
        hasUnrestrictedAppAccess=False,
        isAdmin=False,
        source="free",
    )


def load_user_guest_pass(user_id: Optional[str]) -> Optional[RedeemedGuestPass]:
    if not user_id:
        return None

    with _lock:
        store = load_store()
        raw = store["redeemedGuestPasses"].get(user_id)
        return RedeemedGuestPass(**raw) if raw else None


def validate_guest_pass_code(
    pass_code: Optional[GuestPassCode],
    request: PassRedemptionRequest,
) -> PassRedemptionResult:
    now = datetime.now(timezone.utc)
    rate_limit_key = f"{request.userId}:{normalize_pass_code(request.code)}"

    if is_rate_limited(rate_limit_key, now):
        return PassRedemptionResult(
            message="Please wait a moment before trying another pass code.",
            status="RATE_LIMITED",
        )

    if not pass_code or pass_code.codeHash != hash_pass_code(request.code):
        return PassRedemptionResult(message=GENERIC_REDEMPTION_ERROR, status="INVALID")

    if not pass_code.isActive or pass_code.revokedAt:
        return PassRedemptionResult(message=GENERIC_REDEMPTION_ERROR, status="INACTIVE")

    if parse_iso(pass_code.expiresAt) <= now:
        return PassRedemptionResult(message="This guest pass has expired.", status="EXPIRED")

    if request.userId in pass_code.redeemedByUserIds:
        active_pass = load_user_guest_pass(request.userId)
        return PassRedemptionResult(
            redeemedPass=active_pass,
            message="This guest pass is already active on your account.",
            status="ALREADY_REDEEMED",
        )

    if len(pass_code.redeemedByUserIds) >= pass_code.maxRedemptions:
        return PassRedemptionResult(
            message="This guest pass has already been fully redeemed.",
            status="MAX_REDEMPTIONS",
        )

    allowed = [email.lower() for email in (pass_code.allowedEmails or [])]
    if allowed and (request.email or "").strip().lower() not in allowed:
        return PassRedemptionResult(message=GENERIC_REDEMPTION_ERROR, status="EMAIL_NOT_ALLOWED")

    redeemed_device_ids = pass_code.redeemedDeviceIds or []
    if request.deviceId not in redeemed_device_ids and len(redeemed_device_ids) >= pass_code.deviceLimit:
        return PassRedemptionResult(
            message="This guest pass is already active on its allowed devices.",
            status="DEVICE_LIMIT",
        )

    redeemed_at = now_iso(now)
    duration_days = int(GUEST_ACCESS_LIMITS[pass_code.type]["durationDays"])
    redeemed_pass = RedeemedGuestPass(
        accessLevel=pass_code.accessLevel,
        deepReadingsUsed=0,
        expiresAt=add_days(redeemed_at, duration_days),
        label=pass_code.label,
        passCodeId=pass_code.codeId,
        premiumPdfsUsed=0,
        questionsUsed=0,
        redeemedAt=redeemed_at,
        type=pass_code.type,
        usageLimits=pass_code.usageLimits,
    )
    updated_pass_code = pass_code.model_copy(
        update={
            "redeemedByUserIds": [*pass_code.redeemedByUserIds, request.userId],
            "redeemedDeviceIds": sorted(set([*redeemed_device_ids, request.deviceId])),
        }
    )

    return PassRedemptionResult(
        redeemedPass=redeemed_pass,
        status="SUCCESS",
        updatedPassCode=updated_pass_code,
    )


def is_guest_pass_active(pass_code: RedeemedGuestPass, now: Optional[datetime] = None) -> bool:
    return parse_iso(pass_code.expiresAt) > (now or datetime.now(timezone.utc))


def is_admin_token_valid(token: Optional[str]) -> bool:
    expected = os.getenv("PRIDICTA_ADMIN_API_TOKEN", "")
    return bool(expected and token and token == expected)


def admin_token_configured() -> bool:
    return bool(os.getenv("PRIDICTA_ADMIN_API_TOKEN", ""))


def load_store() -> Dict[str, Dict[str, object]]:
    path = access_store_path()
    if not path.exists():
        store = {"guestPassCodes": {}, "redeemedGuestPasses": {}}
        for pass_code in seed_guest_pass_codes():
            store["guestPassCodes"][pass_code.codeId] = pass_code.model_dump()
        save_store(store)
        return store

    with path.open("r", encoding="utf-8") as handle:
        store = json.load(handle)

    store.setdefault("guestPassCodes", {})
    store.setdefault("redeemedGuestPasses", {})
    return store


def save_store(store: Dict[str, Dict[str, object]]) -> None:
    path = access_store_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    with tmp_path.open("w", encoding="utf-8") as handle:
        json.dump(store, handle, indent=2, sort_keys=True)
    tmp_path.replace(path)


def seed_guest_pass_codes() -> List[GuestPassCode]:
    seeded: List[GuestPassCode] = []
    for code_id, label, pass_type, access_level, max_redemptions, code_hash in GUEST_PASS_SEEDS:
        config = GUEST_ACCESS_LIMITS[pass_type]
        seeded.append(
            GuestPassCode(
                accessLevel=access_level,
                codeHash=code_hash,
                codeId=code_id,
                createdAt=CREATED_AT,
                createdBy="owner-seed",
                deviceLimit=int(config["deviceLimit"]),
                expiresAt=CODE_REDEMPTION_EXPIRES_AT,
                isActive=True,
                label=label,
                maxRedemptions=max_redemptions,
                redeemedByUserIds=[],
                redeemedDeviceIds=[],
                type=pass_type,
                usageLimits=GuestUsageLimits(**config["usageLimits"]),
            )
        )
    return seeded


def parse_email_env(name: str) -> List[str]:
    return [
        email.strip().lower()
        for email in os.getenv(name, "").split(",")
        if email.strip()
    ]


def add_days(date: str, days: int) -> str:
    return now_iso(parse_iso(date) + timedelta(days=days))


def parse_iso(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def now_iso(value: Optional[datetime] = None) -> str:
    dt = value or datetime.now(timezone.utc)
    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def is_rate_limited(key: str, now: datetime) -> bool:
    window_start = now.timestamp() - ATTEMPT_WINDOW_SECONDS
    attempts = [attempt for attempt in _attempts_by_key.get(key, []) if attempt > window_start]
    attempts.append(now.timestamp())
    _attempts_by_key[key] = attempts
    return len(attempts) > MAX_ATTEMPTS_PER_WINDOW


def reset_access_rate_limits() -> None:
    _attempts_by_key.clear()
