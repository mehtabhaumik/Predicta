from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field


AccessLevel = Literal["FREE", "GUEST", "VIP_GUEST", "FULL_ACCESS", "ADMIN"]
GuestAccessLevel = Literal["GUEST", "VIP_GUEST", "FULL_ACCESS"]
PassCodeType = Literal[
    "GUEST_TRIAL",
    "VIP_REVIEW",
    "INVESTOR_PASS",
    "FAMILY_PASS",
    "INTERNAL_TEST",
]


class GuestUsageLimits(BaseModel):
    questionsTotal: int = Field(ge=0)
    deepReadingsTotal: int = Field(ge=0)
    premiumPdfsTotal: int = Field(ge=0)


class CreateGuestPassCodeRequest(BaseModel):
    label: str = Field(min_length=2, max_length=120)
    type: PassCodeType
    accessLevel: GuestAccessLevel
    maxRedemptions: int = Field(ge=1, le=1000)
    allowedEmails: Optional[List[str]] = None
    expiresAt: Optional[str] = None
    rawCode: Optional[str] = Field(default=None, min_length=6, max_length=120)
    codeId: Optional[str] = Field(default=None, min_length=4, max_length=80)


class GuestPassCodeResponse(BaseModel):
    codeId: str
    label: str
    type: PassCodeType
    accessLevel: GuestAccessLevel
    maxRedemptions: int
    redemptionCount: int
    remainingRedemptions: int
    deviceLimit: int
    deviceCount: int
    allowedEmailCount: int
    expiresAt: str
    isActive: bool
    usageLimits: GuestUsageLimits


class CreateGuestPassCodeResponse(BaseModel):
    rawCode: str
    formattedCode: str
    passCode: GuestPassCodeResponse


class RevokeGuestPassCodeRequest(BaseModel):
    reason: str = Field(min_length=2, max_length=240)


class RedeemPassCodeRequest(BaseModel):
    code: str = Field(min_length=4, max_length=120)
    deviceId: str = Field(min_length=4, max_length=160)


class RedeemedGuestPassResponse(BaseModel):
    passCodeId: str
    type: PassCodeType
    accessLevel: GuestAccessLevel
    label: str
    redeemedAt: str
    expiresAt: str
    questionsUsed: int
    deepReadingsUsed: int
    premiumPdfsUsed: int
    usageLimits: GuestUsageLimits


class AccessGrantRequest(BaseModel):
    accessLevel: Literal["FREE", "FULL_ACCESS", "ADMIN"]
    reason: str = Field(min_length=2, max_length=240)
    userId: Optional[str] = Field(default=None, min_length=4, max_length=160)
    email: Optional[str] = Field(default=None, min_length=3, max_length=254)


class AccessGrantResponse(BaseModel):
    userId: str
    email: Optional[str]
    admin: bool
    fullAccess: bool
    updatedAt: str


class BillingVerificationRequest(BaseModel):
    platform: Literal["google_play", "app_store"]
    productId: str = Field(min_length=2, max_length=160)
    purchaseToken: Optional[str] = Field(default=None, max_length=4000)
    transactionId: Optional[str] = Field(default=None, max_length=240)
