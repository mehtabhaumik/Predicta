from __future__ import annotations

import os
from typing import Any, Dict, Iterable, List, Optional

import httpx

from .models import ConversationTurn


class AIProviderUnavailable(RuntimeError):
    """Raised when a server-side AI provider is not configured."""


class AIProviderError(RuntimeError):
    """Raised when a configured AI provider fails."""

    def __init__(
        self,
        message: str,
        *,
        provider: str | None = None,
        response_body: str | None = None,
        status_code: int | None = None,
    ):
        super().__init__(message)
        self.provider = provider
        self.response_body = response_body or ""
        self.status_code = status_code


OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses"
GEMINI_GENERATE_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
)


def get_openai_api_key() -> str:
    return _get_required_secret("PREDICTA_OPENAI_API_KEY")


def get_gemini_api_key() -> Optional[str]:
    return os.getenv("PREDICTA_GEMINI_API_KEY", "").strip() or None


def get_openai_timeout_seconds() -> float:
    return _env_float("PREDICTA_OPENAI_TIMEOUT_SECONDS", 30)


def get_gemini_timeout_seconds() -> float:
    return _env_float("PREDICTA_GEMINI_TIMEOUT_SECONDS", 12)


def _get_required_secret(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise AIProviderUnavailable(f"{name} is not configured on the backend.")
    return value


async def compact_with_gemini(
    *,
    prompt: str,
    model: str,
    timeout_seconds: float | None = None,
) -> Optional[str]:
    api_key = get_gemini_api_key()
    if not api_key:
        return None

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 900, "temperature": 0.2},
    }

    try:
        async with httpx.AsyncClient(
            timeout=timeout_seconds or get_gemini_timeout_seconds()
        ) as client:
            response = await client.post(
                GEMINI_GENERATE_URL.format(model=model),
                params={"key": api_key},
                json=payload,
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        # Gemini is helper-only. If compaction fails, OpenAI still receives the
        # already compressed structured context from the caller.
        return None

    text = extract_gemini_text(response.json()).strip()
    return text or None


async def generate_openai_response(
    *,
    max_output_tokens: int,
    messages: Iterable[Dict[str, str]],
    model: str,
    timeout_seconds: float | None = None,
) -> str:
    api_key = get_openai_api_key()
    payload = {
        "input": list(messages),
        "max_output_tokens": max_output_tokens,
        "model": model,
    }

    try:
        async with httpx.AsyncClient(
            timeout=timeout_seconds or get_openai_timeout_seconds()
        ) as client:
            response = await client.post(
                OPENAI_RESPONSES_URL,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise AIProviderError(
            "OpenAI request failed.",
            provider="openai",
            response_body=exc.response.text[:800],
            status_code=exc.response.status_code,
        ) from exc
    except httpx.HTTPError as exc:
        raise AIProviderError(
            "OpenAI request could not be completed.",
            provider="openai",
        ) from exc

    text = extract_openai_text(response.json()).strip()
    if not text:
        raise AIProviderError("OpenAI returned an empty response.", provider="openai")
    return text


async def generate_gemini_response(
    *,
    max_output_tokens: int,
    model: str,
    system_prompt: str,
    user_prompt: str,
    timeout_seconds: float | None = None,
) -> str:
    api_key = get_gemini_api_key()
    if not api_key:
        raise AIProviderUnavailable("Gemini is not configured on the backend.")

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": "\n\n".join(
                            [
                                system_prompt,
                                "Use the following context and user question to answer as Predicta.",
                                user_prompt,
                            ]
                        )
                    }
                ],
                "role": "user",
            }
        ],
        "generationConfig": {
            "maxOutputTokens": max_output_tokens,
            "temperature": 0.45,
        },
    }

    try:
        async with httpx.AsyncClient(
            timeout=timeout_seconds or get_gemini_timeout_seconds()
        ) as client:
            response = await client.post(
                GEMINI_GENERATE_URL.format(model=model),
                params={"key": api_key},
                json=payload,
            )
            response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise AIProviderError(
            "Gemini request failed.",
            provider="gemini",
            response_body=exc.response.text[:800],
            status_code=exc.response.status_code,
        ) from exc
    except httpx.HTTPError as exc:
        raise AIProviderError(
            "Gemini request could not be completed.",
            provider="gemini",
        ) from exc

    text = extract_gemini_text(response.json()).strip()
    if not text:
        raise AIProviderError("Gemini returned an empty response.", provider="gemini")
    return text


def should_fallback_from_openai(exc: BaseException) -> bool:
    if isinstance(exc, AIProviderUnavailable):
        return True
    if not isinstance(exc, AIProviderError):
        return False
    if exc.provider not in (None, "openai"):
        return False
    if exc.status_code in {401, 403, 408, 409, 429, 500, 502, 503, 504}:
        return True

    haystack = f"{exc} {exc.response_body}".lower()
    fallback_markers = (
        "billing",
        "insufficient_quota",
        "quota",
        "rate limit",
        "rate_limit",
        "timeout",
        "temporarily unavailable",
        "server error",
        "overloaded",
    )
    return any(marker in haystack for marker in fallback_markers)


def extract_openai_text(response: Dict[str, Any]) -> str:
    output_text = response.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text

    output = response.get("output")
    if not isinstance(output, list):
        return ""

    parts: List[str] = []
    for item in output:
        if not isinstance(item, dict):
            continue
        content = item.get("content")
        if not isinstance(content, list):
            continue
        for content_item in content:
            if isinstance(content_item, dict) and isinstance(content_item.get("text"), str):
                parts.append(content_item["text"])
    return "\n".join(parts)


def extract_gemini_text(response: Dict[str, Any]) -> str:
    candidates = response.get("candidates")
    if not isinstance(candidates, list):
        return ""

    parts: List[str] = []
    for candidate in candidates:
        if not isinstance(candidate, dict):
            continue
        content = candidate.get("content")
        if not isinstance(content, dict):
            continue
        for part in content.get("parts") or []:
            if isinstance(part, dict) and isinstance(part.get("text"), str):
                parts.append(part["text"])
    return "\n".join(parts)


def _env_float(name: str, default: float) -> float:
    raw_value = os.getenv(name)
    if raw_value is None:
        return default
    try:
        value = float(raw_value)
    except ValueError:
        return default
    return max(value, 0.1)
