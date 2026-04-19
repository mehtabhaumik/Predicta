import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from backend.admin_api.observability import ObservabilityMiddleware
from backend.admin_api.rate_limit import RateLimitMiddleware
from backend.admin_api.routes import access_router, admin_router, billing_router

from .calculations import generate_kundli
from .models import BirthDetails, KundliData

app = FastAPI(
    title="Pridicta Astrology API",
    version="0.1.0",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "PREDICTA_ALLOWED_ORIGINS",
        "http://localhost:3000,https://predicta.rudraix.com,https://predicta-a4758.web.app",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_headers=["Authorization", "Content-Type"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_origins=allowed_origins,
)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(ObservabilityMiddleware)

app.include_router(admin_router)
app.include_router(access_router)
app.include_router(billing_router)


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
