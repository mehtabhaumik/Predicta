import os

from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware

from backend.admin_api.observability import ObservabilityMiddleware
from backend.admin_api.rate_limit import RateLimitMiddleware
from backend.admin_api.routes import access_router, admin_router, billing_router
from backend.ai_api.routes import ai_router

from .calculations import generate_kundli
from .kundli_cache import (
    get_cached_kundli,
    get_kundli_cache_size,
    set_cached_kundli,
)
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
app.include_router(ai_router)


@app.get("/health")
def health():
    return {
        "kundliCacheEntries": get_kundli_cache_size(),
        "ok": True,
        "service": "pridicta-astro-api",
    }


@app.post("/generate-kundli", response_model=KundliData)
def generate_kundli_endpoint(details: BirthDetails, response: Response):
    try:
        cached = get_cached_kundli(details)
        if cached:
            response.headers["X-Predicta-Cache"] = "HIT"
            return cached

        kundli = generate_kundli(details)
        set_cached_kundli(kundli)
        response.headers["X-Predicta-Cache"] = "MISS"
        return kundli
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - protects user-facing API edge.
        raise HTTPException(
            status_code=500,
            detail="Astrology calculation failed. Please verify birth details and try again.",
        ) from exc
