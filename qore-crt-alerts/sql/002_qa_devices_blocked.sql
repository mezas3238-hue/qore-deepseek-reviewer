-- Proposed QA table ONLY. No Supabase/Railway deployment; DO NOT grant API access.
-- The platform must verify BOTH user identity and Firebase App Check BEFORE
-- any approved server code writes to this table. This SQL is not that API.
BEGIN;
CREATE TABLE IF NOT EXISTS qore_crt_alerts.qa_device_registrations (
  handle TEXT PRIMARY KEY CHECK (handle ~ '^[a-f0-9]{64}$'),
  user_scope_hash TEXT NOT NULL CHECK (user_scope_hash ~ '^[a-f0-9]{64}$'),
  installation_hash TEXT NOT NULL CHECK (installation_hash ~ '^[a-f0-9]{64}$'),
  project_id TEXT NOT NULL CHECK (length(project_id) BETWEEN 12 AND 256),
  observed_at TIMESTAMPTZ NOT NULL DEFAULT transaction_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL
    DEFAULT (transaction_timestamp() + INTERVAL '30 days'),
  consented BOOLEAN NOT NULL DEFAULT FALSE CHECK (consented=TRUE),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  delivery_state TEXT GENERATED ALWAYS AS ('BLOCKED_NOT_CERTIFIED'::TEXT) STORED,
  CHECK(expires_at>observed_at)
);
ALTER TABLE qore_crt_alerts.qa_device_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qore_crt_alerts.qa_device_registrations FORCE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE qore_crt_alerts.qa_device_registrations FROM PUBLIC;
COMMENT ON TABLE qore_crt_alerts.qa_device_registrations IS
 'Only pseudonymous QA registration evidence; never raw FID, credentials, or FCM dispatch.';
COMMIT;
