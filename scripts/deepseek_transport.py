#!/usr/bin/env python3
from __future__ import annotations

import argparse
import http.client
import io
import json
import urllib.error
import urllib.request
from collections.abc import Callable
from typing import Any, Protocol

MAX_TRANSPORT_ATTEMPTS = 2


class _Response(Protocol):
    def __enter__(self) -> "_Response": ...

    def __exit__(self, exc_type: object, exc: object, tb: object) -> None: ...

    def read(self) -> bytes: ...


UrlOpen = Callable[..., _Response]


def _request(api_url: str, api_key: str, payload: dict[str, Any]) -> urllib.request.Request:
    return urllib.request.Request(
        api_url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )


def _decode_object(raw: bytes) -> dict[str, Any]:
    decoded = raw.decode("utf-8")
    value = json.loads(decoded)
    if not isinstance(value, dict):
        raise RuntimeError("DeepSeek response must be a JSON object")
    return value


def post_json_with_bounded_transport_retry(
    *,
    api_url: str,
    api_key: str,
    payload: dict[str, Any],
    timeout: int = 300,
    urlopen: UrlOpen = urllib.request.urlopen,
) -> tuple[dict[str, Any], int]:
    """POST one logical request with one explicit retry for broken transport only.

    HTTP errors are never retried. There is no sleep/backoff. The function returns the
    number of transport retries so callers can persist that fact in their audit trail.
    """

    last_transport_error: BaseException | None = None
    for attempt in range(1, MAX_TRANSPORT_ATTEMPTS + 1):
        raw: bytes | None = None
        try:
            with urlopen(_request(api_url, api_key, payload), timeout=timeout) as response:
                raw = response.read()
            return _decode_object(raw), attempt - 1
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode("utf-8", errors="replace")
            raise RuntimeError(f"DeepSeek HTTP {exc.code}: {detail}") from exc
        except http.client.IncompleteRead as exc:
            last_transport_error = exc
            summary = (
                f"IncompleteRead partial_bytes={len(exc.partial)}"
                if isinstance(exc.partial, bytes)
                else "IncompleteRead"
            )
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            last_transport_error = exc
            summary = type(exc).__name__
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            last_transport_error = exc
            summary = f"{type(exc).__name__} body_bytes={len(raw or b'')}"

        if attempt >= MAX_TRANSPORT_ATTEMPTS:
            raise RuntimeError(
                "DeepSeek transport failed after 2 bounded attempts; " + summary
            ) from last_transport_error
        print(
            "QORE DeepSeek transport retry "
            f"attempt={attempt + 1}/{MAX_TRANSPORT_ATTEMPTS} cause={summary}"
        )

    raise AssertionError("unreachable transport retry state")


class _FakeResponse:
    def __init__(self, *, body: bytes | None = None, incomplete: bytes | None = None) -> None:
        self._body = body
        self._incomplete = incomplete

    def __enter__(self) -> "_FakeResponse":
        return self

    def __exit__(self, exc_type: object, exc: object, tb: object) -> None:
        return None

    def read(self) -> bytes:
        if self._incomplete is not None:
            raise http.client.IncompleteRead(self._incomplete)
        assert self._body is not None
        return self._body


class _SequenceOpener:
    def __init__(self, responses: list[_FakeResponse]) -> None:
        self._responses = responses
        self.calls = 0

    def __call__(self, request: object, timeout: int) -> _FakeResponse:
        del request, timeout
        response = self._responses[self.calls]
        self.calls += 1
        return response


def _self_test() -> None:
    opener = _SequenceOpener(
        [
            _FakeResponse(incomplete=b"{"),
            _FakeResponse(body=b'{"choices": [], "model": "deepseek-v4-pro"}'),
        ]
    )
    result, retries = post_json_with_bounded_transport_retry(
        api_url="https://example.invalid/chat/completions",
        api_key="test-key",
        payload={"model": "deepseek-v4-pro"},
        urlopen=opener,
    )
    assert result["model"] == "deepseek-v4-pro"
    assert retries == 1
    assert opener.calls == 2

    malformed = _SequenceOpener(
        [
            _FakeResponse(body=b"{"),
            _FakeResponse(body=b'{"ok": true}'),
        ]
    )
    result, retries = post_json_with_bounded_transport_retry(
        api_url="https://example.invalid/chat/completions",
        api_key="test-key",
        payload={"model": "deepseek-v4-pro"},
        urlopen=malformed,
    )
    assert result == {"ok": True}
    assert retries == 1
    assert malformed.calls == 2

    http_calls = 0

    def http_failure(request: object, timeout: int) -> _FakeResponse:
        nonlocal http_calls
        del request, timeout
        http_calls += 1
        raise urllib.error.HTTPError(
            "https://example.invalid/chat/completions",
            429,
            "rate limited",
            {},
            io.BytesIO(b'{"error":"rate limited"}'),
        )

    try:
        post_json_with_bounded_transport_retry(
            api_url="https://example.invalid/chat/completions",
            api_key="test-key",
            payload={"model": "deepseek-v4-pro"},
            urlopen=http_failure,
        )
    except RuntimeError as exc:
        assert "DeepSeek HTTP 429" in str(exc)
    else:
        raise AssertionError("HTTP error must fail closed without retry")
    assert http_calls == 1
    print("QORE DeepSeek bounded transport retry self-test: PASS")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        _self_test()
        return 0
    parser.error("only --self-test is supported")
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
