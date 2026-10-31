\set ON_ERROR_STOP on
BEGIN;
DO $qa$
DECLARE x JSONB; rev BIGINT; cnt BIGINT;
BEGIN
 x:=qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('c',64),'qore-qa-stage-project',0,TRUE);
 IF x->>'state'<>'QA_DEVICE_REGISTERED' OR (x->>'revision')::BIGINT<>1 THEN
  RAISE EXCEPTION 'device creation not revision one'; END IF;
 x:=qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('c',64),'qore-qa-stage-project',0,TRUE);
 IF x->>'state'<>'QA_DEVICE_DUPLICATE' THEN
  RAISE EXCEPTION 'repeated enrollment not idempotent'; END IF;
 SELECT count(*) INTO cnt FROM qore_crt_alerts.qa_device_registrations;
 IF cnt<>1 THEN RAISE EXCEPTION 'device duplication'; END IF;
 BEGIN
  PERFORM qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('d',64),
  repeat('c',64),'qore-qa-stage-project',0,TRUE);
  RAISE EXCEPTION 'wrong owner was permitted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  PERFORM qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('d',64),'qore-qa-stage-project',0,FALSE);
  RAISE EXCEPTION 'missing consent was permitted';
 EXCEPTION WHEN check_violation THEN NULL; END;
 x:=qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('d',64),'qore-qa-stage-project',1,TRUE);
 IF (x->>'revision')::BIGINT<>2 THEN RAISE EXCEPTION 'rotation not CAS'; END IF;
 BEGIN
  PERFORM qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('c',64),'qore-qa-stage-project',1,TRUE);
  RAISE EXCEPTION 'stale rotation overwrote new device';
 EXCEPTION WHEN check_violation THEN NULL; END;
 x:=qore_crt_alerts.qa_revoke_device(repeat('a',64),repeat('b',64),2);
 IF x->>'state'<>'QA_DEVICE_REVOKED' OR (x->>'revision')::BIGINT<>3 THEN
  RAISE EXCEPTION 'revocation did not advance revision'; END IF;
 BEGIN
  PERFORM qore_crt_alerts.qa_stage_device(repeat('a',64),repeat('b',64),
  repeat('d',64),'qore-qa-stage-project',3,TRUE);
  RAISE EXCEPTION 'revoked device was reactivated';
 EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  PERFORM qore_crt_alerts.qa_revoke_device(repeat('a',64),repeat('b',64),2);
  RAISE EXCEPTION 'revoked device was revoked twice';
 EXCEPTION WHEN check_violation THEN NULL; END;
 IF EXISTS (SELECT 1 FROM qore_crt_alerts.qa_device_registrations
  WHERE delivery_state<>'BLOCKED_NOT_CERTIFIED'
     OR active=TRUE) THEN
   RAISE EXCEPTION 'delivery block or revocation violated';
 END IF;
END $qa$;
-- Ordinary app-like role is denied, even after SELECT/INSERT grants.
CREATE ROLE qore_crt_restricted_app NOLOGIN;
GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_restricted_app;
GRANT SELECT,INSERT,UPDATE ON qore_crt_alerts.qa_device_registrations
 TO qore_crt_restricted_app;
SET ROLE qore_crt_restricted_app;
DO $qa$
BEGIN
 BEGIN
  PERFORM qore_crt_alerts.qa_stage_device(repeat('e',64),repeat('f',64),
   repeat('a',64),'qore-qa-stage-project',0,TRUE);
  RAISE EXCEPTION 'untrusted role executed privileged function';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $qa$;
RESET ROLE;
ROLLBACK;
