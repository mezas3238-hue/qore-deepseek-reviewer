\set ON_ERROR_STOP on
BEGIN;
CREATE ROLE qore_crt_ci_untrusted NOLOGIN;
GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_ci_untrusted;
GRANT SELECT,INSERT,UPDATE ON qore_crt_alerts.qa_device_registrations
 TO qore_crt_ci_untrusted;
SET ROLE qore_crt_ci_untrusted;
DO $q$
DECLARE n BIGINT;
BEGIN
 SELECT count(*) INTO n FROM qore_crt_alerts.qa_device_registrations;
 IF n<>0 THEN RAISE EXCEPTION 'untrusted role bypassed RLS'; END IF;
 BEGIN
  INSERT INTO qore_crt_alerts.qa_device_registrations (
   handle,user_scope_hash,installation_hash,project_id,consented
  ) VALUES(repeat('a',64),repeat('b',64),repeat('c',64),
    'qore-test-project-ci',TRUE);
  RAISE EXCEPTION 'untrusted role inserted registration';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $q$;
RESET ROLE;

-- The trusted server role uses table permissions + explicit RLS policy,
-- but cannot access quarantine observations or a LIVE delivery queue.
SET ROLE qore_crt_http_qa;
DO $q$
DECLARE r JSONB;
BEGIN
 r:=qore_crt_alerts.qa_stage_device(
   repeat('a',64),repeat('b',64),repeat('c',64),
   'qore-ci-firebase-project',0,TRUE);
 IF r->>'state'<>'QA_DEVICE_REGISTERED' THEN
   RAISE EXCEPTION 'server role could not create QA registration';
 END IF;
 IF EXISTS (SELECT 1 FROM qore_crt_alerts.qa_device_registrations
  WHERE delivery_state<>'BLOCKED_NOT_CERTIFIED') THEN
   RAISE EXCEPTION 'QA delivery state changed'; END IF;
 BEGIN
  PERFORM count(*) FROM qore_crt_alerts.replay_observations;
  RAISE EXCEPTION 'QA HTTP role could inspect trading observations';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $q$;
RESET ROLE;
ROLLBACK;
