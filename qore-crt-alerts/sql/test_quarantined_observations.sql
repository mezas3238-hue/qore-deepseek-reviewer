-- Executed against ephemeral GitHub Actions PostgreSQL; no real cloud DB.
\set ON_ERROR_STOP on
BEGIN;
CREATE ROLE qore_crt_untrusted NOLOGIN;
-- No policy exists; even granting schema/table access does not bypass RLS.
GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_untrusted;
GRANT SELECT, INSERT, UPDATE, DELETE ON qore_crt_alerts.replay_observations
 TO qore_crt_untrusted;
SET ROLE qore_crt_untrusted;
SELECT count(*) FROM qore_crt_alerts.replay_observations;
RESET ROLE;
INSERT INTO qore_crt_alerts.replay_observations
(event_key,fingerprint,source_id,provider,instrument_id,family,
 c1_start_ms,mss_m15_at_ms,ohlc_sha256,mss_m5_at_ms,payload)
VALUES ('TEST|EURUSD|1000|1|MSS_M15|900000','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
 'fixture','TEST_FIXTURE','EURUSD','forex',1000,900000,
 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
 NULL,'{"test":true}'::jsonb)
ON CONFLICT(event_key) DO NOTHING;
INSERT INTO qore_crt_alerts.replay_observations
(event_key,fingerprint,source_id,provider,instrument_id,family,
 c1_start_ms,mss_m15_at_ms,ohlc_sha256,mss_m5_at_ms,payload)
VALUES ('TEST|EURUSD|1000|1|MSS_M15|900000','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
 'fixture','TEST_FIXTURE','EURUSD','forex',1000,900000,
 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
 NULL,'{"test":true}'::jsonb)
ON CONFLICT(event_key) DO NOTHING;
DO $$
BEGIN
  IF (SELECT count(*) FROM qore_crt_alerts.replay_observations)<>1 THEN
    RAISE EXCEPTION 'duplicate event was not deduplicated';
  END IF;
  IF EXISTS(SELECT 1 FROM qore_crt_alerts.replay_observations
       WHERE status <> 'QUARANTINED_REPLAY'
          OR delivery_state <> 'BLOCKED_NOT_CERTIFIED') THEN
    RAISE EXCEPTION 'delivery blocked state violated';
  END IF;
END $$;
-- Test a forbidden status change without aborting the smoke transaction.
DO $$
BEGIN
  BEGIN
    UPDATE qore_crt_alerts.replay_observations SET status='READY_TO_SEND';
    RAISE EXCEPTION 'should never update status';
  EXCEPTION WHEN check_violation THEN
    NULL;
  END;
END $$;

-- Check staged function idempotency and divergent evidence handling, not just
-- the table's primary-key uniqueness. A conflict must never disappear silently.
DO $body$
DECLARE p JSONB;
DECLARE changed JSONB;
DECLARE outcome TEXT;
BEGIN
  p:=jsonb_build_object(
    'eventKey','FIXTURE|EURUSD|1000|1|MSS_M15|900001',
    'fingerprint',repeat('c',64),'sourceId','fixture',
    'provider','TEST_FIXTURE','instrumentId','EURUSD','family','forex',
    'c1StartMs',1000,'mssM15AtMs',900001,'ohlcSha256',repeat('d',64),
    'mssM5AtMs',NULL,'status','QUARANTINED_REPLAY',
    'deliveryState','BLOCKED_NOT_CERTIFIED','actionable',FALSE,'sendPush',FALSE);
  outcome:=qore_crt_alerts.stage_replay_observation(p);
  IF outcome<>'QUARANTINED_RECORDED' THEN
    RAISE EXCEPTION 'staging did not record a new replay observation';
  END IF;
  outcome:=qore_crt_alerts.stage_replay_observation(p);
  IF outcome<>'DUPLICATE_IGNORED' THEN
    RAISE EXCEPTION 'staging did not deduplicate exact same record';
  END IF;
  changed:=jsonb_set(p,'{ohlcSha256}',to_jsonb(repeat('e',64)));
  BEGIN
    PERFORM qore_crt_alerts.stage_replay_observation(changed);
    RAISE EXCEPTION 'divergent OHLC was silently discarded';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  changed:=jsonb_set(p,'{sendPush}','true'::jsonb);
  BEGIN
    PERFORM qore_crt_alerts.stage_replay_observation(changed);
    RAISE EXCEPTION 'push authorization was accepted in replay table';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END $body$;

-- Explicit RLS denies all table rows and INSERT even when privileges granted.
SET ROLE qore_crt_untrusted;
-- Even an ordinary role with table privileges cannot call the private write
-- function. This is an explicit deny-by-default security property.
DO $blocked$
BEGIN
  BEGIN
    PERFORM qore_crt_alerts.stage_replay_observation('{}'::jsonb);
    RAISE EXCEPTION 'untrusted function invocation succeeded';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $blocked$;
DO $
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM qore_crt_alerts.replay_observations;
  IF n <> 0 THEN RAISE EXCEPTION 'RLS exposed quarantined row'; END IF;
  BEGIN
    INSERT INTO qore_crt_alerts.replay_observations
      (event_key,fingerprint,source_id,provider,instrument_id,family,
       c1_start_ms,mss_m15_at_ms,ohlc_sha256,payload)
    VALUES ('UNTRUSTED','aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      'bad','OTHER','EURUSD','forex',1000,900000,
      'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','{}');
    RAISE EXCEPTION 'RLS accepted unauthorized insert';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END $$;
RESET ROLE;
ROLLBACK;
