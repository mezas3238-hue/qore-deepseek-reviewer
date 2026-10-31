-- OFFLINE PostgreSQL 16 QA ONLY: no production/Supabase deployment.
-- Backend database role is NOLOGIN. A separate CI-only LOGIN is granted
-- this role in GitHub Actions. Granting to client/anon/authenticated is banned.
-- This creates a trusted-server role boundary, NOT end-user row security:
-- caller must verify Auth and App Check upstream, once per HTTP request.
BEGIN;
DO $q$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='qore_crt_http_qa') THEN
   CREATE ROLE qore_crt_http_qa NOLOGIN NOBYPASSRLS;
 END IF;
END $q$;

GRANT USAGE ON SCHEMA qore_crt_alerts TO qore_crt_http_qa;
GRANT SELECT,INSERT,UPDATE ON qore_crt_alerts.qa_device_registrations
  TO qore_crt_http_qa;
GRANT EXECUTE ON FUNCTION qore_crt_alerts.qa_stage_device(
 TEXT,TEXT,TEXT,TEXT,BIGINT,BOOLEAN) TO qore_crt_http_qa;
GRANT EXECUTE ON FUNCTION qore_crt_alerts.qa_revoke_device(
 TEXT,TEXT,BIGINT) TO qore_crt_http_qa;

-- Only the dedicated server role can see or modify rows; no policies
-- exist for PUBLIC, anonymous, authenticated, or ordinary application roles.
DO $q$
BEGIN
 IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='qore_crt_alerts'
      AND tablename='qa_device_registrations'
      AND policyname='qa_server_only_devices') THEN
    CREATE POLICY qa_server_only_devices
      ON qore_crt_alerts.qa_device_registrations
      FOR ALL TO qore_crt_http_qa USING (TRUE) WITH CHECK (TRUE);
 END IF;
END $q$;
REVOKE ALL ON TABLE qore_crt_alerts.replay_observations FROM qore_crt_http_qa;
REVOKE ALL ON FUNCTION qore_crt_alerts.stage_replay_observation(JSONB)
  FROM qore_crt_http_qa;

-- Never unfreeze permanent blocked delivery-state GENERATED column.
COMMIT;
