"""One-shot cTrader DEMO market-data inventory probe (read-only).

Uses Spotware's official Python SDK only when executed explicitly on an
authorized host. No order messages, no Firebase, no market signal promotion.
Credentials are read exclusively from the local process environment and are
never printed, serialized or added to the repository.

Run from qore-crt-alerts:
  python3 -m ctrader_probe.readonly_inventory

Requires: pip install ctrader-open-api
and an Open API app + OAuth token authorized with scope=accounts (SCOPE_VIEW).
"""

from __future__ import annotations

import json
import os
import re
import sys
from collections.abc import Mapping
from typing import Any

DEMO_HOST = "demo.ctraderapi.com"
PROTOBUF_TLS_PORT = 5035
VIEW_SCOPE = 0
MAX_SECONDS = 30
ALLOWED_REQUESTS = frozenset({
    "ProtoOAApplicationAuthReq",
    "ProtoOAGetAccountListByAccessTokenReq",
    "ProtoOAAccountAuthReq",
    "ProtoOASymbolsListReq",
})


class FailClosed(ValueError):
    """Known non-secret failure, safe to report without provider payload."""


def require_env(env: Mapping[str, str]) -> tuple[str, str, str, int, str]:
    names = (
        "QORE_CT_CLIENT_ID",
        "QORE_CT_CLIENT_SECRET",
        "QORE_CT_VIEW_ACCESS_TOKEN",
        "QORE_CT_DEMO_ACCOUNT_ID",
    )
    values = []
    for name in names:
        value = env.get(name, "")
        if not isinstance(value, str) or not value.strip():
            raise FailClosed("MISSING_SECURE_VIEW_ONLY_CONFIGURATION")
        values.append(value.strip())
    if not re.fullmatch(r"[1-9][0-9]{0,17}", values[3]):
        raise FailClosed("INVALID_DEMO_ACCOUNT_ID")
    broker = env.get("QORE_CT_BROKER_LABEL", "UNVERIFIED_BROKER")
    if not isinstance(broker, str) or not re.fullmatch(r"[A-Za-z0-9_.:-]{1,80}", broker):
        raise FailClosed("INVALID_BROKER_LABEL")
    return values[0], values[1], values[2], int(values[3]), broker


def prove_view_only_demo(response: Any, wanted_account: int) -> None:
    """Never trust an environment variable saying 'DEMO' or 'view-only'."""
    scope = getattr(response, "permissionScope", None)
    present = getattr(response, "HasField", None)
    try:
        scope_explicit = callable(present) and present("permissionScope") is True
    except (TypeError, ValueError):
        scope_explicit = False
    if not scope_explicit or type(scope) is not int or scope != VIEW_SCOPE:
        raise FailClosed("CTRADER_REQUIRES_SCOPE_VIEW_NOT_TRADING")
    accounts = getattr(response, "ctidTraderAccount", None)
    if accounts is None:
        raise FailClosed("CTRADER_ACCOUNT_LIST_MISSING")
    selected = [
        account for account in accounts
        if getattr(account, "ctidTraderAccountId", None) == wanted_account
    ]
    if len(selected) != 1:
        raise FailClosed("CTRADER_ACCOUNT_NOT_AUTHORIZED_OR_AMBIGUOUS")
    account = selected[0]
    has_field = getattr(account, "HasField", None)
    if not callable(has_field):
        raise FailClosed("CTRADER_DEMO_EVIDENCE_MISSING")
    try:
        proven = has_field("isLive") is True
    except (ValueError, TypeError):
        proven = False
    if not proven or getattr(account, "isLive", None) is not False:
        raise FailClosed("CTRADER_LIVE_OR_UNVERIFIED_ACCOUNT_BLOCKED")


def inventory_from_response(response: Any, wanted_account: int) -> list[dict[str, Any]]:
    if getattr(response, "ctidTraderAccountId", None) != wanted_account:
        raise FailClosed("CTRADER_SYMBOL_ACCOUNT_MISMATCH")
    symbols = getattr(response, "symbol", None)
    if symbols is None:
        raise FailClosed("CTRADER_SYMBOL_INVENTORY_MISSING")
    rows: list[dict[str, Any]] = []
    seen_ids: set[int] = set()
    for item in symbols:
        symbol_id = getattr(item, "symbolId", None)
        symbol_name = getattr(item, "symbolName", None)
        enabled = getattr(item, "enabled", None)
        if (type(symbol_id) is not int or symbol_id <= 0 or
                type(symbol_name) is not str or not
                re.fullmatch(r"[A-Za-z0-9_.:-]{1,80}", symbol_name) or
                type(enabled) is not bool or symbol_id in seen_ids):
            raise FailClosed("CTRADER_SYMBOL_DATA_INVALID_OR_DUPLICATE")
        seen_ids.add(symbol_id)
        rows.append({"symbolId": symbol_id, "symbolName": symbol_name,
                     "enabled": enabled})
    return sorted(rows, key=lambda row: (row["symbolName"], row["symbolId"]))


def sanitized_report(*, rows: list[dict[str, Any]], broker_label: str) -> dict[str, Any]:
    enabled = sum(row["enabled"] is True for row in rows)
    return {
        "status": "DEMO_VIEW_ONLY_INVENTORY_OBSERVED",
        "mode": "READ_ONLY_DEMO",
        "brokerLabel": broker_label,
        "symbolCount": len(rows),
        "enabledSymbolCount": enabled,
        "sourceParityCertified": 0,
        "sendPush": False,
        "canTrade": False,
        "instrumentMappingsApproved": 0,
        "notes": "Symbols are not proof of TradingView IC/OANDA OHLC parity.",
        "discoveredSymbols": rows,
    }


def run_probe(env: Mapping[str, str]) -> dict[str, Any]:
    client_id, client_secret, access_token, account_id, broker = require_env(env)
    try:
        from ctrader_open_api import Client, Protobuf, TcpProtocol
        from ctrader_open_api.messages.OpenApiMessages_pb2 import (
            ProtoOAApplicationAuthReq,
            ProtoOAApplicationAuthRes,
            ProtoOAGetAccountListByAccessTokenReq,
            ProtoOAGetAccountListByAccessTokenRes,
            ProtoOAAccountAuthReq,
            ProtoOAAccountAuthRes,
            ProtoOASymbolsListReq,
            ProtoOASymbolsListRes,
        )
        from twisted.internet import reactor
    except ImportError as exc:
        raise FailClosed("CTRADER_OFFICIAL_SDK_NOT_INSTALLED") from exc

    outcome: dict[str, Any] = {}
    state = {"finished": False}
    client = Client(DEMO_HOST, PROTOBUF_TLS_PORT, TcpProtocol,
                    numberOfMessagesToSendPerSecond=5)

    def finish(*, data: dict[str, Any] | None = None, error: str | None = None) -> None:
        if state["finished"]:
            return
        state["finished"] = True
        if data is not None:
            outcome["result"] = data
        else:
            outcome["error"] = error or "CTRADER_PROBE_FAILED"
        try:
            client.stopService()
        except Exception:
            pass
        if reactor.running:
            reactor.callLater(0, reactor.stop)

    def request(msg_type: str, msg: Any, response_class: type, next_action: Any) -> None:
        if msg_type not in ALLOWED_REQUESTS:
            finish(error="CTRADER_REQUEST_NOT_READ_ONLY")
            return
        try:
            deferred = client.send(msg, clientMsgId="qore-view-only-inventory",
                                   responseTimeoutInSeconds=10.0)
        except Exception:
            finish(error="CTRADER_SEND_FAILED")
            return

        def ok(raw: Any) -> None:
            if state["finished"]:
                return
            try:
                decoded = Protobuf.extract(raw)
                if not isinstance(decoded, response_class):
                    raise FailClosed("CTRADER_UNEXPECTED_RESPONSE")
                next_action(decoded)
            except FailClosed as exc:
                finish(error=str(exc))
            except Exception:
                finish(error="CTRADER_RESPONSE_REJECTED")

        def err(_failure: Any) -> None:
            finish(error="CTRADER_REQUEST_FAILED")

        deferred.addCallbacks(ok, err)

    def on_symbols(res: Any) -> None:
        rows = inventory_from_response(res, account_id)
        finish(data=sanitized_report(rows=rows, broker_label=broker))

    def on_account_auth(res: Any) -> None:
        if getattr(res, "ctidTraderAccountId", None) != account_id:
            raise FailClosed("CTRADER_ACCOUNT_AUTH_MISMATCH")
        msg = ProtoOASymbolsListReq()
        msg.ctidTraderAccountId = account_id
        msg.includeArchivedSymbols = False
        request("ProtoOASymbolsListReq", msg, ProtoOASymbolsListRes, on_symbols)

    def on_accounts(res: Any) -> None:
        prove_view_only_demo(res, account_id)
        msg = ProtoOAAccountAuthReq()
        msg.ctidTraderAccountId = account_id
        msg.accessToken = access_token
        request("ProtoOAAccountAuthReq", msg, ProtoOAAccountAuthRes, on_account_auth)

    def on_app_auth(_res: Any) -> None:
        msg = ProtoOAGetAccountListByAccessTokenReq()
        msg.accessToken = access_token
        request("ProtoOAGetAccountListByAccessTokenReq",
                msg, ProtoOAGetAccountListByAccessTokenRes, on_accounts)

    def connected(_client: Any) -> None:
        msg = ProtoOAApplicationAuthReq()
        msg.clientId = client_id
        msg.clientSecret = client_secret
        request("ProtoOAApplicationAuthReq", msg,
                ProtoOAApplicationAuthRes, on_app_auth)

    def disconnected(_client: Any, _reason: Any) -> None:
        finish(error="CTRADER_DEMO_SESSION_DISCONNECTED")

    client.setConnectedCallback(connected)
    client.setDisconnectedCallback(disconnected)
    client.setMessageReceivedCallback(lambda *_args: None)
    reactor.callLater(MAX_SECONDS,
                      lambda: finish(error="CTRADER_DEMO_PROBE_TIMEOUT"))
    try:
        client.startService()
        reactor.run(installSignalHandlers=False)
    except Exception:
        finish(error="CTRADER_DEMO_TLS_OR_SDK_FAILED")
    if "result" not in outcome:
        raise FailClosed(outcome.get("error", "CTRADER_PROBE_NO_RESULT"))
    return outcome["result"]


def main() -> int:
    try:
        result = run_probe(os.environ)
    except FailClosed as exc:
        # Do not echo exception objects from SDK, configuration, OAuth or TLS.
        print(json.dumps({"status": "BLOCKED",
                          "reason": str(exc),
                          "sendPush": False, "canTrade": False}),
              file=sys.stderr)
        return 1
    print(json.dumps(result, ensure_ascii=False, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
