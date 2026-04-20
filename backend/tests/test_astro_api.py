from fastapi.testclient import TestClient

from backend.astro_api.calculations import generate_kundli
from backend.astro_api import main as astro_main
from backend.astro_api import kundli_cache
from backend.astro_api.main import app
from backend.astro_api.models import BirthDetails


VALID_BIRTH = {
    "name": "Aarav Mehta",
    "date": "1994-08-16",
    "time": "06:42",
    "place": "Mumbai, India",
    "latitude": 19.076,
    "longitude": 72.8777,
    "timezone": "Asia/Kolkata",
}


def test_health():
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True
    assert "kundliCacheEntries" in response.json()


def test_generate_kundli_shape_and_metadata():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    assert kundli.lagna in {
        "Aries",
        "Taurus",
        "Gemini",
        "Cancer",
        "Leo",
        "Virgo",
        "Libra",
        "Scorpio",
        "Sagittarius",
        "Capricorn",
        "Aquarius",
        "Pisces",
    }
    assert len(kundli.planets) == 9
    assert len(kundli.houses) == 12
    assert kundli.charts["D1"].supported is True
    assert kundli.charts["D9"].supported is True
    assert kundli.charts["D10"].supported is True
    assert kundli.charts["D60"].supported is False
    assert kundli.calculationMeta.ayanamsa == "LAHIRI"


def test_ashtakavarga_totals_are_self_checking():
    kundli = generate_kundli(BirthDetails(**VALID_BIRTH))
    expected_totals = {
        "Sun": 48,
        "Moon": 49,
        "Mars": 39,
        "Mercury": 54,
        "Jupiter": 56,
        "Venus": 52,
        "Saturn": 39,
    }
    for planet, total in expected_totals.items():
        assert sum(kundli.ashtakavarga.bav[planet]) == total
    assert sum(kundli.ashtakavarga.sav) == 337
    assert kundli.ashtakavarga.totalScore == 337


def test_api_rejects_invalid_timezone():
    client = TestClient(app)
    response = client.post(
        "/generate-kundli",
        json={**VALID_BIRTH, "timezone": "Not/AZone"},
    )
    assert response.status_code == 422


def test_generate_kundli_endpoint_uses_cache(monkeypatch):
    kundli_cache._kundli_cache.clear()
    calls = {"generate": 0}
    real_generate = astro_main.generate_kundli

    def wrapped_generate(details):
        calls["generate"] += 1
        return real_generate(details)

    monkeypatch.setattr(astro_main, "generate_kundli", wrapped_generate)

    client = TestClient(app)
    first = client.post("/generate-kundli", json=VALID_BIRTH)
    second = client.post("/generate-kundli", json=VALID_BIRTH)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.headers["X-Predicta-Cache"] == "MISS"
    assert second.headers["X-Predicta-Cache"] == "HIT"
    assert calls["generate"] == 1
