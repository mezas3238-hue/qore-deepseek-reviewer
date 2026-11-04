"""Pure unit tests: NEVER contact Spotware or require credentials."""
from __future__ import annotations

import unittest
from types import SimpleNamespace

from ctrader_probe.readonly_inventory import (
    ALLOWED_REQUESTS, DEMO_HOST, PROTOBUF_TLS_PORT,
    FailClosed, inventory_from_response, prove_view_only_demo,
    require_env, sanitized_report,
)


class Account:
    def __init__(self, account_id=123, is_live=False, is_live_present=True):
        self.ctidTraderAccountId = account_id
        self.isLive = is_live
        self._is_live_present = is_live_present

    def HasField(self, field):
        if field != "isLive":
            raise ValueError("unknown")
        return self._is_live_present


class AccountResponse:
    def __init__(self, scope=0, accounts=None, present=True):
        self.permissionScope = scope
        self.ctidTraderAccount = [Account()] if accounts is None else accounts
        self._present = present

    def HasField(self, field):
        if field == "permissionScope":
            return self._present
        raise ValueError("unknown")


class TestViewOnlyGate(unittest.TestCase):
    def test_demo_only_readonly_scope(self):
        self.assertIsNone(prove_view_only_demo(AccountResponse(), 123))
        for response in (
            AccountResponse(scope=1),
            AccountResponse(scope=None),
            AccountResponse(scope=True),
            AccountResponse(scope=0, present=False),
            AccountResponse(accounts=[Account(is_live=True)]),
            AccountResponse(accounts=[Account(is_live_present=False)]),
            AccountResponse(accounts=[Account(account_id=456)]),
            AccountResponse(accounts=[Account(), Account()]),
            AccountResponse(accounts=[]),
        ):
            with self.subTest(response=response):
                with self.assertRaises(FailClosed):
                    prove_view_only_demo(response, 123)

    def test_missing_field_checker_is_rejected(self):
        payload = SimpleNamespace(permissionScope=0, ctidTraderAccount=[Account()])
        with self.assertRaises(FailClosed):
            prove_view_only_demo(payload, 123)
        payload = SimpleNamespace(permissionScope=0, ctidTraderAccount=[
            SimpleNamespace(ctidTraderAccountId=123, isLive=False)])
        with self.assertRaises(FailClosed):
            prove_view_only_demo(payload, 123)

    def test_no_trading_orders_or_live_host(self):
        self.assertEqual(DEMO_HOST, "demo.ctraderapi.com")
        self.assertEqual(PROTOBUF_TLS_PORT, 5035)
        self.assertEqual(len(ALLOWED_REQUESTS), 5)
        self.assertFalse(any(
            text in request
            for request in ALLOWED_REQUESTS
            for text in ("Order", "Position", "Close", "Amend", "Cancel", "Trade")
        ))

    def test_required_env_does_not_log_tokens(self):
        creds = {"QORE_CT_CLIENT_ID": "sample-id",
                 "QORE_CT_CLIENT_SECRET": "do-not-log-me",
                 "QORE_CT_VIEW_ACCESS_TOKEN": "do-not-log-token",
                 "QORE_CT_DEMO_ACCOUNT_ID": "123",
                 "QORE_CT_BROKER_LABEL": "DemoBroker"}
        parsed = require_env(creds)
        self.assertEqual(parsed[3:], (123, "DemoBroker"))
        with self.assertRaises(FailClosed) as cm:
            require_env({"QORE_CT_CLIENT_ID": "bad"})
        self.assertNotIn("sample-id", str(cm.exception))
        with self.assertRaises(FailClosed):
            require_env({**creds, "QORE_CT_DEMO_ACCOUNT_ID": "0"})
        with self.assertRaises(FailClosed):
            require_env({**creds, "QORE_CT_BROKER_LABEL": "Demo\nBroker"})


class TestViewOnlySymbolInventory(unittest.TestCase):
    @staticmethod
    def symbols(*rows, account_id=123):
        return SimpleNamespace(ctidTraderAccountId=account_id,
                               symbol=[SimpleNamespace(**data) for data in rows])

    def test_enabled_symbol_inventory_and_sanitization(self):
        raw = self.symbols(
            {"symbolId": 21, "symbolName": "USDCAD", "enabled": True},
            {"symbolId": 2, "symbolName": "XAUUSD", "enabled": False})
        rows = inventory_from_response(raw, 123)
        self.assertEqual([x["symbolName"] for x in rows], ["USDCAD", "XAUUSD"])
        report = sanitized_report(rows=rows, broker_label="DemoBroker")
        self.assertEqual(report["status"], "DEMO_VIEW_ONLY_INVENTORY_OBSERVED")
        self.assertEqual(report["enabledSymbolCount"], 1)
        self.assertEqual(report["sourceParityCertified"], 0)
        self.assertEqual(report["instrumentMappingsApproved"], 0)
        self.assertFalse(report["sendPush"])
        self.assertFalse(report["canTrade"])
        self.assertNotIn("accountId", report)
        self.assertNotIn("token", repr(report).lower())

    def test_identity_drift_duplicated_symbols_or_malformed_are_rejected(self):
        good = {"symbolId": 21, "symbolName": "USDCAD", "enabled": True}
        invalid = [
            self.symbols(good, account_id=999),
            self.symbols(good, good),
            self.symbols({"symbolId": 0, "symbolName": "USD", "enabled": True}),
            self.symbols({"symbolId": 1, "symbolName": "USD\nINJECT", "enabled": True}),
            self.symbols({"symbolId": 1, "symbolName": "USD", "enabled": None}),
        ]
        for raw in invalid:
            with self.subTest(raw=raw):
                with self.assertRaises(FailClosed):
                    inventory_from_response(raw, 123)
        with self.assertRaises(FailClosed):
            inventory_from_response(SimpleNamespace(ctidTraderAccountId=123), 123)


if __name__ == "__main__":
    unittest.main()
