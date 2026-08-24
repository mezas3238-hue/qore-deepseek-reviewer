#!/usr/bin/env python3
from __future__ import annotations

from typing import Any

import deepseek_reviewer as reviewer


_original_api_call = reviewer.api_call


def resilient_api_call(messages: list[dict[str, Any]]) -> dict[str, Any]:
    response = _original_api_call(messages)
    choices = response.get("choices") or []
    if not choices:
        return response

    choice = choices[0]
    msg = choice.get("message") or {}
    tool_calls = msg.get("tool_calls") or []
    content = (msg.get("content") or "").strip()
    if tool_calls or content:
        return response

    print(
        "DeepSeek returned no final content; requesting an explicit final review "
        f"after finish_reason={choice.get('finish_reason')!r}."
    )
    final_messages = list(messages)
    final_messages.append(
        {
            "role": "user",
            "content": (
                "Your repository investigation is complete. Do not call tools. "
                "Return the final self-contained QORE engineering review now. "
                "State the exact package and binding checked, all material findings "
                "with severity and concrete witnesses, historical closure status, "
                "scope/authority assessment, and a clear overall result. If there "
                "is no material defect, explicitly say VALIDACIÓN OK. Keep the final "
                "review concise enough to fit the response budget."
            ),
        }
    )

    final_response = _original_api_call(final_messages)
    final_choices = final_response.get("choices") or []
    if final_choices:
        final_msg = final_choices[0].get("message") or {}
        print(
            "Finalization response: "
            f"finish_reason={final_choices[0].get('finish_reason')!r}, "
            f"content_chars={len((final_msg.get('content') or '').strip())}."
        )
    return final_response


reviewer.api_call = resilient_api_call


if __name__ == "__main__":
    raise SystemExit(reviewer.main())
