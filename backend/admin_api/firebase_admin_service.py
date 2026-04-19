from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Optional


class FirebaseAdminUnavailable(RuntimeError):
    """Raised when the Firebase Admin SDK or credentials are not configured."""


@dataclass(frozen=True)
class AuthenticatedActor:
    uid: str
    email: Optional[str]
    admin: bool
    full_access: bool


def _load_firebase_modules():
    try:
        import firebase_admin
        from firebase_admin import auth, credentials, firestore
    except ImportError as exc:  # pragma: no cover - depends on deployment deps.
        raise FirebaseAdminUnavailable(
            "firebase-admin is not installed. Install backend/requirements.txt before using admin endpoints."
        ) from exc

    return firebase_admin, auth, credentials, firestore


def initialize_firebase_admin() -> Any:
    firebase_admin, _, credentials, _ = _load_firebase_modules()

    if firebase_admin._apps:
        return firebase_admin.get_app()

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        try:
            service_account = json.loads(service_account_json)
        except json.JSONDecodeError as exc:
            raise FirebaseAdminUnavailable("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.") from exc
        return firebase_admin.initialize_app(credentials.Certificate(service_account))

    # Uses GOOGLE_APPLICATION_CREDENTIALS locally or application default credentials in cloud.
    try:
        return firebase_admin.initialize_app()
    except Exception as exc:  # pragma: no cover - credentials are environment dependent.
        raise FirebaseAdminUnavailable(
            "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON "
            "or GOOGLE_APPLICATION_CREDENTIALS on the backend."
        ) from exc


def get_auth_module():
    initialize_firebase_admin()
    _, auth, _, _ = _load_firebase_modules()
    return auth


def get_firestore_client():
    initialize_firebase_admin()
    _, _, _, firestore = _load_firebase_modules()
    return firestore.client()


def get_firestore_module():
    initialize_firebase_admin()
    _, _, _, firestore = _load_firebase_modules()
    return firestore


def bootstrap_admin_emails() -> set[str]:
    raw_value = os.getenv("PREDICTA_BOOTSTRAP_ADMIN_EMAILS", "")
    return {
        email.strip().lower()
        for email in raw_value.split(",")
        if email.strip()
    }


def verify_authorization_header(authorization: Optional[str]) -> AuthenticatedActor:
    if not authorization or not authorization.startswith("Bearer "):
        raise PermissionError("A Firebase ID token is required.")

    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise PermissionError("A Firebase ID token is required.")

    auth = get_auth_module()
    decoded = auth.verify_id_token(token)
    email = decoded.get("email")
    normalized_email = email.strip().lower() if isinstance(email, str) else None
    return AuthenticatedActor(
        uid=decoded["uid"],
        email=normalized_email,
        admin=bool(decoded.get("admin")),
        full_access=bool(decoded.get("fullAccess")),
    )


def can_use_admin_tools(actor: AuthenticatedActor) -> bool:
    return actor.admin or (actor.email in bootstrap_admin_emails())


def get_user_record(*, user_id: Optional[str], email: Optional[str]):
    auth = get_auth_module()
    if user_id:
        return auth.get_user(user_id)
    if email:
        return auth.get_user_by_email(email.strip().lower())
    raise ValueError("Either userId or email is required.")


def set_access_claims(*, user_id: str, admin: bool, full_access: bool) -> None:
    auth = get_auth_module()
    user_record = auth.get_user(user_id)
    existing_claims = dict(user_record.custom_claims or {})
    existing_claims["admin"] = admin
    existing_claims["fullAccess"] = full_access
    auth.set_custom_user_claims(user_id, existing_claims)


def write_admin_audit_log(action: dict) -> None:
    db = get_firestore_client()
    db.collection("adminAuditLogs").document(action["actionId"]).set(action)
