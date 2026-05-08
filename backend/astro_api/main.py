from typing import Optional

from fastapi import FastAPI, Header, HTTPException

from .access_authority import (
    admin_token_configured,
    create_guest_pass_code,
    is_admin_token_valid,
    list_guest_passes,
    redeem_guest_pass,
    resolve_access,
    revoke_guest_pass,
    save_guest_pass,
)
from .safety_audit import (
    create_safety_audit_event,
    list_safety_audit_events,
    review_safety_audit_event,
)
from .release_governance import evaluate_release_readiness

from .ai import (
    AIConfigurationError,
    AIProviderError,
    ask_pridicta,
    extract_birth_details,
)
from .calculations import generate_kundli
from .models import (
    BirthDetails,
    BirthDetailsExtractionRequest,
    BirthDetailsExtractionResult,
    AccessResolveRequest,
    AdminGuestPassCreateRequest,
    AdminGuestPassRevokeRequest,
    GuestPassCode,
    KundliData,
    PassRedemptionRequest,
    PassRedemptionResult,
    PridictaChatRequest,
    PridictaChatResponse,
    ResolvedAccessResponse,
    ReleaseReadinessReport,
    SafetyAuditEvent,
    SafetyReportRequest,
    SafetyReviewRequest,
)

app = FastAPI(
    title="Predicta Astrology API",
    version="0.1.0",
)


@app.get("/health")
def health():
    return {"ok": True, "service": "pridicta-astro-api"}


@app.post("/generate-kundli", response_model=KundliData)
def generate_kundli_endpoint(details: BirthDetails):
    try:
        return generate_kundli(details)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - protects user-facing API edge.
        raise HTTPException(
            status_code=500,
            detail="Astrology calculation failed. Please verify birth details and try again.",
        ) from exc


@app.post("/ask-pridicta", response_model=PridictaChatResponse)
def ask_pridicta_endpoint(request: PridictaChatRequest):
    try:
        return ask_pridicta(request)
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail="Predicta is not ready to answer right now. Please try again shortly.",
        ) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - protects user-facing API edge.
        raise HTTPException(
            status_code=500,
            detail="Predicta could not answer right now. Please try again with one focused question.",
        ) from exc


@app.post("/extract-birth-details", response_model=BirthDetailsExtractionResult)
def extract_birth_details_endpoint(request: BirthDetailsExtractionRequest):
    try:
        return extract_birth_details(request)
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=503,
            detail="Predicta could not read birth details right now. Please enter the details manually.",
        ) from exc
    except AIProviderError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - protects user-facing API edge.
        raise HTTPException(
            status_code=500,
            detail="Birth details extraction failed. Please enter the details manually.",
        ) from exc


@app.post("/safety/report", response_model=SafetyAuditEvent)
def create_safety_report_endpoint(request: SafetyReportRequest):
    return create_safety_audit_event(
        request,
        fallback_identifier_parts=[request.route, request.sourceSurface],
    )


@app.get("/safety/admin/reports", response_model=list[SafetyAuditEvent])
def list_safety_reports_endpoint(
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    return list_safety_audit_events()


@app.post("/safety/admin/reports/{event_id}/review", response_model=SafetyAuditEvent)
def review_safety_report_endpoint(
    event_id: str,
    request: SafetyReviewRequest,
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    try:
        return review_safety_audit_event(event_id, request)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Safety report not found.") from exc


@app.get("/safety/admin/release-readiness", response_model=ReleaseReadinessReport)
def release_readiness_endpoint(
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    return evaluate_release_readiness()


@app.post("/access/resolve", response_model=ResolvedAccessResponse)
def resolve_access_endpoint(request: AccessResolveRequest):
    return resolve_access(request)


@app.post("/access/guest-pass/redeem", response_model=PassRedemptionResult)
def redeem_guest_pass_endpoint(request: PassRedemptionRequest):
    return redeem_guest_pass(request)


@app.get("/access/admin/guest-passes", response_model=list[GuestPassCode])
def list_admin_guest_passes(
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    return list_guest_passes()


@app.post("/access/admin/guest-passes", response_model=GuestPassCode)
def create_admin_guest_pass(
    request: AdminGuestPassCreateRequest,
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    pass_code = create_guest_pass_code(
        request,
        created_by="owner-console",
    )
    return save_guest_pass(pass_code)


@app.post("/access/admin/guest-passes/{code_id}/revoke", response_model=GuestPassCode)
def revoke_admin_guest_pass(
    code_id: str,
    request: AdminGuestPassRevokeRequest,
    x_pridicta_admin_token: Optional[str] = Header(default=None),
):
    require_admin_token(x_pridicta_admin_token)
    try:
        return revoke_guest_pass(code_id, request.reason)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Guest pass not found.") from exc


def require_admin_token(token: Optional[str]) -> None:
    if not admin_token_configured():
        raise HTTPException(
            status_code=503,
            detail="Owner access is not configured.",
        )
    if not is_admin_token_valid(token):
        raise HTTPException(status_code=403, detail="Admin access denied.")
