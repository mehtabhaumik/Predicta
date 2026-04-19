from datetime import datetime, timezone
from hashlib import sha256

from backend.admin_api.pass_codes import (
    GENERIC_REDEMPTION_ERROR,
    PassRedemptionRequest,
    create_guest_pass_record,
    format_pass_code,
    hash_pass_code,
    normalize_allowed_emails,
    normalize_pass_code,
    summarize_guest_pass_code,
    validate_guest_pass_code_record,
)


FIXED_NOW = datetime(2026, 4, 19, 9, 0, tzinfo=timezone.utc)
FIXED_ISO = "2026-04-19T09:00:00Z"


def create_record(**overrides):
    _, record = create_guest_pass_record(
        access_level=overrides.pop("access_level", "VIP_GUEST"),
        actor_user_id="admin-user",
        allowed_emails=overrides.pop("allowed_emails", ["Guest@Example.com"]),
        code_id=overrides.pop("code_id", "pass_test"),
        created_at=FIXED_ISO,
        expires_at=overrides.pop("expires_at", "2026-05-19T09:00:00Z"),
        label=overrides.pop("label", "Investor preview"),
        max_redemptions=overrides.pop("max_redemptions", 5),
        pass_type=overrides.pop("pass_type", "VIP_REVIEW"),
        raw_code=overrides.pop("raw_code", "predicta-vip-1234"),
    )
    return record


def test_pass_code_normalization_and_hash_match_shared_contract():
    assert normalize_pass_code(" predicta-vip 1234 ") == "PREDICTAVIP1234"
    assert format_pass_code(" predicta-vip 1234 ") == "PRED-ICTA-VIP1-234"
    assert hash_pass_code(" predicta-vip 1234 ") == sha256(
        "PREDICTAVIP1234".encode("utf-8")
    ).hexdigest()


def test_created_guest_pass_record_never_stores_raw_code():
    record = create_record()

    assert "predicta-vip-1234" not in str(record)
    assert record["codeHash"] == hash_pass_code("predicta-vip-1234")
    assert record["allowedEmails"] == ["guest@example.com"]
    assert record["maxRedemptions"] == 1


def test_allowed_email_pass_redeems_and_updates_user_and_device():
    record = create_record()
    result = validate_guest_pass_code_record(
        record,
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-a",
            email="guest@example.com",
            user_id="user-a",
        ),
        now=FIXED_NOW,
    )

    assert result.status == "SUCCESS"
    assert result.redeemed_pass is not None
    assert result.redeemed_pass["accessLevel"] == "VIP_GUEST"
    assert result.redeemed_pass["questionsUsed"] == 0
    assert result.updated_pass_code["redeemedByUserIds"] == ["user-a"]
    assert result.updated_pass_code["redeemedDeviceIds"] == ["device-a"]


def test_restricted_email_rejection_uses_generic_message():
    record = create_record()
    result = validate_guest_pass_code_record(
        record,
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-a",
            email="other@example.com",
            user_id="user-a",
        ),
        now=FIXED_NOW,
    )

    assert result.status == "EMAIL_NOT_ALLOWED"
    assert result.message == GENERIC_REDEMPTION_ERROR


def test_device_limit_prevents_reuse_on_extra_device():
    record = create_record(allowed_emails=None, max_redemptions=3, pass_type="GUEST_TRIAL")
    first = validate_guest_pass_code_record(
        record,
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-a",
            email="first@example.com",
            user_id="user-a",
        ),
        now=FIXED_NOW,
    )
    second = validate_guest_pass_code_record(
        first.updated_pass_code,
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-b",
            email="second@example.com",
            user_id="user-b",
        ),
        now=FIXED_NOW,
    )

    assert first.status == "SUCCESS"
    assert second.status == "DEVICE_LIMIT"


def test_expired_and_inactive_passes_are_rejected():
    expired = validate_guest_pass_code_record(
        create_record(expires_at="2026-04-18T09:00:00Z"),
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-a",
            email="guest@example.com",
            user_id="user-a",
        ),
        now=FIXED_NOW,
    )
    inactive_record = {**create_record(), "isActive": False}
    inactive = validate_guest_pass_code_record(
        inactive_record,
        PassRedemptionRequest(
            code="predicta-vip-1234",
            device_id="device-a",
            email="guest@example.com",
            user_id="user-a",
        ),
        now=FIXED_NOW,
    )

    assert expired.status == "EXPIRED"
    assert inactive.status == "INACTIVE"
    assert inactive.message == GENERIC_REDEMPTION_ERROR


def test_pass_summary_never_exposes_hash_or_raw_code():
    record = create_record()
    summary = summarize_guest_pass_code(record)

    assert "codeHash" not in summary
    assert "rawCode" not in summary
    assert summary["allowedEmailCount"] == 1
    assert summary["remainingRedemptions"] == 1


def test_normalize_allowed_emails_deduplicates_and_trims():
    assert normalize_allowed_emails([" Guest@Example.com ", "guest@example.com", ""]) == [
        "guest@example.com"
    ]
