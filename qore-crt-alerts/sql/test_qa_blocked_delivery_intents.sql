-- PostgreSQL 16 ephemeral test: persistent identity dedup with NO dispatch path.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO qore_crt_alerts.replay_observations
 (event_key,fingerprint,source_id,provider,instrument_id,family,
  c1_start_ms,mss_m15_at_ms,ohlc_sha256,payload)
VALUES ('QA|EURUSD|1000|1|MSS_M15|900001',repeat('a',64),'qa-fixture',
 'QA_PROVIDER','EURUSD','forex',1000,900001,repeat('b',64),
 '{"status":"QUARANTINED_REPLAY","sendPush":false}'::jsonb);
INSERT INTO qore_crt_alerts.qa_device_registrations
 (handle,user_scope_hash,installation_hash,project_id,consented)
VALUES (repeat('c',64),repeat('d',64),repeat('e',64),
 'qore-ci-test-project',TRUE);
INSERT INTO qore_crt_alerts.qa_device_registrations
 (handle,user_scope_hash,installation_hash,project_id,consented,
  observed_at,expires_at)
VALUES (repeat('f',64),repeat('d',64),repeat('e',64),
 'qore-ci-test-project',TRUE,
 transaction_timestamp()-interval '2 days',
 transaction_timestamp()-interval '1 day');

DO $test$
DECLARE state TEXT;
BEGIN
  state:=qore_crt_alerts.qa_stage_blocked_delivery_intent(
    'QA|EURUSD|1000|1|MSS_M15|900001',repeat('c',64),repeat('a',64));
  IF state<>'QA_INTENT_RECORDED_NOT_SENDABLE' THEN
    RAISE EXCEPTION 'first intent was not recorded';
  END IF;
  state:=qore_crt_alerts.qa_stage_blocked_delivery_intent(
    'QA|EURUSD|1000|1|MSS_M15|900001',repeat('c',64),repeat('a',64));
  IF state<>'DUPLICATE_IGNORED' THEN
    RAISE EXCEPTION 'idempotency key failed';
  END IF;
  IF (SELECT count(*) FROM qore_crt_alerts.qa_blocked_delivery_intents)<>1 THEN
    RAISE EXCEPTION 'duplicate persisted a second intent';
  END IF;
  IF EXISTS (SELECT 1 FROM qore_crt_alerts.qa_blocked_delivery_intents
       WHERE delivery_state<>'BLOCKED_NOT_CERTIFIED') THEN
    RAISE EXCEPTION 'delivery escaped safety hold';
  END IF;
  -- Correct event ID with different evidence must never become an intent.
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_blocked_delivery_intent(
      'QA|EURUSD|1000|1|MSS_M15|900001',repeat('c',64),repeat('0',64));
    RAISE EXCEPTION 'wrong OHLC fingerprint was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  -- Unknown event and expired registration must be blocked.
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_blocked_delivery_intent(
      'NONEXISTENT',repeat('c',64),repeat('a',64));
    RAISE EXCEPTION 'unknown event was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_blocked_delivery_intent(
      'QA|EURUSD|1000|1|MSS_M15|900001',repeat('f',64),repeat('a',64));
    RAISE EXCEPTION 'expired registration was accepted';
  EXCEPTION WHEN check_violation THEN NULL; END;
  UPDATE qore_crt_alerts.qa_device_registrations
    SET active=FALSE WHERE handle=repeat('c',64);
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_blocked_delivery_intent(
      'QA|EURUSD|1000|1|MSS_M15|900001',repeat('c',64),repeat('a',64));
    RAISE EXCEPTION 'opt-out was ignored on duplicate request';
  EXCEPTION WHEN check_violation THEN NULL; END;
  IF (SELECT count(*) FROM qore_crt_alerts.qa_blocked_delivery_intents)<>1 THEN
    RAISE EXCEPTION 'revocation mutated audit history';
  END IF;
END $test$;

-- The server/device role MUST NOT be able to query or insert intent rows,
-- even if its ordinary CRUD table privileges are mistakenly granted.
CREATE ROLE qore_crt_intent_untrusted NOLOGIN NOBYPASSRLS;
GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_intent_untrusted;
GRANT SELECT, INSERT, UPDATE, DELETE
 ON qore_crt_alerts.qa_blocked_delivery_intents TO qore_crt_intent_untrusted;
SET ROLE qore_crt_intent_untrusted;
DO $test$
DECLARE n BIGINT;
BEGIN
  SELECT count(*) INTO n FROM qore_crt_alerts.qa_blocked_delivery_intents;
  IF n<>0 THEN RAISE EXCEPTION 'RLS exposed event-to-device association'; END IF;
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_blocked_delivery_intent(
      'QA|EURUSD|1000|1|MSS_M15|900001',repeat('c',64),repeat('a',64));
    RAISE EXCEPTION 'untrusted role called private function';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $test$;
RESET ROLE;
ROLLBACK;
