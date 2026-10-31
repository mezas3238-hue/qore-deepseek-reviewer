\set ON_ERROR_STOP on
BEGIN;
CREATE ROLE qore_crt_qa_untrusted NOLOGIN;
GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_qa_untrusted;
GRANT SELECT, INSERT, UPDATE, DELETE ON qore_crt_alerts.qa_device_registrations
  TO qore_crt_qa_untrusted;
INSERT INTO qore_crt_alerts.qa_device_registrations
 (handle,user_scope_hash,installation_hash,project_id,consented)
 VALUES (repeat('a',64),repeat('b',64),repeat('c',64),
 'qore-qa-only-project',TRUE);
-- Repeated identical observation is idempotent, not a second device.
INSERT INTO qore_crt_alerts.qa_device_registrations
 (handle,user_scope_hash,installation_hash,project_id,consented)
 VALUES (repeat('a',64),repeat('b',64),repeat('c',64),
 'qore-qa-only-project',TRUE)
 ON CONFLICT(handle) DO NOTHING;
DO $qa$
BEGIN
 IF (SELECT count(*) FROM qore_crt_alerts.qa_device_registrations)<>1 THEN
  RAISE EXCEPTION 'repeated registration created duplicate device';
 END IF;
 IF EXISTS (SELECT 1 FROM qore_crt_alerts.qa_device_registrations
  WHERE delivery_state<>'BLOCKED_NOT_CERTIFIED') THEN
  RAISE EXCEPTION 'delivery state escaped blocked hold';
 END IF;
END $qa$;
-- Token/FID rotation changes an irreversible hash, never the user scope.
UPDATE qore_crt_alerts.qa_device_registrations
 SET installation_hash=repeat('d',64)
 WHERE handle=repeat('a',64);
DO $qa$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM qore_crt_alerts.qa_device_registrations
  WHERE handle=repeat('a',64) AND installation_hash=repeat('d',64)) THEN
  RAISE EXCEPTION 'rotation lost device';
 END IF;
END $qa$;
-- Server-side opt-out/revocation disables QA registration.
UPDATE qore_crt_alerts.qa_device_registrations SET active=FALSE
 WHERE handle=repeat('a',64);
DO $qa$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM qore_crt_alerts.qa_device_registrations
  WHERE active=FALSE AND delivery_state='BLOCKED_NOT_CERTIFIED') THEN
  RAISE EXCEPTION 'opt-out changed delivery state';
 END IF;
END $qa$;
-- Even after deliberately granting ordinary CRUD, RLS DENIES the rows.
SET ROLE qore_crt_qa_untrusted;
DO $qa$
DECLARE n BIGINT;
BEGIN
 SELECT count(*) INTO n FROM qore_crt_alerts.qa_device_registrations;
 IF n<>0 THEN RAISE EXCEPTION 'RLS disclosed device record'; END IF;
 BEGIN
  INSERT INTO qore_crt_alerts.qa_device_registrations
  (handle,user_scope_hash,installation_hash,project_id,consented)
  VALUES (repeat('e',64),repeat('b',64),repeat('f',64),
   'untrusted-project-id',TRUE);
  RAISE EXCEPTION 'RLS permitted untrusted enrollment';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $qa$;
RESET ROLE;
ROLLBACK;
