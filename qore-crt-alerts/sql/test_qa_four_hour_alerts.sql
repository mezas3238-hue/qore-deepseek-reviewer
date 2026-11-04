-- Disposable PostgreSQL CI only; assumes 006_qa_four_hour_alerts.sql.
-- SQL assertions roll back all synthetic QA data. NEVER contacts production.
BEGIN;
DO $test$
DECLARE
  event_time_ms BIGINT;
  test_key TEXT;
  p JSONB;
  r TEXT;
  count_rows INTEGER;
  expiry_seconds DOUBLE PRECISION;
BEGIN
  event_time_ms:=floor(extract(epoch from transaction_timestamp())*1000)::BIGINT - 60000;
  test_key:='IC|USDCAD|1793336400000|1|CRT_OBSERVED|'||event_time_ms;
  p:=jsonb_build_object(
   'schema','QORE_CRT_MONITOR_QA_V2','mode','OFFLINE_REPLAY',
   'certification','NOT_VERIFIED','transport','DISABLED',
   'deliveryState','BLOCKED_NOT_CERTIFIED','sendPush',false,
   'actionable',false,'requiresRealFeedAndPineParity',true,
   'tvSymbol','IC:USDCAD','instrumentId','USDCAD',
   'eventId',test_key,'family','CRT_2C_RETURN',
   'eventType','CRT_OBSERVED','eventAtMs',event_time_ms
  );
  r:=qore_crt_alerts.qa_stage_4h_alert(p);
  IF r<>'QA_STAGED_4H_NOT_SENDABLE' THEN
    RAISE EXCEPTION 'expected staged blocked 4h event, got %',r;
  END IF;
  SELECT extract(epoch FROM expires_at-confirmed_at)
    INTO expiry_seconds FROM qore_crt_alerts.qa_alerts_4h
   WHERE event_key=test_key AND family='CRT_2C_RETURN';
  IF expiry_seconds<>14400 THEN
    RAISE EXCEPTION 'TTL must be exactly 14400 seconds, got %',expiry_seconds;
  END IF;
  SELECT count(*) INTO count_rows FROM qore_crt_alerts.qa_alerts_4h
   WHERE expires_at>transaction_timestamp() AND invalidated_at IS NULL;
  IF count_rows<>1 THEN RAISE EXCEPTION 'active must be exactly one'; END IF;
  r:=qore_crt_alerts.qa_stage_4h_alert(p);
  IF r<>'QA_DUPLICATE_NOT_RENEWED' THEN
    RAISE EXCEPTION 'duplicate unexpectedly extended/changed TTL: %',r;
  END IF;
  SELECT extract(epoch FROM expires_at-confirmed_at)
    INTO expiry_seconds FROM qore_crt_alerts.qa_alerts_4h
   WHERE family='CRT_2C_RETURN';
  IF expiry_seconds<>14400 THEN RAISE EXCEPTION 'duplicate changed TTL'; END IF;

  BEGIN
    PERFORM qore_crt_alerts.qa_stage_4h_alert(p||'{"sendPush":true}'::jsonb);
    RAISE EXCEPTION 'ERROR: LIVE claim was accepted';
  EXCEPTION WHEN SQLSTATE '23514' THEN NULL;
  END;
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_4h_alert(p||'{"tvSymbol":"OANDA:USDCAD"}'::jsonb);
    RAISE EXCEPTION 'ERROR: non-IC feed was accepted';
  EXCEPTION WHEN SQLSTATE '23514' THEN NULL;
  END;
  BEGIN
    PERFORM qore_crt_alerts.qa_stage_4h_alert(p||'{"mssM5":"FABRICATED"}'::jsonb);
    RAISE EXCEPTION 'ERROR: conflicting evidence was accepted';
  EXCEPTION WHEN SQLSTATE '23514' THEN NULL;
  END;

  r:=qore_crt_alerts.qa_invalidate_4h_alert(
    test_key,'CRT_2C_RETURN','STRUCTURE_INVALIDATED');
  IF r<>'QA_INVALIDATED_EARLY' THEN
    RAISE EXCEPTION 'early invalidation must succeed: %',r;
  END IF;
  SELECT count(*) INTO count_rows FROM qore_crt_alerts.qa_alerts_4h
   WHERE expires_at>transaction_timestamp() AND invalidated_at IS NULL;
  IF count_rows<>0 THEN RAISE EXCEPTION 'invalid event remained active'; END IF;
  r:=qore_crt_alerts.qa_invalidate_4h_alert(
    test_key,'CRT_2C_RETURN','STRUCTURE_INVALIDATED');
  IF r<>'QA_ALREADY_INVALIDATED' THEN
    RAISE EXCEPTION 'must keep invalidated tombstone until expiry: %',r;
  END IF;
  -- NO resurrection: same evidence duplicate while invalidated.
  r:=qore_crt_alerts.qa_stage_4h_alert(p);
  IF r<>'QA_DUPLICATE_NOT_RENEWED' THEN
    RAISE EXCEPTION 'invalidated event resurrected: %',r;
  END IF;

  -- Expired event is not inserted and cannot be queried as active.
  r:=qore_crt_alerts.qa_stage_4h_alert(
    p || jsonb_build_object('eventId',test_key||'|OLD',
         'eventAtMs', event_time_ms-18000000));
  IF r<>'QA_EXPIRED_OR_FUTURE_NOT_RECORDED' THEN
    RAISE EXCEPTION 'past expiry must be rejected: %',r;
  END IF;
  r:=qore_crt_alerts.qa_stage_4h_alert(
    p || jsonb_build_object('eventId',test_key||'|FUTURE',
         'eventAtMs', event_time_ms+7200000));
  IF r<>'QA_EXPIRED_OR_FUTURE_NOT_RECORDED' THEN
    RAISE EXCEPTION 'future close must be rejected: %',r;
  END IF;

  -- CI-only accelerated clock simulation: age the QA row and purge it.
  UPDATE qore_crt_alerts.qa_alerts_4h
     SET confirmed_at=transaction_timestamp()-INTERVAL '5 hours',
         expires_at=transaction_timestamp()-INTERVAL '1 hour'
   WHERE event_key=test_key AND family='CRT_2C_RETURN';
  IF qore_crt_alerts.qa_purge_4h_alerts()<>1 THEN
    RAISE EXCEPTION 'expired event was not physically purged';
  END IF;
  SELECT count(*) INTO count_rows FROM qore_crt_alerts.qa_alerts_4h;
  IF count_rows<>0 THEN RAISE EXCEPTION 'expired event retained'; END IF;

  RAISE NOTICE 'QA FOUR-HOUR TTL / invalidation / dedup / purging PASS';
END;
$test$;
-- No RLS or broad grants to an anonymous role, even when one is created.
CREATE ROLE qore_qa_untrusted NOLOGIN;
DO $test$
BEGIN
 IF has_schema_privilege('qore_qa_untrusted','qore_crt_alerts','USAGE') OR
    has_table_privilege('qore_qa_untrusted','qore_crt_alerts.qa_alerts_4h','SELECT') OR
    has_table_privilege('qore_qa_untrusted','qore_crt_alerts.qa_alerts_4h','INSERT') OR
    has_function_privilege('qore_qa_untrusted','qore_crt_alerts.qa_stage_4h_alert(jsonb)','EXECUTE')
 THEN RAISE EXCEPTION 'untrusted role obtained private alert privilege'; END IF;
END;
$test$;
ROLLBACK;
