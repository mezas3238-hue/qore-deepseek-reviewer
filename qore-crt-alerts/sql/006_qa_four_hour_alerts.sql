-- QORE CRT ALERTS / 006: isolated, temporary FOUR-HOUR QA inbox.
-- Applied ONLY to disposable PostgreSQL CI until an isolated CRT DB exists.
-- NO LIVE data, no sending, no FCM outbox, no TradingView webhook.
BEGIN;
CREATE SCHEMA IF NOT EXISTS qore_crt_alerts;

CREATE TABLE qore_crt_alerts.qa_alerts_4h (
  event_key TEXT NOT NULL CHECK (length(event_key) BETWEEN 16 AND 512),
  family TEXT NOT NULL CHECK (family IN (
    'CRT_2C_RETURN','CRT_3C_TRUE','INSIDE_RETURN',
    'INSIDE_CONTINUATION_REJECTED','MULTI4','MULTI_N','M15_RETEST'
  )),
  instrument_id TEXT NOT NULL CHECK (instrument_id ~ '^[A-Z0-9_]{3,16}$'),
  tv_symbol TEXT NOT NULL CHECK (tv_symbol ~ '^IC:[A-Z0-9_]{3,16}$'),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'CRT_OBSERVED','MSS_M5_OBSERVED','MSS_M15_OBSERVED'
  )),
  confirmed_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  invalidated_at TIMESTAMPTZ,
  invalidation_reason TEXT,
  evidence JSONB NOT NULL CHECK (jsonb_typeof(evidence) = 'object'),
  status TEXT GENERATED ALWAYS AS ('QUARANTINED_REPLAY'::TEXT) STORED,
  delivery_state TEXT GENERATED ALWAYS AS ('BLOCKED_NOT_CERTIFIED'::TEXT) STORED,
  inserted_at TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  PRIMARY KEY(event_key,family),
  CONSTRAINT exactly_four_hours CHECK (expires_at - confirmed_at = INTERVAL '4 hours'),
  CONSTRAINT invalidation_consistency CHECK (
    (invalidated_at IS NULL) = (invalidation_reason IS NULL)
  )
);
CREATE INDEX qa_alerts_4h_expiry_idx
  ON qore_crt_alerts.qa_alerts_4h(expires_at);
ALTER TABLE qore_crt_alerts.qa_alerts_4h ENABLE ROW LEVEL SECURITY;
ALTER TABLE qore_crt_alerts.qa_alerts_4h FORCE ROW LEVEL SECURITY;
REVOKE ALL ON SCHEMA qore_crt_alerts FROM PUBLIC;
REVOKE ALL ON TABLE qore_crt_alerts.qa_alerts_4h FROM PUBLIC;
-- PRIVATE schema, no grants to anon/authenticated. Explicit privileged
-- backend role must be configured later, never service_role in Android.
COMMENT ON TABLE qore_crt_alerts.qa_alerts_4h IS
 'QA closed-bar observations only. UTC TTL 4h; no FCM, no deliverable signals.';

CREATE FUNCTION qore_crt_alerts.qa_stage_4h_alert(p JSONB)
RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $body$
DECLARE
  confirmed TIMESTAMPTZ;
  key TEXT;
  family_id TEXT;
  previous JSONB;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object'
    OR p->>'schema' IS DISTINCT FROM 'QORE_CRT_MONITOR_QA_V2'
    OR p->>'mode' IS DISTINCT FROM 'OFFLINE_REPLAY'
    OR p->>'certification' IS DISTINCT FROM 'NOT_VERIFIED'
    OR p->>'transport' IS DISTINCT FROM 'DISABLED'
    OR p->>'deliveryState' IS DISTINCT FROM 'BLOCKED_NOT_CERTIFIED'
    OR p->>'sendPush' IS DISTINCT FROM 'false'
    OR p->>'actionable' IS DISTINCT FROM 'false'
    OR p->>'requiresRealFeedAndPineParity' IS DISTINCT FROM 'true'
    OR p->>'tvSymbol' NOT LIKE 'IC:%'
    OR p->>'eventId' NOT LIKE 'IC|%'
    OR p->>'eventAtMs' IS NULL THEN
    RAISE EXCEPTION 'QA_4H_BLOCKED: only IC market, non-sendable replay'
      USING ERRCODE='23514';
  END IF;
  key := p->>'eventId';
  family_id := p->>'family';
  IF key IS NULL OR length(key) NOT BETWEEN 16 AND 512
    OR family_id IS NULL OR length(family_id) > 64 THEN
    RAISE EXCEPTION 'QA_4H_BLOCKED: invalid event identity'
      USING ERRCODE='23514';
  END IF;
  confirmed := to_timestamp((p->>'eventAtMs')::DOUBLE PRECISION/1000.0);
  IF confirmed > transaction_timestamp()
    OR confirmed + INTERVAL '4 hours' <= transaction_timestamp() THEN
    RETURN 'QA_EXPIRED_OR_FUTURE_NOT_RECORDED';
  END IF;
  INSERT INTO qore_crt_alerts.qa_alerts_4h
    (event_key,family,instrument_id,tv_symbol,event_type,
     confirmed_at,expires_at,evidence)
  VALUES
    (key,family_id,p->>'instrumentId',p->>'tvSymbol',p->>'eventType',
     confirmed,confirmed+INTERVAL '4 hours',p)
  ON CONFLICT (event_key,family) DO NOTHING;
  IF FOUND THEN RETURN 'QA_STAGED_4H_NOT_SENDABLE'; END IF;
  SELECT evidence INTO previous
    FROM qore_crt_alerts.qa_alerts_4h
   WHERE event_key=key AND family=family_id;
  IF previous = p THEN RETURN 'QA_DUPLICATE_NOT_RENEWED'; END IF;
  RAISE EXCEPTION 'QA_4H_CONFLICT: divergent immutable event evidence'
    USING ERRCODE='23514';
END;
$body$;
REVOKE ALL ON FUNCTION qore_crt_alerts.qa_stage_4h_alert(JSONB) FROM PUBLIC;

CREATE FUNCTION qore_crt_alerts.qa_invalidate_4h_alert(
  p_event_key TEXT,p_family TEXT,p_reason TEXT
) RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $body$
DECLARE
  rowfound BOOLEAN;
  already TIMESTAMPTZ;
BEGIN
  IF p_event_key IS NULL OR p_family IS NULL OR
     p_reason IS NULL OR p_reason !~ '^[A-Z][A-Z0-9_]{2,47}$' THEN
    RAISE EXCEPTION 'QA_4H_BLOCKED: invalid invalidation identity'
      USING ERRCODE='23514';
  END IF;
  SELECT invalidated_at INTO already
    FROM qore_crt_alerts.qa_alerts_4h
   WHERE event_key=p_event_key AND family=p_family AND
     expires_at > transaction_timestamp();
  rowfound := FOUND;
  IF NOT rowfound THEN RETURN 'QA_NOT_ACTIVE_OR_EXPIRED'; END IF;
  IF already IS NOT NULL THEN RETURN 'QA_ALREADY_INVALIDATED'; END IF;
  UPDATE qore_crt_alerts.qa_alerts_4h
     SET invalidated_at=transaction_timestamp(),invalidation_reason=p_reason
   WHERE event_key=p_event_key AND family=p_family
     AND expires_at > transaction_timestamp()
     AND invalidated_at IS NULL;
  IF FOUND THEN RETURN 'QA_INVALIDATED_EARLY'; END IF;
  RETURN 'QA_ALREADY_INVALIDATED';
END;
$body$;
REVOKE ALL ON FUNCTION qore_crt_alerts.qa_invalidate_4h_alert(TEXT,TEXT,TEXT) FROM PUBLIC;

CREATE FUNCTION qore_crt_alerts.qa_purge_4h_alerts()
RETURNS INTEGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $body$
DECLARE count_deleted INTEGER;
BEGIN
  DELETE FROM qore_crt_alerts.qa_alerts_4h
   WHERE expires_at <= transaction_timestamp();
  GET DIAGNOSTICS count_deleted = ROW_COUNT;
  RETURN count_deleted;
END;
$body$;
REVOKE ALL ON FUNCTION qore_crt_alerts.qa_purge_4h_alerts() FROM PUBLIC;
COMMIT;
