import os
from datetime import datetime, timezone
from typing import Optional

from fastapi import FastAPI, HTTPException, Request, Response
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
        "http://localhost:3000,http://localhost:3005,https://predicta.rudraix.com,https://predicta.bhaumikmehta.com,https://predicta-a4758.web.app",
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


def _clean_host(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    host = value.split(",")[0].strip().split(":")[0].lower()
    return host or None


def _resolve_public_site_origin(request: Request) -> str:
    forwarded_host = _clean_host(request.headers.get("x-forwarded-host"))
    forwarded_proto = request.headers.get("x-forwarded-proto")
    host = forwarded_host or _clean_host(request.headers.get("host")) or request.url.hostname

    if not host:
        return "https://predicta.rudraix.com"

    if host == "api.predicta.rudraix.com":
        return "https://predicta.rudraix.com"

    if host == "api.predicta.bhaumikmehta.com":
        return "https://predicta.bhaumikmehta.com"

    if host == "predicta-a4758.web.app":
        return "https://predicta-a4758.web.app"

    if host.startswith("localhost") or host.startswith("127.0.0.1"):
        return f"http://{host}"

    scheme = "https" if (forwarded_proto or request.url.scheme) != "http" else "https"
    return f"{scheme}://{host}"


@app.get("/health")
def health():
    return {
        "kundliCacheEntries": get_kundli_cache_size(),
        "ok": True,
        "service": "pridicta-astro-api",
    }


@app.api_route("/robots.txt", methods=["GET", "HEAD"])
def robots_txt(request: Request):
    origin = _resolve_public_site_origin(request)
    if origin.endswith(".web.app"):
        body = "\n".join(
            [
                "User-Agent: *",
                "Disallow: /",
            ]
        )
    else:
        body = "\n".join(
            [
                "User-Agent: *",
                "Allow: /",
                "Allow: /pricing",
                "Allow: /founder",
                "Disallow: /dashboard",
                "Disallow: /dashboard/",
                "",
                f"Sitemap: {origin}/sitemap.xml",
            ]
        )
    return Response(content=body, media_type="text/plain; charset=utf-8")


@app.api_route("/sitemap.xml", methods=["GET", "HEAD"])
def sitemap_xml(request: Request):
    origin = _resolve_public_site_origin(request)
    last_modified = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace(
        "+00:00", "Z"
    )

    if origin.endswith(".web.app"):
        body = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>
"""
        return Response(content=body, media_type="application/xml; charset=utf-8")

    body = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>{origin}</loc>
    <lastmod>{last_modified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>{origin}/pricing</loc>
    <lastmod>{last_modified}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>{origin}/founder</loc>
    <lastmod>{last_modified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
"""
    return Response(content=body, media_type="application/xml; charset=utf-8")


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
