-- QORE CRT ALERTS / staging-only proposal.
-- This migration has NOT been applied to any Supabase/Railway instance.
-- Explicitly NO LIVE signals, no FCM outbox, no permissive app RLS.
BEGIN;
CREATE SCHEMA IF NOT EXISTS qore_crt_alerts;
CREATE TABLE IF NOT EXISTS qore_crt_alerts.replay_observations (
  event_key TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL CHECK (fingerprint ~ '^[a-f0-9]{64}$'),
  source_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  instrument_id TEXT NOT NULL,
  family TEXT NOT NULL CHECK (family IN ('forex','index')),
  c1_start_ms BIGINT NOT NULL CHECK (c1_start_ms > 0),
  mss_m15_at_ms BIGINT NOT NULL CHECK (mss_m15_at_ms > c1_start_ms),
  ohlc_sha256 TEXT NOT NULL CHECK (ohlc_sha256 ~ '^[a-f0-9]{64}$'),
  mss_m5_at_ms BIGINT,
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload)='object'),
  status TEXT NOT NULL DEFAULT 'QUARANTINED_REPLAY'
    CHECK (status='QUARANTINED_REPLAY'),
  delivery_state TEXT GENERATED ALWAYS AS ('BLOCKED_NOT_CERTIFIED'::TEXT) STORED,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  CHECK (length(event_key) BETWEEN 1 AND 512),
  CHECK (length(source_id) BETWEEN 1 AND 256),
  CHECK (length(provider) BETWEEN 1 AND 256),
  CHECK (length(instrument_id) BETWEEN 1 AND 256)
);
ALTER TABLE qore_crt_alerts.replay_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qore_crt_alerts.replay_observations FORCE ROW LEVEL SECURITY;
-- No policies: authenticated, anonymous, guest and ordinary roles are denied.
REVOKE ALL ON SCHEMA qore_crt_alerts FROM PUBLIC;
REVOKE ALL ON TABLE qore_crt_alerts.replay_observations FROM PUBLIC;
COMMENT ON TABLE qore_crt_alerts.replay_observations IS
 'Replay evidence only. Not a notification queue. Do not grant FCM permissions.';

-- Safe staging write boundary: idempotent same payload, explicit conflict on
-- divergent OHLC/fingerprint. Privileges NOT granted to app/anon roles.
CREATE OR REPLACE FUNCTION qore_crt_alerts.stage_replay_observation(p JSONB)
RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER AS $body$
DECLARE prior_fingerprint TEXT;
DECLARE prior_payload JSONB;
DECLARE event_id TEXT;
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object' OR
     p->>'status' IS DISTINCT FROM 'QUARANTINED_REPLAY' OR
     p->>'deliveryState' IS DISTINCT FROM 'BLOCKED_NOT_CERTIFIED' OR
     (p->>'actionable')::BOOLEAN IS DISTINCT FROM FALSE OR
     (p->>'sendPush')::BOOLEAN IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'REPLAY_BLOCKED: invalid offline-only record'
      USING ERRCODE='23514';
  END IF;
  event_id:=p->>'eventKey';
  INSERT INTO qore_crt_alerts.replay_observations
    (event_key,fingerprint,source_id,provider,instrument_id,family,
     c1_start_ms,mss_m15_at_ms,ohlc_sha256,mss_m5_at_ms,payload)
  VALUES
    (event_id,p->>'fingerprint',p->>'sourceId',p->>'provider',
     p->>'instrumentId',p->>'family',(p->>'c1StartMs')::BIGINT,
     (p->>'mssM15AtMs')::BIGINT,p->>'ohlcSha256',
     (p->>'mssM5AtMs')::BIGINT,p)
  ON CONFLICT(event_key) DO NOTHING;
  IF FOUND THEN RETURN 'QUARANTINED_RECORDED'; END IF;
  SELECT fingerprint,payload INTO prior_fingerprint,prior_payload
    FROM qore_crt_alerts.replay_observations
   WHERE event_key=event_id;
  IF prior_fingerprint IS NULL THEN
    RAISE EXCEPTION 'REPLAY_CONFLICT: missing row after insert conflict'
      USING ERRCODE='23514';
  END IF;
  IF prior_fingerprint=(p->>'fingerprint') AND prior_payload=p THEN
    RETURN 'DUPLICATE_IGNORED';
  END IF;
  RAISE EXCEPTION 'REPLAY_OBSERVATION_CONFLICT: immutable event has changed'
    USING ERRCODE='23514';
END;
$body$;
REVOKE ALL ON FUNCTION qore_crt_alerts.stage_replay_observation(JSONB) FROM PUBLIC;

COMMIT;
