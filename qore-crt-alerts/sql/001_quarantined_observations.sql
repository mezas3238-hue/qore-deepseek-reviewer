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
COMMIT;
