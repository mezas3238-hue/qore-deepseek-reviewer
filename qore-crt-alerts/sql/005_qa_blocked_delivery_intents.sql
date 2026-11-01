-- 005: persistent QA delivery intentions ONLY, not a sendable outbox.
-- PostgreSQL 16 ephemeral CI / unapplied STAGING proposal. NO LIVE, NO FCM.
-- Separate release-gated outbox would require a NEW schema and authorization;
-- do not change these GENERATED blocking states to enable delivery.
BEGIN;
CREATE TABLE qore_crt_alerts.qa_blocked_delivery_intents (
  event_key TEXT NOT NULL REFERENCES qore_crt_alerts.replay_observations(event_key),
  device_handle TEXT NOT NULL REFERENCES qore_crt_alerts.qa_device_registrations(handle),
  observation_fingerprint TEXT NOT NULL
    CHECK (observation_fingerprint ~ '^[a-f0-9]{64}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  delivery_state TEXT GENERATED ALWAYS AS ('BLOCKED_NOT_CERTIFIED'::TEXT) STORED,
  PRIMARY KEY (event_key,device_handle)
);
ALTER TABLE qore_crt_alerts.qa_blocked_delivery_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE qore_crt_alerts.qa_blocked_delivery_intents FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE qore_crt_alerts.qa_blocked_delivery_intents FROM PUBLIC;
COMMENT ON TABLE qore_crt_alerts.qa_blocked_delivery_intents IS
 'Persistent QA-only event/device dedup ledger, permanently unable to send FCM. Not a live outbox.';

-- No grants to anon, authenticated, device HTTP role or the Android client.
-- This SECURITY INVOKER function is callable only by explicitly privileged
-- infrastructure code, after Auth/App Check, preferences and operator controls.
CREATE FUNCTION qore_crt_alerts.qa_stage_blocked_delivery_intent(
  p_event_key TEXT,p_device_handle TEXT,p_observation_fingerprint TEXT
) RETURNS TEXT LANGUAGE plpgsql SECURITY INVOKER AS $body$
DECLARE did_insert BOOLEAN;
BEGIN
  IF p_event_key IS NULL OR length(p_event_key) NOT BETWEEN 1 AND 512
     OR p_device_handle IS NULL
     OR p_device_handle !~ '^[a-f0-9]{64}$'
     OR p_observation_fingerprint IS NULL
     OR p_observation_fingerprint !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'QA_INTENT_BLOCKED: invalid event/device identity'
      USING ERRCODE='23514';
  END IF;
  -- Only an existing quarantined event with the caller's exact fingerprint.
  IF NOT EXISTS (
    SELECT 1 FROM qore_crt_alerts.replay_observations o
    WHERE o.event_key=p_event_key
      AND o.fingerprint=p_observation_fingerprint
      AND o.status='QUARANTINED_REPLAY'
      AND o.delivery_state='BLOCKED_NOT_CERTIFIED'
  ) THEN
    RAISE EXCEPTION 'QA_INTENT_BLOCKED: unverified replay evidence'
      USING ERRCODE='23514';
  END IF;
  -- Revocation and expiry checked also on duplicate attempts; fail closed.
  IF NOT EXISTS (
    SELECT 1 FROM qore_crt_alerts.qa_device_registrations d
    WHERE d.handle=p_device_handle AND d.active IS TRUE
      AND d.consented IS TRUE AND d.expires_at>transaction_timestamp()
      AND d.delivery_state='BLOCKED_NOT_CERTIFIED'
  ) THEN
    RAISE EXCEPTION 'QA_INTENT_BLOCKED: inactive or missing registration'
      USING ERRCODE='23514';
  END IF;
  INSERT INTO qore_crt_alerts.qa_blocked_delivery_intents
    (event_key,device_handle,observation_fingerprint)
  VALUES (p_event_key,p_device_handle,p_observation_fingerprint)
  ON CONFLICT (event_key,device_handle) DO NOTHING;
  did_insert:=FOUND;
  IF did_insert THEN RETURN 'QA_INTENT_RECORDED_NOT_SENDABLE'; END IF;
  IF EXISTS(
    SELECT 1 FROM qore_crt_alerts.qa_blocked_delivery_intents
    WHERE event_key=p_event_key AND device_handle=p_device_handle
      AND observation_fingerprint=p_observation_fingerprint
      AND delivery_state='BLOCKED_NOT_CERTIFIED'
  ) THEN RETURN 'DUPLICATE_IGNORED'; END IF;
  RAISE EXCEPTION 'QA_INTENT_CONFLICT: immutable event/device evidence differs'
    USING ERRCODE='23514';
END;
$body$;
REVOKE ALL ON FUNCTION qore_crt_alerts.qa_stage_blocked_delivery_intent(TEXT,TEXT,TEXT)
  FROM PUBLIC;
COMMIT;
