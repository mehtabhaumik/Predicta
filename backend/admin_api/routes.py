from __future__ import annotations

from uuid import uuid4
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException

from .firebase_admin_service import (
    AuthenticatedActor,
    FirebaseAdminUnavailable,
    can_use_admin_tools,
    get_firestore_client,
    get_firestore_module,
    get_user_record,
    set_access_claims,
    verify_authorization_header,
    write_admin_audit_log,
)
from .models import (
    AccessGrantRequest,
    AccessGrantResponse,
    BillingVerificationRequest,
    CreateGuestPassCodeRequest,
    CreateGuestPassCodeResponse,
    GuestPassCodeResponse,
    RedeemPassCodeRequest,
    RedeemedGuestPassResponse,
    RevokeGuestPassCodeRequest,
)
from .pass_codes import (
    PassRedemptionRequest,
    create_guest_pass_record,
    format_pass_code,
    hash_pass_code,
    summarize_guest_pass_code,
    utc_now_iso,
    validate_guest_pass_code_record,
)

admin_router = APIRouter(prefix="/admin", tags=["admin"])
access_router = APIRouter(prefix="/access", tags=["access"])
billing_router = APIRouter(prefix="/billing", tags=["billing"])


def _http_from_firebase_error(exc: Exception) -> HTTPException:
    if isinstance(exc, FirebaseAdminUnavailable):
        return HTTPException(status_code=503, detail=str(exc))
    return HTTPException(status_code=500, detail="Backend authority operation failed.")


def require_user(authorization: Optional[str] = Header(default=None)) -> AuthenticatedActor:
    try:
        return verify_authorization_header(authorization)
    except PermissionError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc


def require_admin(actor: AuthenticatedActor = Depends(require_user)) -> AuthenticatedActor:
    if not can_use_admin_tools(actor):
        raise HTTPException(status_code=403, detail="Admin access is required.")
    return actor


def _audit_action(
    *,
    action_type: str,
    actor: AuthenticatedActor,
    message: str,
    target_email: Optional[str] = None,
    target_resource_id: Optional[str] = None,
    target_user_id: Optional[str] = None,
    metadata: Optional[Dict] = None,
) -> None:
    created_at = utc_now_iso()
    write_admin_audit_log(
        {
            "actionId": f"{action_type}-{uuid4().hex}",
            "actionType": action_type,
            "actorEmail": actor.email,
            "actorUserId": actor.uid,
            "createdAt": created_at,
            "message": message,
            "metadata": metadata or {},
            "targetEmail": target_email,
            "targetResourceId": target_resource_id,
            "targetUserId": target_user_id,
        }
    )


@admin_router.post("/access-grants", response_model=AccessGrantResponse)
def grant_access(
    request: AccessGrantRequest,
    actor: AuthenticatedActor = Depends(require_admin),
):
    if not request.userId and not request.email:
        raise HTTPException(status_code=422, detail="Either userId or email is required.")

    try:
        user_record = get_user_record(user_id=request.userId, email=request.email)
        admin = request.accessLevel == "ADMIN"
        full_access = request.accessLevel in {"ADMIN", "FULL_ACCESS"}
        set_access_claims(user_id=user_record.uid, admin=admin, full_access=full_access)
        _audit_action(
            action_type="user_access_updated",
            actor=actor,
            message=f"Updated backend access claims to {request.accessLevel}.",
            target_email=user_record.email,
            target_user_id=user_record.uid,
            metadata={"accessLevel": request.accessLevel, "reason": request.reason},
        )
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc

    return AccessGrantResponse(
        userId=user_record.uid,
        email=user_record.email,
        admin=admin,
        fullAccess=full_access,
        updatedAt=utc_now_iso(),
    )


@admin_router.post("/pass-codes", response_model=CreateGuestPassCodeResponse)
def create_pass_code(
    request: CreateGuestPassCodeRequest,
    actor: AuthenticatedActor = Depends(require_admin),
):
    try:
        raw_code, record = create_guest_pass_record(
            access_level=request.accessLevel,
            actor_user_id=actor.uid,
            allowed_emails=request.allowedEmails,
            code_id=request.codeId,
            created_at=utc_now_iso(),
            expires_at=request.expiresAt,
            label=request.label,
            max_redemptions=request.maxRedemptions,
            pass_type=request.type,
            raw_code=request.rawCode,
        )
        db = get_firestore_client()
        db.collection("accessPassCodes").document(record["codeId"]).set(record)
        _audit_action(
            action_type="pass_created",
            actor=actor,
            message=f"Created {record['label']}.",
            target_email=(record.get("allowedEmails") or [None])[0]
            if len(record.get("allowedEmails") or []) == 1
            else None,
            target_resource_id=record["codeId"],
            metadata={
                "accessLevel": record["accessLevel"],
                "allowedEmailCount": len(record.get("allowedEmails") or []),
                "maxRedemptions": record["maxRedemptions"],
                "type": record["type"],
            },
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc

    return CreateGuestPassCodeResponse(
        rawCode=raw_code,
        formattedCode=format_pass_code(raw_code),
        passCode=GuestPassCodeResponse(**summarize_guest_pass_code(record)),
    )


@admin_router.get("/pass-codes", response_model=List[GuestPassCodeResponse])
def list_pass_codes(actor: AuthenticatedActor = Depends(require_admin)):
    try:
        docs = (
            get_firestore_client()
            .collection("accessPassCodes")
            .order_by("createdAt", direction="DESCENDING")
            .limit(200)
            .stream()
        )
        return [GuestPassCodeResponse(**summarize_guest_pass_code(doc.to_dict())) for doc in docs]
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc


@admin_router.post("/pass-codes/{code_id}/revoke", response_model=GuestPassCodeResponse)
def revoke_pass_code(
    code_id: str,
    request: RevokeGuestPassCodeRequest,
    actor: AuthenticatedActor = Depends(require_admin),
):
    try:
        db = get_firestore_client()
        ref = db.collection("accessPassCodes").document(code_id)
        snapshot = ref.get()
        if not snapshot.exists:
            raise HTTPException(status_code=404, detail="Guest pass code was not found.")

        record = snapshot.to_dict()
        revoked_at = utc_now_iso()
        updated = {
            **record,
            "isActive": False,
            "revokedAt": revoked_at,
            "revokeReason": request.reason.strip() or "Revoked by admin",
        }
        ref.set(updated)
        _audit_action(
            action_type="pass_revoked",
            actor=actor,
            message=f"Revoked {updated['label']}.",
            target_resource_id=code_id,
            metadata={
                "reason": request.reason,
                "redemptionCount": len(updated.get("redeemedByUserIds") or []),
                "type": updated["type"],
            },
        )
        return GuestPassCodeResponse(**summarize_guest_pass_code(updated))
    except HTTPException:
        raise
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc


@access_router.post("/pass-codes/redeem", response_model=RedeemedGuestPassResponse)
def redeem_pass_code(
    request: RedeemPassCodeRequest,
    actor: AuthenticatedActor = Depends(require_user),
):
    try:
        db = get_firestore_client()
        firestore = get_firestore_module()
        transaction = db.transaction()

        @firestore.transactional
        def redeem_in_transaction(transaction):
            query = (
                db.collection("accessPassCodes")
                .where("codeHash", "==", hash_pass_code(request.code))
                .limit(1)
            )
            snapshots = list(transaction.get(query))
            if not snapshots:
                outcome = validate_guest_pass_code_record(
                    None,
                    PassRedemptionRequest(
                        code=request.code,
                        device_id=request.deviceId,
                        email=actor.email,
                        user_id=actor.uid,
                    ),
                )
                return outcome

            snapshot = snapshots[0]
            record = snapshot.to_dict()
            outcome = validate_guest_pass_code_record(
                record,
                PassRedemptionRequest(
                    code=request.code,
                    device_id=request.deviceId,
                    email=actor.email,
                    user_id=actor.uid,
                ),
            )

            if outcome.status == "SUCCESS":
                transaction.set(snapshot.reference, outcome.updated_pass_code)
                user_ref = db.collection("users").document(actor.uid)
                transaction.set(
                    user_ref,
                    {
                        "access": {
                            "accessLevel": outcome.redeemed_pass["accessLevel"],
                            "activeGuestPass": outcome.redeemed_pass,
                            "source": "guest_pass",
                            "updatedAt": utc_now_iso(),
                        },
                        "guestPassUsage": {
                            "deepReadingsUsed": 0,
                            "lastUsedAt": utc_now_iso(),
                            "passCodeId": outcome.redeemed_pass["passCodeId"],
                            "premiumPdfsUsed": 0,
                            "questionsUsed": 0,
                        },
                    },
                    merge=True,
                )
            return outcome

        outcome = redeem_in_transaction(transaction)
    except Exception as exc:
        raise _http_from_firebase_error(exc) from exc

    if outcome.status != "SUCCESS":
        status_code = 429 if outcome.status == "RATE_LIMITED" else 400
        raise HTTPException(status_code=status_code, detail=outcome.message)

    return RedeemedGuestPassResponse(**outcome.redeemed_pass)


@billing_router.post("/verify")
def verify_purchase(
    _: BillingVerificationRequest,
    actor: AuthenticatedActor = Depends(require_user),
):
    # This endpoint is intentionally present but not permissive until Play/App Store
    # receipt validation credentials and server logic are configured.
    raise HTTPException(
        status_code=501,
        detail=(
            "Billing receipt validation is not configured yet. Do not grant Premium "
            f"from client-only state for user {actor.uid}."
        ),
    )
