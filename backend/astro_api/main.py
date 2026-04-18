from fastapi import FastAPI, HTTPException

from .calculations import generate_kundli
from .models import BirthDetails, KundliData

app = FastAPI(
    title="Pridicta Astrology API",
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
